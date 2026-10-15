const { SITE_URL, escapeHtml } = require('../utils');

const ROUTE_SEO = {
  '/': {
    title: '全民影视VIP视频解析 - 免费在线视频解析工具',
    desc: '全民影视提供免费视频解析服务，支持腾讯视频、优酷、爱奇艺、芒果TV等主流平台VIP视频解析播放，同时提供短视频去水印、表情包制作、在线播放器等实用工具。',
    keywords: '视频解析, VIP视频, 免费解析, 腾讯视频, 优酷, 爱奇艺, 芒果TV, 在线视频, 全民影视, 视频下载, 免费观看, VIP会员, 爱奇艺VIP, 腾讯视频VIP, 优酷VIP, 芒果TV会员, 视频去广告, 在线解析播放, 无广告视频, 短视频去水印, 表情包制作, 在线播放器',
  },
  '/hot': {
    title: '全网热搜排行榜 - 抖音/快手/小红书/YouTube 实时热搜 - 全民影视',
    desc: '实时查看抖音、快手、小红书、YouTube等平台热搜排行榜，掌握全网热门话题和流行趋势。',
    keywords: '热搜, 抖音热搜, 快手热搜, 小红书热搜, YouTube热搜, 实时热搜, 热门话题, 热榜, 排行榜, 热门视频, 热门话题榜, 实时热榜, 抖音热榜, 快手热榜, 微博热搜, 知乎热榜, 百度热搜, 今日热榜, 热点追踪, 流行趋势',
  },
  '/meme': {
    title: '表情包大全 - 海量斗图表情包免费下载 - 全民影视VIP视频解析',
    desc: '海量搞笑表情包免费下载，支持斗图、沙雕、萌宠、动漫、明星等分类。在线制作专属表情包，聊天斗图必备神器。',
    keywords: '表情包, 斗图, 搞笑表情, 沙雕表情, 萌宠表情, 动漫表情, 表情包下载, 在线制图, 表情包搜索, 斗图神器, 表情包大全, 免费表情包, 微信表情包, QQ表情包, 动态表情包, GIF表情包, 表情包制作, 自制表情包, 明星表情包, 沙雕图片',
  },
  '/maker': {
    title: '在线制图工具 - 表情包制作 - 全民影视VIP视频解析',
    desc: '在线表情包制作工具，选模板、加文字、贴贴纸，一键生成专属表情包并下载。支持热门、搞笑、沙雕、动漫等多种模板分类。',
    keywords: '表情包制作, 制图工具, 在线做图, 表情包生成器, meme生成器, 搞笑图片制作, 表情包生成, 在线制图工具, 模板制作, 文字贴纸, 自定义表情包, 表情包编辑器, DIY表情包, 一键生成表情包, 表情包模板, 文字加图片',
  },
  '/parser': {
    title: '短视频去水印 - 抖音/快手/小红书/B站 视频解析下载 - 全民影视VIP视频解析',
    desc: '免费在线短视频去水印工具，支持抖音、快手、小红书、B站等平台视频去水印下载。粘贴分享链接即可解析无水印视频。',
    keywords: '去水印, 短视频去水印, 抖音去水印, 快手去水印, 小红书去水印, 视频去水印, 无水印下载, 抖音视频下载, 快手视频下载, 小红书视频下载, B站视频下载, 视频解析下载, 短视频下载工具, 批量去水印, 视频提取, 分享链接解析',
  },
  '/m3u8': {
    title: '在线视频播放器 - M3U8/MP4/WebM 在线播放 - 全民影视VIP视频解析',
    desc: '免费在线视频播放器，支持 M3U8(HLS)、MP4、WebM、Ogg 格式在线播放。粘贴视频地址或拖放文件即可播放，支持多清晰度切换和代理转发。',
    keywords: '在线播放器, M3U8播放器, MP4播放, HLS播放, 视频播放, 流媒体播放, 在线看视频, m3u8在线播放, 视频链接播放, 流媒体在线播放, HLS播放器, 视频拖放播放, 多清晰度切换, 视频代理播放, 跨域视频播放, m3u8解析播放, WebM播放, Ogg播放, 视频文件播放',
  },
  '/tools': {
    title: '在线工具 - PDF/图片/音频/录屏 - 全民影视VIP视频解析',
    desc: '免费在线工具箱，包含PDF合并拆分压缩加密解密、PDF转图片、图片压缩格式转换裁剪OCR水印去背景、音频裁剪转换压缩、AI绘画提示词生成器、屏幕录制等实用工具，全部在浏览器中完成无需上传服务器。',
    keywords: '在线PDF工具, PDF合并, PDF压缩, 图片转PDF, PDF转图片, PDF转PNG, AI绘画提示词, AI提示词生成器, Midjourney提示词, Stable Diffusion提示词, 在线音频处理, 音频裁剪, 在线录屏, 屏幕录制, 免费在线工具, PDF加密解密, 图片工具, 音频转换, 在线工具箱, 图片压缩, 格式转换, 图片裁剪, OCR文字识别, 图片水印, 去水印, 九宫格切图, 在线PS, 去背景, 音频格式转换, 音频压缩, 在线录屏工具',
  },
  '/screen-recorder': {
    title: '在线屏幕录制 - 免费录屏工具 - 全民影视VIP视频解析',
    desc: '免费在线屏幕录制工具，无需下载安装，支持录制屏幕、浏览器标签页或应用窗口，可包含系统音频。录制完成后直接下载WebM视频。',
    keywords: '在线录屏, 屏幕录制, 免费录屏, 在线屏幕录制, 录屏工具, 网页录屏, 浏览器录屏, WebM录屏, 无需下载录屏, 在线录屏工具, 屏幕截图, 视频录制, 桌面录制, 免费录屏软件, 在线录制',
  },
  '/ai': {
    title: 'AI 工具导航 - 精选 60+ AI 工具合集 - 全民影视VIP视频解析',
    desc: '精选 60+ 热门 AI 工具，涵盖对话、图像、视频、编程、写作等分类，帮你快速找到合适的 AI 工具，全部免费收录。',
    keywords: 'AI工具, AI导航, AI工具导航, ChatGPT, Claude, Midjourney, AI对话, AI绘图, AI编程, AI视频, 人工智能工具, AI工具推荐, 免费AI工具, AI工具合集, AI产品导航, AI工具网站, AI发现, AI目录',
  },
  '/music': {
    title: '全网音乐在线搜索试听 - QQ音乐曲库 - 全民影视',
    desc: '免费在线音乐搜索试听工具，搜索 QQ 音乐曲库，在线播放高品质音乐，无需下载客户端。',
    keywords: '在线音乐, 音乐搜索, QQ音乐, 在线试听, 免费听歌, 音乐播放器, 全网音乐, 歌曲搜索, 音乐在线, 听歌, 音乐解析, 无损音乐',
  },
'/recommend': {
    title: '影视推荐文章 - 电影/电视剧/动漫推荐 - 全民影视',
    desc: '精选电影、电视剧、动漫推荐榜单，每周更新热门影视排行，帮你发现好剧好电影。',
    keywords: '影视推荐, 电影推荐, 电视剧推荐, 动漫推荐, 热门影视, 影视排行, 每周推荐, 最新电影, 最新剧集, 流媒体推荐, Netflix推荐, 豆瓣高分, 影视指南',
  },
  '/mbti': {
    title: 'MBTI 人格测试 - 16型人格免费在线测试 - 全民影视',
    desc: '免费在线 MBTI 人格测试，16 型人格（ENFP、INTJ、INFP 等）性格测试。2 分钟测出你的人格类型，解锁性格特点、优缺点、适合职业、恋爱配对完整解析。',
    keywords: 'MBTI测试, 16型人格测试, MBTI人格测试, 性格测试, 在线测试, ENFP, INTJ, INFP, ENTP, INFJ, ISFJ, ESTJ, 人格解析, 职业测试',
  },
  '/about': {
    title: '关于我们 - 全民影视VIP视频解析',
    desc: '全民影视是一个免费在线工具集合站，提供视频解析、表情包制作、在线播放器、PDF工具、图片处理等实用功能，致力于让每个用户都能轻松使用各种在线工具。',
    keywords: '关于我们, 全民影视, 网站介绍, 联系方式, 团队介绍',
  },
  '/privacy-policy': {
    title: '隐私政策 - 全民影视VIP视频解析',
    desc: '全民影视隐私政策，详细说明我们如何收集、使用、存储和保护您的个人信息。我们重视用户隐私，严格遵守相关法律法规。',
    keywords: '隐私政策, 个人信息, 数据保护, 用户隐私',
  },
  '/terms': {
    title: '服务条款 - 全民影视VIP视频解析',
    desc: '全民影视用户服务协议，使用本网站前请仔细阅读服务条款，包括服务内容、用户规范、知识产权、免责声明等内容。',
    keywords: '服务条款, 用户协议, 使用条款, 免责声明',
  },
  '/contact': {
    title: '联系我们 - 全民影视VIP视频解析',
    desc: '联系全民影视客服，如有问题、建议或商务合作，欢迎通过在线表单或邮箱与我们取得联系。',
    keywords: '联系我们, 客服邮箱, 意见反馈, 商务合作',
  },
};

