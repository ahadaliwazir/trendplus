const express = require('express');
const router = express.Router();
const myDramaListController = require('../controllers/myDramaListController');
const { protect } = require('../middleware/auth');

// Public route - view shared list (no auth required)
router.get('/public/:token', myDramaListController.getPublicList);

// Protected routes - require authentication
router.use(protect);

// @route   GET /api/my-list/settings
// @desc    Get share settings
// @access  Private
router.get('/settings', myDramaListController.getShareSettings);

// @route   POST /api/my-list/generate
// @desc    Generate or regenerate share token
// @access  Private
router.post('/generate', myDramaListController.generateShareLink);

// @route   PUT /api/my-list/toggle
// @desc    Toggle sharing on/off
// @access  Private
router.put('/toggle', myDramaListController.toggleSharing);

module.exports = router;
