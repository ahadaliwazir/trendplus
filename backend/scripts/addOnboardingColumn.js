/**
 * Migration Script: Add has_completed_onboarding column to users table
 * 
 * Run this script once to add the new column to existing users.
 * Usage: node scripts/addOnboardingColumn.js
 */

const { Sequelize } = require('sequelize');
const db = require('../src/models');

async function migrate() {
    console.log('🔄 Starting Onboarding Column Migration...');
    try {
        await db.sequelize.authenticate();
        console.log('✅ Connected to database.');

        const queryInterface = db.sequelize.getQueryInterface();

        // Check if column exists
        const tableDesc = await queryInterface.describeTable('users');

        if (!tableDesc.has_completed_onboarding) {
            console.log('➕ Adding has_completed_onboarding column...');
            await queryInterface.addColumn('users', 'has_completed_onboarding', {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false
            });
            console.log('✅ Column added successfully!');
        } else {
            console.log('ℹ️  Column "has_completed_onboarding" already exists.');
        }

        // Mark existing users as having completed onboarding (they don't need the tour)
        console.log('🔄 Marking existing users as having completed onboarding...');
        const [results] = await db.sequelize.query(`
            UPDATE users 
            SET has_completed_onboarding = true 
            WHERE has_completed_onboarding = false
        `);

        console.log('✅ Existing users marked as onboarded.');
        console.log('🎉 Migration complete!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await db.sequelize.close();
    }
}

migrate();
