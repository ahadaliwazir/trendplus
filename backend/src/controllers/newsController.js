const { News } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all news
// @route   GET /api/news
// @access  Public
exports.getAllNews = async (req, res) => {
    try {
        const { category, featured, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (category) {
            where.category = category;
        }
        if (featured === 'true') {
            where.is_featured = true;
        }

        const { count, rows: news } = await News.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: {
                news,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    pages: Math.ceil(count / limit),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// @desc    Get single news article
// @route   GET /api/news/:id
// @access  Public
exports.getNewsById = async (req, res) => {
    try {
        const news = await News.findByPk(req.params.id);

        if (!news) {
            return res.status(404).json({ success: false, message: 'News article not found' });
        }

        // Increment view count
        await news.increment('views');

        res.json({ success: true, data: { news } });
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// @desc    Create news article
// @route   POST /api/news
// @access  Private/Admin
exports.createNews = async (req, res) => {
    try {
        const { title, content, excerpt, image_url, category, source_url, is_featured } = req.body;

        const news = await News.create({
            title,
            content,
            excerpt: excerpt || content.substring(0, 200) + '...',
            image_url,
            category,
            source_url,
            is_featured: is_featured || false
        });

        res.status(201).json({
            success: true,
            message: 'News article created successfully',
            data: { news }
        });
    } catch (error) {
        console.error('Error creating news:', error);
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

// @desc    Update news article
// @route   PUT /api/news/:id
// @access  Private/Admin
exports.updateNews = async (req, res) => {
    try {
        const news = await News.findByPk(req.params.id);

        if (!news) {
            return res.status(404).json({ success: false, message: 'News article not found' });
        }

        const { title, content, excerpt, image_url, category, source_url, is_featured } = req.body;

        await news.update({
            title,
            content,
            excerpt,
            image_url,
            category,
            source_url,
            is_featured
        });

        res.json({
            success: true,
            message: 'News article updated successfully',
            data: { news }
        });
    } catch (error) {
        console.error('Error updating news:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// @desc    Delete news article
// @route   DELETE /api/news/:id
// @access  Private/Admin
exports.deleteNews = async (req, res) => {
    try {
        const news = await News.findByPk(req.params.id);

        if (!news) {
            return res.status(404).json({ success: false, message: 'News article not found' });
        }

        await news.destroy();

        res.json({ success: true, message: 'News article deleted successfully' });
    } catch (error) {
        console.error('Error deleting news:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
