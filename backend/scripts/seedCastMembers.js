/**
 * Scrape and seed cast members for all dramas in the database
 * 
 * This script:
 * 1. Parses existing `cast_names` text field and creates CastMember + drama_cast entries
 * 2. For dramas without cast, attempts to scrape from IMDb
 */

const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../src/models');
const { Op } = require('sequelize');

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

const getRandomAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

// Delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Parse cast_names string and create CastMember entries + link to drama
 */
async function processCastNamesField(drama) {
    if (!drama.cast_names || drama.cast_names.trim() === '') {
        return 0;
    }

    const castNames = drama.cast_names
        .split(',')
        .map(name => name.trim())
        .filter(name => name.length > 0 && name.length < 100);

    if (castNames.length === 0) return 0;

    let addedCount = 0;

    for (const name of castNames) {
        try {
            // Find or create the cast member
            const [castMember] = await db.CastMember.findOrCreate({
                where: { name },
                defaults: { name, image_url: null }
            });

            // Check if already linked to this drama
            const existingLink = await db.sequelize.query(
                `SELECT * FROM drama_cast WHERE drama_id = ? AND cast_id = ?`,
                {
                    replacements: [drama.id, castMember.id],
                    type: db.sequelize.QueryTypes.SELECT
                }
            );

            if (existingLink.length === 0) {
                // Link cast member to drama
                await drama.addCast(castMember.id, {
                    through: { role_name: null, is_lead: false }
                });
                addedCount++;
            }
        } catch (error) {
            console.error(`   Error adding cast "${name}":`, error.message);
        }
    }

    return addedCount;
}

/**
 * Scrape cast from IMDb for a specific drama title
 */
async function scrapeImdbCast(title) {
    try {
        // Search IMDb for the drama
        const searchUrl = `https://www.imdb.com/find?q=${encodeURIComponent(title)}&s=tt&ttype=tv`;

        const { data } = await axios.get(searchUrl, {
            headers: {
                'User-Agent': getRandomAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            },
            timeout: 10000
        });

        const $ = cheerio.load(data);

        // Get first search result link
        const firstResult = $('a.ipc-metadata-list-summary-item__t').first();
        if (!firstResult.length) {
            return [];
        }

        const detailUrl = 'https://www.imdb.com' + firstResult.attr('href').split('?')[0];

        // Fetch the detail page
        await delay(500);
        const { data: detailData } = await axios.get(detailUrl, {
            headers: {
                'User-Agent': getRandomAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            },
            timeout: 10000
        });

        const $detail = cheerio.load(detailData);

        // Extract cast from detail page
        const cast = [];

        // Try multiple selectors for cast
        $detail('a[href*="/name/"]').each((_, el) => {
            const name = $detail(el).text().trim();
            // Filter out common non-cast items
            if (name && name.length > 2 && name.length < 50 &&
                !name.includes('IMDb') &&
                !name.includes('See production') &&
                !name.includes('More') &&
                !cast.includes(name)) {
                cast.push(name);
            }
        });

        // Return first 10 unique cast members
        return [...new Set(cast)].slice(0, 10);

    } catch (error) {
        console.error(`   IMDb scrape error for "${title}":`, error.message);
        return [];
    }
}

/**
 * Main function
 */
async function main() {
    console.log('🎬 Cast Member Seeding Script');
    console.log('================================\n');

    try {
        await db.sequelize.authenticate();
        console.log('✅ Database connected.\n');

        // Get all dramas
        const dramas = await db.Drama.findAll({
            include: [{
                model: db.CastMember,
                as: 'cast',
                attributes: ['id']
            }],
            order: [['id', 'ASC']]
        });

        console.log(`📊 Found ${dramas.length} dramas in database.\n`);

        let processedCount = 0;
        let castAddedCount = 0;
        let scrapedCount = 0;

        for (const drama of dramas) {
            console.log(`\n[${drama.id}] ${drama.title}`);

            // Check if drama already has cast linked
            if (drama.cast && drama.cast.length > 0) {
                console.log(`   ✓ Already has ${drama.cast.length} cast members linked`);
                processedCount++;
                continue;
            }

            // First, try to process existing cast_names field
            if (drama.cast_names && drama.cast_names.trim()) {
                console.log(`   📝 Processing cast_names: "${drama.cast_names.substring(0, 50)}..."`);
                const added = await processCastNamesField(drama);
                if (added > 0) {
                    console.log(`   ✅ Added ${added} cast members from cast_names`);
                    castAddedCount += added;
                    processedCount++;
                    continue;
                }
            }

            // If no cast_names, try to scrape from IMDb
            console.log(`   🔍 Scraping from IMDb...`);
            const scrapedCast = await scrapeImdbCast(drama.title);

            if (scrapedCast.length > 0) {
                console.log(`   Found ${scrapedCast.length} cast members: ${scrapedCast.slice(0, 3).join(', ')}...`);

                // Update cast_names field
                await drama.update({ cast_names: scrapedCast.join(', ') });

                // Process and link cast
                const added = await processCastNamesField(drama);
                castAddedCount += added;
                scrapedCount++;
                console.log(`   ✅ Scraped and added ${added} cast members`);
            } else {
                console.log(`   ⚠️ No cast found`);
            }

            processedCount++;

            // Rate limiting
            await delay(1000);
        }

        console.log('\n================================');
        console.log('📊 Summary:');
        console.log(`   Total dramas processed: ${processedCount}`);
        console.log(`   Cast members added: ${castAddedCount}`);
        console.log(`   Dramas scraped from IMDb: ${scrapedCount}`);
        console.log('================================\n');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await db.sequelize.close();
        console.log('✅ Database connection closed.');
    }
}

main();
