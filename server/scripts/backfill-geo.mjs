import { Client } from '../lib/database.js';

async function updateGeo(db, id, data) {
  await db.prepare('UPDATE visitor_ips SET country=?,region=?,city=?,lat=?,lng=? WHERE id=?')
    .run(data.country, data.region, data.city, data.lat, data.lon, id);
}

function isPrivateIp(ip) {
  if (!ip || ip === 'unknown' || ip === '::1' || ip === 'localhost') return true;
  if (ip.startsWith('192.168') || ip.startsWith('10.') || ip.startsWith('127.')) return true;
  if (ip.startsWith('172.')) { const n = parseInt(ip.split('.')[1], 10); if (n >= 16 && n <= 31) return true; }
  return false;
}

async function lookupGeo(ip) {
  if (isPrivateIp(ip)) return null;
  for (const url of [
    `http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon&lang=zh-CN`,
    `https://api.ip.sb/geoip/${ip}`,
  ]) {
    try {
      const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!resp.ok) continue;
      const data = await resp.json();
      if (data.status === 'success') {
        return { country: data.country, region: data.regionName, city: data.city, lat: data.lat, lon: data.lon };
      } else if (data.country) {
        return { country: data.country, region: data.region || '', city: data.city || '', lat: data.latitude || 0, lon: data.longitude || 0 };
      }
    } catch (e) {
      console.error(`  [GEO FAIL] ${ip}: ${e.message}`);
    }
  }
  return null;
}

async function main() {
  const db = await Client();
  const rows = await db.prepare("SELECT id, ip FROM visitor_ips WHERE country IS NULL AND ip != 'unknown'").all();
  console.log(`Found ${rows.length} records with NULL geo.`);

  let done = 0;
  for (const row of rows) {
    const geo = await lookupGeo(row.ip);
    if (geo) {
      await updateGeo(db, row.id, geo);
      done++;
      console.log(`  [OK] id=${row.id} ip=${row.ip} -> ${geo.country}/${geo.city}`);
    } else {
      console.log(`  [SKIP] id=${row.id} ip=${row.ip} -> no geo data`);
    }
    // Rate limit: ~3 req/s max for backfill
    await new Promise(r => setTimeout(r, 350));
  }

  console.log(`\nDone. Updated ${done}/${rows.length} records.`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
