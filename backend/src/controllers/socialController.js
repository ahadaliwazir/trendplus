'use strict';

const { DramaComment, UserList, UserListDrama, User, Drama, Sequelize } = require('../models');
const { Op } = require('sequelize');

// Helper to build nested comments (not used if we fetch with include and nesting, but good to have)
const buildCommentTree = (comments, parentId = null) => {
    return comments
        .filter(comment => comment.parent_id === parentId)
        .map(comment => ({
            ...comment.toJSON ? comment.toJSON() : comment,
            replies: buildCommentTree(comments, comment.id)
        }));
};

const socialController = {
    // COMMENTS
    async postComment(req, res) {
        try {
            const { dramaId } = req.params;
            const { content, parentId } = req.body;
            const userId = req.user.id;

            const comment = await DramaComment.create({
                user_id: userId,
                drama_id: dramaId,
                parent_id: parentId || null,
                content
            });

            const fullComment = await DramaComment.findByPk(comment.id, {
                include: [{ model: User, as: 'user', attributes: ['id', 'username', 'avatar'] }]
            });

            res.status(201).json({ success: true, data: fullComment });
        } catch (error) {
            console.error('Post comment error:', error);
            res.status(500).json({ success: false, message: 'Failed to post comment' });
        }
    },

    async getDramaComments(req, res) {
        try {
            const { dramaId } = req.params;

            // For now, fetch all and build tree in memory or just fetch top level
            const comments = await DramaComment.findAll({
                where: { drama_id: dramaId, parent_id: null },
                include: [
                    { model: User, as: 'user', attributes: ['id', 'username', 'avatar'] },
                    {
                        model: DramaComment,
                        as: 'replies',
                        include: [{ model: User, as: 'user', attributes: ['id', 'username', 'avatar'] }]
                    }
                ],
                order: [['created_at', 'DESC']]
            });

            res.json({ success: true, data: comments });
        } catch (error) {
            console.error('Get comments error:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch comments' });
        }
    },

    // USER LISTS
    async createList(req, res) {
        try {
            const { name, description, is_public } = req.body;
            const userId = req.user.id;

            const list = await UserList.create({
                name,
                description,
                is_public: is_public !== undefined ? is_public : true,
                user_id: userId
            });

            res.status(201).json({ success: true, data: list });
        } catch (error) {
            console.error('Create list error:', error);
            res.status(500).json({ success: false, message: 'Failed to create list' });
        }
    },

    async getUserLists(req, res) {
        try {
            const userId = req.user.id;
            const lists = await UserList.findAll({
                where: { user_id: userId },
                include: [{
                    model: Drama,
                    as: 'dramas',
                    attributes: ['id', 'title', 'image_url', 'slug']
                }]
            });
            res.json({ success: true, data: lists });
        } catch (error) {
            console.error('Get lists error:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch user lists' });
        }
    },

    async addDramaToList(req, res) {
        try {
            const { listId, dramaId } = req.params;
            const { notes } = req.body;
            const userId = req.user.id;

            // Check if list belongs to user
            const list = await UserList.findOne({ where: { id: listId, user_id: userId } });
            if (!list) return res.status(403).json({ success: false, message: 'Access denied' });

            await UserListDrama.create({
                list_id: listId,
                drama_id: dramaId,
                notes
            });

            res.json({ success: true, message: 'Drama added to list' });
        } catch (error) {
            console.error('Add to list error:', error);
            res.status(500).json({ success: false, message: 'Failed to add drama to list' });
        }
    },

    async removeDramaFromList(req, res) {
        try {
            const { listId, dramaId } = req.params;
            const userId = req.user.id;

            const list = await UserList.findOne({ where: { id: listId, user_id: userId } });
            if (!list) return res.status(403).json({ success: false, message: 'Access denied' });

            await UserListDrama.destroy({
                where: { list_id: listId, drama_id: dramaId }
            });

            res.json({ success: true, message: 'Drama removed from list' });
        } catch (error) {
            console.error('Remove from list error:', error);
            res.status(500).json({ success: false, message: 'Failed to remove drama' });
        }
    },

    async deleteList(req, res) {
        try {
            const { listId } = req.params;
            const userId = req.user.id;

            const list = await UserList.findOne({
                where: { id: listId, user_id: userId }
            });

            if (!list) {
                return res.status(404).json({ success: false, message: 'List not found or access denied' });
            }

            // Delete associated dramas first
            await UserListDrama.destroy({ where: { list_id: listId } });
            await list.destroy();

            res.json({ success: true, message: 'List deleted successfully' });
        } catch (error) {
            console.error('Delete list error:', error);
            res.status(500).json({ success: false, message: 'Failed to delete list' });
        }
    },

    async getPublicList(req, res) {
        try {
            const listId = parseInt(req.params.listId);
            const userId = req.user ? req.user.id : null;

            if (isNaN(listId)) {
                return res.status(400).json({ success: false, message: 'Invalid list ID' });
            }

            // Find list if it's public OR belongs to the current user
            const list = await UserList.findOne({
                where: {
                    id: listId,
                    [Op.or]: [
                        { is_public: true },
                        { user_id: userId }
                    ]
                },
                include: [
                    { model: User, as: 'user', attributes: ['id', 'username', 'avatar'] },
                    { model: Drama, as: 'dramas' }
                ]
            });

            if (!list) {
                return res.status(404).json({ success: false, message: 'List not found or is private.' });
            }

            res.json({ success: true, data: list });
        } catch (error) {
            console.error('Get public list error:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch list' });
        }
    }
};

module.exports = socialController;
