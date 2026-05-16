const {
    User, Drama, UserReview, Channel, Genre, CastMember,
    UserDrama, UserVote, DramaComment, UserListDrama,
    ReviewLike, ReviewComment, sequelize
} = require('../models');
const { Op } = require('sequelize');
const { runYouTubeAgent } = require('../services/youtubeAgent');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res, next) => {
    try {
        const totalUsers = await User.count();
        const totalDramas = await Drama.count();
        const totalReviews = await UserReview.count();

        // Get recent signups
        const recentUsers = await User.findAll({
            limit: 5,
            order: [['created_at', 'DESC']],
            attributes: ['id', 'username', 'email', 'created_at']
        });

        res.json({
            success: true,
            data: {
                totalUsers,
                totalDramas,
                totalReviews,
                recentUsers
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search = '' } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (search) {
            where[Op.or] = [
                sequelize.where(
                    sequelize.fn('LOWER', sequelize.col('User.username')),
                    'LIKE',
                    `%${search.toLowerCase()}%`
                ),
                sequelize.where(
                    sequelize.fn('LOWER', sequelize.col('User.email')),
                    'LIKE',
                    `%${search.toLowerCase()}%`
                )
            ];
        }

        const { count, rows: users } = await User.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']],
            attributes: { exclude: ['password'] }
        });

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    pages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.role = req.body.role || 'user';
        await user.save();

        res.json({
            success: true,
            message: 'User role updated successfully',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.id === req.user.id) {
            return res.status(400).json({ success: false, message: 'You cannot delete your own admin account' });
        }

        await user.destroy();
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new drama
// @route   POST /api/admin/dramas
// @access  Private/Admin
exports.createDrama = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const {
            title, year, imdb_rating, site_rating, episodes, status,
            channel_id, synopsis, image_url, genreIds, castData,
            is_hero, hero_image_url, hero_pos_x, hero_pos_y, hero_scale,
            vote_count, trailer_url
        } = req.body;

        const drama = await Drama.create({
            title, year, imdb_rating, site_rating, episodes, status,
            channel_id, synopsis, image_url, is_hero, hero_image_url,
            hero_pos_x, hero_pos_y, hero_scale,
            vote_count, trailer_url
        }, { transaction: t });

        // Add Genres
        if (genreIds && genreIds.length > 0) {
            await drama.setGenres(genreIds, { transaction: t });
        }

        // Add Cast - auto-create cast members by name if they don't exist
        if (castData && castData.length > 0) {
            for (const castItem of castData) {
                // Find or create the cast member by name
                const [castMember] = await CastMember.findOrCreate({
                    where: { name: castItem.name },
                    defaults: {
                        name: castItem.name,
                        image_url: castItem.image_url || null
                    },
                    transaction: t
                });

                await drama.addCast(castMember.id, {
                    through: {
                        role_name: castItem.role_name || null,
                        is_lead: castItem.is_lead || false
                    },
                    transaction: t
                });
            }
        }

        await t.commit();

        const fullDrama = await Drama.findByPk(drama.id, {
            include: ['channel', 'genres', 'cast']
        });

        res.status(201).json({
            success: true,
            message: 'Drama created successfully',
            data: { drama: fullDrama }
        });
    } catch (error) {
        if (!t.finished) {
            await t.rollback();
        }
        next(error);
    }
};

// @desc    Update drama
// @route   PUT /api/admin/dramas/:id
// @access  Private/Admin
exports.updateDrama = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        console.log('Update Drama Body:', req.body); // DEBUG LOG
        const drama = await Drama.findByPk(req.params.id);
        if (!drama) {
            return res.status(404).json({ success: false, message: 'Drama not found' });
        }

        const {
            title, year, imdb_rating, site_rating, episodes, status,
            channel_id, synopsis, image_url, genreIds, castData,
            is_hero, hero_image_url, hero_pos_x, hero_pos_y, hero_scale,
            vote_count, trailer_url
        } = req.body;

        await drama.update({
            title, year, imdb_rating, site_rating, episodes, status,
            channel_id, synopsis, image_url, is_hero, hero_image_url,
            hero_pos_x, hero_pos_y, hero_scale,
            vote_count, trailer_url
        }, { transaction: t });

        // Update Genres
        if (genreIds) {
            await drama.setGenres(genreIds, { transaction: t });
        }

        // Update Cast (Simplest way is to remove all and re-add)
        if (castData) {
            console.log('Updating cast:', castData.length, 'items'); // DEBUG LOG
            await drama.setCast([], { transaction: t });
            if (Array.isArray(castData)) {
                for (const castItem of castData) {
                    console.log('Processing cast item:', castItem.name); // DEBUG LOG
                    // Find or create the cast member by name
                    const [castMember] = await CastMember.findOrCreate({
                        where: { name: castItem.name },
                        defaults: {
                            name: castItem.name,
                            image_url: castItem.image_url || null
                        },
                        transaction: t
                    });

                    await drama.addCast(castMember.id, {
                        through: {
                            role_name: castItem.role_name || null,
                            is_lead: castItem.is_lead || false
                        },
                        transaction: t
                    });
                }
            }
        }

        await t.commit();

        const fullDrama = await Drama.findByPk(drama.id, {
            include: ['channel', 'genres', 'cast']
        });

        res.json({
            success: true,
            message: 'Drama updated successfully',
            data: { drama: fullDrama }
        });
    } catch (error) {
        if (!t.finished) {
            await t.rollback();
        }
        next(error);
    }
};
// @desc    Delete drama
// @route   DELETE /api/admin/dramas/:id
// @access  Private/Admin
exports.deleteDrama = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const drama = await Drama.findByPk(req.params.id);
        if (!drama) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Drama not found' });
        }

        // 1. Delete basic associations
        await UserDrama.destroy({ where: { drama_id: drama.id }, transaction: t });
        await UserVote.destroy({ where: { drama_id: drama.id }, transaction: t });
        await UserListDrama.destroy({ where: { drama_id: drama.id }, transaction: t });

        // 2. Handle Reviews (Likes and Comments)
        const reviews = await UserReview.findAll({ where: { drama_id: drama.id }, transaction: t });
        const reviewIds = reviews.map(r => r.id);
        if (reviewIds.length > 0) {
            await ReviewLike.destroy({ where: { review_id: { [Op.in]: reviewIds } }, transaction: t });
            await ReviewComment.destroy({ where: { review_id: { [Op.in]: reviewIds } }, transaction: t });
            await UserReview.destroy({ where: { drama_id: drama.id }, transaction: t });
        }

        // 3. Handle Drama Comments (including replies)
        // First delete replies (where parent_id is not null)
        await DramaComment.destroy({
            where: { drama_id: drama.id, parent_id: { [Op.ne]: null } },
            transaction: t
        });
        // Then delete top-level comments
        await DramaComment.destroy({
            where: { drama_id: drama.id },
            transaction: t
        });

        // 4. Remove associations in junction tables
        await drama.setCast([], { transaction: t });
        await drama.setGenres([], { transaction: t });

        // 5. Finally delete the drama
        await drama.destroy({ transaction: t });

        await t.commit();
        res.json({ success: true, message: 'Drama deleted successfully' });
    } catch (error) {
        if (t) await t.rollback();
        next(error);
    }
};

