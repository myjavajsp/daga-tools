/**
 * daga-clone — server/routes/parse.js
 * 视频解析接口：POST /api/video/parse
 * 视频下载代理：GET  /api/video/download?url=...&name=...
 *
 *   - 短视频（抖音 / 快手 / TikTok / 微博 / 小红书）：调用「去水印」上游 API，
 *     返回可直接下载的视频地址（多线路兜底）。
 *   - 长视频 VIP（腾讯 / 优酷 / 爱奇艺 / 芒果 等）：使用后台配置的解析接口，
 *     返回可内嵌播放的地址（iframe 播放）。
 *
 * 为什么要有 /download 代理：
 *   浏览器的 <a download> 对「跨域」链接会被忽略（只会跳转/内嵌播放），
 *   且抖音 CDN 的签名地址缺少 Referer/UA 时常返回 403。
 *   所以由后端代发请求补齐请求头，并以 Content-Disposition: attachment 回吐，
 *   前端再用同源链接下载，download 属性才真正生效。
 */

const express = require('express');
const { Readable } = require('stream');
const dns = require('dns').promises;
const { optional: userOptional } = require('../middleware/user-auth');
const { createMiddleware: createQuotaMiddleware } = require('../middleware/quota');

/**
 * 内置「短视频去水印」上游（GET ?url= 形式）。
 * 第一条为当前稳定可用的「帝帝聚合」接口，其余为历史兜底。
 * 后台 parse_interfaces(type='short') 中的条目优先于此处（按 sort_order）。
 */
const DEFAULT_SHORT_UPSTREAMS = [
  'https://gateway.diadi.cn/api/parse?app_secret=7vpylQoLLCxgaSKIIlsYrFHsCObBWPAup&url=',
  'https://api.pearktrue.cn/api/douyin/?url=',
  'https://api.toubiec.cn/api/douyin?url=',
  'https://api.lyhLink.cn/api/video/douyin?url=',
  'https://jiaoshou.jsososo.com/api/?url=',
  'https://api.iiiku.com/api/v1/douyin?url=',
];

/** 请求上游/抖音 CDN 时使用的浏览器头 */
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
/** 下载抖音 CDN 资源时用移动端 UA + 抖音 Referer，成功率更高 */
const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1';

/** 根据链接判断平台 */
function detectPlatform(url) {
  const u = (url || '').toLowerCase();
  if (u.includes('douyin')) return 'douyin';
  if (u.includes('kuaishou') || u.includes('gifshow')) return 'kuaishou';
  if (u.includes('tiktok')) return 'tiktok';
  if (u.includes('weibo')) return 'weibo';
  if (u.includes('xiaohongshu') || u.includes('xhslink')) return 'xhs';
  return 'vip';
}

const IMG_EXT = /\.(jpe?g|png|webp|gif)(\?|$)/i;
const MEDIA_EXT = /\.(mp4|m3u8|mov|webm|flv)(\?|$)/i;
const IMG_KEY = /(cover|poster|thumbnail|img|image|pic|avatar)/i;
const MEDIA_KEY = /(video|play|download|media|aweme|src|url|wm|no_?watermark|nowm|raw)/i;
const CDN_HINT = /douyinvod|byteimg|ixigua|douyin|tiktok|musical\.ly|v\.music|tos-cn|tiktokcdn|akamaized|clouddn|qiniucdn|aliyuncs|snssdk/i;

