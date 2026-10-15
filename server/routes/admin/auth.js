module.exports = function (router, db) {
  const { authMiddleware, generateToken } = require('../../middleware/auth');
  const { createCaptcha, verifyCaptcha } = require('../../utils/captcha');
  const bcrypt = require('bcryptjs');

  router.get('/captcha', (req, res) => {
    try {
      const { captchaId, imageData } = createCaptcha();
      res.json({ success: true, data: { captchaId, imageData } });
    } catch (err) {
      console.error('[admin/captcha]', err.message);
      res.status(500).json({ success: false, error: '生成验证码失败' });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const { username, password, captchaId, captchaCode } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, error: '用户名和密码不能为空' });
      }
      const captchaResult = verifyCaptcha(captchaId, captchaCode);
      if (!captchaResult.valid) {
        return res.status(400).json({ success: false, error: captchaResult.reason || '验证码错误' });
      }
      const admin = await db.prepare('SELECT id, username, password FROM admins WHERE username = ?').get(username);
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

  router.get('/me', authMiddleware, (req, res) => {
    res.json({ success: true, data: { id: req.admin.id, username: req.admin.username } });
  });
};
