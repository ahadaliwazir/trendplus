const axios = require('axios');

async function testUrl(url, label) {
    console.log(`Testing ${label}: ${url}`);
    try {
        const response = await axios.get(url);
        if (response.data && response.data.series) {
            console.log(`Success! Found ${response.data.series.length} dramas.`);
        } else if (response.data && Array.isArray(response.data)) {
            console.log(`Success! Found ${response.data.length} items (array).`);
        } else {
            console.log('No data found in expected format.');
        }
    } catch (error) {
        console.log(`Failed: ${error.message}`);
    }
}

async function run() {
    await testUrl('https://node.aryzap.com/api/series/byCatID/pg/DIGITAL:%20Archive/PK', 'Archive');
    await testUrl('https://node.aryzap.com/api/series/all/PK', 'All Series');
    await testUrl('https://node.aryzap.com/api/series/category/DIGITAL/PK', 'Category DIGITAL');
    await testUrl('https://node.aryzap.com/api/series/search?q=a', 'Search A');
}

run();
