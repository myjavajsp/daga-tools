const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'daga',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'daga_clone',
  charset: 'utf8mb4',
};

function toKebab(key) {
  return key.replace(/([A-Z])/g, '-$1').toLowerCase();
}

const TOOLS = [
  // 图片工具
  { key: 'compress', category: '图片工具', title: '在线图片压缩工具使用教程 - 免费压缩JPG/PNG/WebP', tags: '图片压缩,在线工具,压缩教程,JPG压缩,PNG压缩' },
  { key: 'convert', category: '图片工具', title: '在线图片格式转换工具使用教程 - PNG/JPG/WebP互转', tags: '图片格式转换,PNG转JPG,JPG转PNG,WebP转换,在线转换' },
  { key: 'crop', category: '图片工具', title: '在线图片裁剪工具使用教程 - 自由裁剪和预设比例', tags: '图片裁剪,裁剪工具,在线编辑,照片裁剪,图片处理' },
  { key: 'ocr', category: '图片工具', title: '在线文字识别OCR工具使用教程 - 图片提取文字', tags: 'OCR,文字识别,图片转文字,在线OCR,提取文字' },
  { key: 'watermark', category: '图片工具', title: '在线图片添加水印工具使用教程 - 版权保护', tags: '图片水印,添加水印,版权保护,在线工具,文字水印' },
  { key: 'removeWatermark', category: '图片工具', title: '在线去水印工具使用教程 - 去除图片水印和杂物', tags: '去水印,图片去水印,去除文字,在线工具,图片修复' },
  { key: 'nineGrid', category: '图片工具', title: '在线九宫格切图工具使用教程 - 朋友圈切图神器', tags: '九宫格切图,朋友圈,图片分割,小红书,在线工具' },
  { key: 'imageBgRemove', category: '图片工具', title: '在线AI去背景工具使用教程 - 一键移除图片背景', tags: '去背景,AI抠图,移除背景,透明PNG,在线工具' },
  { key: 'imageUpscaler', category: '图片工具', title: '在线图片无损放大工具使用教程 - AI增强清晰度', tags: '图片放大,无损放大,AI放大,照片修复,清晰度提升' },
  { key: 'imageEditor', category: '图片工具', title: '在线PS图片编辑工具使用教程 - 免费网页版修图', tags: '在线PS,图片编辑,修图,滤镜,调色,免费工具' },
  { key: 'maker', category: '图片工具', title: '在线表情包制作工具使用教程 - 一键生成专属表情', tags: '表情包制作,表情包生成器,斗图,梗图,在线工具' },
  { key: 'imageFilters', category: '图片工具', title: '在线图片滤镜工具使用教程 - 添加照片特效', tags: '图片滤镜,照片滤镜,灰度,怀旧,模糊,在线处理' },
  { key: 'qrDecoder', category: '图片工具', title: '在线二维码解码工具使用教程 - 识别二维码内容', tags: '二维码解码,二维码识别,QR码,扫码,在线解码' },
  { key: 'screenRecorder', category: '图片工具', title: '在线屏幕录制工具使用教程 - 免安装录屏软件', tags: '屏幕录制,录屏,在线录屏,教程录制,屏幕录像' },
  // PDF工具
  { key: 'pdfMerge', category: 'PDF工具', title: '在线PDF合并工具使用教程 - 合并多个PDF文件', tags: 'PDF合并,合并PDF,PDF工具,在线PDF,文件合并' },
  { key: 'pdfSplit', category: 'PDF工具', title: '在线PDF拆分工具使用教程 - 提取PDF指定页面', tags: 'PDF拆分,提取页面,PDF分割,PDF工具,在线PDF' },
  { key: 'pdfCompress', category: 'PDF工具', title: '在线PDF压缩工具使用教程 - 减小PDF文件体积', tags: 'PDF压缩,压缩PDF,减小PDF,PDF优化,在线PDF' },
  { key: 'jpgToPdf', category: 'PDF工具', title: '在线图片转PDF工具使用教程 - JPG/PNG转PDF', tags: '图片转PDF,JPG转PDF,PNG转PDF,PDF转换,在线工具' },
  { key: 'pdfLock', category: 'PDF工具', title: '在线PDF加密工具使用教程 - 设置密码保护', tags: 'PDF加密,PDF加密码,PDF保护,文档安全,在线PDF' },
  { key: 'pdfUnlock', category: 'PDF工具', title: '在线PDF解密工具使用教程 - 移除密码保护', tags: 'PDF解密,移除密码,PDF解锁,PDF密码,在线工具' },
  { key: 'pdfToImage', category: 'PDF工具', title: '在线PDF转图片工具使用教程 - PDF页面转图片', tags: 'PDF转图片,PDF转PNG,PDF转JPG,PDF导出,在线工具' },
  { key: 'pdfToWord', category: 'PDF工具', title: '在线PDF转Word工具使用教程 - 转换可编辑文档', tags: 'PDF转Word,PDF转换Word,文档编辑,在线转换,免费工具' },
  // 音频工具
  { key: 'audioCut', category: '音频工具', title: '在线音频裁剪工具使用教程 - 剪切音乐铃声', tags: '音频裁剪,剪切音乐,铃声制作,MP3剪切,在线音频' },
  { key: 'audioConvert', category: '音频工具', title: '在线音频格式转换工具使用教程 - MP3/WAV/FLAC互转', tags: '音频格式转换,MP3转换,WAV转MP3,FLAC转码,在线转换' },
  { key: 'audioCompress', category: '音频工具', title: '在线音频压缩工具使用教程 - 减小音乐文件大小', tags: '音频压缩,MP3压缩,减小音频,比特率,在线工具' },
  // 文本工具
  { key: 'wordCounter', category: '文本工具', title: '在线字数统计工具使用教程 - 统计文章字数', tags: '字数统计,字符统计,文章统计,关键词频率,在线工具' },
  { key: 'caseConverter', category: '文本工具', title: '在线大小写转换工具使用教程 - 英文大小写互转', tags: '大小写转换,英文大小写,首字母大写,驼峰转换,文本工具' },
  { key: 'zhConverter', category: '文本工具', title: '在线简繁转换工具使用教程 - 简体繁体互转', tags: '简繁转换,简体转繁体,繁体转简体,中文转换,在线工具' },
  { key: 'urlEncoder', category: '文本工具', title: '在线URL编解码工具使用教程 - URL编码解码', tags: 'URL编码,URL解码,urlencode,urldecode,开发者工具' },
  { key: 'htmlEntity', category: '文本工具', title: '在线HTML实体转换工具使用教程 - 字符编码解码', tags: 'HTML实体,HTML转义,字符编码,XSS防护,开发者工具' },
  { key: 'textSort', category: '文本工具', title: '在线文本排序工具使用教程 - 排序去重反转', tags: '文本排序,文本去重,行排序,字母排序,批量处理' },
  { key: 'textDiff', category: '文本工具', title: '在线文本对比工具使用教程 - 比较文字差异', tags: '文本对比,文本差异,diff,代码对比,文档校对' },
  { key: 'markdownPreview', category: '文本工具', title: '在线Markdown编辑器使用教程 - 实时预览排版', tags: 'Markdown,MD编辑,实时预览,Markdown转HTML,写作工具' },
  { key: 'loremIpsum', category: '文本工具', title: '在线Lorem Ipsum生成器使用教程 - 占位文本填充', tags: 'Lorem Ipsum,伪文本,占位文字,排版填充,设计工具' },
  { key: 'textToSpeech', category: '文本工具', title: '在线文字转语音工具使用教程 - 浏览器朗读文字', tags: '文字转语音,TTS,语音合成,在线朗读,听文章' },
  // 换算工具
  { key: 'dateCalculator', category: '换算工具', title: '在线日期计算器使用教程 - 日期差和日期加减', tags: '日期计算器,日期差,天数计算,倒计时,在线工具' },
  { key: 'ageCalculator', category: '换算工具', title: '在线年龄计算器使用教程 - 周岁生肖星座查询', tags: '年龄计算器,周岁查询,生肖计算,星座查询,出生日期' },
  { key: 'unitConverter', category: '换算工具', title: '在线单位换算工具使用教程 - 长度重量温度换算', tags: '单位换算,长度换算,重量换算,温度换算,度量衡' },
  { key: 'colorConverter', category: '换算工具', title: '在线颜色格式转换工具使用教程 - HEX/RGB/HSL互转', tags: '颜色转换,HEX转RGB,HSL,颜色格式,设计师工具' },
  // 开发者/其他工具
  { key: 'regexTester', category: '其他工具', title: '在线正则表达式测试工具使用教程 - 实时匹配调试', tags: '正则表达式,Regex测试,正则匹配,正则调试,开发者工具' },
  { key: 'jsonFormatter', category: '其他工具', title: '在线JSON格式化工具使用教程 - 格式化校验压缩', tags: 'JSON格式化,JSON校验,JSON美化,JSON压缩,开发者工具' },
  { key: 'base64Tool', category: '其他工具', title: '在线Base64编解码工具使用教程 - 编码解码转换', tags: 'Base64编码,Base64解码,Base64转换,编码解码,开发者工具' },
  { key: 'httpStatus', category: '其他工具', title: 'HTTP状态码查询手册 - 全系列状态码详解', tags: 'HTTP状态码,状态码查询,404,500,Web开发,网络调试' },
  { key: 'sqlFormatter', category: '其他工具', title: '在线SQL格式化工具使用教程 - SQL语句美化排版', tags: 'SQL格式化,SQL美化,SQL排版,数据库工具,开发者工具' },
  { key: 'hashGenerator', category: '其他工具', title: '在线哈希生成工具使用教程 - MD5/SHA1/SHA256计算', tags: 'MD5,SHA256,哈希计算,加密工具,数据校验,开发者工具' },
  { key: 'passwordStrength', category: '其他工具', title: '在线密码强度检测工具使用教程 - 检查密码安全', tags: '密码强度,密码检测,密码安全,强密码,账户安全' },
  { key: 'timerStopwatch', category: '其他工具', title: '在线计时器秒表工具使用教程 - 倒计时和正计时', tags: '倒计时,秒表,计时器,分段计时,在线计时,时间工具' },
  { key: 'gradientGenerator', category: '其他工具', title: '在线CSS渐变色生成器使用教程 - 渐变背景设计', tags: '渐变色,CSS渐变,线性渐变,径向渐变,UI设计,前端工具' },
  { key: 'boxShadowGenerator', category: '其他工具', title: '在线CSS阴影生成器使用教程 - Box Shadow设计', tags: 'Box Shadow,CSS阴影,盒子阴影,阴影效果,前端工具' },
  { key: 'csvToJson', category: '其他工具', title: '在线CSV/JSON互转工具使用教程 - 数据格式转换', tags: 'CSV转JSON,JSON转CSV,数据转换,CSV解析,开发者工具' },
  { key: 'jwtDecoder', category: '其他工具', title: '在线JWT解码工具使用教程 - 解析JSON Web Token', tags: 'JWT解码,JWT解析,Token解析,认证调试,开发者工具' },
  { key: 'typingSpeed', category: '其他工具', title: '在线打字速度测试工具使用教程 - CPM/WPM测试', tags: '打字测试,打字速度,CPM,WPM,键盘练习,在线测试' },
  // 其他
  { key: 'qrCodeGen', category: '其他工具', title: '在线二维码生成器使用教程 - 自定义二维码制作', tags: '二维码生成,二维码制作,QR码,自定义二维码,免费工具' },
  { key: 'zipTool', category: '其他工具', title: '在线ZIP压缩解压工具使用教程 - 文件压缩解压', tags: 'ZIP压缩,解压工具,文件压缩,在线解压,压缩软件' },
  { key: 'aiPrompt', category: '其他工具', title: 'AI绘画提示词生成器使用教程 - Midjourney/SD提示词', tags: 'AI绘画,提示词生成器,Midjourney,Stable Diffusion,AI提示词' },
  { key: 'phoneLookup', category: '其他工具', title: '在线手机号码归属地查询工具使用教程', tags: '手机号查询,号码归属地,运营商查询,电话号码,在线查询' },
  { key: 'idCardLookup', category: '其他工具', title: '在线身份证号码查询工具使用教程 - 解析身份信息', tags: '身份证查询,身份证号码,户籍查询,身份验证,在线查询' },
  { key: 'videoDownloader', category: '其他工具', title: '在线视频下载解析工具使用教程 - 抖音B站视频下载', tags: '视频下载,抖音下载,B站下载,视频解析,无水印下载' },
  { key: 'ipLookup', category: '其他工具', title: '在线IP归属地查询工具使用教程 - IP地址定位', tags: 'IP查询,IP归属地,IP定位,网络工具,在线查询' },
  { key: 'randomGenerator', category: '其他工具', title: '在线随机生成器使用教程 - 密码/UUID/时间戳', tags: '随机生成器,密码生成,UUID,时间戳,随机数,在线工具' },
];

