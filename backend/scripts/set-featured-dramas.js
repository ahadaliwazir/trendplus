// Script to set hero and featured dramas in Supabase
const https = require('https');

const SUPABASE_URL = 'https://txjfrsipqbtvpfsomvma.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

function supabaseRequest(method, path, body) {
    return new Promise((resolve, reject) => {
        const url = new URL(SUPABASE_URL + path);
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method,
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'return=representation'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
                catch (e) { resolve({ status: res.statusCode, data }); }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function main() {
    console.log('🎬 Fetching dramas with high ratings to set as hero/featured...');

    // Get dramas with highest IMDB ratings and status=airing
    const { data: airingDramas } = await supabaseRequest(
        'GET',
        '/rest/v1/dramas?status=eq.airing&order=imdb_rating.desc&limit=15&select=id,title,imdb_rating,status',
        null
    );

    // Get top dramas overall for hero
    const { data: topDramas } = await supabaseRequest(
        'GET',
        '/rest/v1/dramas?order=imdb_rating.desc&limit=5&select=id,title,imdb_rating',
        null
    );

    console.log(`Found ${airingDramas?.length || 0} airing dramas`);
    console.log(`Found ${topDramas?.length || 0} top dramas`);

    if (!topDramas || topDramas.length === 0) {
        console.error('❌ No dramas found! Check database connection.');
        return;
    }

    // Set top 5 dramas as hero
    const heroIds = topDramas.map(d => d.id);
    console.log('\n🌟 Setting hero dramas:', topDramas.map(d => d.title));

    for (const drama of topDramas) {
        const res = await supabaseRequest(
            'PATCH',
            `/rest/v1/dramas?id=eq.${drama.id}`,
            { is_hero: true }
        );
        console.log(`  ✅ ${drama.title} → is_hero=true (${res.status})`);
    }

    // Set top 10 airing dramas with feature_rank
    if (airingDramas && airingDramas.length > 0) {
        console.log('\n🎭 Setting featured airing dramas...');
        for (let i = 0; i < Math.min(10, airingDramas.length); i++) {
            const drama = airingDramas[i];
            const res = await supabaseRequest(
                'PATCH',
                `/rest/v1/dramas?id=eq.${drama.id}`,
                { feature_rank: i + 1 }
            );
            console.log(`  ✅ [Rank ${i+1}] ${drama.title} (${res.status})`);
        }
    } else {
        // If no airing dramas, set feature_rank on top dramas anyway
        console.log('\n🎭 No airing dramas found, setting feature_rank on top dramas...');
        for (let i = 0; i < topDramas.length; i++) {
            const drama = topDramas[i];
            await supabaseRequest(
                'PATCH',
                `/rest/v1/dramas?id=eq.${drama.id}`,
                { feature_rank: i + 1 }
            );
            console.log(`  ✅ [Rank ${i+1}] ${drama.title}`);
        }
    }

    console.log('\n✅ Done! Refresh meridramalist.com to see featured dramas!');
}

main().catch(console.error);
