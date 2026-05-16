'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('drama_genres', {
            drama_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: 'dramas',
                    key: 'id'
                }
            },
            genre_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: 'genres',
                    key: 'id'
                }
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('drama_genres');
    }
};
