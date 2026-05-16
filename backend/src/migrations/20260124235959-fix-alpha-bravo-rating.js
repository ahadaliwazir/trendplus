'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkUpdate('dramas',
            { site_rating: 0.0 },
            { title: 'Alpha Bravo Charlie' }
        );
    },

    async down(queryInterface, Sequelize) {
        // Revert to 1.0 if needed, though this is a fix so reverting might not be desired.
        // For completeness:
        await queryInterface.bulkUpdate('dramas',
            { site_rating: 1.0 },
            { title: 'Alpha Bravo Charlie' }
        );
    }
};
