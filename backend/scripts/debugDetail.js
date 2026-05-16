const axios = require('axios');
const cheerio = require('cheerio');

const URL = 'https://www.imdb.com/title/tt0268060/'; // Dhuwan IMDb ID
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
];

async function debug() {
    try {
        console.log(`Fetching Dhuwan detail page...`);
        const { data } = await axios.get(URL, {
            headers: { 'User-Agent': USER_AGENTS[0] }
        });

        const $ = cheerio.load(data);
        const title = $('h1').text();
        console.log(`Title: ${title}`);

        // Strategy 1: Episodes Header
        const epHeader = $('[data-testid="episodes-header"] .ipc-title__subtext').text();
        console.log(`Msg from [data-testid="episodes-header"]: "${epHeader}"`);

        // Strategy 2: "Episodes" in title metadata
        const totalEps = $('.ipc-title__text:contains("Episodes")').next().text();
        console.log(`Msg from .ipc-title__text:contains("Episodes"): "${totalEps}"`);

        // Strategy 3: Any text containing "episodes"
        console.log('--- All text with word "episode" ---');
        $('body *').contents().filter(function () {
            return this.type === 'text' && this.data.toLowerCase().includes('episode') && this.data.length < 50;
        }).each((i, el) => {
            console.log(`[${i}]: ${$(el).text().trim()}`);
        });

    } catch (error) {
        console.error(error);
    }
}

debug();
