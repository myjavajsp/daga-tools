const express = require('express');
const axios = require('axios');
const { MemoryCache } = require('../cache');
const { optional: userOptional } = require('../middleware/user-auth');
const { createMiddleware: createQuotaMiddleware } = require('../middleware/quota');

module.exports = function (db) {
  const router = express.Router();
  const cache = new MemoryCache(600);
  const { isAllowedUrl, getClientIp, UA } = require('../utils');
  // 解析配额守卫：已登录按用户等级配额，游客按 IP 配额
  const quotaGuard = createQuotaMiddleware(db);

  function logParse(inputUrl, platform, success, ip) {
    if (!db) return;
    try {
      db.prepare('INSERT INTO parse_records (url, platform, success, ip) VALUES (?, ?, ?, ?)').run(inputUrl, platform || '', success ? 1 : 0, ip || '').catch(() => {});
    } catch { /* scrape error, continue */ }
  }

  /** 从混杂文本中提取第一个 http(s) 链接 */
  function extractUrl(text) {
    const m = text.match(/https?:\/\/[^\s<>"]+/);
    return m ? m[0] : text;
  }

  /** 手动跟随跳转获取最终 URL */
  async function resolveRedirects(url) {
    let current = url;
    const visited = new Set();
    for (let i = 0; i < 10; i++) {
      if (visited.has(current)) break;
      visited.add(current);
      try {
        const resp = await axios.head(current, {
          maxRedirects: 0,
          validateStatus: s => true,
          headers: { 'User-Agent': UA },
          timeout: 8000,
        });
        const loc = resp.headers['location'];
        if (!loc) return current;
        current = loc.startsWith('http') ? loc : new URL(loc, current).href;
      } catch {
        return current;
      }
    }
    return current;
  }

  router.get('/parse', userOptional, quotaGuard, async (req, res) => {
    const raw = req.query.url;
    if (!raw) {
      return res.json({ success: false, error: '请提供视频链接' });
    }
    if (raw.length > 2048) {
      return res.json({ success: false, error: '链接过长' });
    }

    const inputUrl = extractUrl(raw);
    if (!inputUrl || !isAllowedUrl(inputUrl)) {
      return res.json({ success: false, error: '链接不合法' });
    }

    const cached = cache.get(inputUrl);
    if (cached) return res.json(cached);

    const ip = getClientIp(req);
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (body && body.success) cache.set(inputUrl, body, 600000);
      return originalJson(body);
    };

    try {
      const finalUrl = await resolveRedirects(inputUrl);

      if (finalUrl.includes('douyin.com') || finalUrl.includes('iesdouyin.com') || inputUrl.includes('douyin.com') || inputUrl.includes('iesdouyin.com')) {
        return await parseDouyin(finalUrl, inputUrl, UA, res, db, logParse, ip);
      }
      if (finalUrl.includes('kuaishou.com') || finalUrl.includes('kwai.com') || inputUrl.includes('kuaishou.com') || inputUrl.includes('kwai.com')) {
        return await parseKuaishou(finalUrl, UA, res, db, logParse, ip);
      }
      if (finalUrl.includes('bilibili.com') || finalUrl.includes('b23.tv') || inputUrl.includes('bilibili.com') || inputUrl.includes('b23.tv')) {
        return await parseBilibili(finalUrl, UA, res, db, logParse, ip);
      }
      if (finalUrl.includes('xiaohongshu.com') || finalUrl.includes('xhslink.com') || inputUrl.includes('xiaohongshu.com') || inputUrl.includes('xhslink.com')) {
        return await parseXiaohongshu(finalUrl, UA, res, db, logParse, ip);
      }

      res.json({ success: false, error: '暂不支持该平台' });
    } catch (err) {
      res.json({ success: false, error: '解析失败：' + err.message });
    }
  });

  /** 代理视频流（通用，由 disposition 参数控制内联/下载） */
  function proxyVideo(req, res, disposition) {
    const { videoUrl } = req.query;
    if (!videoUrl) {
      return res.json({ success: false, error: '缺少视频地址' });
    }

    const decodedUrl = decodeURIComponent(videoUrl);
    if (!isAllowedUrl(decodedUrl)) return res.json({ success: false, error: 'URL not allowed' });
    const controller = new AbortController();
    req.on('close', () => controller.abort());

    const streamTimeout = setTimeout(() => controller.abort(), 60000);
    axios({
      method: 'get',
      url: decodedUrl,
      responseType: 'stream',
      timeout: 30000,
      signal: controller.signal,
      headers: {
        'User-Agent': UA,
        'Referer': 'https://www.douyin.com/',
      },
    }).then((response) => {
      const contentType = response.headers['content-type'] || 'video/mp4';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Accept-Ranges', 'bytes');
      if (disposition === 'attachment') {
        res.setHeader('Content-Disposition', `attachment; filename="video_${Date.now()}.mp4"`);
      } else {
        res.setHeader('Content-Disposition', 'inline');
      }
      if (response.headers['content-length']) {
        res.setHeader('Content-Length', response.headers['content-length']);
      }
      response.data.on('end', () => clearTimeout(streamTimeout));
      response.data.on('error', () => clearTimeout(streamTimeout));
      response.data.pipe(res);
    }).catch((err) => {
      clearTimeout(streamTimeout);
      if (err.name === 'AbortError' || err.name === 'CanceledError') return;
      try { res.json({ success: false, error: '代理失败：' + err.message }); } catch (e) { console.error('[proxyVideo] fatal:', e.message); }
    });
  }

  // 内联播放（用于 <video> 标签）
  router.get('/proxy', (req, res) => proxyVideo(req, res, 'inline'));

  // 下载（弹出保存对话框）
  router.get('/download', (req, res) => proxyVideo(req, res, 'attachment'));

  /** 首页 iframe 解析日志（第三方接口解析） */
  router.post('/log-iframe', async (req, res) => {
    try {
      const { url, interfaceName } = req.body || {};
      if (!url) return res.type('text/plain').send('ok');
      const rawIp = getClientIp(req);
      logParse(url, interfaceName || 'iframe', true, rawIp);
      res.type('text/plain').send('ok');
    } catch (err) {
      console.error('[log-iframe]', err.message);
      res.type('text/plain').send('ok');
    }
  });

  return router;
};

function extractJsonVar(html, varName) {
  const startMarker = `window.${varName}=`;
  const idx = html.indexOf(startMarker);
  if (idx === -1) return null;
  let i = idx + startMarker.length;
  // skip whitespace
  while (i < html.length && html[i] === ' ') i++;
  if (html[i] !== '{') return null;
  const start = i;
  let depth = 1;
  let inStr = false;
  let esc = false;
  i++;
  while (i < html.length && depth > 0) {
    const c = html[i];
    if (esc) { esc = false; i++; continue; }
    if (c === '\\' && inStr) { esc = true; i++; continue; }
    if (c === '"') { inStr = !inStr; i++; continue; }
    if (!inStr) {
      if (c === '{') depth++;
      else if (c === '}') depth--;
    }
    i++;
  }
  if (depth !== 0) return null;
  try {
    return JSON.parse(html.slice(start, i));
  } catch { return null; }
}

async function parseDouyin(url, inputUrl, UA, res, db, logParse, ip) {
  let realUrl = url;
  try {
    const headResp = await axios.head(url.startsWith('http') ? url : 'https://' + url, {
      maxRedirects: 0,
      validateStatus: () => true,
      headers: { 'User-Agent': UA },
      timeout: 8000,
    });
    const location = headResp.headers['location'];
    if (location) realUrl = location.startsWith('http') ? location : new URL(location, url).href;
  } catch { /* scrape error, continue */ }

  let awemeId = null;
  const idMatch = realUrl.match(/video\/(\d+)/);
  if (idMatch) awemeId = idMatch[1];
  if (!awemeId) {
    const shortMatch = inputUrl.match(/v\.douyin\.com\/([^\/\?]+)/);
    if (shortMatch) {
      try {
        const manualResp = await axios.get('https://' + shortMatch[0].replace(/\/$/, ''), {
          maxRedirects: 5,
          headers: { 'User-Agent': UA },
          timeout: 10000,
        });
        const finalUrl = manualResp.request?.res?.responseUrl || manualResp.request?._redirectable?._currentUrl || '';
        const m = finalUrl.match(/video\/(\d+)/);
        if (m) awemeId = m[1];
      } catch { /* scrape error, continue */ }
    }
  }

  if (!awemeId) {
    logParse(inputUrl, 'douyin', false, ip);
    return res.json({ success: false, error: '无法识别视频ID' });
  }

  // 方案1: 官方 web API (可能需要 Cookie, 尝试从页面预获取)
  try {
    const apiRes = await axios.get(
      `https://www.douyin.com/aweme/v1/web/aweme/detail/?aweme_id=${awemeId}&version_code=170400&app_name=aweme_lite`,
      {
        headers: {
          'User-Agent': UA,
          'Referer': 'https://www.douyin.com/',
          'Accept': 'application/json',
        },
        timeout: 8000,
      }
    );
    const detail = apiRes.data?.aweme_detail;
    if (detail?.video?.play_addr?.url_list?.[0]) {
      const rawUrl = detail.video.play_addr.url_list[0];
      const videoUrl = rawUrl.replace(/^http:/, 'https:').replace(/\/play\/[^\/]+\//, '/play/');
      logParse(inputUrl, 'douyin', true, ip);
      return res.json({
        success: true,
        data: { platform: 'douyin', url: videoUrl, title: detail.desc || '' },
      });
    }
  } catch {
    logParse(inputUrl, 'douyin', false, ip);
  }

  // 方案2: 通过 /video/ 页面 SSR 数据提取
  try {
    const pageRes = await axios.get(`https://www.douyin.com/video/${awemeId}`, {
      headers: {
        'User-Agent': UA,
        'Referer': 'https://www.douyin.com/',
        'Cookie': '__ac_nonce=0',
      },
      timeout: 10000,
    });
    const html = pageRes.data;

    // 2a: __UNIVERSAL_DATA_FOR_VIEW__ (带括号深度计数)
    const universalData = extractJsonVar(html, '__UNIVERSAL_DATA_FOR_VIEW__');
    if (universalData) {
      const detail = findKey(universalData, 'aweme_detail');
      if (detail?.video?.play_addr?.url_list?.[0]) {
        const videoUrl = detail.video.play_addr.url_list[0].replace(/^https?:/, 'https:');
        logParse(inputUrl, 'douyin', true, ip);
        return res.json({
          success: true,
          data: { platform: 'douyin', url: videoUrl, title: detail.desc || '' },
        });
      }
    }

    // 2b: RENDER_DATA
    const rMatch = html.match(/<script id="RENDER_DATA"[^>]*>([\s\S]*?)<\/script>/);
    if (rMatch) {
      const decoded = decodeURIComponent(rMatch[1]);
      const data = JSON.parse(decoded);
      const detail = findKey(data, 'aweme_detail') || findKey(data, 'videoInfoRes');
      if (detail?.video?.play_addr?.url_list?.[0]) {
        const videoUrl = detail.video.play_addr.url_list[0].replace(/^https?:/, 'https:');
        logParse(inputUrl, 'douyin', true, ip);
        return res.json({
          success: true,
          data: { platform: 'douyin', url: videoUrl, title: detail.desc || '' },
        });
      }
    }
  } catch { /* scrape error, continue */ }

  // 方案3: 通过 iesdouyin.com (国际版) 获取
  try {
    const iesRes = await axios.get(`https://www.iesdouyin.com/aweme/v1/web/aweme/detail/?aweme_id=${awemeId}`, {
      headers: { 'User-Agent': UA, 'Referer': 'https://www.iesdouyin.com/' },
      timeout: 8000,
    });
    const detail = iesRes.data?.aweme_detail;
    if (detail?.video?.play_addr?.url_list?.[0]) {
      const videoUrl = detail.video.play_addr.url_list[0].replace(/^https?:/, 'https:');
      logParse(inputUrl, 'douyin', true, ip);
      return res.json({
        success: true,
        data: { platform: 'douyin', url: videoUrl, title: detail.desc || '' },
      });
    }
  } catch { /* scrape error, continue */ }

  // 方案4: 第三方解析 API 兜底
  try {
    const thirdRes = await axios.get(`https://api.qianqi.net/douyin/?url=${encodeURIComponent(`https://www.douyin.com/video/${awemeId}`)}`, {
      headers: { 'User-Agent': UA, 'Accept': 'text/html' },
      timeout: 10000,
    });
    const html = thirdRes.data;
    const sourceMatch = html.match(/"source":\s*"([^"]+)"/);
    if (sourceMatch) {
      logParse(inputUrl, 'douyin', true, ip);
      return res.json({
        success: true,
        data: { platform: 'douyin', url: sourceMatch[1].replace(/\\/g, ''), title: '' },
      });
    }
  } catch { /* scrape error, continue */ }

  logParse(inputUrl, 'douyin', false, ip);
  res.json({ success: false, error: '无法提取视频地址' });
}

