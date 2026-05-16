'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('cast_members', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            image_url: {
                type: Sequelize.STRING(500),
                allowNull: true
            },
            bio: {
                type: Sequelize.TEXT,
                allowNull: true,
                defaultValue: null
            },
            birth_date: {
                type: Sequelize.DATEONLY,
                allowNull: true,
                defaultValue: null
            },
            birth_place: {
                type: Sequelize.STRING(200),
                allowNull: true,
                defaultValue: null
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
        await queryInterface.dropTable('cast_members');
    }
};
