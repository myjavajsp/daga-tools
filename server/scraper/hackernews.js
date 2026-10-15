function escapeHtml(s) {
  if (typeof s !== 'string') return String(s);
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const KEYWORDS = {
  strict: [
    /\bgpt[-\s]?\d*\b/i, /\bchatgpt\b/i, /\bopenai\b/i, /\bclaude\b/i, /\banthropic\b/i,
    /\bdeepseek\b/i, /\bllm\b/i, /\blarge language model/i, /\bstable diffusion\b/i,
    /\bcopilot\b/i, /\bcursor\b/i, /\bgemini\b/i, /\bmistral\b/i, /\bllama\b/i,
    /\bgen[-\s]?ai\b/i, /\brag\b/i, /\bmultimodal\b/i,
  ],
  loose: [
    /\bartificial intelligence\b/i, /\bmachine learning\b/i, /\bdeep learning\b/i,
    /\bneural network\b/i, /\btransformer\b/i, /\bdiffusion\b/i,
    /\bvision model\b/i, /\bai[\s-]?(tool|agent|model|system|research|news|powered|driven)\b/i,
    /\bai\s+assistant\b/i, /\bai\s+coding\b/i, /\bai\s+generated?\b/i,
  ],
};

function score(title) {
  const t = title.toLowerCase();
  let s = 0;
  for (const re of KEYWORDS.strict) if (re.test(t)) s += 2;
  for (const re of KEYWORDS.loose) if (re.test(t)) s += 1;
  return s;
}

const HN_API = 'https://hacker-news.firebaseio.com/v0';

async function fetchItem(id) {
  const r = await fetch(`${HN_API}/item/${id}.json`, { signal: AbortSignal.timeout(10000) });
  if (!r.ok) throw new Error(`HN item ${id}: ${r.status}`);
  return r.json();
}

exports.fetch = async function () {
  const r = await fetch(`${HN_API}/topstories.json`, { signal: AbortSignal.timeout(10000) });
  if (!r.ok) throw new Error(`HN topstories: ${r.status}`);
  const ids = await r.json();

  const top100 = ids.slice(0, 100);
  const stories = (await Promise.allSettled(top100.map(fetchItem)))
    .map(p => p.status === 'fulfilled' ? p.value : null)
    .filter(Boolean);

  const aiStories = stories
    .filter(s => s && s.type === 'story' && s.title && score(s.title) >= 2)
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  const articles = aiStories.slice(0, 10).map(story => {
    const title = story.title.replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"');
    const hnUrl = `https://news.ycombinator.com/item?id=${story.id}`;
    const points = story.score || 0;
    const by = story.by || 'anonymous';
    const excerpt = story.text
      ? story.text.replace(/<[^>]+>/g, '').slice(0, 200)
      : `Hacker News 热门讨论「${title}」，${points} 人点赞，作者 ${by}。`;
    const safeTitle = escapeHtml(title);
    const safeBy = escapeHtml(by);
    const origUrl = story.url || hnUrl;
    const safeUrl = escapeHtml(origUrl);
    const content = `<h2>${safeTitle}</h2>
<p>📰 Hacker News 热门 AI 讨论 | <strong>${points}</strong> 人点赞 | 作者 <strong>${safeBy}</strong></p>
<h3>讨论概要</h3>
<p>这篇在 Hacker News 上获得 <strong>${points} 分</strong>的帖子引发了开发者社区的广泛讨论，内容涉及 AI/ML 领域的最新进展和行业趋势。</p>
${story.text ? `<blockquote>${story.text.replace(/<[^>]+>/g, '').slice(0, 1000)}</blockquote>` : ''}
<p>📎 原文链接：<a href="${safeUrl}" target="_blank" rel="nofollow">${safeUrl}</a></p>
<p>💬 HN 讨论：<a href="${hnUrl}" target="_blank" rel="nofollow">${hnUrl}</a></p>
<h3>核心信息</h3>
<ul>
<li>💡 话题：${safeTitle}</li>
<li>⭐ 社区热度：${points} 分（高分反映高质量讨论）</li>
<li>👤 发布者：${safeBy}</li>
<li>🔗 原文：<a href="${safeUrl}" target="_blank" rel="nofollow">查看原文</a></li>
</ul>`;
    const slug = `hn-${story.id}`;
    return { title, slug, excerpt, content, source_url: origUrl, cover_image: 'https://news.ycombinator.com/y18.svg', category: 'AI工具推荐', tags: 'AI,news,HackerNews,技术讨论' };
  });

  return articles;
};
