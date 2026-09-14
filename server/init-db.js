/**
 * daga-clone — server/init-db.js
 * 种子数据脚本：插入默认管理员、解析接口、步骤、FAQ、系统设置
 */

require('dotenv').config();

const bcrypt = require('bcryptjs');
const { initDatabase } = require('./database');

async function seed() {
  const db = await initDatabase();

  console.log('[InitDB] Seeding database...');

  /* ── 1. 默认管理员 ────────────────────────────── */
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || 'admin123';
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(adminPass, salt);

  const existingAdmin = db.prepare('SELECT id FROM admins WHERE username = ?').get(adminUser);
  if (!existingAdmin) {
    db.prepare('INSERT INTO admins (username, password) VALUES (?, ?)').run(adminUser, hash);
    console.log(`[InitDB] Admin user "${adminUser}" created.`);
  } else {
    console.log(`[InitDB] Admin user "${adminUser}" already exists, skipping.`);
  }

  /* ── 2. 解析接口（9条） ───────────────────────── */
  const interfaces = [
    { name: '默认线路①', url: 'https://bd.jx.cn/?url=',              sort: 1 },
    { name: '默认线路②', url: 'https://jx.m3u8.tv/jiexi/?url=',      sort: 2 },
    { name: '默认线路③', url: 'https://www.8090g.cn/jiexi/?url=',    sort: 3 },
    { name: '默认线路④', url: 'https://www.playm3u8.cn/jiexi.php?url=', sort: 4 },
    { name: '默认线路⑤', url: 'https://jx.parwix.com:4433/player/?url=', sort: 5 },
    { name: '默认线路⑥', url: 'https://jx.aidouer.net/?url=',        sort: 6 },
    { name: '默认线路⑦', url: 'https://jx.playerjy.com/?url=',       sort: 7 },
    { name: '默认线路⑧', url: 'https://jx.jsonplayer.com/player/?url=', sort: 8 },
    { name: '默认线路⑨', url: 'https://vip.lz-cdn.com/?url=',        sort: 9 },
    /* ── 来自 vip.52api.cn ── */
    { name: '虾米解析（推荐）', url: 'https://jx.xmflv.cc/?url=',                sort: 10 },
    { name: '极速云解析',       url: 'https://jx.2s0.cn/player/?url=',           sort: 11 },
    { name: '七哥解析',         url: 'https://jx.nnxv.cn/tv.php?url=',            sort: 12 },
    { name: '七七解析',         url: 'https://jx.77flv.cc/?url=',                sort: 13 },
    { name: '咸鱼解析',         url: 'https://jx.xymp4.cc/?url=',                sort: 14 },
    { name: '全民解析',         url: 'https://api.quanminjiexi.com/index.php?url=', sort: 15 },
    { name: '智能云解析',       url: 'http://v9j.net/?url=',                    sort: 16 },
  ];

  const countInterfaces = db.prepare('SELECT COUNT(*) as cnt FROM parse_interfaces').get();
  if (countInterfaces && countInterfaces.cnt === 0) {
    const insert = db.prepare('INSERT INTO parse_interfaces (name, url, type, sort_order) VALUES (?, ?, ?, ?)');
    for (const item of interfaces) {
      insert.run(item.name, item.url, 'video', item.sort);
    }
    console.log(`[InitDB] ${interfaces.length} parse interfaces inserted.`);
  } else {
    console.log('[InitDB] Parse interfaces already exist, skipping.');
  }

  /* ── 3. 使用步骤（4条） ───────────────────────── */
  const steps = [
    { num: 1, content: '在腾讯视频、优酷、爱奇艺、PPTV等各大视频网站找到想看的VIP视频地址' },
    { num: 2, content: '复制视频链接，粘贴到本页面的输入框中' },
    { num: 3, content: '选择解析接口频道，点击"解析播放"按钮' },
    { num: 4, content: '等待加载完成，即可免费观看高清VIP视频！' },
  ];

  const countSteps = db.prepare('SELECT COUNT(*) as cnt FROM guide_steps').get();
  if (countSteps && countSteps.cnt === 0) {
    const insert = db.prepare('INSERT INTO guide_steps (step_number, content, sort_order) VALUES (?, ?, ?)');
    for (const item of steps) {
      insert.run(item.num, item.content, item.num);
    }
    console.log(`[InitDB] ${steps.length} guide steps inserted.`);
  } else {
    console.log('[InitDB] Guide steps already exist, skipping.');
  }

  /* ── 4. FAQ（5条） ────────────────────────────── */
  const faqs = [
    { question: '解析失败怎么办？', answer: '请尝试切换其他解析接口，或更换视频源地址' },
    { question: '手机上可以用吗？', answer: '完全支持！本网站已适配移动端' },
    { question: '支持哪些平台？',   answer: '支持腾讯视频、优酷、爱奇艺、PPTV等主流视频平台' },
    { question: '可以下载视频吗？', answer: '借助第三方下载工具可保存视频，本站仅提供在线解析播放' },
    { question: '解析速度慢？',     answer: '建议切换"蓝光解析"或"万能解析"线路' },
  ];

  const countFaqs = db.prepare('SELECT COUNT(*) as cnt FROM faqs').get();
  if (countFaqs && countFaqs.cnt === 0) {
    const insert = db.prepare('INSERT INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)');
    faqs.forEach((item, idx) => {
      insert.run(item.question, item.answer, idx + 1);
    });
    console.log(`[InitDB] ${faqs.length} FAQs inserted.`);
  } else {
    console.log('[InitDB] FAQs already exist, skipping.');
  }

  /* ── 5. 系统设置 ──────────────────────────────── */
  const settings = [
    { key: 'site_title',       value: '全民影视VIP视频解析' },
    { key: 'site_keywords',    value: '全民vip,视频解析,vip解析' },
    { key: 'site_description', value: '全民影视vip视频解析,提供全网vip视频在线解析播放' },
  ];

  const countSettings = db.prepare('SELECT COUNT(*) as cnt FROM site_settings').get();
  if (countSettings && countSettings.cnt === 0) {
    const insert = db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)');
    for (const item of settings) {
      insert.run(item.key, item.value);
    }
    console.log(`[InitDB] ${settings.length} site settings inserted.`);
  } else {
    console.log('[InitDB] Site settings already exist, skipping.');
  }

  // 持久化
  db.save();
  console.log('[InitDB] Database seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('[InitDB] Error:', err);
  process.exit(1);
});
