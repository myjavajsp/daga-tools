const express = require('express');
const { MemoryCache } = require('../cache');
const { SITE_URL } = require('../utils');

module.exports = function (db) {
  const router = express.Router();
  const cache = new MemoryCache(300);

  function cachedHandler(key, fetcher, ttl) {
    return async (req, res) => {
      try {
        const cached = cache.get(key);
        if (cached) {
          res.set('Cache-Control', `public, max-age=${ttl || 300}`);
          return res.json({ success: true, data: cached });
        }
        const data = await fetcher(req);
        cache.set(key, data, (ttl || 300) * 1000);
        res.set('Cache-Control', `public, max-age=${ttl || 300}`);
        res.json({ success: true, data });
      } catch (err) {
        console.error(`[public/${key}]`, err.message);
        res.status(500).json({ success: false, error: '服务器错误' });
      }
    };
  }

  router.get('/interfaces', cachedHandler('interfaces', async () => {
    const rows = await db.prepare(
      'SELECT id, name, url, type, sort_order FROM parse_interfaces WHERE is_active = 1 ORDER BY sort_order ASC'
    ).all();

    // Filter out interfaces with known issues (DNS failure / 301 redirects)
    // Keep z1.m1907.top even though it has iframe guard — client-side auto-rotation handles it
    const blockedPatterns = [
      'jx.jsonplayer',   // DNS解析失败
      'jx.nnxv',         // 301 失效
      'api.quanminjiexi',// 301 失效
    ];
    const safe = rows.filter(r => {
      const url = (r.url || '').toLowerCase();
      return !blockedPatterns.some(p => url.includes(p));
    });
    if (safe.length < rows.length) console.log(`[Interfaces] Filtered ${rows.length - safe.length} broken interface(s)`);
    return safe.length > 0 ? safe : rows;
  }, 600));

  router.get('/settings', cachedHandler('settings', async () => {
    const allowedKeys = ['site_title', 'site_keywords', 'site_description', 'enable_ad_preroll', 'vapid_public_key'];
    const rows = await db.prepare('SELECT `key`, `value` FROM site_settings').all();
    const settings = {};
    for (const row of rows) {
      if (allowedKeys.includes(row.key)) settings[row.key] = row.value;
    }
    return settings;
  }, 300));

  router.get('/guide', cachedHandler('guide', async () => {
    return await db.prepare(
      'SELECT id, step_number, content, sort_order FROM guide_steps ORDER BY sort_order ASC'
    ).all();
  }, 3600));

  router.get('/faq', cachedHandler('faq', async () => {
    return await db.prepare(
      'SELECT id, question, answer, sort_order FROM faqs ORDER BY sort_order ASC'
    ).all();
  }, 3600));

  router.get('/links', cachedHandler('links', async () => {
    return await db.prepare(
      'SELECT id, name, icon_url, link_url, sort_order FROM recommend_links WHERE is_active = 1 ORDER BY sort_order ASC'
    ).all();
  }, 300));

  router.get('/ads', cachedHandler('ads', async (req) => {
    let sql = "SELECT id, position, name, code FROM ads WHERE is_active = 1 AND position != 'bottom'";
    const params = [];
    if (req.query.position) {
      sql += ' AND position = ?';
      params.push(req.query.position);
    }
    sql += ' ORDER BY id ASC';
    return await db.prepare(sql).all(...params);
  }, 300));

  // Image proxy to bypass hotlink protection (doubanio.com, wikimedia.org, etc.)
  router.get('/img-proxy', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send('Missing url');
    // Local paths (legacy links / cached HTML) -> redirect directly
    if (url.startsWith('/') && !url.startsWith('//')) {
      return res.redirect(302, url);
    }
    try {
      let referer = `${SITE_URL}/`;
      if (url.includes('douban')) referer = 'https://movie.douban.com/';
      else if (url.includes('wikimedia')) referer = 'https://zh.wikipedia.org/';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const resp = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Referer': referer },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!resp.ok) {
        const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><rect fill="#f3f4f6" width="300" height="450"/><text x="150" y="225" text-anchor="middle" fill="#9ca3af" font-size="14">Image not available</text></svg>';
        res.set('Content-Type', 'image/svg+xml');
        res.set('Cache-Control', 'public, max-age=3600');
        return res.send(svg);
      }
      const contentType = resp.headers.get('content-type') || 'image/jpeg';
      const buffer = Buffer.from(await resp.arrayBuffer());
      res.set('Content-Type', contentType);
      res.set('Cache-Control', 'public, max-age=86400');
      res.send(buffer);
    } catch (err) {
      console.error('[img-proxy]', err.message);
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><rect fill="#f3f4f6" width="300" height="450"/><text x="150" y="225" text-anchor="middle" fill="#9ca3af" font-size="14">Image not available</text></svg>';
      res.set('Content-Type', 'image/svg+xml');
      res.set('Cache-Control', 'public, max-age=3600');
      res.send(svg);
    }
  });

  function proxyImgUrl(src) {
    if (!src || src.startsWith('/') || src.includes('ityvip.xyz') || src.includes('localhost')) return src;
    return '/api/public/img-proxy?url=' + encodeURIComponent(src);
  }

  function rewriteArticle(article) {
    if (!article) return article;
    if (article.cover_image) article.cover_image = proxyImgUrl(article.cover_image);
    if (article.content) {
      article.content = article.content.replace(
        /<img\s+[^>]*src="(https?:\/\/[^"]+)"[^>]*>/gi,
        (match, src) => match.replace(src, proxyImgUrl(src))
      );
      const { TOOL_TAGS, TOOL_SLUG_TITLES } = require('./seo');
      for (const [slug, tags] of Object.entries(TOOL_TAGS)) {
        const toolUrl = `/tools/${slug}`;
        const keywords = tags.split(',').map(t => t.trim()).filter(t => t.length >= 3);
        for (const kw of keywords) {
          const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          article.content = article.content.replace(
            new RegExp(`(>|^)(${escaped})(<|$)`, 'gi'),
            (_, before, match, after) => `${before}<a href="${toolUrl}">${match}</a>${after}`
          );
        }
      }
    }
    return article;
  }

  router.get('/articles', async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const size = Math.min(Math.max(1, Number(limit)), 500);
      const offset = (Math.max(1, Number(page)) - 1) * size;
      const rows = await db.prepare(
        'SELECT id, title, slug, excerpt, cover_image, author, category, tags, views, likes, published_at FROM articles WHERE is_published = 1 ORDER BY published_at DESC LIMIT ? OFFSET ?'
      ).all(size, offset);
      const countRow = await db.prepare('SELECT COUNT(*) as total FROM articles WHERE is_published = 1').get();
      res.set('Cache-Control', 'public, max-age=300');
      res.json({ success: true, data: { list: rows.map(rewriteArticle), total: countRow ? countRow.total : 0, page: Number(page), limit: size } });
    } catch (err) {
      console.error('[public/articles]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.get('/articles/related', async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) return res.json({ success: true, data: [] });
      const rows = await db.prepare(
        'SELECT id, title, slug, excerpt, cover_image, category, published_at FROM articles WHERE is_published = 1 AND (title LIKE ? OR tags LIKE ?) ORDER BY views DESC LIMIT 4'
      ).all(`%${q}%`, `%${q}%`);
      res.set('Cache-Control', 'public, max-age=300');
      res.json({ success: true, data: (rows || []).map(rewriteArticle) });
    } catch (err) {
      console.error('[public/articles/related]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.get('/articles/popular', async (req, res) => {
    try {
      const rows = await db.prepare(
        'SELECT id, title, slug, excerpt, cover_image, category, views, published_at FROM articles WHERE is_published = 1 ORDER BY views DESC LIMIT 5'
      ).all();
      res.set('Cache-Control', 'public, max-age=600');
      res.json({ success: true, data: (rows || []).map(rewriteArticle) });
    } catch (err) {
      console.error('[public/articles/popular]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.get('/articles/:slug', async (req, res) => {
    try {
      const row = await db.prepare('SELECT id, title, slug, excerpt, content, cover_image, author, category, tags, views, likes, published_at FROM articles WHERE slug = ? AND is_published = 1').get(req.params.slug);
      if (!row) return res.status(404).json({ success: false, error: '文章不存在' });
      res.set('Cache-Control', 'public, max-age=600');
      res.json({ success: true, data: rewriteArticle(row) });
    } catch (err) {
      console.error('[public/articles/:slug]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.post('/articles/:slug/view', async (req, res) => {
    try {
      await db.prepare('UPDATE articles SET views = views + 1 WHERE slug = ?').run(req.params.slug);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.post('/articles/:slug/like', async (req, res) => {
    try {
      const row = await db.prepare('SELECT likes FROM articles WHERE slug = ?').get(req.params.slug);
      if (!row) return res.status(404).json({ success: false, error: '文章不存在' });
      await db.prepare('UPDATE articles SET likes = likes + 1 WHERE slug = ?').run(req.params.slug);
      res.json({ success: true, likes: row.likes + 1 });
    } catch (err) {
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.get('/ads/bottom', async (req, res) => {
    try {
      const rows = await db.prepare(
        "SELECT id, position, name, code FROM ads WHERE is_active = 1 AND position = 'bottom' ORDER BY id ASC"
      ).all();
      res.set('Cache-Control', 'public, max-age=300');
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('[public/ads/bottom]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  // Tool usage stats for public ranking (limited to summary only)
  router.get('/tool-usage-stats', async (req, res) => {
    try {
      const rows = await db.prepare('SELECT tool, COUNT(*) as count FROM tool_usage GROUP BY tool ORDER BY count DESC LIMIT 30').all();
      res.set('Cache-Control', 'public, max-age=300');
      res.json({ success: true, data: rows || [] });
    } catch (err) {
      console.error('[public/tool-usage-stats]', err.message);
      res.json({ success: false, data: [] });
    }
  });

  // Related tools by article tags
  router.get('/tools/related', async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) return res.json({ success: true, data: [] });

      const toolMap = require('./seo').TOOL_TAGS || {};
      const matched = [];
      const query = q.toLowerCase();
      for (const [slug, tags] of Object.entries(toolMap)) {
        if (tags.toLowerCase().includes(query) || query.includes(slug.replace(/-/g, ''))) {
          matched.push({ slug, title: require('./seo').TOOL_SLUG_TITLES?.[slug] || slug.replace(/-/g, ' '), tags });
        }
      }
      res.set('Cache-Control', 'public, max-age=300');
      res.json({ success: true, data: matched.slice(0, 6) });
    } catch (err) {
      console.error('[public/tools/related]', err.message);
      res.json({ success: true, data: [] });
    }
  });

  // IP lookup proxy (ip-api.com is accessible from the China server)
  router.get('/ip-lookup', async (req, res) => {
    try {
      const ip = req.query.ip || '';
      const url = ip
        ? `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city,zip,lat,lon,isp,org,as,query,timezone&lang=zh-CN`
        : 'http://ip-api.com/json/?fields=status,country,regionName,city,zip,lat,lon,isp,org,as,query,timezone&lang=zh-CN';
      const resp = await fetch(url, { signal: AbortSignal.timeout(5000) });
      const data = await resp.json();
      if (data.status === 'success') {
        res.set('Cache-Control', 'public, max-age=60');
        res.json({ success: true, data });
      } else {
        res.json({ success: false, error: data.message || '查询失败' });
      }
    } catch (err) {
      console.error('[public/ip-lookup]', err.message);
      res.status(500).json({ success: false, error: '查询失败' });
    }
  });

  return router;
};
