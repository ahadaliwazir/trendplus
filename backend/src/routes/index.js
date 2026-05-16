const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const dramaRoutes = require('./dramaRoutes');
const userDramaRoutes = require('./userDramaRoutes');
const adminRoutes = require('./adminRoutes');
const actorRoutes = require('./actorRoutes');
const friendshipRoutes = require('./friendshipRoutes');
const userRoutes = require('./userRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/dramas', dramaRoutes);
router.use('/user', userDramaRoutes);
router.use('/admin', adminRoutes);
router.use('/actors', actorRoutes);
router.use('/friendships', friendshipRoutes);
router.use('/users', userRoutes);
router.use('/reviews', require('./reviewRoutes'));
router.use('/votes', require('./voteRoutes'));
router.use('/recommendations', require('./recommendationRoutes'));
router.use('/news', require('./newsRoutes'));
router.use('/sitemap', require('./sitemapRoutes'));
router.use('/my-list', require('./myDramaListRoutes'));
router.use('/social', require('./socialRoutes'));
router.use('/episodes', require('./episodeRoutes'));
router.use('/insights', require('./insightRoutes'));
router.use('/test', require('./migrateTest'));

module.exports = router;

