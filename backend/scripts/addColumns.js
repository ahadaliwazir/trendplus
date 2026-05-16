const { Sequelize } = require('sequelize');
const db = require('../src/models');

async function migrate() {
    console.log('🔄 Starting Database Migration...');
    try {
        await db.sequelize.authenticate();
        console.log('✅ Connected to database.');

        const queryInterface = db.sequelize.getQueryInterface();

        // 1. Check if columns exist, if not add them
        const tableDesc = await queryInterface.describeTable('dramas');

        if (!tableDesc.vote_count) {
            console.log('➕ Adding vote_count column...');
            await queryInterface.addColumn('dramas', 'vote_count', {
                type: Sequelize.STRING(20), // Store as string like "12k" or number
                defaultValue: '0'
            });
        }

        if (!tableDesc.trailer_url) {
            console.log('➕ Adding trailer_url column...');
            await queryInterface.addColumn('dramas', 'trailer_url', {
                type: Sequelize.STRING(500),
                defaultValue: null
            });
        }

        console.log('🎉 Migration successful!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await db.sequelize.close();
    }
}

migrate();
