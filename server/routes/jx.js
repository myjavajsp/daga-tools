/**
 * daga-clone — server/routes/jx.js
 *
 * 解析站播放器「跨域 iframe」问题的根治方案：同源反向代理。
 *
 * ------------------------------------------------------------------
 * 问题到底出在哪
 * ------------------------------------------------------------------
 * 解析站播放器是第三方页面，直接 <iframe src="https://xxx/?jx=..."> 就是跨域 iframe：
 *
 *   1. Permissions Policy 里 fullscreen 的默认 allowlist 是 `self`。
 *      跨域 iframe 内部点全屏必然失败——即使外层写了 allowfullscreen，
 *      也必须显式 `allow="fullscreen *"` 才能穿透「外壳页 -> 播放器页」的多层嵌套。
 *      （之前组件注释里写「无法从外部修复」是错的，标准本来就是支持的。）
 *
 *   2. 目标站可能下发 X-Frame-Options / CSP frame-ancestors，直接拒绝被嵌套。
 *
 *   3. 目标站常按 Referer 做来源白名单；跨域请求带的是本站 Referer，容易被拒。
 *      更糟的是某些线路（如 z1.m1907.*）会在页面里放「防嵌套跳板脚本」，
 *      一检测到 self !== top 就把 iframe 导航到别处，表现为白屏。
 *
 * ------------------------------------------------------------------
 * 怎么解决
 * ------------------------------------------------------------------
 * 让 iframe 的内容与本站同源：
 *   iframe 的 src 指向本站 /api/video/jx?url=<解析地址>，
 *   后端代抓目标页，并把页面里所有地址改写成继续走本站代理。
 *
 * 这样：
 *   - 顶层 iframe 同源 -> fullscreen 权限自动继承，播放器自带全屏按钮可用（Esc 退出）
 *   - 后端不是浏览器，X-Frame-Options / CSP frame-ancestors 对我们无效
 *   - 转发时 Referer 按目标站自身补齐，来源校验可过
 *   - 嵌套多层的播放器页也被一并改写，不会中途掉回跨域
 */

const express = require('express');
const dns = require('dns').promises;
const { Readable } = require('stream');

/** 代抓时使用的浏览器头 */
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

/** 抓取超时（毫秒） */
const FETCH_TIMEOUT = 25000;

/** 白名单缓存有效期（毫秒） */
const WL_TTL = 5 * 60 * 1000;

/* ------------------------------------------------------------------ */
/* 基础工具                                                            */
/* ------------------------------------------------------------------ */

