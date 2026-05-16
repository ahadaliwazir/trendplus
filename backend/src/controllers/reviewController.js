const { UserReview, User, Drama, Channel, ReviewLike, ReviewComment, AdminNotification, Sequelize } = require('../models');
const { checkProfanity } = require('../utils/profanityFilter');

// Helper: Check if user is currently banned
function checkBanStatus(user) {
    // Permanently blocked by admin
    if (user.is_blocked === true) {
        return { banned: true, permanent: true, message: 'Your account has been permanently blocked. Please contact support.' };
    }

    // Temporarily banned (10-day ban)
    if (user.banned_until && new Date(user.banned_until) > new Date()) {
        const daysLeft = Math.ceil((new Date(user.banned_until) - new Date()) / (1000 * 60 * 60 * 24));
        return { banned: true, permanent: false, daysLeft, message: `Your account is temporarily suspended. You can post again in ${daysLeft} day(s).` };
    }

    return { banned: false };
}

// Helper: Issue warning to user and notify admin
async function handleProfanityViolation(user, blockedWords, context) {
    // Increment warning count
    user.warning_count = (user.warning_count || 0) + 1;

    let banApplied = false;
    let banType = null;

    // On 3rd warning
    if (user.warning_count >= 3) {
        user.ban_count = (user.ban_count || 0) + 1;

        if (user.ban_count === 1) {
            // First offense: 10-day temporary ban
            const banDate = new Date();
            banDate.setDate(banDate.getDate() + 10);
            user.banned_until = banDate;
            banApplied = true;
            banType = 'temporary';
        } else {
            // Repeat offense: Permanent block
            user.is_blocked = true;
            banApplied = true;
            banType = 'permanent';
        }

        // Reset warning count for next cycle
        user.warning_count = 0;
    }

    await user.save();

    // Notify admin
    let adminMessage;
    if (banType === 'permanent') {
        adminMessage = `User "${user.username}" has been PERMANENTLY BLOCKED (repeat offense).`;
    } else if (banType === 'temporary') {
        adminMessage = `User "${user.username}" has been suspended for 10 days (3 warnings reached).`;
    } else {
        adminMessage = `User "${user.username}" received warning #${user.warning_count} for profanity: ${blockedWords.join(', ')}`;
    }

    await AdminNotification.create({
        user_id: user.id,
        type: banApplied ? (banType === 'permanent' ? 'user_blocked' : 'profanity_warning') : 'profanity_warning',
        message: adminMessage,
        context: context
    });

    return {
        warningCount: user.warning_count === 0 ? 3 : user.warning_count,
        banApplied,
        banType,
        bannedUntil: user.banned_until
    };
}

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
    try {
        const { drama_id, content, rating, title } = req.body;
        const userId = req.user.id;

        // Get user to check blocked status
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check ban status
        const banStatus = checkBanStatus(user);
        if (banStatus.banned) {
            return res.status(403).json({
                success: false,
                message: banStatus.message,
                is_banned: true,
                is_permanent: banStatus.permanent,
                force_logout: banStatus.permanent
            });
        }

        // Check for profanity in content and title
        const contentCheck = checkProfanity(content || '');
        const titleCheck = checkProfanity(title || '');

        if (!contentCheck.clean || !titleCheck.clean) {
            const allBlockedWords = [...contentCheck.blockedWords, ...titleCheck.blockedWords];
            const result = await handleProfanityViolation(
                user,
                allBlockedWords,
                `Review for drama ID ${drama_id}: "${title}" - "${content?.substring(0, 100)}..."`
            );

            let message;
            if (result.banType === 'permanent') {
                message = 'Your account has been permanently blocked due to repeated violations. You have been logged out.';
            } else if (result.banType === 'temporary') {
                message = 'You have received 3 warnings. Your account is suspended for 10 days. You have been logged out.';
            } else {
                const warningsLeft = 3 - result.warningCount;
                message = `⚠️ Warning ${result.warningCount}/3: Your content contains inappropriate language. ${warningsLeft} more warning(s) before suspension.`;
            }

            return res.status(400).json({
                success: false,
                message,
                warning_count: result.warningCount,
                force_logout: result.banApplied,
                ban_type: result.banType,
                banned_until: result.bannedUntil
            });
        }

        // Check if user already reviewed this drama
        const existingReview = await UserReview.findOne({
            where: { user_id: userId, drama_id }
        });

        if (existingReview) {
            // Update existing review
            existingReview.content = content;
            existingReview.rating = rating;
            existingReview.title = title;
            await existingReview.save();

            const updatedReview = await fetchReviewWithCounts(existingReview.id, userId);

            return res.json({
                success: true,
                message: 'Review updated successfully',
                data: { review: updatedReview }
            });
        }

        const review = await UserReview.create({
            user_id: userId,
            drama_id,
            content,
            rating,
            title
        });

        const fullReview = await fetchReviewWithCounts(review.id, userId);

        res.status(201).json({
            success: true,
            message: 'Review posted successfully',
            data: { review: fullReview }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get reviews for a drama
// @route   GET /api/reviews/drama/:dramaId
// @access  Public
exports.getDramaReviews = async (req, res, next) => {
    try {
        const { dramaId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const userId = req.user ? req.user.id : null;

        const { count, rows: reviews } = await UserReview.findAndCountAll({
            where: { drama_id: dramaId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'avatar']
                }
            ],
            attributes: {
                include: [
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM review_likes AS likes
                            WHERE likes.review_id = UserReview.id
                        )`),
                        'like_count'
                    ],
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM review_comments AS comments
                            WHERE comments.review_id = UserReview.id
                        )`),
                        'comment_count'
                    ],
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*) > 0
                            FROM review_likes AS likes
                            WHERE likes.review_id = UserReview.id
                            AND likes.user_id = ${parseInt(userId, 10) || 0}
                        )`),
                        'is_liked'
                    ]
                ]
            },
            order: [['created_at', 'DESC']],
            limit,
            offset
        });

        res.json({
            success: true,
            data: {
                reviews,
                pagination: {
                    total: count,
                    page,
                    pages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all reviews (Community Feed)
// @route   GET /api/reviews/feed
// @access  Public
exports.getAllReviews = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const userId = req.user ? req.user.id : null;

        const { count, rows: reviews } = await UserReview.findAndCountAll({
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'avatar']
                },
                {
                    model: Drama,
                    as: 'drama',
                    attributes: ['id', 'title', 'image_url', 'year'],
                    include: [
                        { model: Channel, as: 'channel', attributes: ['name'] }
                    ]
                }
            ],
            attributes: {
                include: [
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM review_likes AS likes
                            WHERE likes.review_id = UserReview.id
                        )`),
                        'like_count'
                    ],
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM review_comments AS comments
                            WHERE comments.review_id = UserReview.id
                        )`),
                        'comment_count'
                    ],
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*) > 0
                            FROM review_likes AS likes
                            WHERE likes.review_id = UserReview.id
                            AND likes.user_id = ${parseInt(userId, 10) || 0}
                        )`),
                        'is_liked'
                    ]
                ]
            },
            order: [['created_at', 'DESC']],
            limit,
            offset
        });

        res.json({
            success: true,
            data: {
                reviews,
                pagination: {
                    total: count,
                    page,
                    pages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get reviews by a specific user
// @route   GET /api/reviews/user/:username
// @access  Public
exports.getUserReviews = async (req, res, next) => {
    try {
        const { username } = req.params;
        const { Op } = require('sequelize');

        // Find the user first
        const user = await User.findOne({
            where: {
                username: {
                    [Op.like]: username
                }
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const reviews = await UserReview.findAll({
            where: { user_id: user.id },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'avatar']
                },
                {
                    model: Drama,
                    as: 'drama',
                    attributes: ['id', 'title', 'image_url', 'year'],
                    include: [
                        { model: Channel, as: 'channel', attributes: ['name'] }
                    ]
                }
            ],
            attributes: {
                include: [
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM review_likes AS likes
                            WHERE likes.review_id = UserReview.id
                        )`),
                        'like_count'
                    ],
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM review_comments AS comments
                            WHERE comments.review_id = UserReview.id
                        )`),
                        'comment_count'
                    ]
                ]
            },
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: { reviews }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle like on a review
// @route   POST /api/reviews/:reviewId/like
// @access  Private
exports.toggleLike = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;

        const existingLike = await ReviewLike.findOne({
            where: { review_id: reviewId, user_id: userId }
        });

        if (existingLike) {
            await existingLike.destroy();
            return res.json({ success: true, message: 'Unliked', liked: false });
        } else {
            await ReviewLike.create({ review_id: reviewId, user_id: userId });
            return res.json({ success: true, message: 'Liked', liked: true });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Add comment to a review
// @route   POST /api/reviews/:reviewId/comments
// @access  Private
exports.addComment = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;
        const { content } = req.body;

        // Get user to check blocked status
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check ban status
        const banStatus = checkBanStatus(user);
        if (banStatus.banned) {
            return res.status(403).json({
                success: false,
                message: banStatus.message,
                is_banned: true,
                is_permanent: banStatus.permanent,
                force_logout: banStatus.permanent
            });
        }

        // Check for profanity
        const contentCheck = checkProfanity(content || '');

        if (!contentCheck.clean) {
            const result = await handleProfanityViolation(
                user,
                contentCheck.blockedWords,
                `Comment on review ID ${reviewId}: "${content?.substring(0, 100)}..."`
            );

            let message;
            if (result.banType === 'permanent') {
                message = 'Your account has been permanently blocked due to repeated violations. You have been logged out.';
            } else if (result.banType === 'temporary') {
                message = 'You have received 3 warnings. Your account is suspended for 10 days. You have been logged out.';
            } else {
                const warningsLeft = 3 - result.warningCount;
                message = `⚠️ Warning ${result.warningCount}/3: Your content contains inappropriate language. ${warningsLeft} more warning(s) before suspension.`;
            }

            return res.status(400).json({
                success: false,
                message,
                warning_count: result.warningCount,
                force_logout: result.banApplied,
                ban_type: result.banType,
                banned_until: result.bannedUntil
            });
        }

        const comment = await ReviewComment.create({
            review_id: reviewId,
            user_id: userId,
            content
        });

        const fullComment = await ReviewComment.findByPk(comment.id, {
            include: [{ model: User, as: 'user', attributes: ['id', 'username', 'avatar'] }]
        });

        res.status(201).json({ success: true, data: { comment: fullComment } });
    } catch (error) {
        next(error);
    }
};

// @desc    Get comments for a review
// @route   GET /api/reviews/:reviewId/comments
// @access  Public
exports.getComments = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const comments = await ReviewComment.findAll({
            where: { review_id: reviewId },
            include: [{ model: User, as: 'user', attributes: ['id', 'username', 'avatar'] }],
            order: [['created_at', 'ASC']]
        });

        res.json({ success: true, data: { comments } });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a comment
// @route   PUT /api/reviews/comments/:commentId
// @access  Private (owner only)
exports.updateComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        const comment = await ReviewComment.findByPk(commentId);

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        // Only comment owner can edit
        if (comment.user_id !== userId) {
            return res.status(403).json({ success: false, message: 'Not authorized to edit this comment' });
        }

        comment.content = content;
        await comment.save();

        const updatedComment = await ReviewComment.findByPk(commentId, {
            include: [{ model: User, as: 'user', attributes: ['id', 'username', 'avatar'] }]
        });

        res.json({ success: true, data: { comment: updatedComment } });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a comment
// @route   DELETE /api/reviews/comments/:commentId
// @access  Private (owner or admin)
exports.deleteComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';

        console.log('BACKEND: Attempting to delete comment:', {
            commentId,
            userId,
            userIdType: typeof userId,
            isAdmin
        });

        const comment = await ReviewComment.findByPk(commentId);

        if (!comment) {
            console.log('BACKEND: Comment not found:', commentId);
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        console.log('BACKEND: Found comment info:', {
            commentId: comment.id,
            commentUserId: comment.user_id,
            commentUserIdType: typeof comment.user_id
        });

        // Only comment owner or admin can delete
        const isOwner = String(comment.user_id) === String(userId);
        console.log('BACKEND: Permission check:', { isOwner, isAdmin });

        if (!isOwner && !isAdmin) {
            console.log('BACKEND: Not authorized to delete');
            return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
        }

        await comment.destroy();
        console.log('BACKEND: Comment deleted successfully');

        res.json({ success: true, message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('BACKEND: Error in deleteComment:', error);
        next(error);
    }
};

// Helper: Fetch single review with counts
async function fetchReviewWithCounts(reviewId, userId) {
    return await UserReview.findByPk(reviewId, {
        include: [
            { model: User, as: 'user', attributes: ['id', 'username', 'avatar'] },
            {
                model: Drama,
                as: 'drama',
                attributes: ['id', 'title', 'image_url', 'year'],
                include: [{ model: Channel, as: 'channel', attributes: ['name'] }]
            }
        ],
        attributes: {
            include: [
                [
                    Sequelize.literal(`(
                        SELECT COUNT(*) FROM review_likes AS likes WHERE likes.review_id = UserReview.id
                    )`),
                    'like_count'
                ],
                [
                    Sequelize.literal(`(
                        SELECT COUNT(*) FROM review_comments AS comments WHERE comments.review_id = UserReview.id
                    )`),
                    'comment_count'
                ],
                [
                    Sequelize.literal(`(
                        SELECT COUNT(*) > 0 FROM review_likes AS likes WHERE likes.review_id = UserReview.id AND likes.user_id = ${parseInt(userId, 10) || 0}
                    )`),
                    'is_liked'
                ]
            ]
        }
    });
}

// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
// @access  Private (owner only)
exports.updateReview = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const { content, rating, title } = req.body;
        const userId = req.user.id;

        const review = await UserReview.findByPk(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check ownership
        if (review.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only edit your own reviews'
            });
        }

        // Get user for profanity check
        const user = await User.findByPk(userId);

        // Check profanity in content
        if (content) {
            const profanityResult = checkProfanity(content);
            if (profanityResult.hasProfanity) {
                const violation = await handleProfanityViolation(user, profanityResult.blockedWords, `Edited review ID: ${reviewId}`);

                let message = `Your review contains inappropriate language (${profanityResult.blockedWords.join(', ')}). `;
                if (violation.banApplied) {
                    if (violation.banType === 'permanent') {
                        message += 'Your account has been permanently blocked.';
                    } else {
                        message += 'Your account has been suspended for 10 days.';
                    }
                } else {
                    message += `This is warning ${violation.warningCount}/3.`;
                }

                return res.status(400).json({
                    success: false,
                    message,
                    force_logout: violation.banApplied,
                    warning_count: violation.warningCount,
                    ban_type: violation.banType
                });
            }
        }

        // Update review
        if (content) review.content = content;
        if (rating) review.rating = rating;
        if (title !== undefined) review.title = title;
        review.updated_at = new Date();

        await review.save();

        // Fetch updated review with counts
        const updatedReview = await fetchReviewWithCounts(reviewId, userId);

        res.json({
            success: true,
            data: { review: updatedReview }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private (owner or admin)
exports.deleteReview = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;

        const review = await UserReview.findByPk(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user owns the review or is admin
        const user = await User.findByPk(userId);
        const isOwner = review.user_id === userId;
        const isAdmin = user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own reviews'
            });
        }

        // Delete associated comments and likes first
        await ReviewComment.destroy({ where: { review_id: reviewId } });
        await ReviewLike.destroy({ where: { review_id: reviewId } });

        // Delete the review
        await review.destroy();

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

