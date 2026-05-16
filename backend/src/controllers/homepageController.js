const { Drama, Channel, Genre } = require('../models');
const { Op } = require('sequelize');
const { get: getCache, set: setCache, CACHE_KEYS } = require('../utils/cache');

// Helper for ranking (matching the logic in dramaController but without the expensive weighted part for now if possible)
// However, the user said "except optimizing the ranking", meaning keep the current logic but maybe wrap it here.

exports.getHomepageData = async (req, res, next) => {
    try {
        const cacheKey = 'homepage_bundled_data';
        const cached = getCache(cacheKey);
        if (cached) {
            return res.json({ success: true, data: cached });
        }

        // Fetch all categories in parallel
        const [
            heroDramas,
            featuredAiring,
            airingDramas,
            upcomingDramas,
            topRatedDramasData
        ] = await Promise.all([
            // 1. Hero Dramas
            Drama.findAll({
                where: { is_hero: true },
                include: [
                    { model: Channel, as: 'channel', attributes: ['id', 'name'] },
                    { model: Genre, as: 'genres', attributes: ['id', 'name'], through: { attributes: [] } }
                ],
                order: [['updated_at', 'DESC']]
            }),
            // 2. Featured Airing (Top 10)
            Drama.findAll({
                where: { feature_rank: { [Op.ne]: null }, status: 'airing' },
                include: [
                    { model: Channel, as: 'channel', attributes: ['id', 'name'] },
                    { model: Genre, as: 'genres', attributes: ['id', 'name'], through: { attributes: [] } }
                ],
                order: [['feature_rank', 'ASC']],
                limit: 10
            }),
            // 3. Airing Dramas
            Drama.findAll({
                where: { status: 'airing' },
                include: [
                    { model: Channel, as: 'channel', attributes: ['id', 'name'] },
                    { model: Genre, as: 'genres', attributes: ['id', 'name'], through: { attributes: [] } }
                ],
                order: [['updated_at', 'DESC']],
                limit: 20
            }),
            // 4. Upcoming Dramas
            Drama.findAll({
                where: { status: 'upcoming' },
                include: [
                    { model: Channel, as: 'channel', attributes: ['id', 'name'] },
                    { model: Genre, as: 'genres', attributes: ['id', 'name'], through: { attributes: [] } }
                ],
                order: [['created_at', 'DESC']],
                limit: 20
            }),
            // 5. Top Rated (expensive one, we'll keep the current logic but maybe a bit more contained)
            // For the homepage, we usually just show the first page
            Drama.findAll({
                include: [
                    { model: Channel, as: 'channel', attributes: ['id', 'name'] },
                    { model: Genre, as: 'genres', attributes: ['id', 'name'], through: { attributes: [] } }
                ]
            })
        ]);

        // Same ranking logic as in dramaController.getTopRated
        const parseVoteCount = (voteStr) => {
            if (!voteStr) return 0;
            const str = voteStr.toString().toUpperCase().trim();
            if (str.endsWith('K')) return parseFloat(str.slice(0, -1)) * 1000;
            if (str.endsWith('M')) return parseFloat(str.slice(0, -1)) * 1000000;
            return parseFloat(str) || 0;
        };

        const C = 7.6;
        const calculateWeightedRating = (drama) => {
            const v = parseVoteCount(drama.vote_count);
            const R = parseFloat(drama.imdb_rating) || 0;
            const year = parseInt(drama.year) || 2024;
            let m = 50;
            if (year >= 2020) m = 100;
            else if (year >= 2010) m = 50;
            else if (year >= 2000) m = 20;
            else if (year >= 1990) m = 10;
            else m = 5;
            if (v === 0) return R * (m / (m + m));
            return (v / (v + m)) * R + (m / (v + m)) * C;
        };

        const sortedTopRated = topRatedDramasData
            .sort((a, b) => calculateWeightedRating(b) - calculateWeightedRating(a))
            .slice(0, 15);

        // Recommended is currently just Top Rated with limit 15 in service
        const recommendedDramas = sortedTopRated;

        const homepageData = {
            heroDramas,
            featuredAiring,
            airingDramas,
            upcomingDramas,
            topRatedDramas: sortedTopRated,
            recommendedDramas
        };

        // Cache for 2 minutes to keep it fresh but reduce load
        setCache(cacheKey, homepageData, 120);

        res.json({
            success: true,
            data: homepageData
        });
    } catch (error) {
        next(error);
    }
};
