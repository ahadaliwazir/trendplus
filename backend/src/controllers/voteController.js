const { UserVote, UserReview, Drama, Sequelize } = require('../models');

/**
 * @desc    Submit or update a vote for a drama
 * @route   POST /api/votes/:dramaId
 * @access  Private
 */
exports.submitVote = async (req, res, next) => {
    try {
        const { dramaId } = req.params;
        const { rating } = req.body;
        const userId = req.user.id;

        if (!rating || rating < 1 || rating > 10) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 10'
            });
        }

        // Check if drama exists
        const drama = await Drama.findByPk(dramaId);
        if (!drama) {
            return res.status(404).json({
                success: false,
                message: 'Drama not found'
            });
        }

        // Find or create vote
        const [vote, created] = await UserVote.findOrCreate({
            where: { user_id: userId, drama_id: dramaId },
            defaults: { rating }
        });

        if (!created) {
            // Update existing vote
            vote.rating = rating;
            await vote.save();
        }

        // Recalculate site rating for this drama
        await updateDramaSiteRating(dramaId);

        res.json({
            success: true,
            message: created ? 'Vote submitted' : 'Vote updated',
            data: { vote }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get current user's vote for a drama
 * @route   GET /api/votes/:dramaId/my-vote
 * @access  Private
 */
exports.getMyVote = async (req, res, next) => {
    try {
        const { dramaId } = req.params;
        const userId = req.user.id;

        const vote = await UserVote.findOne({
            where: { user_id: userId, drama_id: dramaId }
        });

        // Also check if user has a review (which also counts as a vote)
        const review = await UserReview.findOne({
            where: { user_id: userId, drama_id: dramaId },
            attributes: ['id', 'rating']
        });

        res.json({
            success: true,
            data: {
                vote: vote ? { rating: vote.rating, type: 'vote' } : null,
                review: review ? { rating: review.rating, type: 'review' } : null,
                effectiveRating: vote?.rating || review?.rating || null
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get voting stats for a drama
 * @route   GET /api/votes/:dramaId/stats
 * @access  Public
 */
exports.getVoteStats = async (req, res, next) => {
    try {
        const { dramaId } = req.params;

        const stats = await calculateDramaRatingStats(dramaId);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete user's vote
 * @route   DELETE /api/votes/:dramaId
 * @access  Private
 */
exports.deleteVote = async (req, res, next) => {
    try {
        const { dramaId } = req.params;
        const userId = req.user.id;

        const vote = await UserVote.findOne({
            where: { user_id: userId, drama_id: dramaId }
        });

        if (!vote) {
            return res.status(404).json({
                success: false,
                message: 'Vote not found'
            });
        }

        await vote.destroy();

        // Recalculate site rating
        await updateDramaSiteRating(dramaId);

        res.json({
            success: true,
            message: 'Vote removed'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Calculate rating stats for a drama (votes + reviews combined)
 */
async function calculateDramaRatingStats(dramaId) {
    // Get all votes
    const voteStats = await UserVote.findAll({
        where: { drama_id: dramaId },
        attributes: [
            [Sequelize.fn('AVG', Sequelize.col('rating')), 'avgRating'],
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'voteCount']
        ],
        raw: true
    });

    // Get all review ratings
    const reviewStats = await UserReview.findAll({
        where: { drama_id: dramaId },
        attributes: [
            [Sequelize.fn('AVG', Sequelize.col('rating')), 'avgRating'],
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'reviewCount']
        ],
        raw: true
    });

    const voteAvg = parseFloat(voteStats[0]?.avgRating) || 0;
    const voteCount = parseInt(voteStats[0]?.voteCount) || 0;
    const reviewAvg = parseFloat(reviewStats[0]?.avgRating) || 0;
    const reviewCount = parseInt(reviewStats[0]?.reviewCount) || 0;

    const totalCount = voteCount + reviewCount;

    // Weighted average
    let combinedAvg = 0;
    if (totalCount > 0) {
        combinedAvg = ((voteAvg * voteCount) + (reviewAvg * reviewCount)) / totalCount;
    }

    return {
        averageRating: Math.round(combinedAvg * 10) / 10,
        totalVotes: totalCount,
        voteCount,
        reviewCount,
        breakdown: {
            votes: { average: Math.round(voteAvg * 10) / 10, count: voteCount },
            reviews: { average: Math.round(reviewAvg * 10) / 10, count: reviewCount }
        }
    };
}

/**
 * Update drama's site_rating and site_vote_count
 */
async function updateDramaSiteRating(dramaId) {
    const stats = await calculateDramaRatingStats(dramaId);

    await Drama.update(
        {
            site_rating: stats.averageRating,
            site_vote_count: stats.totalVotes
        },
        { where: { id: dramaId } }
    );

    return stats;
}

// Export helper for use in other controllers
exports.updateDramaSiteRating = updateDramaSiteRating;
exports.calculateDramaRatingStats = calculateDramaRatingStats;
