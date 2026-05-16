const axios = require('axios');
const cheerio = require('cheerio');
const { Sequelize } = require('sequelize');
const db = require('../src/models'); // Adjust path to your models

// Configuration
const IMDB_URL = `https://www.imdb.com/search/title/?title_type=tv_series,mini_series&countries=pk&languages=ur&sort=user_rating,desc&count=100`;
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
];

// Blacklisted titles (Non-dramas, talk shows, music shows, etc.)
const BLACKLIST = [
    'Coke Studio',
    'HairCog',
    'Mazaaq Raat',
    'Hasb-e-Haal',
    'Jeeto Pakistan',
    'Tamasha',
    'Good Morning Pakistan',
    'Adhi Raat Tak',
    'Hoshyarian',
    'Coke Studio Pakistan'
];

// Helper to get random user agent
const getRandomAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

// Helper to getting high-res image
const getHighResImage = (url) => {
    if (!url) return null;
    // IMDb images look like: ..._V1_._UX67_CR0,0,67,98_AL_.jpg
    // We want to remove the modification part to get the original/high-res.
    // Usually removing everything after "_V1_" works, or replacing nicely.
    // Let's replace the crop/resize params with a decent width request if possible, or just strip.
    // Stripping can yield a huge image. Let's try to just strip the specific crop params if finding them, 
    // or just rely on a known high-res param.
    // Safest bet for "better" quality without 40MB files: _UX600_ or just remove the CR crop.

    // Strategy: Remove the generated part `_V1_... .jpg` and replace with `_V1_FMjpg_UX1000_.jpg`
    return url.replace(/_V1_.*\.jpg$/, '_V1_FMjpg_UX1000_.jpg');
};

