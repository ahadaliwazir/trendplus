'use strict';
const fs = require('fs');
const path = require('path');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const dataPath = path.join(__dirname, '../../data/full-migration-dump.json');

        if (!fs.existsSync(dataPath)) {
            console.warn('⚠️ No migration dump found. Skipping universal seed.');
            return;
        }

        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        console.log('🚀 Starting Universal Seed from local dump...');

        // Helper function to add missing updated_at timestamp
        const ensureTimestamps = (records) => {
            return records.map(record => ({
                ...record,
                updated_at: record.updated_at || record.created_at || new Date()
            }));
        };

        const tx = await queryInterface.sequelize.transaction();

        try {
            // 1. Channels
            if (data.channels.length > 0) {
                console.log(`📡 Seeding ${data.channels.length} channels...`);
                await queryInterface.bulkInsert('channels', ensureTimestamps(data.channels), { transaction: tx });
            }

            // 2. Genres
            if (data.genres.length > 0) {
                console.log(`🏷️ Seeding ${data.genres.length} genres...`);
                await queryInterface.bulkInsert('genres', ensureTimestamps(data.genres), { transaction: tx });
            }

            // 3. Cast Members
            if (data.cast_members.length > 0) {
                console.log(`👥 Seeding ${data.cast_members.length} cast members...`);
                await queryInterface.bulkInsert('cast_members', ensureTimestamps(data.cast_members), { transaction: tx });
            }

            // 4. Dramas
            if (data.dramas.length > 0) {
                console.log(`🎬 Seeding ${data.dramas.length} dramas...`);
                await queryInterface.bulkInsert('dramas', ensureTimestamps(data.dramas), { transaction: tx });
            }

            // 5. Junctions
            if (data.drama_genres.length > 0) {
                console.log(`🔗 Seeding ${data.drama_genres.length} drama-genre links...`);
                await queryInterface.bulkInsert('drama_genres', data.drama_genres, { transaction: tx });
            }
            if (data.drama_cast.length > 0) {
                console.log(`🎭 Seeding ${data.drama_cast.length} drama-cast links...`);
                await queryInterface.bulkInsert('drama_cast', data.drama_cast, { transaction: tx });
            }

            // 6. News
            if (data.news.length > 0) {
                console.log(`📰 Seeding ${data.news.length} news items...`);
                await queryInterface.bulkInsert('news', ensureTimestamps(data.news), { transaction: tx });
            }

            // 7. Users & Social
            if (data.users.length > 0) {
                console.log(`👤 Seeding ${data.users.length} users...`);
                await queryInterface.bulkInsert('users', ensureTimestamps(data.users), { transaction: tx });
            }
            if (data.user_dramas.length > 0) {
                console.log(`📝 Seeding ${data.user_dramas.length} user-list entries...`);
                await queryInterface.bulkInsert('user_dramas', ensureTimestamps(data.user_dramas), { transaction: tx });
            }
            if (data.user_reviews.length > 0) {
                console.log(`⭐ Seeding ${data.user_reviews.length} reviews...`);
                await queryInterface.bulkInsert('user_reviews', ensureTimestamps(data.user_reviews), { transaction: tx });
            }
            if (data.user_votes.length > 0) {
                console.log(`🗳️ Seeding ${data.user_votes.length} votes...`);
                await queryInterface.bulkInsert('user_votes', ensureTimestamps(data.user_votes), { transaction: tx });
            }
            if (data.friendships.length > 0) {
                console.log(`🤝 Seeding ${data.friendships.length} friendship links...`);
                await queryInterface.bulkInsert('friendships', ensureTimestamps(data.friendships), { transaction: tx });
            }
            if (data.review_likes.length > 0) {
                console.log(`❤️ Seeding ${data.review_likes.length} review likes...`);
                await queryInterface.bulkInsert('review_likes', data.review_likes, { transaction: tx });
            }
            if (data.review_comments.length > 0) {
                console.log(`💬 Seeding ${data.review_comments.length} review comments...`);
                await queryInterface.bulkInsert('review_comments', ensureTimestamps(data.review_comments), { transaction: tx });
            }
            if (data.admin_notifications.length > 0) {
                console.log(`🔔 Seeding ${data.admin_notifications.length} admin notifications...`);
                await queryInterface.bulkInsert('admin_notifications', ensureTimestamps(data.admin_notifications), { transaction: tx });
            }

            await tx.commit();
            console.log('✨ Universal Seed Complete!');
        } catch (error) {
            await tx.rollback();
            console.error('❌ Sync failed:', error);
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        // Down is handled manually by nuclear-reset or by deleting records
    }
};
