const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Public profile access
router.get('/profile/:username', userController.getUserProfile);

// Authenticated routes
router.use(protect);
router.get('/search', userController.searchUsers);
router.post('/preferences', userController.savePreferences);

module.exports = router;
