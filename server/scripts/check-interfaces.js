/**
 * 检测解析接口 iframe 兼容性并更新数据库
 * 运行: node server/scripts/check-interfaces.js
 */
const { initDatabase } = require('../database');
const axios = require('axios');

const TEST_VIDEO_URL = 'https://v.qq.com/x/cover/test.html';
const IFRAME_GUARD_PATTERNS = [
  'window.self!=window.top',
  'window.parent',
  'top.location',
  'self!==self',
  'm1-z2.cloud',
  'nnpp.vip',
];

async function checkInterface(url) {
  try {
    const testUrl = url.startsWith('//') ? 'https:' + url : url;
    const finalUrl = testUrl.replace('{url}', encodeURIComponent(TEST_VIDEO_URL));
    const resp = await axios.get(finalUrl, {
      maxRedirects: 3,
      validateStatus: () => true,
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    if (resp.statusCode !== 200) return { ok: false, reason: 'status_' + resp.statusCode };
    const body = resp.data || '';
    for (const pattern of IFRAME_GUARD_PATTERNS) {
      if (body.includes(pattern)) return { ok: false, reason: 'iframe_guard:' + pattern };
    }
    if (body.length < 300) return { ok: false, reason: 'too_short' };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e.code || e.message };
  }
}

async function main() {
  const db = await initDatabase();
  const rows = await db.prepare(
    'SELECT id, name, url FROM parse_interfaces WHERE is_active = 1 ORDER BY sort_order ASC'
  ).all();

  console.log(`[Check] Found ${rows.length} active interfaces\n`);

  const results = [];
  for (const row of rows) {
    const r = await checkInterface(row.url);
    results.push({ id: row.id, name: row.name, url: row.url, ...r });
    console.log(`  ${row.name} (${row.url.slice(0, 40)}...) -> ${r.ok ? 'OK' : 'FAIL (' + r.reason + ')'}`);
  }

  // Update database: set is_active = 0 for incompatible interfaces
  let updated = 0;
  for (const r of results) {
    if (!r.ok) {
      await db.prepare('UPDATE parse_interfaces SET is_active = 0 WHERE id = ?').run(r.id);
      console.log(`  [Deactivated] ${r.name}`);
      updated++;
    }
  }

  // Reorder sort_order for remaining active interfaces
  const remaining = await db.prepare(
    'SELECT id FROM parse_interfaces WHERE is_active = 1 ORDER BY sort_order ASC'
  ).all();
  for (let i = 0; i < remaining.length; i++) {
    await db.prepare('UPDATE parse_interfaces SET sort_order = ? WHERE id = ?').run(i + 1, remaining[i].id);
  }

  console.log(`\n[Done] Deactivated ${updated} interface(s), ${remaining.length} remaining active`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
