require('dotenv').config();
const { Client } = require('pg');

const url = process.env.DATABASE_URL;
console.log('🔗 Connecting with URL:', url.replace(/:([^:@]+)@/, ':***@'));

const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
});

client.connect()
    .then(() => {
        console.log('✅ Connected to Supabase successfully!');
        return client.query('SELECT version()');
    })
    .then(res => {
        console.log('📊 PostgreSQL version:', res.rows[0].version);
        return client.end();
    })
    .catch(err => {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    });
