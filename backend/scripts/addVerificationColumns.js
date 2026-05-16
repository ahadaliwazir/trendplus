/**
 * Migration: Add Email Verification Columns (Raw SQL)
 * Run this on production to add is_verified, verification_otp, verification_otp_expires columns
 * 
 * Usage: node scripts/addVerificationColumns.js
 */

const db = require('../src/models');

async function migrate() {
    console.log('🚀 Starting Email Verification Migration...');

    try {
        await db.sequelize.authenticate();
        console.log('✅ Connected to database');

        // Add is_verified column with default true for existing users
        console.log('➕ Adding is_verified column...');
        try {
            await db.sequelize.query(`
                ALTER TABLE users 
                ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT TRUE
            `);
            console.log('✅ is_verified column added');
        } catch (e) {
            if (e.original?.code === 'ER_DUP_FIELDNAME' || e.message.includes('Duplicate')) {
                console.log('ℹ️  is_verified column already exists');
            } else {
                throw e;
            }
        }

        // Add verification_otp column
        console.log('➕ Adding verification_otp column...');
        try {
            await db.sequelize.query(`
                ALTER TABLE users 
                ADD COLUMN verification_otp VARCHAR(6) DEFAULT NULL
            `);
            console.log('✅ verification_otp column added');
        } catch (e) {
            if (e.original?.code === 'ER_DUP_FIELDNAME' || e.message.includes('Duplicate')) {
                console.log('ℹ️  verification_otp column already exists');
            } else {
                throw e;
            }
        }

        // Add verification_otp_expires column
        console.log('➕ Adding verification_otp_expires column...');
        try {
            await db.sequelize.query(`
                ALTER TABLE users 
                ADD COLUMN verification_otp_expires DATETIME DEFAULT NULL
            `);
            console.log('✅ verification_otp_expires column added');
        } catch (e) {
            if (e.original?.code === 'ER_DUP_FIELDNAME' || e.message.includes('Duplicate')) {
                console.log('ℹ️  verification_otp_expires column already exists');
            } else {
                throw e;
            }
        }

        // Mark all existing users as verified
        console.log('📧 Ensuring existing users are verified...');
        await db.sequelize.query(`
            UPDATE users SET is_verified = TRUE WHERE is_verified = FALSE OR is_verified IS NULL
        `);
        console.log('✅ All existing users marked as verified');

        console.log('🎉 Migration complete!');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await db.sequelize.close();
    }
}

migrate();
