const express = require('express');
const router = express.Router();
const { query } = require('express-validator');
const dramaController = require('../controllers/dramaController');
const homepageController = require('../controllers/homepageController');
const { validate } = require('../middleware/validate');
// @desc    Get all dramas with filters and pagination
// @access  Public
router.get('/', [
    query('search').optional().isString().trim().escape(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate
], dramaController.getAllDramas);
router.get('/homepage', homepageController.getHomepageData);
router.get('/hero', dramaController.getHeroDramas);

// @route   GET /api/dramas/top-rated
// @desc    Get top rated dramas
// @access  Public
router.get('/top-rated', dramaController.getTopRated);

// @route   GET /api/dramas/airing
// @desc    Get currently airing dramas
// @access  Public
router.get('/airing', dramaController.getAiring);

// @route   GET /api/dramas/upcoming
// @desc    Get upcoming dramas
// @access  Public
router.get('/upcoming', dramaController.getUpcoming);

// @route   GET /api/dramas/channels
// @desc    Get all channels
// @access  Public
router.get('/channels', dramaController.getChannels);

// @route   GET /api/dramas/genres
// @desc    Get all genres
// @access  Public
router.get('/genres', dramaController.getGenres);

// @route   GET /api/dramas/featured-airing
// @desc    Get featured airing dramas (Top 10)
// @access  Public
router.get('/featured-airing', dramaController.getFeaturedAiring);

// @route   GET /api/dramas/:id
// @desc    Get single drama by ID
// @access  Public
router.get('/:id', dramaController.getDramaById);

module.exports = router;
