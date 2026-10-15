const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

function escapeHtml(s) {
  if (typeof s !== 'string') return String(s);
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

async function fetchTrending() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const sinceDate = threeDaysAgo.toISOString().slice(0, 10);

  const q = `stars:>100+pushed:>${sinceDate}`;
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=10`;

  const resp = await fetch(url, { headers: { 'User-Agent': 'daga-clone/1.0', 'Accept': 'application/vnd.github.v3+json' }, signal: AbortSignal.timeout(15000) });
  if (!resp.ok) throw new Error(`GitHub API responded ${resp.status}`);

  const data = await resp.json();
  const repos = (data.items || []).slice(0, 10);

  if (repos.length === 0) throw new Error('No repos found');

  const title = `GitHub 今日热门项目 Top 10 - ${dateStr}`;
  const slug = `github-trending-${dateStr}`;

  const excerpt = `每日精选 GitHub 上最热门的 10 个开源项目，涵盖 AI、前端、后端、DevOps 等领域，今日榜单共收录 ${
    repos.map(r => r.full_name).join('、')
  } 等热门项目。`;

  const itemsHtml = repos.map((r, i) => {
    const lang = r.language ? `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#${languageColor(r.language)};margin-right:4px;vertical-align:middle"></span> ${r.language}` : '';
    const license = r.license ? r.license.spdx_id : '';
    return `<div style="background:#f9fafb;border-radius:10px;padding:14px;margin:10px 0;border:1px solid #e5e7eb">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
    <span style="font-weight:700;color:#6b7280;font-size:14px">#${i + 1}</span>
    <a href="${r.html_url}" style="font-weight:600;color:#1d4ed8;text-decoration:none;font-size:15px" target="_blank" rel="noopener">${escapeHtml(r.full_name)}</a>
  </div>
  <p style="margin:4px 0 8px;color:#374151;font-size:14px;line-height:1.5">${escapeHtml(r.description || '暂无描述')}</p>
  <div style="display:flex;gap:16px;font-size:12px;color:#6b7280;flex-wrap:wrap">
    ${lang ? `<span>⭐ ${r.stargazers_count.toLocaleString()} stars</span>` : `<span>⭐ ${r.stargazers_count.toLocaleString()} stars</span>`}
    <span>⑂ ${r.forks_count.toLocaleString()} forks</span>
    ${lang ? `<span>${lang}</span>` : ''}
    ${license ? `<span>${license}</span>` : ''}
    <span>🔄 ${r.open_issues_count} issues</span>
  </div>
</div>`;
  }).join('\n');

  const content = `<h2>🔥 GitHub 今日热门项目</h2>
<p>每日为您精选 GitHub 上最受关注的 10 个开源项目，数据来源于 GitHub Trending 和 GitHub Search API，按 Star 增长排序。</p>
<p>更新时间：${dateStr} | 共收录 ${data.total_count || repos.length} 个符合条件的项目</p>

${itemsHtml}

<h2>📊 项目分类概览</h2>
<ul>
${renderCategorySummary(repos)}
</ul>

<h2>💡 推荐关注</h2>
<p>如果您对开源项目感兴趣，建议关注以下方向：</p>
<ul>
<li><strong>AI / 机器学习</strong>：大模型工具、AI Agent 框架、LLM 应用持续火热</li>
<li><strong>前端 / UI 库</strong>：React、Vue、Svelte 生态的新工具和组件库</li>
<li><strong>开发者工具</strong>：CLI 工具、代码质量、CI/CD 相关项目</li>
<li><strong>云原生 / DevOps</strong>：Kubernetes 相关工具、容器化部署方案</li>
</ul>

<p style="color:#9ca3af;font-size:12px;margin-top:20px">数据来源：<a href="https://github.com/trending" target="_blank" rel="noopener">GitHub Trending</a> | 自动生成于 ${new Date().toLocaleString('zh-CN')}</p>`;

  return [{
    title,
    slug,
    excerpt,
    content,
    cover_image: 'https://github.githubassets.com/assets/github-logo-55c5b9a1fe52.png',
    source_url: 'https://github.com/trending',
    category: '开源项目',
    tags: 'GitHub,开源项目,Trending,热门项目,每日推荐',
  }];
}

function languageColor(lang) {
  const colors = {
    JavaScript: 'f1e05a', TypeScript: '3178c6', Python: '3572A5', Go: '00ADD8',
    Rust: 'dea584', Java: 'b07219', C: '555555', 'C++': 'f34b7d', Ruby: '701516',
    Swift: 'F05138', Kotlin: 'A97BFF', Dart: '00B4AB', Shell: '89e051',
    HTML: 'e34c26', CSS: '563d7c', Vue: '41b883', Scala: 'c22d40', Lua: '000080',
    PHP: '4F5D95', Haskell: '5e5086', Elixir: '4e2a59', Clojure: 'db5855',
    R: '198CE7', Perl: '0298c3', Zig: 'ec915c', Nix: '7e7efd', Solidity: 'AA6746',
  };
  return colors[lang] || '6b7280';
}

function renderCategorySummary(repos) {
  const cats = {};
  for (const r of repos) {
    const topics = (r.topics || []).length > 0 ? r.topics.slice(0, 3).join(', ') : (r.language || '其他');
    if (!cats[topics]) cats[topics] = [];
    cats[topics].push(r.full_name);
  }
  const desc = {
    'AI': '人工智能和机器学习相关项目',
    'javascript': 'JavaScript 前端/后端项目',
    'python': 'Python 生态项目',
    'rust': 'Rust 系统编程项目',
    'go': 'Go 语言项目',
    'typescript': 'TypeScript 类型安全项目',
  };
  return Object.entries(cats).map(([topic, repos]) => {
    const d = Object.entries(desc).find(([k]) => topic.toLowerCase().includes(k));
    return `<li><strong>${topic}</strong>：${d ? d[1] : '开源项目'} — ${repos.join('、')}</li>`;
  }).join('\n');
}

exports.fetch = fetchTrending;
