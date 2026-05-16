const { UserDrama, Drama, Channel, Genre, CastMember, Sequelize } = require('../models');
const { Op } = Sequelize;

/**
 * @desc    Get personalized drama recommendations based on watched dramas and actors
 * @route   GET /api/recommendations
 * @access  Private
 */
exports.getRecommendations = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 20;

        // Step 1: Get user's watched/completed dramas
        const userDramas = await UserDrama.findAll({
            where: {
                user_id: userId,
                status: { [Op.in]: ['watching', 'completed'] }
            },
            attributes: ['drama_id']
        });

        const watchedDramaIds = userDramas.map(ud => ud.drama_id);

        if (watchedDramaIds.length === 0) {
            // No watched dramas, return top-rated dramas as fallback
            const topRated = await Drama.findAll({
                where: { status: { [Op.in]: ['airing', 'completed'] } },
                include: [
                    { model: Channel, as: 'channel', attributes: ['id', 'name'] },
                    { model: Genre, as: 'genres', attributes: ['id', 'name'] }
                ],
                order: [['site_rating', 'DESC'], ['imdb_rating', 'DESC']],
                limit
            });

            return res.json({
                success: true,
                data: {
                    recommendations: topRated.map(d => ({
                        drama: d,
                        reason: 'Top rated drama',
                        matchingActors: [],
                        score: d.site_rating || d.imdb_rating || 0
                    })),
                    basedOn: 'top_rated'
                }
            });
        }

        // Step 2: Get all actors from watched dramas
        const watchedDramas = await Drama.findAll({
            where: { id: { [Op.in]: watchedDramaIds } },
            include: [{
                model: CastMember,
                as: 'cast',
                attributes: ['id', 'name', 'image_url'],
                through: { attributes: ['is_lead'] }
            }]
        });

        // Count actor appearances (frequency map)
        const actorFrequency = {};
        const actorInfo = {};

        watchedDramas.forEach(drama => {
            if (drama.cast) {
                drama.cast.forEach(actor => {
                    actorFrequency[actor.id] = (actorFrequency[actor.id] || 0) + 1;
                    actorInfo[actor.id] = {
                        id: actor.id,
                        name: actor.name,
                        image_url: actor.image_url
                    };
                });
            }
        });

        // Sort actors by frequency (most watched first)
        const topActorIds = Object.keys(actorFrequency)
            .sort((a, b) => actorFrequency[b] - actorFrequency[a])
            .slice(0, 10) // Top 10 actors
            .map(id => parseInt(id));

        if (topActorIds.length === 0) {
            // No actor data, return top-rated
            const topRated = await Drama.findAll({
                where: {
                    status: { [Op.in]: ['airing', 'completed'] },
                    id: { [Op.notIn]: watchedDramaIds }
                },
                include: [
                    { model: Channel, as: 'channel', attributes: ['id', 'name'] },
                    { model: Genre, as: 'genres', attributes: ['id', 'name'] }
                ],
                order: [['site_rating', 'DESC'], ['imdb_rating', 'DESC']],
                limit
            });

            return res.json({
                success: true,
                data: {
                    recommendations: topRated.map(d => ({
                        drama: d,
                        reason: 'Top rated drama',
                        matchingActors: [],
                        score: d.site_rating || d.imdb_rating || 0
                    })),
                    basedOn: 'top_rated'
                }
            });
        }

        // Step 3: Get all dramas user has added (to exclude)
        const allUserDramas = await UserDrama.findAll({
            where: { user_id: userId },
            attributes: ['drama_id']
        });
        const excludeDramaIds = allUserDramas.map(ud => ud.drama_id);

        // Step 4: Find dramas featuring top actors (not in user's list)
        const recommendedDramas = await Drama.findAll({
            where: {
                id: { [Op.notIn]: excludeDramaIds },
                status: { [Op.in]: ['airing', 'completed'] }
            },
            include: [
                { model: Channel, as: 'channel', attributes: ['id', 'name'] },
                { model: Genre, as: 'genres', attributes: ['id', 'name'] },
                {
                    model: CastMember,
                    as: 'cast',
                    attributes: ['id', 'name', 'image_url'],
                    through: { attributes: ['is_lead'] }
                }
            ]
        });

        // Step 5: Score dramas by actor overlap
        const scoredRecommendations = recommendedDramas.map(drama => {
            const matchingActors = [];
            let actorScore = 0;

            if (drama.cast) {
                drama.cast.forEach(actor => {
                    if (topActorIds.includes(actor.id)) {
                        matchingActors.push(actorInfo[actor.id]);
                        actorScore += actorFrequency[actor.id] || 1;
                    }
                });
            }

            const ratingScore = (drama.site_rating || drama.imdb_rating || 0) / 10;
            const totalScore = (actorScore * 2) + ratingScore;

            return {
                drama,
                matchingActors,
                score: totalScore,
                reason: matchingActors.length > 0
                    ? `Featuring ${matchingActors.slice(0, 2).map(a => a.name).join(', ')}`
                    : 'Recommended for you'
            };
        });

        // Step 6: Sort by score and return top recommendations
        scoredRecommendations.sort((a, b) => b.score - a.score);
        const topRecommendations = scoredRecommendations
            .filter(r => r.matchingActors.length > 0) // Only show if matching actors found
            .slice(0, limit);

        // If not enough actor-based recs, add some top-rated ones
        if (topRecommendations.length < limit) {
            const remaining = scoredRecommendations
                .filter(r => r.matchingActors.length === 0)
                .slice(0, limit - topRecommendations.length);
            topRecommendations.push(...remaining);
        }

        res.json({
            success: true,
            data: {
                recommendations: topRecommendations,
                basedOn: 'actor_overlap',
                topActors: topActorIds.slice(0, 5).map(id => actorInfo[id])
            }
        });
    } catch (error) {
        console.error('Recommendation error:', error);
        next(error);
    }
};

/**
 * @desc    Get recommendations for non-logged-in users (popular dramas)
 * @route   GET /api/recommendations/popular
 * @access  Public
 */
exports.getPopularRecommendations = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 20;

        const popular = await Drama.findAll({
            where: { status: { [Op.in]: ['airing', 'completed'] } },
            include: [
                { model: Channel, as: 'channel', attributes: ['id', 'name'] },
                { model: Genre, as: 'genres', attributes: ['id', 'name'] }
            ],
            order: [
                ['site_vote_count', 'DESC'],
                ['site_rating', 'DESC'],
                ['imdb_rating', 'DESC']
            ],
            limit
        });

        res.json({
            success: true,
            data: {
                recommendations: popular.map(d => ({
                    drama: d,
                    reason: 'Popular on DramaList',
                    matchingActors: [],
                    score: d.site_vote_count || 0
                })),
                basedOn: 'popular'
            }
        });
    } catch (error) {
        next(error);
    }
};
