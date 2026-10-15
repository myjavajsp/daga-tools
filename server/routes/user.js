/**
 * daga-clone — server/routes/user.js
 * 前台用户体系：注册 / 登录 / 我的资料 / 修改密码
 * 挂载（index.js 与 deploy/index.merged.js 同步）：
 *   app.use('/api/user', require('./routes/user')(db));
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { auth, generateToken } = require('../middleware/user-auth');
const { getQuotaView } = require('../middleware/quota');
const { getClientIp } = require('../utils');

/** 用户资料字段（不含 password） */
const USER_FIELDS =
  'id, username, email, nickname, level, vip_expires_at, daily_quota, quota_used, quota_date, status, last_login_at, last_login_ip, created_at';

/** 脱敏后的用户资料（绝不含 password） */
function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email || '',
    nickname: user.nickname || '',
    level: Number(user.level) || 0,
    vip_expires_at: user.vip_expires_at || null,
    status: Number(user.status) === 1,
    created_at: user.created_at,
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[A-Za-z0-9_\u4e00-\u9fa5]{3,50}$/;

module.exports = function (db) {
  const router = express.Router();

  /** POST /register — 注册 { username, password, email? } */
  router.post('/register', async (req, res) => {
    try {
      const { username, password, email } = req.body || {};
      const uname = String(username || '').trim();
      const mail = String(email || '').trim();

      if (!USERNAME_RE.test(uname)) {
        return res.status(400).json({ success: false, error: '用户名需为 3-50 位字母、数字、下划线或中文' });
      }
      if (!password || String(password).length < 6) {
        return res.status(400).json({ success: false, error: '密码长度至少 6 位' });
      }
      if (mail && !EMAIL_RE.test(mail)) {
        return res.status(400).json({ success: false, error: '邮箱格式不正确' });
      }

      // 预查给出明确中文错误；并发下的重复键在 catch 里兜底（MySQL 1062）
      const dupName = await db.prepare('SELECT id FROM users WHERE username = ?').get(uname);
      if (dupName) {
        return res.status(409).json({ success: false, error: '用户名已被注册' });
      }
      if (mail) {
        const dupMail = await db.prepare('SELECT id FROM users WHERE email = ?').get(mail);
        if (dupMail) {
          return res.status(409).json({ success: false, error: '邮箱已被注册' });
        }
      }

      const hash = bcrypt.hashSync(String(password), 10);
      const result = await db
        .prepare('INSERT INTO users (username, email, password, nickname) VALUES (?, ?, ?, ?)')
        .run(uname, mail || null, hash, uname);
      const user = await db.prepare(`SELECT ${USER_FIELDS} FROM users WHERE id = ?`).get(result.insertId);
      res.json({ success: true, data: { token: generateToken(user), user: publicUser(user) } });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        const msg = String(err.sqlMessage || '');
        return res.status(409).json({ success: false, error: msg.includes('email') ? '邮箱已被注册' : '用户名已被注册' });
      }
      console.error('[user/register]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /** POST /login — 登录 { username, password } */
  router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body || {};
      const uname = String(username || '').trim();
      if (!uname || !password) {
        return res.status(400).json({ success: false, error: '用户名和密码不能为空' });
      }
      const user = await db.prepare(`SELECT ${USER_FIELDS}, password FROM users WHERE username = ?`).get(uname);
      if (!user || !bcrypt.compareSync(String(password), user.password)) {
        return res.status(401).json({ success: false, error: '用户名或密码错误' });
      }
      if (Number(user.status) !== 1) {
        return res.status(403).json({ success: false, error: '账号已被禁用，请联系管理员' });
      }
      await db
        .prepare('UPDATE users SET last_login_at = NOW(), last_login_ip = ? WHERE id = ?')
        .run(getClientIp(req), user.id);
      res.json({ success: true, data: { token: generateToken(user), user: publicUser(user) } });
    } catch (err) {
      console.error('[user/login]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /** GET /me — 我的资料 + 配额视图（需登录） */
  router.get('/me', auth, async (req, res) => {
    try {
      const user = await db.prepare(`SELECT ${USER_FIELDS} FROM users WHERE id = ?`).get(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, error: '用户不存在' });
      }
      if (Number(user.status) !== 1) {
        return res.status(403).json({ success: false, error: '账号已被禁用' });
      }
      const quota = await getQuotaView(db, user);
      res.json({ success: true, data: { ...publicUser(user), quota } });
    } catch (err) {
      console.error('[user/me]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /** POST /change-password — 修改密码 { oldPassword, newPassword }（需登录） */
  router.post('/change-password', auth, async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body || {};
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ success: false, error: '旧密码和新密码不能为空' });
      }
      if (String(newPassword).length < 6) {
        return res.status(400).json({ success: false, error: '新密码长度至少 6 位' });
      }
      const user = await db.prepare('SELECT id, password, status FROM users WHERE id = ?').get(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, error: '用户不存在' });
      }
      if (Number(user.status) !== 1) {
        return res.status(403).json({ success: false, error: '账号已被禁用' });
      }
      if (!bcrypt.compareSync(String(oldPassword), user.password)) {
        return res.status(401).json({ success: false, error: '旧密码错误' });
      }
      const hash = bcrypt.hashSync(String(newPassword), 10);
      await db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, user.id);
      res.json({ success: true });
    } catch (err) {
      console.error('[user/change-password]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  return router;
};
