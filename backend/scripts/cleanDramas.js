const { sequelize } = require('../src/models');

async function cleanDramasTable() {
    try {
        console.log('Cleaning redundant columns from dramas table...');
        const columnsToDrop = [
            'episodes_watched',
            'review',
            'is_favorite',
            'date_started',
            'date_completed'
        ];

        for (const column of columnsToDrop) {
            try {
                await sequelize.query(`ALTER TABLE dramas DROP COLUMN ${column}`);
                console.log(`✅ ${column} removed from dramas.`);
            } catch (err) {
                console.log(`ℹ️ ${column} already gone or error: ${err.message}`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    }
}

cleanDramasTable();
