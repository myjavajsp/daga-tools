const express = require('express');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const maxmind = require('maxmind');
const { authMiddleware, generateToken } = require('../middleware/auth');
const { createCaptcha, verifyCaptcha } = require('../utils/captcha');
const { SITE_URL } = require('../utils');
const { pingSearchEngines } = require('./seo');

function getFields(body, fields) {
  const result = {};
  for (const [key, defaultValue] of Object.entries(fields)) {
    result[key] = body[key] !== undefined ? body[key] : defaultValue;
  }
  return result;
}

let geoReader = null;
const MMDB_PATH = path.join(__dirname, '..', 'geo', 'GeoLite2-City.mmdb');
try { if (fs.existsSync(MMDB_PATH)) { maxmind.open(MMDB_PATH).then(r => { geoReader = r; console.log('[Admin Geo] Loaded local GeoLite2 database'); }).catch(() => {}); } } catch { /* skip */ }

async function lookupGeo(ip) {
  if (!ip || ip === 'unknown' || ip.startsWith('192.168') || ip.startsWith('10.') || ip.startsWith('127.')) return null;

  try {
    if (geoReader) {
      const g = geoReader.get(ip);
      if (g && g.country && g.country.iso_code) {
        return {
          country: g.country.names['zh-CN'] || g.country.names.en || '',
          region: (g.subdivisions && g.subdivisions[0]) ? (g.subdivisions[0].names['zh-CN'] || g.subdivisions[0].names.en || '') : '',
          city: (g.city && g.city.names) ? (g.city.names['zh-CN'] || g.city.names.en || '') : '',
          lat: g.location ? g.location.latitude || 0 : 0,
          lon: g.location ? g.location.longitude || 0 : 0,
        };
      }
    }
  } catch { /* skip */ }

  try {
    const resp = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon&lang=zh-CN`, { signal: AbortSignal.timeout(3000) });
    const data = await resp.json();
    if (data.status === 'success') return { country: data.country, region: data.regionName, city: data.city, lat: data.lat, lon: data.lon };
  } catch { /* skip */ }
  return null;
}

module.exports = function (db) {
  const router = express.Router();

  require('./admin/auth')(router, db);

  require('./admin/content')(router, db, authMiddleware, getFields);

  /* ── 访问统计 ─────────────────────────────── */

  router.get('/stats', authMiddleware, async (req, res) => {
    try {
      const days = parseInt(req.query.days) || 7;
      const dates = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().slice(0, 10));
      }

      const rows = await db.prepare(
        'SELECT date, pv, uv FROM page_views WHERE date >= ? ORDER BY date ASC'
      ).all(dates[0]);

      const rowMap = {};
      for (const r of rows) rowMap[r.date] = r;

      const result = dates.map(date => ({
        date,
        pv: rowMap[date] ? rowMap[date].pv : 0,
        uv: rowMap[date] ? rowMap[date].uv : 0,
      }));

      const totalPv = rows.reduce((s, r) => s + r.pv, 0);
      const totalUv = rows.reduce((s, r) => s + r.uv, 0);
      const todayStr = new Date().toISOString().slice(0, 10);
      const todayRow = rowMap[todayStr] || { pv: 0, uv: 0 };

      const todayBehavior = await db.prepare(
        `SELECT COUNT(*) as sessions, COALESCE(ROUND(AVG(dwell_time)),0) as avg_dwell, COALESCE(ROUND(AVG(scroll_depth)),0) as avg_scroll, COALESCE(SUM(click_count),0) as total_clicks FROM page_behavior WHERE date = ?`
      ).get(todayStr);

      res.json({
        success: true,
        data: {
          list: result,
          summary: {
            totalPv, totalUv, todayPv: todayRow.pv, todayUv: todayRow.uv,
          },
          todayBehavior: todayBehavior || { sessions: 0, avg_dwell: 0, avg_scroll: 0, total_clicks: 0 },
        },
      });
    } catch (err) {
      console.error('[admin/stats:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /* ── 行为统计数据 ──────────────────────────── */

  router.get('/behavior-stats', authMiddleware, async (req, res) => {
    try {
      const days = parseInt(req.query.days) || 7;
      const since = new Date();
      since.setDate(since.getDate() - days);
      const sinceStr = since.toISOString().slice(0, 10);

      const daily = await db.prepare(
        `SELECT date, COUNT(*) as sessions, ROUND(AVG(dwell_time)) as avg_dwell, ROUND(AVG(scroll_depth)) as avg_scroll, SUM(click_count) as total_clicks FROM page_behavior WHERE date >= ? GROUP BY date ORDER BY date ASC`
      ).all(sinceStr);

      const topPages = await db.prepare(
        `SELECT page, COUNT(*) as visits, ROUND(AVG(dwell_time)) as avg_dwell, ROUND(AVG(scroll_depth)) as avg_scroll, SUM(click_count) as clicks FROM page_behavior WHERE date >= ? GROUP BY page ORDER BY visits DESC LIMIT 20`
      ).all(sinceStr);

      const clicks = await db.prepare(
        `SELECT ROUND(x, -1) as gx, ROUND(y, -1) as gy, COUNT(*) as count FROM click_events WHERE date >= ? GROUP BY gx, gy ORDER BY count DESC LIMIT 100`
      ).all(sinceStr);

      res.json({
        success: true,
        data: { daily, topPages, clicks, days },
      });
    } catch (err) {
      console.error('[admin/behavior-stats:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /* ── 回填已有 IP 的地理数据 ────────────────── */

  router.post('/backfill-geo', authMiddleware, async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.body.limit) || 20, 100);
      const rows = await db.prepare('SELECT id, ip FROM visitor_ips WHERE country IS NULL ORDER BY id DESC LIMIT ?').all(limit);
      const updates = [];
      for (const row of rows) {
        const geo = await lookupGeo(row.ip);
        if (geo) updates.push({ id: row.id, ...geo });
      }
      if (updates.length > 0) {
        const ids = updates.map(u => u.id);
        const sql = `UPDATE visitor_ips SET country=CASE id ${updates.map(()=>'WHEN ? THEN ?').join(' ')} END, region=CASE id ${updates.map(()=>'WHEN ? THEN ?').join(' ')} END, city=CASE id ${updates.map(()=>'WHEN ? THEN ?').join(' ')} END, lat=CASE id ${updates.map(()=>'WHEN ? THEN ?').join(' ')} END, lng=CASE id ${updates.map(()=>'WHEN ? THEN ?').join(' ')} END WHERE id IN (${ids.map(()=>'?').join(',')})`;
        const params = [];
        for (const f of ['country','region','city','lat','lon']) for (const u of updates) params.push(u.id, u[f]);
        params.push(...ids);
        await db.prepare(sql).run(...params);
      }
      res.json({ success: true, data: { processed: rows.length, filled: updates.length } });
    } catch (err) {
      console.error('[admin/backfill-geo]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /* ── 访客地图数据 ──────────────────────────── */

  router.get('/visitor-map', authMiddleware, async (req, res) => {
    try {
      const days = parseInt(req.query.days) || 7;
      const since = new Date();
      since.setDate(since.getDate() - days);
      const sinceStr = since.toISOString().slice(0, 10);

      const locations = await db.prepare(`
        SELECT ROUND(lat, 2) as lat, ROUND(lng, 2) as lng, country, region, city, COUNT(*) as count
        FROM visitor_ips
        WHERE date >= ? AND lat IS NOT NULL AND lng IS NOT NULL
        GROUP BY ROUND(lat, 2), ROUND(lng, 2), country, region, city
        ORDER BY count DESC
      `).all(sinceStr);

      const countries = await db.prepare(`
        SELECT COALESCE(country, '未知') as country, COUNT(*) as count
        FROM visitor_ips WHERE date >= ?
        GROUP BY country ORDER BY count DESC LIMIT 20
      `).all(sinceStr);

      const cities = await db.prepare(`
        SELECT COALESCE(CONCAT(COALESCE(city,''),', ',COALESCE(region,''),', ',COALESCE(country,'未知')), '未知') as label, COUNT(*) as count
        FROM visitor_ips WHERE date >= ? AND city IS NOT NULL
        GROUP BY city, region, country ORDER BY count DESC LIMIT 20
      `).all(sinceStr);

      res.json({
        success: true,
        data: { locations, countries, cities, days },
      });
    } catch (err) {
      console.error('[admin/visitor-map:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /* ── 来源渠道分析 ──────────────────────────── */

  router.get('/traffic-sources', authMiddleware, async (req, res) => {
    try {
      const days = parseInt(req.query.days) || 7;
      const since = new Date();
      since.setDate(since.getDate() - days);
      const sinceStr = since.toISOString().slice(0, 10);

      const rows = await db.prepare(
        'SELECT channel, source, SUM(pv) as pv, SUM(uv) as uv FROM traffic_sources WHERE date >= ? GROUP BY channel, source ORDER BY pv DESC'
      ).all(sinceStr);

      const channelMap = {};
      for (const r of rows) {
        if (!channelMap[r.channel]) channelMap[r.channel] = { channel: r.channel, pv: 0, uv: 0, sources: [] };
        channelMap[r.channel].pv += r.pv;
        channelMap[r.channel].uv += r.uv;
        channelMap[r.channel].sources.push({ source: r.source, pv: r.pv, uv: r.uv });
      }

      const channels = Object.values(channelMap).sort((a, b) => b.pv - a.pv);
      const totalPv = channels.reduce((s, c) => s + c.pv, 0);

      const daily = await db.prepare(
        'SELECT date, channel, SUM(pv) as pv FROM traffic_sources WHERE date >= ? GROUP BY date, channel ORDER BY date ASC'
      ).all(sinceStr);

      res.json({ success: true, data: { channels, daily, totalPv, days } });
    } catch (err) {
      console.error('[admin/traffic-sources:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /* ── 访问时段分布 ──────────────────────────── */

  router.get('/hourly-stats', authMiddleware, async (req, res) => {
    try {
      const days = parseInt(req.query.days) || 7;
      const since = new Date();
      since.setDate(since.getDate() - days);
      const sinceStr = since.toISOString().slice(0, 10);

      const rows = await db.prepare(
        'SELECT HOUR(entry_time) as h, COUNT(*) as visits, COUNT(DISTINCT ip) as uniques FROM page_behavior WHERE date >= ? AND entry_time IS NOT NULL GROUP BY HOUR(entry_time) ORDER BY h ASC'
      ).all(sinceStr);

      const hourly = [];
      for (let h = 0; h < 24; h++) {
        const found = rows.find(r => r.h === h);
        hourly.push({ hour: h, visits: found ? found.visits : 0, uniques: found ? found.uniques : 0 });
      }

      res.json({ success: true, data: { hourly, days } });
    } catch (err) {
      console.error('[admin/hourly-stats:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /* ── 访客 IP 列表 ──────────────────────────── */

  router.get('/visitor-ips', authMiddleware, async (req, res) => {
    try {
      const date = req.query.date || '';
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
      const offset = (page - 1) * limit;

      let where = '';
      const params = [];
      if (date) {
        where = 'WHERE date = ?';
        params.push(date);
      }

      const countSql = `SELECT COUNT(*) as total FROM visitor_ips ${where}`;
      const countRow = params.length
        ? (await db.prepare(countSql).get(date))
        : (await db.prepare('SELECT COUNT(*) as total FROM visitor_ips').get());

      const listSql = `SELECT id, date, ip, country, region, city FROM visitor_ips ${where} ORDER BY date DESC, id DESC LIMIT ?, ?`;
      const rows = params.length
        ? (await db.prepare(listSql).all(...params, offset, limit))
        : (await db.prepare(listSql).all(offset, limit));

      res.json({
        success: true,
        data: {
          list: rows,
          total: countRow ? countRow.total : 0,
          page,
          limit,
        },
      });
    } catch (err) {
      console.error('[admin/visitor-ips:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /* ── Meme 管理 ──────────────────────────────── */

  router.get('/memes', authMiddleware, async (req, res) => {
    try {
      const { keyword, category } = req.query;
      let sql = 'SELECT id, title, image_url, category, width, height, sort_order, is_active FROM memes WHERE 1=1';
      const params = [];
      if (keyword) { sql += ' AND (title LIKE ? OR tags LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`); }
      if (category) { sql += ' AND category = ?'; params.push(category); }
      sql += ' ORDER BY id DESC LIMIT 200';
      const rows = await db.prepare(sql).all(...params);
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('[admin/memes:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.post('/memes', authMiddleware, async (req, res) => {
    try {
      const { title, image_url, category, tags, width, height } = req.body;
      if (!title || !image_url) return res.status(400).json({ success: false, error: '标题和图片不能为空' });
      const result = await db.prepare(
        'INSERT INTO memes (title, image_url, category, tags, width, height) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(title, image_url, category || 'other', tags || '', width || 0, height || 0);
      const row = await db.prepare('SELECT id, title, image_url, category, tags, width, height, is_active FROM memes WHERE id = ?').get(result.insertId);
      res.status(201).json({ success: true, data: row });
    } catch (err) {
      console.error('[admin/memes:POST]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.put('/memes/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const sets = []; const vals = [];
      const fields = { title: null, image_url: null, category: null, tags: null, width: null, height: null, is_active: null, sort_order: null };
      for (const [k, v] of Object.entries(req.body)) {
        if (k in fields) { sets.push(`${k} = ?`); vals.push(v); }
      }
      if (sets.length === 0) return res.status(400).json({ success: false, error: '没有要更新的字段' });
      vals.push(id);
      await db.prepare(`UPDATE memes SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
      const row = await db.prepare('SELECT id, title, image_url, category, tags, width, height, is_active, sort_order FROM memes WHERE id = ?').get(id);
      res.json({ success: true, data: row });
    } catch (err) {
      console.error('[admin/memes:PUT]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.delete('/memes/:id', authMiddleware, async (req, res) => {
    try {
      await db.prepare('DELETE FROM memes WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (err) {
      console.error('[admin/memes:DELETE]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.post('/fetch-dogetu', authMiddleware, async (req, res) => {
    try {
      const { count } = req.body;
      const pageCount = count || 10;
      const pagesToFetch = Math.ceil(pageCount / 20);
      let totalInserted = 0;
      for (let p = 1; p <= pagesToFetch; p++) {
        const resp = await fetch(`https://www.dogetu.com/api/v1/posts?page=${p}&page_size=20`, { signal: AbortSignal.timeout(15000) });
        const data = await resp.json();
        if (!data || !data.data) break;
        for (const item of data.data) {
          const title = item.title || '';
          const imageUrl = item.images && item.images.original ? item.images.original.url : (item.url || '');
          if (!imageUrl) continue;
          const existing = await db.prepare('SELECT id FROM memes WHERE image_url = ?').get(imageUrl);
          if (existing) continue;
          await db.prepare('INSERT INTO memes (title, image_url, category, tags, width, height) VALUES (?, ?, ?, ?, ?, ?)').run(
            title, imageUrl, 'dogetu', item.tags ? item.tags.join(',') : '', item.width || 0, item.height || 0
          );
          totalInserted++;
          if (totalInserted >= pageCount) break;
        }
        if (totalInserted >= pageCount) break;
      }
      res.json({ success: true, data: { inserted: totalInserted } });
    } catch (err) {
      console.error('[admin/fetch-dogetu]', err.message);
      res.status(500).json({ success: false, error: '获取斗图失败' });
    }
  });

  router.post('/fetch-fabiaoqing', authMiddleware, async (req, res) => {
    try {
      const { count } = req.body;
      const pageCount = count || 10;
      let totalInserted = 0;
      for (let p = 1; p <= Math.ceil(pageCount / 20); p++) {
        const resp = await fetch(`https://www.fabiaoqing.com/bqb/lists/page/${p}.html`, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(15000) });
        const html = await resp.text();
        const matches = html.match(/<img[^>]*data-original="([^"]+)"[^>]*alt="([^"]*)"[^>]*class="ui image lazy"[^>]*>/g);
        if (!matches) break;
        for (const imgTag of matches) {
          const urlMatch = imgTag.match(/data-original="([^"]+)"/);
          const altMatch = imgTag.match(/alt="([^"]*)"/);
          if (!urlMatch) continue;
          const imageUrl = urlMatch[1];
          const title = altMatch ? altMatch[1] : '';
          const existing = await db.prepare('SELECT id FROM memes WHERE image_url = ?').get(imageUrl);
          if (existing) continue;
          await db.prepare('INSERT INTO memes (title, image_url, category, tags) VALUES (?, ?, ?, ?)').run(title, imageUrl, 'fabiaoqing', '');
          totalInserted++;
          if (totalInserted >= pageCount) break;
        }
        if (totalInserted >= pageCount) break;
      }
      res.json({ success: true, data: { inserted: totalInserted } });
    } catch (err) {
      console.error('[admin/fetch-fabiaoqing]', err.message);
      res.status(500).json({ success: false, error: '获取发表情失败' });
    }
  });

  router.post('/recategorize-memes', authMiddleware, async (req, res) => {
    try {
      const rows = await db.prepare('SELECT id, title, tags FROM memes WHERE category IS NULL OR category = ?').all('other');
      let updated = 0;
      for (const row of rows) {
        const text = (row.title + ' ' + (row.tags || '')).toLowerCase();
        let cat = 'other';
        if (/dog|cat|pet|动物|猫|狗/.test(text)) cat = 'animals';
        else if (/funny|搞笑|表情包|meme/.test(text)) cat = 'funny';
        else if (/动漫|anime|manga/.test(text)) cat = 'anime';
        else if (/明星|celebrity/.test(text)) cat = 'celebrity';
        if (cat !== 'other') {
          await db.prepare('UPDATE memes SET category = ? WHERE id = ?').run(cat, row.id);
          updated++;
        }
      }
      res.json({ success: true, data: { updated } });
    } catch (err) {
      console.error('[admin/recategorize-memes]', err.message);
      res.status(500).json({ success: false, error: '重新分类失败' });
    }
  });

  /* ── AI工具提交管理 ──────────────────────────── */

  router.get('/ai/submissions', authMiddleware, async (req, res) => {
    try {
      const { status, page = 1, limit = 20 } = req.query;
      const offset = (Math.max(1, Number(page)) - 1) * Number(limit);
      let sql = 'SELECT id, name, url, description, category, status, is_paid, is_featured, created_at FROM ai_tools_submissions WHERE 1=1';
      const params = [];
      if (status && status !== 'all') { sql += ' AND status = ?'; params.push(status); }
      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(Number(limit), offset);
      const rows = await db.prepare(sql).all(...params);
      const countRow = await db.prepare('SELECT COUNT(*) as total FROM ai_tools_submissions' + (status && status !== 'all' ? ' WHERE status = ?' : '')).get(...(status && status !== 'all' ? [status] : []));
      res.json({ success: true, data: { list: rows, total: countRow ? countRow.total : 0, page: Number(page), limit: Number(limit) } });
    } catch (err) {
      console.error('[admin/ai/submissions:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.put('/ai/submissions/:id', authMiddleware, async (req, res) => {
    try {
      const { status, is_paid, is_featured } = req.body;
      const sets = []; const params = [];
      if (status && ['pending', 'approved', 'rejected'].includes(status)) { sets.push('status = ?'); params.push(status); }
      if (is_paid !== undefined) { sets.push('is_paid = ?'); params.push(is_paid ? 1 : 0); }
      if (is_featured !== undefined) { sets.push('is_featured = ?'); params.push(is_featured ? 1 : 0); }
      if (sets.length === 0) return res.status(400).json({ success: false, error: '无有效更新字段' });
      params.push(req.params.id);
      await db.prepare(`UPDATE ai_tools_submissions SET ${sets.join(', ')} WHERE id = ?`).run(...params);
      res.json({ success: true });
    } catch (err) {
      console.error('[admin/ai/submissions:PUT]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.delete('/ai/submissions/:id', authMiddleware, async (req, res) => {
    try {
      await db.prepare('DELETE FROM ai_tools_submissions WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (err) {
      console.error('[admin/ai/submissions:DELETE]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /* ── 视频解析记录 ──────────────────────────── */

  router.get('/parse-records', authMiddleware, async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (Math.max(1, Number(page)) - 1) * Number(limit);
      const rows = await db.prepare(
        'SELECT id, url, platform, success, ip, created_at FROM parse_records ORDER BY created_at DESC LIMIT ? OFFSET ?'
      ).all(Number(limit), offset);
      const countRow = await db.prepare('SELECT COUNT(*) as total FROM parse_records').get();
      res.json({ success: true, data: { list: rows, total: countRow.total, page: Number(page), limit: Number(limit) } });
    } catch (err) {
      console.error('[admin/parse-records:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.delete('/parse-records/:id', authMiddleware, async (req, res) => {
    try {
      await db.prepare('DELETE FROM parse_records WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (err) {
      console.error('[admin/parse-records:DELETE]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /* ── M3U8播放记录 ──────────────────────────── */

  router.get('/m3u8-records', authMiddleware, async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (Math.max(1, Number(page)) - 1) * Number(limit);
      const rows = await db.prepare(
        'SELECT id, url, ip, created_at FROM m3u8_play_records ORDER BY created_at DESC LIMIT ? OFFSET ?'
      ).all(Number(limit), offset);
      const countRow = await db.prepare('SELECT COUNT(*) as total FROM m3u8_play_records').get();
      res.json({ success: true, data: { list: rows, total: countRow.total, page: Number(page), limit: Number(limit) } });
    } catch (err) {
      console.error('[admin/m3u8-records:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.delete('/m3u8-records/:id', authMiddleware, async (req, res) => {
    try {
      await db.prepare('DELETE FROM m3u8_play_records WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (err) {
      console.error('[admin/m3u8-records:DELETE]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /* ── 工具使用统计 ──────────────────────────── */

  router.get('/tool-usage', authMiddleware, async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
      const offset = (page - 1) * limit;
      const tool = req.query.tool || '';
      const date = req.query.date || '';

      let where = [];
      let params = [];
      if (tool) { where.push('tool = ?'); params.push(tool); }
      if (date) { where.push('date = ?'); params.push(date); }
      const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

      const countRow = await db.prepare(`SELECT COUNT(*) as total FROM tool_usage ${whereClause}`).get(...params);
      const rows = await db.prepare(`SELECT id, date, tool, action, ip, detail, created_at FROM tool_usage ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);

      const summary = await db.prepare('SELECT tool, COUNT(*) as count FROM tool_usage GROUP BY tool ORDER BY count DESC LIMIT 30').all();

      res.json({ success: true, data: { list: rows, total: countRow ? countRow.total : 0, page, limit, summary } });
    } catch (err) {
      console.error('[admin/tool-usage:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /* ── 工具热度趋势 ──────────────────────────── */

  router.get('/tool-trend', authMiddleware, async (req, res) => {
    try {
      const days = parseInt(req.query.days) || 7;
      const since = new Date();
      since.setDate(since.getDate() - days);
      const sinceStr = since.toISOString().slice(0, 10);

      const rows = await db.prepare(
        'SELECT date, tool, COUNT(*) as count FROM tool_usage WHERE date >= ? GROUP BY date, tool ORDER BY date ASC, count DESC'
      ).all(sinceStr);

      const dates = [];
      for (let i = 0; i < days; i++) {
        const d = new Date(since);
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().slice(0, 10));
      }

      const topTools = await db.prepare(
        'SELECT tool, COUNT(*) as total FROM tool_usage WHERE date >= ? GROUP BY tool ORDER BY total DESC LIMIT 10'
      ).all(sinceStr);
      const toolNames = topTools.map(t => t.tool);

      const matrix = {};
      for (const r of rows) {
        if (!matrix[r.date]) matrix[r.date] = {};
        matrix[r.date][r.tool] = r.count;
      }

      const trend = dates.map(date => {
        const point = { date: date.slice(5) };
        for (const tool of toolNames) {
          point[tool] = (matrix[date] && matrix[date][tool]) || 0;
        }
        return point;
      });

      res.json({ success: true, data: { trend, tools: toolNames } });
    } catch (err) {
      console.error('[admin/tool-trend:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /* ── 功能热度排行 ──────────────────────────── */

  router.get('/popular-tools', authMiddleware, async (req, res) => {
    try {
      const days = parseInt(req.query.days) || 7;
      const since = new Date();
      since.setDate(since.getDate() - days);
      const sinceStr = since.toISOString().slice(0, 10);

      const rows = await db.prepare(
        'SELECT tool, action, COUNT(*) as count FROM tool_usage WHERE date >= ? GROUP BY tool, action ORDER BY count DESC LIMIT 30'
      ).all(sinceStr);

      const toolMap = {};
      for (const r of rows) {
        if (!toolMap[r.tool]) toolMap[r.tool] = { tool: r.tool, count: 0, actions: [] };
        toolMap[r.tool].count += r.count;
        toolMap[r.tool].actions.push({ action: r.action, count: r.count });
      }
      const tools = Object.values(toolMap).sort((a, b) => b.count - a.count).slice(0, 20);

      res.json({ success: true, data: { tools, days } });
    } catch (err) {
      console.error('[admin/popular-tools:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /* ── 文章流量统计 ──────────────────────────── */

  router.get('/article-stats', authMiddleware, async (req, res) => {
    try {
      const days = parseInt(req.query.days) || 7;
      const since = new Date();
      since.setDate(since.getDate() - days);
      const sinceStr = since.toISOString().slice(0, 10);

      const dailyViews = await db.prepare(
        "SELECT date, COUNT(*) as views, COUNT(DISTINCT ip) as uniques FROM page_behavior WHERE page LIKE '/recommend/%' AND date >= ? GROUP BY date ORDER BY date ASC"
      ).all(sinceStr);

      const dates = [];
      for (let i = 0; i < days; i++) {
        const d = new Date(since);
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().slice(0, 10));
      }
      const viewMap = {};
      for (const r of dailyViews) viewMap[r.date] = r;
      const daily = dates.map(date => ({
        date: date.slice(5),
        views: viewMap[date] ? viewMap[date].views : 0,
        uniques: viewMap[date] ? viewMap[date].uniques : 0,
      }));

      const topArticles = await db.prepare(
        'SELECT id, title, slug, views, likes, category FROM articles WHERE is_published = 1 ORDER BY views DESC LIMIT 10'
      ).all();

      res.json({ success: true, data: { daily, topArticles } });
    } catch (err) {
      console.error('[admin/article-stats:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /* ── 推送订阅管理 ──────────────────────────── */

  router.get('/push-subscriptions', authMiddleware, async (req, res) => {
    try {
      const rows = await db.prepare('SELECT id, endpoint, user_agent, subscribed_at, last_notified_at FROM push_subscriptions ORDER BY id DESC LIMIT 100').all();
      const total = (await db.prepare('SELECT COUNT(*) as c FROM push_subscriptions').get()).c;
      const today = (await db.prepare("SELECT COUNT(*) as c FROM push_subscriptions WHERE DATE(subscribed_at) = CURDATE()").get()).c;
      res.json({ success: true, data: { list: rows, stats: { total, today } } });
    } catch (err) {
      console.error('[admin/push-subscriptions:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.delete('/push-subscriptions/:id', authMiddleware, async (req, res) => {
    try {
      await db.prepare('DELETE FROM push_subscriptions WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (err) {
      console.error('[admin/push-subscriptions:DELETE]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /* ── 文章管理 ──────────────────────────────── */

  router.get('/articles', authMiddleware, async (req, res) => {
    try {
      const rows = await db.prepare('SELECT id, title, slug, excerpt, cover_image, author, category, tags, is_published, published_at, created_at, updated_at FROM articles ORDER BY created_at DESC LIMIT 200').all();
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('[admin/articles:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.get('/articles/:id', authMiddleware, async (req, res) => {
    try {
      const row = await db.prepare('SELECT id, title, slug, excerpt, content, cover_image, author, category, tags, is_published, published_at, created_at, updated_at FROM articles WHERE id = ?').get(req.params.id);
      if (!row) return res.status(404).json({ success: false, error: '文章不存在' });
      res.json({ success: true, data: row });
    } catch (err) {
      console.error('[admin/articles/:id:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.post('/articles', authMiddleware, async (req, res) => {
    try {
      const { title, slug, excerpt, content, cover_image, author, category, tags, is_published } = req.body;
      if (!title || !slug) return res.status(400).json({ success: false, error: '标题和slug不能为空' });
      const existing = await db.prepare('SELECT id FROM articles WHERE slug = ?').get(slug);
      if (existing) return res.status(400).json({ success: false, error: 'slug已存在' });
      const published_at = is_published ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null;
      const result = await db.prepare(
        'INSERT INTO articles (title, slug, excerpt, content, cover_image, author, category, tags, is_published, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(title, slug, excerpt || '', content || '', cover_image || '', author || '', category || '', tags || '', is_published ? 1 : 0, published_at);
      const row = await db.prepare('SELECT id, title, slug, excerpt, content, cover_image, author, category, tags, is_published, published_at, created_at, updated_at FROM articles WHERE id = ?').get(result.insertId);
      if (is_published) pingSearchEngines(slug);
      res.status(201).json({ success: true, data: row });
    } catch (err) {
      console.error('[admin/articles:POST]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.put('/articles/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const row = await db.prepare('SELECT id, is_published, slug FROM articles WHERE id = ?').get(id);
      if (!row) return res.status(404).json({ success: false, error: '文章不存在' });
      const wasPublished = row.is_published === 1;
      const { title, slug, excerpt, content, cover_image, author, category, tags, is_published } = req.body;
      const sets = []; const vals = [];
      if (title !== undefined) { sets.push('title = ?'); vals.push(title); }
      if (slug !== undefined) { sets.push('slug = ?'); vals.push(slug); }
      if (excerpt !== undefined) { sets.push('excerpt = ?'); vals.push(excerpt); }
      if (content !== undefined) { sets.push('content = ?'); vals.push(content); }
      if (cover_image !== undefined) { sets.push('cover_image = ?'); vals.push(cover_image); }
      if (author !== undefined) { sets.push('author = ?'); vals.push(author); }
      if (category !== undefined) { sets.push('category = ?'); vals.push(category); }
      if (tags !== undefined) { sets.push('tags = ?'); vals.push(tags); }
      if (is_published !== undefined) {
        sets.push('is_published = ?, published_at = ?');
        vals.push(is_published ? 1 : 0);
        vals.push(is_published ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null);
      }
      if (sets.length === 0) return res.status(400).json({ success: false, error: '没有要更新的字段' });
      vals.push(id);
      await db.prepare(`UPDATE articles SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
      const updated = await db.prepare('SELECT id, title, slug, excerpt, content, cover_image, author, category, tags, is_published, published_at, created_at, updated_at FROM articles WHERE id = ?').get(id);
      if (is_published && !wasPublished) pingSearchEngines(row.slug);
      res.json({ success: true, data: updated });
    } catch (err) {
      console.error('[admin/articles:PUT]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.delete('/articles/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await db.prepare('SELECT id FROM articles WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ success: false, error: '文章不存在' });
      await db.prepare('DELETE FROM articles WHERE id = ?').run(id);
      res.json({ success: true, message: '删除成功' });
    } catch (err) {
      console.error('[admin/articles:DELETE]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.get('/article-categories', authMiddleware, async (req, res) => {
    try {
      const rows = await db.prepare('SELECT DISTINCT category, COUNT(*) as count FROM articles WHERE category IS NOT NULL AND category != \'\' GROUP BY category ORDER BY count DESC').all();
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('[admin/article-categories]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.post('/article-categories/rename', authMiddleware, async (req, res) => {
    try {
      const { oldName, newName } = req.body;
      if (!oldName || !newName) return res.status(400).json({ success: false, error: '参数错误' });
      await db.prepare('UPDATE articles SET category = ? WHERE category = ?').run(newName, oldName);
      res.json({ success: true });
    } catch (err) {
      console.error('[admin/article-categories/rename]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.post('/article-categories/delete', authMiddleware, async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ success: false, error: '参数错误' });
      await db.prepare('UPDATE articles SET category = NULL WHERE category = ?').run(name);
      res.json({ success: true });
    } catch (err) {
      console.error('[admin/article-categories/delete]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  return router;
};
