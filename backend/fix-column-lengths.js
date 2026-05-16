const db = require('./src/models');

async function fixColumnLengths() {
    try {
        await db.sequelize.authenticate();
        console.log('✅ Connected to database.');

        console.log('🔄 Increasing column lengths for dramas table...');

        await db.sequelize.query('ALTER TABLE dramas MODIFY image_url VARCHAR(1500);');
        await db.sequelize.query('ALTER TABLE dramas MODIFY trailer_url VARCHAR(1500);');

        console.log('✅ Column lengths updated successfully.');
    } catch (error) {
        console.error('❌ Error updating column lengths:', error);
    } finally {
        await db.sequelize.close();
    }
}

fixColumnLengths();
