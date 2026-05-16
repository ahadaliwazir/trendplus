'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            username: {
                type: Sequelize.STRING(50),
                allowNull: false,
                unique: true
            },
            email: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true
            },
            password: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            avatar: {
                type: Sequelize.STRING(500),
                allowNull: true
            },
            bio: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            role: {
                type: Sequelize.ENUM('user', 'admin'),
                defaultValue: 'user',
                allowNull: false
            },
            warning_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            is_blocked: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            banned_until: {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: null
            },
            ban_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            reset_token: {
                type: Sequelize.STRING(255),
                allowNull: true,
                defaultValue: null
            },
            reset_token_expires: {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: null
            },
            share_token: {
                type: Sequelize.STRING(100),
                allowNull: true,
                defaultValue: null
            },
            share_enabled: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
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

        await queryInterface.addIndex('users', ['share_token'], {
            unique: true,
            where: {
                share_token: {
                    [Sequelize.Op.ne]: null
                }
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('users');
    }
};
