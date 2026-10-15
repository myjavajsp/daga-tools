function escapeHtml(s) {
  if (typeof s !== 'string') return String(s);
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

exports.fetch = async function () {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const since = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, '0')}-${String(weekAgo.getDate()).padStart(2, '0')}`;

  const r = await fetch(
    `https://api.github.com/search/repositories?q=created:>=${since}&sort=stars&order=desc&per_page=25`,
    {
      headers: {
        'User-Agent': 'MTCScraper/1.0',
        'Accept': 'application/vnd.github.v3+json',
      },
      signal: AbortSignal.timeout(10000),
    }
  );
  if (!r.ok) throw new Error(`GitHub API: ${r.status}`);
  const data = await r.json();
  const repos = (data.items || []).map(item => ({
    owner: item.owner ? item.owner.login : '',
    name: item.name,
    desc: item.description || '',
    lang: item.language || '',
    stars: String(item.stargazers_count || 0),
    forks: String(item.forks_count || 0),
    url: item.html_url,
  }));

  if (repos.length === 0) return [];

  const rows = repos.map((r, i) => `<tr><td>${i + 1}</td><td><a href="${escapeHtml(r.url)}" target="_blank" rel="nofollow">${escapeHtml(r.owner)}/${escapeHtml(r.name)}</a></td><td>${escapeHtml(r.lang)}</td><td>${r.stars}</td><td>${escapeHtml(r.desc)}</td></tr>`).join('\n');

  const content = `<h2>GitHub 趋势项目排行 — ${dateStr}</h2>
<p>📊 今日 GitHub 开源项目趋势榜，按 Stars 增长排序。</p>
<table>
<thead><tr><th>#</th><th>项目</th><th>语言</th><th>Stars</th><th>简介</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<p>数据来源：<a href="https://github.com/trending" target="_blank" rel="nofollow">GitHub Trending →</a></p>`;

  const slug = `github-trending-${dateStr}`;
  const excerpt = `今日 GitHub 热门开源项目：${repos.slice(0, 5).map(r => `${r.owner}/${r.name}`).join('、')} 等 ${repos.length} 个项目`;

  return [{
    title: `GitHub 趋势项目 — ${dateStr}`,
    slug,
    excerpt,
    content,
    cover_image: 'https://github.githubassets.com/assets/github-logo-55c5b9a1fe52.png',
    source_url: 'https://github.com/trending',
    category: 'AI工具推荐',
    tags: 'GitHub,开源,趋势,开发',
  }];
};
