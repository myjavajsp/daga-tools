function escapeHtml(s) {
  if (typeof s !== 'string') return String(s);
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

exports.fetch = async function () {
  const content = `<h2>2025 年免费资源大全 — 图床 / API / AI 工具合集</h2>

<p>整理了一些高质量的免费资源，适合开发者和创作者日常使用。</p>

<h3>🖼 免费图床</h3>
<table>
<thead><tr><th>名称</th><th>特点</th><th>备注</th></tr></thead>
<tbody>
<tr><td><strong>Imgur</strong></td><td>老牌图床，支持外链</td><td>国内访问不稳定</td></tr>
<tr><td><strong>SM.MS</strong></td><td>简单好用，支持 API</td><td>免费 5GB</td></tr>
<tr><td><strong>GitHub Issues</strong></td><td>无限空间，稳定</td><td>需 GitHub 账号</td></tr>
<tr><td><strong>Cloudinary</strong></td><td>支持图片处理 CDN</td><td>免费 25GB 存储</td></tr>
<tr><td><strong>ImgBB</strong></td><td>无需注册，直接上传</td><td>单张 32MB 限制</td></tr>
</tbody>
</table>

<h3>🔌 免费 API</h3>
<table>
<thead><tr><th>分类</th><th>名称</th><th>简介</th></tr></thead>
<tbody>
<tr><td>AI</td><td><strong>OpenAI API</strong></td><td>GPT 模型，免费额度 $5</td></tr>
<tr><td>AI</td><td><strong>Anthropic Claude</strong></td><td>Claude 3 模型 API</td></tr>
<tr><td>翻译</td><td><strong>Google Translate</strong></td><td>免费翻译 API（基础版）</td></tr>
<tr><td>翻译</td><td><strong>DeepL</strong></td><td>高质量翻译，免费 50 万字符/月</td></tr>
<tr><td>天气</td><td><strong>OpenWeatherMap</strong></td><td>天气数据 API</td></tr>
<tr><td>IP</td><td><strong>ip-api.com</strong></td><td>IP 地理位置查询</td></tr>
<tr><td>图片</td><td><strong>Unsplash</strong></td><td>高质量免费图库 API</td></tr>
<tr><td>视频</td><td><strong>YouTube Data API</strong></td><td>视频信息/搜索</td></tr>
</tbody>
</table>

<h3>🤖 免费 AI 工具</h3>
<table>
<thead><tr><th>工具</th><th>类别</th><th>简介</th></tr></thead>
<tbody>
<tr><td><strong>ChatGPT</strong></td><td>对话 AI</td><td>OpenAI 聊天机器人</td></tr>
<tr><td><strong> Claude</strong></td><td>对话 AI</td><td>Anthropic 出品</td></tr>
<tr><td><strong>DeepSeek</strong></td><td>对话 AI</td><td>国产免费大模型</td></tr>
<tr><td><strong>Stable Diffusion</strong></td><td>图片生成</td><td>开源文生图</td></tr>
<tr><td><strong>Midjourney</strong></td><td>图片生成</td><td>高质量 AI 绘画</td></tr>
<tr><td><strong>Hugging Face</strong></td><td>模型平台</td><td>开源模型社区</td></tr>
<tr><td><strong>Perplexity</strong></td><td>AI 搜索</td><td>AI 搜索引擎</td></tr>
<tr><td><strong>剪映</strong></td><td>视频编辑</td><td>抖音旗下免费剪辑</td></tr>
</tbody>
</table>

<h3>📦 其他实用资源</h3>
<ul>
<li><strong>Font Awesome</strong> — 免费图标库（2000+ 图标）</li>
<li><strong>Google Fonts</strong> — 免费网页字体</li>
<li><strong>Vercel / Netlify</strong> — 免费静态网站托管</li>
<li><strong>Cloudflare</strong> — 免费 CDN + DNS + DDoS 防护</li>
<li><strong>Railway / Render</strong> — 免费后端托管（有限额）</li>
<li><strong>MongoDB Atlas</strong> — 免费 512MB 数据库</li>
<li><strong>Supabase</strong> — 免费 PostgreSQL 数据库</li>
</ul>
<p>💡 提示：以上资源大多有免费额度限制，使用时请注意查看官方计费政策。</p>`;

  return [{
    title: '2025 免费资源大全：图床 / API / AI 工具 / 开发资源',
    slug: 'free-resources-2025-image-hosting-api-ai-tools',
    excerpt: '整理了免费的图床、API、AI 工具和开发资源合集，涵盖 Imgur、OpenAI、Stable Diffusion、Cloudflare 等 30+ 实用资源。',
    content,
    cover_image: 'https://www.ityvip.xyz/vite.svg',
    source_url: 'https://github.com/awesome-selfhosted/awesome-selfhosted',
    category: 'AI工具推荐',
    tags: '免费资源,图床,API,AI工具,开发,合集',
  }];
};
