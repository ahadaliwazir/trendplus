/**
 * Scrape drama ratings and vote counts from IMDb
 * 
 * This script updates the dramas table with:
 * - imdb_rating
 * - vote_count
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
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Scrape rating and votes from IMDb search results
 */
async function scrapeDramaData(title, year) {
    try {
        // Search with title and year for better accuracy
        const searchUrl = `https://www.imdb.com/find?q=${encodeURIComponent(title + ' ' + year)}&s=tt&ttype=tv`;

        console.log(`   Searching: ${searchUrl}`);

        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': getRandomAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Referer': 'https://www.imdb.com/',
                'DNT': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);

        // Get first result item
        const firstResult = $('.ipc-metadata-list-summary-item').first();

        if (!firstResult.length) {
            console.log(`   ⚠️ No search results for "${title}"`);
            return null;
        }

        const titleText = firstResult.find('a.ipc-title-link-wrapper').text();
        console.log(`   Found: ${titleText}`);

        let imdb_rating = null;
        let vote_count = null;

        // Extract rating from search result
        const ratingEl = firstResult.find('.ipc-rating-star--rating');
        if (ratingEl.length) {
            imdb_rating = parseFloat(ratingEl.text());
        }

        // Extract vote count from search result
        const votesEl = firstResult.find('.ipc-rating-star--voteCount');
        if (votesEl.length) {
            vote_count = votesEl.text().trim().replace(/[()]/g, '').trim();
        }

        return { imdb_rating, vote_count };
    } catch (error) {
        console.error(`   IMDb error for ${title}:`, error.message);
        return null;
    }
}

/**
 * Main function
 */
async function main() {
    console.log('⭐ Drama Ratings Scraper');
    console.log('========================\n');

    try {
        await db.sequelize.authenticate();
        console.log('✅ Database connected.\n');

        // Fetch all dramas
        const dramas = await db.Drama.findAll({
            order: [['id', 'ASC']]
        });

        console.log(`📊 Found ${dramas.length} dramas to process.\n`);

        let updatedCount = 0;

        for (const drama of dramas) {
            // Random jitter in delay
            const jitter = Math.floor(Math.random() * 2000);
            await delay(2000 + jitter);

            console.log(`\n[${drama.id}] ${drama.title} (${drama.year})`);

            const data = await scrapeDramaData(drama.title, drama.year);

            if (data && (data.imdb_rating !== null || data.vote_count !== null)) {
                const updates = {};
                if (data.imdb_rating !== null) updates.imdb_rating = data.imdb_rating;
                if (data.vote_count !== null) updates.vote_count = data.vote_count;

                if (Object.keys(updates).length > 0) {
                    await drama.update(updates);
                    updatedCount++;
                    console.log(`   ✅ Updated: Rating: ${data.imdb_rating}, Votes: ${data.vote_count}`);
                }
            } else {
                console.log('   ⚠️ No data updated');
            }
        }

        console.log('\n========================');
        console.log('📊 Summary:');
        console.log(`   Dramas processed: ${dramas.length}`);
        console.log(`   Dramas updated: ${updatedCount}`);
        console.log('========================\n');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await db.sequelize.close();
        console.log('✅ Database connection closed.');
    }
}

main();
