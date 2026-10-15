/**
 * daga-clone — server/routes/admin/users.js
 * 后台用户管理（被 server/routes/admin.js require，沿用 authMiddleware 与 admin/content.js 模式）：
 *   GET    /users?page=&limit=&username=&level=&status=  分页 + 筛选（不含 password）
 *   PUT    /users/:id  { level?, vip_expires_at?, daily_quota?, status?, nickname? }
 *   DELETE /users/:id  软删除（status=0）
 */

module.exports = function (router, db, authMiddleware, getFields) {
  const USER_COLUMNS =
    'id, username, email, nickname, level, vip_expires_at, daily_quota, quota_used, quota_date, status, last_login_at, last_login_ip, created_at, updated_at';

  /** GET /users — 分页 + 筛选 */
  router.get('/users', authMiddleware, async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
      const offset = (page - 1) * limit;
      const { username, level, status } = req.query;

      const where = [];
      const params = [];
      if (username) {
        where.push('username LIKE ?');
        params.push(`%${username}%`);
      }
      if (level !== undefined && level !== '' && !Number.isNaN(Number(level))) {
        where.push('level = ?');
        params.push(Number(level));
      }
      if (status !== undefined && status !== '' && !Number.isNaN(Number(status))) {
        where.push('status = ?');
        params.push(Number(status));
      }
      const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

      const countRow = await db.prepare(`SELECT COUNT(*) as total FROM users ${whereSql}`).get(...params);
      const rows = await db
        .prepare(`SELECT ${USER_COLUMNS} FROM users ${whereSql} ORDER BY id DESC LIMIT ? OFFSET ?`)
        .all(...params, limit, offset);
      res.json({
        success: true,
        data: { list: rows, total: countRow ? countRow.total : 0, page, limit },
      });
    } catch (err) {
      console.error('[admin/users:GET]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /** PUT /users/:id — 更新等级 / 到期时间 / 配额覆盖 / 状态 / 昵称 */
  router.put('/users/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await db.prepare('SELECT id FROM users WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({ success: false, error: '用户不存在' });
      }

      const { level, vip_expires_at: vipExpires, daily_quota: dailyQuota, status, nickname } = req.body || {};
      const sets = [];
      const vals = [];

      if (level !== undefined) {
        const lv = Number(level);
        if (![0, 1, 2, 3].includes(lv)) {
          return res.status(400).json({ success: false, error: '等级必须为 0-3（0免费 1月费 2年费 3永久）' });
        }
        sets.push('level = ?');
        vals.push(lv);
      }
      if (vipExpires !== undefined) {
        if (vipExpires === null || vipExpires === '') {
          sets.push('vip_expires_at = ?');
          vals.push(null);
        } else {
          const m = String(vipExpires).match(/^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}(?::\d{2})?))?$/);
          if (!m) {
            return res.status(400).json({ success: false, error: '到期时间格式应为 YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss' });
          }
          const hms = m[2] ? (m[2].length === 5 ? m[2] + ':00' : m[2]) : '00:00:00';
          sets.push('vip_expires_at = ?');
          vals.push(`${m[1]} ${hms}`);
        }
      }
      if (dailyQuota !== undefined) {
        const dq = Number(dailyQuota);
        if (!Number.isInteger(dq) || dq < 0) {
          return res.status(400).json({ success: false, error: '每日配额必须为不小于 0 的整数（0=按等级走）' });
        }
        sets.push('daily_quota = ?');
        vals.push(dq);
      }
      if (status !== undefined) {
        const st = Number(status);
        if (![0, 1].includes(st)) {
          return res.status(400).json({ success: false, error: '状态必须为 0（禁用）或 1（正常）' });
        }
        sets.push('status = ?');
        vals.push(st);
      }
      if (nickname !== undefined) {
        if (String(nickname).length > 100) {
          return res.status(400).json({ success: false, error: '昵称过长（最多 100 字符）' });
        }
        sets.push('nickname = ?');
        vals.push(String(nickname));
      }
      if (sets.length === 0) {
        return res.status(400).json({ success: false, error: '没有要更新的字段' });
      }

      vals.push(id);
      await db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
      const row = await db.prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`).get(id);
      res.json({ success: true, data: row });
    } catch (err) {
      console.error('[admin/users:PUT]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  /** DELETE /users/:id — 软删除（status=0） */
  router.delete('/users/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await db.prepare('SELECT id FROM users WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({ success: false, error: '用户不存在' });
      }
      await db.prepare('UPDATE users SET status = 0 WHERE id = ?').run(id);
      res.json({ success: true, message: '已禁用该用户' });
    } catch (err) {
      console.error('[admin/users:DELETE]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });
};
