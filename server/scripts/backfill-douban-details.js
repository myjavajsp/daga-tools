require('dotenv').config();
const { initDatabase } = require('../database');
const douban = require('../scraper/douban');

async function backfill() {
  const db = await initDatabase();
  const rows = await db.prepare("SELECT id, slug, title, excerpt, cover_image FROM articles WHERE slug LIKE 'douban-%'").all();
  console.log('[backfill] douban articles:', rows.length);

  let done = 0, failed = 0, skipped = 0;
  const workers = Array(3).fill(0);
  let i = 0;

  async function worker() {
    while (i < rows.length) {
      const row = rows[i++];
      const m = String(row.slug).match(/^douban-(\d+)$/);
      if (!m) { skipped++; continue; }
      const id = m[1];
      try {
        const detail = await douban.fetchDetail(id);
        if (!detail.desc && (!detail.reviews || detail.reviews.length === 0)) { failed++; continue; }
        const name = String(row.title).replace(/ - 豆瓣[\d.]+分$/, '');
        const ratingMatch = String(row.title).match(/豆瓣([\d.]+)分/);
        const rating = ratingMatch ? ratingMatch[1] : '';
        const votesMatch = String(row.excerpt).match(/(\d+)\s*人评价/);
        const votes = votesMatch ? votesMatch[1] : '';
        const content = douban.buildContent({ title: name, rating, votes, img: row.cover_image, id }, detail);
        await db.prepare('UPDATE articles SET content = ? WHERE id = ?').run(content, row.id);
        done++;
        console.log('  + ' + row.title);
      } catch (e) {
        failed++;
        console.log('  - ' + row.title + ' (' + e.message + ')');
      }
    }
  }

  await Promise.all(workers.map(worker));
  console.log('[backfill] done:', done, 'failed:', failed, 'skipped:', skipped);
  process.exit(0);
}

backfill().catch(e => { console.error('Fatal:', e); process.exit(1); });
