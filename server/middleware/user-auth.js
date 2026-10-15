/**
 * daga-clone — server/middleware/user-auth.js
 * 前台用户 JWT 认证中间件（与 admin 版 middleware/auth.js 双向隔离）
 *
 *   - payload 固定带 type:'user'；admin 中间件只认 type:'admin'
 *   - auth     ：必须登录，无令牌/令牌非法/类型不符 → 401
 *   - optional ：有合法用户令牌就解析并挂 req.user，没有/非法/类型不符 → 跳过（不拦截）
 *   - 令牌分别存前端 localStorage：daga_user_token（用户）/ daga_token（后台）
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('[FATAL] JWT_SECRET environment variable not set');
  process.exit(1);
}

/**
 * 从 Authorization 头解析用户令牌。
 * @returns {object|null} 合法用户令牌 payload；否则 null
 */
function verifyUserToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET, { algorithms: ['HS256'] });
    return decoded && decoded.type === 'user' ? decoded : null;
  } catch {
    return null;
  }
}

/**
 * Express middleware — 必须登录。
 * 成功时设置 req.user = { id, username, type: 'user' }。
 */
function auth(req, res, next) {
  const decoded = verifyUserToken(req);
  if (!decoded) {
    return res.status(401).json({ success: false, error: '未登录或登录已过期' });
  }
  req.user = decoded;
  next();
}

/**
 * Express middleware — 可选登录。
 * 有合法用户令牌则设置 req.user；没有则直接放行（游客口径）。
 */
function optional(req, res, next) {
  const decoded = verifyUserToken(req);
  if (decoded) req.user = decoded;
  next();
}

/**
 * 生成用户 JWT。
 * @param {object} user - { id, username }
 * @returns {string} signed JWT
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, type: 'user' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

module.exports = { auth, optional, generateToken };
