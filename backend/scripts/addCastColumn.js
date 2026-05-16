const { sequelize } = require('../src/models');

async function migrate() {
    try {
        console.log('Connected to database via Sequelize.');

        // Add cast_names column
        try {
            await sequelize.query('ALTER TABLE dramas ADD COLUMN cast_names TEXT DEFAULT NULL');
            console.log('✅ Added cast_names column.');
        } catch (err) {
            if (err.parent && err.parent.code === 'ER_DUP_FIELDNAME') {
                console.log('⚠️ cast_names column already exists.');
            } else {
                throw err;
            }
        }

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sequelize.close();
    }
}

migrate();
