'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const tableInfo = await queryInterface.describeTable('dramas');

        if (!tableInfo.is_hero) {
            console.log('Adding is_hero column');
            await queryInterface.addColumn('dramas', 'is_hero', {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            });
        }

        if (!tableInfo.hero_image_url) {
            console.log('Adding hero_image_url column');
            await queryInterface.addColumn('dramas', 'hero_image_url', {
                type: Sequelize.STRING(1500),
                allowNull: true
            });
        }

        if (!tableInfo.hero_pos_x) {
            await queryInterface.addColumn('dramas', 'hero_pos_x', {
                type: Sequelize.INTEGER,
                defaultValue: 50
            });
        }

        if (!tableInfo.hero_pos_y) {
            await queryInterface.addColumn('dramas', 'hero_pos_y', {
                type: Sequelize.INTEGER,
                defaultValue: 10
            });
        }

        if (!tableInfo.hero_scale) {
            await queryInterface.addColumn('dramas', 'hero_scale', {
                type: Sequelize.DECIMAL(3, 2),
                defaultValue: 1.0
            });
        }

        // Seed at least one hero
        await queryInterface.sequelize.query(`
      UPDATE dramas 
      SET is_hero = true 
      WHERE id IN (
        SELECT id FROM dramas ORDER BY imdb_rating DESC LIMIT 1
      ) AND (SELECT count(*) FROM dramas WHERE is_hero = true) = 0;
    `);
    },

    async down(queryInterface, Sequelize) {
        // No down needed for repair migration usually, or removing columns
    }
};
