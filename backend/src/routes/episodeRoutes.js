const express = require('express');
const router = express.Router();
const episodeController = require('../controllers/episodeController');

// @route   GET /api/episodes/:dramaId
// @desc    Get all episodes for a drama
// @access  Public
router.get('/:dramaId', episodeController.getEpisodesByDrama);

// @route   POST /api/episodes
// @desc    Create a new episode
// @access  Private (Admin)
router.post('/', episodeController.createEpisode);

// @route   PUT /api/episodes/:id
// @desc    Update an episode
// @access  Private (Admin)
router.put('/:id', episodeController.updateEpisode);

// @route   DELETE /api/episodes/:id
// @desc    Delete an episode
// @access  Private (Admin)
router.delete('/:id', episodeController.deleteEpisode);

module.exports = router;
