/**
 * daga-clone — server/index.js
 * Express 主入口
 *
 * 职责：
 *   1. 异步加载 sql.js WASM → 初始化数据库
 *   2. 首次启动自动 seed（管理员、解析接口、步骤、FAQ、设置）
 *   3. 注册 /api/public 和 /api/admin 路由
 *   4. 生产模式 serve frontend/dist + SPA fallback
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initDatabase } = require('./database');

const PORT = process.env.PORT || 3001;

/* ── 首次启动自动 seed ─────────────────────────── */

async function autoSeed(db) {
  const adminCount = db.prepare('SELECT COUNT(*) as cnt FROM admins').get();
  if (adminCount && adminCount.cnt > 0) {
    console.log('[Server] Database already seeded, skipping auto-seed.');
    return;
  }

  console.log('[Server] First run detected — auto-seeding database...');

  /* -- 管理员 -- */
  const bcrypt = require('bcryptjs');
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || 'admin123';
  const hash = bcrypt.hashSync(adminPass, bcrypt.genSaltSync(10));
  db.prepare('INSERT INTO admins (username, password) VALUES (?, ?)').run(adminUser, hash);

  /* -- 解析接口（与 https://daga.cc/ 保持一致）-- */
  const interfaces = [
    { name: '搜影片名称专用',           url: 'https://z1.m1907.top/?jx=',              sort: 1 },
    { name: '①电视剧解析（有广告）',     url: 'https://jx.jsonplayer.com/player/?url=', sort: 2 },
    { name: '②电影解析（有广告）',       url: 'https://jx.playerjy.com/?ads=0&url=',    sort: 3 },
    { name: '③万能解析（稳定）',         url: 'https://z1.m1907.top/?jx=',              sort: 4 },
    { name: '④智能解析(备用)',           url: 'https://z1.m1907.cn/?jx=',               sort: 5 },
    { name: '蓝光解析（直解）',          url: 'https://llq.tyhua.top/?url=',            sort: 6 },
    { name: '优酷解析（备用）',          url: 'https://www.daga.cc/vip2/?url=',          sort: 7 },
    { name: '爱奇艺解析（备用）',        url: 'https://www.daga.cc/vip3/?url=',          sort: 8 },
    { name: '好莱坞解析（备用）',        url: 'https://player.mrgaocloud.com/player/?url=', sort: 9 },
    /* ── 以下接口来自 vip.52api.cn ── */
    { name: '⑤虾米解析（推荐）',         url: 'https://jx.xmflv.cc/?url=',                sort: 10 },
    { name: '⑥极速云解析',               url: 'https://jx.2s0.cn/player/?url=',           sort: 11 },
    { name: '⑦七哥解析',                 url: 'https://jx.nnxv.cn/tv.php?url=',            sort: 12 },
    { name: '⑧七七解析',                 url: 'https://jx.77flv.cc/?url=',                sort: 13 },
    { name: '⑨咸鱼解析',                 url: 'https://jx.xymp4.cc/?url=',                sort: 14 },
    { name: '⑩全民解析',                 url: 'https://api.quanminjiexi.com/index.php?url=', sort: 15 },
    { name: '⑪智能云解析',               url: 'http://v9j.net/?url=',                    sort: 16 },
  ];
  const insInt = db.prepare('INSERT INTO parse_interfaces (name, url, type, sort_order) VALUES (?, ?, ?, ?)');
  for (const item of interfaces) insInt.run(item.name, item.url, 'video', item.sort);

  /* -- 使用步骤 -- */
  const steps = [
    { num: 1, content: '在腾讯视频、优酷、爱奇艺、PPTV等各大视频网站找到想看的VIP视频地址' },
    { num: 2, content: '复制视频链接，粘贴到本页面的输入框中' },
    { num: 3, content: '选择解析接口频道，点击"解析播放"按钮' },
    { num: 4, content: '等待加载完成，即可免费观看高清VIP视频！' },
  ];
  const insStep = db.prepare('INSERT INTO guide_steps (step_number, content, sort_order) VALUES (?, ?, ?)');
  for (const s of steps) insStep.run(s.num, s.content, s.num);

  /* -- FAQ -- */
  const faqs = [
    { q: '解析失败怎么办？',       a: '请尝试切换其他解析接口，或更换视频源地址' },
    { q: '手机上可以用吗？',       a: '完全支持！本网站已适配移动端' },
    { q: '支持哪些平台？',         a: '支持腾讯视频、优酷、爱奇艺、PPTV等主流视频平台' },
    { q: '可以下载视频吗？',       a: '借助第三方下载工具可保存视频，本站仅提供在线解析播放' },
    { q: '解析速度慢？',           a: '建议切换"蓝光解析"或"万能解析"线路' },
  ];
  const insFaq = db.prepare('INSERT INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)');
  faqs.forEach((f, i) => insFaq.run(f.q, f.a, i + 1));

  /* -- 系统设置 -- */
  const settings = [
    { key: 'site_title',       value: '全民影视VIP视频解析 - 免费在线观看全网VIP视频' },
    { key: 'site_keywords',    value: 'VIP视频解析,免费视频解析,腾讯视频VIP解析,优酷VIP解析,爱奇艺VIP解析,全网VIP视频在线观看,免费看电影电视剧,视频解析网站,在线解析播放,蓝光解析' },
    { key: 'site_description', value: '全民影视VIP视频解析，免费提供腾讯视频、优酷、爱奇艺、芒果TV等全网VIP视频在线解析播放服务，支持蓝光画质，无需下载，即点即播。' },
  ];
  const insSet = db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)');
  for (const s of settings) insSet.run(s.key, s.value);

  db.save();
  console.log('[Server] Auto-seed complete.');
}

