const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/drama/:dramaId', optionalAuth, reviewController.getDramaReviews);
router.get('/feed', optionalAuth, reviewController.getAllReviews);
router.get('/user/:username', reviewController.getUserReviews);
router.get('/:reviewId/comments', reviewController.getComments);

// Protected routes
router.post('/', protect, reviewController.createReview);
router.put('/:reviewId', protect, reviewController.updateReview);
router.delete('/:reviewId', protect, reviewController.deleteReview);
router.post('/:reviewId/like', protect, reviewController.toggleLike);
router.post('/:reviewId/comments', protect, reviewController.addComment);
router.put('/comments/:commentId', protect, reviewController.updateComment);
router.delete('/comments/:commentId', protect, reviewController.deleteComment);

module.exports = router;
