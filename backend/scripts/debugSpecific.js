const axios = require('axios');
const cheerio = require('cheerio');

const URL = 'https://www.imdb.com/search/title/?title_type=tv_series&countries=PK&sort=user_rating,desc&count=50';
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
];

async function debug() {
    try {
        const { data } = await axios.get(URL, {
            headers: { 'User-Agent': USER_AGENTS[0] }
        });

        const $ = cheerio.load(data);
        const items = $('.ipc-metadata-list-summary-item');

        items.each((i, el) => {
            const title = $(el).find('.ipc-title__text').text().trim().replace(/^\d+\.\s*/, '');

            // Only debug Case No. 9 and Sona Chandi
            if (title.includes('Case No. 9') || title.includes('Sona Chandi')) {
                console.log(`\n============== ${title} ==============`);

                // 1. Vote Count
                const voteEl = $(el).find('.ipc-rating-star--voteCount');
                const rawVote = voteEl.text();
                // Check char codes for hidden spaces
                console.log('Raw Vote Text:', JSON.stringify(rawVote));
                console.log('Trimmed Vote:', rawVote.trim());

                // 2. Metadata (where episodes are)
                const metadataItems = $(el).find('.dli-title-metadata-item');
                console.log('Metadata Items Found:', metadataItems.length);

                metadataItems.each((j, meta) => {
                    console.log(`  Meta[${j}]: "${$(meta).text()}"`);
                });

                // 3. Status logic check
                const yearText = metadataItems.first().text();
                console.log('Year Parsed:', yearText);
            }
        });

    } catch (error) {
        console.error(error);
    }
}

debug();
