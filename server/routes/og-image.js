const express = require('express');
const sharp = require('sharp');

const W = 1200, H = 630;

function ogSvg(title, subtitle, type) {
  const accent = type === 'article' ? '#48bb78' : type === 'tool' ? '#e94560' : '#4299e1';
  return `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="100%" style="stop-color:#0f3460"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="150" cy="-50" r="400" fill="${accent}" opacity="0.08"/>
  <circle cx="1050" cy="630" r="350" fill="${accent}" opacity="0.06"/>
  <text x="600" y="280" text-anchor="middle" fill="white" font-family="sans-serif" font-size="${title.length > 20 ? 36 : 48}" font-weight="bold">${escapeXml(title)}</text>
  <text x="600" y="350" text-anchor="middle" fill="#a0aec0" font-family="sans-serif" font-size="22">${escapeXml(subtitle)}</text>
  <rect x="500" y="380" width="200" height="3" rx="1.5" fill="${accent}"/>
  <text x="600" y="460" text-anchor="middle" fill="#718096" font-family="sans-serif" font-size="18">www.ityvip.xyz</text>
</svg>`;
}

function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

module.exports = function () {
  const router = express.Router();

  router.get('/og-image', async (req, res) => {
    try {
      const title = (req.query.title || '全民影视').slice(0, 60);
      const subtitle = (req.query.subtitle || '免费在线工具站').slice(0, 100);
      const type = req.query.type || 'site';
      const svg = ogSvg(title, subtitle, type);
      const png = await sharp(Buffer.from(svg)).resize(W, H).png().toBuffer();
      res.set('Content-Type', 'image/png');
      res.set('Cache-Control', 'public, max-age=86400');
      res.send(png);
    } catch (e) {
      res.status(500).end();
    }
  });

  return router;
};
