'use strict';

/** @type {import('sequelize-cli').Migration} */
const { QueryTypes } = require('sequelize');

module.exports = {
    async up(queryInterface, Sequelize) {
        console.log('--- Starting Slug Migration ---');

        // 1. Check if slug column already exists
        const tableInfo = await queryInterface.describeTable('dramas');

        if (!tableInfo.slug) {
            console.log('Step 1: Adding slug column...');
            await queryInterface.addColumn('dramas', 'slug', {
                type: Sequelize.STRING(191),
                allowNull: true,
                after: 'title'
            });
            console.log('✅ Slug column added.');
        } else {
            console.log('ℹ️ Slug column already exists, skipping addColumn.');
        }

        // 2. Fetch all dramas and generate slugs
        const dramas = await queryInterface.sequelize.query(
            'SELECT id, title FROM dramas',
            { type: QueryTypes.SELECT }
        );

        console.log(`Step 2: Generating slugs for ${dramas.length} dramas...`);

        for (const drama of dramas) {
            try {
                // Multi-layer guard for title
                const rawTitle = drama.title || '';
                const title = rawTitle.toString().trim();

                let slugSource = title.toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');

                if (!slugSource) {
                    slugSource = `drama-${drama.id}`;
                }

                try {
                    await queryInterface.sequelize.query(
                        'UPDATE dramas SET slug = ? WHERE id = ?',
                        {
                            replacements: [slugSource, drama.id],
                            type: QueryTypes.UPDATE
                        }
                    );
                } catch (updateError) {
                    const uniqueSlug = `${slugSource}-${drama.id}`;
                    await queryInterface.sequelize.query(
                        'UPDATE dramas SET slug = ? WHERE id = ?',
                        {
                            replacements: [uniqueSlug, drama.id],
                            type: QueryTypes.UPDATE
                        }
                    );
                }
            } catch (err) {
                console.error(`❌ Skipped record ${drama.id}: ${err.message}`);
            }
        }
        console.log('✅ Slug population complete.');

        // 3. Add unique index if it doesn't exist
        try {
            console.log('Step 3: Checking unique index...');
            const [existingIndexes] = await queryInterface.sequelize.query(
                "SHOW INDEX FROM dramas WHERE Key_name = 'dramas_slug_unique'"
            );

            if (existingIndexes.length === 0) {
                await queryInterface.addIndex('dramas', ['slug'], {
                    unique: true,
                    name: 'dramas_slug_unique'
                });
                console.log('✅ Unique index added.');
            } else {
                console.log('ℹ️ Unique index already exists.');
            }
        } catch (error) {
            console.log('⚠️ Index step skip/info:', error.message);
        }
    },

    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.removeIndex('dramas', 'dramas_slug_unique');
        } catch (e) {
            console.log('Skipped index removal');
        }
        try {
            await queryInterface.removeColumn('dramas', 'slug');
        } catch (e) {
            console.log('Skipped column removal');
        }
    }
};
