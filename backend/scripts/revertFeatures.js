const { sequelize } = require('../src/models');

async function revertChanges() {
    try {
        console.log('Reverting database changes...');
        await sequelize.query("ALTER TABLE dramas DROP COLUMN air_days");
        console.log('✅ air_days column removed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error reverting changes:', error);
        process.exit(1);
    }
}

revertChanges();
