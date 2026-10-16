
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');
if (!process.env.DB_PASSWORD) {
  console.error('[FATAL] DB_PASSWORD environment variable not set');
  process.exit(1);
}
(async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'daga',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'daga_clone',
    waitForConnections: true,
    connectionLimit: 2,
  });
  const [result] = await pool.query(
    "UPDATE memes SET image_url = REPLACE(image_url, ?, ?) WHERE image_url LIKE ?",
    ['https://api.dicebear.com/7.x/fun-emoji/svg?seed=', '/api/meme/img?seed=', 'https://api.dicebear.com/%']
  );
  console.log('Updated:', result.affectedRows, 'rows');
  const [rows] = await pool.query("SELECT image_url FROM memes LIMIT 1");
  console.log('Sample:', rows[0].image_url);
  await pool.end();
})().catch(e => { console.error(e.message); process.exit(1); });
