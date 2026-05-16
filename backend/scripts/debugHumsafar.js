const axios = require('axios');
const cheerio = require('cheerio');

const URL = 'https://www.imdb.com/search/title/?title_type=tv_series,mini_series&countries=pk&languages=ur&sort=user_rating,desc&count=250';
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
];

async function debug() {
    try {
        console.log('Fetching...');
        const { data } = await axios.get(URL, {
            headers: { 'User-Agent': USER_AGENTS[0] }
        });

        const $ = cheerio.load(data);
        const items = $('.ipc-metadata-list-summary-item');

        items.each((i, el) => {
            const title = $(el).find('.ipc-title__text').text().trim().replace(/^\d+\.\s*/, '');

            if (title.includes('Humsafar') || title.includes('Kabhi Main Kabhi Tum')) {
                console.log(`\n============== ${title} ==============`);

                // 1. Vote Count
                const voteEl = $(el).find('.ipc-rating-star--voteCount');
                console.log(`Vote Text: "${voteEl.text()}"`);

                // 2. Cast / Stars
                // IMDb search list usually puts stars in a specific container or just text
                // Let's look for "Stars" label or links
                console.log('--- Searching for Cast ---');
                const allLinks = $(el).find('a').map((i, a) => $(a).text()).get();
                console.log('Links:', allLinks);

                const contentText = $(el).text();
                // console.log('Full Text:', contentText); 
            }
        });

    } catch (error) {
        console.error(error);
    }
}

debug();
