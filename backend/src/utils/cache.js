/**
 * Simple in-memory cache for API responses
 * Reduces database load for frequently accessed data
 */
const NodeCache = require('node-cache');

// Cache with 5 minute TTL for drama lists, 1 minute check period
const cache = new NodeCache({
    stdTTL: 300, // 5 minutes default TTL
    checkperiod: 60, // Check for expired keys every minute
    useClones: false, // Don't clone objects (faster)
});

// Cache keys for different endpoints
const CACHE_KEYS = {
    TOP_RATED: (page, limit) => `top-rated:${page}:${limit}`,
    AIRING: 'dramas:airing',
    UPCOMING: 'dramas:upcoming',
    FEATURED: 'dramas:featured',
    HERO: 'dramas:hero',
    CHANNELS: 'channels:all',
    GENRES: 'genres:all',
};

/**
 * Get cached data or null
 */
const get = (key) => {
    return cache.get(key);
};

/**
 * Set cache data
 */
const set = (key, data, ttl = 300) => {
    cache.set(key, data, ttl);
};

/**
 * Invalidate cache for a specific key
 */
const invalidate = (key) => {
    cache.del(key);
};

/**
 * Invalidate all drama-related caches
 * Call this when dramas are added/updated
 */
const invalidateAllDramas = () => {
    const keys = cache.keys();
    keys.forEach(key => {
        if (key.startsWith('dramas:') || key.startsWith('top-rated:')) {
            cache.del(key);
        }
    });
};

/**
 * Get cache statistics
 */
const getStats = () => {
    return cache.getStats();
};

module.exports = {
    cache,
    CACHE_KEYS,
    get,
    set,
    invalidate,
    invalidateAllDramas,
    getStats,
};
