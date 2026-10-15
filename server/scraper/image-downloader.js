const fs = require('fs');
const path = require('path');
const { SITE_URL } = require('../utils');

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads', 'covers');

function ensureDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

async function downloadImage(url, filename) {
  if (!url || url.startsWith('/')) return url;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let referer = `${SITE_URL}/`;
    if (url.includes('douban')) referer = 'https://movie.douban.com/';
    else if (url.includes('wikimedia')) referer = 'https://zh.wikipedia.org/';

    const resp = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Referer': referer },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!resp.ok) return url;

    const buffer = Buffer.from(await resp.arrayBuffer());
    const ext = resp.headers.get('content-type')?.split('/')[1] || 'jpg';
    const localFile = `${filename}.${ext}`;
    const localPath = path.join(UPLOAD_DIR, localFile);

    fs.writeFileSync(localPath, buffer);
    return `/uploads/covers/${localFile}`;
  } catch {
    return url;
  }
}

async function fetchOgImage(url) {
  if (!url || url.startsWith('/')) return '';
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!resp.ok) return '';
    const html = await resp.text();
    const m = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"[^>]*>/i)
           || html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"[^>]*>/i);
    return m ? m[1] : '';
  } catch {
    return '';
  }
}

async function processArticleImages(article) {
  ensureDir();
  const slug = article.slug || 'img';

  // Try fetch og:image from source URL to replace generic placeholder logos
  if (article.source_url) {
    const og = await fetchOgImage(article.source_url);
    if (og) article.cover_image = og;
  }

  // Download cover_image
  if (article.cover_image) {
    article.cover_image = await downloadImage(article.cover_image, `${slug}-cover`);
  }

  // Download content images
  if (article.content) {
    const imgRegex = /<img[^>]*src="(https?:\/\/[^"]+)"[^>]*>/gi;
    let match;
    let idx = 0;
    const replacements = [];
    while ((match = imgRegex.exec(article.content)) !== null) {
      const originalUrl = match[1];
      if (originalUrl.includes('ityvip.xyz') || originalUrl.includes('localhost')) continue;
      const localUrl = await downloadImage(originalUrl, `${slug}-${idx}`);
      replacements.push({ from: originalUrl, to: localUrl });
      idx++;
    }
    for (const r of replacements) {
      article.content = article.content.replace(r.from, r.to);
    }
  }

  return article;
}

module.exports = { processArticleImages };
