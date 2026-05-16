const express = require('express');
const router = express.Router();
const db = require('../models');

/**
 * @route GET /api/insights
 * @desc Get latest cultural insights for TrendPulse
 */
router.get('/', async (req, res) => {
    try {
        const insights = await db.Insight.findAll({
            limit: 20,
            order: [['created_at', 'DESC']],
            include: [
                { model: db.Drama, as: 'drama', attributes: ['title'] },
                { model: db.Episode, as: 'episode', attributes: ['episode_number'] }
            ]
        });
        res.json(insights);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @route GET /api/insights/stats
 * @desc Get trend statistics (for the dashboard charts)
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await db.Insight.findAll({
            attributes: [
                'type',
                [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
            ],
            group: ['type']
        });
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
