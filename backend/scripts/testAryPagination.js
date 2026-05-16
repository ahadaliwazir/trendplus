const axios = require('axios');

async function testPage(pg, category) {
    const url = `https://node.aryzap.com/api/series/byCatID/${pg}/${encodeURIComponent(category)}/PK`;
    console.log(`Testing ${category} Page ${pg}: ${url}`);
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        if (response.data && response.data.series) {
            console.log(` - Success! Found ${response.data.series.length} dramas.`);
            return response.data.series.length;
        } else {
            console.log(' - No series found.');
            return 0;
        }
    } catch (error) {
        console.log(` - Failed: ${error.message}`);
        return -1;
    }
}

async function run() {
    await testPage('1', 'DIGITAL: Archive');
    await testPage('2', 'DIGITAL: Archive');
    await testPage('3', 'DIGITAL: Archive');

    await testPage('1', 'DIGITAL: Drama');
    await testPage('2', 'DIGITAL: Drama');
}

run();
