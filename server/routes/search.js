/**
 * daga-clone — server/routes/search.js
 * 影片搜索（爱奇艺官方搜索接口上游）
 *
 * 设计要点：
 *   1. 上游：https://search.video.iqiyi.com/o?if=html5&key=<kw>&pageNum=<n>
 *      （需浏览器 UA + Referer，8s 超时；docinfos[].albumDocInfo 为专辑条目）
 *   2. 缓存：MemoryCache 10 分钟，key 含 q + page
 *   3. SSRF：只允许请求 .env SEARCH_API_BASE（逗号分隔多主机）中配置的主机，
 *      上游 URL 由白名单 base 拼出，其余一概不发请求
 *   4. 降级：上游超时/失败/配置缺失 → 200 + { degraded:true, list:[] }，绝不抛 500
 */

const express = require('express');
const { MemoryCache } = require('../cache');

const UPSTREAM_TIMEOUT_MS = 8000;
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const DEFAULT_SEARCH_API_BASE = 'https://search.video.iqiyi.com';

/** 从 SEARCH_API_BASE 解析允许的上游 base URL 列表（非法条目跳过） */
function allowedBases() {
  return String(process.env.SEARCH_API_BASE || DEFAULT_SEARCH_API_BASE)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      try {
        return new URL(s);
      } catch {
        return null;
      }
    })
    .filter((u) => u && /^https?:$/.test(u.protocol));
}

/** 归一化年份：releaseDate 形如 '20120504' / '2019-08-20'，取四位年份 */
function normalizeYear(raw) {
  const m = String(raw || '').match(/(19|20)\d{2}/);
  return m ? m[0] : '';
}

/**
 * docinfos 条目 → 前端卡片结构。
 * 只取专辑/视频类（albumDocInfo）；混合类型中的其它条目返回 null 被过滤。
 */
function normalizeItem(item) {
  const album = item && item.albumDocInfo;
  if (!album) return null;

  const cover =
    album.albumVImage || album.albumImg || album.albumHImage ||
    (album.video_lib_meta && album.video_lib_meta.poster) || '';

  // 专辑页链接：优先 albumLink（形如 http://www.iqiyi.com/v_xxx.html），统一升 https；
  // 其次 video_lib_meta.link（仅当其确实是 v_ 播放页时）；最后退回 albumId 拼接。
  // 「即将上线」等未发布条目三者皆无 → page_url 为空，前端不渲染跳转。
  let pageUrl = String(album.albumLink || '').replace(/^http:\/\//i, 'https://');
  const metaLink = album.video_lib_meta && album.video_lib_meta.link;
  if (!pageUrl && metaLink && /iqiyi\.com\/v_[a-z0-9]+\.html/i.test(metaLink)) {
    pageUrl = String(metaLink).replace(/^http:\/\//i, 'https://');
  }
  if (!pageUrl && album.albumId) pageUrl = `https://www.iqiyi.com/v_${album.albumId}.html`;

  const desc = (album.video_lib_meta && album.video_lib_meta.description) || album.tvFocus || '';
  const iqiyiScore = Number(album.score);
  const doubanScore = Number(album.douban_score);

  return {
    id: String(album.albumId || item.doc_id || ''),
    name: album.albumTitle || album.albumSubTitle || '',
    year: normalizeYear(
      album.releaseDate ||
      (album.video_lib_meta && album.video_lib_meta.china_publish_date) ||
      album.first_online_time
    ),
    score: iqiyiScore > 0 ? iqiyiScore : doubanScore > 0 ? doubanScore : null,
    cover,
    page_url: pageUrl,
    desc,
  };
}

module.exports = function (db) {
  const router = express.Router();
  const cache = new MemoryCache(600); // 10 分钟

  /** 降级响应（统一出口，不抛 500） */
  const degradedPayload = (page) => ({
    list: [],
    total: 0,
    page,
    degraded: true,
    message: '搜索服务暂时不可用',
  });

  router.get('/', async (req, res) => {
    const q = String(req.query.q || '').trim();
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    if (!q) {
      return res.status(400).json({ success: false, error: '缺少搜索关键词 q' });
    }

    const cacheKey = `search:${q}:${page}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log(`[search] 缓存命中 q="${q}" page=${page}`);
      return res.json({ success: true, data: cached, cached: true });
    }

    // SSRF：从白名单 base 拼上游 URL；白名单为空/非法 → 直接降级
    const bases = allowedBases();
    if (bases.length === 0) {
      console.warn('[search] SEARCH_API_BASE 未配置或非法，降级返回');
      return res.json({ success: true, data: degradedPayload(page) });
    }
    const base = bases[0];
    let upstream;
    try {
      upstream = new URL('/o', base.origin);
      upstream.searchParams.set('if', 'html5');
      upstream.searchParams.set('key', q);
      upstream.searchParams.set('pageNum', String(page));
    } catch {
      return res.json({ success: true, data: degradedPayload(page) });
    }
    // 双重校验：最终 host 必须仍在白名单内
    const hostOk = bases.some((b) => b.hostname.toLowerCase() === upstream.hostname.toLowerCase());
    if (!hostOk) {
      console.warn(`[search] 上游 host ${upstream.hostname} 不在白名单，拒绝请求`);
      return res.json({ success: true, data: degradedPayload(page) });
    }

    const startedAt = Date.now();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
      const resp = await fetch(upstream.toString(), {
        headers: { 'User-Agent': BROWSER_UA, Referer: 'https://www.iqiyi.com/' },
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!resp.ok) throw new Error(`上游 HTTP ${resp.status}`);

      const json = await resp.json();
      const data = json && json.data;
      // 上游成功判定（两种响应形状）：
      //  - 有结果：json.data.code === 0/'0'，docinfos 在 json.data 内
      //  - 明确无结果：json.code === 'A00000'（此时 json.data 为提示字符串，无 docinfos）
      const dataCode = data && typeof data === 'object' ? data.code : undefined;
      const rootCode = json && json.code;
      const codeOk =
        dataCode === 0 || dataCode === '0' || rootCode === 0 || rootCode === '0' || rootCode === 'A00000';
      if (!codeOk) throw new Error(`上游返回异常 code=${dataCode != null ? dataCode : rootCode}`);

      const infos = data && Array.isArray(data.docinfos) ? data.docinfos : [];
      const list = infos.map(normalizeItem).filter(Boolean);
      const pageSize = Number(data.page_size) || 20;
      const total = Number(data.result_num) || list.length;
      const result = {
        list,
        total,
        page,
        page_size: pageSize,
        pages: Math.max(1, Math.ceil(total / pageSize)),
      };

      cache.set(cacheKey, result, 600 * 1000);
      console.log(
        `[search] 上游成功 q="${q}" page=${page} 命中 ${list.length} 条，耗时 ${Date.now() - startedAt}ms`
      );
      return res.json({ success: true, data: result });
    } catch (err) {
      console.error(`[search] 上游失败（优雅降级）q="${q}":`, err.message);
      return res.json({ success: true, data: degradedPayload(page) });
    }
  });

  return router;
};
