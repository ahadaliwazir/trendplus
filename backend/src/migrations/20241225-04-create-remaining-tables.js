'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // news
        await queryInterface.createTable('news', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            title: { type: Sequelize.STRING(300), allowNull: false },
            content: { type: Sequelize.TEXT, allowNull: false },
            excerpt: { type: Sequelize.STRING(500), allowNull: true },
            image_url: { type: Sequelize.STRING(1500), allowNull: true },
            category: {
                type: Sequelize.ENUM('announcement', 'cast_news', 'awards', 'industry', 'review', 'other'),
                allowNull: false,
                defaultValue: 'other'
            },
            source_url: { type: Sequelize.STRING(1500), allowNull: true },
            is_featured: { type: Sequelize.BOOLEAN, defaultValue: false },
            views: { type: Sequelize.INTEGER, defaultValue: 0 },
            created_at: { allowNull: false, type: Sequelize.DATE },
            updated_at: { allowNull: false, type: Sequelize.DATE }
        });

        // user_votes
        await queryInterface.createTable('user_votes', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'users', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            drama_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'dramas', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            rating: { type: Sequelize.INTEGER, allowNull: false },
            created_at: { allowNull: false, type: Sequelize.DATE },
            updated_at: { allowNull: false, type: Sequelize.DATE }
        });

        await queryInterface.addIndex('user_votes', ['user_id', 'drama_id'], { unique: true });

        // admin_notifications
        await queryInterface.createTable('admin_notifications', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'users', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            type: {
                type: Sequelize.ENUM('profanity_warning', 'user_blocked', 'report', 'other'),
                allowNull: false,
                defaultValue: 'other'
            },
            message: { type: Sequelize.TEXT, allowNull: false },
            context: { type: Sequelize.TEXT, allowNull: true },
            is_read: { type: Sequelize.BOOLEAN, defaultValue: false },
            created_at: { allowNull: false, type: Sequelize.DATE },
            updated_at: { allowNull: false, type: Sequelize.DATE }
        });

        // review_likes
        await queryInterface.createTable('review_likes', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'users', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            review_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'user_reviews', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            created_at: { allowNull: false, type: Sequelize.DATE }
        });

        await queryInterface.addIndex('review_likes', ['user_id', 'review_id'], { unique: true });

        // review_comments
        await queryInterface.createTable('review_comments', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'users', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            review_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'user_reviews', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            content: { type: Sequelize.TEXT, allowNull: false },
            created_at: { allowNull: false, type: Sequelize.DATE },
            updated_at: { allowNull: false, type: Sequelize.DATE }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('review_comments');
        await queryInterface.dropTable('review_likes');
        await queryInterface.dropTable('admin_notifications');
        await queryInterface.dropTable('user_votes');
        await queryInterface.dropTable('news');
    }
};
