const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'daga',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'daga_clone',
  charset: 'utf8mb4',
};

function esc(s) { return s; }

const ARTICLES = [
  {
    slug: 'free-online-image-tools-collection',
    title: '10个免费在线图片处理工具推荐 - 压缩/裁剪/去背景/水印',
    category: '图片工具',
    tags: '图片工具,免费在线工具,图片压缩,图片裁剪,去背景,去水印,图片处理,图片编辑,在线PS',
    content: `<h2>10个免费在线图片处理工具推荐</h2>
<p>本文整理了本站最好用的10个在线图片处理工具，全部免费使用，无需注册，在浏览器中直接完成，保护你的隐私安全。</p>
<h3>1. 图片压缩工具</h3>
<p>在线压缩 JPG、PNG、WebP 图片文件大小。支持批量压缩、自定义压缩质量，在浏览器本地完成，不上传服务器。适合网站图片优化和邮件附件压缩。<br><a href="https://www.ityvip.xyz/tools/compress">立即使用图片压缩工具 →</a></p>
<h3>2. 图片格式转换</h3>
<p>支持 PNG、JPG、WebP、BMP、ICO 等格式互转。无需安装软件，浏览器端本地转换，批量处理快速高效。<br><a href="https://www.ityvip.xyz/tools/convert">立即使用格式转换工具 →</a></p>
<h3>3. 图片裁剪工具</h3>
<p>自由裁剪和预设比例裁剪。1:1、4:3、16:9、3:2 等比例快速选择，适配社交媒体头像、封面、海报等场景。<br><a href="https://www.ityvip.xyz/tools/crop">立即使用图片裁剪工具 →</a></p>
<h3>4. OCR文字识别</h3>
<p>从图片中提取文字，支持中英文识别。上传截图、扫描件即可快速识别文字内容，完全免费。<br><a href="https://www.ityvip.xyz/tools/ocr">立即使用OCR工具 →</a></p>
<h3>5. 图片水印工具</h3>
<p>给图片添加文字水印，保护图片版权。支持自定义文字内容、字体大小、颜色、透明度、旋转角度和位置。<br><a href="https://www.ityvip.xyz/tools/watermark">立即使用水印工具 →</a></p>
<h3>6. 去水印工具</h3>
<p>框选区域去除图片中的水印和不需要的元素。适合去除简单背景上的文字水印或Logo。<br><a href="https://www.ityvip.xyz/tools/remove-watermark">立即使用去水印工具 →</a></p>
<h3>7. AI去背景工具</h3>
<p>一键自动移除图片背景，基于AI技术精准识别人物、物体轮廓，生成透明背景PNG图片。<br><a href="https://www.ityvip.xyz/tools/image-bg-remove">立即使用去背景工具 →</a></p>
<h3>8. 图片无损放大</h3>
<p>使用AI算法放大图片分辨率，支持2x/3x/4x放大，提升图片清晰度，适合处理模糊老照片。<br><a href="https://www.ityvip.xyz/tools/image-upscaler">立即使用图片放大工具 →</a></p>
<h3>9. 在线PS图片编辑</h3>
<p>在线图片编辑器，支持调色、滤镜、旋转、裁剪、添加文字和涂鸦等功能。无需安装软件。<br><a href="https://www.ityvip.xyz/tools/image-editor">立即使用在线PS →</a></p>
<h3>10. 图片滤镜工具</h3>
<p>给图片添加灰度、怀旧、模糊、浮雕、反色等滤镜效果，浏览器实时处理，一键应用。<br><a href="https://www.ityvip.xyz/tools/image-filters">立即使用图片滤镜 →</a></p>
<p>以上工具全部免费，在浏览器中直接使用。欢迎收藏本页，随时使用！</p>`,
  },
  {
    slug: 'free-online-pdf-tools-collection',
    title: '8个免费在线PDF处理工具推荐 - 合并/压缩/加密/转换',
    category: 'PDF工具',
    tags: 'PDF工具,免费在线工具,PDF合并,PDF压缩,PDF加密,PDF转Word,PDF转图片,PDF解密',
    content: `<h2>8个免费在线PDF处理工具推荐</h2>
<p>PDF文件处理是日常工作学习中常见的需求。本文整理了本站最实用的8个PDF在线处理工具，全部免费，浏览器本地处理，不泄露文件内容。</p>
<h3>1. PDF合并工具</h3>
<p>免费合并多个PDF文件为一个，支持拖拽排序，不限文件数量，浏览器本地处理。<br><a href="https://www.ityvip.xyz/tools/pdf-merge">立即使用PDF合并工具 →</a></p>
<h3>2. PDF拆分工具</h3>
<p>从PDF文件中提取指定页面，支持选择页码范围、提取单页或多页。<br><a href="https://www.ityvip.xyz/tools/pdf-split">立即使用PDF拆分工具 →</a></p>
<h3>3. PDF压缩工具</h3>
<p>优化减小PDF文件大小，智能压缩保留清晰度，适合邮件附件发送。<br><a href="https://www.ityvip.xyz/tools/pdf-compress">立即使用PDF压缩工具 →</a></p>
<h3>4. 图片转PDF</h3>
<p>JPG、PNG、WebP图片转换为PDF，支持多张图片合并为一个PDF文件。<br><a href="https://www.ityvip.xyz/tools/jpg-to-pdf">立即使用图片转PDF工具 →</a></p>
<h3>5. PDF加密工具</h3>
<p>给PDF文件设置密码保护，支持只读密码和编辑权限限制，保护敏感文档安全。<br><a href="https://www.ityvip.xyz/tools/pdf-lock">立即使用PDF加密工具 →</a></p>
<h3>6. PDF解密工具</h3>
<p>移除PDF文件密码保护，快速解锁加密PDF，浏览器端处理不上传服务器。<br><a href="https://www.ityvip.xyz/tools/pdf-unlock">立即使用PDF解密工具 →</a></p>
<h3>7. PDF转图片</h3>
<p>将PDF页面转换为PNG或JPEG图片，保持排版清晰，适合分享。<br><a href="https://www.ityvip.xyz/tools/pdf-to-image">立即使用PDF转图片工具 →</a></p>
<h3>8. PDF转Word</h3>
<p>将PDF文档转换为可编辑的Word文件，保留原始排版格式，方便二次编辑。<br><a href="https://www.ityvip.xyz/tools/pdf-to-word">立即使用PDF转Word工具 →</a></p>
<p>所有PDF工具免费使用，数据在浏览器本地处理，不会上传到服务器，保障文件安全。</p>`,
  },
  {
    slug: 'developer-online-tools-collection',
    title: '15个程序员必备在线开发工具推荐 - 免费开发者工具合集',
    category: '其他工具',
    tags: '开发者工具,在线工具,程序员工具,JSON格式化,正则测试,Base64,SQL格式化,哈希生成,JWT解码,免费工具',
    content: `<h2>15个程序员必备在线开发工具推荐</h2>
<p>开发者日常工作中经常需要各种小工具辅助。本文整理了本站15个最实用的在线开发工具，全部免费，浏览器直接用。</p>
<h3>1. JSON格式化工具</h3>
<p>JSON格式化、压缩、校验、排序和转义，树形查看，API开发调试必备。<br><a href="https://www.ityvip.xyz/tools/json-formatter">立即使用JSON工具 →</a></p>
<h3>2. 正则表达式测试</h3>
<p>实时匹配高亮，支持JavaScript正则语法，保存常用正则，开发调试利器。<br><a href="https://www.ityvip.xyz/tools/regex-tester">立即使用Regex测试 →</a></p>
<h3>3. Base64编解码</h3>
<p>支持UTF-8、Latin-1等字符集，适合处理图片和数据的Base64转换。<br><a href="https://www.ityvip.xyz/tools/base64-tool">立即使用Base64工具 →</a></p>
<h3>4. URL编解码工具</h3>
<p>URL地址编码和解码，处理特殊字符，前端开发必备。<br><a href="https://www.ityvip.xyz/tools/url-encoder">立即使用URL编解码 →</a></p>
<h3>5. HTML实体转换</h3>
<p>HTML特殊字符编码与解码，防止XSS安全漏洞。<br><a href="https://www.ityvip.xyz/tools/html-entity">立即使用HTML实体工具 →</a></p>
<h3>6. SQL格式化工具</h3>
<p>美化格式化SQL语句，支持MySQL、PostgreSQL等多种SQL方言。<br><a href="https://www.ityvip.xyz/tools/sql-formatter">立即使用SQL格式化工具 →</a></p>
<h3>7. 哈希生成工具</h3>
<p>MD5、SHA1、SHA256、SHA384、SHA512哈希值计算，支持文本和文件。<br><a href="https://www.ityvip.xyz/tools/hash-generator">立即使用哈希生成器 →</a></p>
<h3>8. JWT解码工具</h3>
<p>解析JSON Web Token的Header、Payload和Signature，调试认证系统。<br><a href="https://www.ityvip.xyz/tools/jwt-decoder">立即使用JWT解码器 →</a></p>
<h3>9. HTTP状态码查询</h3>
<p>查询所有HTTP状态码的含义，1xx/2xx/3xx/4xx/5xx全系列中文解释。<br><a href="https://www.ityvip.xyz/tools/http-status">立即查询状态码 →</a></p>
<h3>10. 密码强度检测</h3>
<p>检查密码安全级别，评估字符多样性，帮助创建强密码。<br><a href="https://www.ityvip.xyz/tools/password-strength">立即检测密码强度 →</a></p>
<h3>11. CSV/JSON互转</h3>
<p>CSV和JSON格式互相转换，适合数据分析、API开发。<br><a href="https://www.ityvip.xyz/tools/csv-to-json">立即使用CSV/JSON转换 →</a></p>
<h3>12. CSS渐变色生成器</h3>
<p>可视化创建线性渐变和径向渐变，复制CSS代码。<br><a href="https://www.ityvip.xyz/tools/gradient-generator">立即使用渐变色生成器 →</a></p>
<h3>13. CSS阴影生成器</h3>
<p>可视化调整Box Shadow效果，实时预览并复制CSS代码。<br><a href="https://www.ityvip.xyz/tools/box-shadow-generator">立即使用阴影生成器 →</a></p>
<h3>14. 颜色格式转换</h3>
<p>HEX、RGB、HSL、HSV颜色格式互转，设计师前端必备。<br><a href="https://www.ityvip.xyz/tools/color-converter">立即使用颜色转换工具 →</a></p>
<h3>15. 打字速度测试</h3>
<p>测试CPM和WPM打字速度，提高编程打字效率。<br><a href="https://www.ityvip.xyz/tools/typing-speed">立即测试打字速度 →</a></p>
<p>以上工具全部免费，打开浏览器即用。欢迎收藏！</p>`,
  },
  {
    slug: 'free-online-text-tools-collection',
    title: '10个免费在线文本处理工具推荐 - 文字编辑和转换利器',
    category: '文本工具',
    tags: '文本工具,在线文本,字数统计,简繁转换,Markdown编辑,文字转语音,文本对比,免费在线工具',
    content: `<h2>10个免费在线文本处理工具推荐</h2>
<p>日常工作和学习中经常需要处理文本内容，本文整理了本站最实用的10个在线文本工具，助你高效处理文字。</p>
<h3>1. 字数统计工具</h3>
<p>统计文字字数、字符数、段落数和关键词频率，支持中英文混合统计。<br><a href="https://www.ityvip.xyz/tools/word-counter">立即使用字数统计 →</a></p>
<h3>2. 大小写转换工具</h3>
<p>全部大写、全部小写、首字母大写、驼峰式、蛇形式等多种格式一键转换。<br><a href="https://www.ityvip.xyz/tools/case-converter">立即使用大小写转换 →</a></p>
<h3>3. 简繁转换工具</h3>
<p>简体中文和繁体中文互转，兼容港澳台用字习惯。<br><a href="https://www.ityvip.xyz/tools/zh-converter">立即使用简繁转换 →</a></p>
<h3>4. URL编解码</h3>
<p>URL地址编码与解码，处理特殊字符。<br><a href="https://www.ityvip.xyz/tools/url-encoder">立即使用URL编解码 →</a></p>
<h3>5. HTML实体转换</h3>
<p>HTML特殊字符编码与解码。<br><a href="https://www.ityvip.xyz/tools/html-entity">立即使用HTML实体转换 →</a></p>
<h3>6. 文本排序工具</h3>
<p>升序降序排序、去重、反转和打乱文本行，批量处理利器。<br><a href="https://www.ityvip.xyz/tools/text-sort">立即使用文本排序 →</a></p>
<h3>7. 文本对比工具</h3>
<p>比较两段文字差异，高亮显示新增删除和修改，适合文档校对。<br><a href="https://www.ityvip.xyz/tools/text-diff">立即使用文本对比 →</a></p>
<h3>8. Markdown预览</h3>
<p>实时预览Markdown渲染效果，支持各种语法。<br><a href="https://www.ityvip.xyz/tools/markdown-preview">立即使用Markdown编辑器 →</a></p>
<h3>9. Lorem Ipsum生成器</h3>
<p>生成占位文字用于排版和设计，自定义段落数和单词数。<br><a href="https://www.ityvip.xyz/tools/lorem-ipsum">立即使用Lorem Ipsum →</a></p>
<h3>10. 文字转语音工具</h3>
<p>浏览器TTS朗读文字内容，支持中文多语言发音。<br><a href="https://www.ityvip.xyz/tools/text-to-speech">立即使用文字转语音 →</a></p>
<p>所有工具免费使用，无需注册，打开浏览器即可使用。</p>`,
  },
  {
    slug: 'free-online-audio-tools-collection',
    title: '3个免费在线音频处理工具推荐 - MP3/WAV编辑转换',
    category: '音频工具',
    tags: '音频工具,音频剪辑,MP3转换,音频压缩,在线音频,免费工具,音乐编辑',
    content: `<h2>3个免费在线音频处理工具推荐</h2>
<p>音频处理也是常见的需求。本站提供3个实用的在线音频工具，全部免费，浏览器本地处理。</p>
<h3>1. 音频裁剪工具</h3>
<p>裁剪和截取音频片段，支持MP3、WAV、OGG等多种格式，可视化波形图精准选择起止时间，适合制作铃声。<br><a href="https://www.ityvip.xyz/tools/audio-cut">立即使用音频裁剪工具 →</a></p>
<h3>2. 音频格式转换</h3>
<p>MP3、WAV、OGG、AAC、FLAC、M4A等格式互转，高质量转换，浏览器本地处理。<br><a href="https://www.ityvip.xyz/tools/audio-convert">立即使用音频格式转换 →</a></p>
<h3>3. 音频压缩工具</h3>
<p>压缩减小MP3、WAV等音频文件大小，调整比特率和采样率设置。<br><a href="https://www.ityvip.xyz/tools/audio-compress">立即使用音频压缩工具 →</a></p>
<p>以上音频工具全部免费，数据在浏览器本地处理，不上传服务器，保护隐私。</p>`,
  },
  {
    slug: 'daily-online-utilities-collection',
    title: '12个生活办公实用在线工具推荐 - 日期/年龄/单位换算/IP查询',
    category: '其他工具',
    tags: '在线工具,日期计算器,年龄计算器,单位换算,手机号查询,身份证查询,IP查询,二维码生成,在线查询,生活工具',
    content: `<h2>12个生活办公实用在线工具推荐</h2>
<p>除了开发工具，本站还提供了许多实用的生活办公工具，帮你快速解决问题。</p>
<h3>1. 二维码生成器</h3>
<p>自定义生成二维码，支持网址、文本、WiFi信息、名片等，可自定义颜色和Logo。<br><a href="https://www.ityvip.xyz/tools/qr-code-gen">立即生成二维码 →</a></p>
<h3>2. 二维码解码器</h3>
<p>上传二维码图片识别其中内容，快速解析网址、文本等信息。<br><a href="https://www.ityvip.xyz/tools/qr-decoder">立即解码二维码 →</a></p>
<h3>3. ZIP压缩解压</h3>
<p>在线压缩和解压ZIP文件，浏览器端处理，保护文件隐私。<br><a href="https://www.ityvip.xyz/tools/zip-tool">立即使用ZIP工具 →</a></p>
<h3>4. 日期计算器</h3>
<p>计算两个日期相差天数，或指定日期加减天数，适合倒计时和项目规划。<br><a href="https://www.ityvip.xyz/tools/date-calculator">立即使用日期计算器 →</a></p>
<h3>5. 年龄计算器</h3>
<p>根据出生日期计算周岁年龄、生肖和星座。<br><a href="https://www.ityvip.xyz/tools/age-calculator">立即计算年龄 →</a></p>
<h3>6. 单位换算</h3>
<p>长度、重量、温度、面积、体积等多种单位换算。<br><a href="https://www.ityvip.xyz/tools/unit-converter">立即使用单位换算 →</a></p>
<h3>7. 手机号查询</h3>
<p>查询手机号码归属地和运营商信息。<br><a href="https://www.ityvip.xyz/tools/phone-lookup">立即查询手机号 →</a></p>
<h3>8. 身份证查询</h3>
<p>解析中国身份证号码，查询出生日期、性别和户籍所在地。<br><a href="https://www.ityvip.xyz/tools/id-card-lookup">立即查询身份证 →</a></p>
<h3>9. IP归属地查询</h3>
<p>查询IP地址的地理位置和ISP运营商信息。<br><a href="https://www.ityvip.xyz/tools/ip-lookup">立即查询IP →</a></p>
<h3>10. 随机生成器</h3>
<p>生成随机密码、UUID和时间戳。<br><a href="https://www.ityvip.xyz/tools/random-generator">立即使用随机生成器 →</a></p>
<h3>11. 计时器/秒表</h3>
<p>倒计时和正计时双模式，适合学习、运动、烹饪等场景。<br><a href="https://www.ityvip.xyz/tools/timer-stopwatch">立即使用计时器 →</a></p>
<h3>12. 屏幕录制工具</h3>
<p>在线录制屏幕，无需安装软件，支持全屏和窗口录制。<br><a href="https://www.ityvip.xyz/tools/screen-recorder">立即录屏 →</a></p>
<p>全部免费使用，收藏本页轻松找工具！</p>`,
  },
  {
    slug: 'free-online-ai-tools-2026',
    title: 'AI绘画提示词生成器与在线AI工具推荐 - 2026精选',
    category: 'AI工具推荐',
    tags: 'AI工具,AI绘画提示词,Midjourney,Stable Diffusion,AI提示词生成器,在线AI,免费AI工具',
    content: `<h2>AI绘画提示词生成器与在线AI工具推荐</h2>
<p>AI绘画技术越来越成熟，写好提示词是生成高质量AI作品的关键。本文推荐本站的AI工具和相关资源。</p>
<h3>AI绘画提示词生成器</h3>
<p>本站的AI绘画提示词生成器，支持Midjourney、Stable Diffusion、DALL-E等主流AI绘画平台。选择主题、风格、艺术家参考等，一键生成优化后的提示词，大幅提升出图质量。<br><a href="https://www.ityvip.xyz/tools/ai-prompt">立即使用AI提示词生成器 →</a></p>
<h3>提示词写作技巧</h3>
<ul>
<li><strong>明确主题</strong>：清楚描述你想画的内容，如人物、场景、物体</li>
<li><strong>指定风格</strong>：Realistic、Anime、Oil Painting、Watercolor、3D Render等</li>
<li><strong>添加细节</strong>：光照、色彩、构图、质感等细节描述</li>
<li><strong>参考艺术家</strong>：加入喜欢的艺术家名字作为风格参考</li>
<li><strong>负面提示词</strong>：排除不想要的效果</li>
</ul>
<p>使用本站的AI提示词生成器，快速获得优化后的prompt，适合AI绘画新手和进阶玩家。免费使用，无需注册。</p>`,
  },
];

async function main() {
  const conn = await mysql.createConnection(DB_CONFIG);
  console.log(`Connected to MySQL at ${DB_CONFIG.host}:${DB_CONFIG.port}`);

  let created = 0;
  let skipped = 0;

  for (const a of ARTICLES) {
    const [existing] = await conn.query('SELECT id FROM articles WHERE slug = ?', [a.slug]);
    if (existing.length > 0) {
      console.log(`SKIP - ${a.slug}`);
      skipped++;
      continue;
    }

    const excerpt = a.title;

    await conn.execute(
      `INSERT INTO articles (title, slug, excerpt, content, cover_image, author, category, tags, is_published, published_at)
       VALUES (?, ?, ?, ?, '', '全民影视', ?, ?, 1, NOW())`,
      [a.title, a.slug, excerpt, a.content, a.category, a.tags]
    );
    console.log(`CREATED - ${a.title}`);
    created++;
  }

  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);
  await conn.end();
}

main().catch(err => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