const MBTI_TYPE_SEO = [
  { code: 'ENFP', title: 'ENFP竞选者人格解析 - 性格特点、职业、恋爱配对', desc: 'ENFP竞选者人格是16型人格之一，热情自由、充满灵感。了解 ENFP 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
  { code: 'ENTP', title: 'ENTP辩论家人格解析 - 性格特点、职业、恋爱配对', desc: 'ENTP辩论家人格是16型人格之一，机智敏捷、爱好思考碰撞。了解 ENTP 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
  { code: 'INTJ', title: 'INTJ建筑师（战略家）人格解析 - 性格特点、职业、恋爱', desc: 'INTJ建筑师人格是16型人格之一，理性深谋、独立自主。了解 INTJ 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
  { code: 'INTP', title: 'INTP逻辑学家（思考者）人格解析 - 性格特点、职业、恋爱', desc: 'INTP逻辑学家人格是16型人格之一，好奇理性、热爱探索原理。了解 INTP 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
  { code: 'INFJ', title: 'INFJ提倡者（守护者）人格解析 - 性格特点、职业、恋爱', desc: 'INFJ提倡者人格是16型人格之一，安静内省、理想主义。了解 INFJ 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
  { code: 'ISTJ', title: 'ISTJ物流师人格解析 - 性格特点、职业、恋爱配对', desc: 'ISTJ物流师人格是16型人格之一，尽职尽责、可靠守序。了解 ISTJ 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
  { code: 'ISFJ', title: 'ISFJ守卫者人格解析 - 性格特点、职业、恋爱配对', desc: 'ISFJ守卫者人格是16型人格之一，温柔细心、默默守护。了解 ISFJ 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
  { code: 'ESTJ', title: 'ESTJ总经理人格解析 - 性格特点、职业、恋爱配对', desc: 'ESTJ总经理人格是16型人格之一，务实高效、组织力强。了解 ESTJ 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
  { code: 'ESFJ', title: 'ESFJ执政官人格解析 - 性格特点、职业、恋爱配对', desc: 'ESFJ执政官人格是16型人格之一，热情周到、乐于助人。了解 ESFJ 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
  { code: 'ESTP', title: 'ESTP冒险家人格解析 - 性格特点、职业、恋爱配对', desc: 'ESTP企业家（冒险家）人格是16型人格之一，行动力强、反应敏捷。了解 ESTP 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
  { code: 'ESFP', title: 'ESFP表演者人格解析 - 性格特点、职业、恋爱配对', desc: 'ESFP表演者人格是16型人格之一，热情开朗、享受当下。了解 ESFP 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
  { code: 'ENFJ', title: 'ENFJ主人公（教师）人格解析 - 性格特点、职业、恋爱配对', desc: 'ENFJ主人公人格是16型人格之一，共情力强、天生领袖气质。了解 ENFJ 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
  { code: 'ISFP', title: 'ISFP探险家（艺术家）人格解析 - 性格特点、职业、恋爱', desc: 'ISFP探险家（艺术家）人格是16型人格之一，安静细腻、忠于内心感受。了解 ISFP 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
  { code: 'INFP', title: 'INFP调停者人格解析 - 性格特点、职业、恋爱配对', desc: 'INFP调停者人格是16型人格之一，纯真理想、富有同理心。了解 INFP 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
  { code: 'ENTJ', title: 'ENTJ指挥官人格解析 - 性格特点、职业、恋爱配对', desc: 'ENTJ指挥官人格是16型人格之一，果断自信、极具领导气质。了解 ENTJ 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
  { code: 'ISTP', title: 'ISTP实干家（鉴赏家）人格解析 - 性格特点、职业、恋爱', desc: 'ISTP实干家（鉴赏家）人格是16型人格之一，冷静理性、动手能力超强。了解 ISTP 性格特点、优缺点、适合职业、恋爱配对全面解析。' },
];

const TOOL_SLUG_TITLES = {
  'video-downloader': '在线视频下载器 - 抖音/B站/快手去水印下载 - 全民影视',
  'image-upscaler': '在线图片无损放大工具 - 2x/3x/4x AI放大 - 全民影视',
  'pdf-to-word': 'PDF转Word - 免费在线PDF转Word文档 - 全民影视',
  'image-editor': '在线PS图片编辑器 - 免费修图/调色/滤镜/裁剪 - 全民影视',
  'remove-background': '在线AI去背景 - 免费图片背景移除/抠图工具 - 全民影视',
  'pdf-compress': '在线PDF压缩 - 免费压缩PDF文件大小 - 全民影视',
  'pdf-merge': '在线PDF合并 - 免费合并多个PDF文件 - 全民影视',
  'qr-code-generator': '在线二维码生成器 - 免费生成二维码 - 全民影视',
  'ai-prompt': 'AI绘画提示词生成器 - Midjourney/Stable Diffusion提示词 - 全民影视',
  'phone-lookup': '手机号码归属地查询 - 免费手机号查询 - 全民影视',
  'regex-tester': '在线正则表达式测试器 - 实时匹配高亮 - 全民影视',
  'json-formatter': '在线JSON格式化工具 - 格式化/压缩/校验JSON - 全民影视',
  'base64-tool': 'Base64在线编解码工具 - Base64加密解密 - 全民影视',
  'compress': '在线图片压缩 - 免费压缩图片大小 - 全民影视',
  'convert': '在线图片格式转换 - JPG/PNG/WebP互转 - 全民影视',
  'crop': '在线图片裁剪工具 - 免费切割图片 - 全民影视',
  'ocr': '在线OCR文字识别 - 图片转文字 - 全民影视',
  'watermark': '在线图片加水印 - 免费给图片加文字/Logo - 全民影视',
  'pdf-split': '在线PDF拆分 - 免费分割PDF页面 - 全民影视',
  'jpg-to-pdf': '图片转PDF - 免费在线JPG转PDF - 全民影视',
  'pdf-lock': 'PDF加密 - 免费在线给PDF加密码 - 全民影视',
  'pdf-unlock': 'PDF解密 - 免费在线去除PDF密码 - 全民影视',
  'pdf-to-image': 'PDF转图片 - 免费在线PDF转PNG/JPG - 全民影视',
  'audio-cut': '在线音频裁剪 - 免费切割MP3/WAV - 全民影视',
  'audio-convert': '在线音频格式转换 - MP3/WAV/FLAC互转 - 全民影视',
  'audio-compress': '在线音频压缩 - 免费减小音频文件大小 - 全民影视',
  'video-to-gif': '在线视频转GIF - 免费MP4转GIF动图 - 全民影视',
  'screen-recorder': '在线屏幕录制 - 免费录屏工具 - 全民影视',
  'word-counter': '在线字数统计 - 免费文字计数工具 - 全民影视',
  'case-converter': '在线大小写转换 - 英文大小写转换工具 - 全民影视',
  'zh-converter': '在线简繁转换 - 繁体简体互转工具 - 全民影视',
  'date-calculator': '在线日期计算器 - 免费日期差计算 - 全民影视',
  'age-calculator': '在线年龄计算器 - 免费周岁计算 - 全民影视',
  'unit-converter': '在线单位换算 - 长度/重量/温度换算 - 全民影视',
  'color-converter': '在线颜色转换 - HEX/RGB/HSL转换 - 全民影视',
  'random-generator': '在线随机数生成器 - 免费随机数/彩票生成 - 全民影视',
  'ip-lookup': '在线IP地址查询 - 免费查询IP归属地 - 全民影视',
  'id-card-lookup': '在线身份证查询 - 免费身份证号码验证 - 全民影视',
  'url-encoder': '在线URL编解码 - 免费URL编码解码工具 - 全民影视',
  'html-entity': '在线HTML实体转换 - HTML实体编码解码 - 全民影视',
  'text-sort': '在线文本排序 - 免费文字排序工具 - 全民影视',
  'text-diff': '在线文本对比 - 免费文字差异比较 - 全民影视',
  'markdown-preview': '在线Markdown预览 - 免费Markdown编辑器 - 全民影视',
  'markdown-to-pdf': 'Markdown转PDF - 免费在线转换 - 全民影视',
  'lorem-ipsum': '在线乱数假文生成 - Lorem Ipsum生成器 - 全民影视',
  'text-to-speech': '在线文字转语音 - 免费TTS转换工具 - 全民影视',
  'typing-speed': '在线打字测试 - 免费打字速度测试 - 全民影视',
  'bmi-calculator': '在线BMI计算器 - 免费身体质量指数计算 - 全民影视',
  'mortgage-calculator': '在线房贷计算器 - 免费贷款计算器 - 全民影视',
  'cron-generator': '在线Cron表达式生成 - 免费定时任务生成器 - 全民影视',
  'code-beautifier': '在线代码美化 - 免费代码格式化工具 - 全民影视',
  'csv-to-json': '在线CSV转JSON - 免费数据格式转换 - 全民影视',
  'jwt-decoder': '在线JWT解码器 - 免费JSON Web Token解析 - 全民影视',
  'gradient-generator': '在线渐变生成器 - 免费CSS渐变代码 - 全民影视',
  'box-shadow-generator': '在线阴影生成器 - 免费CSS阴影代码 - 全民影视',
  'hash-generator': '在线哈希生成器 - 免费MD5/SHA加密 - 全民影视',
  'password-strength': '在线密码强度检测 - 免费密码安全性测试 - 全民影视',
  'http-status': '在线HTTP状态码查询 - 免费查询HTTP状态 - 全民影视',
  'sql-formatter': '在线SQL格式化 - 免费SQL代码美化工具 - 全民影视',
  'zip-tool': '在线ZIP解压压缩 - 免费压缩解压工具 - 全民影视',
  'qr-decoder': '在线二维码解码 - 免费扫描二维码工具 - 全民影视',
  'image-bg-remove': '在线AI去背景 - 免费图片抠图工具 - 全民影视',
  'nine-grid': '在线九宫格切图 - 免费图片分割工具 - 全民影视',
  'image-filters': '在线图片滤镜 - 免费图片特效处理 - 全民影视',
  'color-blind-simulator': '在线色盲模拟器 - 免费色觉测试工具 - 全民影视',
  'regex-visualizer': '在线正则可视化 - 免费正则表达式调试 - 全民影视',
  'audio-extractor': '在线音频提取 - 免费视频提取音频 - 全民影视',
};

const TOOL_SLUG_KEYWORDS = '在线工具, PDF工具, 图片工具, 音频工具, 屏幕录制, 免费在线工具, 视频工具, 开发工具, 换算工具';

const TOOL_TAGS = {
  'video-downloader': '视频下载,去水印,短视频,抖音,快手,小红书,B站,视频解析',
  'image-upscaler': '图片放大,AI放大,高清图片,无损放大,图片处理',
  'pdf-to-word': 'PDF转换,PDF转Word,文档转换,办公工具',
  'image-editor': '修图,图片编辑,在线PS,在线photoshop,图片处理,图片美化,调色,滤镜,裁剪,免费修图,网页版PS',
  'remove-background': '去背景,抠图,图片处理,AI工具,人像抠图',
  'pdf-compress': 'PDF压缩,PDF处理,办公工具,文件压缩',
  'pdf-merge': 'PDF合并,PDF处理,办公工具,文档合并',
  'qr-code-generator': '二维码生成,QR码,二维码,分享工具',
  'ai-prompt': 'AI绘画,提示词,AI工具,Midjourney,Stable Diffusion,AI绘图',
  'phone-lookup': '手机号查询,号码归属地,手机,查询工具',
  'regex-tester': '正则表达式,开发工具,编程,代码,文本匹配',
  'json-formatter': 'JSON格式化,JSON,开发工具,数据格式化,代码工具',
  'base64-tool': 'Base64编码,Base64解码,编解码,加密工具,开发工具',
  'compress': '图片压缩,图片处理,免费压缩,在线压缩',
  'convert': '图片转换,格式转换,JPG转PNG,WebP转换',
  'crop': '图片裁剪,切割图片,在线裁剪',
  'ocr': 'OCR,文字识别,图片转文字,在线识别',
  'watermark': '图片水印,加水印,在线水印',
  'pdf-split': 'PDF拆分,分割PDF,在线拆分',
  'jpg-to-pdf': '图片转PDF,JPG转PDF,在线转换',
  'pdf-lock': 'PDF加密,PDF加密码,在线加密',
  'pdf-unlock': 'PDF解密,去除PDF密码,在线解密',
  'pdf-to-image': 'PDF转图片,PDF转PNG,PDF转JPG',
  'audio-cut': '音频裁剪,切割音频,MP3裁剪',
  'audio-convert': '音频转换,MP3转换,WAV转换',
  'audio-compress': '音频压缩,减小音频大小',
  'video-to-gif': '视频转GIF,MP4转GIF,在线转换',
  'screen-recorder': '屏幕录制,录屏,在线录屏',
  'word-counter': '字数统计,文字计数,在线统计',
  'case-converter': '大小写转换,英文转换',
  'zh-converter': '简繁转换,繁体转换,简体转换',
  'date-calculator': '日期计算,日期差计算',
  'age-calculator': '年龄计算,周岁计算',
  'unit-converter': '单位换算,长度换算,重量换算',
  'color-converter': '颜色转换,HEX转换,RGB转换',
  'random-generator': '随机数生成,彩票生成',
  'ip-lookup': 'IP查询,IP归属地查询',
  'id-card-lookup': '身份证查询,身份证验证',
  'url-encoder': 'URL编码,URL解码,在线编解码',
  'html-entity': 'HTML实体,HTML编码,HTML解码',
  'text-sort': '文本排序,文字排序',
  'text-diff': '文本对比,文字差异比较',
  'markdown-preview': 'Markdown预览,Markdown编辑器',
  'markdown-to-pdf': 'Markdown转PDF,在线转换',
  'lorem-ipsum': '乱数假文,Lorem Ipsum生成',
  'text-to-speech': '文字转语音,TTS转换',
  'typing-speed': '打字测试,打字速度测试',
  'bmi-calculator': 'BMI计算,身体质量指数',
  'mortgage-calculator': '房贷计算,贷款计算',
  'cron-generator': 'Cron表达式,定时任务生成',
  'code-beautifier': '代码美化,代码格式化',
  'csv-to-json': 'CSV转JSON,数据转换',
  'jwt-decoder': 'JWT解码,Token解析',
  'gradient-generator': '渐变生成,CSS渐变',
  'box-shadow-generator': '阴影生成,CSS阴影',
  'hash-generator': '哈希生成,MD5生成,SHA加密',
  'password-strength': '密码强度,密码安全检测',
  'http-status': 'HTTP状态码,HTTP查询',
  'sql-formatter': 'SQL格式化,代码美化',
  'zip-tool': 'ZIP压缩,解压工具',
  'qr-decoder': '二维码解码,扫码工具',
  'image-bg-remove': '去背景,抠图工具,AI抠图',
  'nine-grid': '九宫格切图,图片分割',
  'image-filters': '图片滤镜,图片特效',
  'color-blind-simulator': '色盲测试,色觉测试',
  'regex-visualizer': '正则可视化,正则调试',
  'audio-extractor': '音频提取,视频提取音频',
};

async function getSeoSettings(db) {
  try {
    const rows = await db.prepare("SELECT `key`, `value` FROM site_settings WHERE `key` IN ('site_title','site_description','site_keywords')").all();
    const map = Object.fromEntries((rows || []).map(r => [r.key, r.value]));
    return {
      title: map.site_title || '全民影视VIP视频解析',
      description: map.site_description || '',
      keywords: map.site_keywords || '',
    };
  } catch {
    return { title: '全民影视VIP视频解析', description: '', keywords: '' };
  }
}

function injectSeoIntoHtml(html, seo) {
  let result = html;
  const safeTitle = escapeHtml(seo.title || '');
  const safeDesc = escapeHtml(seo.description || '');
  const safeKw = escapeHtml(seo.keywords || '');

  result = result.replace(/<title>.*?<\/title>/, `<title>${safeTitle}</title>`);

  const setMeta = (name, content) => {
    if (!content) return;
    const re = new RegExp(`<meta name="${name}" content=".*?"\\s*\\/?>`, 'i');
    const tag = `    <meta name="${name}" content="${content}" />`;
    if (re.test(result)) {
      result = result.replace(re, tag);
    } else {
      result = result.replace('</title>', `</title>\n${tag}`);
    }
  };

  const setOgMeta = (prop, content) => {
    if (!content) return;
    const re = new RegExp(`<meta property="og:${prop}" content=".*?"\\s*\\/?>`, 'i');
    const tag = `    <meta property="og:${prop}" content="${content}" />`;
    if (re.test(result)) {
      result = result.replace(re, tag);
    } else {
      result = result.replace('</title>', `</title>\n${tag}`);
    }
  };

  const setCanonical = (url) => {
    const re = /<link rel="canonical" href=".*?"\s*\/?>/i;
    const tag = `    <link rel="canonical" href="${url}" />`;
    if (re.test(result)) {
      result = result.replace(re, tag);
    }
  };

  const setTwitterMeta = (name, content) => {
    if (!content) return;
    const re = new RegExp(`<meta name="twitter:${name}" content=".*?"\\s*\\/?>`, 'i');
    const tag = `    <meta name="twitter:${name}" content="${content}" />`;
    if (re.test(result)) {
      result = result.replace(re, tag);
    } else {
      result = result.replace('</head>', `${tag}\n  </head>`);
    }
  };

  setMeta('description', safeDesc);
  setMeta('keywords', safeKw);
  setOgMeta('title', safeTitle);
  setOgMeta('description', safeDesc);
  setOgMeta('url', seo.canonical);
  setOgMeta('image', seo.ogImage || '/og-image.png');
  setTwitterMeta('title', safeTitle);
  setTwitterMeta('description', safeDesc);
  setTwitterMeta('image', seo.ogImage && !seo.ogImage.startsWith('/') ? seo.ogImage : (seo.ogImage || ''));
  if (seo.canonical) setCanonical(seo.canonical);

  if (seo.ldJson) {
    const ldTag = `    <script type="application/ld+json">\n    ${seo.ldJson}\n    </script>`;
    if (/<script type="application\/ld\+json">[\s\S]*?<\/script>/.test(result)) {
      result = result.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, ldTag);
    } else {
      result = result.replace('</head>', `${ldTag}\n  </head>`);
    }
  }

  if (!result.includes('hreflang')) {
    const hreflangTag = '    <link rel="alternate" hreflang="zh-CN" href="' + seo.canonical + '"/>\n    <link rel="alternate" hreflang="x-default" href="' + seo.canonical + '"/>';
    const canonicalMatch = result.match(/<link rel="canonical"[^>]*>/);
    if (canonicalMatch) {
      result = result.replace(canonicalMatch[0], canonicalMatch[0] + '\n' + hreflangTag);
    } else {
      result = result.replace('</head>', hreflangTag + '\n  </head>');
    }
  }

  return result;
}

function cleanText(s) {
  return String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function isLocalImg(src) {
  return !src || src.startsWith('/') || src.includes('ityvip.xyz') || src.includes('localhost');
}

function proxyImgUrl(src) {
  return isLocalImg(src) ? src : '/api/public/img-proxy?url=' + encodeURIComponent(src);
}

function buildArticleSeo(article) {
  const title = cleanText(article.title) + ' - 全民影视';
  const desc = cleanText(article.excerpt || article.title);
  const url = `${SITE_URL}/recommend/${article.slug}`;
  const img = article.cover_image
    ? proxyImgUrl(article.cover_image)
    : `${SITE_URL}/og-image.png`;
  const date = article.published_at ? new Date(article.published_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

  const breadLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "首页", "item": `${SITE_URL}/` },
      { "@type": "ListItem", "position": 2, "name": "影视推荐", "item": `${SITE_URL}/recommend` },
      { "@type": "ListItem", "position": 3, "name": cleanText(article.title), "item": url },
    ]
  });

  const articleLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": cleanText(article.title),
    "description": desc,
    "image": img,
    "datePublished": date,
    "author": { "@type": "Person", "name": cleanText(article.author || 'Scraper') },
    "publisher": { "@type": "Organization", "name": "全民影视" },
    "mainEntityOfPage": { "@type": "WebPage", "@id": url },
    "keywords": article.tags || '',
  });

  return {
    title,
    description: desc,
    keywords: article.tags || '影视推荐,文章',
    canonical: url,
    ogImage: article.cover_image
      ? proxyImgUrl(article.cover_image)
      : '/api/og-image?title=' + encodeURIComponent(cleanText(article.title).slice(0, 50)) + '&subtitle=' + encodeURIComponent(desc.slice(0, 80)) + '&type=article',
    ldJson: '[' + breadLd + ',' + articleLd + ']',
  };
}

async function pingSearchEngines(slug) {
  const urls = slug ? [`${SITE_URL}/recommend/${slug}`] : [`${SITE_URL}/sitemap.xml`];
  const results = [];
  const domain = SITE_URL.replace(/^https?:\/\//, '');
  const token = process.env.BAIDU_TOKEN || '';
  for (const url of urls) {
    try {
      const gr = await fetch('https://www.google.com/ping?sitemap=' + encodeURIComponent(url), { signal: AbortSignal.timeout(5000) });
      results.push('google:' + gr.status);
    } catch (e) { results.push('google:err:' + e.message); }
    if (token) {
      try {
        const br = await fetch(`http://data.zz.baidu.com/urls?site=${domain}&token=` + encodeURIComponent(token), { method: 'POST', body: url, headers: { 'Content-Type': 'text/plain' }, signal: AbortSignal.timeout(5000) });
        results.push('baidu:' + br.status);
      } catch (e) { results.push('baidu:err:' + e.message); }
    }
    if (slug) continue;
    try {
      const sg = await fetch('http://www.sogou.com/sitemap/ping.php?url=' + encodeURIComponent(url), { signal: AbortSignal.timeout(5000) });
      results.push('sogou:' + sg.status);
    } catch (e) { results.push('sogou:err:' + e.message); }
    try {
      const so = await fetch('https://www.so.com/sitemap/ping?sitemap=' + encodeURIComponent(url), { signal: AbortSignal.timeout(5000) });
      results.push('360:' + so.status);
    } catch (e) { results.push('360:err:' + e.message); }
  }
  return results;
}

module.exports = function registerSeoRoutes({ app, db, distPath }) {
  const fs = require('fs');
  const path = require('path');

  if (app._seoRoutesRegistered) {
    if (distPath) registerSSR(app, db, distPath);
    return;
  }
  app._seoRoutesRegistered = true;

  app.post('/api/ping-search-engines', async (req, res) => {
    const results = await pingSearchEngines();
    res.json({ success: true, results });
  });

  app.get('/api/ping-search-engines', async (req, res) => {
    const results = await pingSearchEngines();
    res.json({ success: true, results });
  });

  app.get('/sitemap.xml', async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const staticUrls = Object.keys(ROUTE_SEO).map(r => ({
      loc: `${SITE_URL}${r === '/' ? '/' : (r.split('/').filter(Boolean).length === 1 ? `${r}/` : r)}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: r === '/' ? '1.0' : '0.8',
    }));

    let articleUrls = [];
    try {
      const rows = await db.prepare('SELECT slug, published_at FROM articles WHERE is_published = 1 ORDER BY published_at DESC LIMIT 1000').all();
      articleUrls = (rows || []).map(r => ({
        loc: `${SITE_URL}/recommend/${r.slug}`,
        lastmod: r.published_at ? new Date(r.published_at).toISOString().split('T')[0] : today,
        changefreq: 'monthly',
        priority: '0.6',
      }));
    } catch { /* skip */ }

    const toolUrls = Object.keys(TOOL_SLUG_TITLES).map(slug => ({
      loc: `${SITE_URL}/tools/${slug}/`,
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.7',
    }));

    const mbtiUrls = MBTI_TYPE_SEO.map(m => ({
      loc: `${SITE_URL}/mbti/${m.code.toLowerCase()}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.6',
    }));

    const ASSESS_URLS = {
      disc: ['d','i','s','c'],
      bigfive: ['o','c','e','a','n'],
      enneagram: ['1','2','3','4','5','6','7','8','9'],
      riasec: ['r','i','a','s','e','c'],
      attachment: ['sa','ap','dl','fe'],
      love: ['lo','ro','co','fa','in','af','em'],
      eq: ['h','m','l'],
      iq: ['g','a','m','l'],
      'mental-health': ['n','m','h'],
    };
    const testUrls = Object.entries(ASSESS_URLS).flatMap(([slug, codes]) => [
      {
        loc: `${SITE_URL}/tests/${slug}/`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.5',
      },
      ...codes.map(code => ({
        loc: `${SITE_URL}/tests/${slug}/${code}/`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.5',
      })),
    ]);

    const allUrls = [...staticUrls, ...articleUrls, ...toolUrls, ...mbtiUrls, ...testUrls];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
      allUrls.map(u => `  <url>\n    <loc>${escapeHtml(u.loc)}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n')
    }\n</urlset>`;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  });

  app.get('/robots.txt', (req, res) => {
    const content = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /uploads/
Disallow: /*?s=
Disallow: /*?search=
Disallow: /api/*

Sitemap: ${SITE_URL}/sitemap.xml
Sitemap: ${SITE_URL}/videositemap.xml
Sitemap: ${SITE_URL}/imagesitemap.xml
`;
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(content);
  });

  app.get('/rss.xml', async (req, res) => {
    try {
      const rows = await db.prepare('SELECT slug, title, excerpt, category, published_at FROM articles WHERE is_published = 1 ORDER BY published_at DESC LIMIT 50').all();
      const items = (rows || []).map(a => `  <item>\n    <title>${escapeHtml(a.title)}</title>\n    <link>${SITE_URL}/recommend/${escapeHtml(a.slug)}</link>\n    <description>${escapeHtml((a.excerpt || a.title).replace(/<[^>]+>/g, '').slice(0, 500))}</description>\n    <category>${escapeHtml(a.category || '')}</category>\n    <pubDate>${a.published_at ? new Date(a.published_at).toUTCString() : new Date().toUTCString()}</pubDate>\n    <guid>${SITE_URL}/recommend/${escapeHtml(a.slug)}</guid>\n  </item>`).join('\n');
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n  <title>全民影视 - 影视推荐</title>\n  <link>${SITE_URL}/</link>\n  <description>精选影视推荐、使用技巧和最新内容</description>\n  <language>zh-cn</language>\n  <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>\n${items}\n</channel>\n</rss>`;
      res.set('Content-Type', 'application/rss+xml; charset=utf-8');
      res.set('Cache-Control', 'public, max-age=1800');
      res.send(xml);
    } catch (e) {
      res.status(500).send('RSS generation failed');
    }
  });

  app.get('/videositemap.xml', async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const videoPages = [
      { loc: `${SITE_URL}/parser/`, title: '短视频去水印 - 在线视频解析下载', desc: '免费在线视频解析下载工具，支持抖音、快手、B站等平台视频去水印下载' },
      { loc: `${SITE_URL}/m3u8/`, title: 'M3U8在线播放器 - HLS流媒体播放', desc: '免费在线M3U8视频播放器，支持HLS、MP4、WebM格式播放' },
      { loc: `${SITE_URL}/tools/video-downloader/`, title: '在线视频下载器 - 抖音/B站/快手去水印下载', desc: '免费在线视频下载工具，支持主流短视频平台视频解析下载' },
      { loc: `${SITE_URL}/tools/video-to-gif/`, title: '视频转GIF - 在线视频转GIF动图', desc: '免费在线视频转GIF工具，支持MP4、WebM转GIF动图' },
      { loc: `${SITE_URL}/tools/screen-recorder/`, title: '在线屏幕录制 - 免费录屏工具', desc: '免费在线屏幕录制工具，无需下载安装，支持录制屏幕和系统音频' },
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n${
      videoPages.map(v => `  <url>\n    <loc>${escapeHtml(v.loc)}</loc>\n    <video:video>\n      <video:title><![CDATA[${v.title}]]></video:title>\n      <video:description><![CDATA[${v.desc}]]></video:description>\n      <video:publication_date>${today}</video:publication_date>\n      <video:family_friendly>yes</video:family_friendly>\n    </video:video>\n  </url>`).join('\n')
    }\n</urlset>`;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  });

  app.get('/imagesitemap.xml', async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    let imageUrls = [];
    try {
      const rows = await db.prepare("SELECT slug, cover_image, title FROM articles WHERE is_published = 1 AND cover_image IS NOT NULL AND cover_image != '' ORDER BY published_at DESC LIMIT 1000").all();
      imageUrls = (rows || []).map(r => ({
        loc: `${SITE_URL}/recommend/${r.slug}`,
        image: r.cover_image,
        title: escapeHtml(r.title),
      }));
    } catch { /* skip */ }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${
      imageUrls.map(u => `  <url>\n    <loc>${escapeHtml(u.loc)}</loc>\n    <image:image>\n      <image:loc>${escapeHtml(u.image)}</image:loc>\n      <image:title><![CDATA[${u.title}]]></image:title>\n    </image:image>\n  </url>`).join('\n')
    }\n</urlset>`;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  });

  if (!distPath) return;

  registerSSR(app, db, distPath);

  console.log('[SEO] Dynamic SEO routes registered');
};

function registerSSR(app, db, distPath) {
  const fs = require('fs');
  const path = require('path');
  const { MemoryCache } = require('../cache');
  const htmlCache = new MemoryCache(3600);
  const ssrCache = new MemoryCache(30);
  const indexPath = path.join(distPath, 'index.html');

  function getRawHtml() {
    let raw = htmlCache.get('index.html');
    if (!raw) {
      raw = fs.readFileSync(indexPath, 'utf-8');
      htmlCache.set('index.html', raw, 3600 * 1000);
    }
    return raw;
  }

  app.get('*', async (req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ success: false, error: 'Not Found' });
      return;
    }

    const cachedHtml = ssrCache.get(req.path);
    if (cachedHtml) {
      res.set('Content-Type', 'text/html; charset=utf-8');
      res.set('X-SSR-Cache', 'hit');
      return res.send(cachedHtml);
    }

    const rawHtml = getRawHtml();
    let seo = null;
    const pathKey = req.path.replace(/\/$/, '') || '/';

    const articleMatch = req.path.match(/^\/recommend\/([^/]+)$/);
    if (articleMatch) {
      try {
        const article = await db.prepare('SELECT id, title, slug, excerpt, cover_image, author, category, tags, published_at FROM articles WHERE slug = ? AND is_published = 1').get(articleMatch[1]);
        if (article) {
          seo = buildArticleSeo(article);
        } else {
          res.status(404).set('X-Robots-Tag', 'noindex');
          const html404 = injectSeoIntoHtml(rawHtml, { title: '页面未找到 - 全民影视', description: '您访问的页面不存在', canonical: SITE_URL + '/404', ogImage: '/og-image.png', ldJson: '' });
          return res.send(html404);
        }
      } catch { /* skip */ }
    }

    if (!seo) {
      const mbtiMatch = req.path.match(/^\/mbti\/([a-z]+)$/);
      if (mbtiMatch) {
        const m = MBTI_TYPE_SEO.find(t => t.code.toLowerCase() === mbtiMatch[1].toLowerCase());
        if (m) {
          const mbtiUrl = `${SITE_URL}/mbti/${m.code.toLowerCase()}`;
          const mbtiKeywords = 'MBTI, 16型人格, ' + m.code + ', MBTI测试, 人格解析, 性格测试, 职业测试';
          seo = {
            title: m.title + ' - 全民影视',
            description: m.desc,
            keywords: mbtiKeywords,
            canonical: mbtiUrl,
            ogImage: '/api/og-image?title=' + encodeURIComponent(m.title.split(' - ')[0].slice(0, 50)) + '&subtitle=' + encodeURIComponent(m.desc.slice(0, 80)) + '&type=site',
            ldJson: [
              JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                  { "@type": "ListItem", "position": 1, "name": "首页", "item": `${SITE_URL}/` },
                  { "@type": "ListItem", "position": 2, "name": "MBTI 测试", "item": `${SITE_URL}/mbti` },
                  { "@type": "ListItem", "position": 3, "name": m.code }
                ]
              }),
              JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": m.title,
                "description": m.desc,
                "url": mbtiUrl,
                "author": { "@type": "Organization", "name": "全民影视" },
                "publisher": { "@type": "Organization", "name": "全民影视" },
                "mainEntityOfPage": { "@type": "WebPage", "@id": mbtiUrl },
              }),
            ].join('\n'),
          };
        }
      }
    }

    if (!seo) {
      const toolMatch = req.path.match(/^\/tools\/([a-z0-9-]+)$/);
      if (toolMatch) {
        const slug = toolMatch[1];
        const title = TOOL_SLUG_TITLES[slug];
        if (title) {
          const toolUrl = `${SITE_URL}/tools/${slug}`;
          const tags = TOOL_TAGS[slug] || slug.replace(/-/g, ' ') + '工具';
          const toolDesc = '免费在线' + slug.replace(/-/g, ' ') + '工具';
          seo = {
            title,
            description: toolDesc + '，浏览器中直接使用，无需下载安装。' + (tags ? '相关功能：' + tags : ''),
            ogImage: '/api/og-image?title=' + encodeURIComponent(title.split(' - ')[0].slice(0, 50)) + '&subtitle=' + encodeURIComponent(toolDesc.slice(0, 80)) + '&type=tool',
            keywords: (tags ? tags + ', ' : '') + TOOL_SLUG_KEYWORDS,
            canonical: toolUrl,
            ldJson: [
              JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                  { "@type": "ListItem", "position": 1, "name": "首页", "item": `${SITE_URL}/` },
                  { "@type": "ListItem", "position": 2, "name": "在线工具", "item": `${SITE_URL}/tools` },
                  { "@type": "ListItem", "position": 3, "name": title.split(' - ')[0] }
                ]
              }),
              JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": title.split(' - ')[0],
                "url": toolUrl,
                "description": toolDesc + '，浏览器中直接使用，无需下载安装。',
                "applicationCategory": "UtilitiesApplication",
                "operatingSystem": "All",
                "browserRequirements": "Requires JavaScript"
              }),
            ].join('\n'),
          };
        } else {
          res.status(404).set('X-Robots-Tag', 'noindex');
          const html404 = injectSeoIntoHtml(rawHtml, { title: '页面未找到 - 全民影视', description: '您访问的工具不存在', canonical: SITE_URL + '/404', ogImage: '/og-image.png', ldJson: '' });
          return res.send(html404);
        }
      }
    }

    if (!seo && ROUTE_SEO[pathKey]) {
      const r = ROUTE_SEO[pathKey];
      const pageUrl = `${SITE_URL}${pathKey}`;
      const isRoot = pathKey === '/';
      const orgSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "全民影视",
        "url": SITE_URL,
        "logo": SITE_URL + "/og-image.png",
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "support@ityvip.xyz",
          "contactType": "customer support",
          "availableLanguage": ["Chinese", "English"]
        }
      };
      const siteSchema = {
        "@context": "https://schema.org",
        "@type": isRoot ? 'WebSite' : 'WebPage',
        "name": r.title,
        "url": pageUrl,
        "description": r.desc,
        ...(isRoot ? {
          potentialAction: {
            "@type": "SearchAction",
            "target": pageUrl + "/parser?url={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        } : {}),
      };
      seo = {
        title: r.title,
        description: r.desc,
        keywords: r.keywords,
        canonical: pageUrl,
        ogImage: '/api/og-image?title=' + encodeURIComponent(r.title.split(' - ')[0].slice(0, 50)) + '&subtitle=' + encodeURIComponent(r.desc.slice(0, 80)) + '&type=site',
        ldJson: isRoot ? '[' + JSON.stringify(orgSchema) + ',' + JSON.stringify(siteSchema) + ']' : JSON.stringify(siteSchema),
      };
    }

    if (!seo) {
      seo = await getSeoSettings(db);
      seo.canonical = `${SITE_URL}${pathKey}`;
      seo.ogImage = '/og-image.png';
    }

    const html = injectSeoIntoHtml(rawHtml, seo);
    res.set('Content-Type', 'text/html; charset=utf-8');
    ssrCache.set(req.path, html);
    res.send(html);
  });
}

module.exports.pingSearchEngines = pingSearchEngines;
module.exports.TOOL_TAGS = TOOL_TAGS;
module.exports.TOOL_SLUG_TITLES = TOOL_SLUG_TITLES;
