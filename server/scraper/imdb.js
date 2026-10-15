function escapeHtml(s) {
  if (typeof s !== 'string') return String(s);
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const WIKI = 'https://zh.wikipedia.org/w/api.php';
const UA = 'MTCScraper/1.0';

async function wikiFetch(params) {
  const url = WIKI + '?origin=*&format=json&' + new URLSearchParams(params).toString();
  const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(10000) });
  if (!r.ok) throw new Error(`Wiki ${r.status}`);
  return r.json();
}

async function getPageImages(pageIds) {
  if (pageIds.length === 0) return {};
  const data = await wikiFetch({ action: 'query', prop: 'images', pageids: pageIds.join('|'), imlimit: '50' });
  const result = {};
  for (const [id, page] of Object.entries(data?.query?.pages || {})) {
    const images = (page.images || []).map(i => i.title);
    const filtered = images.filter(t => !t.includes('.svg') && !t.includes('Flag') && !t.includes('Conversion'));
    const poster = filtered.find(t => t.includes('Poster') || t.includes('海报') || t.includes('劇照'));
    result[id] = poster || filtered[0] || null;
  }
  return result;
}

async function getImageUrls(imageTitles) {
  const titles = [...new Set(imageTitles.filter(Boolean))];
  if (titles.length === 0) return {};
  const data = await wikiFetch({ action: 'query', prop: 'imageinfo', titles: titles.join('|'), iiprop: 'url', iiurlwidth: '300' });
  const result = {};
  for (const [id, page] of Object.entries(data?.query?.pages || {})) {
    const info = page.imageinfo?.[0];
    if (info) result[page.title] = info.url || info.thumburl || '';
  }
  return result;
}

async function wikiSearch(query, limit = 10) {
  const data = await wikiFetch({ action: 'query', generator: 'search', prop: 'extracts', exintro: '1', exchars: '200', gsrsearch: query, gsrlimit: String(limit) });
  let pages = Object.values(data?.query?.pages || {})
    .filter(p => p.title && p.extract)
    .sort((a, b) => (a.index || 0) - (b.index || 0));

  // Get images
  const pageIds = pages.map(p => p.pageid);
  const pageImages = await getPageImages(pageIds);
  const imageUrlMap = await getImageUrls(Object.values(pageImages));

  return pages.map(p => ({
    title: p.title,
    excerpt: p.extract.replace(/<[^>]+>/g, '').slice(0, 180),
    image: imageUrlMap[pageImages[p.pageid]] || '',
    pageid: p.pageid,
  }));
}

function makeArticle(items, type, category, slugPrefix) {
  if (!items || items.length === 0) return null;
  const date = new Date().toISOString().slice(0, 10);
  const top = items.slice(0, 10);

  const cards = top.map((m, i) => {
    const imgHtml = m.image
      ? `<img src="${escapeHtml(m.image)}" alt="${escapeHtml(m.title)}" style="width:100%;aspect-ratio:2/3;object-fit:cover;background:#f0f0f0;border-radius:8px;margin-bottom:8px" />`
      : `<div style="width:100%;aspect-ratio:2/3;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:8px;margin-bottom:8px;display:flex;align-items:center;justify-content:center;color:white;font-size:40px;font-weight:bold">${escapeHtml(m.title.charAt(0))}</div>`;
    return `<div style="background:#f9fafb;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
  ${imgHtml}
  <div style="padding:10px">
    <strong style="font-size:14px;display:block;margin-bottom:4px">${i + 1}. ${escapeHtml(m.title)}</strong>
    <p style="font-size:12px;color:#666;margin:0;line-height:1.5">${escapeHtml(m.excerpt.slice(0, 120))}</p>
  </div>
</div>`;
  }).join('\n');

  const names = top.map(m => m.title).join('、');

  return {
    cover_image: top[0]?.image || '',
    title: `本周热门${type}推荐（${date}）`,
    slug: `${slugPrefix}-${date}`,
    excerpt: `本周热门${type}推荐：${names.slice(0, 80)}。`,
    content: `<h2>🎬 本周热门${type}推荐</h2>
<p>📋 以下是本周值得关注的${type}精选列表，附各作品海报。</p>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin:20px 0">
${cards}
</div>
<p>📅 更新日期：${date}</p>`,
    source_url: `https://zh.wikipedia.org/wiki/${encodeURIComponent(top[0]?.title || '')}`,
    category,
    tags: `${category},热门,每周`,
  };
}

exports.fetch = async function () {
  const articles = [];

  try {
    const pages = await wikiSearch('2026年电影', 10);
    const a = makeArticle(pages, '电影', '电影推荐', 'trending-movies');
    if (a) articles.push(a);
  } catch (e) { console.warn('  [movies] Error:', e.message); }

  try {
    const pages = await wikiSearch('2026年电视剧', 10);
    const a = makeArticle(pages, '剧集', '电视剧推荐', 'trending-tv');
    if (a) articles.push(a);
  } catch (e) { console.warn('  [tv] Error:', e.message); }

  return articles;
};
