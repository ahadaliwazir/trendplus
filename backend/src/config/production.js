/**
 * Production Configuration for MeriDramaList
 * 
 * These settings are used when NODE_ENV=production
 * Set environment variables in your hosting provider (Render, Railway, etc.)
 */

module.exports = {
    // Required Environment Variables for Production:
    // 
    // JWT_SECRET - Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
    // DB_HOST - Your PlanetScale/database host
    // DB_NAME - Database name
    // DB_USER - Database username  
    // DB_PASSWORD - Database password
    // CORS_ORIGIN - https://meridramalist.com,https://www.meridramalist.com
    // FRONTEND_URL - https://meridramalist.com

    cors: {
        // Production CORS settings
        // Set CORS_ORIGIN env variable to your domains (comma-separated)
        getOrigins: () => {
            const origins = process.env.CORS_ORIGIN;
            if (!origins) {
                console.warn('⚠️  CORS_ORIGIN not set! Using default.');
                return ['https://meridramalist.com'];
            }
            return origins.split(',').map(o => o.trim());
        }
    },

    jwt: {
        // JWT expires in 7 days by default
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',

        // Validate JWT_SECRET is strong enough
        validateSecret: () => {
            const secret = process.env.JWT_SECRET;
            if (!secret || secret.length < 32) {
                throw new Error('JWT_SECRET must be at least 32 characters for production!');
            }
            return true;
        }
    },

    rateLimit: {
        // General API rate limit
        api: {
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
            max: parseInt(process.env.RATE_LIMIT_MAX) || 200
        },
        // Auth route rate limit (stricter to prevent brute force)
        auth: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10
        }
    },

    antiScraping: {
        // Enable strict mode in production
        enabled: true,
        strictMode: process.env.ANTI_SCRAPING_MODE === 'strict',
        logAttempts: true
    },

    database: {
        // SSL required for production databases like PlanetScale
        ssl: process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production',

        dialectOptions: {
            ssl: {
                rejectUnauthorized: true
            }
        }
    }
};
