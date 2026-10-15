const path = require('path');
const fs = require('fs');
const maxmind = require('maxmind');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const SITE_URL = process.env.SITE_URL || 'https://www.ityvip.xyz';
const ADMIN_PATH = process.env.ADMIN_PATH || '6n1x5ltwujr5';

const MMDB_PATH = path.join(__dirname, 'geo', 'GeoLite2-City.mmdb');

function isAllowedUrl(url) {
  try {
    const u = new URL(url);
    const blocked = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '10.', '172.16.', '172.17.', '172.18.', '172.19.', '172.20.', '172.21.', '172.22.', '172.23.', '172.24.', '172.25.', '172.26.', '172.27.', '172.28.', '172.29.', '172.30.', '172.31.', '192.168.', '169.254.'];
    return !blocked.some(p => u.hostname.startsWith(p) || u.hostname === p);
  } catch {
    return false;
  }
}

function getClientIp(req) {
  return (req.headers['cf-connecting-ip'] || (req.headers['x-forwarded-for'] || req.ip || '').split(',')[0].trim() || 'unknown').replace(/^::ffff:/, '');
}

function isPrivateIp(ip) {
  if (!ip || ip === 'unknown' || ip === '::1' || ip === 'localhost') return true;
  if (ip.startsWith('192.168') || ip.startsWith('10.') || ip.startsWith('127.')) return true;
  if (ip.startsWith('172.')) { const n = parseInt(ip.split('.')[1], 10); if (n >= 16 && n <= 31) return true; }
  return false;
}

const COUNTRY_CN = { 'China':'中国','Hong Kong':'香港','Taiwan':'台湾','Macau':'澳门','Japan':'日本','South Korea':'韩国','Korea':'韩国','Singapore':'新加坡','Malaysia':'马来西亚','Thailand':'泰国','Vietnam':'越南','Philippines':'菲律宾','Indonesia':'印度尼西亚','India':'印度','Russia':'俄罗斯','United States':'美国','USA':'美国','Canada':'加拿大','United Kingdom':'英国','UK':'英国','France':'法国','Germany':'德国','Australia':'澳大利亚','Netherlands':'荷兰','Sweden':'瑞典','Norway':'挪威','Finland':'芬兰','Denmark':'丹麦','Switzerland':'瑞士','Italy':'意大利','Spain':'西班牙','Brazil':'巴西','Argentina':'阿根廷','Seychelles':'塞舌尔','Serbia':'塞尔维亚','Greece':'希腊','Poland':'波兰' };

function normalizeCountry(name) {
  if (!name) return name;
  const cn = COUNTRY_CN[name] || COUNTRY_CN[name.replace(/^the\s+/i, '')];
  return cn || name;
}

let geoReader = null;

async function loadGeoReader() {
  if (fs.existsSync(MMDB_PATH)) {
    try { geoReader = await maxmind.open(MMDB_PATH); console.log('[Geo] Loaded local GeoLite2 database'); } catch (e) { console.error('[Geo] Failed to load mmdb:', e.message); }
  }
}

const geoCache = new Map();
const GEO_CACHE_TTL = 24 * 60 * 60 * 1000;
const GEO_CACHE_MAX = 50000;
const geoCacheCleanup = setInterval(() => {
  const n = Date.now();
  if (geoCache.size > GEO_CACHE_MAX) {
    const keys = [...geoCache.keys()].slice(0, geoCache.size - GEO_CACHE_MAX);
    for (const k of keys) geoCache.delete(k);
  }
  for (const [k, v] of geoCache) if (n - v.ts > GEO_CACHE_TTL) geoCache.delete(k);
}, 60 * 60 * 1000);

async function lookupGeo(ip) {
  if (isPrivateIp(ip)) return null;
  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.ts < GEO_CACHE_TTL) return cached.data;
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
  } catch { /* skip */ }

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
    } catch { /* skip */ }
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

function escapeHtml(s) {
  if (typeof s !== 'string') return String(s);
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

module.exports = { isAllowedUrl, getClientIp, isPrivateIp, UA, SITE_URL, ADMIN_PATH, MMDB_PATH, COUNTRY_CN, normalizeCountry, loadGeoReader, lookupGeo, ensureGeoDb, geoCacheCleanup, escapeHtml };
