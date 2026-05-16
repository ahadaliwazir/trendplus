const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../src/models');

// Green Entertainment dramas list - curated from various sources
// Since their official website is unreachable, we'll use IMDb/Wikipedia data
const GREEN_DRAMAS = [
    { title: "Kabli Pulao", year: 2024, episodes: 35 },
    { title: "22 Qadam", year: 2023, episodes: 30 },
    { title: "Nauroz", year: 2023, episodes: 28 },
    { title: "Jeevan Nagar", year: 2023, episodes: 32 },
    { title: "Idiot", year: 2022, episodes: 25 },
    { title: "Working Women", year: 2022, episodes: 30 },
    { title: "Jindo", year: 2023, episodes: 28 },
    { title: "DuniyaPur", year: 2022, episodes: 32 },
    { title: "Ishq Beparwah", year: 2023, episodes: 25 },
    { title: "Iqtidar", year: 2022, episodes: 28 },
    { title: "Adhuri Kahani", year: 2023, episodes: 30 },
    { title: "Pyar Deewangi Hai", year: 2022, episodes: 35 },
    { title: "Fraud", year: 2022, episodes: 40 },
    { title: "Tinkay Ka Sahara", year: 2023, episodes: 32 },
    { title: "Mujhe Khuda Pe Yaqeen Hai", year: 2021, episodes: 28 },
    { title: "Aik Sitam Aur", year: 2022, episodes: 45 },
    { title: "Pehchaan", year: 2022, episodes: 35 },
    { title: "Badzaat", year: 2022, episodes: 42 },
    { title: "Dil-e-Momin", year: 2022, episodes: 50 },
    { title: "Khuda Aur Mohabbat Season 3", year: 2021, episodes: 39 }
];

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
};

async function searchIMDbForDrama(title) {
    try {
        // Search IMDb for the drama
        const searchUrl = `https://www.imdb.com/find/?q=${encodeURIComponent(title + ' Pakistani drama')}&s=tt&ttype=tv`;

        const response = await axios.get(searchUrl, {
            headers,
            timeout: 15000
        });

        const $ = cheerio.load(response.data);

        // Find first TV series result
        const firstResult = $('a[href*="/title/tt"]').first();
        if (firstResult.length) {
            const href = firstResult.attr('href');
            const imdbId = href.match(/\/title\/(tt\d+)/)?.[1];
            if (imdbId) {
                return `https://www.imdb.com/title/${imdbId}/`;
            }
        }
        return null;
    } catch (error) {
        console.error(`   IMDb search error: ${error.message}`);
        return null;
    }
}

async function fetchIMDbDetails(imdbUrl, baseTitle) {
    try {
        const response = await axios.get(imdbUrl, {
            headers,
            timeout: 15000
        });

        const $ = cheerio.load(response.data);

        // Extract rating
        let rating = 0;
        const ratingText = $('[data-testid="hero-rating-bar__aggregate-rating__score"] span').first().text();
        if (ratingText) {
            rating = parseFloat(ratingText) || 0;
        }

        // Extract vote count
        let voteCount = '';
        const votesText = $('[data-testid="hero-rating-bar__aggregate-rating__score"]').parent().find('span').last().text();
        if (votesText) {
            voteCount = votesText.replace(/[()]/g, '');
        }

        // Extract image
        let imageUrl = $('[data-testid="hero-media__poster"] img').attr('src') ||
            $('meta[property="og:image"]').attr('content');

        // Extract synopsis
        let synopsis = $('[data-testid="plot"]').text().trim() ||
            $('meta[property="og:description"]').attr('content') || '';

        // Extract cast
        const cast = [];
        $('[data-testid="title-cast-item"] a[data-testid="title-cast-item__actor"]').each((_, el) => {
            const name = $(el).text().trim();
            if (name && !cast.includes(name) && cast.length < 10) {
                cast.push(name);
            }
        });

        // Extract year
        let year = new Date().getFullYear();
        const yearMatch = $('title').text().match(/\((\d{4})\)/);
        if (yearMatch) {
            year = parseInt(yearMatch[1]);
        }

        return {
            title: baseTitle,
            imageUrl,
            rating,
            voteCount,
            synopsis,
            cast,
            year
        };
    } catch (error) {
        console.error(`   IMDb details error: ${error.message}`);
        return null;
    }
}