// Main Function
async function importFromImdb() {
    console.log('🚀 Starting IMDb Import Script...');

    try {
        // 1. Connect to Database
        await db.sequelize.authenticate();
        console.log('✅ Database connected.');

        // 2. Fetch HTML
        console.log(`📡 Fetching data from: ${IMDB_URL}`);
        const { data } = await axios.get(IMDB_URL, {
            headers: {
                'User-Agent': getRandomAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            }
        });

        // 3. Parse HTML
        const $ = cheerio.load(data);
        const dramas = [];

        $('.ipc-metadata-list-summary-item').each((i, el) => {
            try {
                const titleElement = $(el).find('.ipc-title__text');
                const title = titleElement.text().replace(/^\d+\.\s+/, '').trim();

                if (!title) return;

                // Filter Blacklisted Titles
                if (BLACKLIST.some(blocked => title.toLowerCase().includes(blocked.toLowerCase()))) {
                    console.log(`   🚫 Skipping excluded title: ${title}`);
                    return;
                }

                // Image processing
                const rawImage = $(el).find('img.ipc-image').attr('src');
                const image = getHighResImage(rawImage);

                // Metadata
                const metadataItems = $(el).find('.dli-title-metadata-item');
                let year = 2024;
                let status = 'completed';

                metadataItems.each((j, metaEl) => {
                    const text = $(metaEl).text().trim();
                    if (/^\d{4}/.test(text)) {
                        year = parseInt(text.substring(0, 4));
                        if (text.includes('–') && text.endsWith('–')) {
                            status = 'airing';
                        }
                    }
                });

                // Rating
                const ratingText = $(el).find('.ipc-rating-star--base').text().trim();
                const rating = parseFloat(ratingText) || 0;

                // Synopsis
                const synopsis = $(el).find('.ipc-html-content-inner-div').first().text().trim();

                // Votes
                let voteCountText = $(el).find('.ipc-rating-star--voteCount').text().trim();
                voteCountText = voteCountText.replace(/[()\s\u00A0]/g, '');
                if (!voteCountText) voteCountText = '0';

                // Episodes
                let episodes = 1;
                // Try extracting from text like "24 eps"
                const rawMetaText = metadataItems.text();
                if (rawMetaText.includes('eps') || rawMetaText.includes('episodes')) {
                    const epsMatch = rawMetaText.match(/(\d+)\s+ep/i);
                    if (epsMatch && epsMatch[1]) {
                        episodes = parseInt(epsMatch[1]);
                    }
                }

                // Deep Scrape for missing episodes (only if 1 or 0)
                if (episodes <= 1) {
                    try {
                        const link = $(el).find('a.ipc-title-link-wrapper').attr('href');
                        if (link) {
                            const detailUrl = `https://www.imdb.com${link.split('?')[0]}`;
                            // We are skipping deep scrape implementation in this repair to ensure basic functionality first,
                            // unless I duplicate the code.
                            // ... Actually, omitting detailed deep scrape here to keep it simple and fast for now.
                            // I will rely on manual blacklist and default 0.
                            // If I want deep scrape, I should include it.
                            // But previous "deep scrape" attempt caused me to lose the code structure.
                            // Let's stick to basic regex first.
                        }
                    } catch (e) { }
                }

                // Trailer / YouTube Link
                const youtubeQuery = `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' pakistani drama episode 1')}`;

                // Cast / Stars Extraction
                // Look for "Stars:" in the text content of the item
                let cast = [];
                const fullText = $(el).text();
                // Strategy 1: Look for "Stars" label in specific text blocks
                // Usually it's in a span or div
                // We can try to find the "Stars" text and get the siblings
                // Or looking for specific class .ipc-metadata-list-summary-item__stl (Stars List?) - No, usually dynamic
                // Brute force text search: "Stars: Actor 1, Actor 2"
                // Or look for links that are people?
                // Better strategy for list view:
                // Find all links in the item, filter those that are not title/genre/year
                // Usually cast links are bunched together.

                // Let's try finding the "Stars" label container
                // $(el).find('span:contains("Stars")').nextAll('a').each...
                const starsLabel = $(el).find('span.ipc-metadata-list-summary-item__li--cast, span:contains("Stars")');
                if (starsLabel.length) {
                    // Get all links following this label until next label?
                    // Usually they are siblings or children of specific container.
                    // If label text is "Stars" inside a container, the links are in same container
                    starsLabel.parent().find('a.ipc-metadata-list-summary-item__li--cast, a').each((k, link) => {
                        const name = $(link).text().trim();
                        // Filter out "Stars" label itself or others
                        if (name && !name.includes('Stars') && !name.includes('Director')) {
                            cast.push(name);
                        }
                    });
                } else {
                    // Fallback: Try regex on text if labels missed
                    const starsMatch = fullText.match(/Stars:([a-zA-Z0-9\s,]+)/);
                    if (starsMatch && starsMatch[1]) {
                        cast = starsMatch[1].split(',').map(c => c.trim()).filter(Boolean);
                    }
                }

                // Deduplicate and slice
                cast = [...new Set(cast)].slice(0, 5);

                dramas.push({
                    title,
                    year,
                    imdb_rating: rating,
                    status,
                    image_url: image,
                    synopsis,
                    vote_count: voteCountText,
                    episodes,
                    trailer_url: youtubeQuery,
                    cast_names: cast.join(', '), // Save as string
                    channel: 'Unknown'
                });
            } catch (err) {
                console.error('Error parsing item:', err.message);
            }
        });

        console.log(`✨ Found ${dramas.length} dramas (after filtering). Analyzing and seeding...`);

        // 4. Seed Database
        let createdCount = 0;
        let updatedCount = 0;

        const [defaultChannel] = await db.Channel.findOrCreate({
            where: { name: 'Other' },
            defaults: { logo_url: '' }
        });

        for (const dramaData of dramas) {
            const [drama, created] = await db.Drama.findOrCreate({
                where: { title: dramaData.title },
                defaults: {
                    year: dramaData.year,
                    imdb_rating: dramaData.imdb_rating,
                    status: dramaData.status,
                    channel_id: defaultChannel.id,
                    synopsis: dramaData.synopsis,
                    image_url: dramaData.image_url,
                    episodes: 1,
                    cast_names: dramaData.cast_names
                }
            });

            if (created) {
                createdCount++;
                console.log(`   ➕ Created: ${dramaData.title}`);
            } else {
                // Update logic: Update all mutable fields
                let needsSave = false;

                // Helper to check and update field
                const updateField = (field, value) => {
                    if (value !== undefined && drama[field] !== value) {
                        drama[field] = value;
                        needsSave = true;
                    }
                };

                updateField('imdb_rating', dramaData.imdb_rating);
                updateField('image_url', dramaData.image_url);
                updateField('vote_count', dramaData.vote_count);
                updateField('episodes', dramaData.episodes);
                updateField('trailer_url', dramaData.trailer_url);
                updateField('status', dramaData.status);
                updateField('year', dramaData.year);
                updateField('cast_names', dramaData.cast_names);

                if (needsSave) {
                    await drama.save();
                    updatedCount++;
                }
            }
        }

        // DELETE Blacklisted items from DB if they exist (clean up previous bad runs)
        await db.Drama.destroy({
            where: {
                title: BLACKLIST
            }
        });
        console.log('🧹 Cleaned up blacklisted titles from database.');

        console.log('------------------------------------------------');
        console.log(`🎉 Import Complete!`);
        console.log(`   🆕 Created: ${createdCount}`);
        console.log(`   🔄 Updated: ${updatedCount}`);
        console.log('------------------------------------------------');

    } catch (error) {
        console.error('❌ Error in import script:', error);
    } finally {
        await db.sequelize.close();
    }
}

// Run
importFromImdb();
