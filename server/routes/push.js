const express = require('express');
const webpush = require('web-push');
const { authMiddleware } = require('../middleware/auth');

const ALLOWED_ORIGINS = ['https://www.ityvip.xyz', 'https://ityvip.xyz', 'http://localhost:3001', 'http://localhost:5173'];

function isAllowedOrigin(req) {
  const origin = req.headers['origin'];
  const referer = req.headers['referer'];
  const check = origin || referer || '';
  return ALLOWED_ORIGINS.some(o => check.startsWith(o));
}

module.exports = function (db) {
  const router = express.Router();

  async function ensureVapid() {
    const pubRow = await db.prepare("SELECT `value` FROM site_settings WHERE `key` = 'vapid_public_key'").get();
    const privRow = await db.prepare("SELECT `value` FROM site_settings WHERE `key` = 'vapid_private_key'").get();
    if (pubRow && privRow && pubRow.value && privRow.value) {
      webpush.setVapidDetails('mailto:support@ityvip.xyz', pubRow.value, privRow.value);
      return true;
    }
    return false;
  }

  async function sendToOne(endpoint, payload) {
    const sub = await db.prepare('SELECT endpoint, auth, p256dh FROM push_subscriptions WHERE endpoint = ?').get(endpoint);
    if (!sub) return false;
    try {
      await webpush.sendNotification({ endpoint: sub.endpoint, keys: { auth: sub.auth, p256dh: sub.p256dh } }, payload);
      return true;
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        await db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').run(endpoint);
      }
      return false;
    }
  }

  // POST /api/push/subscribe — register a new push subscription
  router.post('/subscribe', async (req, res) => {
    if (!isAllowedOrigin(req)) return res.status(403).json({ success: false, error: 'Origin not allowed' });
    try {
      const { endpoint, keys } = req.body;
      if (!endpoint || !keys || !keys.auth || !keys.p256dh) {
        return res.status(400).json({ success: false, error: 'Invalid subscription' });
      }
      const ua = (req.headers['user-agent'] || '').slice(0, 500);
      await db.prepare(
        'INSERT INTO push_subscriptions (endpoint, auth, p256dh, user_agent) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE auth = VALUES(auth), p256dh = VALUES(p256dh), user_agent = VALUES(user_agent)'
      ).run(endpoint, keys.auth, keys.p256dh, ua);
      res.json({ success: true });
    } catch (err) {
      console.error('[push/subscribe]', err.message);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // DELETE /api/push/unsubscribe — remove a subscription
  router.delete('/unsubscribe', async (req, res) => {
    if (!isAllowedOrigin(req)) return res.status(403).json({ success: false, error: 'Origin not allowed' });
    try {
      const { endpoint } = req.body;
      if (!endpoint) return res.status(400).json({ success: false, error: 'Missing endpoint' });
      await db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').run(endpoint);
      res.json({ success: true });
    } catch (err) {
      console.error('[push/unsubscribe]', err.message);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // GET /api/push/vapid-public-key — expose public key for client
  router.get('/vapid-public-key', async (req, res) => {
    try {
      const row = await db.prepare("SELECT `value` FROM site_settings WHERE `key` = 'vapid_public_key'").get();
      if (row && row.value) {
        res.json({ success: true, data: { publicKey: row.value } });
      } else {
        res.status(500).json({ success: false, error: 'VAPID keys not initialized' });
      }
    } catch (err) {
      console.error('[push/vapid-public-key]', err.message);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // POST /api/push/welcome — send welcome notification to a specific subscriber
  router.post('/welcome', async (req, res) => {
    if (!isAllowedOrigin(req)) return res.status(403).json({ success: false, error: 'Origin not allowed' });
    try {
      const ok = await ensureVapid();
      if (!ok) return res.status(500).json({ success: false, error: 'VAPID not configured' });
      const { endpoint } = req.body;
      if (!endpoint) return res.status(400).json({ success: false, error: 'Missing endpoint' });
      const payload = JSON.stringify({
        title: '订阅成功',
        body: '感谢订阅！我们将为您推送最新影视资源和热门内容。',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        data: { url: '/' },
      });
      const sent = await sendToOne(endpoint, payload);
      res.json({ success: true, data: { sent } });
    } catch (err) {
      console.error('[push/welcome]', err.message);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // POST /api/push/daily-notify — send daily first-visit notification
  router.post('/daily-notify', async (req, res) => {
    if (!isAllowedOrigin(req)) return res.status(403).json({ success: false, error: 'Origin not allowed' });
    try {
      const ok = await ensureVapid();
      if (!ok) return res.status(500).json({ success: false, error: 'VAPID not configured' });
      const { endpoint } = req.body;
      if (!endpoint) return res.status(400).json({ success: false, error: 'Missing endpoint' });
      // Check if already notified today
      const sub = await db.prepare('SELECT last_notified_at FROM push_subscriptions WHERE endpoint = ?').get(endpoint);
      if (!sub) return res.json({ success: true, data: { sent: false, reason: 'not_found' } });
      if (sub.last_notified_at) {
        const lastDate = new Date(sub.last_notified_at).toISOString().slice(0, 10);
        const today = new Date().toISOString().slice(0, 10);
        if (lastDate === today) {
          return res.json({ success: true, data: { sent: false, reason: 'already_today' } });
        }
      }
      const now = new Date();
      const hour = now.getHours();
      const isEvening = hour >= 18 || hour < 6;
      const payload = JSON.stringify({
        title: isEvening ? '晚间热门推荐' : '今日热门推荐',
        body: isEvening ? '来看看今晚有什么好看的影视内容' : '新的一天，看看有什么热门影视更新',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        data: { url: '/' },
      });
      const sent = await sendToOne(endpoint, payload);
      if (sent) {
        await db.prepare('UPDATE push_subscriptions SET last_notified_at = NOW() WHERE endpoint = ?').run(endpoint);
      }
      res.json({ success: true, data: { sent } });
    } catch (err) {
      console.error('[push/daily-notify]', err.message);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // GET /api/push/stats — (admin) subscription count
  router.get('/stats', authMiddleware, async (req, res) => {
    try {
      const row = await db.prepare('SELECT COUNT(*) as total FROM push_subscriptions').get();
      res.json({ success: true, data: { total: row ? row.total : 0 } });
    } catch (err) {
      console.error('[push/stats]', err.message);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // POST /api/push/send — (admin) broadcast a push notification
  router.post('/send', authMiddleware, async (req, res) => {
    try {
      const ok = await ensureVapid();
      if (!ok) return res.status(500).json({ success: false, error: 'VAPID not configured' });
      const { title, body, icon, url } = req.body;
      if (!title) return res.status(400).json({ success: false, error: 'Title required' });
      const rows = await db.prepare('SELECT endpoint, auth, p256dh FROM push_subscriptions').all();
      if (!rows || rows.length === 0) {
        return res.json({ success: true, data: { sent: 0, total: 0 } });
      }
      const payload = JSON.stringify({
        title, body: body || '', icon: icon || '/icon-192x192.png', badge: '/icon-192x192.png', data: { url: url || '/' },
      });
      let sent = 0;
      for (const sub of rows) {
        try {
          await webpush.sendNotification({ endpoint: sub.endpoint, keys: { auth: sub.auth, p256dh: sub.p256dh } }, payload);
          sent++;
        } catch (err) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').run(sub.endpoint);
          }
        }
      }
      res.json({ success: true, data: { sent, total: rows.length } });
    } catch (err) {
      console.error('[push/send]', err.message);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  return router;
};
