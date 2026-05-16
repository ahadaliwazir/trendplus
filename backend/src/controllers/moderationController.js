const { AdminNotification, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all admin notifications
// @route   GET /api/admin/notifications
// @access  Private/Admin
exports.getNotifications = async (req, res) => {
    try {
        const { unread_only, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (unread_only === 'true') {
            where.is_read = false;
        }

        const { count, rows: notifications } = await AdminNotification.findAndCountAll({
            where,
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'email', 'avatar', 'warning_count', 'is_blocked']
            }],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        // Count unread
        const unreadCount = await AdminNotification.count({ where: { is_read: false } });

        res.json({
            success: true,
            data: {
                notifications,
                unread_count: unreadCount,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    pages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/admin/notifications/:id/read
// @access  Private/Admin
exports.markAsRead = async (req, res) => {
    try {
        const notification = await AdminNotification.findByPk(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        notification.is_read = true;
        await notification.save();

        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/admin/notifications/read-all
// @access  Private/Admin
exports.markAllAsRead = async (req, res) => {
    try {
        await AdminNotification.update(
            { is_read: true },
            { where: { is_read: false } }
        );

        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// @desc    Get blocked users
// @route   GET /api/admin/blocked-users
// @access  Private/Admin
exports.getBlockedUsers = async (req, res) => {
    try {
        const blockedUsers = await User.findAll({
            where: { is_blocked: true },
            attributes: ['id', 'username', 'email', 'avatar', 'warning_count', 'is_blocked', 'ban_count', 'created_at'],
            order: [['updated_at', 'DESC']]
        });

        res.json({ success: true, data: { users: blockedUsers } });
    } catch (error) {
        console.error('Error fetching blocked users:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// @desc    Get suspended users (temporarily banned)
// @route   GET /api/admin/suspended-users
// @access  Private/Admin
exports.getSuspendedUsers = async (req, res) => {
    try {
        const suspendedUsers = await User.findAll({
            where: {
                banned_until: { [Op.gt]: new Date() },
                is_blocked: false  // Not permanently blocked
            },
            attributes: ['id', 'username', 'email', 'avatar', 'warning_count', 'banned_until', 'ban_count', 'created_at'],
            order: [['banned_until', 'ASC']]
        });

        res.json({ success: true, data: { users: suspendedUsers } });
    } catch (error) {
        console.error('Error fetching suspended users:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// @desc    Unsuspend a user (remove temp ban)
// @route   PUT /api/admin/users/:id/unsuspend
// @access  Private/Admin
exports.unsuspendUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.banned_until = null;
        user.warning_count = 0; // Reset warnings
        await user.save();

        // Log this action
        await AdminNotification.create({
            user_id: user.id,
            type: 'other',
            message: `User "${user.username}" was unsuspended by admin.`,
            is_read: true
        });

        res.json({
            success: true,
            message: `User ${user.username} has been unsuspended`,
            data: { user }
        });
    } catch (error) {
        console.error('Error unsuspending user:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// @desc    Unblock a user
// @route   PUT /api/admin/users/:id/unblock
// @access  Private/Admin
exports.unblockUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.is_blocked = false;
        user.warning_count = 0; // Reset warnings
        await user.save();

        // Log this action
        await AdminNotification.create({
            user_id: user.id,
            type: 'other',
            message: `User "${user.username}" was unblocked by admin.`,
            is_read: true
        });

        res.json({
            success: true,
            message: `User ${user.username} has been unblocked`,
            data: { user }
        });
    } catch (error) {
        console.error('Error unblocking user:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// @desc    Reset user warnings
// @route   PUT /api/admin/users/:id/reset-warnings
// @access  Private/Admin
exports.resetWarnings = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.warning_count = 0;
        await user.save();

        res.json({
            success: true,
            message: `Warnings reset for ${user.username}`,
            data: { user }
        });
    } catch (error) {
        console.error('Error resetting warnings:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