async function fetchFromGoogleImages(title) {
    // Fallback: Create a generic entry with placeholder
    return {
        title,
        imageUrl: `https://via.placeholder.com/300x450/1a1a1a/666666?text=${encodeURIComponent(title)}`,
        rating: 0,
        synopsis: `${title} - A Pakistani drama series on Green Entertainment.`,
        cast: [],
        year: new Date().getFullYear()
    };
}

async function saveToDatabase(drama, year, episodes) {
    try {
        // Check if drama already exists
        let existingDrama = await db.Drama.findOne({
            where: { title: drama.title }
        });

        if (existingDrama) {
            // Update with IMDb data if we have it
            const updateData = {
                updated_at: new Date()
            };

            if (drama.imageUrl && !existingDrama.image_url?.includes('placeholder')) {
                updateData.image_url = drama.imageUrl;
            }
            if (drama.rating > 0) {
                updateData.imdb_rating = drama.rating;
            }
            if (drama.synopsis) {
                updateData.synopsis = drama.synopsis;
            }
            if (drama.cast?.length > 0) {
                updateData.cast_names = drama.cast.join(', ');
            }
            if (drama.voteCount) {
                updateData.vote_count = drama.voteCount;
            }

            await existingDrama.update(updateData);
            console.log(`   📝 Updated: ${drama.title}`);
            return { drama: existingDrama, created: false };
        } else {
            // Get Green Entertainment channel ID
            let greenChannel = await db.Channel.findOne({
                where: { name: 'Green Entertainment' }
            });

            // Create channel if it doesn't exist
            if (!greenChannel) {
                greenChannel = await db.Channel.create({
                    name: 'Green Entertainment',
                    logo_url: 'https://i.ytimg.com/vi/GreenTV/maxresdefault.jpg'
                });
                console.log('   Created Green Entertainment channel');
            }

            // Create new drama
            const newDrama = await db.Drama.create({
                title: drama.title,
                year: drama.year || year,
                imdb_rating: drama.rating || 0,
                episodes: episodes || 1,
                status: year >= 2024 ? 'airing' : 'completed',
                channel_id: greenChannel.id,
                synopsis: drama.synopsis || `${drama.title} - A popular Pakistani drama on Green Entertainment.`,
                image_url: drama.imageUrl,
                cast_names: drama.cast?.join(', ') || '',
                vote_count: drama.voteCount || ''
            });
            console.log(`   ✨ Created: ${drama.title}`);
            return { drama: newDrama, created: true };
        }
    } catch (error) {
        console.error(`   ❌ DB Error for ${drama.title}:`, error.message);
        return null;
    }
}

async function main() {
    console.log('🎬 Green Entertainment Drama Scraper');
    console.log('=====================================\n');

    try {
        await db.sequelize.authenticate();
        console.log('✅ Database connected.\n');

        let created = 0, updated = 0, failed = 0;

        for (const drama of GREEN_DRAMAS) {
            console.log(`\n📥 Processing: ${drama.title}`);

            // Try to get data from IMDb
            const imdbUrl = await searchIMDbForDrama(drama.title);

            let dramaData;
            if (imdbUrl) {
                console.log(`   Found on IMDb: ${imdbUrl}`);
                dramaData = await fetchIMDbDetails(imdbUrl, drama.title);
            }

            if (!dramaData) {
                console.log(`   Using fallback data`);
                dramaData = await fetchFromGoogleImages(drama.title);
            }

            // Override with our known data
            dramaData.year = drama.year;

            // Save to database
            const result = await saveToDatabase(dramaData, drama.year, drama.episodes);
            if (result) {
                if (result.created) created++;
                else updated++;
            } else {
                failed++;
            }

            // Respectful delay
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        console.log(`\n===================================`);
        console.log(`✅ Scraping completed!`);
        console.log(`   Created: ${created}`);
        console.log(`   Updated: ${updated}`);
        console.log(`   Failed: ${failed}`);
        console.log(`   Total: ${GREEN_DRAMAS.length}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await db.sequelize.close();
    }
}

main();
