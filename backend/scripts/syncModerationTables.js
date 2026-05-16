/**
 * Sync new moderation tables and columns
 */

const db = require('../src/models');

async function syncModerationTables() {
    try {
        await db.sequelize.authenticate();
        console.log('Connected to database');

        // Sync AdminNotification table
        await db.AdminNotification.sync({ force: false });
        console.log('✅ AdminNotification table created/verified');

        // Add warning_count and is_blocked columns to users table if they don't exist
        const queryInterface = db.sequelize.getQueryInterface();
        const tableInfo = await queryInterface.describeTable('users');

        if (!tableInfo.warning_count) {
            await queryInterface.addColumn('users', 'warning_count', {
                type: db.Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: false
            });
            console.log('✅ Added warning_count column to users');
        } else {
            console.log('⏭️  warning_count column already exists');
        }

        if (!tableInfo.is_blocked) {
            await queryInterface.addColumn('users', 'is_blocked', {
                type: db.Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false
            });
            console.log('✅ Added is_blocked column to users');
        } else {
            console.log('⏭️  is_blocked column already exists');
        }

        console.log('\n📊 Database sync complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

syncModerationTables();
