const express = require('express');
const { getClientIp, isPrivateIp, SITE_URL } = require('../utils');

function classifySource(ref) {
  if (!ref) return { channel: 'direct', source: '直接访问' };
  try {
    const u = new URL(ref);
    const host = u.hostname.toLowerCase();
    const siteHost = (SITE_URL || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
    if (siteHost && (host === siteHost || host.endsWith('.' + siteHost))) return { channel: 'internal', source: '站内导航' };
    if (/baidu\.com|baiducontent\.com|\.baidu\./.test(host)) return { channel: 'baidu', source: '百度搜索' };
    if (/google\.|\.google/.test(host)) return { channel: 'google', source: '谷歌搜索' };
    if (/bing\.com/.test(host)) return { channel: 'bing', source: '必应搜索' };
    if (/so\.com|360\.cn|haosou\.com/.test(host)) return { channel: 'so360', source: '360搜索' };
    if (/sogou\.com/.test(host)) return { channel: 'sogou', source: '搜狗搜索' };
    if (/sm\.cn/.test(host)) return { channel: 'shenma', source: '神马搜索' };
    if (/weixin|weibo|zhihu|toutiao|douyin|xiaohongshu|bilibili|qq\.com|wechat/.test(host)) return { channel: 'social', source: host };
    return { channel: 'external', source: host };
  } catch {
    return { channel: 'external', source: ref.slice(0, 200) };
  }
}

module.exports = function (db) {
  const router = express.Router();

  router.post('/web-vitals', express.text({ type: '*/*', limit: '10kb' }), async (req, res) => {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { body = {}; }
      }
      const { name, value } = body || {};
      if (name && value != null) {
        const today = new Date().toISOString().slice(0, 10);
        const ip = getClientIp(req);
        const num = Math.min(Math.max(Number(value) || 0, 0), 999999);
        await db.prepare(
          'INSERT INTO web_vitals (date, ip, name, value) VALUES (?, ?, ?, ?)'
        ).run(today, ip, String(name).slice(0, 20), num);
      }
    } catch {}
    res.status(204).end();
  });

  router.post('/track/behavior', express.text({ type: '*/*', limit: '50kb' }), async (req, res) => {
    const today = new Date().toISOString().slice(0, 10);
    const ip = getClientIp(req);
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    const { page, dwell_time, scroll_depth, click_count, clicks } = body || {};
    if (!page) return res.type('text/plain').send('ok');

    try {
      const cappedDwell = Math.min(Math.max(0, dwell_time || 0), 3600);
      const entryTime = new Date();
      const exitTime = new Date(entryTime.getTime() + cappedDwell * 1000);
      const r = await db.prepare(
        'INSERT INTO page_behavior (date, ip, page, dwell_time, scroll_depth, click_count, entry_time, exit_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(today, ip, page, cappedDwell, scroll_depth || 0, click_count || 0, entryTime, exitTime);

      if (clicks && Array.isArray(clicks) && clicks.length > 0) {
        const batch = clicks.filter(c => c.element).map(c => [today, ip, page, c.element.slice(0, 255)]);
        if (batch.length > 0) {
          const placeholders = batch.map(() => '(?, ?, ?, ?)').join(', ');
          await db.prepare(`INSERT INTO click_events (date, ip, page, element) VALUES ${placeholders}`).run(...batch.flat());
        }
      }
    } catch (err) {
      console.error('[track/behavior]', err.message);
    }
    res.type('text/plain').send('ok');
  });

  router.post('/track/tool', express.text({ type: '*/*' }), async (req, res) => {
    const today = new Date().toISOString().slice(0, 10);
    const ip = getClientIp(req);
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    const { tool, action, detail } = body || {};
    if (!tool || !action) return res.type('text/plain').send('ok');

    const detailStr = detail != null ? (typeof detail === 'string' ? detail : JSON.stringify(detail)) : null;

    try {
      await db.prepare(
        'INSERT INTO tool_usage (date, tool, action, ip, detail) VALUES (?, ?, ?, ?, ?)'
      ).run(today, tool, action, ip, detailStr);
    } catch (err) {
      console.error('[track/tool]', err.message);
    }
    res.type('text/plain').send('ok');
  });

  router.get('/track', async (req, res) => {
    const today = new Date().toISOString().slice(0, 10);
    const ip = getClientIp(req);
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');

    const ref = (req.query.ref && typeof req.query.ref === 'string') ? req.query.ref.slice(0, 1000) : '';
    const src = classifySource(ref);

    try {
      await db.prepare('INSERT INTO page_views (date, pv, uv) VALUES (?, 1, 0) ON DUPLICATE KEY UPDATE pv = pv + 1').run(today);
      let isNewVisitor = false;
      if (!isPrivateIp(ip)) {
        const existIp = await db.prepare('SELECT id FROM visitor_ips WHERE date = ? AND ip = ?').get(today, ip);
        if (!existIp) {
          isNewVisitor = true;
          await db.prepare('INSERT IGNORE INTO visitor_ips (date, ip) VALUES (?, ?)').run(today, ip);
          await db.prepare('UPDATE page_views SET uv = uv + 1 WHERE date = ?').run(today);
        }
      }
      await db.prepare(
        'INSERT INTO traffic_sources (date, channel, source, pv, uv) VALUES (?, ?, ?, 1, ?) ON DUPLICATE KEY UPDATE pv = pv + 1, uv = uv + ?'
      ).run(today, src.channel, src.source, isNewVisitor ? 1 : 0, isNewVisitor ? 1 : 0);
    } catch (err) {
      console.error('[track]', err.message);
    }
    res.type('text/plain').send('ok');
  });

  return router;
};

module.exports.classifySource = classifySource;
