const crypto = require('crypto');
const { User, UserDrama, Drama, Channel, Genre } = require('../models');
const { sequelize, Sequelize } = require('../models');
const { Op } = Sequelize;

// Generate a unique share token
const generateShareToken = () => {
    return crypto.randomBytes(16).toString('hex');
};

// @desc    Get share settings for current user
// @route   GET /api/my-list/settings
// @access  Private
exports.getShareSettings = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'username', 'share_token', 'share_enabled']
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate share URL if token exists
        const shareUrl = user.share_token
            ? `${process.env.FRONTEND_URL || 'http://localhost:5173'}/list/${user.share_token}`
            : null;

        res.json({
            success: true,
            data: {
                share_token: user.share_token,
                share_enabled: user.share_enabled,
                share_url: shareUrl
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Generate or regenerate share token
// @route   POST /api/my-list/generate
// @access  Private
exports.generateShareLink = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate new unique token
        let newToken;
        let isUnique = false;

        while (!isUnique) {
            newToken = generateShareToken();
            const existing = await User.findOne({ where: { share_token: newToken } });
            if (!existing) {
                isUnique = true;
            }
        }

        // Update user with new token and enable sharing
        user.share_token = newToken;
        user.share_enabled = true;
        await user.save();

        const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/list/${newToken}`;

        res.json({
            success: true,
            message: 'Share link generated successfully',
            data: {
                share_token: newToken,
                share_enabled: true,
                share_url: shareUrl
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle sharing on/off
// @route   PUT /api/my-list/toggle
// @access  Private
exports.toggleSharing = async (req, res, next) => {
    try {
        const { enabled } = req.body;

        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // If enabling but no token exists, generate one
        if (enabled && !user.share_token) {
            let newToken;
            let isUnique = false;

            while (!isUnique) {
                newToken = generateShareToken();
                const existing = await User.findOne({ where: { share_token: newToken } });
                if (!existing) {
                    isUnique = true;
                }
            }
            user.share_token = newToken;
        }

        user.share_enabled = enabled;
        await user.save();

        const shareUrl = user.share_token
            ? `${process.env.FRONTEND_URL || 'http://localhost:5173'}/list/${user.share_token}`
            : null;

        res.json({
            success: true,
            message: enabled ? 'Sharing enabled' : 'Sharing disabled',
            data: {
                share_token: user.share_token,
                share_enabled: user.share_enabled,
                share_url: shareUrl
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get public drama list by share token
// @route   GET /api/my-list/public/:token
// @access  Public (no auth required)
exports.getPublicList = async (req, res, next) => {
    try {
        const { token } = req.params;

        // Find user by share token
        const user = await User.findOne({
            where: {
                share_token: token,
                share_enabled: true
            },
            attributes: ['id', 'username', 'avatar', 'bio', 'createdAt']
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'List not found or sharing is disabled'
            });
        }

        // Get user's drama list
        const dramaList = await UserDrama.findAll({
            where: { user_id: user.id },
            include: [
                {
                    model: Drama,
                    as: 'drama',
                    include: [
                        { model: Channel, as: 'channel', attributes: ['id', 'name'] },
                        { model: Genre, as: 'genres', attributes: ['id', 'name'], through: { attributes: [] } }
                    ]
                }
            ],
            order: [['updatedAt', 'DESC']]
        });

        // Calculate stats
        const stats = {
            total: dramaList.length,
            watching: 0,
            completed: 0,
            plan_to_watch: 0,
            on_hold: 0,
            dropped: 0,
            mean_score: 0,
            total_episodes: 0,
            favorites: 0
        };

        let ratingSum = 0;
        let ratingCount = 0;

        dramaList.forEach(ud => {
            stats[ud.status] = (stats[ud.status] || 0) + 1;

            if (ud.user_rating) {
                ratingSum += ud.user_rating;
                ratingCount++;
            }

            if (ud.status === 'completed' && ud.drama?.episodes) {
                stats.total_episodes += ud.drama.episodes;
            }

            if (ud.is_favorite) {
                stats.favorites++;
            }
        });

        stats.mean_score = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : 0;
        stats.days_watched = ((stats.total_episodes * 45) / 60 / 24).toFixed(1);

        // Organize by status
        const organizedList = {
            watching: [],
            completed: [],
            plan_to_watch: [],
            on_hold: [],
            dropped: []
        };

        dramaList.forEach(ud => {
            const dramaData = {
                id: ud.drama?.id,
                title: ud.drama?.title,
                poster: ud.drama?.poster,
                year: ud.drama?.year,
                rating: ud.drama?.rating,
                user_rating: ud.user_rating,
                episodes_watched: ud.episodes_watched,
                total_episodes: ud.drama?.episodes,
                is_favorite: ud.is_favorite,
                channel: ud.drama?.channel?.name,
                genres: ud.drama?.genres?.map(g => g.name) || []
            };

            if (organizedList[ud.status]) {
                organizedList[ud.status].push(dramaData);
            }
        });

        res.json({
            success: true,
            data: {
                user: {
                    username: user.username,
                    avatar: user.avatar,
                    bio: user.bio,
                    member_since: user.createdAt
                },
                stats,
                list: organizedList
            }
        });
    } catch (error) {
        next(error);
    }
};
