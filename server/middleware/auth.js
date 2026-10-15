/**
 * daga-clone — server/middleware/auth.js
 * JWT 认证中间件
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('[FATAL] JWT_SECRET environment variable not set');
  process.exit(1);
}

/**
 * Express middleware — validates JWT from Authorization header.
 * On success, sets req.admin with decoded payload.
 * On failure, returns 401.
 *
 * 令牌隔离：只接受 type='admin' 的令牌；用户令牌（type='user'）一律 401。
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    if (decoded.type !== 'admin') {
      return res.status(401).json({ error: '令牌类型无效' });
    }
    req.admin = decoded; // { id, username, type: 'admin' }
    next();
  } catch (err) {
    return res.status(401).json({ error: '令牌无效或已过期' });
  }
}

/**
 * Generate a JWT token for the given admin user.
 * @param {object} admin - { id, username }
 * @returns {string} signed JWT
 */
function generateToken(admin) {
  return jwt.sign(
    { id: admin.id, username: admin.username, type: 'admin' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

module.exports = { authMiddleware, generateToken };
