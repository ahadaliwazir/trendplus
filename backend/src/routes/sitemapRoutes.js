const express = require('express');
const router = express.Router();
const { Drama, Channel, CastMember } = require('../models');

const BASE_URL = process.env.FRONTEND_URL || 'https://meridramalist.com';

/**
 * Generate dynamic XML sitemap with all drama URLs
 * GET /api/sitemap/sitemap.xml
 */
router.get('/sitemap.xml', async (req, res) => {
  try {
    // Fetch all published dramas
    const dramas = await Drama.findAll({
      attributes: ['id', 'title', 'slug', 'updated_at'],
      order: [['updated_at', 'DESC']],
      raw: true
    });

    // Fetch all channels
    const channels = await Channel.findAll({
      attributes: ['id', 'name'],
      raw: true
    });

    // Fetch all cast members (actors)
    const actors = await CastMember.findAll({
      attributes: ['id', 'name', 'created_at'],
      order: [['created_at', 'DESC']],
      raw: true
    });

    const today = new Date().toISOString().split('T')[0];

    // Build XML sitemap
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  
  <!-- Static Pages -->
  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <lastmod>${today}</lastmod>
  </url>
  
  <url>
    <loc>${BASE_URL}/top-rated</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <lastmod>${today}</lastmod>
  </url>
  
  <url>
    <loc>${BASE_URL}/news</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    <lastmod>${today}</lastmod>
  </url>
  
  <url>
    <loc>${BASE_URL}/social</loc>
    <changefreq>hourly</changefreq>
    <priority>0.7</priority>
    <lastmod>${today}</lastmod>
  </url>
`;

    // Add drama pages (high priority)
    for (const drama of dramas) {
      const lastmod = drama.updated_at
        ? new Date(drama.updated_at).toISOString().split('T')[0]
        : today;
      const slug = drama.slug || drama.id;

      xml += `
  <url>
    <loc>${BASE_URL}/drama/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${lastmod}</lastmod>
  </url>`;
    }

    // Add actor pages
    for (const actor of actors) {
      const lastmod = actor.created_at
        ? new Date(actor.created_at).toISOString().split('T')[0]
        : today;

      xml += `
  <url>
    <loc>${BASE_URL}/actor/${actor.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <lastmod>${lastmod}</lastmod>
  </url>`;
    }

    xml += `
</urlset>`;

    // Set XML content type and cache for 1 hour
    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(xml);

  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate sitemap',
    });
  }
});

/**
 * Generate robots.txt dynamically
 * GET /api/sitemap/robots.txt
 */
router.get('/robots.txt', (req, res) => {
  const robots = `# MeriDramaList - Robots.txt
# ${BASE_URL}

# Allow all search engines
User-agent: *
Allow: /

# Crawl delay to be respectful
Crawl-delay: 1

# Block admin pages from indexing
Disallow: /admin
Disallow: /admin/*

# Block API routes
Disallow: /api/
Allow: /api/sitemap/

# Block authentication pages
Disallow: /login
Disallow: /signup
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /profile
Disallow: /dashboard

# Social media crawlers - full access
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: WhatsApp
Allow: /

# Sitemap location
Sitemap: ${BASE_URL}/sitemap.xml
`;

  res.set('Content-Type', 'text/plain');
  res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
  res.send(robots);
});

module.exports = router;