function buildContent(tool) {
  const name = tool.title.split(' - ')[0].replace('在线', '').replace('使用教程', '').trim();
  return `<h2>${tool.title}</h2>
<p>本文详细介绍如何使用在线${name}，帮助你快速上手并充分发挥其功能。完全免费，无需注册，直接在浏览器中使用。</p>
<h3>工具简介</h3>
<p>这是一款完全免费的在线${name}，无需下载安装，直接在浏览器中运行。所有数据处理都在本地完成，不上传服务器，充分保护你的隐私安全。</p>
<h3>如何使用</h3>
<ol>
<li>打开 <a href="https://www.ityvip.xyz/tools/${toKebab(tool.key)}">${tool.title.split(' - ')[0]}</a></li>
<li>按照页面提示上传或输入需要处理的内容</li>
<li>根据需要调整参数设置</li>
<li>点击执行按钮，等待处理完成</li>
<li>下载处理后的文件或复制结果</li>
</ol>
<h3>主要功能</h3>
<ul>
<li>完全免费，无需注册登录</li>
<li>浏览器本地处理，数据不上传服务器</li>
<li>简洁直观的操作界面</li>
<li>支持主流浏览器（Chrome、Edge、Firefox、Safari）</li>
<li>移动端友好，手机平板也可使用</li>
</ul>
<h3>常见问题</h3>
<p><strong>Q: 文件会泄露吗？</strong><br>A: 所有处理均在浏览器本地完成，你的文件不会上传到任何服务器，请放心使用。</p>
<p><strong>Q: 支持哪些浏览器？</strong><br>A: 支持所有现代浏览器，推荐使用 Chrome 或 Edge 获得最佳体验。</p>
<p><strong>Q: 有使用次数限制吗？</strong><br>A: 完全免费，无任何使用次数和功能限制。</p>`;
}

async function main() {
  const conn = await mysql.createConnection(DB_CONFIG);
  console.log(`Connected to MySQL at ${DB_CONFIG.host}:${DB_CONFIG.port}`);

  let created = 0;
  let skipped = 0;

  for (const tool of TOOLS) {
    const slug = 'how-to-use-' + toKebab(tool.key);
    const [existing] = await conn.query('SELECT id FROM articles WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      console.log(`SKIP [${tool.key}] - already exists`);
      skipped++;
      continue;
    }

    const content = buildContent(tool);
    const excerpt = tool.title;

    await conn.execute(
      `INSERT INTO articles (title, slug, excerpt, content, cover_image, author, category, tags, is_published, published_at)
       VALUES (?, ?, ?, ?, '', '全民影视', ?, ?, 1, NOW())`,
      [tool.title, slug, excerpt, content, tool.category, tool.tags]
    );
    console.log(`CREATED [${tool.key}] - ${tool.title}`);
    created++;
  }

  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);
  await conn.end();
}

main().catch(err => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