// @desc    Update featured ranking for a drama
// @route   PUT /api/admin/dramas/:id/featured-rank
// @access  Private/Admin
exports.updateFeaturedRank = async (req, res, next) => {
    try {
        const { rank } = req.body;
        const drama = await Drama.findByPk(req.params.id);

        if (!drama) {
            return res.status(404).json({ success: false, message: 'Drama not found' });
        }

        // If setting a rank (1-10), clear any existing drama with that rank
        if (rank && rank >= 1 && rank <= 10) {
            await Drama.update(
                { feature_rank: null },
                { where: { feature_rank: rank } }
            );
        }

        // Update this drama's rank (or clear it if rank is null/0)
        await drama.update({ feature_rank: rank || null });

        res.json({
            success: true,
            message: rank ? `Drama ranked #${rank}` : 'Ranking removed',
            data: { drama }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Trigger manual YouTube episode sync
// @route   POST /api/admin/agents/youtube-sync
// @access  Private/Admin
exports.syncYouTubeEpisodes = async (req, res, next) => {
    try {
        console.log('🚀 Manual YouTube sync triggered by admin:', req.user.username);
        
        // Run in background so we don't timeout the request
        // But we'll return a message immediately
        runYouTubeAgent().catch(err => {
            console.error('❌ Background YouTube sync error:', err);
        });

        res.json({
            success: true,
            message: 'YouTube episode synchronization started in the background.'
        });
    } catch (error) {
        next(error);
    }
};
