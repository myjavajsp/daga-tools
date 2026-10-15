const express = require('express');
const https = require('https');

function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : require('http');
    const headers = { 'User-Agent': 'Mozilla/5.0', ...options.headers };
    const req = mod.get(url, { headers, timeout: options.timeout || 10000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(null); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

const { isAllowedUrl } = require('../utils');

module.exports = function () {
  const router = express.Router();

  router.get('/url', async (req, res) => {
    const { mid } = req.query;
    if (!mid) return res.json({ success: false, message: '缺少参数 mid' });

    try {
      const guid = String(Math.floor(10000000000 + Math.random() * 90000000000));
      const data = {
        req_0: {
          module: 'vkey.GetVkeyServer',
          method: 'CgiGetVkey',
          param: { guid, songmid: [mid], songtype: [0], uin: '0', loginflag: 1, platform: '20' }
        }
      };
      const result = await fetchJson(
        `https://u.y.qq.com/cgi-bin/musicu.fcg?format=json&data=${encodeURIComponent(JSON.stringify(data))}`,
        { headers: { Referer: 'https://y.qq.com/' } }
      );

      if (!result || result.code !== 0 || !result.req_0 || result.req_0.code !== 0) {
        return res.json({ success: false, message: '获取播放地址失败' });
      }

      const sip = result.req_0.data.sip || [];
      const filename = result.req_0.data.testfile2g || '';
      if (!sip.length || !filename) {
        return res.json({ success: false, message: '获取播放地址失败' });
      }

      const playUrl = sip[0] + filename;
      return res.json({ success: true, data: { url: playUrl, type: 'mp3' } });
    } catch (err) {
      console.error('[Music] URL error:', err.message);
      return res.json({ success: false, message: '获取播放地址失败' });
    }
  });

  router.get('/proxy', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send('Missing url');
    if (!isAllowedUrl(url)) return res.status(403).send('URL not allowed');

    try {
      const resp = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(15000),
        redirect: 'follow',
      });
      if (!resp.ok) return res.status(502).send('Upstream error');
      if (resp.redirected && !isAllowedUrl(resp.url)) return res.status(403).send('Redirect URL not allowed');

      const buffer = Buffer.from(await resp.arrayBuffer());
      res.set('Content-Type', resp.headers.get('content-type') || 'audio/mpeg');
      res.set('Accept-Ranges', 'bytes');
      res.set('Cache-Control', 'public, max-age=86400');
      res.send(buffer);
    } catch (err) {
      console.error('[Music] Proxy error:', err.message);
      res.status(502).send('Proxy failed');
    }
  });

  return router;
};
