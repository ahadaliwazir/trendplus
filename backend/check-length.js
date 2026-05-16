const axios = require('axios');
const cheerio = require('cheerio');

async function checkUrlLength(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 15000
        });

        const pageSource = response.data;
        const bgRegex = /\.betube__cat_description\s*\{[^}]*background(?:-image)?:\s*url\(['"]?([^'"]+)['"]?\)/i;
        const match = pageSource.match(bgRegex);

        if (match && match[1]) {
            console.log(`URL: ${match[1].substring(0, 100)}...`);
            console.log(`Length: ${match[1].length}`);
        } else {
            console.log('No background image URL found via regex.');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkUrlLength('https://hum.tv/dramas/parizaad/');
