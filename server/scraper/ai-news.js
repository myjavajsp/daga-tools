function escapeHtml(s) {
  if (typeof s !== 'string') return String(s);
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

async function fetchHN() {
  try {
    const r = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', { signal: AbortSignal.timeout(10000) });
    if (!r.ok) return [];
    const ids = (await r.json()).slice(0, 30);
    const stories = (await Promise.allSettled(ids.map(id =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { signal: AbortSignal.timeout(10000) }).then(x => x.json())
    ))).map(p => p.status === 'fulfilled' ? p.value : null).filter(Boolean);

    const aiKeywords = /gpt|chatgpt|openai|claude|anthropic|deepseek|llm|llama|mistral|gemini|ai\s|machine learning|neural|transformer|diffusion|rag|agent/i;
    return stories
      .filter(s => s && s.type === 'story' && s.title && aiKeywords.test(s.title))
      .slice(0, 5)
      .map(s => ({
        title: s.title.replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"'),
        url: s.url || `https://news.ycombinator.com/item?id=${s.id}`,
        points: s.score || 0,
      }));
  } catch { return []; }
}

async function fetchArxiv() {
  try {
    const r = await fetch('https://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending&max_results=5', { signal: AbortSignal.timeout(10000) });
    if (!r.ok) return [];
    const xml = await r.text();

    const entries = [];
    const entryRe = /<entry>[\s\S]*?<\/entry>/gi;
    let m;
    while ((m = entryRe.exec(xml)) !== null) {
      const e = m[0];
      const t = stripTags((e.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || ['', ''])[1]);
      const a = (e.match(/<id[^>]*>([\s\S]*?)<\/id>/i) || ['', ''])[1];
      entries.push({ title: t.replace(/\n/g, ' '), url: a });
    }
    return entries;
  } catch { return []; }
}

async function fetchV2EX() {
  try {
    const r = await fetch('https://www.v2ex.com/api/v2/topics/hot', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) return [];
    const data = await r.json();
    return (data || []).slice(0, 5).map(t => ({
      title: t.title || t.title_zh,
      url: `https://www.v2ex.com/t/${t.id}`,
    }));
  } catch { return []; }
}

exports.fetch = async function () {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const [hn, arxiv, v2ex] = await Promise.all([fetchHN(), fetchArxiv(), fetchV2EX()]);

  let content = `<h2>AI 行业日报 — ${dateStr}</h2>
<p>每日 AI 行业动态、热门论文和技术趋势汇总。以下内容自动聚合自 Hacker News、arXiv 和 V2EX 等社区。</p>`;

  if (hn.length > 0) {
    content += `<h3>🔥 Hacker News 热门 AI 讨论</h3><ul>`;
    for (const item of hn) {
      content += `<li><a href="${escapeHtml(item.url)}" target="_blank" rel="nofollow">${escapeHtml(item.title)}</a> <span style="color:#888;font-size:0.9em">(👍 ${item.points} 人点赞)</span></li>`;
    }
    content += `</ul><p>以上为 Hacker News 社区中讨论最热的 AI 相关话题，点击标题查看完整讨论。</p>`;
  }

  if (arxiv.length > 0) {
    content += `<h3>📄 最新 AI 论文（arXiv）</h3><ul>`;
    for (const paper of arxiv) {
      content += `<li><a href="${escapeHtml(paper.url)}" target="_blank" rel="nofollow">${escapeHtml(paper.title)}</a></li>`;
    }
    content += `</ul><p>以上为 arXiv 最新提交的 AI/机器学习论文，点击标题阅读全文。</p>`;
  }

  if (v2ex.length > 0) {
    content += `<h3>💬 V2EX 热门讨论</h3><ul>`;
    for (const item of v2ex) {
      content += `<li><a href="${escapeHtml(item.url)}" target="_blank" rel="nofollow">${escapeHtml(item.title)}</a></li>`;
    }
    content += `</ul><p>以上为 V2EX 社区热门话题。</p>`;
  }

  if (hn.length === 0 && arxiv.length === 0 && v2ex.length === 0) {
    content += `<p>今日暂无数据更新。</p>`;
  }

  content += `<p style="color:#888;font-size:0.85em">📡 数据来源：Hacker News、arXiv、V2EX · 自动聚合，仅供参考</p>`;

  const excerpt = `AI 行业日报 ${dateStr}：${hn.length > 0 ? hn.map(h => h.title).join('、').slice(0, 100) + '...' : '暂无数据'}`;

  return [{
    title: `AI 行业日报 — ${dateStr}`,
    slug: `ai-daily-${dateStr}`,
    excerpt,
    content,
    cover_image: 'https://cdn-icons-png.flaticon.com/512/8623/8623823.png',
    source_url: 'https://news.ycombinator.com/',
    category: 'AI工具推荐',
    tags: 'AI,日报,行业动态,arXiv,HackerNews',
  }];
};
