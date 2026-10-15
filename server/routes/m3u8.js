const { isAllowedUrl, getClientIp } = require('../utils');
const { Readable } = require('stream');

// Cache parsed manifests to avoid re-fetching
const manifestCache = new Map();
const MANIFEST_CACHE_TTL = 5 * 60 * 1000;

function getCachedManifest(url) {
  const entry = manifestCache.get(url);
  if (entry && Date.now() - entry.ts < MANIFEST_CACHE_TTL) return entry.data;
  return null;
}
function setCachedManifest(url, data) {
  manifestCache.set(url, { data, ts: Date.now() });
  // Evict old entries
  if (manifestCache.size > 20) {
    const oldest = [...manifestCache.entries()].sort((a, b) => a[1].ts - b[1].ts)[0];
    if (oldest) manifestCache.delete(oldest[0]);
  }
}

// Rewrite relative URLs in m3u8 manifest to go through proxy
function rewriteManifest(body, masterUrl) {
  try {
    const masterUrlObj = new globalThis.URL(masterUrl);
    const baseUrl = masterUrlObj.origin + masterUrlObj.pathname.substring(0, masterUrlObj.pathname.lastIndexOf('/') + 1);
    const authQuery = masterUrl.includes('?') ? masterUrl.substring(masterUrl.indexOf('?')) : '';

    function toProxy(u) {
      if (!u || !u.trim()) return u;
      let abs = u.startsWith('http') ? u : baseUrl + u;
      if (!abs.includes('?') && authQuery) abs += authQuery;
      return '/api/m3u8/proxy?url=' + encodeURIComponent(abs);
    }

    return body.split('\n').map(line => {
      const t = line.trim();
      if (t.startsWith('#EXT-X-KEY')) {
        return t.replace(/URI="([^"]*)"/, (m, k) => 'URI="' + toProxy(k) + '"');
      }
      if (t && !t.startsWith('#') && t.length > 0) {
        return toProxy(t);
      }
      return line;
    }).join('\n');
  } catch (e) {
    return body;
  }
}

module.exports = function (db) {
  const express = require('express');
  const router = express.Router();

  function logM3u8Play(m3u8Url, ip) {
    if (!db) return;
    try {
      db.prepare('INSERT INTO m3u8_play_records (url, ip) VALUES (?, ?)').run(m3u8Url, ip || '').catch(() => {});
    } catch { /* db error, ignore */ }
  }

  function addCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
  }

  router.options('/proxy', (req, res) => {
    addCorsHeaders(res);
    res.status(204).send();
  });

  router.get('/proxy', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send('Missing url param');
    if (!isAllowedUrl(url)) return res.status(403).send('URL not allowed');

    addCorsHeaders(res);
    const ip = getClientIp(req);

    const controller = new AbortController();
    let clientDisconnected = false;

    // 客户端断开时取消上游请求，避免资源浪费
    req.on('close', () => {
      clientDisconnected = true;
      controller.abort();
    });

    try {
      const origin = new globalThis.URL(url).origin + '/';
      const timeout = setTimeout(() => controller.abort(), 30000);

      const resp = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': origin,
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!resp.ok) {
        return res.status(502).send('Upstream error');
      }

      const contentType = resp.headers.get('content-type') || '';
      const urlObj = new globalThis.URL(url);
      const isManifest = contentType.includes('mpegurl') || contentType.includes('vnd.apple.mpegurl') || /\.m3u8$/i.test(urlObj.pathname);

      if (isManifest) {
        logM3u8Play(url, ip);
        const chunks = [];
        for await (const chunk of resp.body) chunks.push(chunk);
        const body = Buffer.concat(chunks).toString('utf-8');
        const rewritten = rewriteManifest(body, url);
        res.set('Content-Type', 'application/vnd.apple.mpegurl; charset=utf-8');
        res.set('Cache-Control', 'public, max-age=60');
        return res.send(rewritten);
      }

      // 视频分片：流式转发
      const segContentType = contentType || 'video/mp4';
      res.set('Content-Type', segContentType);
      res.set('Cache-Control', 'public, max-age=86400');
      res.set('Accept-Ranges', 'bytes');
      if (resp.headers.get('content-length')) {
        res.set('Content-Length', resp.headers.get('content-length'));
      }

      const nodeStream = Readable.fromWeb(resp.body);
      let streamFinished = false;

      nodeStream.on('error', (streamErr) => {
        if (clientDisconnected || streamErr.message === 'aborted' || streamErr.name === 'AbortError') {
          // 客户端主动断开，正常情况，不记错误日志
          return;
        }
        console.error('[M3U8] Stream error:', streamErr.message);
        if (!res.headersSent) res.status(502).end();
        else res.destroy();
      });

      res.on('close', () => {
        // 响应关闭时清理上游 stream
        if (!streamFinished) {
          nodeStream.destroy();
        }
      });

      nodeStream.on('end', () => { streamFinished = true; });
      nodeStream.pipe(res);
    } catch (err) {
      if (clientDisconnected || err.name === 'AbortError') {
        // 客户端断开，正常情况
        return;
      }
      console.error('[M3U8] Proxy error:', err.message);
      if (!res.headersSent) res.status(502).send('Proxy error');
    }
  });

  router.get('/parse', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false, message: 'Missing url' });
    if (!isAllowedUrl(url)) return res.status(403).json({ success: false, message: 'URL not allowed' });

    addCorsHeaders(res);
    try {
      const clientIp = getClientIp(req);
      logM3u8Play(url, clientIp);

      // Check cache first
      const cached = getCachedManifest(url);
      if (cached) {
        return res.json({ success: true, data: cached, cached: true });
      }

      const origin = new globalThis.URL(url).origin + '/';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const resp = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': origin,
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!resp.ok) return res.status(502).json({ success: false, message: 'Upstream error' });

      const body = await resp.text();
      const variants = [];
      let currentBandwidth = 0;
      let currentResolution = '';

      body.split('\n').forEach(line => {
        const t = line.trim();
        if (t.startsWith('#EXT-X-STREAM-INF')) {
          const bw = (t.match(/BANDWIDTH=(\d+)/) || [])[1];
          const resMatch = (t.match(/RESOLUTION=(\d+x\d+)/) || [])[1];
          if (bw) currentBandwidth = parseInt(bw);
          if (resMatch) currentResolution = resMatch;
        } else if (t && !t.startsWith('#') && currentBandwidth > 0) {
          const variantUrl = t.startsWith('http') ? t : url.substring(0, url.lastIndexOf('/') + 1) + t;
          variants.push({ bandwidth: currentBandwidth, resolution: currentResolution, url: variantUrl });
          currentBandwidth = 0;
          currentResolution = '';
        }
      });

      const result = { url, variants, isMaster: variants.length > 0 };
      setCachedManifest(url, result);
      res.json({ success: true, data: result, cached: false });
    } catch (err) {
      console.error('[M3U8] Parse error:', err.message);
      res.json({ success: false, message: 'Parse failed: ' + err.message });
    }
  });

  return router;
};
