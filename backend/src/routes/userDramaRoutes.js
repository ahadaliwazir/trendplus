const express = require('express');
const router = express.Router();
const userDramaController = require('../controllers/userDramaController');
const { protect } = require('../middleware/auth');
const { validate, addDramaRules, updateDramaRules } = require('../middleware/validate');

// All routes require authentication
router.use(protect);

// @route   GET /api/user/dramas
// @desc    Get user's drama list
// @access  Private
router.get('/dramas', userDramaController.getUserDramas);

// @route   GET /api/user/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', userDramaController.getUserStats);

// @route   POST /api/user/dramas
// @desc    Add drama to list
// @access  Private
router.post('/dramas', addDramaRules, validate, userDramaController.addDrama);

// @route   PUT /api/user/dramas/:dramaId
// @desc    Update drama in list
// @access  Private
router.put('/dramas/:dramaId', updateDramaRules, validate, userDramaController.updateDrama);

// @route   DELETE /api/user/dramas/:dramaId
// @desc    Remove drama from list
// @access  Private
router.delete('/dramas/:dramaId', userDramaController.removeDrama);

module.exports = router;