/** 是否为内网/保留地址（SSRF 防护） */
function isPrivateIp(ip) {
  if (!ip) return true;
  if (ip.includes(':')) {
    const v = ip.toLowerCase();
    if (v === '::1' || v === '::') return true;
    if (v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80')) return true;
    if (v.startsWith('::ffff:')) {
      const mapped = v.slice(7);
      if (!mapped.includes(':')) return isPrivateIp(mapped);
    }
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

/** 解析并校验 url，非法返回 null */
function safeUrl(raw) {
  if (!raw || String(raw).length > 4096) return null;
  try {
    const u = new URL(String(raw));
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u;
  } catch {
    return null;
  }
}

/** 把相对 / 协议相对地址基于 base 解析成绝对地址 */
function absolutize(value, base) {
  const v = (value || '').trim();
  if (!v) return null;
  if (/^(data|blob|javascript|about|mailto|tel):/i.test(v)) return null;
  if (v.startsWith('#')) return null;
  try {
    return new URL(v, base).href;
  } catch {
    return null;
  }
}

/** 包装成本站代理地址 */
const pageProxy = (abs) => '/api/video/jx?url=' + encodeURIComponent(abs);
const assetProxy = (abs) => '/api/video/jxa?url=' + encodeURIComponent(abs);

/** 需要改写成「页面代理」的标签（导航类），其余走资源代理 */
const PAGE_TAGS = ['iframe', 'a', 'frame'];
const ASSET_TAGS = ['script', 'link', 'img', 'video', 'source', 'audio', 'embed', 'track', 'input'];

/** 匹配标签内的 src / href / srcset 等 URL 属性 */
const ATTR_RE =
  /(\s(?:src|href|srcset|action|data-src|data-href|data-url|poster)\s*=\s*)(?:"([^"]*)"|'([^']*)')/gi;

/**
 * 重写 HTML：把页面里所有外链地址改写成走本站代理。
 * 注意：这里**不能**注入 <base href>，否则相对路径会被浏览器直接解析成跨域绝对地址，
 * 反而绕开代理。
 */
function rewriteHtml(html, base) {
  let out = html;

  const rewriteTag = (tag, kind) =>
    tag.replace(ATTR_RE, (m, pre, dq, sq) => {
      const val = dq !== undefined ? dq : sq !== undefined ? sq : '';
      const abs = absolutize(val, base);
      if (!abs) return m;
      const q = dq !== undefined ? '"' : "'";
      return pre + q + (kind === 'page' ? pageProxy(abs) : assetProxy(abs)) + q;
    });

  // 1) 导航类标签 -> 页面代理
  for (const t of PAGE_TAGS) {
    const re = new RegExp('<' + t + '\\b[^>]*>', 'gi');
    out = out.replace(re, (tag) => rewriteTag(tag, 'page'));
  }

  // 2) 资源类标签 -> 资源代理
  for (const t of ASSET_TAGS) {
    const re = new RegExp('<' + t + '\\b[^>]*>', 'gi');
    out = out.replace(re, (tag) => rewriteTag(tag, 'asset'));
  }

  // 3) 内联 <script> / <style> 里的绝对地址（JS 里动态拼接的播放地址大多在这里）
  out = out.replace(/https?:\/\/[^\s"'`<>\\)]+/g, (m) => {
    if (m.includes('/api/video/jx')) return m; // 已处理，跳过
    return assetProxy(m);
  });

  // 4) 兜底：运行时动态插入的 iframe 也要补权限并改写成代理地址
  const guard = `
<script>
(function () {
  var PAGE = '/api/video/jx?url=';
  var ASSET = '/api/video/jxa?url=';
  function toProxy(u, asset) {
    if (!u || u.indexOf('/api/video/jx') === 0) return u;
    if (/^(data|blob|javascript|about):/i.test(u)) return u;
    if (u.charAt(0) === '#') return u;
    try { return (asset ? ASSET : PAGE) + encodeURIComponent(new URL(u, location.href).href); }
    catch (e) { return u; }
  }
  var desc = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'src');
  if (desc && desc.set) {
    Object.defineProperty(HTMLIFrameElement.prototype, 'src', {
      configurable: true,
      enumerable: desc.enumerable,
      get: desc.get,
      set: function (v) {
        try { desc.set.call(this, toProxy(v, false)); } catch (e) { desc.set.call(this, v); }
      }
    });
  }
  var setAttr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (n, v) {
    try {
      if (this.tagName === 'IFRAME' && /^(src)$/i.test(n)) return setAttr.call(this, n, toProxy(v, false));
      if (this.tagName === 'SCRIPT' && /^(src)$/i.test(n)) return setAttr.call(this, n, toProxy(v, true));
    } catch (e) {}
    return setAttr.call(this, n, v);
  };
  new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      var added = muts[i].addedNodes;
      for (var j = 0; j < added.length; j++) {
        var n = added[j];
        if (!n || n.nodeType !== 1) continue;
        if (n.tagName === 'IFRAME') {
          n.setAttribute('allowfullscreen', 'true');
          n.setAttribute('webkitallowfullscreen', 'true');
          n.setAttribute('mozallowfullscreen', 'true');
          if (n.getAttribute('src')) n.setAttribute('src', n.getAttribute('src'));
        }
        if (n.tagName === 'IFRAME' || n.tagName === 'SCRIPT' || n.tagName === 'IMG') {
          var s = n.getAttribute && n.getAttribute('src');
          if (s) n.setAttribute('src', s);
        }
      }
    }
  }).observe(document.documentElement || document, { childList: true, subtree: true });
})();
</script>`;

  // 注入到 </head> 之前，尽量早生效
  if (/<\/head>/i.test(out)) {
    out = out.replace(/<\/head>/i, guard + '</head>');
  } else if (/<body[^>]*>/i.test(out)) {
    out = out.replace(/<body[^>]*>/i, (m) => m + guard);
  } else {
    out = guard + out;
  }

  return out;
}

/** 重写 m3u8：内部的分片 / 密钥 / 子列表地址都要走代理 */
function rewriteM3u8(text, base) {
  return text
    .split('\n')
    .map((line) => {
      const t = line.trim();
      if (!t) return line;
      if (t.startsWith('#')) {
        const m = t.match(/URI="([^"]+)"/);
        if (!m) return line;
        let abs;
        try {
          abs = new URL(m[1], base).href;
        } catch {
          return line;
        }
        return line.replace(m[1], assetProxy(abs));
      }
      let abs;
      try {
        abs = new URL(t, base).href;
      } catch {
        return line;
      }
      return assetProxy(abs);
    })
    .join('\n');
}

/** 带超时的 fetch */
async function fetchUpstream(u, req) {
  const headers = {
    'User-Agent': BROWSER_UA,
    'Accept-Language': 'zh-CN,zh;q=0.9',
    // Referer 伪装成目标站自身，避免被来源白名单拦下
    Referer: u.origin + '/',
  };
  if (req.headers.accept) headers.Accept = req.headers.accept;
  if (req.headers.range) headers.Range = req.headers.range;

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT);
  try {
    return await fetch(u.href, { headers, redirect: 'follow', signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

/**
 * 覆盖全局 helmet 下发的安全头。
 *
 * 这一步是必需的：全局 helmet 里设了 `frameAncestors: ["'none'"]`（等价于
 * X-Frame-Options: DENY），而我们要把这个代理页**放进自己的 iframe 里**——
 * 不覆盖的话浏览器会直接拒绝渲染，表现为播放器白屏。
 *
 * 同时代理页里往往有大段第三方内联脚本与 eval，默认 CSP 会把它们拦掉，
 * 所以这里放宽到 `default-src *` 并允许 inline/eval。
 * 本接口只代理后台登记过的解析域名，且禁内网，风险可控。
 */
const RELAXED_CSP =
  "default-src * 'unsafe-inline' 'unsafe-eval' data: blob: mediastream:; " +
  "frame-ancestors 'self'; form-action *";

function relaxHeaders(res, ct) {
  res.setHeader('Content-Type', ct);
  res.removeHeader('Content-Length'); // 内容被重写，长度会变，交给框架重算
  res.removeHeader('X-Frame-Options'); // 与 frame-ancestors 并存会打架，直接去掉
  res.setHeader('Content-Security-Policy', RELAXED_CSP);
}

/**
 * 统一的回吐逻辑：
 *   - HTML   -> 重写后返回（使其内部资源继续走代理，保持同源）
 *   - m3u8   -> 文本重写其中的分片/密钥地址
 *   - 其他   -> 原样转发（支持 Range，视频分片必须）
 */
async function serveUpstream(r, res, base) {
  const ct = (r.headers.get('content-type') || '').toLowerCase();
  const isM3u8 = /\.m3u8(\?|$)/i.test(base) || ct.includes('mpegurl');

  try {
    if (r.ok && ct.includes('text/html')) {
      const html = await r.text();
      res.status(200);
      relaxHeaders(res, 'text/html; charset=utf-8');
      return res.send(rewriteHtml(html, base));
    }
    if (r.ok && isM3u8) {
      const text = await r.text();
      res.status(200);
      relaxHeaders(res, ct || 'application/vnd.apple.mpegurl');
      return res.send(rewriteM3u8(text, base));
    }
  } catch (e) {
    console.warn('[jx] 重写失败，改为原样转发:', e.message);
  }

  // 非文本 / 重写失败：直接转发
  res.status(r.status);
  res.setHeader('Content-Type', ct || 'application/octet-stream');
  const len = r.headers.get('content-length');
  if (len) res.setHeader('Content-Length', len);
  const cr = r.headers.get('content-range');
  if (cr) res.setHeader('Content-Range', cr);
  res.setHeader('Accept-Ranges', 'bytes');
  res.removeHeader('X-Frame-Options');
  res.removeHeader('Content-Security-Policy');
  if (r.body) Readable.fromWeb(r.body).pipe(res);
  else res.end();
}

/* ------------------------------------------------------------------ */
/* 路由                                                                */
/* ------------------------------------------------------------------ */

module.exports = function (db) {
  const router = express.Router();

  /** 白名单缓存：后台配置的解析线路域名 */
  let wlCache = { at: 0, hosts: new Set() };

  async function allowedHosts() {
    const now = Date.now();
    if (now - wlCache.at < WL_TTL && wlCache.hosts.size) return wlCache.hosts;
    let hosts = new Set();
    try {
      const rows = await db
        .prepare('SELECT url FROM parse_interfaces WHERE is_active = 1')
        .all();
      for (const r of rows) {
        try {
          hosts.add(new URL(r.url).hostname);
        } catch {
          /* 忽略非法配置 */
        }
      }
    } catch (e) {
      console.warn('[jx] 读取线路白名单失败:', e.message);
    }
    if (hosts.size) wlCache = { at: now, hosts };
    return wlCache.hosts;
  }

  /** 统一的来源校验：不允许别的站点把这里当免费代理 */
  function fromOwnSite(req) {
    const ref = req.headers.referer || req.headers.referrer;
    if (!ref) return true; // 顶层直接打开（如新窗口）放行
    try {
      return new URL(ref).host === req.headers.host;
    } catch {
      return false;
    }
  }

  /**
   * GET /api/video/jx?url=<encoded>
   * 顶层页面代理：只允许后台配置的解析线路域名。
   */
  router.get('/video/jx', async (req, res) => {
    const u = safeUrl(req.query.url);
    console.log('[jx] hit ->', u ? u.href.slice(0, 90) : '(非法/缺失 url)');
    if (!u) return res.status(400).send('缺少或非法 url 参数');
    if (!fromOwnSite(req)) {
      console.log('[jx] 来源校验失败, referer=', req.headers.referer);
      return res.status(403).send('禁止外部调用');
    }

    // 白名单：防开放代理
    const hosts = await allowedHosts();
    console.log('[jx] 白名单域名数:', hosts.size, '| 目标:', u.hostname);
    if (hosts.size && !hosts.has(u.hostname)) {
      return res.status(403).send('该解析域名未在后台登记：' + u.hostname);
    }

    // SSRF：禁止解析到内网
    try {
      const { address } = await dns.lookup(u.hostname, { all: false });
      if (isPrivateIp(address)) return res.status(403).send('禁止访问内部地址');
    } catch {
      return res.status(400).send('无法解析主机：' + u.hostname);
    }

    try {
      const r = await fetchUpstream(u, req);
      await serveUpstream(r, res, u.href);
    } catch (e) {
      console.error('[jx]', e.message);
      if (!res.headersSent) return res.status(502).send('解析页代理失败：' + (e.message || '未知错误'));
      try {
        res.end();
      } catch {}
    }
  });

  /**
   * GET /api/video/jxa?url=<encoded>
   * 子资源代理（js / css / 图片 / 视频分片 / m3u8）。
   * 允许任意 http(s) 外链（解析站的 CDN 域名无法预先枚举），
   * 但要求来源为本页，且禁止内网地址。
   */
  router.get('/video/jxa', async (req, res) => {
    const { url, ...rest } = req.query || {};

    // 解析站的「防嵌套跳板脚本」通常用
    //     location.href = BASE + "?r=" + document.referrer + "&jx=" + 视频地址
    // 这种裸拼接。我们改写后的 BASE 本身已带 ?url=...，再接一个 ?/& 时，
    // 浏览器会把 & 之后的部分当成**本接口**的独立 query 参数，
    // 于是 req.query.url 只剩一半，视频地址丢失。
    // 这里把散落的额外参数按原顺序拼回目标 URL。
    let raw = url;
    const extra = new URLSearchParams();
    for (const [k, v] of Object.entries(rest)) {
      if (Array.isArray(v)) v.forEach((x) => extra.append(k, String(x)));
      else extra.append(k, String(v));
    }
    const es = extra.toString();
    if (es) raw = String(raw) + (String(raw).includes('?') ? '&' : '?') + es;

    const u = safeUrl(raw);
    if (!u) return res.status(400).send('缺少或非法 url 参数');
    if (!fromOwnSite(req)) return res.status(403).send('禁止外部调用');

    try {
      const { address } = await dns.lookup(u.hostname, { all: false });
      if (isPrivateIp(address)) return res.status(403).send('禁止访问内部地址');
    } catch {
      return res.status(400).send('无法解析主机：' + u.hostname);
    }

    try {
      const r = await fetchUpstream(u, req);
      await serveUpstream(r, res, u.href);
    } catch (e) {
      console.error('[jxa]', e.message);
      if (!res.headersSent) return res.status(502).send('资源代理失败：' + (e.message || '未知错误'));
      try {
        res.end();
      } catch {}
    }
  });

  return router;
};