/** 递归收集对象里的 标题 / 封面图 / 视频地址（含数组内字符串） */
function extractMedia(json) {
  let title = '';
  const images = [];
  const videos = [];
  const seen = new Set();

  const consider = (key, v) => {
    if (typeof v !== 'string' || !/^https?:\/\//.test(v)) return;
    const isImg = IMG_EXT.test(v) || (IMG_KEY.test(key) && !MEDIA_EXT.test(v) && !CDN_HINT.test(v));
    const isVid = MEDIA_EXT.test(v) || CDN_HINT.test(v) || (MEDIA_KEY.test(key) && v.length > 40);
    if (isImg && !seen.has(v)) {
      seen.add(v);
      images.push(v);
    } else if (isVid && !seen.has(v)) {
      seen.add(v);
      videos.push({ key, url: v });
    }
  };

  const walk = (o, key) => {
    if (o == null) return;
    if (typeof o === 'string') {
      consider(key || '', o);
      return;
    }
    if (Array.isArray(o)) {
      o.forEach((item, i) => walk(item, key || 'item' + i));
      return;
    }
    if (typeof o === 'object') {
      for (const k of Object.keys(o)) {
        const v = o[k];
        if (!title && /^(title|desc|description|text|caption|aweme_description)$/i.test(k) && typeof v === 'string' && v.trim()) {
          title = v.trim();
        }
        walk(v, k);
      }
    }
  };

  walk(json, '');
  return { title, thumbnail: images[0] || '', videos };
}

/** 根据字段名猜测清晰度标签 */
function labelFor(key, idx) {
  const k = (key || '').toLowerCase();
  if (/audio|music|mp3|m4a|aac/i.test(k)) return '背景音乐 MP3';
  if (/no_?watermark|nowm|wm_?remove|remove_?wm|origin|clean|nwm/i.test(k)) return '无水印 MP4';
  if (/watermark|raw/i.test(k)) return '带水印 MP4';
  if (/video/i.test(k)) return '无水印 MP4';
  return `视频 ${idx + 1}`;
}

/** 取对象里的字符串/字符串数组，统一成数组 */
function pickUrls(v) {
  if (Array.isArray(v)) return v.filter((x) => typeof x === 'string' && /^https?:\/\//.test(x));
  if (typeof v === 'string' && /^https?:\/\//.test(v)) return [v];
  return [];
}

/**
 * 「帝帝聚合」返回结构明确，直接精确映射，避免通用提取器把 BGM 误标成视频。
 * data.video[0]     = 无水印视频
 * data.video_raw[0] = 带水印视频
 * data.audio[0]     = 背景音乐 mp3
 * data.cover        = 封面；data.text = 文案；data.author.nickname = 作者
 */
function normalizeDiadi(d) {
  const formats = [];
  pickUrls(d.video).forEach((u) => formats.push({ label: '无水印 MP4', url: u, size: '' }));
  pickUrls(d.video_raw).forEach((u) => formats.push({ label: '带水印 MP4', url: u, size: '' }));
  pickUrls(d.audio).forEach((u) => formats.push({ label: '背景音乐 MP3', url: u, size: '' }));
  return {
    title: (d.text || '').trim() || '短视频解析',
    thumbnail: typeof d.cover === 'string' ? d.cover : '',
    author: (d.author && d.author.nickname) || '',
    duration: (d.other && d.other.duration) || 0,
    formats,
  };
}

/** 判断是否为「帝帝聚合」格式 */
function isDiadiShape(json) {
  const d = json && json.data;
  return !!d && typeof d === 'object' && (Array.isArray(d.video) || Array.isArray(d.video_raw) || !!d.text);
}

/** 带超时的 fetch（超时只作用于「等待响应」阶段，不影响后续流式转发） */
async function fetchWithTimeout(url, ms = 12000, headers = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': BROWSER_UA,
        Accept: '*/*',
        ...headers,
      },
    });
  } finally {
    clearTimeout(t);
  }
}

/** 依次尝试短视频上游，返回首个成功结果 */
async function parseShortVideo(url, upstreams) {
  let lastError = '';
  for (const base of upstreams) {
    try {
      const r = await fetchWithTimeout(base + encodeURIComponent(url));
      if (!r.ok) {
        lastError = `上游返回 ${r.status}`;
        continue;
      }
      const ct = r.headers.get('content-type') || '';
      let json;
      if (ct.includes('application/json')) {
        json = await r.json();
      } else {
        const txt = await r.text();
        try {
          json = JSON.parse(txt);
        } catch {
          lastError = '上游返回非 JSON';
          continue;
        }
      }
      // 常见包裹结构：{ code:0, data:{...} }；部分上游用 code/data 表示成败
      if (json && json.code !== undefined && json.code !== 0 && json.code !== '0' && json.code !== 200) {
        lastError = json.msg || json.message || '上游解析失败';
        continue;
      }
      // 帝帝聚合：结构明确，精确映射
      if (isDiadiShape(json)) {
        const norm = normalizeDiadi(json.data);
        if (norm.formats.length) return norm;
        lastError = '上游未返回视频地址';
        continue;
      }

      // 其他上游：通用递归提取
      const data = json && json.data && typeof json.data === 'object' ? json.data : json;
      const { title, thumbnail, videos } = extractMedia(data && typeof data === 'object' ? data : json);
      if (videos.length) {
        const formats = videos.map((v, i) => ({ label: labelFor(v.key, i), url: v.url, size: '' }));
        return { title: title || '短视频解析', thumbnail, formats };
      }
      lastError = '上游未返回视频地址';
    } catch (e) {
      lastError = e.message || '请求异常';
      continue;
    }
  }
  return { error: lastError };
}

/* ------------------------------------------------------------------ */
/* 下载代理相关                                                         */
/* ------------------------------------------------------------------ */

