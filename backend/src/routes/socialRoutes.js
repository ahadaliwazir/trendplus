'use strict';

const express = require('express');
const router = express.Router();
const socialController = require('../controllers/socialController');
const { protect, optionalAuth } = require('../middleware/auth');

// Comments
router.get('/drama/:dramaId/comments', socialController.getDramaComments);
router.post('/drama/:dramaId/comments', protect, socialController.postComment);

// User Lists
router.post('/lists', protect, socialController.createList);
router.get('/lists/my', protect, socialController.getUserLists);
router.post('/lists/:listId/drama/:dramaId', protect, socialController.addDramaToList);
router.delete('/lists/:listId/drama/:dramaId', protect, socialController.removeDramaFromList);
router.delete('/lists/:listId', protect, socialController.deleteList);
router.get('/lists/:listId', optionalAuth, socialController.getPublicList);

module.exports = router;
