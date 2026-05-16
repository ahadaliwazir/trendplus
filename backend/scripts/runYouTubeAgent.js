require('dotenv').config();
const { runYouTubeAgent } = require('../src/services/youtubeAgent');
const { sequelize } = require('../src/models');

async function testAgent() {
    console.log('🧪 Starting YouTube Agent Manual Test...');
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected.');

        if (!process.env.YOUTUBE_API_KEY) {
            console.log('⚠️ WARNING: YOUTUBE_API_KEY is not set in your .env file!');
            console.log('You need to add YOUTUBE_API_KEY=your_key_here to backend/.env');
        }

        await runYouTubeAgent();
        
    } catch (error) {
        console.error('❌ Error during test:', error);
    } finally {
        await sequelize.close();
        console.log('🏁 Test finished and database connection closed.');
    }
}

testAgent();