/** 是否为内网/保留地址（防止把本接口当代理打进内网） */
function isPrivateIp(ip) {
  if (!ip) return true;
  if (ip.includes(':')) {
    const v = ip.toLowerCase();
    if (v === '::1' || v === '::') return true;
    if (v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80') || v.startsWith('::ffff:127')) return true;
    return false;
  }
  const p = ip.split('.').map(Number);
  if (p.length !== 4 || p.some(Number.isNaN)) return true;
  const [a, b] = p;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

/** 由 Content-Type 推断文件扩展名 */
function extFromContentType(ct) {
  const c = (ct || '').toLowerCase();
  if (c.startsWith('audio')) {
    if (c.includes('mpeg') || c.includes('mp3')) return 'mp3';
    if (c.includes('mp4') || c.includes('aac')) return 'm4a';
    return 'mp3';
  }
  if (c.includes('mp4')) return 'mp4';
  if (c.includes('webm')) return 'webm';
  if (c.includes('quicktime')) return 'mov';
  if (c.includes('x-flv') || c.includes('flv')) return 'flv';
  if (c.includes('m3u8') || c.includes('mpegurl')) return 'm3u8';
  return 'mp4';
}

/** 生成安全的文件名（去非法字符、限长、补扩展名） */
function safeFileName(name, ext) {
  let s = String(name || '')
    .replace(/[\\/:*?"<>|\r\n\t]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  // 去掉抖音话题/艾特里的 # 与 @ 造成的噪音，保留可读性
  s = s.replace(/[#@]/g, '');
  if (!s) s = 'douyin-video';
  if (s.length > 60) s = s.slice(0, 60);
  // 先剥离已存在的媒体扩展名，避免叠加成 xxx.mp4.mp3
  s = s.replace(/\.(mp4|mov|webm|flv|m3u8|mp3|m4a|aac)$/i, '');
  const e = ext || 'mp4';
  return s + '.' + e;
}

module.exports = function (db) {
  const router = express.Router();
  // 解析配额守卫：已登录按用户等级配额，游客按 IP 配额；/video/download 不消耗配额
  const quotaGuard = createQuotaMiddleware(db);

  router.post('/video/parse', userOptional, quotaGuard, async (req, res) => {
    const { url } = req.body || {};
    if (!url || !/^https?:\/\//i.test(url)) {
      return res.status(400).json({ success: false, error: '请输入有效的视频链接' });
    }

    const platform = detectPlatform(url);

    try {
      // 长视频 VIP：用后台配置的解析接口，返回 iframe 播放地址
      if (platform === 'vip') {
        const rows = await db
          .prepare(
            "SELECT id, name, url FROM parse_interfaces WHERE type = 'video' AND is_active = 1 ORDER BY sort_order ASC"
          )
          .all();
        if (rows.length) {
          const first = rows[0];
          const interfaces = rows.map((x) => ({ name: x.name, url: x.url + encodeURIComponent(url) }));
          return res.json({
            success: true,
            data: {
              platform: 'vip',
              title: 'VIP 视频解析',
              playerUrl: first.url + encodeURIComponent(url),
              interfaces,
            },
          });
        }
        return res.json({ success: false, error: '后台未配置解析接口，请到管理后台添加' });
      }

      // 短视频去水印：优先用后台 type='short' 接口，否则用内置兜底
      const rows = await db
        .prepare("SELECT url FROM parse_interfaces WHERE type = 'short' AND is_active = 1 ORDER BY sort_order ASC")
        .all();
      const upstreams = rows.length ? rows.map((x) => x.url) : DEFAULT_SHORT_UPSTREAMS;

      const result = await parseShortVideo(url, upstreams);
      if (result && result.formats) {
        return res.json({ success: true, data: { platform, ...result } });
      }
      return res.json({
        success: false,
        error: '所有去水印接口暂未返回结果（' + (result.error || '未知原因') + '），可能该视频已失效或不支持，请稍后重试或更换链接。',
      });
    } catch (e) {
      console.error('[parse]', e.message);
      return res.status(500).json({ success: false, error: '解析服务异常，请稍后重试' });
    }
  });

  /**
   * GET /api/video/download?url=<encoded>&name=<title>
   * 后端代理下载：补齐 Referer/UA，强制 attachment 落盘。
   */
  router.get('/video/download', async (req, res) => {
    const { url, name } = req.query || {};
    if (!url || !/^https?:\/\//i.test(url)) {
      return res.status(400).send('缺少或非法 url 参数');
    }

    let u;
    try {
      u = new URL(url);
    } catch {
      return res.status(400).send('非法 url');
    }

    // SSRF 防护：禁止解析到内网/保留地址
    try {
      const { address } = await dns.lookup(u.hostname, { all: false });
      if (isPrivateIp(address)) {
        return res.status(403).send('禁止访问内部地址');
      }
    } catch {
      return res.status(400).send('无法解析主机');
    }

    try {
      const r = await fetchWithTimeout(url, 30000, {
        'User-Agent': MOBILE_UA,
        Referer: 'https://www.douyin.com/',
        'Accept-Language': 'zh-CN,zh;q=0.9',
      });

      if (!r.ok || !r.body) {
        return res.status(502).send('源站返回 ' + r.status + '，下载地址可能已过期，请重新解析');
      }

      const ct = (r.headers.get('content-type') || 'video/mp4').split(';')[0].trim();
      const len = r.headers.get('content-length');
      const fname = safeFileName(name, extFromContentType(ct));

      res.setHeader('Content-Type', ct || 'video/mp4');
      if (len) res.setHeader('Content-Length', len);
      res.setHeader(
        'Content-Disposition',
        "attachment; filename=\"" + fname.replace(/[^\x20-\x7E]/g, '_') + "\"; filename*=UTF-8''" + encodeURIComponent(fname)
      );
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('X-Content-Type-Options', 'nosniff');

      Readable.fromWeb(r.body).pipe(res);
    } catch (e) {
      console.error('[download]', e.message);
      if (!res.headersSent) {
        return res.status(502).send('下载失败：' + (e.message || '未知错误'));
      }
      try {
        res.end();
      } catch {}
    }
  });

  return router;
};
