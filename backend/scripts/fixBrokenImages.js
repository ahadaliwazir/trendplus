const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../src/models');

// User agent for requests
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
};

async function searchIMDbImage(title) {
    try {
        const searchUrl = `https://www.imdb.com/find/?q=${encodeURIComponent(title + ' Pakistani drama')}&s=tt&ttype=tv`;
        const response = await axios.get(searchUrl, { headers, timeout: 15000 });
        const $ = cheerio.load(response.data);

        // Find first result image
        const firstResult = $('a[href*="/title/tt"]').first();
        if (firstResult.length) {
            const img = firstResult.find('img').attr('src');
            if (img && img.includes('amazon')) {
                // Get higher resolution image
                return img.replace(/_V1_.*\.jpg/, '_V1_FMjpg_UX500_.jpg');
            }

            // Try to get from detail page
            const href = firstResult.attr('href');
            const imdbId = href.match(/\/title\/(tt\d+)/)?.[1];
            if (imdbId) {
                const detailResponse = await axios.get(`https://www.imdb.com/title/${imdbId}/`, { headers, timeout: 15000 });
                const $detail = cheerio.load(detailResponse.data);
                const posterImg = $detail('[data-testid="hero-media__poster"] img').attr('src') ||
                    $detail('meta[property="og:image"]').attr('content');
                if (posterImg) {
                    return posterImg.replace(/_V1_.*\.jpg/, '_V1_FMjpg_UX500_.jpg');
                }
            }
        }
        return null;
    } catch (error) {
        console.error(`   IMDb search error for ${title}:`, error.message);
        return null;
    }
}

async function main() {
    console.log('🔧 Drama Image Fixer');
    console.log('====================\n');

    try {
        await db.sequelize.authenticate();
        console.log('✅ Database connected.\n');

        // Find dramas with broken images (harpalgeo.tv or placeholder)
        const dramasToFix = await db.Drama.findAll({
            where: {
                [db.Sequelize.Op.or]: [
                    { image_url: { [db.Sequelize.Op.like]: '%harpalgeo.tv%' } },
                    { image_url: { [db.Sequelize.Op.like]: '%placeholder%' } },
                    { image_url: null },
                    { image_url: '' }
                ]
            },
            attributes: ['id', 'title', 'image_url']
        });

        console.log(`📊 Found ${dramasToFix.length} dramas with potentially broken images\n`);

        let fixed = 0, failed = 0;

        for (const drama of dramasToFix) {
            console.log(`🔍 Processing: ${drama.title}`);

            const newImageUrl = await searchIMDbImage(drama.title);

            if (newImageUrl) {
                await drama.update({ image_url: newImageUrl });
                console.log(`   ✅ Fixed: ${newImageUrl.substring(0, 60)}...`);
                fixed++;
            } else {
                console.log(`   ⚠️ Could not find image on IMDb`);
                failed++;
            }

            // Respectful delay
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        console.log(`\n====================`);
        console.log(`✅ Fixed: ${fixed}`);
        console.log(`⚠️ Failed: ${failed}`);
        console.log(`📊 Total: ${dramasToFix.length}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await db.sequelize.close();
    }
}

main();
