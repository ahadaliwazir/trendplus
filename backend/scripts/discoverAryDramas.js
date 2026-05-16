const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function searchLetter(char) {
    const url = `https://node.aryzap.com/api/series/search?q=${char}`;
    console.log(`Searching for '${char}'...`);
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        // The previous test said "No data found in expected format". Let's see the keys.
        if (response.data) {
            if (response.data.series) {
                return response.data.series;
            } else if (Array.isArray(response.data)) {
                return response.data;
            } else {
                console.log(`Keys in response for '${char}':`, Object.keys(response.data));
                if (response.data.data && response.data.data.series) return response.data.data.series;
                return [];
            }
        }
        return [];
    } catch (error) {
        console.error(`Error searching '${char}': ${error.message}`);
        return [];
    }
}

async function discoverAll() {
    const allDramas = new Map();
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const baseImgUrl = 'https://node.aryzap.com/public/';
    const basePlaylistUrl = 'https://arydigital.tv/playlist/';

    for (const char of letters) {
        const series = await searchLetter(char);
        series.forEach(s => {
            if (s._id && !allDramas.has(s._id)) {
                allDramas.set(s._id, {
                    title: s.title,
                    image_url: baseImgUrl + s.imagePoster,
                    playlist_url: basePlaylistUrl + s._id
                });
            }
        });
        console.log(`Current unique count: ${allDramas.size}`);
    }

    const results = Array.from(allDramas.values());
    const filePath = path.join(__dirname, '../data/ary-dramas-discovered.json');
    fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
    console.log(`Discovered ${results.length} unique dramas total.`);
}

discoverAll();
