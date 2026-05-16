require('dotenv').config();
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { antiScraping, honeypot } = require('./middleware/antiScraping');
const productionConfig = require('./config/production');
const { QueryTypes } = require('sequelize');
const cron = require('node-cron');
const { runYouTubeAgent } = require('./services/youtubeAgent');

const app = express();
const PORT = process.env.PORT || 5000;

// trust proxy is required for express-rate-limit on certain hosts (like Render)
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(compression());

// CORS Configuration
const corsOrigins = process.env.NODE_ENV === 'production'
    ? productionConfig.cors.getOrigins()
    : [
        'http://localhost:8081',
        'http://localhost:8082',
        'http://localhost:8080',
        'http://localhost:5173',
        'http://localhost:8000'
    ];

app.use(cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting - General API limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requests per window
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter rate limit for auth routes (prevent brute force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // 15 attempts per 15 minutes
    message: {
        success: false,
        message: 'Too many login attempts, please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiters
app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

// Request Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'DramaList Pakistan API is running',
        timestamp: new Date().toISOString()
    });
});

// Anti-Scraping Protection (after rate limiting, before routes)
app.use('/api', antiScraping({
    enabled: process.env.NODE_ENV === 'production',
    strictMode: process.env.ANTI_SCRAPING_MODE === 'strict', // Enable with ANTI_SCRAPING_MODE=strict
    logAttempts: true,
}));

// Honeypot trap for scrapers (hidden endpoint)
app.get('/api/v2/data/export', honeypot);
app.get('/api/backup/dramas', honeypot);

// API Routes
app.use('/api', routes);

// Serve Static Frontend
app.use(express.static('public'));

// Lab Security Simulation Routes (FOR ASSIGNMENT ONLY)
const labRoutes = require('./routes/labRoutes');
app.use('/api/lab', labRoutes);

// 404 / Frontend Catch-all
app.use((req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({
            success: false,
            message: `Route ${req.originalUrl} not found`
        });
    }
    // Serve index.html for all non-API routes
    res.sendFile(require('path').join(__dirname, '../public/index.html'));
});

// Global Error Handler
app.use(errorHandler);

// Database Connection & Server Start
const startServer = async () => {
    try {
        // If MySQL, sync models to auto-create tables
        const isMysql = !!(process.env.MYSQL_URL || process.env.MYSQLDATABASE);
        try {
            if (isMysql) {
                console.log('🔄 MySQL detected - syncing models (creating tables if needed)...');
                await sequelize.sync({ alter: true });
                console.log('✅ MySQL tables ready.');
            } else {
                await sequelize.authenticate();
                console.log('✅ Database connection established successfully.');
            }
        } catch (dbError) {
            console.error('⚠️ Database connection failed:', dbError.message);
            console.log('🚀 Starting server anyway (Database-dependent features will be unavailable).');
        }

        // Auto-migrate from Supabase if MySQL tables are empty
        if (isMysql) {
            try {
                const [{ count }] = await sequelize.query('SELECT COUNT(*) as count FROM dramas', { type: QueryTypes.SELECT });
                if (parseInt(count) === 0) {
                    console.log('📦 Empty database detected - starting auto-migration from Supabase...');
                    // Run migration in background (non-blocking)
                    runSupabaseMigration().catch(e => console.error('Migration error:', e.message));
                } else {
                    console.log(`✅ Database has ${count} dramas. No migration needed.`);
                }
            } catch (e) {
                console.log('⚠️ Could not check drama count:', e.message);
            }
        }

        if (!process.env.VERCEL) {
            app.listen(PORT, () => {
                console.log(`🚀 Server running on http://localhost:${PORT}`);
                console.log(`📚 API Docs: http://localhost:${PORT}/api/health`);
                console.log(`🧪 Lab XSS: http://localhost:${PORT}/api/lab/xss?name=Guest`);
                console.log(`🧪 Lab CSRF: http://localhost:${PORT}/api/lab/status`);
            });

            // Initialize Background Agents
            console.log('⏰ Initializing Background Agents...');
            // Run every 2 days at midnight (0 0 */2 * *)
            cron.schedule('0 0 */2 * *', () => {
                console.log('⏰ Triggering scheduled YouTube Agent...');
                runYouTubeAgent();
            });
            console.log('✅ YouTube Agent scheduled (Runs every 2 days)');
        }
    } catch (error) {
        console.error('❌ Critical server error:', error);
        process.exit(1);
    }
};

// Auto-migration function: pulls data from Supabase REST API into MySQL
async function runSupabaseMigration() {
    const https = require('https');
    const SUPABASE_URL = 'https://txjfrsipqbtvpfsomvma.supabase.co';
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

    function fetchTable(table, order = '') {
        return new Promise((resolve, reject) => {
            const path = `/rest/v1/${table}?limit=2000${order ? '&order=' + order : ''}`;
            const req = https.request({
                hostname: 'txjfrsipqbtvpfsomvma.supabase.co',
                path, method: 'GET',
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            }, (res) => {
                let data = '';
                res.on('data', c => data += c);
                res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve([]); } });
            });
            req.on('error', reject);
            req.end();
        });
    }

    async function insertRows(model, rows) {
        let ok = 0;
        for (const row of rows) {
            try {
                await model.upsert(row);
                ok++;
            } catch (e) { /* skip */ }
        }
        return ok;
    }

    const { Drama, Channel, Genre, User, News } = require('./models');
    const tables = [
        { model: Channel, table: 'channels', order: 'id' },
        { model: Genre, table: 'genres', order: 'id' },
        { model: Drama, table: 'dramas', order: 'id' },
        { model: User, table: 'users', order: 'id' },
        { model: News, table: 'news', order: 'id' },
    ];

    for (const { model, table, order } of tables) {
        try {
            const rows = await fetchTable(table, order);
            if (!Array.isArray(rows) || rows.length === 0) { console.log(`  ⚠️ No data in ${table}`); continue; }
            const ok = await insertRows(model, rows);
            console.log(`  ✅ ${table}: ${ok}/${rows.length} rows`);
        } catch (e) { console.error(`  ❌ ${table}: ${e.message}`); }
    }
    console.log('🎉 Auto-migration from Supabase complete!');
}

startServer();

module.exports = app;
