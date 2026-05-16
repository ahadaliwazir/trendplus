const express = require('express');
const router = express.Router();
const { submitVote, getMyVote, getVoteStats, deleteVote } = require('../controllers/voteController');
const { protect, optionalAuth } = require('../middleware/auth');

// @route   POST /api/votes/:dramaId
// @desc    Submit or update a vote
// @access  Private
router.post('/:dramaId', protect, submitVote);

// @route   GET /api/votes/:dramaId/my-vote
// @desc    Get current user's vote
// @access  Private
router.get('/:dramaId/my-vote', protect, getMyVote);

// @route   GET /api/votes/:dramaId/stats
// @desc    Get voting statistics for a drama
// @access  Public
router.get('/:dramaId/stats', getVoteStats);

// @route   DELETE /api/votes/:dramaId
// @desc    Remove user's vote
// @access  Private
router.delete('/:dramaId', protect, deleteVote);

module.exports = router;
