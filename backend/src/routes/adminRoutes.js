const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const moderationController = require('../controllers/moderationController');
const { protect, isAdmin } = require('../middleware/auth');

// All routes here are protected and require admin privileges
router.use(protect);
router.use(isAdmin);

// Stats
router.get('/stats', adminController.getAdminStats);

// User Management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Drama Management
router.post('/dramas', adminController.createDrama);
router.put('/dramas/:id', adminController.updateDrama);
router.delete('/dramas/:id', adminController.deleteDrama);
router.put('/dramas/:id/featured-rank', adminController.updateFeaturedRank);

// Moderation
router.get('/notifications', moderationController.getNotifications);
router.put('/notifications/:id/read', moderationController.markAsRead);
router.put('/notifications/read-all', moderationController.markAllAsRead);
router.get('/blocked-users', moderationController.getBlockedUsers);
router.get('/suspended-users', moderationController.getSuspendedUsers);
router.put('/users/:id/unblock', moderationController.unblockUser);
router.put('/users/:id/unsuspend', moderationController.unsuspendUser);
router.put('/users/:id/reset-warnings', moderationController.resetWarnings);

// Agent Management
router.post('/agents/youtube-sync', adminController.syncYouTubeEpisodes);

module.exports = router;

