/**
 * daga-clone — server/middleware/quota.js
 * 解析配额守卫 + 配额口径计算（/api/user/me 与解析路由共用同一套口径）
 *
 * 口径：
 *   isVip     = level > 0 且 (vip_expires_at 为空 或 未过期)
 *   effective = daily_quota > 0 ? daily_quota
 *                                : (isVip ? settings.vip_daily_quota : settings.free_daily_quota)
 *   跨日重置  = quota_date !== 今天(YYYY-MM-DD) 时 quota_used 归零、quota_date 置为今天
 *   remaining = max(0, effective - quota_used)
 *
 * 计数时机的选择：在 res.json 被调用且 body.success 为真时 +1，而非请求进入即 +1。
 *   理由：① 只有「解析成功」才消耗次数，参数错误/上游失败不扣，符合用户直觉；
 *        ② 避免上游超时、客户端中断等情况下「没拿到结果却扣了次数」的争议；
 *        ③ 解析路由的成功出口统一走 res.json，拦截点单一可靠。
 */

const { getClientIp } = require('../utils');

/** 今天（YYYY-MM-DD，与站内 page_views 等日期口径一致） */
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/** 读取配额相关站点设置（每次现读，后台改动即时生效） */
async function getQuotaSettings(db) {
  const rows = await db
    .prepare("SELECT `key`, `value` FROM site_settings WHERE `key` IN ('free_daily_quota','vip_daily_quota','guest_daily_quota')")
    .all();
  const map = Object.fromEntries((rows || []).map((r) => [r.key, r.value]));
  return {
    free: Number(map.free_daily_quota || 5),
    vip: Number(map.vip_daily_quota || 100),
    guest: Number(map.guest_daily_quota || 5),
  };
}

/** 是否有效 VIP：level>0 且未过期（vip_expires_at 为空视为永久） */
function isVipUser(user) {
  if (!user || Number(user.level) <= 0) return false;
  if (user.vip_expires_at == null) return true;
  return new Date(user.vip_expires_at).getTime() > Date.now();
}

/** 有效配额（纯计算，不读库） */
function effectiveQuotaOf(user, settings) {
  const override = Number(user.daily_quota) || 0;
  if (override > 0) return override;
  return isVipUser(user) ? settings.vip : settings.free;
}

/**
 * 用户配额视图：跨日重置落库 + 计算 remaining。
 * GET /api/user/me 与配额守卫共用。
 *
 * @param {object} db   数据库实例
 * @param {object} user users 行（需含 level/vip_expires_at/daily_quota/quota_used/quota_date）
 * @returns {Promise<{level:number, vip_expires_at:(Date|null), daily_quota:number, effective_quota:number, remaining:number}>}
 */
async function getQuotaView(db, user) {
  const settings = await getQuotaSettings(db);
  const today = todayStr();
  let used = Number(user.quota_used) || 0;
  if (user.quota_date !== today) {
    used = 0;
    await db.prepare('UPDATE users SET quota_used = 0, quota_date = ? WHERE id = ?').run(today, user.id);
  }
  const effective = effectiveQuotaOf(user, settings);
  return {
    level: Number(user.level) || 0,
    vip_expires_at: user.vip_expires_at || null,
    daily_quota: Number(user.daily_quota) || 0,
    effective_quota: effective,
    remaining: Math.max(0, effective - used),
  };
}

/**
 * 拦截 res.json：仅当 body.success 为真时注入 remaining 并执行计数回调。
 * @param {Function} onSuccess     计数回调（返回 Promise，失败仅记日志）
 * @param {number}   remainingAfter 本次成功后的剩余次数
 */
function hookSuccess(res, onSuccess, remainingAfter) {
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (body && body.success) {
      body.remaining = remainingAfter;
      Promise.resolve()
        .then(onSuccess)
        .catch((e) => console.error('[quota] 计数落库失败:', e.message));
    }
    return originalJson(body);
  };
}

/** 游客配额：按 IP 读/写 parse_quota_log（今天），超限 429 */
async function guestGuard(db, req, res, next) {
  const settings = await getQuotaSettings(db);
  const today = todayStr();
  const ip = getClientIp(req);
  const row = await db.prepare('SELECT cnt FROM parse_quota_log WHERE date = ? AND ip = ?').get(today, ip);
  const used = row ? Number(row.cnt) || 0 : 0;
  if (used >= settings.guest) {
    return res.status(429).json({
      success: false,
      error: '今日免费解析次数已用完，注册登录后可获得更多次数',
      remaining: 0,
      guest: true,
    });
  }
  hookSuccess(
    res,
    async () => {
      await db
        .prepare('INSERT INTO parse_quota_log (date, ip, cnt) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE cnt = cnt + 1')
        .run(today, ip);
    },
    settings.guest - used - 1
  );
  next();
}

/**
 * 创建配额守卫中间件（需挂在 user-auth.optional 之后、业务 handler 之前）。
 * 配额系统自身异常时不阻塞解析（fail-open），仅记录日志。
 *
 * @param {object} db 数据库实例
 * @returns {import('express').RequestHandler}
 */
function createMiddleware(db) {
  return async function quotaGuard(req, res, next) {
    try {
      const authUser = req.user;
      if (authUser && authUser.type === 'user') {
        const user = await db
          .prepare('SELECT id, level, vip_expires_at, daily_quota, quota_used, quota_date, status FROM users WHERE id = ?')
          .get(authUser.id);
        // 用户不存在或已禁用：按游客口径走（optional 语义，不 401）
        if (!user || Number(user.status) !== 1) {
          return guestGuard(db, req, res, next);
        }
        const view = await getQuotaView(db, user);
        if (view.remaining <= 0) {
          return res.status(429).json({ success: false, error: '今日解析次数已用完', remaining: 0 });
        }
        hookSuccess(
          res,
          async () => {
            await db.prepare('UPDATE users SET quota_used = quota_used + 1 WHERE id = ?').run(user.id);
          },
          view.remaining - 1
        );
        return next();
      }
      return guestGuard(db, req, res, next);
    } catch (err) {
      console.error('[quota] 守卫异常（放行）:', err.message);
      return next();
    }
  };
}

module.exports = { createMiddleware, getQuotaView, isVipUser, effectiveQuotaOf };
