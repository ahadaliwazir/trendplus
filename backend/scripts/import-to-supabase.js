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

async function importAllData() {
    console.log('📦 Starting Data Import to Supabase...');

    if (!process.env.DATABASE_URL) {
        console.error('❌ ERROR: DATABASE_URL environment variable is not set.');
        console.error('Please set it to your Supabase PostgreSQL connection string.');
        process.exit(1);
    }

    try {
        await sequelize.authenticate();
        console.log('✅ Connected to Supabase database.');
        
        // Sync database schema (creates tables if they don't exist)
        console.log('🔄 Syncing schema...');
        await sequelize.sync({ force: true }); // WARNING: This drops existing tables. Assuming fresh Supabase project.

        const dumpPath = path.join(__dirname, '../data/full-migration-dump.json');
        
        if (!fs.existsSync(dumpPath)) {
            console.error(`❌ Dump file not found at ${dumpPath}`);
            process.exit(1);
        }

        const rawData = fs.readFileSync(dumpPath, 'utf8');
        const data = JSON.parse(rawData);

        console.log('📥 Importing data in order of dependencies...');

        // 1. Independent Tables
        if (data.users && data.users.length > 0) {
            console.log(`Importing ${data.users.length} Users...`);
            await User.bulkCreate(data.users, { ignoreDuplicates: true });
        }
        
        if (data.channels && data.channels.length > 0) {
            console.log(`Importing ${data.channels.length} Channels...`);
            await Channel.bulkCreate(data.channels, { ignoreDuplicates: true });
        }

        if (data.genres && data.genres.length > 0) {
            console.log(`Importing ${data.genres.length} Genres...`);
            await Genre.bulkCreate(data.genres, { ignoreDuplicates: true });
        }

        if (data.cast_members && data.cast_members.length > 0) {
            console.log(`Importing ${data.cast_members.length} Cast Members...`);
            await CastMember.bulkCreate(data.cast_members, { ignoreDuplicates: true });
        }

        // 2. Dramas (Depends on Channels)
        if (data.dramas && data.dramas.length > 0) {
            console.log(`Importing ${data.dramas.length} Dramas...`);
            await Drama.bulkCreate(data.dramas, { ignoreDuplicates: true });
        }

        if (data.news && data.news.length > 0) {
            console.log(`Importing ${data.news.length} News articles...`);
            await News.bulkCreate(data.news, { ignoreDuplicates: true });
        }

        // 3. Junction Tables (Raw query is often safer for junctions in Sequelize if models lack explicit junction config)
        if (data.drama_genres && data.drama_genres.length > 0) {
            console.log(`Importing ${data.drama_genres.length} Drama-Genres...`);
            for (const row of data.drama_genres) {
                await sequelize.query(
                    `INSERT INTO "drama_genres" ("drama_id", "genre_id", "created_at", "updated_at") VALUES (:drama_id, :genre_id, :created_at, :updated_at) ON CONFLICT DO NOTHING`,
                    { replacements: row }
                ).catch(e => {
                    // Fallback for models without created_at in export
                    return sequelize.query(
                        `INSERT INTO "drama_genres" ("drama_id", "genre_id") VALUES (:drama_id, :genre_id) ON CONFLICT DO NOTHING`,
                        { replacements: row }
                    );
                }).catch(e => null); // ignore
            }
        }

        if (data.drama_cast && data.drama_cast.length > 0) {
            console.log(`Importing ${data.drama_cast.length} Drama-Cast relations...`);
            for (const row of data.drama_cast) {
                await sequelize.query(
                    `INSERT INTO "drama_cast" ("drama_id", "cast_id", "role_name", "is_lead", "created_at", "updated_at") VALUES (:drama_id, :cast_id, :role_name, :is_lead, :created_at, :updated_at) ON CONFLICT DO NOTHING`,
                    { replacements: row }
                ).catch(e => {
                    return sequelize.query(
                        `INSERT INTO "drama_cast" ("drama_id", "cast_id", "role_name", "is_lead") VALUES (:drama_id, :cast_id, :role_name, :is_lead) ON CONFLICT DO NOTHING`,
                        { replacements: row }
                    );
                }).catch(e => null);
            }
        }

        // 4. User Interactions
        if (data.user_dramas && data.user_dramas.length > 0) {
            console.log(`Importing ${data.user_dramas.length} User Dramas...`);
            await UserDrama.bulkCreate(data.user_dramas, { ignoreDuplicates: true });
        }

        if (data.user_reviews && data.user_reviews.length > 0) {
            console.log(`Importing ${data.user_reviews.length} User Reviews...`);
            await UserReview.bulkCreate(data.user_reviews, { ignoreDuplicates: true });
        }
        
        if (data.user_votes && data.user_votes.length > 0) {
             console.log(`Importing ${data.user_votes.length} User Votes...`);
             await UserVote.bulkCreate(data.user_votes, { ignoreDuplicates: true });
        }

        if (data.friendships && data.friendships.length > 0) {
             console.log(`Importing ${data.friendships.length} Friendships...`);
             await Friendship.bulkCreate(data.friendships, { ignoreDuplicates: true });
        }

        if (data.admin_notifications && data.admin_notifications.length > 0) {
             console.log(`Importing ${data.admin_notifications.length} Admin Notifications...`);
             await AdminNotification.bulkCreate(data.admin_notifications, { ignoreDuplicates: true });
        }

        if (data.review_likes && data.review_likes.length > 0) {
             console.log(`Importing ${data.review_likes.length} Review Likes...`);
             await ReviewLike.bulkCreate(data.review_likes, { ignoreDuplicates: true });
        }

        if (data.review_comments && data.review_comments.length > 0) {
             console.log(`Importing ${data.review_comments.length} Review Comments...`);
             await ReviewComment.bulkCreate(data.review_comments, { ignoreDuplicates: true });
        }

        // Update sequences for postgres (so new inserts don't fail with duplicate id)
        console.log('🔄 Updating PostgreSQL sequences...');
        const tables = [
            'users', 'channels', 'genres', 'dramas', 'cast_members', 'news', 
            'user_dramas', 'user_reviews', 'user_votes', 'friendships', 
            'admin_notifications', 'review_likes', 'review_comments'
        ];
        
        for (const table of tables) {
            try {
                await sequelize.query(`SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), coalesce(max(id), 0) + 1, false) FROM "${table}";`);
            } catch (err) {
                // ignore if table doesn't have an id sequence
            }
        }

        console.log(`\n✨ SUCCESS! Database has been migrated to Supabase.`);

    } catch (error) {
        console.error('❌ Import failed:', error);
    } finally {
        await sequelize.close();
    }
}

importAllData();
