const { google } = require('googleapis');
const db = require('../models');
const { Op } = require('sequelize');
const trendAnalyst = require('./trendAnalyst');

const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY
});

async function runYouTubeAgent() {
    console.log('🤖 [YouTube Agent] Starting scan for new episodes...');
    
    if (!process.env.YOUTUBE_API_KEY) {
        console.error('❌ [YouTube Agent] YOUTUBE_API_KEY is not set in .env. Exiting.');
        return;
    }

    try {
        // Find all airing dramas with their associated channel
        const airingDramas = await db.Drama.findAll({
            where: { status: 'airing' },
            include: [{ model: db.Channel, as: 'channel' }]
        });

        console.log(`📡 [YouTube Agent] Found ${airingDramas.length} airing dramas.`);

        let totalNewEpisodes = 0;

        for (const drama of airingDramas) {
            try {
                let consecutiveMisses = 0;
                let episodesFoundForThisDrama = 0;
                
                // Try to find up to 3 new episodes (in case we missed some)
                while (consecutiveMisses < 1 && episodesFoundForThisDrama < 3) {
                    const nextEpisodeNum = (drama.current_episode || 0) + 1;
                    const channelName = drama.channel ? drama.channel.name : '';
                    const searchQuery = `${drama.title} ${channelName} Episode ${nextEpisodeNum}`;
                    
                    console.log(`🔍 [YouTube Agent] Searching for: "${searchQuery}"`);

                    const response = await youtube.search.list({
                        part: 'snippet',
                        q: searchQuery,
                        maxResults: 5,
                        type: 'video',
                        order: 'relevance'
                    });

                    const videos = response.data.items;
                    let foundThisEpisode = false;

                    if (videos && videos.length > 0) {
                        // Advanced filtering: look for "Episode X" or "Ep X" specifically
                        const episodeRegex = new RegExp(`(ep|episode)\\s*${nextEpisodeNum}(\\b|[^0-9])`, 'i');
                        const promoRegex = /(promo|teaser|review|reaction|preview|upcoming)/i;

                        const bestMatch = videos.find(v => {
                            const title = v.snippet.title.toLowerCase();
                            const isCorrectEpisode = episodeRegex.test(title);
                            const isPromo = promoRegex.test(title);
                            return isCorrectEpisode && !isPromo;
                        });

                        if (bestMatch) {
                            const videoId = bestMatch.id.videoId;
                            const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
                            const thumbnailUrl = bestMatch.snippet.thumbnails.high.url || bestMatch.snippet.thumbnails.default.url;

                            // Check if this episode already exists (redundancy check)
                            const existingEpisode = await db.Episode.findOne({
                                where: {
                                    drama_id: drama.id,
                                    episode_number: nextEpisodeNum
                                }
                            });

                            if (!existingEpisode) {
                                // Create the episode
                                const newEpisode = await db.Episode.create({
                                    drama_id: drama.id,
                                    episode_number: nextEpisodeNum,
                                    video_url: videoUrl,
                                    thumbnail_url: thumbnailUrl,
                                    release_date: new Date()
                                });

                                // Update Drama
                                await drama.update({
                                    current_episode: nextEpisodeNum,
                                    episodes: Math.max(drama.episodes || 0, nextEpisodeNum)
                                });

                                // NEW: Trigger Trend Analysis
                                try {
                                    await trendAnalyst.analyzeEpisodeTrends(drama, newEpisode, {
                                        description: bestMatch.snippet.description
                                    });
                                } catch (aiError) {
                                    console.error('⚠️ [YouTube Agent] Trend analysis failed, but episode was saved:', aiError.message);
                                }

                                console.log(`✅ [YouTube Agent] Added Episode ${nextEpisodeNum} for ${drama.title}`);
                                totalNewEpisodes++;
                                episodesFoundForThisDrama++;
                                foundThisEpisode = true;
                                consecutiveMisses = 0; // Reset misses since we found one
                            } else {
                                console.log(`⚠️ [YouTube Agent] Episode ${nextEpisodeNum} for ${drama.title} already exists in DB. Skipping.`);
                                // If it exists, we still count it as "found" to try the next one
                                drama.current_episode = nextEpisodeNum; 
                                foundThisEpisode = true;
                            }
                        }
                    }

                    if (!foundThisEpisode) {
                        console.log(`❌ [YouTube Agent] No valid video found for ${drama.title} Episode ${nextEpisodeNum}`);
                        consecutiveMisses++;
                    }
                }
            } catch (error) {
                console.error(`❌ [YouTube Agent] Error processing ${drama.title}:`, error.message);
            }
        }

        console.log(`🏁 [YouTube Agent] Scan completed. Added ${totalNewEpisodes} new episodes.`);
    } catch (error) {
        console.error('❌ [YouTube Agent] Fatal error:', error);
    }
}

module.exports = {
    runYouTubeAgent
};
