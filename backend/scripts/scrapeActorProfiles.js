/**
 * Scrape actor profile data (photos, bios) from Wikipedia/IMDb
 * 
 * This script updates the cast_members table with:
 * - image_url (actor photo)
 * - bio (short biography)
 * - birth_date
 * - birth_place
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
 * Scrape actor data from Wikipedia
 */
async function scrapeWikipedia(actorName) {
    try {
        // Search Wikipedia for the actor
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(actorName + ' Pakistani actor')}&limit=1&format=json`;

        const { data: searchResults } = await axios.get(searchUrl, {
            headers: { 'User-Agent': getRandomAgent() },
            timeout: 10000
        });

        if (!searchResults[3] || searchResults[3].length === 0) {
            return null;
        }

        const pageUrl = searchResults[3][0];

        // Fetch the Wikipedia page
        const { data: pageHtml } = await axios.get(pageUrl, {
            headers: { 'User-Agent': getRandomAgent() },
            timeout: 10000
        });

        const $ = cheerio.load(pageHtml);

        // Extract info from infobox
        let image_url = null;
        let bio = null;
        let birth_date = null;
        let birth_place = null;

        // Get image from infobox
        const infoboxImage = $('.infobox-image img').first();
        if (infoboxImage.length) {
            let imgSrc = infoboxImage.attr('src');
            if (imgSrc && imgSrc.startsWith('//')) {
                imgSrc = 'https:' + imgSrc;
            }
            // Get higher resolution
            imgSrc = imgSrc?.replace(/\/\d+px-/, '/400px-');
            image_url = imgSrc;
        }

        // Get birth date
        const bday = $('.bday').first().text();
        if (bday) {
            birth_date = bday; // Format: YYYY-MM-DD
        }

        // Get birth place
        const birthplaceRow = $('.infobox th:contains("Born")').first().parent();
        const birthplaceText = birthplaceRow.find('.birthplace').text() ||
            birthplaceRow.find('td').text();
        if (birthplaceText) {
            // Extract place from text (usually after date)
            const placeParts = birthplaceText.split('\n').filter(p => p.trim());
            if (placeParts.length > 1) {
                birth_place = placeParts.slice(1).join(', ').trim().substring(0, 200);
            }
        }

        // Get first paragraph as bio
        const firstParagraph = $('p').filter((_, el) => {
            const text = $(el).text().trim();
            return text.length > 50 && !text.startsWith('Coordinates');
        }).first();

        if (firstParagraph.length) {
            bio = firstParagraph.text()
                .replace(/\[\d+\]/g, '') // Remove citation references
                .replace(/\s+/g, ' ')
                .trim()
                .substring(0, 1000);
        }

        return { image_url, bio, birth_date, birth_place };
    } catch (error) {
        console.error(`   Wikipedia error for ${actorName}:`, error.message);
        return null;
    }
}

/**
 * Scrape actor data from IMDb
 */
async function scrapeImdb(actorName) {
    try {
        // Search IMDb for the actor
        const searchUrl = `https://www.imdb.com/find?q=${encodeURIComponent(actorName)}&s=nm`;

        const { data: searchHtml } = await axios.get(searchUrl, {
            headers: {
                'User-Agent': getRandomAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            },
            timeout: 10000
        });

        const $search = cheerio.load(searchHtml);

        // Get first result link
        const firstResult = $search('a.ipc-metadata-list-summary-item__t').first();
        if (!firstResult.length) {
            return null;
        }

        const profilePath = firstResult.attr('href');
        const profileUrl = `https://www.imdb.com${profilePath.split('?')[0]}`;

        await delay(500);

        // Fetch actor profile page
        const { data: profileHtml } = await axios.get(profileUrl, {
            headers: {
                'User-Agent': getRandomAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            timeout: 10000
        });

        const $ = cheerio.load(profileHtml);

        let image_url = null;
        let bio = null;
        let birth_date = null;
        let birth_place = null;

        // Get profile image
        const posterImg = $('img.ipc-image').first();
        if (posterImg.length) {
            let imgSrc = posterImg.attr('src');
            // Get higher resolution
            if (imgSrc) {
                imgSrc = imgSrc.replace(/_V1_.*\.jpg$/, '_V1_FMjpg_UX400_.jpg');
                image_url = imgSrc;
            }
        }

        // Get biography snippet
        const bioSection = $('[data-testid="mini-bio"]').first();
        if (bioSection.length) {
            bio = bioSection.text().trim().substring(0, 1000);
        }

        return { image_url, bio, birth_date, birth_place };
    } catch (error) {
        console.error(`   IMDb error for ${actorName}:`, error.message);
        return null;
    }
}

/**
 * Main function
 */
async function main() {
    console.log('🎭 Actor Profile Scraper');
    console.log('========================\n');

    try {
        await db.sequelize.authenticate();
        console.log('✅ Database connected.\n');

        // Get actors without images or bios
        const actors = await db.CastMember.findAll({
            where: {
                [Op.or]: [
                    { image_url: null },
                    { image_url: '' },
                    { bio: null }
                ]
            },
            order: [['id', 'ASC']],
            limit: 100 // Process in batches
        });

        console.log(`📊 Found ${actors.length} actors to update.\n`);

        let updatedCount = 0;

        for (const actor of actors) {
            console.log(`\n[${actor.id}] ${actor.name}`);

            // Try Wikipedia first
            let data = await scrapeWikipedia(actor.name);

            if (!data || (!data.image_url && !data.bio)) {
                // Fallback to IMDb
                console.log('   Trying IMDb...');
                await delay(1000);
                data = await scrapeImdb(actor.name);
            }

            if (data) {
                const updates = {};
                if (data.image_url && !actor.image_url) {
                    updates.image_url = data.image_url;
                }
                if (data.bio && !actor.bio) {
                    updates.bio = data.bio;
                }
                if (data.birth_date && !actor.birth_date) {
                    updates.birth_date = data.birth_date;
                }
                if (data.birth_place && !actor.birth_place) {
                    updates.birth_place = data.birth_place;
                }

                if (Object.keys(updates).length > 0) {
                    await actor.update(updates);
                    updatedCount++;
                    console.log(`   ✅ Updated: ${Object.keys(updates).join(', ')}`);
                } else {
                    console.log('   ⚠️ No new data found');
                }
            } else {
                console.log('   ⚠️ No data found');
            }

            // Rate limiting
            await delay(1500);
        }

        console.log('\n========================');
        console.log('📊 Summary:');
        console.log(`   Actors processed: ${actors.length}`);
        console.log(`   Actors updated: ${updatedCount}`);
        console.log('========================\n');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await db.sequelize.close();
        console.log('✅ Database connection closed.');
    }
}

main();
