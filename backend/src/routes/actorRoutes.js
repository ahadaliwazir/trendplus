const express = require('express');
const router = express.Router();
const actorController = require('../controllers/actorController');
const { protect, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', actorController.getAllActors);
router.get('/by-name/:name', actorController.getActorByName);
router.get('/:id', actorController.getActorById);

// Admin routes
router.put('/:id', protect, isAdmin, actorController.updateActor);
router.delete('/:id', protect, isAdmin, actorController.deleteActor);

module.exports = router;

