require('dotenv').config();

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const maxmind = require('maxmind');
const { initDatabase } = require('./database');

const PORT = process.env.PORT || 3001;

async function autoSeed(db) {
  const adminRow = await db.prepare('SELECT COUNT(*) as cnt FROM admins').get();
  if (adminRow && adminRow.cnt > 0) {
    console.log('[Server] Database already seeded, skipping auto-seed.');
    return;
  }

  console.log('[Server] First run detected — auto-seeding database...');

  const bcrypt = require('bcryptjs');
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || 'admin123';
  const hash = bcrypt.hashSync(adminPass, bcrypt.genSaltSync(10));
  await db.prepare('INSERT INTO admins (username, password) VALUES (?, ?)').run(adminUser, hash);

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
    { name: '⑤虾米解析（推荐）',         url: 'https://jx.xmflv.cc/?url=',                sort: 10 },
    { name: '⑥极速云解析',               url: 'https://jx.2s0.cn/player/?url=',           sort: 11 },
    { name: '⑦七哥解析',                 url: 'https://jx.nnxv.cn/tv.php?url=',            sort: 12 },
    { name: '⑧七七解析',                 url: 'https://jx.77flv.cc/?url=',                sort: 13 },
    { name: '⑨咸鱼解析',                 url: 'https://jx.xymp4.cc/?url=',                sort: 14 },
    { name: '⑩全民解析',                 url: 'https://api.quanminjiexi.com/index.php?url=', sort: 15 },
    { name: '⑪智能云解析',               url: 'http://v9j.net/?url=',                    sort: 16 },
  ];
  const insInt = db.prepare('INSERT INTO parse_interfaces (name, url, type, sort_order) VALUES (?, ?, ?, ?)');
  for (const item of interfaces) await insInt.run(item.name, item.url, 'video', item.sort);

  const steps = [
    { num: 1, content: '在腾讯视频、优酷、爱奇艺、PPTV等各大视频网站找到想看的VIP视频地址' },
    { num: 2, content: '复制视频链接，粘贴到本页面的输入框中' },
    { num: 3, content: '选择解析接口频道，点击"解析播放"按钮' },
    { num: 4, content: '等待加载完成，即可免费观看高清VIP视频！' },
  ];
  const insStep = db.prepare('INSERT INTO guide_steps (step_number, content, sort_order) VALUES (?, ?, ?)');
  for (const s of steps) await insStep.run(s.num, s.content, s.num);

  const faqs = [
    { q: '解析失败怎么办？',       a: '请尝试切换其他解析接口，或更换视频源地址' },
    { q: '手机上可以用吗？',       a: '完全支持！本网站已适配移动端' },
    { q: '支持哪些平台？',         a: '支持腾讯视频、优酷、爱奇艺、PPTV等主流视频平台' },
    { q: '可以下载视频吗？',       a: '借助第三方下载工具可保存视频，本站仅提供在线解析播放' },
    { q: '解析速度慢？',           a: '建议切换"蓝光解析"或"万能解析"线路' },
  ];
  const insFaq = db.prepare('INSERT INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)');
  for (const [i, f] of faqs.entries()) await insFaq.run(f.q, f.a, i + 1);

  const settings = [
    { key: 'site_title',         value: '全民影视VIP视频解析 - 免费在线观看全网VIP视频' },
    { key: 'site_keywords',      value: 'VIP视频解析,免费视频解析,腾讯视频VIP解析,优酷VIP解析,爱奇艺VIP解析,全网VIP视频在线观看,免费看电影电视剧,视频解析网站,在线解析播放,蓝光解析' },
    { key: 'site_description',   value: '全民影视VIP视频解析，免费提供腾讯视频、优酷、爱奇艺、芒果TV等全网VIP视频在线解析播放服务，支持蓝光画质，无需下载，即点即播。' },
    { key: 'enable_ad_preroll',  value: '1' },
  ];
  const insSet = db.prepare('INSERT INTO site_settings (`key`, `value`) VALUES (?, ?)');
  for (const s of settings) await insSet.run(s.key, s.value);

  console.log('[Server] Auto-seed complete.');
}

function isPrivateIp(ip) {
  if (!ip || ip === 'unknown' || ip === '::1' || ip === 'localhost') return true;
  if (ip.startsWith('192.168') || ip.startsWith('10.') || ip.startsWith('127.')) return true;
  if (ip.startsWith('172.')) { const n = parseInt(ip.split('.')[1], 10); if (n >= 16 && n <= 31) return true; }
  return false;
}

function getClientIp(req) {
  return (req.headers['cf-connecting-ip'] || (req.headers['x-forwarded-for'] || req.ip || '').split(',')[0].trim() || 'unknown').replace(/^::ffff:/, '');
}

const COUNTRY_CN = { 'China':'中国','Hong Kong':'香港','Taiwan':'台湾','Macau':'澳门','Japan':'日本','South Korea':'韩国','Korea':'韩国','Singapore':'新加坡','Malaysia':'马来西亚','Thailand':'泰国','Vietnam':'越南','Philippines':'菲律宾','Indonesia':'印度尼西亚','India':'印度','Russia':'俄罗斯','United States':'美国','USA':'美国','Canada':'加拿大','United Kingdom':'英国','UK':'英国','France':'法国','Germany':'德国','Australia':'澳大利亚','Netherlands':'荷兰','Sweden':'瑞典','Norway':'挪威','Finland':'芬兰','Denmark':'丹麦','Switzerland':'瑞士','Italy':'意大利','Spain':'西班牙','Brazil':'巴西','Argentina':'阿根廷','Seychelles':'塞舌尔','Serbia':'塞尔维亚','Greece':'希腊','Poland':'波兰' };

function normalizeCountry(name) {
  if (!name) return name;
  const cn = COUNTRY_CN[name] || COUNTRY_CN[name.replace(/^the\s+/i, '')];
  return cn || name;
}

let geoReader = null;
const MMDB_PATH = path.join(__dirname, 'geo', 'GeoLite2-City.mmdb');

async function loadGeoReader() {
  if (fs.existsSync(MMDB_PATH)) {
    try { geoReader = await maxmind.open(MMDB_PATH); console.log('[Geo] Loaded local GeoLite2 database'); } catch (e) { console.error('[Geo] Failed to load mmdb:', e.message); }
  }
}

const geoCache = new Map();
const GEO_CACHE_TTL = 24 * 60 * 60 * 1000;
setInterval(() => { const n = Date.now(); for (const [k, v] of geoCache) if (n - v.ts > GEO_CACHE_TTL) geoCache.delete(k); }, 60 * 60 * 1000);

async function lookupGeo(ip) {
  if (isPrivateIp(ip)) return null;
  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.ts < GEO_CACHE_TTL) return cached.data;

  // Local mmdb first (fast, no network)
  try {
    if (geoReader) {
      const g = geoReader.get(ip);
      if (g && g.country && g.country.iso_code) {
        const result = {
          country: normalizeCountry(g.country.names.zh-CN || g.country.names.en || ''),
          region: (g.subdivisions && g.subdivisions[0]) ? (g.subdivisions[0].names['zh-CN'] || g.subdivisions[0].names.en || '') : '',
          city: (g.city && g.city.names) ? (g.city.names['zh-CN'] || g.city.names.en || '') : '',
          lat: g.location ? g.location.latitude || 0 : 0,
          lon: g.location ? g.location.longitude || 0 : 0,
        };
        geoCache.set(ip, { data: result, ts: Date.now() });
        return result;
      }
    }
  } catch {}

  // Remote APIs as fallback
  for (const url of [
    `http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon&lang=zh-CN`,
    `https://api.ip.sb/geoip/${ip}`,
  ]) {
    try {
      const resp = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!resp.ok) continue;
      const data = await resp.json();
      let result;
      if (data.status === 'success') {
        result = { country: data.country, region: data.regionName, city: data.city, lat: data.lat, lon: data.lon };
      } else if (data.country) {
        result = { country: normalizeCountry(data.country), region: data.region || '', city: data.city || '', lat: data.latitude || 0, lon: data.longitude || 0 };
      }
      if (result) { geoCache.set(ip, { data: result, ts: Date.now() }); return result; }
    } catch {}
  }
  return null;
}

