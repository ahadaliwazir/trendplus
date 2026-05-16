'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('user_reviews', {
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
            title: {
                type: Sequelize.STRING(200),
                allowNull: true
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            rating: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            helpful_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0
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
        await queryInterface.dropTable('user_reviews');
    }
};
