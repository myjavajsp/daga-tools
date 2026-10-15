function isAllowedImageUrl(url) {
  try {
    const allowedDomains = ['dogetu.com', 'soutula.com', 'fabiaoqing.com', 'dicebear.com', 'api.dicebear.com'];
    const u = new URL(url);
    return allowedDomains.some(d => u.hostname === d || u.hostname.endsWith('.' + d));
  } catch { return false; }
}

module.exports = function (db) {
  const express = require('express');
  const router = express.Router();

  router.get('/search', async (req, res) => {
    const { keyword, category, page = 1, limit = 30 } = req.query;
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const size = Math.min(parseInt(limit), 60);

    try {
      let where = ['is_active = 1'];
      let params = [];

      if (keyword && keyword.trim()) {
        where.push('(title LIKE ? OR tags LIKE ?)');
        const kw = `%${keyword.trim()}%`;
        params.push(kw, kw);
      }

      if (category && category.trim() && category !== 'all') {
        where.push('category = ?');
        params.push(category.trim());
      }

      const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

      const countRow = await db.prepare(`SELECT COUNT(*) as cnt FROM memes ${whereClause}`).get(...params);
      const total = countRow ? countRow.cnt : 0;

      const rows = await db.prepare(`SELECT id, title, image_url, category, width, height, sort_order FROM memes ${whereClause} ORDER BY sort_order ASC, id DESC LIMIT ? OFFSET ?`).all(...params, size, offset);

      res.set('Cache-Control', 'public, max-age=120');
      res.json({ success: true, data: rows, total, page: parseInt(page), pages: Math.ceil(total / size) });
    } catch (err) {
      console.error('[Meme] Search error:', err.message);
      res.json({ success: false, message: '查询失败' });
    }
  });

  router.get('/categories', async (req, res) => {
    try {
      const rows = await db.prepare('SELECT category, COUNT(*) as count FROM memes WHERE is_active = 1 GROUP BY category ORDER BY count DESC').all();
      res.set('Cache-Control', 'public, max-age=600');
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('[Meme] Categories error:', err.message);
      res.json({ success: false, message: '查询失败' });
    }
  });

  router.get('/img', async (req, res) => {
    const { seed, backgroundColor } = req.query;
    if (!seed) return res.status(400).json({ success: false, message: 'Missing seed' });
    try {
      let url = `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(seed)}`;
      if (backgroundColor) url += `&backgroundColor=${encodeURIComponent(backgroundColor)}`;
      const resp = await fetch(url, { signal: AbortSignal.timeout(8000), headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!resp.ok) return res.status(502).send('Upstream error');
      const svg = await resp.text();
      res.set('Content-Type', 'image/svg+xml; charset=utf-8');
      res.set('Cache-Control', 'public, max-age=86400');
      res.send(svg);
    } catch (err) {
      console.error('[Meme] Proxy error:', err.message);
      res.status(502).send('Proxy error');
    }
  });

  router.get('/proxy', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false, message: 'Missing url' });
    if (!isAllowedImageUrl(url)) return res.status(403).json({ success: false, message: 'URL not allowed' });
    try {
      let referer = 'https://www.dogetu.com/';
      if (url.includes('soutula.com') || url.includes('fabiaoqing')) referer = 'https://www.fabiaoqing.com/';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const resp = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': referer },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!resp.ok) return res.status(502).send('Upstream error');
      const contentType = resp.headers.get('content-type') || 'image/jpeg';
      const buffer = Buffer.from(await resp.arrayBuffer());
      res.set('Content-Type', contentType);
      res.set('Cache-Control', 'public, max-age=86400');
      res.send(buffer);
    } catch (err) {
      console.error('[Meme] Proxy error:', err.message);
      res.status(502).send('Proxy error');
    }
  });

  router.get('/random', async (req, res) => {
    try {
      const countRow = await db.prepare('SELECT COUNT(*) as cnt FROM memes WHERE is_active = 1').get();
      const total = countRow ? countRow.cnt : 0;
      if (total <= 12) {
        const rows = await db.prepare('SELECT id, title, image_url, category, width, height, sort_order FROM memes WHERE is_active = 1 ORDER BY sort_order ASC, id DESC LIMIT 12').all();
        return res.json({ success: true, data: rows });
      }
      const maxOffset = total - 12;
      const offset = Math.floor(Math.random() * maxOffset);
      const rows = await db.prepare('SELECT id, title, image_url, category, width, height, sort_order FROM memes WHERE is_active = 1 ORDER BY id DESC LIMIT 12 OFFSET ?').all(offset);
      res.set('Cache-Control', 'public, max-age=120');
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('[Meme] Random error:', err.message);
      res.json({ success: false, message: '查询失败' });
    }
  });

  return router;
};
