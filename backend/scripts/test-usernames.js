const { Client } = require('pg');

async function test(user) {
    const client = new Client({
        user: user,
        host: 'aws-0-ap-south-1.pooler.supabase.com',
        database: 'postgres',
        password: 'L6eooNoW4BaNyuQQ',
        port: 6543,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log(`Testing user: ${user}`);
        await client.connect();
        console.log(`✅ Success with user: ${user}`);
        await client.end();
        return true;
    } catch (err) {
        console.error(`❌ Failed with user ${user}: ${err.message}`);
        return false;
    }
}

async function run() {
    await test('postgres.txjfrsipqbtvpfsomvma');
    await test('postgres');
}

run();
