/**
 * daga-clone — server/database.js
 * SQLite 数据库（sql.js — 纯 JS 实现，无需原生编译）
 *
 * 提供一个兼容 better-sqlite3 API 的包装层：
 *   db.prepare(sql).all([...params])
 *   db.prepare(sql).get(...params)
 *   db.prepare(sql).run(...params)
 *   db.exec(sql)
 */

const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'database.db');

/* ── Statement 包装类 ─────────────────────────── */

class Statement {
  /**
   * @param {import('sql.js').Database} sqlDb
   * @param {string} sql
   */
  constructor(sqlDb, sql) {
    this._db = sqlDb;
    this._sql = sql;
    this._stmt = null;
  }

  _ensurePrepared() {
    if (!this._stmt) {
      this._stmt = this._db.prepare(this._sql);
    }
  }

  /**
   * 执行查询，返回所有行（对象数组）
   * 用法同 better-sqlite3: stmt.all() 或 stmt.all(p1, p2, ...)
   */
  all(...params) {
    this._ensurePrepared();
    if (params.length > 0) this._stmt.bind(params);
    const rows = [];
    while (this._stmt.step()) {
      rows.push(this._stmt.getAsObject());
    }
    this._stmt.free();
    this._stmt = null;
    return rows;
  }

  /**
   * 执行查询，返回第一行（对象），无结果则返回 undefined
   * 用法同 better-sqlite3: stmt.get(p1, p2, ...)
   */
  get(...params) {
    this._ensurePrepared();
    if (params.length > 0) this._stmt.bind(params);
    let row = undefined;
    if (this._stmt.step()) {
      row = this._stmt.getAsObject();
    }
    this._stmt.free();
    this._stmt = null;
    return row;
  }

  /**
   * 执行 INSERT/UPDATE/DELETE
   * 用法同 better-sqlite3: stmt.run(p1, p2, ...)
   */
  run(...params) {
    this._ensurePrepared();
    this._stmt.bind(params);
    this._stmt.step();
    this._stmt.free();
    this._stmt = null;
    return { changes: this._db.getRowsModified() };
  }
}

/* ── Database 包装类 ──────────────────────────── */

class Database {
  constructor(sqlDb, filePath) {
    this._db = sqlDb;
    this._filePath = filePath;
  }

  prepare(sql) {
    return new Statement(this._db, sql);
  }

  /** 执行原始 SQL（无参数，用于 DDL / PRAGMA） */
  exec(sql) {
    this._db.run(sql);
  }

  /** 开启事务 */
  transaction(fn) {
    return (...args) => {
      this._db.run('BEGIN TRANSACTION');
      try {
        const result = fn(...args);
        this._db.run('COMMIT');
        return result;
      } catch (e) {
        this._db.run('ROLLBACK');
        throw e;
      }
    };
  }

  /** 持久化到磁盘 */
  save() {
    const data = this._db.export();
    const buffer = Buffer.from(data);
    const dir = path.dirname(this._filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this._filePath, buffer);
  }

  /** 获取原始 sql.js Database 实例 */
  getNative() {
    return this._db;
  }

  /** 执行原生 SQL 并返回 sql.js 格式结果（用于 last_insert_rowid 等） */
  rawExec(sql) {
    return this._db.exec(sql);
  }

  /** 获取最近一次 INSERT 的 rowid */
  lastInsertId() {
    const result = this._db.exec('SELECT last_insert_rowid() as id');
    if (result.length > 0 && result[0].values.length > 0) {
      return result[0].values[0][0];
    }
    return -1;
  }
}

/* ── 初始化 ───────────────────────────────────── */

/**
 * 异步初始化数据库，创建表和返回包装后的 db 实例。
 * 在 server/index.js 启动前调用。
 */
async function initDatabase() {
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();

  let sqlDb;
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    sqlDb = new SQL.Database(buffer);
    console.log(`[Database] Loaded existing database from ${DB_PATH}`);
  } else {
    sqlDb = new SQL.Database();
    console.log('[Database] Created new in-memory database');
  }

  const db = new Database(sqlDb, DB_PATH);

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS parse_interfaces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      type TEXT DEFAULT 'video',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      position TEXT NOT NULL,
      name TEXT,
      code TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS recommend_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon_url TEXT,
      link_url TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS guide_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      step_number INTEGER NOT NULL,
      content TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS page_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      pv INTEGER DEFAULT 0,
      uv INTEGER DEFAULT 0,
      UNIQUE(date)
    );

    CREATE TABLE IF NOT EXISTS visitor_ips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      ip TEXT NOT NULL,
      UNIQUE(date, ip)
    );
  `);

  db.save();
  console.log('[Database] 9 tables initialized.');
  return db;
}

module.exports = { initDatabase };
