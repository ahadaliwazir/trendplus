const axios = require('axios');

async function verifyApi() {
    try {
        console.log('🔍 Verifying API fix...');
        const response = await axios.get('http://localhost:5000/api/dramas/top-rated?limit=250');

        const dramas = response.data.data.dramas;
        const count = dramas.length;
        const zeroRated = dramas.filter(d => d.imdb_rating === 0 || d.imdb_rating === '0.0').length;

        console.log(`✅ Total dramas returned: ${count}`);
        console.log(`✅ Dramas with 0 rating included: ${zeroRated}`);

        if (count > 50 && zeroRated > 0) {
            console.log('🎉 SUCCESS: API is returning all dramas including unrated ones!');

            // Check specific dramas
            const parizaad = dramas.find(d => d.title.includes('Parizaad'));
            const jafaa = dramas.find(d => d.title.includes('Jafaa'));

            if (parizaad) console.log('   - Found: Parizaad');
            if (jafaa) console.log('   - Found: Jafaa');

        } else {
            console.log('❌ FAILURE: API still missing dramas.');
        }

    } catch (error) {
        console.error('❌ Error calling API:', error.message);
    }
}

verifyApi();
