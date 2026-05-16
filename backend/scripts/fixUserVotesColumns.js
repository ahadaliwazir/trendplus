/**
 * Fix the user_votes table column names
 * The table was created with camelCase columns but needs snake_case
 */
const db = require('../src/models');

async function fixColumns() {
    try {
        console.log('Fixing user_votes table column names...');

        const queryInterface = db.sequelize.getQueryInterface();

        // Check current columns
        const tableDesc = await queryInterface.describeTable('user_votes');
        console.log('Current columns:', Object.keys(tableDesc));

        // If createdAt exists but created_at doesn't, rename it
        if (tableDesc.createdAt && !tableDesc.created_at) {
            console.log('➕ Renaming createdAt to created_at...');
            await db.sequelize.query('ALTER TABLE user_votes CHANGE createdAt created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
            console.log('✅ createdAt renamed.');
        }

        if (tableDesc.updatedAt && !tableDesc.updated_at) {
            console.log('➕ Renaming updatedAt to updated_at...');
            await db.sequelize.query('ALTER TABLE user_votes CHANGE updatedAt updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
            console.log('✅ updatedAt renamed.');
        }

        // If neither camelCase nor snake_case exists, add them
        if (!tableDesc.createdAt && !tableDesc.created_at) {
            console.log('➕ Adding created_at column...');
            await queryInterface.addColumn('user_votes', 'created_at', {
                type: db.Sequelize.DATE,
                allowNull: false,
                defaultValue: db.Sequelize.literal('CURRENT_TIMESTAMP')
            });
            console.log('✅ created_at added.');
        }

        if (!tableDesc.updatedAt && !tableDesc.updated_at) {
            console.log('➕ Adding updated_at column...');
            await queryInterface.addColumn('user_votes', 'updated_at', {
                type: db.Sequelize.DATE,
                allowNull: false,
                defaultValue: db.Sequelize.literal('CURRENT_TIMESTAMP')
            });
            console.log('✅ updated_at added.');
        }

        console.log('Fix complete!');
        process.exit(0);
    } catch (error) {
        console.error('Fix failed:', error);
        process.exit(1);
    }
}

fixColumns();
