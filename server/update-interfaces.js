/**
 * 更新解析接口数据（实时可用线路）
 * 用法：node server/update-interfaces.js
 */
require('dotenv').config();
const { initDatabase } = require('./database');

// 线路配置与 https://daga.cc/ 保持一致
const WORKING_INTERFACES = [
  { name: '搜影片名称专用',           url: 'https://z1.m1907.top/?jx=',              sort: 1 },
  { name: '①电视剧解析（有广告）',     url: 'https://jx.jsonplayer.com/player/?url=', sort: 2 },
  { name: '②电影解析（有广告）',       url: 'https://jx.playerjy.com/?ads=0&url=',    sort: 3 },
  { name: '③万能解析（稳定）',         url: 'https://z1.m1907.top/?jx=',              sort: 4 },
  { name: '④智能解析(备用)',           url: 'https://z1.m1907.cn/?jx=',               sort: 5 },
  { name: '蓝光解析（直解）',          url: 'https://llq.tyhua.top/?url=',            sort: 6 },
  { name: '优酷解析（备用）',          url: 'https://www.daga.cc/vip2/?url=',          sort: 7 },
  { name: '爱奇艺解析（备用）',        url: 'https://www.daga.cc/vip3/?url=',          sort: 8 },
  { name: '好莱坞解析（备用）',        url: 'https://player.mrgaocloud.com/player/?url=', sort: 9 },
  /* ── 来自 vip.52api.cn ── */
  { name: '⑤虾米解析（推荐）',         url: 'https://jx.xmflv.cc/?url=',                sort: 10 },
  { name: '⑥极速云解析',               url: 'https://jx.2s0.cn/player/?url=',           sort: 11 },
  { name: '⑦七哥解析',                 url: 'https://jx.nnxv.cn/tv.php?url=',            sort: 12 },
  { name: '⑧七七解析',                 url: 'https://jx.77flv.cc/?url=',                sort: 13 },
  { name: '⑨咸鱼解析',                 url: 'https://jx.xymp4.cc/?url=',                sort: 14 },
  { name: '⑩全民解析',                 url: 'https://api.quanminjiexi.com/index.php?url=', sort: 15 },
  { name: '⑪智能云解析',               url: 'http://v9j.net/?url=',                    sort: 16 },
];

async function update() {
  const db = await initDatabase();

  db.prepare('DELETE FROM parse_interfaces').run();
  console.log('[Update] Cleared old parse interfaces.');

  const insert = db.prepare(
    'INSERT INTO parse_interfaces (name, url, type, sort_order, is_active) VALUES (?, ?, ?, ?, ?)'
  );
  for (const item of WORKING_INTERFACES) {
    // 全部启用，与 daga.cc 保持一致
    insert.run(item.name, item.url, 'video', item.sort, 1);
  }
  console.log(`[Update] Inserted ${WORKING_INTERFACES.length} parse interfaces.`);

  db.save();
  console.log('[Update] Done!');
  process.exit(0);
}

update().catch((err) => {
  console.error('[Update] Error:', err);
  process.exit(1);
});
