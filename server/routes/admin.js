/**
 * daga-clone — server/routes/admin.js
 * 管理后台 API（完整 CRUD）
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { authMiddleware, generateToken } = require('../middleware/auth');
const { createCaptcha, verifyCaptcha } = require('../utils/captcha');

/** 辅助：获取请求体中的字段，缺失时返回默认值 */
function getFields(body, fields) {
  const result = {};
  for (const [key, defaultValue] of Object.entries(fields)) {
    result[key] = body[key] !== undefined ? body[key] : defaultValue;
  }
  return result;
}

/**
 * @param {object} db — sql.js 包装后的 Database 实例
 */
module.exports = function (db) {
  const router = express.Router();

  /* ══════════════════════════════════════════════
   *  认证接口
   * ══════════════════════════════════════════════ */

  /** GET /api/admin/captcha — 获取验证码图片 */
  router.get('/captcha', (req, res) => {
    try {
      const { captchaId, imageData } = createCaptcha();
      res.json({ success: true, data: { captchaId, imageData } });
    } catch (err) {
      console.error('[admin/captcha]', err.message);
      res.status(500).json({ success: false, error: '生成验证码失败' });
    }
  });

  /** POST /api/admin/login */
  router.post('/login', (req, res) => {
    try {
      const { username, password, captchaId, captchaCode } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, error: '用户名和密码不能为空' });
      }

      // 验证码校验
      const captchaResult = verifyCaptcha(captchaId, captchaCode);
      if (!captchaResult.valid) {
        return res.status(400).json({ success: false, error: captchaResult.reason || '验证码错误' });
      }

      const admin = db.prepare('SELECT id, username, password FROM admins WHERE username = ?').get(username);
      if (!admin) {
        return res.status(401).json({ success: false, error: '用户名或密码错误' });
      }
      if (!bcrypt.compareSync(password, admin.password)) {
        return res.status(401).json({ success: false, error: '用户名或密码错误' });
      }
      const token = generateToken({ id: admin.id, username: admin.username });
      res.json({ success: true, data: { token, user: { id: admin.id, username: admin.username } } });
    } catch (err) {
      console.error('[admin/login]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /** GET /api/admin/me */
  router.get('/me', authMiddleware, (req, res) => {
    res.json({ success: true, data: { id: req.admin.id, username: req.admin.username } });
  });

  /* ══════════════════════════════════════════════
   *  解析接口 CRUD
   * ══════════════════════════════════════════════ */

  router.get('/interfaces', authMiddleware, (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM parse_interfaces ORDER BY sort_order ASC').all();
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('[admin/interfaces:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.post('/interfaces', authMiddleware, (req, res) => {
    try {
      const { name, url, type, sort_order } = getFields(req.body, { name: '', url: '', type: 'video', sort_order: 0 });
      if (!name || !url) {
        return res.status(400).json({ success: false, error: '名称和URL不能为空' });
      }
      db.prepare(
        'INSERT INTO parse_interfaces (name, url, type, sort_order, is_active) VALUES (?, ?, ?, ?, 1)'
      ).run(name, url, type, sort_order);
      db.save();
      const row = db.prepare('SELECT * FROM parse_interfaces ORDER BY id DESC LIMIT 1').get();
      res.status(201).json({ success: true, data: row });
    } catch (err) {
      console.error('[admin/interfaces:POST]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.put('/interfaces/:id', authMiddleware, (req, res) => {
    try {
      const { id } = req.params;
      const existing = db.prepare('SELECT id FROM parse_interfaces WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ success: false, error: '记录不存在' });

      const { name, url, type, sort_order, is_active } = getFields(req.body, { name: null, url: null, type: null, sort_order: null, is_active: null });
      const sets = [];
      const vals = [];
      if (name !== null) { sets.push('name = ?'); vals.push(name); }
      if (url !== null) { sets.push('url = ?'); vals.push(url); }
      if (type !== null) { sets.push('type = ?'); vals.push(type); }
      if (sort_order !== null) { sets.push('sort_order = ?'); vals.push(sort_order); }
      if (is_active !== null) { sets.push('is_active = ?'); vals.push(is_active); }
      if (sets.length === 0) return res.status(400).json({ success: false, error: '没有要更新的字段' });

      vals.push(id);
      db.prepare(`UPDATE parse_interfaces SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
      db.save();
      const row = db.prepare('SELECT * FROM parse_interfaces WHERE id = ?').get(id);
      res.json({ success: true, data: row });
    } catch (err) {
      console.error('[admin/interfaces:PUT]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.delete('/interfaces/:id', authMiddleware, (req, res) => {
    try {
      const { id } = req.params;
      const existing = db.prepare('SELECT id FROM parse_interfaces WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ success: false, error: '记录不存在' });
      db.prepare('DELETE FROM parse_interfaces WHERE id = ?').run(id);
      db.save();
      res.json({ success: true, message: '删除成功' });
    } catch (err) {
      console.error('[admin/interfaces:DELETE]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /* ══════════════════════════════════════════════
   *  广告 CRUD
   * ══════════════════════════════════════════════ */

  router.get('/ads', authMiddleware, (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM ads ORDER BY id ASC').all();
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('[admin/ads:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.post('/ads', authMiddleware, (req, res) => {
    try {
      const { position, name, code } = getFields(req.body, { position: '', name: '', code: '' });
      if (!position || !code) return res.status(400).json({ success: false, error: '位置和代码不能为空' });
      db.prepare('INSERT INTO ads (position, name, code, is_active) VALUES (?, ?, ?, 1)').run(position, name, code);
      db.save();
      const row = db.prepare('SELECT * FROM ads ORDER BY id DESC LIMIT 1').get();
      res.status(201).json({ success: true, data: row });
    } catch (err) {
      console.error('[admin/ads:POST]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.put('/ads/:id', authMiddleware, (req, res) => {
    try {
      const { id } = req.params;
      const existing = db.prepare('SELECT id FROM ads WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ success: false, error: '记录不存在' });
      const { position, name, code, is_active } = getFields(req.body, { position: null, name: null, code: null, is_active: null });
      const sets = []; const vals = [];
      if (position !== null) { sets.push('position = ?'); vals.push(position); }
      if (name !== null) { sets.push('name = ?'); vals.push(name); }
      if (code !== null) { sets.push('code = ?'); vals.push(code); }
      if (is_active !== null) { sets.push('is_active = ?'); vals.push(is_active); }
      if (sets.length === 0) return res.status(400).json({ success: false, error: '没有要更新的字段' });
      vals.push(id);
      db.prepare(`UPDATE ads SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
      db.save();
      res.json({ success: true, data: db.prepare('SELECT * FROM ads WHERE id = ?').get(id) });
    } catch (err) {
      console.error('[admin/ads:PUT]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.delete('/ads/:id', authMiddleware, (req, res) => {
    try {
      const { id } = req.params;
      const existing = db.prepare('SELECT id FROM ads WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ success: false, error: '记录不存在' });
      db.prepare('DELETE FROM ads WHERE id = ?').run(id);
      db.save();
      res.json({ success: true, message: '删除成功' });
    } catch (err) {
      console.error('[admin/ads:DELETE]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /* ══════════════════════════════════════════════
   *  推荐链接 CRUD
   * ══════════════════════════════════════════════ */

  router.get('/links', authMiddleware, (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM recommend_links ORDER BY sort_order ASC').all();
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('[admin/links:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.post('/links', authMiddleware, (req, res) => {
    try {
      const { name, icon_url, link_url, sort_order } = getFields(req.body, { name: '', icon_url: '', link_url: '', sort_order: 0 });
      if (!name || !link_url) return res.status(400).json({ success: false, error: '名称和链接不能为空' });
      db.prepare('INSERT INTO recommend_links (name, icon_url, link_url, sort_order, is_active) VALUES (?, ?, ?, ?, 1)').run(name, icon_url, link_url, sort_order);
      db.save();
      const row = db.prepare('SELECT * FROM recommend_links ORDER BY id DESC LIMIT 1').get();
      res.status(201).json({ success: true, data: row });
    } catch (err) {
      console.error('[admin/links:POST]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.put('/links/:id', authMiddleware, (req, res) => {
    try {
      const { id } = req.params;
      const existing = db.prepare('SELECT id FROM recommend_links WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ success: false, error: '记录不存在' });
      const { name, icon_url, link_url, sort_order, is_active } = getFields(req.body, { name: null, icon_url: null, link_url: null, sort_order: null, is_active: null });
      const sets = []; const vals = [];
      if (name !== null) { sets.push('name = ?'); vals.push(name); }
      if (icon_url !== null) { sets.push('icon_url = ?'); vals.push(icon_url); }
      if (link_url !== null) { sets.push('link_url = ?'); vals.push(link_url); }
      if (sort_order !== null) { sets.push('sort_order = ?'); vals.push(sort_order); }
      if (is_active !== null) { sets.push('is_active = ?'); vals.push(is_active); }
      if (sets.length === 0) return res.status(400).json({ success: false, error: '没有要更新的字段' });
      vals.push(id);
      db.prepare(`UPDATE recommend_links SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
      db.save();
      res.json({ success: true, data: db.prepare('SELECT * FROM recommend_links WHERE id = ?').get(id) });
    } catch (err) {
      console.error('[admin/links:PUT]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.delete('/links/:id', authMiddleware, (req, res) => {
    try {
      const { id } = req.params;
      const existing = db.prepare('SELECT id FROM recommend_links WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ success: false, error: '记录不存在' });
      db.prepare('DELETE FROM recommend_links WHERE id = ?').run(id);
      db.save();
      res.json({ success: true, message: '删除成功' });
    } catch (err) {
      console.error('[admin/links:DELETE]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /* ══════════════════════════════════════════════
   *  系统设置 CRUD
   * ══════════════════════════════════════════════ */

  router.get('/settings', authMiddleware, (req, res) => {
    try {
      const rows = db.prepare('SELECT key, value FROM site_settings').all();
      const settings = {};
      for (const row of rows) settings[row.key] = row.value;
      res.json({ success: true, data: settings });
    } catch (err) {
      console.error('[admin/settings:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.put('/settings', authMiddleware, (req, res) => {
    try {
      const items = req.body;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: '请提供 [{key, value}, ...] 格式的设置数组' });
      }
      const upsert = db.prepare(
        'INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP'
      );
      // sql.js doesn't support ON CONFLICT, so use manual upsert
      for (const item of items) {
        if (!item.key) continue;
        const existing = db.prepare('SELECT id FROM site_settings WHERE key = ?').get(item.key);
        if (existing) {
          db.prepare('UPDATE site_settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?').run(item.value, item.key);
        } else {
          db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)').run(item.key, item.value);
        }
      }
      db.save();
      res.json({ success: true, message: '设置已保存' });
    } catch (err) {
      console.error('[admin/settings:PUT]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /* ══════════════════════════════════════════════
   *  使用步骤 CRUD
   * ══════════════════════════════════════════════ */

  router.get('/guide', authMiddleware, (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM guide_steps ORDER BY sort_order ASC').all();
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('[admin/guide:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.post('/guide', authMiddleware, (req, res) => {
    try {
      const { step_number, content, sort_order } = getFields(req.body, { step_number: 0, content: '', sort_order: 0 });
      if (!content) return res.status(400).json({ success: false, error: '内容不能为空' });
      db.prepare('INSERT INTO guide_steps (step_number, content, sort_order) VALUES (?, ?, ?)').run(step_number, content, sort_order);
      db.save();
      const row = db.prepare('SELECT * FROM guide_steps ORDER BY id DESC LIMIT 1').get();
      res.status(201).json({ success: true, data: row });
    } catch (err) {
      console.error('[admin/guide:POST]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.put('/guide/:id', authMiddleware, (req, res) => {
    try {
      const { id } = req.params;
      const existing = db.prepare('SELECT id FROM guide_steps WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ success: false, error: '记录不存在' });
      const { step_number, content, sort_order } = getFields(req.body, { step_number: null, content: null, sort_order: null });
      const sets = []; const vals = [];
      if (step_number !== null) { sets.push('step_number = ?'); vals.push(step_number); }
      if (content !== null) { sets.push('content = ?'); vals.push(content); }
      if (sort_order !== null) { sets.push('sort_order = ?'); vals.push(sort_order); }
      if (sets.length === 0) return res.status(400).json({ success: false, error: '没有要更新的字段' });
      vals.push(id);
      db.prepare(`UPDATE guide_steps SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
      db.save();
      res.json({ success: true, data: db.prepare('SELECT * FROM guide_steps WHERE id = ?').get(id) });
    } catch (err) {
      console.error('[admin/guide:PUT]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.delete('/guide/:id', authMiddleware, (req, res) => {
    try {
      const { id } = req.params;
      const existing = db.prepare('SELECT id FROM guide_steps WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ success: false, error: '记录不存在' });
      db.prepare('DELETE FROM guide_steps WHERE id = ?').run(id);
      db.save();
      res.json({ success: true, message: '删除成功' });
    } catch (err) {
      console.error('[admin/guide:DELETE]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /* ══════════════════════════════════════════════
   *  FAQ CRUD
   * ══════════════════════════════════════════════ */

  router.get('/faq', authMiddleware, (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM faqs ORDER BY sort_order ASC').all();
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('[admin/faq:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.post('/faq', authMiddleware, (req, res) => {
    try {
      const { question, answer, sort_order } = getFields(req.body, { question: '', answer: '', sort_order: 0 });
      if (!question || !answer) return res.status(400).json({ success: false, error: '问题和答案不能为空' });
      db.prepare('INSERT INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)').run(question, answer, sort_order);
      db.save();
      const row = db.prepare('SELECT * FROM faqs ORDER BY id DESC LIMIT 1').get();
      res.status(201).json({ success: true, data: row });
    } catch (err) {
      console.error('[admin/faq:POST]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.put('/faq/:id', authMiddleware, (req, res) => {
    try {
      const { id } = req.params;
      const existing = db.prepare('SELECT id FROM faqs WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ success: false, error: '记录不存在' });
      const { question, answer, sort_order } = getFields(req.body, { question: null, answer: null, sort_order: null });
      const sets = []; const vals = [];
      if (question !== null) { sets.push('question = ?'); vals.push(question); }
      if (answer !== null) { sets.push('answer = ?'); vals.push(answer); }
      if (sort_order !== null) { sets.push('sort_order = ?'); vals.push(sort_order); }
      if (sets.length === 0) return res.status(400).json({ success: false, error: '没有要更新的字段' });
      vals.push(id);
      db.prepare(`UPDATE faqs SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
      db.save();
      res.json({ success: true, data: db.prepare('SELECT * FROM faqs WHERE id = ?').get(id) });
    } catch (err) {
      console.error('[admin/faq:PUT]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.delete('/faq/:id', authMiddleware, (req, res) => {
    try {
      const { id } = req.params;
      const existing = db.prepare('SELECT id FROM faqs WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ success: false, error: '记录不存在' });
      db.prepare('DELETE FROM faqs WHERE id = ?').run(id);
      db.save();
      res.json({ success: true, message: '删除成功' });
    } catch (err) {
      console.error('[admin/faq:DELETE]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /* ══════════════════════════════════════════════
   *  访问统计
   * ══════════════════════════════════════════════ */

  /** GET /api/admin/stats — 近 N 天访问统计（默认 7 天） */
  router.get('/stats', authMiddleware, (req, res) => {
    try {
      const days = parseInt(req.query.days) || 7;
      const dates = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().slice(0, 10));
      }

      const rows = db.prepare(
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

      res.json({
        success: true,
        data: {
          list: result,
          summary: {
            totalPv,
            totalUv,
            todayPv: todayRow.pv,
            todayUv: todayRow.uv,
          },
        },
      });
    } catch (err) {
      console.error('[admin/stats:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  return router;
};