/* ── 主启动函数 ────────────────────────────────── */

async function start() {
  // 1. 异步初始化数据库（加载 sql.js WASM + 建表）
  const db = await initDatabase();

  // 2. 首次启动自动 seed
  await autoSeed(db);

  // 3. 创建 Express 应用
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // 访问统计中间件（仅统计非 /api 路径，即页面访问）
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.match(/\.(js|css|png|jpg|ico|svg|woff|ttf|map)$/)) {
      try {
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const ip = (req.headers['x-forwarded-for'] || req.ip || '').split(',')[0].trim() || 'unknown';

        // 插入或更新今日 PV
        db.exec(`INSERT INTO page_views (date, pv, uv) VALUES ('${today}', 1, 0) ON CONFLICT(date) DO UPDATE SET pv = pv + 1`);

        // 独立 IP 计 UV（重复 IP 同日只计一次）
        const existIp = db.prepare('SELECT id FROM visitor_ips WHERE date = ? AND ip = ?').get(today, ip);
        if (!existIp) {
          db.prepare('INSERT OR IGNORE INTO visitor_ips (date, ip) VALUES (?, ?)').run(today, ip);
          db.exec(`UPDATE page_views SET uv = uv + 1 WHERE date = '${today}'`);
        }
        db.save();
      } catch (e) { /* 统计失败不影响正常访问 */ }
    }
    next();
  });

  // 将 db 注入路由
  app.use('/api/public', require('./routes/public')(db));
  app.use('/api/admin', require('./routes/admin')(db));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 4. 生产模式：serve frontend/dist + SPA fallback（注入 SEO meta）
  const distPath = path.join(__dirname, '..', 'frontend', 'dist');

  /**
   * 从 DB 读取站点设置并注入到 index.html 中（SEO 关键）
   * 解决纯 SPA 对百度等爬虫不友好的问题
   */
  function getSeoSettings() {
    try {
      const title = db.prepare("SELECT value FROM site_settings WHERE key = 'site_title'").get();
      const desc = db.prepare("SELECT value FROM site_settings WHERE key = 'site_description'").get();
      const kw = db.prepare("SELECT value FROM site_settings WHERE key = 'site_keywords'").get();
      return {
        title: title?.value || '全民影视VIP视频解析',
        description: desc?.value || '',
        keywords: kw?.value || '',
      };
    } catch {
      return { title: '全民影视VIP视频解析', description: '', keywords: '' };
    }
  }

  /** 将 SEO 信息注入 HTML 字符串中 */
  function injectSeoIntoHtml(html, seo) {
    let result = html;

    // 替换 title
    result = result.replace(/<title>.*?<\/title>/, `<title>${seo.title}</title>`);

    // 注入 description（在 title 后面）
    const metaDesc = seo.description
      ? `\n    <meta name="description" content="${seo.description}" />`
      : '';
    if (metaDesc && !result.includes('name="description"')) {
      result = result.replace('</title>', `</title>${metaDesc}`);
    } else if (seo.description && result.includes('name="description"')) {
      result = result.replace(
        /<meta name="description" content=".*?"\s*\/?>/,
        `<meta name="description" content="${seo.description}" />`
      );
    }

    // 注入 keywords
    const metaKw = seo.keywords
      ? `\n    <meta name="keywords" content="${seo.keywords}" />`
      : '';
    if (metaKw && !result.includes('name="keywords"')) {
      result = result.replace('</title>', `</title>${metaKw}`);
    } else if (seo.keywords && result.includes('name="keywords"')) {
      result = result.replace(
        /<meta name="keywords" content=".*?"\s*\/?>/,
        `<meta name="keywords" content="${seo.keywords}" />`
      );
    }

    return result;
  }

  // 缓存：构建后的 index.html（只在首次请求时读取并注入，避免每次读文件）
  let cachedIndexHtml = null;
  let cachedSeoHash = '';

  if (fs.existsSync(distPath)) {
    // 静态文件服务（排除 index.html，由下面的 * 路由统一处理）
    app.use(express.static(distPath, { index: false }));

    // SPA fallback：所有非 /api 路由返回注入 SEO 的 index.html
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) return;

      const seo = getSeoSettings();
      const seoFingerprint = `${seo.title}|${seo.description}|${seo.keywords}`;

      // 如果 SEO 设置没变，用缓存；否则重建
      if (!cachedIndexHtml || cachedSeoHash !== seoFingerprint) {
        const rawHtml = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
        cachedIndexHtml = injectSeoIntoHtml(rawHtml, seo);
        cachedSeoHash = seoFingerprint;
        console.log('[SEO] Meta refreshed:', seo.title);
      }

      res.set('Content-Type', 'text/html; charset=utf-8');
      res.send(cachedIndexHtml);
    });
    console.log('[Server] Serving frontend from frontend/dist (with SEO injection)');
  } else {
    console.log('[Server] No frontend/dist found — run: cd frontend && npm run build');
  }

  app.listen(PORT, () => {
    console.log(`[Server] daga-clone running at http://localhost:${PORT}`);
  });

  return app;
}

start().catch((err) => {
  console.error('[Server] Fatal error:', err);
  process.exit(1);
});
