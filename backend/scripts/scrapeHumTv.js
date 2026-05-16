const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../src/models');

// Base URL for latest dramas
const LATEST_DRAMAS_URL = 'https://hum.tv/latest-dramas/';

async function getDramaUrls() {
    try {
        console.log(`🔍 Fetching latest drama list from: ${LATEST_DRAMAS_URL}`);
        const response = await axios.get(LATEST_DRAMAS_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 15000
        });

        const $ = cheerio.load(response.data);
        const urls = [];

        $('.drama_page .wpb_wrapper a').each((_, el) => {
            let url = $(el).attr('href');
            if (url && (url.includes('/dramas/') || url.includes('/category/dramas/'))) {
                // Clean URL (remove trailing slash for consistency if needed, but the scraper handles it)
                if (!urls.includes(url)) {
                    urls.push(url);
                }
            }
        });

        console.log(`✅ Found ${urls.length} drama URLs.`);
        return urls;
    } catch (error) {
        console.error('❌ Error fetching drama URLs:', error.message);
        return [];
    }
}

async function fetchDramaDetails(url) {
    try {
        console.log(`\n📥 Fetching: ${url}`);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 15000
        });

        const $ = cheerio.load(response.data);

        // Extract drama title from page
        const title = $('h1.entry-title').text().trim() ||
            $('title').text().replace(' - Hum TV', '').trim();

        // Extract image - try multiple selectors
        let imageUrl = null;
        const imgSelectors = [
            '.drama-poster img',
            '.single-drama-poster img',
            '.entry-content img',
            '.wp-post-image',
            'article img',
            '.single-drama img'
        ];

        for (const selector of imgSelectors) {
            const img = $(selector).first();
            if (img.length) {
                imageUrl = img.attr('src') || img.attr('data-src');
                if (imageUrl) break;
            }
        }

        // Check for background image in style tags or inline styles
        if (!imageUrl) {
            // Try regex on the whole response data for the specific background URL
            const pageSource = response.data;
            // Look for .betube__cat_description { background: url(...) } or background-image: url(...)
            // Refined regex to capture only the URL and handle potential trailing content
            const bgRegex = /\.betube__cat_description\s*\{[^}]*background(?:-image)?:\s*url\(['"]?([^'"\)]+)['"]?\)/i;
            const match = pageSource.match(bgRegex);

            if (match && match[1]) {
                imageUrl = match[1];
            } else {
                // Fallback to inline style if available
                const bgElement = $('.secBg.betube__cat_description');
                if (bgElement.length) {
                    const bgStyle = bgElement.attr('style');
                    if (bgStyle && bgStyle.includes('background-image')) {
                        const inlineMatch = bgStyle.match(/url\(['"]?([^'"]+)['"]?\)/);
                        if (inlineMatch && inlineMatch[1]) {
                            imageUrl = inlineMatch[1];
                        }
                    }
                }
            }
        }

        // Try to get from og:image meta tag
        if (!imageUrl) {
            imageUrl = $('meta[property="og:image"]').attr('content');
        }

        // Extract cast members
        const cast = [];
        $('a[href*="/cast/"]').each((_, el) => {
            const name = $(el).text().trim();
            if (name && !cast.includes(name)) {
                cast.push(name);
            }
        });

        // Extract writer
        let writer = null;
        $('a[href*="/writer/"]').each((_, el) => {
            writer = $(el).text().trim();
        });

        // Extract director
        let director = null;
        $('a[href*="/director/"]').each((_, el) => {
            director = $(el).text().trim();
        });

        // Extract producer
        let producer = null;
        $('a[href*="/producer/"]').each((_, el) => {
            producer = $(el).text().trim();
        });

        // Extract synopsis/description
        let synopsis = $('meta[property="og:description"]').attr('content') ||
            $('meta[name="description"]').attr('content') ||
            '';

        // Try to find YouTube trailer
        let trailerUrl = null;
        $('iframe[src*="youtube"]').each((_, el) => {
            const src = $(el).attr('src');
            if (src) {
                // Convert embed URL to watch URL
                const match = src.match(/embed\/([a-zA-Z0-9_-]+)/);
                if (match) {
                    trailerUrl = `https://www.youtube.com/watch?v=${match[1]}`;
                }
            }
        });

        const drama = {
            title,
            imageUrl,
            cast: cast.slice(0, 10), // Limit to 10 cast members
            writer,
            director,
            producer,
            synopsis,
            trailerUrl,
            channel: 'Hum TV',
            status: 'airing',
            year: new Date().getFullYear()
        };

        console.log(`✅ Found: ${title}`);
        console.log(`   Image: ${imageUrl ? '✓' : '✗'}`);
        console.log(`   Cast: ${cast.length} members`);
        console.log(`   Writer: ${writer || 'N/A'}`);
        console.log(`   Director: ${director || 'N/A'}`);

        return drama;
    } catch (error) {
        console.error(`❌ Error fetching ${url}:`, error.message);
        return null;
    }
}

async function saveToDatabase(drama) {
    try {
        // Check if drama already exists
        let existingDrama = await db.Drama.findOne({
            where: { title: drama.title }
        });

        if (existingDrama) {
            // Update existing drama
            await existingDrama.update({
                image_url: drama.imageUrl || existingDrama.image_url,
                synopsis: drama.synopsis || existingDrama.synopsis,
                trailer_url: drama.trailerUrl || existingDrama.trailer_url,
                cast_names: drama.cast.join(', ') || existingDrama.cast_names,
                status: drama.status,
                updated_at: new Date()
            });
            console.log(`   📝 Updated: ${drama.title}`);
            return existingDrama;
        } else {
            // Get Hum TV channel ID
            const humTv = await db.Channel.findOne({ where: { name: 'Hum TV' } });
            const channelId = humTv ? humTv.id : 3; // Default to 3 if not found

            // Create new drama
            const newDrama = await db.Drama.create({
                title: drama.title,
                year: drama.year,
                imdb_rating: 0,
                episodes: 1,
                status: drama.status,
                channel_id: channelId,
                synopsis: drama.synopsis,
                image_url: drama.imageUrl,
                trailer_url: drama.trailerUrl,
                cast_names: drama.cast.join(', ')
            });
            console.log(`   ✨ Created: ${drama.title}`);
            return newDrama;
        }
    } catch (error) {
        console.error(`   ❌ DB Error for ${drama.title}:`, error.message);
        return null;
    }
}

async function main() {
    console.log('🎬 Hum TV Drama Scraper');
    console.log('========================\n');

    try {
        await db.sequelize.authenticate();
        console.log('✅ Database connected.\n');

        const dramas = [];

        // Fetch all drama links first
        const dramaUrls = await getDramaUrls();

        if (dramaUrls.length === 0) {
            console.log('⚠️ No drama URLs found. Exiting.');
            return;
        }

        // Fetch all drama details
        for (const url of dramaUrls) {
            const drama = await fetchDramaDetails(url);
            if (drama) {
                dramas.push(drama);
            }
            // Add delay to be respectful
            await new Promise(resolve => setTimeout(resolve, 800));
        }

        console.log(`\n📊 Total dramas found: ${dramas.length}\n`);

        // Save to database
        console.log('💾 Saving to database...\n');
        for (const drama of dramas) {
            if (drama.title) {
                await saveToDatabase(drama);
            }
        }

        console.log('\n✅ Scraping completed!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await db.sequelize.close();
    }
}

main();
