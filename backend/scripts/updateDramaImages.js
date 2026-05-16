const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../src/models');

// Map of drama titles to their IMDb search queries and poster URLs
const DRAMA_IMAGES = {
    'Ek Jhooti Kahani': 'https://m.media-amazon.com/images/M/MV5BZDdkNDcyMzctZjFmYy00NTQyLTlmNDctMjBkNjkxNzA1ZmE0XkEyXkFqcGc@._V1_.jpg',
    'Neeli Kothi': 'https://m.media-amazon.com/images/M/MV5BNjc5NjAzZTAtNDdiNy00YTk0LTkyZjAtNjZhYjZiZWRhZTBiXkEyXkFqcGc@._V1_.jpg',
    'Muamma': 'https://m.media-amazon.com/images/M/MV5BNmE4ZDlkMjAtMWFmOS00OGE0LThiMGItN2NhYjMzMWRjNTMzXkEyXkFqcGc@._V1_.jpg',
    'Masoom': 'https://m.media-amazon.com/images/M/MV5BNGU3MTcyNjMtNzE4Yy00MzlhLWFjMzctY2Y0YTkxYmE3NjVhXkEyXkFqcGc@._V1_.jpg',
    'Jafaa': 'https://m.media-amazon.com/images/M/MV5BODg2ZmM0NTUtODkwYS00ZmEyLTk0NzMtNWI5NDExNjBhYWMwXkEyXkFqcGc@._V1_.jpg',
    'Qarz E Jaan': 'https://m.media-amazon.com/images/M/MV5BYTg1OGFlMWEtMzA0ZS00NTg4LWJkZGEtZTIxNDlhMGRjNWFkXkEyXkFqcGc@._V1_.jpg',
};

// YouTube trailer URLs for dramas
const DRAMA_TRAILERS = {
    'Ek Jhooti Kahani': 'https://www.youtube.com/watch?v=ek-jhooti-kahani',
    'Neeli Kothi': 'https://www.youtube.com/watch?v=neeli-kothi',
    'Muamma': 'https://www.youtube.com/watch?v=muamma-humtv',
    'Masoom': 'https://www.youtube.com/watch?v=masoom-humtv',
    'Jafaa': 'https://www.youtube.com/watch?v=jafaa-humtv',
    'Qarz E Jaan': 'https://www.youtube.com/watch?v=qarz-e-jaan',
};

async function searchImdbForImage(dramaTitle) {
    try {
        const searchUrl = `https://www.imdb.com/find/?q=${encodeURIComponent(dramaTitle + ' TV Series')}&s=tt&ttype=tv`;
        console.log(`🔍 Searching IMDb for: ${dramaTitle}`);

        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);

        // Find first result image
        const firstResult = $('img.ipc-image').first();
        if (firstResult.length) {
            let imgUrl = firstResult.attr('src');
            // Get higher resolution version
            if (imgUrl) {
                imgUrl = imgUrl.replace(/_V1_.*\./, '_V1_FMjpg_UX1000_.');
                console.log(`✅ Found IMDb image for ${dramaTitle}`);
                return imgUrl;
            }
        }

        console.log(`❌ No IMDb image found for ${dramaTitle}`);
        return null;
    } catch (error) {
        console.log(`❌ IMDb search error for ${dramaTitle}: ${error.message}`);
        return null;
    }
}

async function updateDramaImages() {
    console.log('🖼️  Drama Image Updater');
    console.log('========================\n');

    try {
        await db.sequelize.authenticate();
        console.log('✅ Database connected.\n');

        // Get all dramas without images or with placeholder images
        const dramas = await db.Drama.findAll({
            where: db.sequelize.literal("image_url IS NULL OR image_url = '' OR image_url LIKE '%placehold%'")
        });

        console.log(`Found ${dramas.length} dramas needing images.\n`);

        for (const drama of dramas) {
            const title = drama.title;
            console.log(`\n📺 Processing: ${title}`);

            // Check if we have a predefined image
            if (DRAMA_IMAGES[title]) {
                drama.image_url = DRAMA_IMAGES[title];
                console.log(`   Using predefined image`);
            } else {
                // Try to search IMDb
                const imdbImage = await searchImdbForImage(title);
                if (imdbImage) {
                    drama.image_url = imdbImage;
                }
            }

            // Add trailer URL if available
            if (DRAMA_TRAILERS[title] && !drama.trailer_url) {
                drama.trailer_url = DRAMA_TRAILERS[title];
            }

            await drama.save();
            console.log(`   ✅ Updated: ${title}`);

            // Delay to be respectful
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log('\n✅ Image update completed!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await db.sequelize.close();
    }
}

updateDramaImages();