async function parseKuaishou(url, UA, res, db, logParse, ip) {
  let realUrl = url;
  try {
    const headResp = await axios.get(url, {
      maxRedirects: 5,
      headers: { 'User-Agent': UA },
      timeout: 10000,
    });
    realUrl = headResp.request?.res?.responseUrl || headResp.request?._redirectable?._currentUrl || url;
  } catch { /* scrape error, continue */ }

  let photoId = null;
  const idMatch = realUrl.match(/short-video\/([^\/\?]+)/);
  if (idMatch) photoId = idMatch[1];
  if (!photoId) {
    const sMatch = realUrl.match(/kuaishou\.com\/s\/([^\/\?]+)/);
    if (sMatch) photoId = sMatch[1];
  }
  if (!photoId) {
    const kwaiMatch = realUrl.match(/kwai\.com\/[^\/]+\/([^\/\?]+)/);
    if (kwaiMatch) photoId = kwaiMatch[1];
  }

  if (!photoId) {
    logParse(url, 'kuaishou', false, ip);
    return res.json({ success: false, error: '无法识别快手视频ID' });
  }

  // 方案1: 通过 /short-video/ 页面提取 SSR 数据
  try {
    const pageRes = await axios.get(`https://www.kuaishou.com/short-video/${photoId}`, {
      headers: { 'User-Agent': UA, 'Referer': 'https://www.kuaishou.com/' },
      timeout: 10000,
    });
    const html = pageRes.data;

    // 寻找 window.__INITIAL_STATE__ 或 window.__STORE__
    let stateData = extractJsonVar(html, '__INITIAL_STATE__');
    if (!stateData) stateData = extractJsonVar(html, '__STORE__');

    if (stateData) {
      const photo = stateData.photo || stateData.mainPhoto || findKey(stateData, 'photo');
      if (photo?.mainMp4Url || photo?.mainUrl || photo?.url) {
        const videoUrl = photo.mainMp4Url || photo.mainUrl || photo.url;
        logParse(url, 'kuaishou', true, ip);
        return res.json({
          success: true,
          data: { platform: 'kuaishou', url: videoUrl, title: photo.caption || photo.title || '' },
        });
      }
    }

    // 方案1b: 从 __NEXT_DATA__ 或 script#__NEXT_DATA__ 提取
    const nextMatch = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (nextMatch) {
      const nextData = JSON.parse(nextMatch[1]);
      const props = nextData?.props?.pageProps;
      const photoData = props?.photo || props?.videoInfo || findKey(props, 'photo');
      if (photoData?.mainMp4Url || photoData?.mainUrl || photoData?.url) {
        const videoUrl = photoData.mainMp4Url || photoData.mainUrl || photoData.url;
        logParse(url, 'kuaishou', true, ip);
        return res.json({
          success: true,
          data: { platform: 'kuaishou', url: videoUrl, title: photoData.caption || '' },
        });
      }
    }
  } catch { /* scrape error, continue */ }

  // 方案2: 尝试 kwai 开放接口
  try {
    const apiRes = await axios.get(`https://www.kuaishou.com/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': UA,
        'Referer': 'https://www.kuaishou.com/',
      },
      data: JSON.stringify({
        operationName: "visionPhotoDetail",
        variables: { photoId },
        query: "query visionPhotoDetail($photoId: String) { visionPhotoDetail(photoId: $photoId) { photo { mainMp4Url caption } } }"
      }),
      timeout: 10000,
    });
    const videoUrl = apiRes.data?.data?.visionPhotoDetail?.photo?.mainMp4Url;
    if (videoUrl) {
      logParse(url, 'kuaishou', true, ip);
      return res.json({
        success: true,
        data: { platform: 'kuaishou', url: videoUrl, title: apiRes.data?.data?.visionPhotoDetail?.photo?.caption || '' },
      });
    }
  } catch { /* scrape error, continue */ }

  logParse(url, 'kuaishou', false, ip);
  res.json({ success: false, error: '无法提取快手视频地址' });
}

async function parseBilibili(url, UA, res, db, logParse, ip) {
  let realUrl = url;
  try {
    const headResp = await axios.head(url, {
      maxRedirects: 5,
      headers: { 'User-Agent': UA, 'Referer': 'https://www.bilibili.com/' },
      timeout: 8000,
    });
    realUrl = headResp.request?.res?.responseUrl || headResp.request?._redirectable?._currentUrl || url;
  } catch { /* scrape error, continue */ }

  let bvid = null;
  const bvMatch = realUrl.match(/\/video\/(BV[0-9A-Za-z]+)/i) || url.match(/(BV[0-9A-Za-z]+)/i);
  if (bvMatch) bvid = bvMatch[1];

  if (!bvid) {
    logParse(url, 'bilibili', false, ip);
    return res.json({ success: false, error: '无法识别B站视频ID' });
  }

  try {
    const viewRes = await axios.get(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, {
      headers: { 'User-Agent': UA, 'Referer': 'https://www.bilibili.com/' },
      timeout: 8000,
    });
    const viewData = viewRes.data?.data;
    const cid = viewData?.cid || viewData?.pages?.[0]?.cid;
    const title = viewData?.title || '';

    if (!cid) {
      logParse(url, 'bilibili', false, ip);
      return res.json({ success: false, error: '无法获取B站视频CID' });
    }

    const playRes = await axios.get(
      `https://api.bilibili.com/x/player/playurl?bvid=${bvid}&cid=${cid}&qn=32&fnval=0&otype=json&platform=html5`,
      {
        headers: { 'User-Agent': UA, 'Referer': `https://www.bilibili.com/video/${bvid}` },
        timeout: 8000,
      }
    );

    const videoUrl = playRes.data?.data?.durl?.[0]?.url;
    if (!videoUrl) {
      logParse(url, 'bilibili', false, ip);
      return res.json({ success: false, error: '当前B站视频暂不支持直接下载' });
    }

    logParse(url, 'bilibili', true, ip);
    return res.json({
      success: true,
      data: {
        platform: 'bilibili',
        url: videoUrl,
        title,
      },
    });
  } catch (err) {
    logParse(url, 'bilibili', false, ip);
    return res.json({ success: false, error: 'B站解析失败：' + err.message });
  }
}

