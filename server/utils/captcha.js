/**
 * captcha.js — 纯 Node.js Canvas 验证码生成器（无第三方依赖）
 *
 * 使用内存 Map 存储 captchaId → { code, expireAt }
 * 验证码有效期 5 分钟，用完即销毁（一次性）
 */

const { createCanvas } = (() => {
  // 尝试使用 canvas 包（可选依赖），若不存在则 fallback 到 SVG 方案
  try {
    return require('canvas');
  } catch {
    return null;
  }
})() || {};

const crypto = require('crypto');

/** 验证码内存存储：captchaId → { code: string, expireAt: number } */
const captchaStore = new Map();

/** 定时清理过期验证码（每 10 分钟一次） */
setInterval(() => {
  const now = Date.now();
  for (const [id, item] of captchaStore) {
    if (item.expireAt < now) captchaStore.delete(id);
  }
}, 10 * 60 * 1000);

/**
 * 生成随机验证码字符串（去掉易混淆字符 0/O/l/I/1）
 * @param {number} len
 */
function randomCode(len = 4) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < len; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * 生成随机颜色
 */
function randColor(min = 0, max = 255) {
  const r = () => Math.floor(Math.random() * (max - min) + min);
  return `rgb(${r()},${r()},${r()})`;
}

/**
 * 用 SVG 生成验证码图片（纯 Node，无需 canvas 原生模块）
 * @param {string} code
 * @returns {string} SVG data URL
 */
function generateSvgCaptcha(code) {
  const width = 120;
  const height = 40;
  const charCount = code.length;
  const charWidth = width / charCount;

  // 背景干扰线
  let lines = '';
  for (let i = 0; i < 4; i++) {
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    const x2 = Math.random() * width;
    const y2 = Math.random() * height;
    const color = `hsl(${Math.random() * 360},50%,70%)`;
    lines += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="1.5"/>`;
  }

  // 干扰点
  let dots = '';
  for (let i = 0; i < 30; i++) {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    const color = `hsl(${Math.random() * 360},50%,60%)`;
    dots += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="1.2" fill="${color}"/>`;
  }

  // 字符（随机颜色、随机偏移、随机旋转）
  let chars = '';
  for (let i = 0; i < charCount; i++) {
    const x = charWidth * i + charWidth * 0.5;
    const y = height * 0.68;
    const rotate = (Math.random() - 0.5) * 30;
    const fontSize = 20 + Math.random() * 6;
    const color = `hsl(${Math.random() * 360},70%,35%)`;
    chars += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${fontSize.toFixed(1)}" fill="${color}" font-family="Arial,sans-serif" font-weight="bold" text-anchor="middle" transform="rotate(${rotate.toFixed(1)},${x.toFixed(1)},${y.toFixed(1)})">${code[i]}</text>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#f3f4f6" rx="4"/>
  ${lines}
  ${dots}
  ${chars}
</svg>`;

  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

/**
 * 生成一个新验证码，返回 { captchaId, imageData }
 * imageData 是 base64 数据 URL（SVG 格式）
 */
function createCaptcha() {
  const code = randomCode(4);
  const captchaId = crypto.randomBytes(16).toString('hex');
  const expireAt = Date.now() + 5 * 60 * 1000; // 5 分钟有效

  captchaStore.set(captchaId, { code: code.toLowerCase(), expireAt });

  const imageData = generateSvgCaptcha(code);
  return { captchaId, imageData };
}

/**
 * 验证验证码（验证后立即删除，一次性使用）
 * @param {string} captchaId
 * @param {string} inputCode
 * @returns {{ valid: boolean, reason?: string }}
 */
function verifyCaptcha(captchaId, inputCode) {
  if (!captchaId || !inputCode) {
    return { valid: false, reason: '验证码不能为空' };
  }

  const item = captchaStore.get(captchaId);
  if (!item) {
    return { valid: false, reason: '验证码不存在或已过期，请刷新重试' };
  }

  // 检查是否过期
  if (item.expireAt < Date.now()) {
    captchaStore.delete(captchaId);
    return { valid: false, reason: '验证码已过期，请刷新重试' };
  }

  // 删除（一次性）
  captchaStore.delete(captchaId);

  if (item.code !== inputCode.toLowerCase().trim()) {
    return { valid: false, reason: '验证码错误' };
  }

  return { valid: true };
}

module.exports = { createCaptcha, verifyCaptcha };
