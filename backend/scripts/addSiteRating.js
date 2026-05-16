/**
 * Migration to add site_rating column to dramas table
 */
const db = require('../src/models');

async function migrate() {
    try {
        console.log('Starting migration: add site_rating column...');

        const queryInterface = db.sequelize.getQueryInterface();
        const tableDesc = await queryInterface.describeTable('dramas');

        if (!tableDesc.site_rating) {
            console.log('➕ Adding site_rating column...');
            await queryInterface.addColumn('dramas', 'site_rating', {
                type: db.Sequelize.DECIMAL(3, 1),
                defaultValue: 0.0,
                allowNull: true
            });
            console.log('✅ site_rating column added successfully!');
        } else {
            console.log('✅ site_rating column already exists.');
        }

        console.log('Migration complete!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
