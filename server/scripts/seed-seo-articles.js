const { SITE_URL } = require('../utils');

function makeSlug(text) {
  return text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

const articleTemplates = [
  {
    gen: (tool, title, tags) => ({
      title: `${title}使用教程：从入门到精通`,
      excerpt: `详细介绍${title}的功能和使用方法，帮助您快速掌握${tags.split(',')[0]}相关的各种操作技巧。`,
      category: '工具教程',
      tags: tags + ',教程,使用指南',
    }),
  },
  {
    gen: (tool, title, tags) => ({
      title: `${title}常见问题解答（FAQ）`,
      excerpt: `汇总${title}的常见使用问题及详细解答，帮您解决${tags.split(',')[0]}过程中遇到的各种问题。`,
      category: '工具教程',
      tags: tags + ',常见问题,FAQ',
    }),
  },
  {
    gen: (tool, title, tags) => ({
      title: `${title}的5个实用技巧`,
      excerpt: `分享${title}的5个实用技巧，让您更高效地完成${tags.split(',')[0]}任务。`,
      category: '工具技巧',
      tags: tags + ',使用技巧,效率工具',
    }),
  },
  {
    gen: (tool, title, tags) => ({
      title: `2025年最好的${tags.split(',')[0]}工具推荐：${title}评测`,
      excerpt: `全面评测${title}，分析其在${tags.split(',')[0]}场景下的表现，帮助您判断是否适合您的需求。`,
      category: '工具评测',
      tags: tags + ',评测,推荐',
    }),
  },
  {
    gen: (tool, title, tags) => ({
      title: `为什么${title}是${tags.split(',')[0]}的最佳选择？`,
      excerpt: `深入分析${title}在${tags.split(',')[0]}领域的优势，与其他同类工具对比，帮您做出最佳选择。`,
      category: '工具对比',
      tags: tags + ',对比,选择指南',
    }),
  },
  {
    gen: (tool, title, tags) => ({
      title: `${title}在线免费使用 - 无需下载安装`,
      excerpt: `${title}完全免费在线使用，无需注册下载，打开浏览器即可完成${tags.split(',')[0]}操作。`,
      category: '免费工具',
      tags: tags + ',免费,在线工具',
    }),
  },
];

function buildContent(slug, toolTitle, tags, templateIdx) {
  const toolUrl = `${SITE_URL}/tools/${slug}`;
  const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
  const firstTag = tagList[0] || '工具';

  const sections = [
    {
      heading: '功能简介',
      body: `<p><strong>${toolTitle}</strong> 是一款免费在线${firstTag}工具，无需下载安装，在浏览器中即可直接使用。无论您是专业人士还是普通用户，都能通过简单的操作快速完成${firstTag}任务。</p>`,
    },
    {
      heading: '主要功能',
      body: `<ul>
<li><strong>在线使用</strong>：无需安装任何软件，打开浏览器即可使用</li>
<li><strong>完全免费</strong>：所有功能永久免费，无隐藏收费</li>
<li><strong>操作简单</strong>：界面简洁直观，上手即用</li>
<li><strong>无需注册</strong>：打开即用，无需注册账号</li>
<li><strong>安全可靠</strong>：文件处理在浏览器本地完成，不上传服务器</li>
</ul>`,
    },
    {
      heading: '使用步骤',
      body: `<ol>
<li>打开 <a href="${toolUrl}">${toolTitle}</a> 页面</li>
<li>根据页面提示上传文件或输入内容</li>
<li>选择需要的处理选项</li>
<li>点击执行按钮，等待处理完成</li>
<li>下载处理后的结果文件</li>
</ol>`,
    },
    {
      heading: '适用场景',
      body: `<p>${toolTitle} 适用于以下场景：</p><ul>
${tagList.slice(0, 4).map(t => `<li>需要进行${t}操作的用户</li>`).join('\n')}
<li>需要快速在线处理文件而无需安装软件</li>
<li>在移动设备上随时随地进行${firstTag}</li>
</ul>`,
    },
    {
      heading: '总结',
      body: `<p>${toolTitle} 是一款实用的在线${firstTag}工具，免费、易用、高效。立即体验 <a href="${toolUrl}">${toolTitle}</a>，感受在线${firstTag}的便捷。</p>`,
    },
  ];

  if (templateIdx === 1) {
    sections.splice(1, 0, {
      heading: '常见问题',
      body: `<div class="faq"><h4>Q：${toolTitle} 收费吗？</h4><p>A：完全免费，所有功能均可免费使用。</p><h4>Q：需要注册账号吗？</h4><p>A：不需要，打开页面即可直接使用。</p><h4>Q：我的文件会上传到服务器吗？</h4><p>A：大部分处理在浏览器本地完成，文件不会上传到服务器。</p><h4>Q：支持哪些浏览器？</h4><p>A：支持 Chrome、Firefox、Edge、Safari 等主流浏览器。</p></div>`,
    });
  }

  return sections.map(s => `<h2>${s.heading}</h2>\n${s.body}`).join('\n');
}

async function generateSeoArticles(db) {
  const { TOOL_TAGS, TOOL_SLUG_TITLES } = require('../routes/seo');
  const { insertArticleIfNotExists } = require('../database');

  let count = 0;
  for (const [slug, tags] of Object.entries(TOOL_TAGS)) {
    const fullTitle = TOOL_SLUG_TITLES[slug] || slug;
    const toolName = fullTitle.split(' - ')[0];
    const toolUrl = `${SITE_URL}/tools/${slug}`;
    const existing = await db.prepare('SELECT id FROM articles WHERE slug LIKE ?').get(`seo-${slug}-%`);
    if (existing) continue;

    const tpl = articleTemplates[Math.floor(Math.random() * articleTemplates.length)];
    const meta = tpl.gen(slug, toolName, tags);
    const articleSlug = `seo-${slug}-${makeSlug(meta.title).slice(0, 40)}`;
    const content = buildContent(slug, toolName, tags, articleTemplates.indexOf(tpl));

    const inserted = await insertArticleIfNotExists(db, { title: meta.title, slug: articleSlug, excerpt: meta.excerpt, content, category: meta.category, tags: meta.tags, cover_image: '' }, 'SEO');
    if (!inserted) continue;
    count++;
    console.log(`[SEO] Generated: ${meta.title}`);

    const domain = SITE_URL.replace(/^https?:\/\//, '');
    const token = process.env.BAIDU_TOKEN || '';
    if (token) {
      const articleUrl = `${SITE_URL}/recommend/${articleSlug}`;
      fetch(`http://data.zz.baidu.com/urls?site=${domain}&token=` + encodeURIComponent(token), {
        method: 'POST', body: articleUrl,
        headers: { 'Content-Type': 'text/plain' },
        signal: AbortSignal.timeout(5000),
      }).catch(() => {});
    }
  }
  return count;
}

module.exports = { generateSeoArticles };
