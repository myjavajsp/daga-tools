/**
 * daga-clone — server/routes/public.js
 * 公共 API（无需认证）
 */

const express = require('express');

/**
 * @param {object} db — sql.js 包装后的 Database 实例
 */
module.exports = function (db) {
  const router = express.Router();

  /** GET /api/public/interfaces — 所有启用的解析接口 */
  router.get('/interfaces', (req, res) => {
    try {
      const rows = db.prepare(
        'SELECT id, name, url, type, sort_order FROM parse_interfaces WHERE is_active = 1 ORDER BY sort_order ASC'
      ).all();
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('[public/interfaces]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /** GET /api/public/settings — 所有系统设置（key-value map） */
  router.get('/settings', (req, res) => {
    try {
      const rows = db.prepare('SELECT key, value FROM site_settings').all();
      const settings = {};
      for (const row of rows) {
        settings[row.key] = row.value;
      }
      res.json({ success: true, data: settings });
    } catch (err) {
      console.error('[public/settings]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /** GET /api/public/guide — 使用步骤 */
  router.get('/guide', (req, res) => {
    try {
      const rows = db.prepare(
        'SELECT id, step_number, content, sort_order FROM guide_steps ORDER BY sort_order ASC'
      ).all();
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('[public/guide]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /** GET /api/public/faq — 常见问题 */
  router.get('/faq', (req, res) => {
    try {
      const rows = db.prepare(
        'SELECT id, question, answer, sort_order FROM faqs ORDER BY sort_order ASC'
      ).all();
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('[public/faq]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /** GET /api/public/links — 推荐链接 */
  router.get('/links', (req, res) => {
    try {
      const rows = db.prepare(
        'SELECT id, name, icon_url, link_url, sort_order FROM recommend_links WHERE is_active = 1 ORDER BY sort_order ASC'
      ).all();
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('[public/links]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /** GET /api/public/ads — 已启用的广告位 */
  router.get('/ads', (req, res) => {
    try {
      const rows = db.prepare(
        'SELECT id, position, name, code FROM ads WHERE is_active = 1'
      ).all();
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('[public/ads]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  return router;
};
