const { getClientIp } = require('../utils');
const rateLimit = require('express-rate-limit');

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 5, // 每IP每小时最多5条
  message: { success: false, error: '提交过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = (db) => {
  const router = require('express').Router();

  // 提交联系表单
  router.post('/', contactLimiter, async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;

      // 验证必填字段
      if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: '请填写必填字段' });
      }

      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, error: '邮箱格式不正确' });
      }

      // 长度限制
      if (name.length > 100) return res.status(400).json({ success: false, error: '姓名过长' });
      if (email.length > 255) return res.status(400).json({ success: false, error: '邮箱过长' });
      if (subject && subject.length > 255) return res.status(400).json({ success: false, error: '主题过长' });
      if (message.length > 5000) return res.status(400).json({ success: false, error: '内容过长' });

      const ip = getClientIp(req);
      const userAgent = (req.headers['user-agent'] || '').slice(0, 500);

      await db.prepare(
        'INSERT INTO contact_submissions (name, email, subject, message, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(name.trim(), email.trim(), (subject || '').trim(), message.trim(), ip, userAgent);

      res.json({ success: true, message: '消息已发送，我们会尽快回复您！' });
    } catch (err) {
      console.error('[Contact] submit error:', err);
      res.status(500).json({ success: false, error: '提交失败，请稍后重试' });
    }
  });

  return router;
};
