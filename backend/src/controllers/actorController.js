const { CastMember, Drama, Channel, Genre, sequelize } = require('../models');

// @desc    Get all actors
// @route   GET /api/actors
// @access  Public
exports.getAllActors = async (req, res, next) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (search) {
            const { Op } = require('sequelize');
            where.name = sequelize.where(
                sequelize.fn('LOWER', sequelize.col('CastMember.name')),
                'LIKE',
                `%${search.toLowerCase()}%`
            );
        }

        const { count, rows: actors } = await CastMember.findAndCountAll({
            where,
            order: [['name', 'ASC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: {
                actors,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    pages: Math.ceil(count / limit),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single actor by ID
// @route   GET /api/actors/:id
// @access  Public
exports.getActorById = async (req, res, next) => {
    try {
        const actor = await CastMember.findByPk(req.params.id, {
            include: [{
                model: Drama,
                as: 'dramas',
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
                ],
                through: { attributes: ['role_name', 'is_lead'] }
            }]
        });

        if (!actor) {
            return res.status(404).json({
                success: false,
                message: 'Actor not found'
            });
        }

        res.json({
            success: true,
            data: { actor }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get actor by name (for search/linking)
// @route   GET /api/actors/by-name/:name
// @access  Public
exports.getActorByName = async (req, res, next) => {
    try {
        const actor = await CastMember.findOne({
            where: { name: req.params.name },
            include: [{
                model: Drama,
                as: 'dramas',
                include: [
                    {
                        model: Channel,
                        as: 'channel',
                        attributes: ['id', 'name']
                    }
                ],
                through: { attributes: ['role_name', 'is_lead'] }
            }]
        });

        if (!actor) {
            return res.status(404).json({
                success: false,
                message: 'Actor not found'
            });
        }

        res.json({
            success: true,
            data: { actor }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update actor profile
// @route   PUT /api/actors/:id
// @access  Private/Admin
exports.updateActor = async (req, res, next) => {
    try {
        const actor = await CastMember.findByPk(req.params.id, {
            include: [{
                model: Drama,
                as: 'dramas',
                attributes: ['id', 'title']
            }]
        });
        if (!actor) {
            return res.status(404).json({
                success: false,
                message: 'Actor not found'
            });
        }

        const { name, image_url, bio, birth_date, birth_place, drama_ids } = req.body;

        await actor.update({
            name,
            image_url,
            bio,
            birth_date,
            birth_place
        });

        // Sync drama associations if drama_ids provided
        if (drama_ids && Array.isArray(drama_ids)) {
            await actor.setDramas(drama_ids);
        }

        // Fetch updated actor with dramas
        const updatedActor = await CastMember.findByPk(req.params.id, {
            include: [{
                model: Drama,
                as: 'dramas',
                attributes: ['id', 'title', 'image_url', 'year']
            }]
        });

        res.json({
            success: true,
            message: 'Actor updated successfully',
            data: { actor: updatedActor }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete actor
// @route   DELETE /api/actors/:id
// @access  Private/Admin
exports.deleteActor = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const actor = await CastMember.findByPk(req.params.id);
        if (!actor) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: 'Actor not found'
            });
        }

        // Remove associations in drama_cast first
        await actor.setDramas([], { transaction: t });

        // Then delete the actor
        await actor.destroy({ transaction: t });

        await t.commit();
        res.json({
            success: true,
            message: 'Actor deleted successfully'
        });
    } catch (error) {
        if (t) await t.rollback();
        next(error);
    }
};
