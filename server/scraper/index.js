require('dotenv').config();
const { initDatabase, insertArticleIfNotExists } = require('../database');
const { processArticleImages } = require('./image-downloader');
const { SITE_URL } = require('../utils');

const SOURCES = {
  hackernews: () => require('./hackernews').fetch(),
  arxiv: () => require('./arxiv').fetch(),
  imdb: () => require('./imdb').fetch(),
  dgxspark: () => require('./dgxspark').fetch(),
  'github-trending': () => require('./github-trending').fetch(),
  douban: () => require('./douban').fetch(),
  github: () => require('./github').fetch(),
  freebies: () => require('./freebies').fetch(),
  'ai-news': () => require('./ai-news').fetch(),
};

async function run() {
  const args = process.argv.slice(2);
  const target = args[0];

  console.log('[' + new Date().toISOString() + '] Scraper starting...');
  const db = await initDatabase();

  const sources = target ? { [target]: SOURCES[target] } : SOURCES;

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const [name, fetchFn] of Object.entries(sources)) {
    if (!fetchFn) { console.warn(`  Unknown source: ${name}`); continue; }
    console.log(`\n[${name}] Fetching...`);
    try {
      const articles = await fetchFn();
      console.log(`[${name}] Got ${articles.length} articles`);
      for (const article of articles) {
        // Download images before inserting
        try {
          await processArticleImages(article);
        } catch (e) {
          console.warn(`  [img] ${e.message}`);
        }
        const inserted = await insertArticleIfNotExists(db, article);
        if (!inserted) {
          totalSkipped++;
          continue;
        }
        totalInserted++;
        const domain = SITE_URL.replace(/^https?:\/\//, '');
        const token = process.env.BAIDU_TOKEN || '';
        if (token) {
          fetch(`https://data.zz.baidu.com/urls?site=${domain}&token=` + encodeURIComponent(token), { method: 'POST', body: `${SITE_URL}/recommend/${article.slug}`, headers: { 'Content-Type': 'text/plain' }, signal: AbortSignal.timeout(5000) }).then(r => r.text()).catch(() => {});
        }
        if (article.cover_image && !article.cover_image.startsWith('http')) {
          console.log(`  + ${article.title} (images saved locally)`);
        } else {
          console.log(`  + ${article.title}`);
        }
      }
    } catch (e) {
      console.error(`[${name}] Error:`, e.message);
    }
  }

  console.log(`\nDone. Inserted: ${totalInserted}, Skipped (existing): ${totalSkipped}`);
  process.exit(0);
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });
