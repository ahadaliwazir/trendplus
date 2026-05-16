'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('drama_cast', {
            drama_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: 'dramas',
                    key: 'id'
                }
            },
            cast_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: 'cast_members',
                    key: 'id'
                }
            },
            role_name: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            is_lead: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('drama_cast');
    }
};
