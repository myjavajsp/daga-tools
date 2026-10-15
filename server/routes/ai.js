const express = require('express');

module.exports = function (db) {
  const router = express.Router();

  router.get('/tools', async (req, res) => {
    try {
      const rows = await db.prepare(
        "SELECT id, name, url, description, category, is_paid, is_featured FROM ai_tools_submissions WHERE status = 'approved' ORDER BY is_featured DESC, is_paid DESC, created_at DESC"
      ).all();
      res.set('Cache-Control', 'public, max-age=600');
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('[ai/tools]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.post('/submit', async (req, res) => {
    try {
      const { name, url, description, category, submittedBy, contact } = req.body || {};
      if (!name || !url) {
        return res.json({ success: false, error: '名称和网址为必填项' });
      }
      const ip = (req.headers['cf-connecting-ip'] || (req.headers['x-forwarded-for'] || req.ip || '').split(',')[0].trim() || 'unknown').replace(/^::ffff:/, '');
      const r = await db.prepare(
        'INSERT INTO ai_tools_submissions (name, url, description, category, submitted_by, contact, ip) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(name.trim(), url.trim(), (description || '').trim(), (category || '').trim(), (submittedBy || '').trim(), (contact || '').trim(), ip);
      res.json({ success: true, id: r.insertId });
    } catch (err) {
      console.error('[ai/submit]', err.message);
      res.status(500).json({ success: false, error: '提交失败，请稍后重试' });
    }
  });

  return router;
};
