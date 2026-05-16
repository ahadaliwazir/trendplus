const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { protect, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', newsController.getAllNews);
router.get('/:id', newsController.getNewsById);

// Admin routes
router.post('/', protect, isAdmin, newsController.createNews);
router.put('/:id', protect, isAdmin, newsController.updateNews);
router.delete('/:id', protect, isAdmin, newsController.deleteNews);

module.exports = router;
