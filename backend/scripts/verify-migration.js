require('dotenv').config();
const { sequelize, Drama } = require('../src/models');

async function verify() {
    try {
        console.log('🧪 Verifying Sequelize connection to Supabase...');
        await sequelize.authenticate();
        console.log('✅ Connection established successfully.');

        const count = await Drama.count();
        console.log(`📊 Found ${count} dramas in Supabase!`);
        
        if (count > 0) {
            const first = await Drama.findOne({ order: [['id', 'ASC']] });
            console.log(`🎬 First drama found: "${first.title}"`);
        }
        
        await sequelize.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Verification failed:', err.message);
        process.exit(1);
    }
}

verify();
