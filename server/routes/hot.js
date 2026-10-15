const express = require('express');
const axios = require('axios');
const { MemoryCache } = require('../cache');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

function extractBalancedJson(str, startIdx) {
  // From startIdx, find the first '{', then count braces to extract balanced JSON
  const start = str.indexOf('{', startIdx);
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < str.length; i++) {
    if (str[i] === '{') depth++;
    if (str[i] === '}') { depth--; if (depth === 0) return str.slice(start, i + 1); }
  }
  return null;
}

// Platform definitions with fetch functions
const PLATFORMS = {
  douyin: {
    name: '抖音',
    icon: '🔥',
    async fetch() {
      let list = [];
      try {
        const nonceRes = await axios.get('https://www.douyin.com/', {
          headers: { 'User-Agent': UA }, timeout: 5000,
          maxRedirects: 0, validateStatus: s => s < 400,
        });
        const cookies = nonceRes.headers['set-cookie'] || [];
        const nonce = cookies.find(c => c.startsWith('__ac_nonce='));
        const cookie = nonce ? nonce.split(';')[0] : '';
        const res = await axios.get('https://www.douyin.com/aweme/v1/web/hot/search/list/', {
          headers: { 'User-Agent': UA, 'Referer': 'https://www.douyin.com/', 'Accept': 'application/json,*/*', ...(cookie ? { 'Cookie': cookie } : {}) },
          timeout: 8000,
        });
        const block = res.data?.data;
        const items = block?.word_list || block?.trending_list || block?.hot_list || [];
        list = items.map((item, i) => ({
          id: item.position || i + 1, title: item.word || item.title || '',
          hot: item.hot_value || item.hot || 0,
          url: `https://www.douyin.com/search/${encodeURIComponent(item.word || item.title || '')}`,
        }));
      } catch { /* scrape error, return empty */ }
      return list;
    }
  },

  kuaishou: {
    name: '快手',
    icon: '📱',
    async fetch() {
      // Try scraped SSR data from homepage
      try {
        const r = await axios.get('https://www.kuaishou.com/?isHome=1', {
          headers: { 'User-Agent': UA, 'Accept': 'text/html,*/*' }, timeout: 10000,
        });
        const html = r.data;
        // Extract VisionHotRankItem JSON data from SSR
        const matches = html.match(/"VisionHotRankItem:([^"]+)":\{"rank":(\d+),"id":"[^"]*","name":"([^"]+)","[^}]*"hotValue":"([^"]+)"/g);
        if (matches && matches.length) {
          return matches.map(m => {
            const parts = m.match(/"name":"([^"]+)".*?"hotValue":"([^"]+)"/);
            if (!parts) return null;
            let hot = 0;
            const hv = parts[2];
            if (hv.includes('万')) hot = parseFloat(hv) * 10000;
            else if (hv.includes('亿')) hot = parseFloat(hv) * 100000000;
            else hot = parseInt(hv) || 0;
            return { title: parts[1], hot, url: `https://www.kuaishou.com/search/${encodeURIComponent(parts[1])}` };
          }).filter(Boolean).map((item, i) => ({ id: i + 1, ...item }));
        }
        // Fallback: try extracting from JSON-like structure differently
        const nameMatches = html.match(/"name":"([^"]+?)","viewCount":null,"hotValue":"([^"]+?)"/g);
        if (nameMatches && nameMatches.length) {
          const seen = new Set();
          return nameMatches.map(m => {
            const parts = m.match(/"name":"([^"]+)".*?"hotValue":"([^"]+)"/);
            if (!parts || seen.has(parts[1])) return null;
            seen.add(parts[1]);
            let hot = 0;
            const hv = parts[2];
            if (hv.includes('万')) hot = parseFloat(hv) * 10000;
            else if (hv.includes('亿')) hot = parseFloat(hv) * 100000000;
            else hot = parseInt(hv) || 0;
            return { title: parts[1], hot, url: `https://www.kuaishou.com/search/${encodeURIComponent(parts[1])}` };
          }).filter(Boolean).map((item, i) => ({ id: i + 1, ...item }));
        }
      } catch { /* scrape error, return empty */ }
      return [];
    }
  },

  xiaohongshu: {
    name: '小红书',
    icon: '📕',
    async fetch() {
      // Xiaohongshu hotspot data is client-rendered, not available in SSR HTML.
      // We try multiple approaches:
      const approaches = [
        // 1. Try scraping explore page for SSR hotspot data
        async () => {
          const r = await axios.get('https://www.xiaohongshu.com/explore', {
            headers: { 'User-Agent': UA, 'Accept': 'text/html,*/*' }, timeout: 8000,
          });
          const html = r.data;
          // Try extracting from window.__INITIAL_STATE__
          const stateIdx = html.indexOf('window.__INITIAL_STATE__');
          const stateMatch = stateIdx !== -1 ? extractBalancedJson(html, stateIdx) : null;
          if (stateMatch) {
            try {
              const state = JSON.parse(stateMatch);
              const hotspots = state?.hot?.HotSpots || state?.explore?.hotSpots || [];
              if (Array.isArray(hotspots) && hotspots.length) {
                return hotspots.map((h, i) => ({
                  id: i + 1, title: h.title || h.name || h.word || '',
                  hot: h.hotValue || h.hot || h.viewCount || 0,
                  url: h.url || `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(h.title || h.name || '')}`,
                })).filter(h => h.title);
              }
            } catch { /* scrape error, return empty */ }
          }
          return [];
        },
      ];
      for (const approach of approaches) {
        try {
          const result = await approach();
          if (result.length) return result;
        } catch { /* scrape error, return empty */ }
      }
      return [];
    }
  },

  youtube: {
    name: 'YouTube',
    icon: '▶️',
    async fetch() {
      try {
        const r = await axios.get('https://www.youtube.com/feed/trending', {
          headers: { 'User-Agent': UA, 'Accept-Language': 'en,zh-CN;q=0.9' }, timeout: 10000,
        });
        const html = r.data;
        // Try to extract video titles from ytInitialData
        const ytIdx = html.indexOf('ytInitialData');
        const ytMatch = ytIdx !== -1 ? extractBalancedJson(html, ytIdx) : null;
        if (ytMatch) {
          try {
            const data = JSON.parse(ytMatch);
            const videos = [];
            // Search all videoRenderer instances with depth limit
            const search = (obj, depth = 0) => {
              if (!obj || typeof obj !== 'object' || depth > 20) return;
              if (obj.videoRenderer?.title?.runs?.[0]?.text) {
                const t = obj.videoRenderer.title.runs[0].text;
                const id = obj.videoRenderer.videoId;
                if (t && t.length > 3 && id) videos.push({ title: t, url: 'https://www.youtube.com/watch?v=' + id });
              }
              for (const v of Object.values(obj)) search(v, depth + 1);
            };
            search(data);
            if (videos.length) return videos.map((v, i) => ({ id: i + 1, ...v, hot: 0 }));
          } catch { /* scrape error, return empty */ }
        }
      } catch { /* scrape error, return empty */ }
      return [];
    }
  },
};

