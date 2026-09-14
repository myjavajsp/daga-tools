import React, { Suspense, lazy } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const lazyImport = (name) => lazy(() => import('../components/tools/' + name));

// 懒加载所有工具组件
const ImageCompress = lazyImport('ImageCompress');
const ImageConvert = lazyImport('ImageConvert');
const ImageCrop = lazyImport('ImageCrop');
const ImageOCR = lazyImport('ImageOCR');
const ImageWatermark = lazyImport('ImageWatermark');
const ImageRemoveWatermark = lazyImport('ImageRemoveWatermark');
const ImageNineGrid = lazyImport('ImageNineGrid');
const ImageBgRemove = lazyImport('ImageBgRemove');
const ImageUpscaler = lazyImport('ImageUpscaler');
const ImageEditor = lazyImport('ImageEditor');
const ImageFilters = lazyImport('ImageFilters');
const QRDecoder = lazyImport('QRDecoder');
const Maker = lazyImport('Maker');
const PdfMerge = lazyImport('PdfMerge');
const PdfSplit = lazyImport('PdfSplit');
const PdfCompress = lazyImport('PdfCompress');
const JpgToPdf = lazyImport('JpgToPdf');
const PdfLock = lazyImport('PdfLock');
const PdfUnlock = lazyImport('PdfUnlock');
const PdfToImage = lazyImport('PdfToImage');
const PdfToWord = lazyImport('PdfToWord');
const AudioCut = lazyImport('AudioCut');
const AudioConvert = lazyImport('AudioConvert');
const AudioCompress = lazyImport('AudioCompress');
const AudioExtractor = lazyImport('AudioExtractor');
const WordCounter = lazyImport('WordCounter');
const CaseConverter = lazyImport('CaseConverter');
const ZhConverter = lazyImport('ZhConverter');
const RegexTester = lazyImport('RegexTester');
const JsonFormatter = lazyImport('JsonFormatter');
const Base64Tool = lazyImport('Base64Tool');
const UrlEncoder = lazyImport('UrlEncoder');
const HtmlEntity = lazyImport('HtmlEntity');
const TextSort = lazyImport('TextSort');
const TextDiff = lazyImport('TextDiff');
const MarkdownPreview = lazyImport('MarkdownPreview');
const MarkdownToPdf = lazyImport('MarkdownToPdf');
const LoremIpsum = lazyImport('LoremIpsum');
const TextToSpeech = lazyImport('TextToSpeech');
const NovelReader = lazyImport('NovelReader');
const DateCalculator = lazyImport('DateCalculator');
const AgeCalculator = lazyImport('AgeCalculator');
const UnitConverter = lazyImport('UnitConverter');
const ColorConverter = lazyImport('ColorConverter');
const AiPrompt = lazyImport('AiPrompt');
const VideoPrompt = lazyImport('VideoPrompt');
const AiWriter = lazyImport('AiWriter');
const VoiceoverScript = lazyImport('VoiceoverScript');
const ShortDramaScript = lazyImport('ShortDramaScript');
const XiaohongshuCopy = lazyImport('XiaohongshuCopy');
const DouyinScript = lazyImport('DouyinScript');
const HeadlineSlogan = lazyImport('HeadlineSlogan');
const GreetingGenerator = lazyImport('GreetingGenerator');
const MomentsCopy = lazyImport('MomentsCopy');
const StoryboardGenerator = lazyImport('StoryboardGenerator');
const CharacterSheet = lazyImport('CharacterSheet');
const VideoDownloader = lazyImport('VideoDownloader');
const VideoToGif = lazyImport('VideoToGif');
const ScreenRecorder = lazyImport('ScreenRecorder');
const M3u8Player = lazyImport('M3u8Player');
const QRCodeGen = lazyImport('QRCodeGen');
const ZipTool = lazyImport('ZipTool');
const PhoneLookup = lazyImport('PhoneLookup');
const IdCardLookup = lazyImport('IdCardLookup');
const IpLookup = lazyImport('IpLookup');
const RandomGenerator = lazyImport('RandomGenerator');
const HttpStatus = lazyImport('HttpStatus');
const SqlFormatter = lazyImport('SqlFormatter');
const HashGenerator = lazyImport('HashGenerator');
const PasswordStrength = lazyImport('PasswordStrength');
const TimerStopwatch = lazyImport('TimerStopwatch');
const GradientGenerator = lazyImport('GradientGenerator');
const BoxShadowGenerator = lazyImport('BoxShadowGenerator');
const CsvToJson = lazyImport('CsvToJson');
const JwtDecoder = lazyImport('JwtDecoder');
const TypingSpeed = lazyImport('TypingSpeed');
const BmiCalculator = lazyImport('BmiCalculator');
const MortgageCalculator = lazyImport('MortgageCalculator');
const CronGenerator = lazyImport('CronGenerator');
const CodeBeautifier = lazyImport('CodeBeautifier');
const ColorBlindSimulator = lazyImport('ColorBlindSimulator');
const RegexVisualizer = lazyImport('RegexVisualizer');
const TimestampConverter = lazyImport('TimestampConverter');
const PasswordGenerator = lazyImport('PasswordGenerator');
const UuidGenerator = lazyImport('UuidGenerator');
const FileHashCalculator = lazyImport('FileHashCalculator');
const ExcelViewer = lazyImport('ExcelViewer');
const HtmlToMarkdown = lazyImport('HtmlToMarkdown');
const NumberBaseConverter = lazyImport('NumberBaseConverter');

