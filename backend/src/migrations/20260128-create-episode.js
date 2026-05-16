'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('episodes', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            drama_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'dramas',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            episode_number: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            video_url: {
                type: Sequelize.STRING,
                allowNull: false
            },
            duration: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            thumbnail_url: {
                type: Sequelize.STRING,
                allowNull: true
            },
            release_date: {
                type: Sequelize.DATEONLY,
                allowNull: true
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Add unique index for drama_id + episode_number
        await queryInterface.addIndex('episodes', ['drama_id', 'episode_number'], {
            unique: true,
            name: 'episodes_drama_id_episode_number_unique'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('episodes');
    }
};
