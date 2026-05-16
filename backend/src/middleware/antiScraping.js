/**
 * Anti-Scraping Middleware
 * Protects API from automated scraping attempts
 */

// Known bot user agents to block
const BLOCKED_USER_AGENTS = [
    'scrapy', 'python-requests', 'curl', 'wget', 'httpclient',
    'java', 'libwww', 'lwp-trivial', 'sitesucker', 'webcopier',
    'httrack', 'websauger', 'webzip', 'pavuk', 'offline explorer',
    'teleport', 'webcapture', 'webgrab', 'webautomation',
    'webbandit', 'webstripper', 'sitesnagger', 'blackwidow',
    'zeus', 'mechanize', 'phantomjs', 'headlesschrome',
];

// Suspicious patterns in requests
const SUSPICIOUS_PATTERNS = [
    /\/api\/dramas\?.*page=\d{3,}/, // Requesting very high page numbers
    /\/api\/.*\.(json|xml|csv)$/,   // Trying to force file formats
];

// Track request frequency per IP
const requestTracker = new Map();
const WINDOW_MS = 60000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute for scraping detection
const BURST_THRESHOLD = 10; // 10 requests in 2 seconds is suspicious
const BURST_WINDOW_MS = 2000;

// Blocked IPs (temporary)
const blockedIPs = new Map();
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Check if user agent looks like a bot
 */
const isBot = (userAgent) => {
    if (!userAgent) return true; // No user agent = likely bot

    const ua = userAgent.toLowerCase();

    // Check against blocked user agents
    for (const blocked of BLOCKED_USER_AGENTS) {
        if (ua.includes(blocked)) return true;
    }

    // Check for missing browser indicators
    const hasBrowserIndicator =
        ua.includes('mozilla') ||
        ua.includes('chrome') ||
        ua.includes('safari') ||
        ua.includes('firefox') ||
        ua.includes('edge') ||
        ua.includes('opera');

    if (!hasBrowserIndicator) return true;

    return false;
};

/**
 * Check for suspicious request patterns
 */
const isSuspiciousRequest = (req) => {
    const url = req.originalUrl || req.url;

    for (const pattern of SUSPICIOUS_PATTERNS) {
        if (pattern.test(url)) return true;
    }

    // Check for missing common browser headers
    if (!req.headers['accept-language'] && !req.headers['accept-encoding']) {
        return true;
    }

    return false;
};

/**
 * Track and analyze request frequency
 */
const trackRequest = (ip) => {
    const now = Date.now();

    if (!requestTracker.has(ip)) {
        requestTracker.set(ip, { requests: [], blocked: false });
    }

    const tracker = requestTracker.get(ip);

    // Clean old requests
    tracker.requests = tracker.requests.filter(time => now - time < WINDOW_MS);

    // Add current request
    tracker.requests.push(now);

    // Check for burst (many requests in short time)
    const recentRequests = tracker.requests.filter(time => now - time < BURST_WINDOW_MS);
    if (recentRequests.length > BURST_THRESHOLD) {
        return { blocked: true, reason: 'burst' };
    }

    // Check for sustained high frequency
    if (tracker.requests.length > MAX_REQUESTS_PER_WINDOW) {
        return { blocked: true, reason: 'frequency' };
    }

    return { blocked: false };
};

/**
 * Main anti-scraping middleware
 */
const antiScraping = (options = {}) => {
    const {
        enabled = true,
        strictMode = false, // Block on first suspicion
        logAttempts = true,
        whitelist = [], // Whitelisted IPs
    } = options;

    return (req, res, next) => {
        if (!enabled) return next();

        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || '';

        // Check whitelist
        if (whitelist.includes(ip)) return next();

        // Check if IP is temporarily blocked
        if (blockedIPs.has(ip)) {
            const blockInfo = blockedIPs.get(ip);
            if (Date.now() < blockInfo.until) {
                if (logAttempts) {
                    console.log(`[ANTI-SCRAPE] Blocked request from ${ip} (reason: ${blockInfo.reason})`);
                }
                return res.status(429).json({
                    success: false,
                    message: 'Access temporarily restricted. Please try again later.',
                });
            } else {
                blockedIPs.delete(ip);
            }
        }

        // Check for bot user agent
        if (isBot(userAgent)) {
            if (strictMode) {
                blockedIPs.set(ip, { until: Date.now() + BLOCK_DURATION_MS, reason: 'bot-ua' });
                if (logAttempts) {
                    console.log(`[ANTI-SCRAPE] Blocked bot: ${ip} - UA: ${userAgent.substring(0, 50)}`);
                }
                return res.status(403).json({
                    success: false,
                    message: 'Access denied.',
                });
            }
        }

        // Check for suspicious request patterns
        if (isSuspiciousRequest(req)) {
            if (strictMode) {
                if (logAttempts) {
                    console.log(`[ANTI-SCRAPE] Suspicious request from ${ip}: ${req.originalUrl}`);
                }
                return res.status(400).json({
                    success: false,
                    message: 'Invalid request.',
                });
            }
        }

        // Track request frequency
        const frequencyCheck = trackRequest(ip);
        if (frequencyCheck.blocked) {
            blockedIPs.set(ip, {
                until: Date.now() + BLOCK_DURATION_MS,
                reason: frequencyCheck.reason
            });
            if (logAttempts) {
                console.log(`[ANTI-SCRAPE] Rate limit exceeded: ${ip} (${frequencyCheck.reason})`);
            }
            return res.status(429).json({
                success: false,
                message: 'Too many requests. Please slow down.',
            });
        }

        // Add security headers to prevent easy scraping
        res.setHeader('X-Robots-Tag', 'noindex, nofollow');
        res.setHeader('X-Content-Type-Options', 'nosniff');

        next();
    };
};

/**
 * Honeypot endpoint - trap for scrapers
 * Add fake links that real users won't click but scrapers will follow
 */
const honeypot = (req, res) => {
    const ip = req.ip || req.connection.remoteAddress;
    console.log(`[HONEYPOT] Trapped scraper: ${ip}`);

    // Block this IP
    blockedIPs.set(ip, {
        until: Date.now() + (60 * 60 * 1000), // 1 hour block
        reason: 'honeypot'
    });

    // Return fake data to waste their time
    res.status(200).json({
        success: true,
        data: Array(100).fill({ id: 0, title: 'Data not available', rating: 0 })
    });
};

// Cleanup old entries periodically
setInterval(() => {
    const now = Date.now();

    // Clean request tracker
    for (const [ip, data] of requestTracker.entries()) {
        data.requests = data.requests.filter(time => now - time < WINDOW_MS);
        if (data.requests.length === 0) {
            requestTracker.delete(ip);
        }
    }

    // Clean expired blocks
    for (const [ip, data] of blockedIPs.entries()) {
        if (now > data.until) {
            blockedIPs.delete(ip);
        }
    }
}, 60000); // Every minute

module.exports = { antiScraping, honeypot };
