const { UserDrama, Drama, Channel, Genre } = require('../models');
const { sequelize, Sequelize } = require('../models');
const { Op } = Sequelize;

// @desc    Get user's drama list
// @route   GET /api/user/dramas
// @access  Private
exports.getUserDramas = async (req, res, next) => {
    try {
        const { status } = req.query;

        const where = { user_id: req.user.id };
        if (status) where.status = status;

        const userDramas = await UserDrama.findAll({
            where,
            include: [
                {
                    model: Drama,
                    as: 'drama',
                    include: [
                        {
                            model: Channel,
                            as: 'channel',
                            attributes: ['id', 'name']
                        },
                        {
                            model: Genre,
                            as: 'genres',
                            attributes: ['id', 'name'],
                            through: { attributes: [] }
                        }
                    ]
                }
            ],
            order: [['updated_at', 'DESC']]
        });

        res.json({
            success: true,
            data: { userDramas }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user statistics
// @route   GET /api/user/stats
// @access  Private
exports.getUserStats = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get counts by status
        const statusCounts = await UserDrama.findAll({
            where: { user_id: userId },
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('status')), 'count']
            ],
            group: ['status'],
            raw: true
        });

        // Get mean score
        const meanScore = await UserDrama.findOne({
            where: {
                user_id: userId,
                user_rating: { [Op.ne]: null }
            },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('user_rating')), 'mean_score']
            ],
            raw: true
        });

        // Get total episodes watched
        const completedDramas = await UserDrama.findAll({
            where: {
                user_id: userId,
                status: 'completed'
            },
            include: [{
                model: Drama,
                as: 'drama',
                attributes: ['episodes']
            }]
        });

        const totalEpisodes = completedDramas.reduce((sum, ud) => {
            return sum + (ud.drama?.episodes || 0);
        }, 0);

        // Calculate days watched (assuming 45 min per episode)
        const daysWatched = ((totalEpisodes * 45) / 60 / 24).toFixed(1);

        // Format status counts
        const stats = {
            total: 0,
            watching: 0,
            completed: 0,
            plan_to_watch: 0,
            on_hold: 0,
            dropped: 0,
            mean_score: parseFloat(meanScore?.mean_score || 0).toFixed(1),
            total_episodes: totalEpisodes,
            days_watched: parseFloat(daysWatched)
        };

        statusCounts.forEach(sc => {
            stats[sc.status] = parseInt(sc.count);
            stats.total += parseInt(sc.count);
        });

        res.json({
            success: true,
            data: { stats }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add drama to user's list
// @route   POST /api/user/dramas
// @access  Private
exports.addDrama = async (req, res, next) => {
    try {
        const { drama_id, status, user_rating, episodes_watched, review } = req.body;

        // Check if drama exists
        const drama = await Drama.findByPk(drama_id);
        if (!drama) {
            return res.status(404).json({
                success: false,
                message: 'Drama not found'
            });
        }

        // Check if already in list
        const existing = await UserDrama.findOne({
            where: {
                user_id: req.user.id,
                drama_id
            }
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Drama already in your list'
            });
        }

        // Create entry
        const userDrama = await UserDrama.create({
            user_id: req.user.id,
            drama_id,
            status: status || 'plan_to_watch',
            user_rating: user_rating || null,
            episodes_watched: episodes_watched || 0,
            review: review || null,
            date_started: status === 'watching' ? new Date() : null,
            date_completed: status === 'completed' ? new Date() : null
        });

        // Fetch with associations
        const result = await UserDrama.findByPk(userDrama.id, {
            include: [{
                model: Drama,
                as: 'drama',
                include: [
                    { model: Channel, as: 'channel', attributes: ['id', 'name'] }
                ]
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Drama added to your list',
            data: { userDrama: result }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update drama in user's list
// @route   PUT /api/user/dramas/:dramaId
// @access  Private
exports.updateDrama = async (req, res, next) => {
    try {
        const { dramaId } = req.params;
        const { status, user_rating, episodes_watched, review, is_favorite } = req.body;

        const userDrama = await UserDrama.findOne({
            where: {
                user_id: req.user.id,
                drama_id: dramaId
            }
        });

        if (!userDrama) {
            return res.status(404).json({
                success: false,
                message: 'Drama not in your list'
            });
        }

        // Update fields
        if (status) {
            userDrama.status = status;
            if (status === 'completed' && !userDrama.date_completed) {
                userDrama.date_completed = new Date();
            }
            if (status === 'watching' && !userDrama.date_started) {
                userDrama.date_started = new Date();
            }
        }
        if (user_rating !== undefined) userDrama.user_rating = user_rating;
        if (episodes_watched !== undefined) userDrama.episodes_watched = episodes_watched;
        if (review !== undefined) userDrama.review = review;
        if (is_favorite !== undefined) userDrama.is_favorite = is_favorite;

        await userDrama.save();

        // Fetch with associations
        const result = await UserDrama.findByPk(userDrama.id, {
            include: [{
                model: Drama,
                as: 'drama',
                include: [
                    { model: Channel, as: 'channel', attributes: ['id', 'name'] }
                ]
            }]
        });

        res.json({
            success: true,
            message: 'Drama updated successfully',
            data: { userDrama: result }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove drama from user's list
// @route   DELETE /api/user/dramas/:dramaId
// @access  Private
exports.removeDrama = async (req, res, next) => {
    try {
        const { dramaId } = req.params;

        const userDrama = await UserDrama.findOne({
            where: {
                user_id: req.user.id,
                drama_id: dramaId
            }
        });

        if (!userDrama) {
            return res.status(404).json({
                success: false,
                message: 'Drama not in your list'
            });
        }

        await userDrama.destroy();

        res.json({
            success: true,
            message: 'Drama removed from your list'
        });
    } catch (error) {
        next(error);
    }
};
