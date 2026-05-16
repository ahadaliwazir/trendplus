const { Drama, Channel, Genre, CastMember, UserDrama, sequelize } = require('../models');
const { Op } = require('sequelize');
const { get: getCache, set: setCache, CACHE_KEYS } = require('../utils/cache');

// @desc    Get all dramas
// @route   GET /api/dramas
// @access  Public
exports.getAllDramas = async (req, res, next) => {
    try {
        const {
            status,
            channel,
            genre,
            year,
            search,
            sort = 'imdb_rating',
            order = 'DESC',
            page = 1,
            limit = 20
        } = req.query;

        // Build where clause
        const where = {};

        if (status) where.status = status;
        if (year) where.year = year;

        // Build include for associations
        const include = [
            {
                model: Channel,
                as: 'channel',
                attributes: ['id', 'name', 'logo_url']
            },
            {
                model: Genre,
                as: 'genres',
                attributes: ['id', 'name'],
                through: { attributes: [] }
            },
            {
                model: CastMember,
                as: 'cast',
                attributes: ['id', 'name', 'image_url'],
                through: { attributes: ['role_name', 'is_lead'] }
            }
        ];

        // Filter by channel name if provided
        if (channel) {
            include[0].where = { name: { [Op.like]: `%${channel}%` } };
        }

        // Calculate pagination
        const offset = (page - 1) * limit;

        // If search is provided, search by title OR cast member name
        let dramas, count;
        if (search) {
            // First, find cast member IDs matching the search
            const matchingCast = await CastMember.findAll({
                where: sequelize.where(
                    sequelize.fn('LOWER', sequelize.col('name')),
                    'LIKE',
                    `%${search.toLowerCase()}%`
                ),
                attributes: ['id']
            });
            const castIds = matchingCast.map(c => c.id);

            // Find dramas where title matches OR drama is associated with matching cast
            if (castIds.length > 0) {
                // Get drama IDs that have matching cast
                const dramasWithCast = await Drama.findAll({
                    include: [{
                        model: CastMember,
                        as: 'cast',
                        where: { id: { [Op.in]: castIds } },
                        attributes: []
                    }],
                    attributes: ['id']
                });
                const dramaIdsWithCast = dramasWithCast.map(d => d.id);

                // Search by title OR by having matching cast
                where[Op.or] = [
                    sequelize.where(
                        sequelize.fn('LOWER', sequelize.col('title')),
                        'LIKE',
                        `%${search.toLowerCase()}%`
                    ),
                    { id: { [Op.in]: dramaIdsWithCast } }
                ];
            } else {
                // No matching cast, just search by title
                where.title = sequelize.where(
                    sequelize.fn('LOWER', sequelize.col('Drama.title')),
                    'LIKE',
                    `%${search.toLowerCase()}%`
                );
            }
        }

        // Fetch dramas
        const result = await Drama.findAndCountAll({
            where,
            include,
            order: [[sort, order]],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true
        });
        count = result.count;
        dramas = result.rows;

        res.json({
            success: true,
            data: {
                dramas,
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

// @desc    Get single drama by ID
// @route   GET /api/dramas/:id
// @access  Public
exports.getDramaById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const isNumeric = /^\d+$/.test(id);

        const drama = await Drama.findOne({
            where: isNumeric ? { id } : { slug: id },
            include: [
                {
                    model: Channel,
                    as: 'channel',
                    attributes: ['id', 'name', 'logo_url']
                },
                {
                    model: Genre,
                    as: 'genres',
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                },
                {
                    model: CastMember,
                    as: 'cast',
                    attributes: ['id', 'name', 'image_url'],
                    through: { attributes: ['role_name', 'is_lead'] }
                }
            ]
        });

        if (!drama) {
            return res.status(404).json({
                success: false,
                message: 'Drama not found'
            });
        }

        res.json({
            success: true,
            data: { drama }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get top rated dramas
// @route   GET /api/dramas/top-rated
// @access  Public
exports.getTopRated = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        // Check cache first
        const cacheKey = CACHE_KEYS.TOP_RATED(page, limit);
        const cached = getCache(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        // Helper function to parse vote count strings like "4.6K", "1.2M", "500"
        const parseVoteCount = (voteStr) => {
            if (!voteStr) return 0;
            const str = voteStr.toString().toUpperCase().trim();
            if (str.endsWith('K')) {
                return parseFloat(str.slice(0, -1)) * 1000;
            } else if (str.endsWith('M')) {
                return parseFloat(str.slice(0, -1)) * 1000000;
            }
            return parseFloat(str) || 0;
        };

        const dramas = await Drama.findAll({
            where: {},
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
                // Cast removed from list queries for performance
            ]
        });

        // Bayesian Average Constants
        // C: Average rating across all dramas (~7.6)
        const C = 7.6;

        const calculateWeightedRating = (drama) => {
            const v = parseVoteCount(drama.vote_count);
            const R = parseFloat(drama.imdb_rating) || 0;
            const year = parseInt(drama.year) || 2024;

            // Dynamic threshold m based on year to prioritize classics
            let m = 50; // Default
            if (year >= 2020) m = 100;      // Newer dramas need more votes to be trusted
            else if (year >= 2010) m = 50;  // Modern era
            else if (year >= 2000) m = 20;  // Early internet
            else if (year >= 1990) m = 10;  // Pre-broadband
            else m = 5;                     // Classics (Pre-1990)

            if (v === 0) return R * (m / (m + m)); // Penalty for no votes

            // Bayesian Average Formula: (v / (v+m)) * R + (m / (v+m)) * C
            return (v / (v + m)) * R + (m / (v + m)) * C;
        };

        // Sort by weighted rating (descending)
        const sortedDramas = dramas.sort((a, b) => {
            const scoreA = calculateWeightedRating(a);
            const scoreB = calculateWeightedRating(b);

            if (scoreB !== scoreA) {
                return scoreB - scoreA;
            }
            // Tie-break with vote count
            return parseVoteCount(b.vote_count) - parseVoteCount(a.vote_count);
        });

        // Apply pagination
        const total = sortedDramas.length;
        const offset = (page - 1) * limit;
        const paginatedDramas = sortedDramas.slice(offset, offset + limit);

        const response = {
            success: true,
            data: {
                dramas: paginatedDramas,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit),
                    limit
                }
            }
        };

        // Cache for 5 minutes
        setCache(cacheKey, response, 300);

        res.json(response);
    } catch (error) {
        next(error);
    }
};


// @desc    Get currently airing dramas
// @route   GET /api/dramas/airing
// @access  Public
exports.getAiring = async (req, res, next) => {
    try {
        // Check cache first
        const cached = getCache(CACHE_KEYS.AIRING);
        if (cached) {
            return res.json(cached);
        }

        const dramas = await Drama.findAll({
            where: { status: 'airing' },
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
                // Cast removed from list queries for performance
            ],
            order: [['imdb_rating', 'DESC']]
        });

        const response = {
            success: true,
            data: { dramas }
        };

        // Cache for 5 minutes
        setCache(CACHE_KEYS.AIRING, response, 300);

        res.json(response);
    } catch (error) {
        next(error);
    }
};

// @desc    Get upcoming dramas
// @route   GET /api/dramas/upcoming
// @access  Public
exports.getUpcoming = async (req, res, next) => {
    try {
        const dramas = await Drama.findAll({
            where: { status: 'upcoming' },
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
                // Cast removed from list queries for performance
            ],
            order: [['year', 'DESC']]
        });

        res.json({
            success: true,
            data: { dramas }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all channels
// @route   GET /api/dramas/channels
// @access  Public
exports.getChannels = async (req, res, next) => {
    try {
        const channels = await Channel.findAll({
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            data: { channels }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all genres
// @route   GET /api/dramas/genres
// @access  Public
exports.getGenres = async (req, res, next) => {
    try {
        const genres = await Genre.findAll({
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            data: { genres }
        });
    } catch (error) {
        next(error);
    }
};
// @desc    Get hero section dramas
// @route   GET /api/dramas/hero
// @access  Public
exports.getHeroDramas = async (req, res, next) => {
    try {
        const dramas = await Drama.findAll({
            where: { is_hero: true },
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
                // Cast removed from list queries for performance
            ],
            order: [['updated_at', 'DESC']]
        });

        res.json({
            success: true,
            data: { dramas }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get featured airing dramas (Top 10)
// @route   GET /api/dramas/featured-airing
// @access  Public
exports.getFeaturedAiring = async (req, res, next) => {
    try {
        const dramas = await Drama.findAll({
            where: {
                feature_rank: { [Op.ne]: null },
                status: 'airing'
            },
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
                // Cast removed from list queries for performance
            ],
            order: [['feature_rank', 'ASC']],
            limit: 10
        });

        res.json({
            success: true,
            data: { dramas }
        });
    } catch (error) {
        next(error);
    }
};