async function ensureGeoDb() {
  if (!fs.existsSync(MMDB_PATH)) {
    try {
      const gzPath = path.join(__dirname, '..', 'node_modules', 'geolite2-city', 'GeoLite2-City.mmdb.gz');
      if (fs.existsSync(gzPath)) {
        if (!fs.existsSync(path.join(__dirname, 'geo'))) fs.mkdirSync(path.join(__dirname, 'geo'), { recursive: true });
        const zlib = require('zlib');
        const data = zlib.gunzipSync(fs.readFileSync(gzPath));
        fs.writeFileSync(MMDB_PATH, data);
        console.log('[Geo] Extracted GeoLite2 database from package');
      }
    } catch (e) { console.error('[Geo] Failed to extract database:', e.message); }
  }
}

async function start() {
  await ensureGeoDb();
  await loadGeoReader();
  const db = await initDatabase();
  // seed 失败不该拖垮整个进程（例如重复键、字段缺失）
  try {
    await autoSeed(db);
  } catch (e) {
    console.error('[Server] autoSeed failed (non-fatal):', e.message);
  }

  // Periodic geo backfill — catches NULL entries from transient mmdb misses
  setInterval(async () => {
    try {
      const rows = await db.prepare("SELECT id, ip FROM visitor_ips WHERE country IS NULL AND ip != 'unknown' ORDER BY id DESC LIMIT 50").all();
      if (rows.length === 0) return;
      for (const row of rows) {
        const geo = await lookupGeo(row.ip);
        if (geo) {
          await db.prepare('UPDATE visitor_ips SET country=?,region=?,city=?,lat=?,lng=? WHERE id=?')
            .run(geo.country, geo.region, geo.city, geo.lat, geo.lon, row.id);
        }
      }
      console.log(`[Geo Backfill] Filled ${rows.filter(r => r).length}/${rows.length} NULL geo rows`);
    } catch {}
  }, 30 * 60 * 1000);

  const app = express();

app.set('trust proxy', 2);
app.use(compression());
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "https:", "data:", "blob:"],
      fontSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "https:"],
      frameSrc: ["https:", "data:"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
      objectSrc: ["'none'"],
    },
  },
}));
app.use(cors({ origin: ['https://www.ityvip.xyz', 'https://ityvip.xyz'], credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.text({ type: 'text/plain', limit: '1mb' }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});
app.use('/api', limiter);

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/admin/login', authLimiter);

const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/admin', adminLimiter);

  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.match(/\.(js|css|png|jpg|ico|svg|woff|ttf|map)$/)) {
      const today = new Date().toISOString().slice(0, 10);
      const ip = getClientIp(req);

      db.prepare('INSERT INTO page_views (date, pv, uv) VALUES (?, 1, 0) ON DUPLICATE KEY UPDATE pv = pv + 1').run(today).catch(() => {});
      if (!isPrivateIp(ip)) {
        db.prepare('SELECT id FROM visitor_ips WHERE date = ? AND ip = ?').get(today, ip).then((existIp) => {
          if (!existIp) {
            db.prepare('INSERT IGNORE INTO visitor_ips (date, ip) VALUES (?, ?)').run(today, ip).then(() => {
              db.prepare('UPDATE page_views SET uv = uv + 1 WHERE date = ?').run(today).catch(() => {});
              lookupGeo(ip).then(geo => {
                if (geo) {
                  db.prepare('UPDATE visitor_ips SET country=?,region=?,city=?,lat=?,lng=? WHERE date=? AND ip=?')
                    .run(geo.country, geo.region, geo.city, geo.lat, geo.lon, today, ip).catch(() => {});
                }
              }).catch(() => {});
            }).catch(() => {});
          }
        }).catch(() => {});
      }
    }
    next();
  });

  app.use('/api/public', require('./routes/public')(db));
  app.use('/api/admin', require('./routes/admin')(db));
  app.use('/api/parser', require('./routes/parser')(db));
  app.use('/api/music', require('./routes/music')());
  app.use('/api/meme', require('./routes/meme')(db));
  app.use('/api/m3u8', require('./routes/m3u8')(db));
  app.use('/api/hot', require('./routes/hot')());
  app.use('/api/ai', require('./routes/ai')(db));
  app.use('/api/admin/click-events', require('./routes/admin-clicks')(db));
  app.use('/api/push', require('./routes/push')(db));
  app.use('/api', require('./routes/og-image')());
  app.use('/api', require('./routes/rss')(db));
  app.use('/api', require('./routes/tracking')(db));
  app.use('/api/contact', require('./routes/contact')(db));
  app.use('/api/user', require('./routes/user')(db));

  /* ── 以下四项为「补齐前端假实现」时新增（2026-10-15）──────────────
   * 原后端只有 public / admin / parser 三条线，前端那些 setTimeout 伪造
   * 结果的工具（音视频转码、PDF 加解密、AI 文案）没有真实落点。
   * - parse  ：/api/video/parse、/api/video/download
   * - media  ：/api/media/process（后端 ffmpeg，不用 ffmpeg.wasm，
   *            否则要开 COEP 把解析站 iframe 一起搞挂）
   * - pdf    ：/api/pdf/crypt（后端 qpdf，浏览器端 pdf-lib 写不出加密 PDF）
   * - ai-writer：/api/ai/writer（密钥只存服务端）
   * - jx      ：/api/video/jx、/api/video/jxa
   *             解析页同源代理 —— 把跨域 iframe 变成同源，根治解析站
   *             播放器无法全屏 / 被 X-Frame-Options 拒绝的问题
   */
  app.use('/api', require('./routes/parse')(db));
  app.use('/api/media', require('./routes/media')());
  app.use('/api/pdf', require('./routes/pdf')());
  app.use('/api/ai', require('./routes/ai-writer'));
  app.use('/api', require('./routes/jx')(db));
  app.use('/api/search', require('./routes/search')(db));

  app.post('/api/web-vitals', express.json({ limit: '10kb' }), (req, res) => {
    res.status(204).end();
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Behavior tracking (dwell time, scroll depth, clicks)
  app.post('/api/track/behavior', async (req, res) => {
    const today = new Date().toISOString().slice(0, 10);
    const ip = getClientIp(req);
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');

    let body = req.body;
    if (typeof req.body === 'string') {
      try { body = JSON.parse(req.body); } catch { body = {}; }
    }
    const { page, dwell_time, scroll_depth, click_count, clicks } = body || {};
    if (!page) return res.type('text/plain').send('ok');

    try {
      const cappedDwell = Math.min(Math.max(0, dwell_time || 0), 3600);
      const entryTime = new Date();
      const exitTime = new Date(entryTime.getTime() + cappedDwell * 1000);
      const r = await db.prepare(
        'INSERT INTO page_behavior (date, ip, page, dwell_time, scroll_depth, click_count, entry_time, exit_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(today, ip, page, cappedDwell, scroll_depth || 0, click_count || 0, entryTime, exitTime);

      if (clicks && Array.isArray(clicks) && clicks.length > 0) {
        const batch = clicks.filter(c => c.element).map(c => [today, ip, page, c.element.slice(0, 255)]);
        if (batch.length > 0) {
          const placeholders = batch.map(() => '(?, ?, ?, ?)').join(', ');
          await db.prepare(`INSERT INTO click_events (date, ip, page, element) VALUES ${placeholders}`).run(...batch.flat());
        }
      }
    } catch (err) {
      console.error('[track/behavior]', err.message);
    }
    res.type('text/plain').send('ok');
  });

  // Tool usage tracking
  app.post('/api/track/tool', express.text({ type: '*/*' }), async (req, res) => {
    const today = new Date().toISOString().slice(0, 10);
    const ip = getClientIp(req);
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    const { tool, action, detail } = body || {};
    if (!tool || !action) return res.type('text/plain').send('ok');

    const detailStr = detail != null ? (typeof detail === 'string' ? detail : JSON.stringify(detail)) : null;

    try {
      await db.prepare(
        'INSERT INTO tool_usage (date, tool, action, ip, detail) VALUES (?, ?, ?, ?, ?)'
      ).run(today, tool, action, ip, detailStr);
    } catch (err) {
      console.error('[track/tool]', err.message);
    }
    res.type('text/plain').send('ok');
  });

  // Tracking beacon called from frontend (since OpenResty serves frontend directly)
  app.get('/api/track', async (req, res) => {
    const today = new Date().toISOString().slice(0, 10);
    const ip = getClientIp(req);
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');

    try {
      await db.prepare('INSERT INTO page_views (date, pv, uv) VALUES (?, 1, 0) ON DUPLICATE KEY UPDATE pv = pv + 1').run(today);
      if (!isPrivateIp(ip)) {
        const existIp = await db.prepare('SELECT id FROM visitor_ips WHERE date = ? AND ip = ?').get(today, ip);
        if (!existIp) {
          await db.prepare('INSERT IGNORE INTO visitor_ips (date, ip) VALUES (?, ?)').run(today, ip);
          await db.prepare('UPDATE page_views SET uv = uv + 1 WHERE date = ?').run(today);
        }
      }
    } catch (err) {
      console.error('[track]', err.message);
    }
    res.type('text/plain').send('ok');
  });

  const distPath = path.join(__dirname, '..', 'frontend', 'dist');

  // Route SEO data (keep in sync with scripts/seo-routes.js)
  const ROUTE_SEO = {
    '/': {
      title: '全民影视VIP视频解析 - 免费在线视频解析工具',
      desc: '全民影视提供免费视频解析服务，支持腾讯视频、优酷、爱奇艺、芒果TV等主流平台VIP视频解析播放，同时提供短视频去水印、表情包制作、在线播放器等实用工具。',
      keywords: '视频解析, VIP视频, 免费解析, 腾讯视频, 优酷, 爱奇艺, 芒果TV, 在线视频, 全民影视, 视频下载, 免费观看, VIP会员, 爱奇艺VIP, 腾讯视频VIP, 优酷VIP, 芒果TV会员, 视频去广告, 在线解析播放, 无广告视频, 短视频去水印, 表情包制作, 在线播放器',
    },
    '/hot': {
      title: '全网热搜排行榜 - 抖音/快手/小红书/YouTube 实时热搜 - 全民影视',
      desc: '实时查看抖音、快手、小红书、YouTube等平台热搜排行榜，掌握全网热门话题和流行趋势。',
      keywords: '热搜, 抖音热搜, 快手热搜, 小红书热搜, YouTube热搜, 实时热搜, 热门话题, 热榜, 排行榜, 热门视频, 热门话题榜, 实时热榜, 抖音热榜, 快手热榜, 微博热搜, 知乎热榜, 百度热搜, 今日热榜, 热点追踪, 流行趋势',
    },
    '/meme': {
      title: '表情包大全 - 海量斗图表情包免费下载 - 全民影视VIP视频解析',
      desc: '海量搞笑表情包免费下载，支持斗图、沙雕、萌宠、动漫、明星等分类。在线制作专属表情包，聊天斗图必备神器。',
      keywords: '表情包, 斗图, 搞笑表情, 沙雕表情, 萌宠表情, 动漫表情, 表情包下载, 在线制图, 表情包搜索, 斗图神器, 表情包大全, 免费表情包, 微信表情包, QQ表情包, 动态表情包, GIF表情包, 表情包制作, 自制表情包, 明星表情包, 沙雕图片',
    },
    '/maker': {
      title: '在线制图工具 - 表情包制作 - 全民影视VIP视频解析',
      desc: '在线表情包制作工具，选模板、加文字、贴贴纸，一键生成专属表情包并下载。支持热门、搞笑、沙雕、动漫等多种模板分类。',
      keywords: '表情包制作, 制图工具, 在线做图, 表情包生成器, meme生成器, 搞笑图片制作, 表情包生成, 在线制图工具, 模板制作, 文字贴纸, 自定义表情包, 表情包编辑器, DIY表情包, 一键生成表情包, 表情包模板, 文字加图片',
    },
    '/parser': {
      title: '短视频去水印 - 抖音/快手/小红书/B站 视频解析下载 - 全民影视VIP视频解析',
      desc: '免费在线短视频去水印工具，支持抖音、快手、小红书、B站等平台视频去水印下载。粘贴分享链接即可解析无水印视频。',
      keywords: '去水印, 短视频去水印, 抖音去水印, 快手去水印, 小红书去水印, 视频去水印, 无水印下载, 抖音视频下载, 快手视频下载, 小红书视频下载, B站视频下载, 视频解析下载, 短视频下载工具, 批量去水印, 视频提取, 分享链接解析',
    },
    '/m3u8': {
      title: '在线视频播放器 - M3U8/MP4/WebM 在线播放 - 全民影视VIP视频解析',
      desc: '免费在线视频播放器，支持 M3U8(HLS)、MP4、WebM、Ogg 格式在线播放。粘贴视频地址或拖放文件即可播放，支持多清晰度切换和代理转发。',
      keywords: '在线播放器, M3U8播放器, MP4播放, HLS播放, 视频播放, 流媒体播放, 在线看视频, m3u8在线播放, 视频链接播放, 流媒体在线播放, HLS播放器, 视频拖放播放, 多清晰度切换, 视频代理播放, 跨域视频播放, m3u8解析播放, WebM播放, Ogg播放, 视频文件播放',
    },
    '/tools': {
      title: '在线工具 - PDF/图片/音频/录屏 - 全民影视VIP视频解析',
      desc: '免费在线工具箱，包含PDF合并拆分压缩加密解密、PDF转图片、图片压缩格式转换裁剪OCR水印去背景、音频裁剪转换压缩、AI绘画提示词生成器、屏幕录制等实用工具，全部在浏览器中完成无需上传服务器。',
      keywords: '在线PDF工具, PDF合并, PDF压缩, 图片转PDF, PDF转图片, PDF转PNG, AI绘画提示词, AI提示词生成器, Midjourney提示词, Stable Diffusion提示词, 在线音频处理, 音频裁剪, 在线录屏, 屏幕录制, 免费在线工具, PDF加密解密, 图片工具, 音频转换, 在线工具箱, 图片压缩, 格式转换, 图片裁剪, OCR文字识别, 图片水印, 去水印, 九宫格切图, 在线PS, 去背景, 音频格式转换, 音频压缩, 在线录屏工具',
    },
    '/screen-recorder': {
      title: '在线屏幕录制 - 免费录屏工具 - 全民影视VIP视频解析',
      desc: '免费在线屏幕录制工具，无需下载安装，支持录制屏幕、浏览器标签页或应用窗口，可包含系统音频。录制完成后直接下载WebM视频。',
      keywords: '在线录屏, 屏幕录制, 免费录屏, 在线屏幕录制, 录屏工具, 网页录屏, 浏览器录屏, WebM录屏, 无需下载录屏, 在线录屏工具, 屏幕截图, 视频录制, 桌面录制, 免费录屏软件, 在线录制',
    },
    '/ai': {
      title: 'AI 工具导航 - 精选 60+ AI 工具合集 - 全民影视VIP视频解析',
      desc: '精选 60+ 热门 AI 工具，涵盖对话、图像、视频、编程、写作等分类，帮你快速找到合适的 AI 工具，全部免费收录。',
      keywords: 'AI工具, AI导航, AI工具导航, ChatGPT, Claude, Midjourney, AI对话, AI绘图, AI编程, AI视频, 人工智能工具, AI工具推荐, 免费AI工具, AI工具合集, AI产品导航, AI工具网站, AI发现, AI目录',
    },
    '/music': {
      title: '全网音乐在线搜索试听 - QQ音乐曲库 - 全民影视',
      desc: '免费在线音乐搜索试听工具，搜索 QQ 音乐曲库，在线播放高品质音乐，无需下载客户端。',
      keywords: '在线音乐, 音乐搜索, QQ音乐, 在线试听, 免费听歌, 音乐播放器, 全网音乐, 歌曲搜索, 音乐在线, 听歌, 音乐解析, 无损音乐',
    },
    '/recommend': {
      title: '影视推荐文章 - 电影/电视剧/动漫推荐 - 全民影视',
      desc: '精选电影、电视剧、动漫推荐榜单，每周更新热门影视排行，帮你发现好剧好电影。',
      keywords: '影视推荐, 电影推荐, 电视剧推荐, 动漫推荐, 热门影视, 影视排行, 每周推荐, 最新电影, 最新剧集, 流媒体推荐, Netflix推荐, 豆瓣高分, 影视指南',
    },
    '/mbti': {
      title: 'MBTI 人格测试 - 16型人格免费在线测试 - 全民影视',
      desc: '免费在线 MBTI 人格测试，16 型人格（ENFP、INTJ、INFP 等）性格测试。2 分钟测出你的人格类型，解锁性格特点、优缺点、适合职业、恋爱配对完整解析。',
      keywords: 'MBTI测试, 16型人格测试, MBTI人格测试, 性格测试, 在线测试, ENFP, INTJ, INFP, ENTP, INFJ, ISFJ, ESTJ, 人格解析, 职业测试',
    },
    '/tests': {
      title: '在线测评大全 - MBTI/大五/DISC/九型人格/霍兰德/依恋免费测试 - 全民影视',
      desc: '免费在线心理与职业测评合集：MBTI 16型人格、大五人格 OCEAN、DISC 行为风格、九型人格、霍兰德职业兴趣、恋爱依恋类型等。几分钟测出真实的你，解锁多份人格解析。',
      keywords: '在线测评, 免费心理测试, MBTI测试, 大五人格, DISC测评, 九型人格, 霍兰德职业兴趣, 依恋类型, 性格测试',
    },
    '/tests/disc': {
      title: 'DISC性格测试 - 4种行为风格免费在线测评 - 全民影视',
      desc: '免费在线 DISC 性格测试，24 道情境题测出你的主导行为风格（支配型 D / 影响型 I / 稳健型 S / 谨慎型 C），解锁行为特点、优势短板与职场沟通建议。',
      keywords: 'DISC测试, DISC性格测试, 行为风格测试, 支配型, 影响型, 稳健型, 谨慎型, 性格测评, 职场测评',
    },
    '/tests/bigfive': {
      title: '大五人格测试 (Big Five) - 40题免费在线测评 - 全民影视',
      desc: '免费在线大五人格测试（Big Five / OCEAN），40 道题测出你的开放性、尽责性、外向性、宜人性、神经质五个维度画像，全面了解你的性格特质。',
      keywords: '大五人格, Big Five, OCEAN, 大五人格测试, 开放性, 尽责性, 外向性, 宜人性, 神经质, 性格测试',
    },
    '/tests/enneagram': {
      title: '九型人格测试 - 9大性格类型免费在线测评 - 全民影视',
      desc: '免费在线九型人格测试（Enneagram），45 道题测出你的主导性格类型（1号完美型到9号和平型），解锁性格动机、防御机制、成长建议与职场表现。',
      keywords: '九型人格, 九型人格测试, Enneagram, 1号完美型, 2号助人型, 3号成就型, 人格类型, 性格测试',
    },
    '/tests/riasec': {
      title: '霍兰德职业兴趣测试 RIASEC - 6大职业代码免费测评 - 全民影视',
      desc: '免费在线霍兰德职业兴趣测试（RIASEC），30 道题测出你的职业兴趣代码（现实型 R / 研究型 I / 艺术型 A / 社会型 S / 企业型 E / 常规型 C），助你找到合适职业方向。',
      keywords: '霍兰德, 霍兰德职业兴趣, RIASEC, 职业兴趣测试, 职业测评, 现实型, 研究型, 艺术型, 社会型, 企业型, 常规型',
    },
    '/tests/attachment': {
      title: '恋爱依恋类型测试 - 4种依恋风格免费在线测评 - 全民影视',
      desc: '免费在线依恋类型测试（成人依恋），20 道题测出你的恋爱依恋风格（安全型 SA / 焦虑型 AP / 回避型 DL / 恐惧型 FE），了解你在亲密关系中的行为模式。',
      keywords: '依恋类型, 依恋测试, 恋爱依恋, 安全型依恋, 焦虑型依恋, 回避型依恋, 恐惧型依恋, 亲密关系, 恋爱测试',
    },

  };

  const MBTI_TYPE_SEO = [
    { code: 'ENFP', title: 'ENFP竞选者人格解析 - 性格特点、职业、恋爱配对', desc: 'ENFP竞选者人格是16型人格之一，热情自由、充满灵感。了解 ENFP 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
    { code: 'ENTP', title: 'ENTP辩论家人格解析 - 性格特点、职业、恋爱配对', desc: 'ENTP辩论家人格是16型人格之一，机智敏捷、爱好思考碰撞。了解 ENTP 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
    { code: 'INTJ', title: 'INTJ建筑师（战略家）人格解析 - 性格特点、职业、恋爱', desc: 'INTJ建筑师人格是16型人格之一，理性深谋、独立自主。了解 INTJ 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
    { code: 'INTP', title: 'INTP逻辑学家（思考者）人格解析 - 性格特点、职业、恋爱', desc: 'INTP逻辑学家人格是16型人格之一，好奇理性、热爱探索原理。了解 INTP 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
    { code: 'INFJ', title: 'INFJ提倡者（守护者）人格解析 - 性格特点、职业、恋爱', desc: 'INFJ提倡者人格是16型人格之一，安静内省、理想主义。了解 INFJ 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
    { code: 'ISTJ', title: 'ISTJ物流师人格解析 - 性格特点、职业、恋爱配对', desc: 'ISTJ物流师人格是16型人格之一，尽职尽责、可靠守序。了解 ISTJ 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
    { code: 'ISFJ', title: 'ISFJ守卫者人格解析 - 性格特点、职业、恋爱配对', desc: 'ISFJ守卫者人格是16型人格之一，温柔细心、默默守护。了解 ISFJ 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
    { code: 'ESTJ', title: 'ESTJ总经理人格解析 - 性格特点、职业、恋爱配对', desc: 'ESTJ总经理人格是16型人格之一，务实高效、组织力强。了解 ESTJ 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
    { code: 'ESFJ', title: 'ESFJ执政官人格解析 - 性格特点、职业、恋爱配对', desc: 'ESFJ执政官人格是16型人格之一，热情周到、乐于助人。了解 ESFJ 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
    { code: 'ESTP', title: 'ESTP冒险家人格解析 - 性格特点、职业、恋爱配对', desc: 'ESTP企业家（冒险家）人格是16型人格之一，行动力强、反应敏捷。了解 ESTP 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
    { code: 'ESFP', title: 'ESFP表演者人格解析 - 性格特点、职业、恋爱配对', desc: 'ESFP表演者人格是16型人格之一，热情开朗、享受当下。了解 ESFP 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
    { code: 'ENFJ', title: 'ENFJ主人公（教师）人格解析 - 性格特点、职业、恋爱配对', desc: 'ENFJ主人公人格是16型人格之一，共情力强、天生领袖气质。了解 ENFJ 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
    { code: 'ISFP', title: 'ISFP探险家（艺术家）人格解析 - 性格特点、职业、恋爱', desc: 'ISFP探险家（艺术家）人格是16型人格之一，安静细腻、忠于内心感受。了解 ISFP 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
    { code: 'INFP', title: 'INFP调停者人格解析 - 性格特点、职业、恋爱配对', desc: 'INFP调停者人格是16型人格之一，纯真理想、富有同理心。了解 INFP 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
    { code: 'ENTJ', title: 'ENTJ指挥官人格解析 - 性格特点、职业、恋爱配对', desc: 'ENTJ指挥官人格是16型人格之一，果断自信、极具领导气质。了解 ENTJ 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
    { code: 'ISTP', title: 'ISTP实干家（鉴赏家）人格解析 - 性格特点、职业、恋爱', desc: 'ISTP实干家（鉴赏家）人格是16型人格之一，冷静理性、动手能力超强。了解 ISTP 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
  ];

  // 通用评测类型详情 SEO：slug -> pdf 码解析
  const ASSESS_TYPE_SEO = {
    disc: [
      { code: 'D', title: 'D支配型性格解析 - DISC行为风格特点、职业、沟通', desc: 'D支配型是DISC四种行为风格之一，果断直接、目标导向。了解 D 支配型性格特点、优势短板、适合职业与沟通方式，免费DISC测评。' },
      { code: 'I', title: 'I影响型性格解析 - DISC行为风格特点、职业、沟通', desc: 'I影响型是DISC四种行为风格之一，热情开朗、善于感染他人。了解 I 影响型性格特点、优势短板、适合职业与沟通方式，免费DISC测评。' },
      { code: 'S', title: 'S稳健型性格解析 - DISC行为风格特点、职业、沟通', desc: 'S稳健型是DISC四种行为风格之一，耐心可靠、重视和谐。了解 S 稳健型性格特点、优势短板、���合职业与沟通方式，免费DISC测评。' },
      { code: 'C', title: 'C谨慎型性格解析 - DISC行为风格特点、职业、沟通', desc: 'C谨慎型是DISC四种行为风格之一，严谨细致、追求精确。了解 C 谨慎型性格特点、优势短板、适合职业与沟通方式，免费DISC测评。' },
    ],
    bigfive: [
      { code: 'O', title: '开放性人格解析 - 大五人格特点、表现、提升', desc: '开放性是大五人格OCEAN五维之一，高分者好奇、富有想象力。了解开放性高分与低分特征、对生活的影响与大五人格测试。' },
      { code: 'C', title: '尽责性人格解析 - 大五人格特点、表现、提升', desc: '尽责性是大五人格OCEAN五维之一，高分者自律可靠、目标感强。了解尽责性高分与低分特征、对生活的影响与大五人格测试。' },
      { code: 'E', title: '外向性人格解析 - 大五人格特点、表现、提升', desc: '外向性是大五人格OCEAN五维之一，高分者热情健谈、能量外放。了解外向性高分与低分特征、对生活的影响与大五人格测试。' },
      { code: 'A', title: '宜人性人格解析 - 大五人格特点、表现、提升', desc: '宜人性是大五人格OCEAN五维之一，高分者合作、友善、信任他人。了解宜人性高分与低分特征、对生活的影响与大五人格测试。' },
      { code: 'N', title: '神经质人格解析 - 大五人格特点、表现、提升', desc: '神经质是大五人格OCEAN五维之一，高分者对压力敏感、情绪波动。了解神经质高分与低分特征、情绪管理与免费大五人格测试。' },
    ],
    enneagram: [
      { code: '1', title: '1号完美型人格解析 - 九型人格在线测评', desc: '1号完美型是九型人格之一，原则性强、追求完美。了解1号性格动机、优势短板、成长建议与免费九型人格测试。' },
      { code: '2', title: '2号助人型人格解析 - 九型人格在线测评', desc: '2号助人型是九型人格之一，热心慷慨、渴望被爱。了解2号性格动机、优势短板、成长建议与免费九型人格测试。' },
      { code: '3', title: '3号成就型人格解析 - 九型人格在线测评', desc: '3号成就型是九型人格之一，目标明确、注重形象。了解3号性格动机、优势短板、成长建议与免费九型人格测试。' },
      { code: '4', title: '4号自我型人格解析 - 九型人格在线测评', desc: '4号自我型是九型人格之一，情感丰富、追求独特。了解4号性格动机、优势短板、成长建议与免费九型人格测试。' },
      { code: '5', title: '5号理智型人格解析 - 九型人格在线测评', desc: '5号理智型是九型人格之一，冷静理性、渴望知识。了解5号性格动机、优势短板、成长建议与免费九型人格测试。' },
      { code: '6', title: '6号忠诚型人格解析 - 九型人格在线测评', desc: '6号忠诚型是九型人格之一，谨慎可靠、重视安全。了解6号性格动机、优势短板、成长建议与免费九型人格测试。' },
      { code: '7', title: '7号活跃型人格解析 - 九型人格在线测评', desc: '7号活跃型是九型人格之一，乐观开朗、热爱自由。了解7号性格动机、优势短板、成长建议与免费九型人格测试。' },
      { code: '8', title: '8号领袖型人格解析 - 九型人格在线测评', desc: '8号领袖型是九型人格之一，霸气果断、保护欲强。了解8号性格动机、优势短板、成长建议与免费九型人格测试。' },
      { code: '9', title: '9号和平型人格解析 - 九型人格在线测评', desc: '9号和平型是九型人格之一，温和包容、渴望和谐。了解9号性格动机、优势短板、成长建议与免费九型人格测试。' },
    ],
    riasec: [
      { code: 'R', title: '现实型 R 职业兴趣解析 - 霍兰德 RIASEC 测评', desc: '现实型 R 是霍兰德职业兴趣六大类型之一，喜欢动手实操、与物打交道。了解现实型适合职业与性格特点，免费霍兰德职业测评。' },
      { code: 'I', title: '研究型 I 职业兴趣解析 - 霍兰德 RIASEC 测评', desc: '研究型 I 是霍兰德职业兴趣六大类型之一，喜欢分析思考、探索真相。了解研究型适合职业与性格特点，免费霍兰德职业测评。' },
      { code: 'A', title: '艺术型 A 职业兴趣解析 - 霍兰德 RIASEC 测评', desc: '艺术型 A 是霍兰德职业兴趣六大类型之一，富有创意、追求表达。了解艺术型适合职业与性格特点，免费霍兰德职业测评。' },
      { code: 'S', title: '社会型 S 职业兴趣解析 - 霍兰德 RIASEC 测评', desc: '社会型 S 是霍兰德职业兴趣六大类型之一，乐于助人、擅长沟通。了解社会型适合职业与性格特点，免费霍兰德职业测评。' },
      { code: 'E', title: '企业型 E 职业兴趣解析 - 霍兰德 RIASEC 测评', desc: '企业型 E 是霍兰德职业兴趣六大类型之一，敢闯敢拼、领导力强。了解企业型适合职业与性格特点，免费霍兰德职业测评。' },
      { code: 'C', title: '常规型 C 职业兴趣解析 - 霍兰德 RIASEC 测评', desc: '常规型 C 是霍兰德职业兴趣六大类型之一，细致有序、擅长执行。了解常规型适合职业与性格特点，免费霍兰德职业测评。' },
    ],
    attachment: [
      { code: 'SA', title: '安全型依恋解析 - 恋爱依恋类型测试', desc: '安全型依恋是成人依恋四类型之一，自信独立、能与伴侣建立健康亲密关系。了解安全型依恋特点、恋爱表现与免费依恋类型测试。' },
      { code: 'AP', title: '焦虑型依恋解析 - 恋爱依恋类型测试', desc: '焦虑型依恋是成人依恋四类型之一，渴望靠近又怕被抛弃。了解焦虑型依恋特点、恋爱表现、相处建议与免费依恋类型测试。' },
      { code: 'DL', title: '回避型依恋解析 - 恋爱依恋类型测试', desc: '回避型依恋是成人依恋四类型之一，习惯独立、难以依赖他人。了解回避型依恋特点、恋爱表现、相处建议与免费依恋类型测试。' },
      { code: 'FE', title: '恐惧型依恋解析 - 恋爱依恋类型测试', desc: '恐惧型依恋是成人依恋四类型之一，既渴望亲密又害怕受伤。了解恐惧型依恋特点、恋爱表现、相处建议与免费依恋类型测试。' },
    ],
  };

  const TOOL_SLUG_TITLES = {
    'video-downloader': '在线视频下载器 - 抖音/B站/快手去水印下载 - 全民影视',
    'image-upscaler': '在线图片无损放大工具 - 2x/3x/4x AI放大 - 全民影视',
    'pdf-to-word': 'PDF转Word - 免费在线PDF转Word文档 - 全民影视',
    'image-editor': '在线PS图片编辑器 - 免费修图工具 - 全民影视',
    'remove-background': '在线AI去背景 - 图片背景移除工具 - 全民影视',
    'pdf-compress': '在线PDF压缩 - 免费压缩PDF文件大小 - 全民影视',
    'pdf-merge': '在线PDF合并 - 免费合并多个PDF文件 - 全民影视',
    'qr-code-generator': '在线二维码生成器 - 免费生成二维码 - 全民影视',
    'ai-prompt': 'AI绘画提示词生成器 - Midjourney/Stable Diffusion提示词 - 全民影视',
    'phone-lookup': '手机号码归属地查询 - 免费手机号查询 - 全民影视',
    'regex-tester': '在线正则表达式测试器 - 实时匹配高亮 - 全民影视',
    'json-formatter': '在线JSON格式化工具 - 格式化/压缩/校验JSON - 全民影视',
    'base64-tool': 'Base64在线编解码工具 - Base64加密解密 - 全民影视',
  };
  const TOOL_SLUG_KEYWORDS = '在线工具, PDF工具, 图片工具, 音频工具, 屏幕录制, 免费在线工具';

  async function getSeoSettings() {
    try {
      const rows = await db.prepare("SELECT `key`, `value` FROM site_settings WHERE `key` IN ('site_title','site_description','site_keywords','stats_code')").all();
      const map = Object.fromEntries((rows || []).map(r => [r.key, r.value]));
      return {
        title: map.site_title || '全民影视VIP视频解析',
        description: map.site_description || '',
        keywords: map.site_keywords || '',
        statsCode: map.stats_code || '',
      };
    } catch {
      return { title: '全民影视VIP视频解析', description: '', keywords: '', statsCode: '' };
    }
  }

  function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function injectSeoIntoHtml(html, seo) {
    let result = html;
    const safeTitle = escapeHtml(seo.title || '');
    const safeDesc = escapeHtml(seo.description || '');
    const safeKw = escapeHtml(seo.keywords || '');

    result = result.replace(/<title>.*?<\/title>/, `<title>${safeTitle}</title>`);

    const setMeta = (name, content) => {
      if (!content) return;
      const re = new RegExp(`<meta name="${name}" content=".*?"\\s*\\/?>`, 'i');
      const tag = `    <meta name="${name}" content="${content}" />`;
      if (re.test(result)) {
        result = result.replace(re, tag);
      } else {
        result = result.replace('</title>', `</title>\n${tag}`);
      }
    };

    const setOgMeta = (prop, content) => {
      if (!content) return;
      const re = new RegExp(`<meta property="og:${prop}" content=".*?"\\s*\\/?>`, 'i');
      const tag = `    <meta property="og:${prop}" content="${content}" />`;
      if (re.test(result)) {
        result = result.replace(re, tag);
      } else {
        result = result.replace('</title>', `</title>\n${tag}`);
      }
    };

    const setCanonical = (url) => {
      const re = /<link rel="canonical" href=".*?"\s*\/?>/i;
      const tag = `    <link rel="canonical" href="${url}" />`;
      if (re.test(result)) {
        result = result.replace(re, tag);
      }
    };

    setMeta('description', safeDesc);
    setMeta('keywords', safeKw);
    setOgMeta('title', safeTitle);
    setOgMeta('description', safeDesc);
    setOgMeta('image', seo.ogImage || '/og-image.png');
    if (seo.canonical) setCanonical(seo.canonical);

    // JSON-LD injection: replace existing ld+json, or insert before </head>
    if (seo.ldJson) {
      const ldTag = `    <script type="application/ld+json">\n    ${seo.ldJson}\n    </script>`;
      if (/<script type="application\/ld\+json">[\s\S]*?<\/script>/.test(result)) {
        result = result.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, ldTag);
      } else {
        result = result.replace('</head>', `${ldTag}\n  </head>`);
      }
    }

    // 统计代码（stats_code）注入：非空且 HTML 中尚不存在同一代码时，原样插入 </head> 前
    if (seo.statsCode && !result.includes(seo.statsCode.trim())) {
      result = result.replace('</head>', `    ${seo.statsCode}\n  </head>`);
    }

    return result;
  }

  function cleanText(s) {
    return String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  }

  function buildArticleSeo(article) {
    const title = cleanText(article.title) + ' - 全民影视';
    const desc = cleanText(article.excerpt || article.title);
    const url = `https://www.ityvip.xyz/recommend/${article.slug}`;
    const img = article.cover_image
      ? '/api/public/img-proxy?url=' + encodeURIComponent(article.cover_image)
      : 'https://www.ityvip.xyz/og-image.png';
    const date = article.published_at ? new Date(article.published_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    const breadLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "首页", "item": "https://www.ityvip.xyz/" },
        { "@type": "ListItem", "position": 2, "name": "影视推荐", "item": "https://www.ityvip.xyz/recommend" },
        { "@type": "ListItem", "position": 3, "name": cleanText(article.title), "item": url },
      ]
    });

    const articleLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": cleanText(article.title),
      "description": desc,
      "image": img,
      "datePublished": date,
      "author": { "@type": "Person", "name": cleanText(article.author || 'Scraper') },
      "publisher": { "@type": "Organization", "name": "全民影视" },
      "mainEntityOfPage": { "@type": "WebPage", "@id": url },
      "keywords": article.tags || '',
    });

    return {
      title,
      description: desc,
      keywords: article.tags || '影视推荐,文章',
      canonical: url,
      ogImage: article.cover_image
        ? '/api/public/img-proxy?url=' + encodeURIComponent(article.cover_image)
        : '/api/og-image?title=' + encodeURIComponent(cleanText(article.title).slice(0, 50)) + '&subtitle=' + encodeURIComponent(desc.slice(0, 80)) + '&type=article',
      ldJson: breadLd + '\n    ' + articleLd,
    };
  }

  if (fs.existsSync(distPath)) {
    // Ping search engines
    app.post('/api/ping-search-engines', async (req, res) => {
      const sitemapUrl = 'https://www.ityvip.xyz/sitemap.xml';
      const results = [];
      try {
        const gr = await fetch('https://www.google.com/ping?sitemap=' + encodeURIComponent(sitemapUrl), { signal: AbortSignal.timeout(5000) });
        results.push('google:' + gr.status);
      } catch (e) { results.push('google:err:' + e.message); }
      try {
        const br = await fetch('https://data.zz.baidu.com/urls?site=www.ityvip.xyz&token=' + encodeURIComponent(process.env.BAIDU_TOKEN || ''), { method: 'POST', body: sitemapUrl, headers: { 'Content-Type': 'text/plain' }, signal: AbortSignal.timeout(5000) });
        results.push('baidu:' + br.status);
      } catch (e) { results.push('baidu:err:' + e.message); }
      try {
        const sg = await fetch('http://www.sogou.com/sitemap/ping.php?url=' + encodeURIComponent(sitemapUrl), { signal: AbortSignal.timeout(5000) });
        results.push('sogou:' + sg.status);
      } catch (e) { results.push('sogou:err:' + e.message); }
      try {
        const so = await fetch('https://www.so.com/sitemap/ping?sitemap=' + encodeURIComponent(sitemapUrl), { signal: AbortSignal.timeout(5000) });
        results.push('360:' + so.status);
      } catch (e) { results.push('360:err:' + e.message); }
      res.json({ success: true, results });
    });

    // Dynamic sitemap
    app.get('/sitemap.xml', async (req, res) => {
      const today = new Date().toISOString().split('T')[0];
      const staticUrls = Object.keys(ROUTE_SEO).map(r => ({
        loc: `https://www.ityvip.xyz${r}`,
        lastmod: today,
        changefreq: 'weekly',
        priority: r === '/' ? '1.0' : '0.8',
      }));

      const assessTypeUrls = Object.entries(ASSESS_TYPE_SEO).flatMap(([slug, list]) =>
        list.map(m => ({
          loc: `https://www.ityvip.xyz/tests/${slug}/${m.code.toLowerCase()}`,
          lastmod: today,
          changefreq: 'weekly',
          priority: '0.7',
        }))
      );

      let articleUrls = [];
      try {
        const rows = await db.prepare('SELECT slug, published_at FROM articles WHERE is_published = 1 ORDER BY published_at DESC LIMIT 5000').all();
        articleUrls = (rows || []).map(r => ({
          loc: `https://www.ityvip.xyz/recommend/${r.slug}`,
          lastmod: r.published_at ? new Date(r.published_at).toISOString().split('T')[0] : today,
          changefreq: 'monthly',
          priority: '0.6',
        }));
      } catch {}

      const toolUrls = Object.keys(TOOL_SLUG_TITLES).map(slug => ({
        loc: `https://www.ityvip.xyz/tools/${slug}`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.7',
      }));

      const allUrls = [...staticUrls, ...assessTypeUrls, ...articleUrls, ...toolUrls];
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
        allUrls.map(u => `  <url>\n    <loc>${escapeHtml(u.loc)}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n')
      }\n</urlset>`;

      res.set('Content-Type', 'application/xml; charset=utf-8');
      res.send(xml);
    });

    // RSS feed
    app.get('/rss.xml', async (req, res) => {
      try {
        const rows = await db.prepare('SELECT slug, title, excerpt, category, published_at FROM articles WHERE is_published = 1 ORDER BY published_at DESC LIMIT 50').all();
        const items = (rows || []).map(a => `  <item>\n    <title>${escapeHtml(a.title)}</title>\n    <link>https://www.ityvip.xyz/recommend/${escapeHtml(a.slug)}</link>\n    <description>${escapeHtml((a.excerpt || a.title).replace(/<[^>]+>/g, '').slice(0, 500))}</description>\n    <category>${escapeHtml(a.category || '')}</category>\n    <pubDate>${a.published_at ? new Date(a.published_at).toUTCString() : new Date().toUTCString()}</pubDate>\n    <guid>https://www.ityvip.xyz/recommend/${escapeHtml(a.slug)}</guid>\n  </item>`).join('\n');
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n  <title>全民影视 - 影视推荐</title>\n  <link>https://www.ityvip.xyz/</link>\n  <description>精选影视推荐、使用技巧和最新内容</description>\n  <language>zh-cn</language>\n  <atom:link href="https://www.ityvip.xyz/rss.xml" rel="self" type="application/rss+xml"/>\n${items}\n</channel>\n</rss>`;
        res.set('Content-Type', 'application/rss+xml; charset=utf-8');
        res.set('Cache-Control', 'public, max-age=1800');
        res.send(xml);
      } catch (e) {
        res.status(500).send('RSS generation failed');
      }
    });

    // Serve pre-compressed Brotli files (generated by vite-plugin-compression)
    const compressibleExt = ['.js', '.css', '.html', '.svg', '.json', '.woff2'];
    app.use((req, res, next) => {
      const accept = req.headers['accept-encoding'] || '';
      const ext = req.path.match(/\.(\w+)$/)?.[0];
      if (ext && accept.includes('br') && compressibleExt.includes(ext)) {
        const brPath = path.join(distPath, req.path + '.br');
        if (fs.existsSync(brPath)) {
          req.url = req.path + '.br';
          const mimeMap = { '.js': 'application/javascript', '.css': 'text/css', '.html': 'text/html', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2' };
          res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
          res.setHeader('Content-Encoding', 'br');
          res.setHeader('Vary', 'Accept-Encoding');
        }
      }
      next();
    });
    // Serve pre-built static files (including route-specific HTML from seo-routes.js)
    // index:false —— 让 "/" 也走下方 catch-all 的 per-route SEO 注入（ROUTE_SEO['/'] 才会生效）
    app.use(express.static(distPath, { index: false, maxAge: '30d', immutable: true }));
    // Serve uploaded images (from scraper)
    app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads'), { maxAge: '7d' }));

    // Catch-all: dynamic SEO for article detail pages and fallback
    app.get('*', async (req, res) => {
      // 未匹配的 GET /api/*：明确返回 404 JSON，避免请求无限挂起
      if (req.path.startsWith('/api')) return res.status(404).json({ success: false, error: '接口不存在' });

      const rawHtml = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
      let seo = null;
      const pathKey = req.path.replace(/\/$/, '') || '/';

      // Article detail page
      const articleMatch = req.path.match(/^\/recommend\/([^/]+)$/);
      if (articleMatch) {
        try {
          const article = await db.prepare('SELECT id, title, slug, excerpt, cover_image, author, category, tags, published_at FROM articles WHERE slug = ? AND is_published = 1').get(articleMatch[1]);
          if (article) seo = buildArticleSeo(article);
        } catch {}
      }

      // Tool detail page
      if (!seo) {
        const toolMatch = req.path.match(/^\/tools\/([a-z0-9-]+)$/);
        if (toolMatch) {
          const slug = toolMatch[1];
          const title = TOOL_SLUG_TITLES[slug];
          if (title) {
            const toolUrl = `https://www.ityvip.xyz/tools/${slug}`;
            const toolDesc = '免费在线' + slug.replace(/-/g, ' ') + '工具';
            seo = {
              title,
              description: toolDesc + '，浏览器中直接使用，无需下载安装。',
              ogImage: '/api/og-image?title=' + encodeURIComponent(title.split(' - ')[0].slice(0, 50)) + '&subtitle=' + encodeURIComponent(toolDesc.slice(0, 80)) + '&type=tool',
              keywords: TOOL_SLUG_KEYWORDS,
              canonical: toolUrl,
              ldJson: [
                JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "BreadcrumbList",
                  "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "首页", "item": "https://www.ityvip.xyz/" },
                    { "@type": "ListItem", "position": 2, "name": "在线工具", "item": "https://www.ityvip.xyz/tools" },
                    { "@type": "ListItem", "position": 3, "name": slug.replace(/-/g, ' ') }
                  ]
                }),
                JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "SoftwareApplication",
                  "name": title.split(' - ')[0],
                  "url": toolUrl,
                  "description": '免费在线' + slug.replace(/-/g, ' ') + '工具',
                  "applicationCategory": "UtilitiesApplication",
                  "operatingSystem": "All",
                  "browserRequirements": "Requires JavaScript"
                }),
              ].join('\n'),
            };
          }
        }
      }

      // MBTI type detail page
      if (!seo) {
        const mbtiMatch = req.path.match(/^\/mbti\/([a-z]+)$/);
        if (mbtiMatch) {
          const m = MBTI_TYPE_SEO.find(t => t.code.toLowerCase() === mbtiMatch[1].toLowerCase());
          if (m) {
            const mbtiUrl = `https://www.ityvip.xyz/mbti/${m.code.toLowerCase()}`;
            seo = {
              title: m.title + ' - 全民影视',
              description: m.desc,
              keywords: 'MBTI, 16型人格, ' + m.code + ', MBTI测试, 人格解析, 性格测试, 职业测试',
              canonical: mbtiUrl,
              ogImage: '/api/og-image?title=' + encodeURIComponent(m.title.split(' - ')[0].slice(0, 50)) + '&subtitle=' + encodeURIComponent(m.desc.slice(0, 80)) + '&type=site',
              ldJson: [
                JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "BreadcrumbList",
                  "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "首页", "item": "https://www.ityvip.xyz/" },
                    { "@type": "ListItem", "position": 2, "name": "MBTI 测试", "item": "https://www.ityvip.xyz/mbti" },
                    { "@type": "ListItem", "position": 3, "name": m.code }
                  ]
                }),
                JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "Article",
                  "headline": m.title,
                  "description": m.desc,
                  "url": mbtiUrl,
                  "author": { "@type": "Organization", "name": "全民影视" },
                  "publisher": { "@type": "Organization", "name": "全民影视" },
                  "mainEntityOfPage": { "@type": "WebPage", "@id": mbtiUrl },
                }),
              ].join('\n'),
            };
          }
        }
      }

      // 通用评测类型详情页
      if (!seo) {
        const assessMatch = req.path.match(/^\/tests\/([a-z-]+)\/([a-z0-9]+)$/);
        if (assessMatch) {
          const list = ASSESS_TYPE_SEO[assessMatch[1]];
          const m = list && list.find(t => t.code.toLowerCase() === assessMatch[2].toLowerCase());
          if (m) {
            const assUrl = `https://www.ityvip.xyz/tests/${assessMatch[1]}/${m.code.toLowerCase()}`;
            const testName = { disc: 'DISC性格测试', bigfive: '大五人格测试', enneagram: '九型人格测试', riasec: '霍兰德职业兴趣测试', attachment: '恋爱依恋类型测试' }[assessMatch[1]] || '在线测评';
            const testUrl = `https://www.ityvip.xyz/tests/${assessMatch[1]}`;
            seo = {
              title: m.title + ' - 全民影视',
              description: m.desc,
              keywords: `${assessMatch[1].toUpperCase()}, ${m.code}, ${assessMatch[1]}, 在线测评, 人格解析, 性格测试`,
              canonical: assUrl,
              ogImage: '/api/og-image?title=' + encodeURIComponent(m.title.split(' - ')[0].slice(0, 50)) + '&subtitle=' + encodeURIComponent(m.desc.slice(0, 80)) + '&type=site',
              ldJson: [
                JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "BreadcrumbList",
                  "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "首页", "item": "https://www.ityvip.xyz/" },
                    { "@type": "ListItem", "position": 2, "name": "在线测评", "item": "https://www.ityvip.xyz/tests" },
                    { "@type": "ListItem", "position": 3, "name": testName, "item": testUrl },
                    { "@type": "ListItem", "position": 4, "name": m.code }
                  ]
                }),
                JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "Article",
                  "headline": m.title,
                  "description": m.desc,
                  "url": assUrl,
                  "author": { "@type": "Organization", "name": "全民影视" },
                  "publisher": { "@type": "Organization", "name": "全民影视" },
                  "mainEntityOfPage": { "@type": "WebPage", "@id": assUrl },
                }),
              ].join('\n'),
            };
          }
        }
      }

      // Known static route
      if (!seo && ROUTE_SEO[pathKey]) {
        const r = ROUTE_SEO[pathKey];
        const pageUrl = `https://www.ityvip.xyz${pathKey}`;
        seo = {
          title: r.title,
          description: r.desc,
          keywords: r.keywords,
          canonical: pageUrl,
          ogImage: '/api/og-image?title=' + encodeURIComponent(r.title.split(' - ')[0].slice(0, 50)) + '&subtitle=' + encodeURIComponent(r.desc.slice(0, 80)) + '&type=site',
          ldJson: JSON.stringify({
            "@context": "https://schema.org",
            "@type": pathKey === '/' ? 'WebSite' : 'WebPage',
            "name": r.title,
            "url": pageUrl,
            "description": r.desc,
          }),
        };
      }

      // 统计代码（stats_code）为全站注入：无论 seo 来源（路由表/文章/DB）都读取并附带
      const dbSeo = await getSeoSettings();
      if (!seo) {
        seo = dbSeo;
        seo.canonical = `https://www.ityvip.xyz${pathKey}`;
        seo.ogImage = '/og-image.png';
      } else {
        seo.statsCode = dbSeo.statsCode;
      }

      const html = injectSeoIntoHtml(rawHtml, seo);
      res.set('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    });

    console.log('[Server] Serving frontend from frontend/dist (with per-route SEO)');
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
