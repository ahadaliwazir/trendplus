const express = require('express');
const router = express.Router();
const { getRecommendations, getPopularRecommendations } = require('../controllers/recommendationController');
const { protect, optionalAuth } = require('../middleware/auth');

// @route   GET /api/recommendations
// @desc    Get personalized recommendations for logged-in user
// @access  Private
router.get('/', protect, getRecommendations);

// @route   GET /api/recommendations/popular
// @desc    Get popular recommendations (no login required)
// @access  Public
router.get('/popular', getPopularRecommendations);

module.exports = router;
