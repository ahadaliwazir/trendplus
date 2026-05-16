const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function scrapeCategory(cat) {
    const allDramas = [];
    let page = 1;
    let totalSeries = 0;
    const baseImgUrl = 'https://node.aryzap.com/public/';
    const basePlaylistUrl = 'https://arydigital.tv/playlist/';

    console.log(`Scraping category: ${cat}`);

    do {
        const url = `https://node.aryzap.com/api/series/byCatID/pg/${encodeURIComponent(cat)}/PK?page=${page}`;
        let success = false;
        let retries = 3;
        while (!success && retries > 0) {
            try {
                const response = await axios.get(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                });

                const data = response.data;
                if (data && data.series) {
                    data.series.forEach(s => {
                        allDramas.push({
                            id: s._id,
                            title: s.title,
                            image_url: baseImgUrl + s.imagePoster,
                            playlist_url: basePlaylistUrl + s._id
                        });
                    });

                    totalSeries = data.pagination.totalSeries;
                    console.log(`Page ${page}: Added ${data.series.length} dramas. Total so far: ${allDramas.length}/${totalSeries}`);

                    if (data.series.length === 0) {
                        success = true; // No more series, consider this page successful and break outer loop
                        break;
                    }
                    page++;
                    success = true; // Mark as successful for this page
                } else {
                    // No data or no series array, not a retryable error, just stop for this category
                    success = true; // Treat as handled for retry loop
                    break; // Break from inner retry loop
                }
            } catch (error) {
                console.error(`Error on page ${page} (retries left: ${retries - 1}): ${error.message}`);
                retries--;
                if (retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
                } else {
                    // No retries left, break from inner retry loop
                    break;
                }
            }
        }
        if (!success) {
            // If after all retries, the page was not successfully fetched, break the outer loop
            break;
        }
    } while (allDramas.length < totalSeries);

    return allDramas;
}

async function run() {
    const categories = ['DIGITAL: Popular', 'DIGITAL: Archive'];
    const finalMap = new Map();

    for (const cat of categories) {
        const dramas = await scrapeCategory(cat);
        dramas.forEach(d => {
            if (!finalMap.has(d.id)) {
                finalMap.set(d.id, d);
            }
        });
    }

    const results = Array.from(finalMap.values());
    const filePath = path.join(__dirname, '../data/ary-dramas-full.json');
    fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
    console.log(`Saved ${results.length} unique dramas to ${filePath}`);
}

run();