module.exports = function () {
  const router = express.Router();
  const cache = new MemoryCache(120);

  router.get('/list', async (req, res) => {
    const platform = req.query.platform || 'douyin';
    const pf = PLATFORMS[platform];
    if (!pf) return res.status(400).json({ success: false, error: 'unsupported platform' });

    // Cache 120s via MemoryCache
    const cacheKey = 'hot_' + platform;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, platform: { key: platform, name: pf.name, icon: pf.icon } });
    }

    try {
      const data = await pf.fetch();
      cache.set(cacheKey, data, 120000);
      res.json({ success: true, data, platform: { key: platform, name: pf.name, icon: pf.icon } });
    } catch (e) {
      if (cached && cached.length) {
        res.json({ success: true, data: cached, platform: { key: platform, name: pf.name, icon: pf.icon }, stale: true });
      } else {
        res.json({ success: false, error: e.message });
      }
    }
  });

  router.get('/platforms', async (req, res) => {
    try {
      const list = Object.entries(PLATFORMS).map(([key, pf]) => ({ key, name: pf.name, icon: pf.icon }));
      res.json({ success: true, data: list });
    } catch (err) {
      console.error('[hot/platforms]', err.message);
      res.status(500).json({ success: false, error: '服务器错误' });
    }
  });

  return router;
};
