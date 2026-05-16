const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../src/models');

// Base URL for Geo Entertainment Programs
const PROGRAMS_URL = 'https://harpalgeo.tv/programs';

// User agent to mimic browser
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive',
};

async function getDramaList() {
    try {
        console.log(`🔍 Fetching programs list from: ${PROGRAMS_URL}`);
        const response = await axios.get(PROGRAMS_URL, {
            headers,
            timeout: 30000
        });

        const $ = cheerio.load(response.data);
        const dramas = [];

        // Find all program links
        $('a[href*="/program/"]').each((_, el) => {
            const $el = $(el);
            const href = $el.attr('href');
            const title = $el.find('h4').text().trim() || $el.attr('title') || '';

            // Get background image from style
            let imageUrl = null;
            const styleDiv = $el.find('div div');
            const style = styleDiv.attr('style') || '';
            const bgMatch = style.match(/background-image:\s*url\(['"]?([^'"]+)['"]?\)/);
            if (bgMatch) {
                imageUrl = bgMatch[1];
            }

            // Try data-src or img tag
            if (!imageUrl) {
                const img = $el.find('img');
                imageUrl = img.attr('data-src') || img.attr('src');
            }

            if (title && href && !dramas.find(d => d.title === title)) {
                dramas.push({
                    title,
                    url: href.startsWith('http') ? href : `https://harpalgeo.tv${href}`,
                    imageUrl
                });
            }
        });

        console.log(`✅ Found ${dramas.length} programs.`);
        return dramas;
    } catch (error) {
        console.error('❌ Error fetching programs:', error.message);
        return [];
    }
}

async function fetchDramaDetails(drama) {
    try {
        console.log(`\n📥 Fetching details: ${drama.title}`);
        const response = await axios.get(drama.url, {
            headers,
            timeout: 20000
        });

        const $ = cheerio.load(response.data);

        // Extract synopsis from meta tag
        let synopsis = $('meta[property="og:description"]').attr('content') ||
            $('meta[name="description"]').attr('content') || '';

        // Try to get better image from og:image
        let imageUrl = drama.imageUrl || $('meta[property="og:image"]').attr('content');

        // Extract cast - Geo TV usually lists cast in specific sections
        const cast = [];
        $('a[href*="/cast/"], a[href*="/people/"]').each((_, el) => {
            const name = $(el).text().trim();
            if (name && name.length > 2 && name.length < 50 && !cast.includes(name)) {
                cast.push(name);
            }
        });

        // Try to find writer, director
        let writer = null;
        let director = null;

        $('a[href*="/writer/"]').each((_, el) => {
            if (!writer) writer = $(el).text().trim();
        });

        $('a[href*="/director/"]').each((_, el) => {
            if (!director) director = $(el).text().trim();
        });

        // Try to get year from page content
        let year = new Date().getFullYear();
        const yearMatch = $('body').text().match(/\b(202\d|201\d)\b/);
        if (yearMatch) {
            year = parseInt(yearMatch[1]);
        }

        // Find trailer URL
        let trailerUrl = null;
        $('iframe[src*="youtube"]').each((_, el) => {
            const src = $(el).attr('src');
            if (src) {
                const match = src.match(/embed\/([a-zA-Z0-9_-]+)/);
                if (match) {
                    trailerUrl = `https://www.youtube.com/watch?v=${match[1]}`;
                }
            }
        });

        const result = {
            title: drama.title,
            imageUrl,
            cast: cast.slice(0, 10),
            writer,
            director,
            synopsis,
            trailerUrl,
            channel: 'Geo Entertainment',
            status: 'airing',
            year
        };

        console.log(`   ✅ ${drama.title}`);
        console.log(`   Image: ${imageUrl ? '✓' : '✗'}`);
        console.log(`   Cast: ${cast.length} members`);

        return result;
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        // Return basic info even if details fetch fails
        return {
            title: drama.title,
            imageUrl: drama.imageUrl,
            cast: [],
            synopsis: '',
            channel: 'Geo Entertainment',
            status: 'airing',
            year: new Date().getFullYear()
        };
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
                cast_names: drama.cast.length > 0 ? drama.cast.join(', ') : existingDrama.cast_names,
                status: drama.status,
                updated_at: new Date()
            });
            console.log(`   📝 Updated: ${drama.title}`);
            return existingDrama;
        } else {
            // Get Geo Entertainment channel ID
            let geoChannel = await db.Channel.findOne({ where: { name: 'Geo Entertainment' } });

            // Create channel if it doesn't exist
            if (!geoChannel) {
                geoChannel = await db.Channel.create({
                    name: 'Geo Entertainment',
                    logo_url: 'https://upload.wikimedia.org/wikipedia/en/1/12/Geo_Entertainment_Logo.png'
                });
                console.log('   Created Geo Entertainment channel');
            }

            // Create new drama
            const newDrama = await db.Drama.create({
                title: drama.title,
                year: drama.year,
                imdb_rating: 0,
                episodes: 1,
                status: drama.status,
                channel_id: geoChannel.id,
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
    console.log('🎬 Geo Entertainment Drama Scraper');
    console.log('===================================\n');

    try {
        await db.sequelize.authenticate();
        console.log('✅ Database connected.\n');

        // Fetch program list
        const programList = await getDramaList();

        if (programList.length === 0) {
            console.log('⚠️ No programs found. Exiting.');
            return;
        }

        // Fetch details for each program
        const dramas = [];
        for (const program of programList) {
            const details = await fetchDramaDetails(program);
            if (details) {
                dramas.push(details);
            }
            // Respectful delay
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log(`\n📊 Total dramas processed: ${dramas.length}\n`);

        // Save to database
        console.log('💾 Saving to database...\n');
        let created = 0, updated = 0;
        for (const drama of dramas) {
            if (drama.title) {
                const result = await saveToDatabase(drama);
                if (result) {
                    if (result._options?.isNewRecord === false) updated++;
                    else created++;
                }
            }
        }

        console.log(`\n✅ Scraping completed!`);
        console.log(`   Created: ${created} | Updated: ${updated}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await db.sequelize.close();
    }
}

main();
