'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('dramas', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            title: {
                type: Sequelize.STRING(200),
                allowNull: false
            },
            year: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            imdb_rating: {
                type: Sequelize.DECIMAL(3, 1),
                defaultValue: 0.0
            },
            site_rating: {
                type: Sequelize.DECIMAL(3, 1),
                defaultValue: 0.0
            },
            episodes: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
            current_episode: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            status: {
                type: Sequelize.ENUM('airing', 'completed', 'upcoming'),
                allowNull: false,
                defaultValue: 'upcoming'
            },
            channel_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'channels',
                    key: 'id'
                }
            },
            synopsis: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            image_url: {
                type: Sequelize.STRING(1500),
                allowNull: true
            },
            vote_count: {
                type: Sequelize.STRING(20),
                defaultValue: '0'
            },
            trailer_url: {
                type: Sequelize.STRING(1500),
                allowNull: true
            },
            cast_names: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            feature_rank: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            site_vote_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            is_hero: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            hero_image_url: {
                type: Sequelize.STRING(1500),
                allowNull: true
            },
            hero_pos_x: {
                type: Sequelize.INTEGER,
                defaultValue: 50
            },
            hero_pos_y: {
                type: Sequelize.INTEGER,
                defaultValue: 10
            },
            hero_scale: {
                type: Sequelize.DECIMAL(3, 2),
                defaultValue: 1.0
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('dramas');
    }
};
