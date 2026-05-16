const { Friendship, User, UserDrama, Drama, Channel } = require('../models');
const { Op } = require('sequelize');

// @desc    Send friend request
// @route   POST /api/friendships/request/:userId
// @access  Private
exports.sendRequest = async (req, res) => {
    try {
        const addresseeId = req.params.userId;
        const requesterId = req.user.id;

        if (requesterId == addresseeId) {
            return res.status(400).json({ message: 'You cannot add yourself as a friend' });
        }

        // Check if user exists
        const addressee = await User.findByPk(addresseeId);
        if (!addressee) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if friendship already exists
        const existingFriendship = await Friendship.findOne({
            where: {
                [Op.or]: [
                    { requester_id: requesterId, addressee_id: addresseeId },
                    { requester_id: addresseeId, addressee_id: requesterId }
                ]
            }
        });

        if (existingFriendship) {
            return res.status(400).json({ message: 'Friendship request already exists or you are already friends' });
        }

        const friendship = await Friendship.create({
            requester_id: requesterId,
            addressee_id: addresseeId,
            status: 'pending'
        });

        res.status(201).json({ success: true, data: friendship });
    } catch (error) {
        console.error('Error sending friend request:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// @desc    Accept friend request
// @route   PUT /api/friendships/accept/:friendshipId
// @access  Private
exports.acceptRequest = async (req, res) => {
    try {
        const friendship = await Friendship.findByPk(req.params.friendshipId);

        if (!friendship) {
            return res.status(404).json({ message: 'Friend request not found' });
        }

        if (friendship.addressee_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to accept this request' });
        }

        friendship.status = 'accepted';
        await friendship.save();

        res.json({ message: 'Friend request accepted', friendship });
    } catch (error) {
        console.error('Error accepting friend request:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// @desc    Reject or Remove friend
// @route   DELETE /api/friendships/:friendshipId
// @access  Private
exports.removeFriendship = async (req, res) => {
    try {
        const friendship = await Friendship.findByPk(req.params.friendshipId);

        if (!friendship) {
            return res.status(404).json({ message: 'Friendship not found' });
        }

        if (friendship.requester_id !== req.user.id && friendship.addressee_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await friendship.destroy();

        res.json({ message: 'Friendship removed' });
    } catch (error) {
        console.error('Error removing friendship:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// @desc    Get friends list
// @route   GET /api/friendships/friends
// @access  Private
exports.getFriends = async (req, res) => {
    try {
        const userId = req.user.id;
        const friendships = await Friendship.findAll({
            where: {
                [Op.or]: [{ requester_id: userId }, { addressee_id: userId }],
                status: 'accepted'
            },
            include: [
                {
                    model: User,
                    as: 'requester',
                    attributes: ['id', 'username', 'avatar', 'bio']
                },
                {
                    model: User,
                    as: 'addressee',
                    attributes: ['id', 'username', 'avatar', 'bio']
                }
            ]
        });

        const friends = friendships.map(f => {
            return f.requester_id === userId ? f.addressee : f.requester;
        });

        res.json({ success: true, data: friends });
    } catch (error) {
        console.error('Error getting friends:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// @desc    Get pending requests
// @route   GET /api/friendships/pending
// @access  Private
exports.getPendingRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const requests = await Friendship.findAll({
            where: {
                addressee_id: userId,
                status: 'pending'
            },
            include: [
                {
                    model: User,
                    as: 'requester',
                    attributes: ['id', 'username', 'avatar']
                }
            ]
        });

        res.json({ success: true, data: requests });
    } catch (error) {
        console.error('Error getting pending requests:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
