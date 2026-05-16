require('dotenv').config();
const { sequelize } = require('../src/models');
const { QueryTypes } = require('sequelize');

async function migrate() {
    console.log('Starting migration: adding slug column...');

    try {
        // 1. Check if column exists
        const columns = await sequelize.query("SHOW COLUMNS FROM dramas LIKE 'slug'", { type: QueryTypes.SELECT });

        if (columns.length === 0) {
            await sequelize.query(`
                ALTER TABLE dramas ADD COLUMN slug VARCHAR(255) UNIQUE AFTER title;
            `);
            console.log('✅ slug column added.');
        } else {
            console.log('ℹ️ slug column already exists.');
        }

        // 2. Fetch all dramas to generate slugs
        const dramas = await sequelize.query('SELECT id, title FROM dramas', { type: QueryTypes.SELECT });
        console.log(`Generating slugs for ${dramas.length} dramas...`);

        for (const drama of dramas) {
            const slug = drama.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            // Handle duplicates by adding ID if needed (simplified version)
            try {
                await sequelize.query('UPDATE dramas SET slug = ? WHERE id = ?', {
                    replacements: [slug, drama.id],
                    type: QueryTypes.UPDATE
                });
            } catch (e) {
                // If slug not unique, add ID
                const uniqueSlug = `${slug}-${drama.id}`;
                await sequelize.query('UPDATE dramas SET slug = ? WHERE id = ?', {
                    replacements: [uniqueSlug, drama.id],
                    type: QueryTypes.UPDATE
                });
            }
        }

        console.log('✅ All slugs populated successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
