require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ ERROR: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
});

async function insertBatch(tableName, rows) {
    if (!rows || rows.length === 0) {
        console.log(`⏭️  Skipping ${tableName} (empty)`);
        return;
    }
    console.log(`📥 Inserting ${rows.length} rows into "${tableName}"...`);

    // Insert in chunks of 500 to avoid payload limits
    const chunkSize = 500;
    for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        const { error } = await supabase.from(tableName).upsert(chunk, { onConflict: 'id', ignoreDuplicates: true });
        if (error) {
            console.warn(`  ⚠️  Warning on chunk ${i}-${i + chunkSize} in "${tableName}": ${error.message}`);
        } else {
            console.log(`  ✅ Inserted chunk ${i + 1}-${Math.min(i + chunkSize, rows.length)}`);
        }
    }
}

async function insertJunction(tableName, rows, conflictKey) {
    if (!rows || rows.length === 0) {
        console.log(`⏭️  Skipping ${tableName} (empty)`);
        return;
    }
    console.log(`📥 Inserting ${rows.length} rows into "${tableName}"...`);
    const chunkSize = 500;
    for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        const { error } = await supabase.from(tableName).upsert(chunk, { ignoreDuplicates: true });
        if (error) {
            console.warn(`  ⚠️  Warning on "${tableName}": ${error.message}`);
        } else {
            console.log(`  ✅ Inserted chunk ${i + 1}-${Math.min(i + chunkSize, rows.length)}`);
        }
    }
}

async function main() {
    console.log('🚀 Starting Supabase migration via REST API...');
    console.log(`🔗 Target: ${SUPABASE_URL}`);

    // Quick connection test
    const { error: pingError } = await supabase.from('channels').select('count').limit(1);
    if (pingError && pingError.code !== 'PGRST116' && !pingError.message.includes('does not exist')) {
        console.error('❌ Cannot connect to Supabase:', pingError.message);
        process.exit(1);
    }
    console.log('✅ Connected to Supabase!\n');

    const dumpPath = path.join(__dirname, '../data/full-migration-dump.json');
    if (!fs.existsSync(dumpPath)) {
        console.error(`❌ Dump file not found at ${dumpPath}`);
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(dumpPath, 'utf8'));

    console.log('📊 Data found in dump:');
    Object.entries(data).forEach(([k, v]) => console.log(`  - ${k}: ${v?.length ?? 0} rows`));
    console.log('');

    // Insert in dependency order
    await insertBatch('users', data.users);
    await insertBatch('channels', data.channels);
    await insertBatch('genres', data.genres);
    await insertBatch('cast_members', data.cast_members);
    await insertBatch('dramas', data.dramas);
    await insertBatch('news', data.news);
    await insertJunction('drama_genres', data.drama_genres);
    await insertJunction('drama_cast', data.drama_cast);
    await insertBatch('user_dramas', data.user_dramas);
    await insertBatch('user_reviews', data.user_reviews);
    await insertBatch('user_votes', data.user_votes);
    await insertBatch('friendships', data.friendships);
    await insertBatch('admin_notifications', data.admin_notifications);
    await insertBatch('review_likes', data.review_likes);
    await insertBatch('review_comments', data.review_comments);

    console.log('\n✨ Migration complete!');
}

main().catch(err => {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
});