async function parseXiaohongshu(url, UA, res, db, logParse, ip) {
  let realUrl = url;
  try {
    const headResp = await axios.get(url, {
      maxRedirects: 5,
      headers: { 'User-Agent': UA },
      timeout: 10000,
    });
    realUrl = headResp.request?.res?.responseUrl || headResp.request?._redirectable?._currentUrl || url;
  } catch { /* scrape error, continue */ }

  let noteId = null;
  const idMatch = realUrl.match(/explore\/([a-f0-9]+)/);
  if (idMatch) noteId = idMatch[1];
  if (!noteId) {
    const discoveryMatch = realUrl.match(/discovery\/item\/([a-f0-9]+)/);
    if (discoveryMatch) noteId = discoveryMatch[1];
  }
  if (!noteId) {
    const shortMatch = realUrl.match(/xhslink\.com\/([^\/\?]+)/);
    if (shortMatch) {
      try {
        const redirectResp = await axios.get(`https://xhslink.com/${shortMatch[1]}`, {
          maxRedirects: 3,
          headers: { 'User-Agent': UA },
          timeout: 10000,
        });
        const finalUrl = redirectResp.request?.res?.responseUrl || '';
        const m = finalUrl.match(/explore\/([a-f0-9]+)/);
        if (m) noteId = m[1];
      } catch { /* scrape error, continue */ }
    }
  }

  if (!noteId) {
    logParse(url, 'xiaohongshu', false, ip);
    return res.json({ success: false, error: '无法识别小红书笔记ID' });
  }

  // 方案1: 通过页面 SSR 数据获取
  try {
    const pageRes = await axios.get(`https://www.xiaohongshu.com/explore/${noteId}`, {
      headers: {
        'User-Agent': UA,
        'Referer': 'https://www.xiaohongshu.com/',
        'Accept': 'text/html,application/xhtml+xml',
      },
      timeout: 10000,
    });
    const html = pageRes.data;

    // 寻找 window.__INITIAL_STATE__
    let stateData = extractJsonVar(html, '__INITIAL_STATE__');
    if (!stateData) stateData = extractJsonVar(html, '__nuxt__');

    if (stateData) {
      const note = stateData.note || stateData.noteDetail || findKey(stateData, 'noteDetailRes');
      if (note?.note?.video?.media?.stream?.h264?.[0]?.masterUrl) {
        const videoUrl = note.note.video.media.stream.h264[0].masterUrl;
        logParse(url, 'xiaohongshu', true, ip);
        return res.json({
          success: true,
          data: { platform: 'xiaohongshu', url: videoUrl, title: note.note.title || '' },
        });
      }
      if (note?.note?.video?.media?.stream?.h264?.[0]?.backupUrls?.[0]) {
        const videoUrl = note.note.video.media.stream.h264[0].backupUrls[0];
        logParse(url, 'xiaohongshu', true, ip);
        return res.json({
          success: true,
          data: { platform: 'xiaohongshu', url: videoUrl, title: note.note.title || '' },
        });
      }
    }

    // 方案1b: 从 RENDER_DATA 或 SSR 提取
    const rMatch = html.match(/<script[^>]*>window\.__nuxt__=([\s\S]*?)<\/script>/);
    if (rMatch) {
      const data = JSON.parse(rMatch[1]);
      const noteData = findKey(data, 'noteDetailRes') || findKey(data, 'note');
      if (noteData?.note?.video) {
        const videoObj = noteData.note.video;
        const url = videoObj?.media?.stream?.h264?.[0]?.masterUrl || videoObj?.media?.stream?.h264?.[0]?.backupUrls?.[0];
        if (url) {
          logParse(url, 'xiaohongshu', true, ip);
          return res.json({
            success: true,
            data: { platform: 'xiaohongshu', url, title: noteData.note.title || '' },
          });
        }
      }
    }
  } catch { /* scrape error, continue */ }

  // 方案2: 尝试第三方解析接口
  try {
    const thirdRes = await axios.get(`https://api.qianqi.net/xiaohongshu/?url=${encodeURIComponent(`https://www.xiaohongshu.com/explore/${noteId}`)}`, {
      headers: { 'User-Agent': UA, 'Accept': 'text/html' },
      timeout: 10000,
    });
    const html = thirdRes.data;
    const sourceMatch = html.match(/"source":\s*"([^"]+)"/);
    if (sourceMatch) {
      logParse(url, 'xiaohongshu', true, ip);
      return res.json({
        success: true,
        data: { platform: 'xiaohongshu', url: sourceMatch[1].replace(/\\/g, ''), title: '' },
      });
    }
  } catch { /* scrape error, continue */ }

  logParse(url, 'xiaohongshu', false, ip);
  res.json({ success: false, error: '无法提取小红书视频地址' });
}

/** 递归寻找对象中 key 为某值的 value */
function findKey(obj, targetKey) {
  if (!obj || typeof obj !== 'object') return null;
  for (const key of Object.keys(obj)) {
    if (key === targetKey) return obj[key];
    const found = findKey(obj[key], targetKey);
    if (found) return found;
  }
  return null;
}
