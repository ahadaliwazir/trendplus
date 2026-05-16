const fs = require('fs');
const path = require('path');
const {
    sequelize,
    User,
    Channel,
    Genre,
    Drama,
    CastMember,
    UserDrama,
    UserReview,
    UserVote,
    Friendship,
    News,
    AdminNotification,
    ReviewLike,
    ReviewComment
} = require('../src/models');

async function exportAllData() {
    console.log('📦 Starting Data Export from local database...');

    try {
        await sequelize.authenticate();
        console.log('✅ Connected to local database.');

        const data = {
            channels: await sequelize.query('SELECT * FROM channels', { type: sequelize.QueryTypes.SELECT }),
            genres: await sequelize.query('SELECT * FROM genres', { type: sequelize.QueryTypes.SELECT }),
            cast_members: await sequelize.query('SELECT * FROM cast_members', { type: sequelize.QueryTypes.SELECT }),
            dramas: await sequelize.query('SELECT * FROM dramas', { type: sequelize.QueryTypes.SELECT }),
            news: await sequelize.query('SELECT * FROM news', { type: sequelize.QueryTypes.SELECT }),
            // Junction tables and associations
            drama_genres: await sequelize.query('SELECT * FROM drama_genres', { type: sequelize.QueryTypes.SELECT }),
            drama_cast: await sequelize.query('SELECT * FROM drama_cast', { type: sequelize.QueryTypes.SELECT }),
            // User related (Careful with passwords - they are already hashed)
            users: await sequelize.query('SELECT * FROM users', { type: sequelize.QueryTypes.SELECT }),
            user_dramas: await sequelize.query('SELECT * FROM user_dramas', { type: sequelize.QueryTypes.SELECT }),
            user_reviews: await sequelize.query('SELECT * FROM user_reviews', { type: sequelize.QueryTypes.SELECT }),
            user_votes: await sequelize.query('SELECT * FROM user_votes', { type: sequelize.QueryTypes.SELECT }),
            friendships: await sequelize.query('SELECT * FROM friendships', { type: sequelize.QueryTypes.SELECT }),
            admin_notifications: await sequelize.query('SELECT * FROM admin_notifications', { type: sequelize.QueryTypes.SELECT }),
            review_likes: await sequelize.query('SELECT * FROM review_likes', { type: sequelize.QueryTypes.SELECT }),
            review_comments: await sequelize.query('SELECT * FROM review_comments', { type: sequelize.QueryTypes.SELECT })
        };

        const outputPath = path.join(__dirname, '../data/full-migration-dump.json');

        // Ensure data directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

        console.log(`\n✨ SUCCESS! Created export file: ${outputPath}`);
        console.log(`📊 Stats:`);
        console.log(`- Dramas: ${data.dramas.length}`);
        console.log(`- Users: ${data.users.length}`);
        console.log(`- Channels: ${data.channels.length}`);
        console.log(`- Genres: ${data.genres.length}`);
        console.log(`- Cast Members: ${data.cast_members.length}`);

    } catch (error) {
        console.error('❌ Export failed:', error);
    } finally {
        await sequelize.close();
    }
}

exportAllData();