const toolComponents = {
  // 图片工具
  'compress': ImageCompress,
  'convert': ImageConvert,
  'crop': ImageCrop,
  'ocr': ImageOCR,
  'watermark': ImageWatermark,
  'remove-watermark': ImageRemoveWatermark,
  'nine-grid': ImageNineGrid,
  'image-bg-remove': ImageBgRemove,
  'image-upscaler': ImageUpscaler,
  'image-editor': ImageEditor,
  'image-filters': ImageFilters,
  'qr-decoder': QRDecoder,
  'maker': Maker,
  // PDF工具
  'pdf-merge': PdfMerge,
  'pdf-split': PdfSplit,
  'pdf-compress': PdfCompress,
  'jpg-to-pdf': JpgToPdf,
  'pdf-lock': PdfLock,
  'pdf-unlock': PdfUnlock,
  'pdf-to-image': PdfToImage,
  'pdf-to-word': PdfToWord,
  // 音频工具
  'audio-cut': AudioCut,
  'audio-convert': AudioConvert,
  'audio-compress': AudioCompress,
  'audio-extractor': AudioExtractor,
  // 文本工具
  'word-counter': WordCounter,
  'case-converter': CaseConverter,
  'zh-converter': ZhConverter,
  'regex-tester': RegexTester,
  'json-formatter': JsonFormatter,
  'base64-tool': Base64Tool,
  'url-encoder': UrlEncoder,
  'html-entity': HtmlEntity,
  'text-sort': TextSort,
  'text-diff': TextDiff,
  'markdown-preview': MarkdownPreview,
  'markdown-to-pdf': MarkdownToPdf,
  'lorem-ipsum': LoremIpsum,
  'text-to-speech': TextToSpeech,
  'novel-reader': NovelReader,
  'html-to-markdown': HtmlToMarkdown,
  // 换算工具
  'date-calculator': DateCalculator,
  'age-calculator': AgeCalculator,
  'unit-converter': UnitConverter,
  'color-converter': ColorConverter,
  'timestamp-converter': TimestampConverter,
  'number-base-converter': NumberBaseConverter,
  // AI工具
  'ai-prompt': AiPrompt,
  'video-prompt': VideoPrompt,
  'ai-writer': AiWriter,
  'voiceover-script': VoiceoverScript,
  'short-drama-script': ShortDramaScript,
  'xiaohongshu-copy': XiaohongshuCopy,
  'douyin-script': DouyinScript,
  'headline-slogan': HeadlineSlogan,
  'greeting-generator': GreetingGenerator,
  'moments-copy': MomentsCopy,
  'storyboard-generator': StoryboardGenerator,
  'character-sheet': CharacterSheet,
  // 视频工具
  'video-downloader': VideoDownloader,
  'video-to-gif': VideoToGif,
  'screen-recorder': ScreenRecorder,
  'm3u8-player': M3u8Player,
  // 其他工具
  'qr-code-gen': QRCodeGen,
  'zip-tool': ZipTool,
  'phone-lookup': PhoneLookup,
  'id-card-lookup': IdCardLookup,
  'ip-lookup': IpLookup,
  'random-generator': RandomGenerator,
  'http-status': HttpStatus,
  'sql-formatter': SqlFormatter,
  'hash-generator': HashGenerator,
  'password-strength': PasswordStrength,
  'password-generator': PasswordGenerator,
  'timer-stopwatch': TimerStopwatch,
  'gradient-generator': GradientGenerator,
  'box-shadow-generator': BoxShadowGenerator,
  'csv-to-json': CsvToJson,
  'jwt-decoder': JwtDecoder,
  'typing-speed': TypingSpeed,
  'bmi-calculator': BmiCalculator,
  'mortgage-calculator': MortgageCalculator,
  'cron-generator': CronGenerator,
  'code-beautifier': CodeBeautifier,
  'color-blind-simulator': ColorBlindSimulator,
  'regex-visualizer': RegexVisualizer,
  'file-hash-calculator': FileHashCalculator,
  'uuid-generator': UuidGenerator,
  'excel-viewer': ExcelViewer,
};

