function extractXml(text, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  const matches = [];
  let m;
  while ((m = re.exec(text)) !== null) matches.push(m[1].trim());
  return matches;
}

function extractFirst(text, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = re.exec(text);
  return m ? m[1].trim() : '';
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function escapeHtml(s) {
  if (typeof s !== 'string') return String(s);
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

exports.fetch = async function () {
  const url = 'https://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending&max_results=10';
  const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!r.ok) throw new Error(`ArXiv: ${r.status}`);
  const xml = await r.text();

  const entries = extractXml(xml, 'entry');
  const articles = [];

  for (const entry of entries) {
    const title = stripTags(extractFirst(entry, 'title')).replace(/\n/g, ' ');
    const summary = stripTags(extractFirst(entry, 'summary')).replace(/\n/g, ' ');
    let link = extractFirst(entry, 'id');
    if (link.startsWith('http://')) link = 'https://' + link.slice(7);
    const published = extractFirst(entry, 'published');
    const authors = extractXml(entry, 'author').map(a => stripTags(extractFirst(a, 'name')));

    const slug = 'arxiv-' + link.split('/').pop();
    const excerpt = summary.length > 200 ? summary.slice(0, 200) + '...' : summary;
    const authorStr = authors.join(', ');

    const safeTitle = escapeHtml(title);
    const safeAuthor = escapeHtml(authorStr);
    const safeSummary = escapeHtml(summary);
    const safeLink = escapeHtml(link);
    const content = `<h2>${safeTitle}</h2>
<p>📄 <strong>作者：</strong>${safeAuthor} | <strong>发布时间：</strong>${published}</p>
<h3>论文摘要</h3>
<p>${safeSummary}</p>
<p>🔗 阅读全文：<a href="${safeLink}" target="_blank" rel="nofollow">arXiv.org →</a></p>`;

    articles.push({
      title,
      slug,
      excerpt,
      content: content + `<p>📊 相关领域：人工智能、机器学习 | 📅 发布日期：${published}</p>`,
      source_url: link,
      cover_image: 'https://arxiv.org/static/browse/0.3.4/images/arxiv-logo.svg',
      category: 'AI论文',
      tags: 'AI,论文,arXiv,学术研究,人工智能',
    });
  }

  return articles;
};
