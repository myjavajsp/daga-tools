const express = require('express');
const { authMiddleware } = require('../middleware/auth');

module.exports = function (db) {
  const router = express.Router();

  router.get('/', authMiddleware, async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (Math.max(1, Number(page)) - 1) * Number(limit);
      const rows = await db.prepare(
        'SELECT id, date, ip, page, x, y, element, created_at FROM click_events ORDER BY created_at DESC LIMIT ? OFFSET ?'
      ).all(Number(limit), offset);
      const countRow = await db.prepare('SELECT COUNT(*) as total FROM click_events').get();
      res.json({ success: true, data: { list: rows, total: countRow.total, page: Number(page), limit: Number(limit) } });
    } catch (err) {
      console.error('[admin/click-events:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  router.get('/by-element', authMiddleware, async (req, res) => {
    try {
      const { days = 7 } = req.query;
      const since = new Date();
      since.setDate(since.getDate() - days);
      const sinceStr = since.toISOString().slice(0, 10);
      const rows = await db.prepare(
        `SELECT element, page, COUNT(*) as cnt FROM click_events WHERE date >= ? AND element != '' GROUP BY element, page ORDER BY cnt DESC LIMIT 50`
      ).all(sinceStr);
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('[admin/click-events:by-element]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  return router;
};