const toolMetadata = {
  'compress': { name: '图片压缩', desc: '在线图片压缩工具，免费压缩JPG、PNG、WebP图片文件大小。' },
  'convert': { name: '格式转换', desc: '在线图片格式转换工具，支持PNG、JPG、WebP等格式互转。' },
  'crop': { name: '图片裁剪', desc: '在线图片裁剪工具，支持自由裁剪和预设比例裁剪。' },
  'ocr': { name: '文字识别', desc: '在线文字识别OCR工具，从图片中提取文字。' },
  'watermark': { name: '添加水印', desc: '在线图片水印工具，给图片添加文字水印。' },
  'remove-watermark': { name: '去水印', desc: '在线去水印工具，去除图片中的水印。' },
  'nine-grid': { name: '九宫格切图', desc: '在线九宫格切图工具，一张图片切成九张。' },
  'image-bg-remove': { name: '去背景', desc: '在线AI图片去背景工具。' },
  'image-upscaler': { name: '图片放大', desc: '在线图片无损放大工具。' },
  'image-editor': { name: '在线PS', desc: '在线图片编辑器，支持调色、滤镜等功能。' },
  'image-filters': { name: '图片滤镜', desc: '在线图片滤镜工具，多种特效可选。' },
  'qr-decoder': { name: '二维码解码', desc: '在线二维码解码识别工具。' },
  'maker': { name: '制图', desc: '在线图片制图设计工具。' },
  'pdf-merge': { name: 'PDF合并', desc: '在线PDF合并工具，合并多个PDF文件。' },
  'pdf-split': { name: 'PDF拆分', desc: '在线PDF拆分工具，提取指定页面。' },
  'pdf-compress': { name: 'PDF压缩', desc: '在线PDF压缩工具，减小文件大小。' },
  'jpg-to-pdf': { name: '图片转PDF', desc: '在线JPG图片转PDF工具。' },
  'pdf-lock': { name: 'PDF加密', desc: '在线PDF加密工具，设置密码保护。' },
  'pdf-unlock': { name: 'PDF解密', desc: '在线PDF解密工具，移除密码保护。' },
  'pdf-to-image': { name: 'PDF转图片', desc: '在线PDF转图片工具。' },
  'pdf-to-word': { name: 'PDF转Word', desc: '在线PDF转Word工具。' },
  'audio-cut': { name: '音频裁剪', desc: '在线音频裁剪工具，截取音频片段。' },
  'audio-convert': { name: '音频格式转换', desc: '在线音频格式转换工具。' },
  'audio-compress': { name: '音频压缩', desc: '在线音频压缩工具。' },
  'audio-extractor': { name: '音频提取', desc: '在线视频音频提取工具。' },
  'word-counter': { name: '字数统计', desc: '在线字数统计工具，支持中英文统计。' },
  'case-converter': { name: '大小写转换', desc: '在线文本大小写转换工具。' },
  'zh-converter': { name: '简繁转换', desc: '在线简体中文繁体中文转换工具。' },
  'regex-tester': { name: '正则测试', desc: '在线正则表达式测试工具。' },
  'json-formatter': { name: 'JSON格式化', desc: '在线JSON格式化和校验工具。' },
  'base64-tool': { name: 'Base64编解码', desc: '在线Base64编码解码工具。' },
  'url-encoder': { name: 'URL编解码', desc: '在线URL编码解码工具。' },
  'html-entity': { name: 'HTML实体转换', desc: '在线HTML实体转换工具。' },
  'text-sort': { name: '文本排序', desc: '在线文本排序工具。' },
  'text-diff': { name: '文本对比', desc: '在线文本对比工具。' },
  'markdown-preview': { name: 'Markdown预览', desc: '在线Markdown实时预览工具。' },
  'markdown-to-pdf': { name: 'Markdown转PDF', desc: '在线Markdown转PDF工具。' },
  'lorem-ipsum': { name: 'Lorem Ipsum', desc: '在线占位文本生成器。' },
  'text-to-speech': { name: '文字转语音', desc: '在线文字转语音朗读工具。' },
  'novel-reader': { name: '小说阅读器', desc: '在线小说阅读工具。' },
  'html-to-markdown': { name: 'HTML转Markdown', desc: '在线HTML转Markdown格式工具。' },
  'date-calculator': { name: '日期计算器', desc: '在线日期计算工具，计算日期差。' },
  'age-calculator': { name: '年龄计算器', desc: '在线年龄计算器，根据生日计算年龄。' },
  'unit-converter': { name: '单位换算', desc: '在线长度、重量、温度等单位换算工具。' },
  'color-converter': { name: '颜色转换', desc: '在线HEX/RGB/HSL颜色转换工具。' },
  'timestamp-converter': { name: '时间戳转换', desc: 'Unix时间戳与日期时间互相转换工具。' },
  'number-base-converter': { name: '进制转换', desc: '二进制/八进制/十进制/十六进制互转。' },
  'ai-prompt': { name: 'AI绘画提示词', desc: 'AI绘画提示词生成器，提升出图质量。' },
  'video-prompt': { name: 'AI视频提示词', desc: 'AI视频生成提示词工具。' },
  'ai-writer': { name: 'AI写作助手', desc: 'AI内容创作写作助手。' },
  'voiceover-script': { name: '配音脚本', desc: '视频配音脚本生成器。' },
  'short-drama-script': { name: '短剧脚本', desc: '短视频剧本创作工具。' },
  'xiaohongshu-copy': { name: '小红书文案', desc: '小红书平台文案创作工具。' },
  'douyin-script': { name: '抖音脚本', desc: '抖音短视频脚本生成器。' },
  'headline-slogan': { name: '标题标语', desc: '创意标题标语生成器。' },
  'greeting-generator': { name: '节日祝福', desc: '节日祝福语生成器。' },
  'moments-copy': { name: '朋友圈文案', desc: '朋友圈文案生成器。' },
  'storyboard-generator': { name: '分镜脚本', desc: '视频分镜脚本生成器。' },
  'character-sheet': { name: '角色设定卡', desc: '角色属性设定卡片生成器。' },
  'video-downloader': { name: '视频下载器', desc: '在线视频下载解析工具。' },
  'video-to-gif': { name: '视频转GIF', desc: '在线视频转GIF动图工具。' },
  'screen-recorder': { name: '录屏', desc: '在线屏幕录制工具。' },
  'm3u8-player': { name: 'M3U8播放', desc: '在线M3U8视频流播放器。' },
  'qr-code-gen': { name: '二维码生成', desc: '在线生成二维码图片工具。' },
  'zip-tool': { name: 'ZIP压缩解压', desc: '在线ZIP文件压缩工具。' },
  'phone-lookup': { name: '手机号查询', desc: '在线手机号码归属地查询工具。' },
  'id-card-lookup': { name: '身份证查询', desc: '身份证号码信息查询工具。' },
  'ip-lookup': { name: 'IP归属地', desc: '在线IP地址归属地查询工具。' },
  'random-generator': { name: '随机生成器', desc: '在线随机数和字符串生成工具。' },
  'http-status': { name: 'HTTP状态码', desc: 'HTTP状态码查询手册。' },
  'sql-formatter': { name: 'SQL格式化', desc: '在线SQL语句格式化工具。' },
  'hash-generator': { name: '哈希生成', desc: '在线MD5/SHA哈希值生成工具。' },
  'password-strength': { name: '密码强度', desc: '在线密码强度检测工具。' },
  'password-generator': { name: '密码生成器', desc: '在线生成高强度随机密码工具。' },
  'timer-stopwatch': { name: '计时器/秒表', desc: '在线计时器和秒表工具，支持倒计时。' },
  'gradient-generator': { name: '渐变色生成', desc: '在线CSS渐变色生成器。' },
  'box-shadow-generator': { name: 'Box Shadow', desc: '在线CSS阴影生成器。' },
  'csv-to-json': { name: 'CSV/JSON互转', desc: '在线CSV和JSON格式互转工具。' },
  'jwt-decoder': { name: 'JWT解码', desc: '在线JWT Token解码工具。' },
  'typing-speed': { name: '打字速度测试', desc: '在线打字速度测试工具。' },
  'bmi-calculator': { name: 'BMI计算器', desc: '在线身体质量指数计算器。' },
  'mortgage-calculator': { name: '房贷计算器', desc: '在线房贷月供计算器。' },
  'cron-generator': { name: 'Cron表达式生成器', desc: '在线Cron定时任务表达式生成器。' },
  'code-beautifier': { name: '代码美化', desc: '在线代码美化和压缩工具。' },
  'color-blind-simulator': { name: '色盲模拟器', desc: '在线色盲视角模拟工具。' },
  'regex-visualizer': { name: '正则可视化', desc: '在线正则表达式可视化工具。' },
  'file-hash-calculator': { name: '文件哈希', desc: '在线计算文件MD5/SHA哈希值工具。' },
  'uuid-generator': { name: 'UUID生成器', desc: '在线生成UUID随机字符串工具。' },
  'excel-viewer': { name: 'Excel查看器', desc: '在线查看Excel表格文件工具。' },
};

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500"></div>
    </div>
  );
}

export default function ToolDetailPage() {
  const { toolKey } = useParams();
  const navigate = useNavigate();
  const ToolComponent = toolComponents[toolKey];
  const metadata = toolMetadata[toolKey] || { name: toolKey, desc: '' };

  if (!ToolComponent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">工具不存在</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">该工具暂未开放，敬请期待</p>
          <button onClick={() => navigate('/tools/')} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all">返回工具列表</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link to="/tools/" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-6">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          <span>返回工具列表</span>
        </Link>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg">🔧</div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{metadata.name}</h1>
              <p className="text-gray-500 dark:text-gray-400">{metadata.desc}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
          <Suspense fallback={<LoadingFallback />}>
            <ToolComponent />
          </Suspense>
        </div>
      </div>
      <Footer />
    </div>
  );
}
