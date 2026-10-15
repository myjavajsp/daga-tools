const { Router } = require('express');

module.exports = function rssRouter(db) {
  const router = Router();

  router.get('/rss', async (req, res) => {
    try {
      const rows = await db.prepare(
        'SELECT title, slug, excerpt, author, category, published_at FROM articles WHERE is_published = 1 ORDER BY published_at DESC LIMIT 50'
      ).all() || [];

      const siteUrl = 'https://www.ityvip.xyz';
      const items = rows.map(a => {
        const pubDate = a.published_at ? new Date(a.published_at).toUTCString() : new Date().toUTCString();
        return `    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${siteUrl}/recommend/${a.slug}</link>
      <guid isPermaLink="true">${siteUrl}/recommend/${a.slug}</guid>
      <description><![CDATA[${a.excerpt || a.title}]]></description>
      <author>${a.author || '全民影视'}</author>
      <category>${a.category || '影视'}</category>
      <pubDate>${pubDate}</pubDate>
    </item>`;
      }).join('\n');

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>全民影视 - 影视推荐</title>
    <link>${siteUrl}</link>
    <description>精选电影、电视剧、动漫、AI工具等推荐内容，每周更新</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/api/rss" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

      res.set('Content-Type', 'application/rss+xml; charset=utf-8');
      res.set('Cache-Control', 'public, max-age=1800');
      res.send(xml);
    } catch (err) {
      console.error('[rss]', err.message);
      res.status(500).send('Server Error');
    }
  });

  return router;
};