// Migrate all data from Supabase (PostgreSQL) to Railway MySQL
// Run this AFTER adding MySQL to Railway and getting MYSQL_URL
// Usage: MYSQL_URL="mysql://..." node backend/scripts/migrate-supabase-to-mysql.js

require('dotenv').config();
const https = require('https');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://txjfrsipqbtvpfsomvma.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

function supabaseGet(table, params = '') {
    return new Promise((resolve, reject) => {
        const url = new URL(`${SUPABASE_URL}/rest/v1/${table}?${params}&limit=1000`);
        const req = https.request({
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch { resolve([]); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function main() {
    const mysqlUrl = process.env.MYSQL_URL;
    if (!mysqlUrl) {
        console.error('❌ MYSQL_URL environment variable not set!');
        console.log('Usage: MYSQL_URL="mysql://user:pass@host:port/dbname" node backend/scripts/migrate-supabase-to-mysql.js');
        process.exit(1);
    }

    console.log('🚀 Connecting to MySQL...');
    const conn = await mysql.createConnection(mysqlUrl);
    console.log('✅ MySQL connected!\n');

    // Run the original schema
    console.log('📋 Creating tables from schema.sql...');
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        // Split by semicolons and run each statement
        const statements = schema.split(';').filter(s => s.trim().length > 0);
        for (const stmt of statements) {
            try {
                await conn.execute(stmt.trim());
            } catch (e) {
                if (!e.message.includes('already exists')) {
                    console.warn(`⚠️ Schema warning: ${e.message}`);
                }
            }
        }
        console.log('✅ Schema created!\n');
    }

    // Migrate each table
    const tables = [
        { name: 'channels', supabase: 'channels' },
        { name: 'genres', supabase: 'genres' },
        { name: 'dramas', supabase: 'dramas', order: 'id' },
        { name: 'drama_genres', supabase: 'drama_genres' },
        { name: 'cast_members', supabase: 'cast_members' },
        { name: 'drama_cast', supabase: 'drama_cast' },
        { name: 'episodes', supabase: 'episodes', order: 'id' },
        { name: 'users', supabase: 'users', order: 'id' },
        { name: 'watchlist', supabase: 'watchlist' },
        { name: 'reviews', supabase: 'reviews' },
        { name: 'news', supabase: 'news' },
        { name: 'quiz_questions', supabase: 'quiz_questions' },
        { name: 'community_posts', supabase: 'community_posts' },
        { name: 'post_likes', supabase: 'post_likes' },
        { name: 'post_comments', supabase: 'post_comments' },
        { name: 'comment_likes', supabase: 'comment_likes' }
    ];

    for (const table of tables) {
        try {
            console.log(`📦 Migrating ${table.name}...`);
            const rows = await supabaseGet(table.supabase, table.order ? `order=${table.order}` : '');
            
            if (!Array.isArray(rows) || rows.length === 0) {
                console.log(`  ⚠️ No data in ${table.name}`);
                continue;
            }

            // Clear existing data
            await conn.execute(`DELETE FROM \`${table.name}\``).catch(() => {});
            
            // Reset auto-increment
            await conn.execute(`ALTER TABLE \`${table.name}\` AUTO_INCREMENT = 1`).catch(() => {});

            // Disable foreign key checks for insertion
            await conn.execute('SET FOREIGN_KEY_CHECKS = 0');

            // Get valid columns for this table from MySQL
            const [colRows] = await conn.query(`SHOW COLUMNS FROM \`${table.name}\``);
            const validCols = new Set(colRows.map(r => r.Field));

            let inserted = 0;
            for (const row of rows) {
                // Filter out keys that don't exist in MySQL
                const rowKeys = Object.keys(row).filter(k => validCols.has(k));
                
                if (rowKeys.length === 0) continue;

                const cols = rowKeys.map(k => `\`${k}\``).join(', ');
                const placeholders = rowKeys.map(() => '?').join(', ');
                const values = rowKeys.map(k => {
                    const v = row[k];
                    if (v === null || v === undefined) return null;
                    if (typeof v === 'boolean') return v ? 1 : 0;
                    if (typeof v === 'object') return JSON.stringify(v);
                    return v;
                });

                try {
                    await conn.execute(
                        `INSERT INTO \`${table.name}\` (${cols}) VALUES (${placeholders})`,
                        values
                    );
                    inserted++;
                } catch (e) {
                    // Skip duplicates
                    if (!e.message.includes('Duplicate')) {
                        console.warn(`  ⚠️ Row error: ${e.message}`);
                    }
                }
            }

            await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
            console.log(`  ✅ ${inserted}/${rows.length} rows migrated`);
        } catch (e) {
            console.error(`  ❌ Failed to migrate ${table.name}: ${e.message}`);
        }
    }

    await conn.end();
    console.log('\n🎉 Migration complete! Your MySQL database is ready.');
}

main().catch(console.error);
