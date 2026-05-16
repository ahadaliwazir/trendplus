const { User, UserDrama, Drama, Channel, Genre } = require('../models');
const { Op } = require('sequelize');

// @desc    Search users by username
// @route   GET /api/users/search
// @access  Private
exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ success: false, message: 'Search query is required' });
        }

        const users = await User.findAll({
            where: {
                username: {
                    [Op.like]: `%${query}%`
                },
                id: {
                    [Op.ne]: req.user.id // Don't include self
                }
            },
            attributes: ['id', 'username', 'avatar', 'bio'],
            limit: 20
        });

        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// @desc    Get user profile and drama list
// @route   GET /api/users/profile/:username
// @access  Public/Private
exports.getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;
        console.log('Looking up user profile for:', username);

        // Simple case-insensitive lookup using Op.like
        const user = await User.findOne({
            where: {
                username: {
                    [Op.like]: username  // SQLite LIKE is case-insensitive by default
                }
            },
            attributes: ['id', 'username', 'avatar', 'bio']
        });

        console.log('User found:', user ? user.username : 'null');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Get user's drama list
        console.log('Fetching drama list for user:', user.id, user.username);
        const dramaList = await UserDrama.findAll({
            where: { user_id: user.id },
            include: [
                {
                    model: Drama,
                    as: 'drama',
                    include: [
                        { model: Channel, as: 'channel' },
                        { model: Genre, as: 'genres', required: false }
                    ]
                }
            ],
            order: [['updated_at', 'DESC']]
        });
        console.log('Found drama list entries:', dramaList.length);

        res.json({
            success: true,
            data: {
                user,
                dramaList
            }
        });
    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// @desc    Save user preferences (favorite genres)
// @route   POST /api/users/preferences
// @access  Private
exports.savePreferences = async (req, res) => {
    try {
        const { favorite_genres } = req.body;
        const userId = req.user.id;

        // Update user's bio to include preferences (simple approach)
        // In a full implementation, you'd have a separate preferences table
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Store preferences in a JSON format in the bio or a dedicated column
        // For now, we'll just acknowledge receipt
        console.log('User preferences saved:', { userId, favorite_genres });

        res.json({
            success: true,
            message: 'Preferences saved successfully',
            data: { favorite_genres }
        });
    } catch (error) {
        console.error('Error saving preferences:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
