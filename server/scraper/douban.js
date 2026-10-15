function decodeEntities(s) {
  return String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&#34;/g, '"')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function strip(s) {
  return decodeEntities((s || '').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}
const { escapeHtml } = require('../utils');

const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';

function mapLimit(list, limit, fn) {
  const results = new Array(list.length);
  let i = 0;
  const workers = Array(Math.max(1, Math.min(limit, list.length)))
    .fill(0)
    .map(async () => {
      while (i < list.length) {
        const idx = i++;
        results[idx] = await fn(list[idx]);
      }
    });
  return Promise.all(workers).then(() => results);
}

async function fetchDetail(id) {
  try {
    const r = await fetch(`https://m.douban.com/movie/subject/${id}/`, {
      headers: { 'User-Agent': MOBILE_UA, 'Referer': 'https://m.douban.com/', 'Accept-Language': 'zh-CN,zh;q=0.9' },
      signal: AbortSignal.timeout(12000),
    });
    if (!r.ok) return {};
    const h = await r.text();
    const descMatch = h.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/);
    let desc = descMatch ? descMatch[1] : '';
    desc = desc.replace(/^[^：]*豆瓣评分：[0-9.]+ 简介：/, '');

    const reviews = [];
    const reviewRe = /<p[^>]*class="[^"]*abstract[^"]*"[^>]*>([\s\S]*?)<\/p>/g;
    let m;
    while ((m = reviewRe.exec(h)) !== null) {
      const t = strip(m[1]);
      if (t && t.length >= 10) reviews.push(t);
      if (reviews.length >= 3) break;
    }

    return { desc, reviews };
  } catch { return {}; }
}

function buildContent({ title, rating, votes, img, id }, detail = {}) {
  const safeTitle = escapeHtml(strip(title));
  const safeRating = escapeHtml(strip(rating));
  const safeVotes = escapeHtml(strip(votes));
  const safeImg = img ? escapeHtml(strip(img)) : '';
  const safeDesc = escapeHtml(strip(detail.desc));
  const parts = [
    '<h2>' + safeTitle + '</h2>',
    '<p><strong>豆瓣评分：' + safeRating + '</strong>（' + safeVotes + ' 人评价）</p>',
  ];
  if (safeImg) {
    parts.push('<img src="' + safeImg + '" alt="' + safeTitle + '" style="max-width:100%;height:auto;margin:16px 0;border-radius:8px" />');
  }
  if (safeDesc) {
    parts.push('<h3>剧情简介</h3>');
    parts.push('<p>' + safeDesc + '</p>');
  }
  for (const rv of (detail.reviews || []).slice(0, 3)) {
    parts.push('<blockquote>' + escapeHtml(strip(rv)) + '</blockquote>');
  }
  parts.push('<p><a href="https://movie.douban.com/subject/' + id + '/" target="_blank" rel="nofollow">豆瓣电影详情页 →</a></p>');
  return parts.join('\n');
}

exports.fetch = async function () {
  const r = await fetch('https://movie.douban.com/chart', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) throw new Error('Douban chart: ' + r.status);
  const html = await r.text();

  const blocks = html.split('<tr class="item">');
  blocks.shift();

  const items = [];

  for (const block of blocks) {
    const endIdx = block.indexOf('</tr>');
    if (endIdx === -1) continue;
    const item = block.slice(0, endIdx);

    const idMatch = item.match(/href="https:\/\/movie\.douban\.com\/subject\/(\d+)\//);
    if (!idMatch) continue;
    const id = idMatch[1];

    const imgMatch = item.match(/<img[^>]*src="([^"]+)"[^>]*>/);
    let img = imgMatch ? imgMatch[1] : '';
    if (img && img.startsWith('//')) img = 'https:' + img;
    else if (img && img.startsWith('/')) img = 'https://movie.douban.com' + img;

    const titleMatch = item.match(/<div\s+class="pl2">[\s\S]*?<a[^>]*>\s*([^<]+?)\s*(?:\/\s*<|$)/);
    const title = titleMatch ? strip(titleMatch[1]) : '';

    const ratingMatch = item.match(/rating_nums[^>]*>([\d.]+)</);
    const rating = ratingMatch ? ratingMatch[1] : '0';

    const votesMatch = item.match(/pl">\((\d+)人评价\)/);
    const votes = votesMatch ? votesMatch[1] : '0';

    if (!title || !id) continue;

    items.push({ id, img, title, rating, votes });
  }

  const details = await mapLimit(items, 4, async (it) => {
    const d = await fetchDetail(it.id);
    return Object.assign({}, it, d);
  });

  const articles = [];
  for (const it of details) {
    const slug = 'douban-' + it.id;
    const excerpt = '豆瓣评分 ' + it.rating + '，' + it.votes + ' 人评价';
    articles.push({
      title: it.title + ' - 豆瓣' + it.rating + '分',
      slug: slug,
      excerpt: excerpt,
      content: buildContent({ title: it.title, rating: it.rating, votes: it.votes, img: it.img, id: it.id }, it),
      cover_image: it.img,
      source_url: 'https://movie.douban.com/subject/' + it.id + '/',
      category: '电影推荐',
      tags: '电影,豆瓣,高分,评分',
    });
  }

  return articles;
};

exports.fetchDetail = fetchDetail;
exports.buildContent = buildContent;
