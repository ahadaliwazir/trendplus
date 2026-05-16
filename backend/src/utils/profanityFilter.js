/**
 * Profanity Filter Utility
 * Checks text for abusive language in English and Urdu/Roman Urdu
 */

// List of blocked words (case-insensitive)
// Note: This is a basic list - extend as needed
const BLOCKED_WORDS = [
    // English profanity
    'fuck', 'fucking', 'fucked', 'fucker', 'fck', 'f*ck', 'f**k',
    'shit', 'shitty', 'sh*t', 'bullshit',
    'bitch', 'bitchy', 'b*tch',
    'ass', 'asshole', 'a**hole',
    'damn', 'damned',
    'bastard', 'b*stard',
    'crap', 'crappy',
    'dick', 'd*ck',
    'piss', 'pissed',
    'slut', 'whore', 'hoe',
    'idiot', 'stupid', 'dumb', 'moron', 'retard',
    'ugly', 'disgusting', 'pathetic', 'loser',
    'hate', 'kill', 'die', 'death',

    // Roman Urdu / Pakistani profanity
    'bhenchod', 'bc', 'b.c', 'benchod',
    'madarchod', 'mc', 'm.c', 'maderchod',
    'chutiya', 'chutia', 'c***ya',
    'gaandu', 'gandu', 'g*ndu',
    'harami', 'haramzada', 'haramzadi',
    'kameena', 'kameeni', 'kamina', 'kamini',
    'saala', 'saali', 'sala', 'sali',
    'kutti', 'kutta', 'kutiya',
    'randi', 'r*ndi',
    'bhosdike', 'bhosdi',
    'lun', 'lund', 'l*nd',
    'choot', 'phuddi', 'phudi',
    'ullu', 'gadha', 'bewakoof',
    'pagal', 'paagal',
    'jahil', 'ganwar',

    // Variations with numbers/symbols
    'f0ck', 'fuk', 'sht', 'b1tch', 'a$$',
];

// Build regex patterns for better matching
const buildPatterns = () => {
    return BLOCKED_WORDS.map(word => {
        // Escape special regex characters
        const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Match whole word, case-insensitive
        return new RegExp(`\\b${escaped}\\b`, 'gi');
    });
};

const PATTERNS = buildPatterns();

/**
 * Check if text contains profanity
 * @param {string} text - Text to check
 * @returns {{ clean: boolean, blockedWords: string[], sanitized: string }}
 */
const checkProfanity = (text) => {
    if (!text || typeof text !== 'string') {
        return { clean: true, blockedWords: [], sanitized: text };
    }

    const lowerText = text.toLowerCase();
    const foundWords = [];

    // Check against blocked words
    for (const word of BLOCKED_WORDS) {
        const wordLower = word.toLowerCase().replace(/[*]/g, '.');
        const pattern = new RegExp(`\\b${wordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        if (pattern.test(lowerText)) {
            foundWords.push(word);
        }
    }

    // Create sanitized version (replace profanity with asterisks)
    let sanitized = text;
    for (const word of foundWords) {
        const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        sanitized = sanitized.replace(pattern, '*'.repeat(word.length));
    }

    return {
        clean: foundWords.length === 0,
        blockedWords: [...new Set(foundWords)], // Remove duplicates
        sanitized
    };
};

/**
 * Check if text is clean (no profanity)
 * @param {string} text - Text to check
 * @returns {boolean}
 */
const isClean = (text) => {
    return checkProfanity(text).clean;
};

/**
 * Sanitize text by replacing profanity with asterisks
 * @param {string} text - Text to sanitize
 * @returns {string}
 */
const sanitize = (text) => {
    return checkProfanity(text).sanitized;
};

module.exports = {
    checkProfanity,
    isClean,
    sanitize,
    BLOCKED_WORDS
};
