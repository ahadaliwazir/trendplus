const axios = require('axios');
const fs = require('fs');
const path = require('path');

const categories = [
    'DIGITAL: Popular',
    'DIGITAL: Archive',
    'DIGITAL: Drama',
    'DIGITAL: Comedy',
    'DIGITAL: Soap',
    'DIGITAL: Special'
];

async function scrapeAll() {
    const allDramas = new Map();
    const baseImgUrl = 'https://node.aryzap.com/public/';
    const basePlaylistUrl = 'https://arydigital.tv/playlist/';

    for (const cat of categories) {
        const url = `https://node.aryzap.com/api/series/byCatID/pg/${encodeURIComponent(cat)}/PK`;
        console.log(`Scraping category: ${cat}`);
        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            if (response.data && response.data.series) {
                response.data.series.forEach(s => {
                    if (!allDramas.has(s._id)) {
                        allDramas.set(s._id, {
                            title: s.title,
                            image_url: baseImgUrl + s.imagePoster,
                            playlist_url: basePlaylistUrl + s._id
                        });
                    }
                });
                console.log(`Added dramas from ${cat}. Total unique: ${allDramas.size}`);
            }
        } catch (error) {
            console.error(`Error scraping ${cat}: ${error.message}`);
        }
    }

    const results = Array.from(allDramas.values());
    const filePath = path.join(__dirname, '../data/ary-dramas-extended.json');
    fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
    console.log(`Saved ${results.length} dramas to ${filePath}`);
}

scrapeAll();
