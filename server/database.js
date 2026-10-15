const mysql = require('mysql2/promise');

class Statement {
  constructor(pool, sql) {
    this.pool = pool;
    this.sql = sql;
  }

  async all(...params) {
    const [rows] = await this.pool.query(this.sql, params);
    return rows;
  }

  async get(...params) {
    const [rows] = await this.pool.query(this.sql, params);
    return rows[0];
  }

  async run(...params) {
    const [result] = await this.pool.execute(this.sql, params);
    return { changes: result.affectedRows, insertId: result.insertId };
  }
}

class Database {
  constructor(pool) {
    this.pool = pool;
  }

  prepare(sql) {
    return new Statement(this.pool, sql);
  }

  async exec(sql) {
    await this.pool.execute(sql);
  }

  transaction(fn) {
    return async (...args) => {
      const conn = await this.pool.getConnection();
      try {
        await conn.beginTransaction();
        const result = await fn(...args);
        await conn.commit();
        return result;
      } catch (e) {
        await conn.rollback();
        throw e;
      } finally {
        conn.release();
      }
    };
  }
}

async function initDatabase() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'daga_clone',
    password: process.env.DB_PASSWORD || 'smNMaMRrk3rxWxWt',
    database: process.env.DB_NAME || 'daga_clone',
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
  });

  const db = new Database(pool);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS parse_interfaces (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      url TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'video',
      sort_order INT DEFAULT 0,
      is_active INT DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS ads (
      id INT AUTO_INCREMENT PRIMARY KEY,
      position VARCHAR(100) NOT NULL,
      name VARCHAR(255) DEFAULT NULL,
      code TEXT NOT NULL,
      is_active INT DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS recommend_links (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      icon_url TEXT,
      link_url TEXT NOT NULL,
      sort_order INT DEFAULT 0,
      is_active INT DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      \`key\` VARCHAR(255) UNIQUE NOT NULL,
      \`value\` TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS guide_steps (
      id INT AUTO_INCREMENT PRIMARY KEY,
      step_number INT NOT NULL,
      content TEXT NOT NULL,
      sort_order INT DEFAULT 0
    )
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS faqs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      sort_order INT DEFAULT 0
    )
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS page_views (
      id INT AUTO_INCREMENT PRIMARY KEY,
      date VARCHAR(10) NOT NULL,
      pv INT DEFAULT 0,
      uv INT DEFAULT 0,
      UNIQUE KEY uk_date (date)
    )
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS visitor_ips (
      id INT AUTO_INCREMENT PRIMARY KEY,
      date VARCHAR(10) NOT NULL,
      ip VARCHAR(45) NOT NULL,
      country VARCHAR(100) DEFAULT NULL,
      region VARCHAR(100) DEFAULT NULL,
      city VARCHAR(100) DEFAULT NULL,
      lat DECIMAL(10,7) DEFAULT NULL,
      lng DECIMAL(10,7) DEFAULT NULL,
      UNIQUE KEY uk_date_ip (date, ip)
    )
  `);

  // Add geo columns if upgrading from old schema (ignore if exist)
  try { await db.exec('ALTER TABLE visitor_ips ADD COLUMN country VARCHAR(100) DEFAULT NULL'); } catch { /* column may already exist */ }
  try { await db.exec('ALTER TABLE visitor_ips ADD COLUMN region VARCHAR(100) DEFAULT NULL'); } catch { /* column may already exist */ }
  try { await db.exec('ALTER TABLE visitor_ips ADD COLUMN city VARCHAR(100) DEFAULT NULL'); } catch { /* column may already exist */ }
  try { await db.exec('ALTER TABLE visitor_ips ADD COLUMN lat DECIMAL(10,7) DEFAULT NULL'); } catch { /* column may already exist */ }
  try { await db.exec('ALTER TABLE visitor_ips ADD COLUMN lng DECIMAL(10,7) DEFAULT NULL'); } catch { /* column may already exist */ }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS page_behavior (
      id INT AUTO_INCREMENT PRIMARY KEY,
      date VARCHAR(10) NOT NULL,
      ip VARCHAR(45) NOT NULL,
      page VARCHAR(255) NOT NULL,
      dwell_time INT DEFAULT 0,
      scroll_depth INT DEFAULT 0,
      click_count INT DEFAULT 0,
      entry_time DATETIME,
      exit_time DATETIME,
      KEY idx_date (date),
      KEY idx_date_ip (date, ip)
    )
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS click_events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      date VARCHAR(10) NOT NULL,
      ip VARCHAR(45) NOT NULL,
      page VARCHAR(255) NOT NULL,
      x DECIMAL(5,2),
      y DECIMAL(5,2),
      element VARCHAR(255) DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      KEY idx_date (date),
      KEY idx_date_page (date, page)
    )
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS traffic_sources (
      id INT AUTO_INCREMENT PRIMARY KEY,
      date VARCHAR(10) NOT NULL,
      channel VARCHAR(20) NOT NULL,
      source VARCHAR(255) NOT NULL,
      pv INT DEFAULT 0,
      uv INT DEFAULT 0,
      UNIQUE KEY uk_date_channel_source (date, channel, source(100)),
      KEY idx_date (date)
    )
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tool_usage (
      id INT AUTO_INCREMENT PRIMARY KEY,
      date VARCHAR(10) NOT NULL,
      tool VARCHAR(100) NOT NULL,
      action VARCHAR(100) NOT NULL,
      ip VARCHAR(45) NOT NULL,
       detail TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      KEY idx_date (date),
      KEY idx_tool (tool)
    )
  `  );
  try { await db.exec('ALTER TABLE tool_usage MODIFY COLUMN detail TEXT DEFAULT NULL'); } catch { /* column may already exist */ }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS web_vitals (
      id INT AUTO_INCREMENT PRIMARY KEY,
      date VARCHAR(10) NOT NULL,
      ip VARCHAR(45) NOT NULL,
      name VARCHAR(20) NOT NULL,
      value DECIMAL(12,3) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      KEY idx_date_name (date, name)
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      endpoint TEXT NOT NULL,
      auth VARCHAR(255) NOT NULL,
      p256dh VARCHAR(255) NOT NULL,
      user_agent VARCHAR(500) DEFAULT '',
      subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_notified_at DATETIME DEFAULT NULL,
      UNIQUE KEY uk_endpoint (endpoint(500))
    )
  `);
  try { await db.exec('ALTER TABLE push_subscriptions ADD COLUMN last_notified_at DATETIME DEFAULT NULL'); } catch (e) {}

  // VAPID keys for push — store in site_settings
  try {
    const vapidKeys = require('web-push').generateVAPIDKeys();
    const existingVapidPublic = await db.prepare("SELECT `value` FROM site_settings WHERE `key` = 'vapid_public_key'").get();
    if (!existingVapidPublic || !existingVapidPublic.value) {
      await db.prepare("INSERT INTO site_settings (`key`, `value`) VALUES ('vapid_public_key', ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)").run(vapidKeys.publicKey);
      await db.prepare("INSERT INTO site_settings (`key`, `value`) VALUES ('vapid_private_key', ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)").run(vapidKeys.privateKey);
      console.log('[Database] VAPID keys generated and saved.');
    } else {
      console.log('[Database] VAPID keys already exist, skipping generation.');
    }
  } catch (e) {
    console.error('[Database] Error generating VAPID keys:', e.message);
  }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS memes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      image_url TEXT NOT NULL,
      category VARCHAR(100) DEFAULT 'other',
      tags TEXT,
      source VARCHAR(255) DEFAULT '',
      width INT DEFAULT 0,
      height INT DEFAULT 0,
      is_active INT DEFAULT 1,
      sort_order INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      excerpt TEXT,
      content LONGTEXT,
      cover_image VARCHAR(500) DEFAULT '',
      author VARCHAR(100) DEFAULT '',
      category VARCHAR(100) DEFAULT '',
      tags VARCHAR(500) DEFAULT '',
      is_published INT DEFAULT 0,
      published_at DATETIME DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_published (is_published, published_at)
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS ai_tools_submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      category VARCHAR(100) DEFAULT '',
      submitted_by VARCHAR(255) DEFAULT '',
      status ENUM('pending','approved','rejected') DEFAULT 'pending',
      contact VARCHAR(255) DEFAULT '',
      ip VARCHAR(45) DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      KEY idx_status (status),
      KEY idx_category (category)
    )
  `);
  try { await db.exec("ALTER TABLE ai_tools_submissions ADD COLUMN contact VARCHAR(255) DEFAULT '' AFTER submitted_by"); } catch (e) {}
  try { await db.exec("ALTER TABLE ai_tools_submissions ADD COLUMN is_paid TINYINT(1) DEFAULT 0 AFTER contact"); } catch (e) {}
  try { await db.exec("ALTER TABLE ai_tools_submissions ADD COLUMN is_featured TINYINT(1) DEFAULT 0 AFTER is_paid"); } catch (e) {}

  // 补 articles 表缺失列
  try { await db.exec('ALTER TABLE articles ADD COLUMN views INT DEFAULT 0 AFTER content'); } catch (e) {}
  try { await db.exec('ALTER TABLE articles ADD COLUMN likes INT DEFAULT 0 AFTER views'); } catch (e) {}

  // 补缺失索引
  try { await db.exec('ALTER TABLE memes ADD INDEX idx_active_sort (is_active, sort_order, id)'); } catch (e) {}
  try { await db.exec('ALTER TABLE memes ADD INDEX idx_category_active (category, is_active)'); } catch (e) {}
  try { await db.exec('ALTER TABLE articles ADD INDEX idx_views (views)'); } catch (e) {}
  try { await db.exec('ALTER TABLE articles ADD INDEX idx_category (category)'); } catch (e) {}
  try { await db.exec('ALTER TABLE page_behavior ADD INDEX idx_page (page)'); } catch (e) {}
  try { await db.exec('ALTER TABLE click_events ADD INDEX idx_created_at (created_at)'); } catch (e) {}
  try { await db.exec('ALTER TABLE click_events ADD INDEX idx_date_element (date, element(100))'); } catch (e) {}
  try { await db.exec('ALTER TABLE visitor_ips ADD INDEX idx_country_id (country, id)'); } catch (e) {}

  await db.exec(`
    CREATE TABLE IF NOT EXISTS parse_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      url TEXT NOT NULL,
      platform VARCHAR(50) DEFAULT '',
      success TINYINT(1) DEFAULT 0,
      ip VARCHAR(45) DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      KEY idx_created (created_at),
      KEY idx_success (success)
    )
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS m3u8_play_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      url TEXT NOT NULL,
      ip VARCHAR(45) DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      KEY idx_created (created_at)
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      subject VARCHAR(255) DEFAULT '',
      message TEXT NOT NULL,
      ip VARCHAR(45) DEFAULT '',
      user_agent VARCHAR(500) DEFAULT '',
      is_read TINYINT(1) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      KEY idx_created (created_at),
      KEY idx_email (email)
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE DEFAULT NULL,
      password VARCHAR(255) NOT NULL,
      nickname VARCHAR(100) DEFAULT '',
      level TINYINT DEFAULT 0,                -- 0免费 1月费 2年费 3永久
      vip_expires_at DATETIME DEFAULT NULL,   -- 永久会员填 '2038-01-01 00:00:00'
      daily_quota INT DEFAULT 0,              -- 0=不覆盖，按等级+设置走；>0=后台单独覆盖
      quota_used INT DEFAULT 0,
      quota_date VARCHAR(10) DEFAULT '',      -- 配额归属日 YYYY-MM-DD
      status TINYINT DEFAULT 1,               -- 1正常 0禁用
      last_login_at DATETIME DEFAULT NULL,
      last_login_ip VARCHAR(45) DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_level (level),
      KEY idx_status (status)
    )
  `);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS parse_quota_log (
      id INT AUTO_INCREMENT PRIMARY KEY,
      date VARCHAR(10) NOT NULL,
      ip VARCHAR(45) NOT NULL,
      cnt INT DEFAULT 0,
      UNIQUE KEY uk_date_ip (date, ip)
    )
  `);

  // 配额相关设置默认值（幂等：已存在则不覆盖，兼容后台自行修改）
  const quotaSettingDefaults = [
    ['free_daily_quota', '5'],
    ['vip_daily_quota', '100'],
    ['guest_daily_quota', '5'],
  ];
  for (const [key, value] of quotaSettingDefaults) {
    await db.prepare('INSERT IGNORE INTO site_settings (`key`, `value`) VALUES (?, ?)').run(key, value);
  }

  const memeCount = await db.prepare('SELECT COUNT(*) as cnt FROM memes').get();
  if (memeCount && memeCount.cnt < 150) {
    // First time or migration from old seeds (<150): clear and reseed 190 memes
    await db.exec('TRUNCATE TABLE memes');
    const seedMemes = [
      { title: '滑稽', image_url: '/api/meme/img?seed=huaji&backgroundColor=b6e3f4', category: '热门', tags: '热门,经典', sort: 1 },
      { title: '流汗黄豆', image_url: '/api/meme/img?seed=liuhanhuangdou&backgroundColor=ffd5dc', category: '热门', tags: '热门,经典', sort: 2 },
      { title: '狗头保命', image_url: '/api/meme/img?seed=goutou&backgroundColor=c0aede', category: '热门', tags: '热门,经典', sort: 3 },
      { title: '啊这', image_url: '/api/meme/img?seed=azhe&backgroundColor=ffdfbf', category: '热门', tags: '热门,经典', sort: 4 },
      { title: '裂开', image_url: '/api/meme/img?seed=liekai&backgroundColor=d1d4f9', category: '热门', tags: '热门,经典', sort: 5 },
      { title: '战术喝茶', image_url: '/api/meme/img?seed=hecha&backgroundColor=f0d5a8', category: '热门', tags: '热门,经典', sort: 6 },
      { title: '告辞', image_url: '/api/meme/img?seed=gaoci&backgroundColor=a8d8ea', category: '热门', tags: '热门,经典', sort: 7 },
      { title: '破防了', image_url: '/api/meme/img?seed=pofang&backgroundColor=eaac8b', category: '热门', tags: '热门,经典', sort: 8 },
      { title: '蚌埠住了', image_url: '/api/meme/img?seed=bengbu&backgroundColor=bce3c5', category: '热门', tags: '热门,经典', sort: 9 },
      { title: '麻了', image_url: '/api/meme/img?seed=male&backgroundColor=ffc8dd', category: '热门', tags: '热门,经典', sort: 10 },
      { title: '急急急', image_url: '/api/meme/img?seed=jijiji&backgroundColor=b6e3f4', category: '热门', tags: '热门,经典', sort: 11 },
      { title: '躺平', image_url: '/api/meme/img?seed=tangping&backgroundColor=ffd5dc', category: '热门', tags: '热门,经典', sort: 12 },
      { title: '摆烂', image_url: '/api/meme/img?seed=bailan&backgroundColor=c0aede', category: '热门', tags: '热门,经典', sort: 13 },
      { title: '开摆', image_url: '/api/meme/img?seed=kaibai&backgroundColor=ffdfbf', category: '热门', tags: '热门,经典', sort: 14 },
      { title: 'YYDS', image_url: '/api/meme/img?seed=yyds&backgroundColor=d1d4f9', category: '热门', tags: '热门,经典', sort: 15 },
      { title: '绝绝子', image_url: '/api/meme/img?seed=juejuezi&backgroundColor=f0d5a8', category: '热门', tags: '热门,经典', sort: 16 },
      { title: '无语子', image_url: '/api/meme/img?seed=wuyuzi&backgroundColor=a8d8ea', category: '热门', tags: '热门,经典', sort: 17 },
      { title: '针不戳', image_url: '/api/meme/img?seed=zhenbuchuo&backgroundColor=eaac8b', category: '热门', tags: '热门,经典', sort: 18 },
      { title: '就这', image_url: '/api/meme/img?seed=jiuzhe&backgroundColor=bce3c5', category: '热门', tags: '热门,经典', sort: 19 },
      { title: '那我走', image_url: '/api/meme/img?seed=nayouzou&backgroundColor=ffc8dd', category: '热门', tags: '热门,经典', sort: 20 },
      { title: '熊猫头-笑哭', image_url: '/api/meme/img?seed=xiaoku&backgroundColor=b6e3f4', category: '搞笑', tags: '熊猫,搞笑,表情包', sort: 21 },
      { title: '熊猫头-无语', image_url: '/api/meme/img?seed=wuyu&backgroundColor=ffd5dc', category: '搞笑', tags: '熊猫,搞笑,表情包', sort: 22 },
      { title: '熊猫头-生气', image_url: '/api/meme/img?seed=shengqi&backgroundColor=c0aede', category: '搞笑', tags: '熊猫,搞笑,表情包', sort: 23 },
      { title: '熊猫头-开心', image_url: '/api/meme/img?seed=kaixin&backgroundColor=ffdfbf', category: '搞笑', tags: '熊猫,搞笑,表情包', sort: 24 },
      { title: '熊猫头-震惊', image_url: '/api/meme/img?seed=zhenjing&backgroundColor=d1d4f9', category: '搞笑', tags: '熊猫,搞笑,表情包', sort: 25 },
      { title: '熊猫头-流汗', image_url: '/api/meme/img?seed=liuhan&backgroundColor=f0d5a8', category: '搞笑', tags: '熊猫,搞笑,表情包', sort: 26 },
      { title: '熊猫头-抠鼻', image_url: '/api/meme/img?seed=koubi&backgroundColor=a8d8ea', category: '搞笑', tags: '熊猫,搞笑,表情包', sort: 27 },
      { title: '熊猫头-亲亲', image_url: '/api/meme/img?seed=qinqin&backgroundColor=eaac8b', category: '搞笑', tags: '熊猫,搞笑,表情包', sort: 28 },
      { title: '熊猫头-白眼', image_url: '/api/meme/img?seed=baiyan&backgroundColor=bce3c5', category: '搞笑', tags: '熊猫,搞笑,表情包', sort: 29 },
      { title: '熊猫头-坏笑', image_url: '/api/meme/img?seed=huaixiao&backgroundColor=ffc8dd', category: '搞笑', tags: '熊猫,搞笑,表情包', sort: 30 },
      { title: '熊猫头-尴尬', image_url: '/api/meme/img?seed=gangga&backgroundColor=b6e3f4', category: '搞笑', tags: '熊猫,搞笑,表情包', sort: 31 },
      { title: '熊猫头-吐血', image_url: '/api/meme/img?seed=tuxue&backgroundColor=ffd5dc', category: '搞笑', tags: '熊猫,搞笑,表情包', sort: 32 },
      { title: '熊猫头-鄙视', image_url: '/api/meme/img?seed=bishi&backgroundColor=c0aede', category: '搞笑', tags: '熊猫,搞笑,表情包', sort: 33 },
      { title: '熊猫头-委屈', image_url: '/api/meme/img?seed=weiqu&backgroundColor=ffdfbf', category: '搞笑', tags: '熊猫,搞笑,表情包', sort: 34 },
      { title: '熊猫头-懵逼', image_url: '/api/meme/img?seed=mengbi&backgroundColor=d1d4f9', category: '搞笑', tags: '熊猫,搞笑,表情包', sort: 35 },
      { title: '熊猫头-可爱', image_url: '/api/meme/img?seed=keai&backgroundColor=f0d5a8', category: '搞笑', tags: '熊猫,搞笑,表情包', sort: 36 },
      { title: '熊猫头-奸笑', image_url: '/api/meme/img?seed=jianxiao&backgroundColor=a8d8ea', category: '搞笑', tags: '熊猫,搞笑,表情包', sort: 37 },
      { title: '熊猫头-哭泣', image_url: '/api/meme/img?seed=kuqi&backgroundColor=eaac8b', category: '搞笑', tags: '熊猫,搞笑,表情包', sort: 38 },
      { title: '熊猫头-发呆', image_url: '/api/meme/img?seed=fadai&backgroundColor=bce3c5', category: '搞笑', tags: '熊猫,搞笑,表情包', sort: 39 },
      { title: '熊猫头-崩溃', image_url: '/api/meme/img?seed=bengkui&backgroundColor=ffc8dd', category: '搞笑', tags: '熊猫,搞笑,表情包', sort: 40 },
      { title: '我大意了没有闪', image_url: '/api/meme/img?seed=dayile&backgroundColor=b6e3f4', category: '沙雕', tags: '沙雕,搞笑', sort: 41 },
      { title: '你干嘛哎呦', image_url: '/api/meme/img?seed=niganma&backgroundColor=ffd5dc', category: '沙雕', tags: '沙雕,搞笑', sort: 42 },
      { title: '我太难了', image_url: '/api/meme/img?seed=woainanle&backgroundColor=c0aede', category: '沙雕', tags: '沙雕,搞笑', sort: 43 },
      { title: '佛系看淡', image_url: '/api/meme/img?seed=foxi&backgroundColor=ffdfbf', category: '沙雕', tags: '沙雕,搞笑', sort: 44 },
      { title: '你细品', image_url: '/api/meme/img?seed=nixipin&backgroundColor=d1d4f9', category: '沙雕', tags: '沙雕,搞笑', sort: 45 },
      { title: '格局打开', image_url: '/api/meme/img?seed=gejudakai&backgroundColor=f0d5a8', category: '沙雕', tags: '沙雕,搞笑', sort: 46 },
      { title: '属于是', image_url: '/api/meme/img?seed=shuyushi&backgroundColor=a8d8ea', category: '沙雕', tags: '沙雕,搞笑', sort: 47 },
      { title: '典中典', image_url: '/api/meme/img?seed=dianzhongdian&backgroundColor=eaac8b', category: '沙雕', tags: '沙雕,搞笑', sort: 48 },
      { title: '急了急了', image_url: '/api/meme/img?seed=jilejile&backgroundColor=bce3c5', category: '沙雕', tags: '沙雕,搞笑', sort: 49 },
      { title: '孝出强大', image_url: '/api/meme/img?seed=xiaochu&backgroundColor=ffc8dd', category: '沙雕', tags: '沙雕,搞笑', sort: 50 },
      { title: '逆天', image_url: '/api/meme/img?seed=nitian&backgroundColor=b6e3f4', category: '沙雕', tags: '沙雕,搞笑', sort: 51 },
      { title: '龟龟', image_url: '/api/meme/img?seed=guigui&backgroundColor=ffd5dc', category: '沙雕', tags: '沙雕,搞笑', sort: 52 },
      { title: '离谱', image_url: '/api/meme/img?seed=lipu&backgroundColor=c0aede', category: '沙雕', tags: '沙雕,搞笑', sort: 53 },
      { title: '乐', image_url: '/api/meme/img?seed=lele&backgroundColor=ffdfbf', category: '沙雕', tags: '沙雕,搞笑', sort: 54 },
      { title: '难绷', image_url: '/api/meme/img?seed=nanbeng&backgroundColor=d1d4f9', category: '沙雕', tags: '沙雕,搞笑', sort: 55 },
      { title: '绷不住', image_url: '/api/meme/img?seed=bengbuzhu&backgroundColor=f0d5a8', category: '沙雕', tags: '沙雕,搞笑', sort: 56 },
      { title: '红温了', image_url: '/api/meme/img?seed=hongwen&backgroundColor=a8d8ea', category: '沙雕', tags: '沙雕,搞笑', sort: 57 },
      { title: '玉玉了', image_url: '/api/meme/img?seed=yuyule&backgroundColor=eaac8b', category: '沙雕', tags: '沙雕,搞笑', sort: 58 },
      { title: '破大防', image_url: '/api/meme/img?seed=podafang&backgroundColor=bce3c5', category: '沙雕', tags: '沙雕,搞笑', sort: 59 },
      { title: '赢麻了', image_url: '/api/meme/img?seed=yingmale&backgroundColor=ffc8dd', category: '沙雕', tags: '沙雕,搞笑', sort: 60 },
      { title: '柴犬-笑', image_url: '/api/meme/img?seed=dog1&backgroundColor=b6e3f4', category: '动物', tags: '动物,可爱', sort: 61 },
      { title: '猫猫-懵', image_url: '/api/meme/img?seed=cat1&backgroundColor=ffd5dc', category: '动物', tags: '动物,可爱', sort: 62 },
      { title: '兔子-卖萌', image_url: '/api/meme/img?seed=rabbit&backgroundColor=c0aede', category: '动物', tags: '动物,可爱', sort: 63 },
      { title: '狗狗-委屈', image_url: '/api/meme/img?seed=dog2&backgroundColor=ffdfbf', category: '动物', tags: '动物,可爱', sort: 64 },
      { title: '仓鼠-呆萌', image_url: '/api/meme/img?seed=hamster&backgroundColor=d1d4f9', category: '动物', tags: '动物,可爱', sort: 65 },
      { title: '狐狸-狡黠', image_url: '/api/meme/img?seed=fox1&backgroundColor=f0d5a8', category: '动物', tags: '动物,可爱', sort: 66 },
      { title: '猫头鹰-严肃', image_url: '/api/meme/img?seed=owl1&backgroundColor=a8d8ea', category: '动物', tags: '动物,可爱', sort: 67 },
      { title: '企鹅-可爱', image_url: '/api/meme/img?seed=penguin&backgroundColor=eaac8b', category: '动物', tags: '动物,可爱', sort: 68 },
      { title: '熊猫-吃竹', image_url: '/api/meme/img?seed=panda1&backgroundColor=bce3c5', category: '动物', tags: '动物,可爱', sort: 69 },
      { title: '考拉-睡觉', image_url: '/api/meme/img?seed=koala&backgroundColor=ffc8dd', category: '动物', tags: '动物,可爱', sort: 70 },
      { title: '老虎-凶猛', image_url: '/api/meme/img?seed=tiger1&backgroundColor=b6e3f4', category: '动物', tags: '动物,可爱', sort: 71 },
      { title: '狮子-王者', image_url: '/api/meme/img?seed=lion1&backgroundColor=ffd5dc', category: '动物', tags: '动物,可爱', sort: 72 },
      { title: '长颈鹿-优雅', image_url: '/api/meme/img?seed=giraffe&backgroundColor=c0aede', category: '动物', tags: '动物,可爱', sort: 73 },
      { title: '大象-稳重', image_url: '/api/meme/img?seed=elephant&backgroundColor=ffdfbf', category: '动物', tags: '动物,可爱', sort: 74 },
      { title: '猴子-调皮', image_url: '/api/meme/img?seed=monkey1&backgroundColor=d1d4f9', category: '动物', tags: '动物,可爱', sort: 75 },
      { title: '松鼠-囤货', image_url: '/api/meme/img?seed=squirrel&backgroundColor=f0d5a8', category: '动物', tags: '动物,可爱', sort: 76 },
      { title: '刺猬-缩球', image_url: '/api/meme/img?seed=hedgehog&backgroundColor=a8d8ea', category: '动物', tags: '动物,可爱', sort: 77 },
      { title: '海豚-微笑', image_url: '/api/meme/img?seed=dolphin&backgroundColor=eaac8b', category: '动物', tags: '动物,可爱', sort: 78 },
      { title: '熊-抱抱', image_url: '/api/meme/img?seed=bear1&backgroundColor=bce3c5', category: '动物', tags: '动物,可爱', sort: 79 },
      { title: '鹿-温柔', image_url: '/api/meme/img?seed=deer1&backgroundColor=ffc8dd', category: '动物', tags: '动物,可爱', sort: 80 },
      { title: '皮卡丘-惊讶', image_url: '/api/meme/img?seed=pikachu&backgroundColor=b6e3f4', category: '动漫', tags: '动漫,二次元', sort: 81 },
      { title: '路飞-吃肉', image_url: '/api/meme/img?seed=lufei&backgroundColor=ffd5dc', category: '动漫', tags: '动漫,二次元', sort: 82 },
      { title: '鸣人-螺旋丸', image_url: '/api/meme/img?seed=mingren&backgroundColor=c0aede', category: '动漫', tags: '动漫,二次元', sort: 83 },
      { title: '悟空-龟派气功', image_url: '/api/meme/img?seed=wukong&backgroundColor=ffdfbf', category: '动漫', tags: '动漫,二次元', sort: 84 },
      { title: '索隆-三刀流', image_url: '/api/meme/img?seed=suolong&backgroundColor=d1d4f9', category: '动漫', tags: '动漫,二次元', sort: 85 },
      { title: '萨博-烧烧', image_url: '/api/meme/img?seed=sabo&backgroundColor=f0d5a8', category: '动漫', tags: '动漫,二次元', sort: 86 },
      { title: '艾斯-火拳', image_url: '/api/meme/img?seed=aice&backgroundColor=a8d8ea', category: '动漫', tags: '动漫,二次元', sort: 87 },
      { title: '卡卡西-写轮眼', image_url: '/api/meme/img?seed=kakaxi&backgroundColor=eaac8b', category: '动漫', tags: '动漫,二次元', sort: 88 },
      { title: '佐助-千鸟', image_url: '/api/meme/img?seed=zuozhu&backgroundColor=bce3c5', category: '动漫', tags: '动漫,二次元', sort: 89 },
      { title: '小樱-怪力', image_url: '/api/meme/img?seed=xiaoying&backgroundColor=ffc8dd', category: '动漫', tags: '动漫,二次元', sort: 90 },
      { title: '柯南-真相', image_url: '/api/meme/img?seed=conan&backgroundColor=b6e3f4', category: '动漫', tags: '动漫,二次元', sort: 91 },
      { title: '哆啦A梦-竹蜻蜓', image_url: '/api/meme/img?seed=doraemon&backgroundColor=ffd5dc', category: '动漫', tags: '动漫,二次元', sort: 92 },
      { title: '蜡笔小新-大象', image_url: '/api/meme/img?seed=xiaoxin&backgroundColor=c0aede', category: '动漫', tags: '动漫,二次元', sort: 93 },
      { title: '海贼旗-骷髅', image_url: '/api/meme/img?seed=jolly&backgroundColor=ffdfbf', category: '动漫', tags: '动漫,二次元', sort: 94 },
      { title: '一护-卍解', image_url: '/api/meme/img?seed=yihu&backgroundColor=d1d4f9', category: '动漫', tags: '动漫,二次元', sort: 95 },
      { title: '路飞-四档', image_url: '/api/meme/img?seed=lufei2&backgroundColor=f0d5a8', category: '动漫', tags: '动漫,二次元', sort: 96 },
      { title: '乔巴-驯鹿', image_url: '/api/meme/img?seed=choba&backgroundColor=a8d8ea', category: '动漫', tags: '动漫,二次元', sort: 97 },
      { title: '罗宾-花花', image_url: '/api/meme/img?seed=luobin&backgroundColor=eaac8b', category: '动漫', tags: '动漫,二次元', sort: 98 },
      { title: '弗兰奇-super', image_url: '/api/meme/img?seed=franky&backgroundColor=bce3c5', category: '动漫', tags: '动漫,二次元', sort: 99 },
      { title: '山治-踢', image_url: '/api/meme/img?seed=shanzhi&backgroundColor=ffc8dd', category: '动漫', tags: '动漫,二次元', sort: 100 },
      { title: '周杰伦-哎哟不错', image_url: '/api/meme/img?seed=zhoujielun&backgroundColor=b6e3f4', category: '明星', tags: '明星,名人', sort: 101 },
      { title: '张学友-吔屎', image_url: '/api/meme/img?seed=zhangxueyou&backgroundColor=ffd5dc', category: '明星', tags: '明星,名人', sort: 102 },
      { title: '姚明-笑哭', image_url: '/api/meme/img?seed=yaoming&backgroundColor=c0aede', category: '明星', tags: '明星,名人', sort: 103 },
      { title: '李云龙-你他娘', image_url: '/api/meme/img?seed=liyunlong&backgroundColor=ffdfbf', category: '明星', tags: '明星,名人', sort: 104 },
      { title: '金馆长-笑', image_url: '/api/meme/img?seed=jinguanzhang&backgroundColor=d1d4f9', category: '明星', tags: '明星,名人', sort: 105 },
      { title: '花泽香菜-微笑', image_url: '/api/meme/img?seed=xiangcai&backgroundColor=f0d5a8', category: '明星', tags: '明星,名人', sort: 106 },
      { title: '特朗普-懂王', image_url: '/api/meme/img?seed=trump&backgroundColor=a8d8ea', category: '明星', tags: '明星,名人', sort: 107 },
      { title: '拜登-瞌睡', image_url: '/api/meme/img?seed=baideng&backgroundColor=eaac8b', category: '明星', tags: '明星,名人', sort: 108 },
      { title: '马保国-闪电鞭', image_url: '/api/meme/img?seed=mabaoguo&backgroundColor=bce3c5', category: '明星', tags: '明星,名人', sort: 109 },
      { title: '局座-战略忽悠', image_url: '/api/meme/img?seed=juzuo&backgroundColor=ffc8dd', category: '明星', tags: '明星,名人', sort: 110 },
      { title: '葛优-躺', image_url: '/api/meme/img?seed=geyou&backgroundColor=b6e3f4', category: '明星', tags: '明星,名人', sort: 111 },
      { title: '岳云鹏-五环', image_url: '/api/meme/img?seed=yueyunpeng&backgroundColor=ffd5dc', category: '明星', tags: '明星,名人', sort: 112 },
      { title: '沈腾-你过来', image_url: '/api/meme/img?seed=shenteng&backgroundColor=c0aede', category: '明星', tags: '明星,名人', sort: 113 },
      { title: '贾玲-吃货', image_url: '/api/meme/img?seed=jialing&backgroundColor=ffdfbf', category: '明星', tags: '明星,名人', sort: 114 },
      { title: '迪丽热巴-比心', image_url: '/api/meme/img?seed=dilireba&backgroundColor=d1d4f9', category: '明星', tags: '明星,名人', sort: 115 },
      { title: '古力娜扎-美', image_url: '/api/meme/img?seed=gulina&backgroundColor=f0d5a8', category: '明星', tags: '明星,名人', sort: 116 },
      { title: '刘亦菲-仙女', image_url: '/api/meme/img?seed=liuyifei&backgroundColor=a8d8ea', category: '明星', tags: '明星,名人', sort: 117 },
      { title: '吴京-中国', image_url: '/api/meme/img?seed=wujing&backgroundColor=eaac8b', category: '明星', tags: '明星,名人', sort: 118 },
      { title: '黄渤-影帝', image_url: '/api/meme/img?seed=huangbo&backgroundColor=bce3c5', category: '明星', tags: '明星,名人', sort: 119 },
      { title: '徐峥-光头', image_url: '/api/meme/img?seed=xuzheng&backgroundColor=ffc8dd', category: '明星', tags: '明星,名人', sort: 120 },
      { title: '你真的太棒了', image_url: '/api/meme/img?seed=zhenbang&backgroundColor=b6e3f4', category: '文字', tags: '文字,梗', sort: 121 },
      { title: '我全都要', image_url: '/api/meme/img?seed=quandouyao&backgroundColor=ffd5dc', category: '文字', tags: '文字,梗', sort: 122 },
      { title: '你这说的什么话', image_url: '/api/meme/img?seed=shuohua&backgroundColor=c0aede', category: '文字', tags: '文字,梗', sort: 123 },
      { title: '听我说谢谢你', image_url: '/api/meme/img?seed=xiexieni&backgroundColor=ffdfbf', category: '文字', tags: '文字,梗', sort: 124 },
      { title: '格局', image_url: '/api/meme/img?seed=geju&backgroundColor=d1d4f9', category: '文字', tags: '文字,梗', sort: 125 },
      { title: '啊对对对', image_url: '/api/meme/img?seed=aduia&backgroundColor=f0d5a8', category: '文字', tags: '文字,梗', sort: 126 },
      { title: '你说得对', image_url: '/api/meme/img?seed=nishuo&backgroundColor=a8d8ea', category: '文字', tags: '文字,梗', sort: 127 },
      { title: '我听不懂', image_url: '/api/meme/img?seed=tingbudong&backgroundColor=eaac8b', category: '文字', tags: '文字,梗', sort: 128 },
      { title: '你好骚啊', image_url: '/api/meme/img?seed=nihaosao&backgroundColor=bce3c5', category: '文字', tags: '文字,梗', sort: 129 },
      { title: '我哭了', image_url: '/api/meme/img?seed=wokule&backgroundColor=ffc8dd', category: '文字', tags: '文字,梗', sort: 130 },
      { title: '你也是', image_url: '/api/meme/img?seed=niyeshi&backgroundColor=b6e3f4', category: '文字', tags: '文字,梗', sort: 131 },
      { title: '笑死', image_url: '/api/meme/img?seed=xiaosi&backgroundColor=ffd5dc', category: '文字', tags: '文字,梗', sort: 132 },
      { title: '好家伙', image_url: '/api/meme/img?seed=haojiahuo&backgroundColor=c0aede', category: '文字', tags: '文字,梗', sort: 133 },
      { title: '绝了', image_url: '/api/meme/img?seed=juele&backgroundColor=ffdfbf', category: '文字', tags: '文字,梗', sort: 134 },
      { title: '牛批', image_url: '/api/meme/img?seed=niupi&backgroundColor=d1d4f9', category: '文字', tags: '文字,梗', sort: 135 },
      { title: '牛逼克拉斯', image_url: '/api/meme/img?seed=niubikl&backgroundColor=f0d5a8', category: '文字', tags: '文字,梗', sort: 136 },
      { title: '老铁666', image_url: '/api/meme/img?seed=laotie&backgroundColor=a8d8ea', category: '文字', tags: '文字,梗', sort: 137 },
      { title: '没毛病', image_url: '/api/meme/img?seed=meimaobing&backgroundColor=eaac8b', category: '文字', tags: '文字,梗', sort: 138 },
      { title: '稳了', image_url: '/api/meme/img?seed=wenle&backgroundColor=bce3c5', category: '文字', tags: '文字,梗', sort: 139 },
      { title: '起飞', image_url: '/api/meme/img?seed=qifei&backgroundColor=ffc8dd', category: '文字', tags: '文字,梗', sort: 140 },
      { title: '宝宝-委屈', image_url: '/api/meme/img?seed=baby1&backgroundColor=b6e3f4', category: '萌娃', tags: '萌娃,可爱,宝宝', sort: 141 },
      { title: '宝宝-大笑', image_url: '/api/meme/img?seed=baby2&backgroundColor=ffd5dc', category: '萌娃', tags: '萌娃,可爱,宝宝', sort: 142 },
      { title: '宝宝-发呆', image_url: '/api/meme/img?seed=baby3&backgroundColor=c0aede', category: '萌娃', tags: '萌娃,可爱,宝宝', sort: 143 },
      { title: '宝宝-睡觉', image_url: '/api/meme/img?seed=baby4&backgroundColor=ffdfbf', category: '萌娃', tags: '萌娃,可爱,宝宝', sort: 144 },
      { title: '宝宝-吃手', image_url: '/api/meme/img?seed=baby5&backgroundColor=d1d4f9', category: '萌娃', tags: '萌娃,可爱,宝宝', sort: 145 },
      { title: '宝宝-生气', image_url: '/api/meme/img?seed=baby6&backgroundColor=f0d5a8', category: '萌娃', tags: '萌娃,可爱,宝宝', sort: 146 },
      { title: '宝宝-好奇', image_url: '/api/meme/img?seed=baby7&backgroundColor=a8d8ea', category: '萌娃', tags: '萌娃,可爱,宝宝', sort: 147 },
      { title: '宝宝-害怕', image_url: '/api/meme/img?seed=baby8&backgroundColor=eaac8b', category: '萌娃', tags: '萌娃,可爱,宝宝', sort: 148 },
      { title: '宝宝-开心', image_url: '/api/meme/img?seed=baby9&backgroundColor=bce3c5', category: '萌娃', tags: '萌娃,可爱,宝宝', sort: 149 },
      { title: '宝宝-疑惑', image_url: '/api/meme/img?seed=baby10&backgroundColor=ffc8dd', category: '萌娃', tags: '萌娃,可爱,宝宝', sort: 150 },
      { title: '菜狗', image_url: '/api/meme/img?seed=caigou&backgroundColor=b6e3f4', category: '游戏', tags: '游戏,电竞', sort: 151 },
      { title: '大神带带', image_url: '/api/meme/img?seed=dashen&backgroundColor=ffd5dc', category: '游戏', tags: '游戏,电竞', sort: 152 },
      { title: '躺赢', image_url: '/api/meme/img?seed=tangying&backgroundColor=c0aede', category: '游戏', tags: '游戏,电竞', sort: 153 },
      { title: '五杀', image_url: '/api/meme/img?seed=wusha&backgroundColor=ffdfbf', category: '游戏', tags: '游戏,电竞', sort: 154 },
      { title: '超神', image_url: '/api/meme/img?seed=chaoshen&backgroundColor=d1d4f9', category: '游戏', tags: '游戏,电竞', sort: 155 },
      { title: 'GG', image_url: '/api/meme/img?seed=gg&backgroundColor=f0d5a8', category: '游戏', tags: '游戏,电竞', sort: 156 },
      { title: '挂机', image_url: '/api/meme/img?seed=guaji&backgroundColor=a8d8ea', category: '游戏', tags: '游戏,电竞', sort: 157 },
      { title: '演员', image_url: '/api/meme/img?seed=yanyuan&backgroundColor=eaac8b', category: '游戏', tags: '游戏,电竞', sort: 158 },
      { title: '小学生', image_url: '/api/meme/img?seed=xiaoxuesheng&backgroundColor=bce3c5', category: '游戏', tags: '游戏,电竞', sort: 159 },
      { title: '网卡了', image_url: '/api/meme/img?seed=wangkale&backgroundColor=ffc8dd', category: '游戏', tags: '游戏,电竞', sort: 160 },
      { title: '祖安人', image_url: '/api/meme/img?seed=zuan&backgroundColor=b6e3f4', category: '游戏', tags: '游戏,电竞', sort: 161 },
      { title: '队友呢', image_url: '/api/meme/img?seed=duiyou&backgroundColor=ffd5dc', category: '游戏', tags: '游戏,电竞', sort: 162 },
      { title: '救一下', image_url: '/api/meme/img?seed=jiuyixia&backgroundColor=c0aede', category: '游戏', tags: '游戏,电竞', sort: 163 },
      { title: 'nice', image_url: '/api/meme/img?seed=nice1&backgroundColor=ffdfbf', category: '游戏', tags: '游戏,电竞', sort: 164 },
      { title: '芜湖起飞', image_url: '/api/meme/img?seed=wuhu&backgroundColor=d1d4f9', category: '游戏', tags: '游戏,电竞', sort: 165 },
      { title: '我C', image_url: '/api/meme/img?seed=woc&backgroundColor=f0d5a8', category: '游戏', tags: '游戏,电竞', sort: 166 },
      { title: '666', image_url: '/api/meme/img?seed=liuliuliu&backgroundColor=a8d8ea', category: '游戏', tags: '游戏,电竞', sort: 167 },
      { title: '秀儿', image_url: '/api/meme/img?seed=xiuer&backgroundColor=eaac8b', category: '游戏', tags: '游戏,电竞', sort: 168 },
      { title: '下饭', image_url: '/api/meme/img?seed=xiafan&backgroundColor=bce3c5', category: '游戏', tags: '游戏,电竞', sort: 169 },
      { title: '饱了', image_url: '/api/meme/img?seed=baole&backgroundColor=ffc8dd', category: '游戏', tags: '游戏,电竞', sort: 170 },
      { title: '真香', image_url: '/api/meme/img?seed=zhenxiang&backgroundColor=b6e3f4', category: '影视', tags: '影视,名场面', sort: 171 },
      { title: '我全都要', image_url: '/api/meme/img?seed=quandouyao2&backgroundColor=ffd5dc', category: '影视', tags: '影视,名场面', sort: 172 },
      { title: '我养你', image_url: '/api/meme/img?seed=yangni&backgroundColor=c0aede', category: '影视', tags: '影视,名场面', sort: 173 },
      { title: '好嗨哦', image_url: '/api/meme/img?seed=haohai&backgroundColor=ffdfbf', category: '影视', tags: '影视,名场面', sort: 174 },
      { title: '雨女无瓜', image_url: '/api/meme/img?seed=yunv&backgroundColor=d1d4f9', category: '影视', tags: '影视,名场面', sort: 175 },
      { title: '我信你个鬼', image_url: '/api/meme/img?seed=xinguigui&backgroundColor=f0d5a8', category: '影视', tags: '影视,名场面', sort: 176 },
      { title: '请你喝茶', image_url: '/api/meme/img?seed=hecha2&backgroundColor=a8d8ea', category: '影视', tags: '影视,名场面', sort: 177 },
      { title: '我太难了', image_url: '/api/meme/img?seed=ainanle2&backgroundColor=eaac8b', category: '影视', tags: '影视,名场面', sort: 178 },
      { title: '咱也不知道', image_url: '/api/meme/img?seed=yebuzhidao&backgroundColor=bce3c5', category: '影视', tags: '影视,名场面', sort: 179 },
      { title: '咱也不敢问', image_url: '/api/meme/img?seed=yebuganwen&backgroundColor=ffc8dd', category: '影视', tags: '影视,名场面', sort: 180 },
      { title: '妙啊', image_url: '/api/meme/img?seed=miao&backgroundColor=b6e3f4', category: '影视', tags: '影视,名场面', sort: 181 },
      { title: '这就很离谱', image_url: '/api/meme/img?seed=zhejiu&backgroundColor=ffd5dc', category: '影视', tags: '影视,名场面', sort: 182 },
      { title: '老铁没毛病', image_url: '/api/meme/img?seed=laotie2&backgroundColor=c0aede', category: '影视', tags: '影视,名场面', sort: 183 },
      { title: '盘他', image_url: '/api/meme/img?seed=panta&backgroundColor=ffdfbf', category: '影视', tags: '影视,名场面', sort: 184 },
      { title: '来了老弟', image_url: '/api/meme/img?seed=laoled&backgroundColor=d1d4f9', category: '影视', tags: '影视,名场面', sort: 185 },
      { title: '手动狗头', image_url: '/api/meme/img?seed=shoudong&backgroundColor=f0d5a8', category: '影视', tags: '影视,名场面', sort: 186 },
      { title: '前方高能', image_url: '/api/meme/img?seed=gaoneng&backgroundColor=a8d8ea', category: '影视', tags: '影视,名场面', sort: 187 },
      { title: '这不科学', image_url: '/api/meme/img?seed=kexue&backgroundColor=eaac8b', category: '影视', tags: '影视,名场面', sort: 188 },
      { title: '我读书少', image_url: '/api/meme/img?seed=dushushao&backgroundColor=bce3c5', category: '影视', tags: '影视,名场面', sort: 189 },
      { title: '你这么牛', image_url: '/api/meme/img?seed=zhemeniu&backgroundColor=ffc8dd', category: '影视', tags: '影视,名场面', sort: 190 },
    ];
    const ins = db.prepare('INSERT INTO memes (title, image_url, category, tags, sort_order) VALUES (?, ?, ?, ?, ?)');
    for (const m of seedMemes) {
      await ins.run(m.title, m.image_url, m.category, m.tags, m.sort);
    }
    console.log('[Database] 190 memes seeded (or reseeded).');
  }

  console.log('[Database] 23 tables initialized.');
  return db;
}

async function insertArticleIfNotExists(db, article, author = 'Scraper') {
  if (!article || !article.slug) { console.warn('[DB] insertArticleIfNotExists: invalid article (missing slug)'); return null; }
  if (!article.title || typeof article.title !== 'string') { console.warn('[DB] insertArticleIfNotExists: invalid article (missing title)'); return null; }
  const existing = await db.prepare('SELECT id FROM articles WHERE slug = ?').get(article.slug);
  if (existing) return null;
  await db.prepare(
    'INSERT INTO articles (title, slug, excerpt, content, cover_image, author, category, tags, is_published, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())'
  ).run(
    article.title, article.slug,
    article.excerpt || '', article.content || '',
    article.cover_image || '', author,
    article.category || '', article.tags || ''
  );
  return article;
}

module.exports = { initDatabase, insertArticleIfNotExists };
