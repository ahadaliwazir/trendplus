const axios = require('axios');
const cheerio = require('cheerio');

const URL = 'https://www.imdb.com/search/title/?title_type=tv_series&countries=PK&sort=user_rating,desc&count=50';
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
];

async function debug() {
    try {
        console.log('Fetching...');
        const { data } = await axios.get(URL, {
            headers: {
                'User-Agent': USER_AGENTS[0],
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        const $ = cheerio.load(data);
        console.log('Page Title:', $('title').text());

        const items = $('.ipc-metadata-list-summary-item');
        console.log(`Found ${items.length} items`);

        items.each((i, el) => {
            const title = $(el).find('.ipc-title__text').text().trim().replace(/^\d+\.\s*/, '');
            if (title.includes('Sona Chandi') || title.includes('Gila')) {
                console.log(`\n--- Debugging: ${title} ---`);

                // Print the entire rating block HTML
                const ratingBlock = $(el).find('.ipc-rating-star-group').html();
                console.log('Rating Block HTML:', ratingBlock);

                // Try finding vote count directly
                const voteEl = $(el).find('.ipc-rating-star--voteCount');
                console.log('Vote Element Text:', voteEl.text());

                // Try finding exact class matches
                console.log('Classes on star group:', $(el).find('.ipc-rating-star-group').attr('class'));
            }
        });

    } catch (error) {
        console.error(error);
    }
}

debug();
