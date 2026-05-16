'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('user_dramas', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            drama_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'dramas',
                    key: 'id'
                }
            },
            status: {
                type: Sequelize.ENUM('watching', 'completed', 'plan_to_watch', 'on_hold', 'dropped'),
                allowNull: false,
                defaultValue: 'plan_to_watch'
            },
            user_rating: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            episodes_watched: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            review: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            is_favorite: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            date_started: {
                type: Sequelize.DATEONLY,
                allowNull: true
            },
            date_completed: {
                type: Sequelize.DATEONLY,
                allowNull: true
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
        await queryInterface.dropTable('user_dramas');
    }
};
