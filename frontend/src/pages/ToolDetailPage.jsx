import React, { Suspense, lazy } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useEffect } from 'react';

const lazyImport = (name) => lazy(() => import('../components/tools/' + name));

// 鎳掑姞杞芥墍鏈夊伐鍏风粍浠?const ImageCompress = lazyImport('ImageCompress');
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
  // 鍥剧墖宸ュ叿
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
  // PDF宸ュ叿
  'pdf-merge': PdfMerge,
  'pdf-split': PdfSplit,
  'pdf-compress': PdfCompress,
  'jpg-to-pdf': JpgToPdf,
  'pdf-lock': PdfLock,
  'pdf-unlock': PdfUnlock,
  'pdf-to-image': PdfToImage,
  'pdf-to-word': PdfToWord,
  // 闊抽宸ュ叿
  'audio-cut': AudioCut,
  'audio-convert': AudioConvert,
  'audio-compress': AudioCompress,
  'audio-extractor': AudioExtractor,
  // 鏂囨湰宸ュ叿
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
  // 鎹㈢畻宸ュ叿
  'date-calculator': DateCalculator,
  'age-calculator': AgeCalculator,
  'unit-converter': UnitConverter,
  'color-converter': ColorConverter,
  'timestamp-converter': TimestampConverter,
  'number-base-converter': NumberBaseConverter,
  // AI宸ュ叿
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
  // 瑙嗛宸ュ叿
  'video-downloader': VideoDownloader,
  'video-to-gif': VideoToGif,
  'screen-recorder': ScreenRecorder,
  'm3u8-player': M3u8Player,
  // 鍏朵粬宸ュ叿
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
  'compress': { name: '鍥剧墖鍘嬬缉', desc: '鍦ㄧ嚎鍥剧墖鍘嬬缉宸ュ叿锛屽厤璐瑰帇缂㎎PG銆丳NG銆乄ebP鍥剧墖鏂囦欢澶у皬銆? },
  'convert': { name: '鏍煎紡杞崲', desc: '鍦ㄧ嚎鍥剧墖鏍煎紡杞崲宸ュ叿锛屾敮鎸丳NG銆丣PG銆乄ebP绛夋牸寮忎簰杞€? },
  'crop': { name: '鍥剧墖瑁佸壀', desc: '鍦ㄧ嚎鍥剧墖瑁佸壀宸ュ叿锛屾敮鎸佽嚜鐢辫鍓拰棰勮姣斾緥瑁佸壀銆? },
  'ocr': { name: '鏂囧瓧璇嗗埆', desc: '鍦ㄧ嚎鏂囧瓧璇嗗埆OCR宸ュ叿锛屼粠鍥剧墖涓彁鍙栨枃瀛椼€? },
  'watermark': { name: '娣诲姞姘村嵃', desc: '鍦ㄧ嚎鍥剧墖姘村嵃宸ュ叿锛岀粰鍥剧墖娣诲姞鏂囧瓧姘村嵃銆? },
  'remove-watermark': { name: '鍘绘按鍗?, desc: '鍦ㄧ嚎鍘绘按鍗板伐鍏凤紝鍘婚櫎鍥剧墖涓殑姘村嵃銆? },
  'nine-grid': { name: '涔濆鏍煎垏鍥?, desc: '鍦ㄧ嚎涔濆鏍煎垏鍥惧伐鍏凤紝涓€寮犲浘鐗囧垏鎴愪節寮犮€? },
  'image-bg-remove': { name: '鍘昏儗鏅?, desc: '鍦ㄧ嚎AI鍥剧墖鍘昏儗鏅伐鍏枫€? },
  'image-upscaler': { name: '鍥剧墖鏀惧ぇ', desc: '鍦ㄧ嚎鍥剧墖鏃犳崯鏀惧ぇ宸ュ叿銆? },
  'image-editor': { name: '鍦ㄧ嚎PS', desc: '鍦ㄧ嚎鍥剧墖缂栬緫鍣紝鏀寔璋冭壊銆佹护闀滅瓑鍔熻兘銆? },
  'image-filters': { name: '鍥剧墖婊ら暅', desc: '鍦ㄧ嚎鍥剧墖婊ら暅宸ュ叿锛屽绉嶇壒鏁堝彲閫夈€? },
  'qr-decoder': { name: '浜岀淮鐮佽В鐮?, desc: '鍦ㄧ嚎浜岀淮鐮佽В鐮佽瘑鍒伐鍏枫€? },
  'maker': { name: '鍒跺浘', desc: '鍦ㄧ嚎鍥剧墖鍒跺浘璁捐宸ュ叿銆? },
  'pdf-merge': { name: 'PDF鍚堝苟', desc: '鍦ㄧ嚎PDF鍚堝苟宸ュ叿锛屽悎骞跺涓狿DF鏂囦欢銆? },
  'pdf-split': { name: 'PDF鎷嗗垎', desc: '鍦ㄧ嚎PDF鎷嗗垎宸ュ叿锛屾彁鍙栨寚瀹氶〉闈€? },
  'pdf-compress': { name: 'PDF鍘嬬缉', desc: '鍦ㄧ嚎PDF鍘嬬缉宸ュ叿锛屽噺灏忔枃浠跺ぇ灏忋€? },
  'jpg-to-pdf': { name: '鍥剧墖杞琍DF', desc: '鍦ㄧ嚎JPG鍥剧墖杞琍DF宸ュ叿銆? },
  'pdf-lock': { name: 'PDF鍔犲瘑', desc: '鍦ㄧ嚎PDF鍔犲瘑宸ュ叿锛岃缃瘑鐮佷繚鎶ゃ€? },
  'pdf-unlock': { name: 'PDF瑙ｅ瘑', desc: '鍦ㄧ嚎PDF瑙ｅ瘑宸ュ叿锛岀Щ闄ゅ瘑鐮佷繚鎶ゃ€? },
  'pdf-to-image': { name: 'PDF杞浘鐗?, desc: '鍦ㄧ嚎PDF杞浘鐗囧伐鍏枫€? },
  'pdf-to-word': { name: 'PDF杞琖ord', desc: '鍦ㄧ嚎PDF杞琖ord宸ュ叿銆? },
  'audio-cut': { name: '闊抽瑁佸壀', desc: '鍦ㄧ嚎闊抽瑁佸壀宸ュ叿锛屾埅鍙栭煶棰戠墖娈点€? },
  'audio-convert': { name: '闊抽鏍煎紡杞崲', desc: '鍦ㄧ嚎闊抽鏍煎紡杞崲宸ュ叿銆? },
  'audio-compress': { name: '闊抽鍘嬬缉', desc: '鍦ㄧ嚎闊抽鍘嬬缉宸ュ叿銆? },
  'audio-extractor': { name: '闊抽鎻愬彇', desc: '鍦ㄧ嚎瑙嗛闊抽鎻愬彇宸ュ叿銆? },
  'word-counter': { name: '瀛楁暟缁熻', desc: '鍦ㄧ嚎瀛楁暟缁熻宸ュ叿锛屾敮鎸佷腑鑻辨枃缁熻銆? },
  'case-converter': { name: '澶у皬鍐欒浆鎹?, desc: '鍦ㄧ嚎鏂囨湰澶у皬鍐欒浆鎹㈠伐鍏枫€? },
  'zh-converter': { name: '绠€绻佽浆鎹?, desc: '鍦ㄧ嚎绠€浣撲腑鏂囩箒浣撲腑鏂囪浆鎹㈠伐鍏枫€? },
  'regex-tester': { name: '姝ｅ垯娴嬭瘯', desc: '鍦ㄧ嚎姝ｅ垯琛ㄨ揪寮忔祴璇曞伐鍏枫€? },
  'json-formatter': { name: 'JSON鏍煎紡鍖?, desc: '鍦ㄧ嚎JSON鏍煎紡鍖栧拰鏍￠獙宸ュ叿銆? },
  'base64-tool': { name: 'Base64缂栬В鐮?, desc: '鍦ㄧ嚎Base64缂栫爜瑙ｇ爜宸ュ叿銆? },
  'url-encoder': { name: 'URL缂栬В鐮?, desc: '鍦ㄧ嚎URL缂栫爜瑙ｇ爜宸ュ叿銆? },
  'html-entity': { name: 'HTML瀹炰綋杞崲', desc: '鍦ㄧ嚎HTML瀹炰綋杞崲宸ュ叿銆? },
  'text-sort': { name: '鏂囨湰鎺掑簭', desc: '鍦ㄧ嚎鏂囨湰鎺掑簭宸ュ叿銆? },
  'text-diff': { name: '鏂囨湰瀵规瘮', desc: '鍦ㄧ嚎鏂囨湰瀵规瘮宸ュ叿銆? },
  'markdown-preview': { name: 'Markdown棰勮', desc: '鍦ㄧ嚎Markdown瀹炴椂棰勮宸ュ叿銆? },
  'markdown-to-pdf': { name: 'Markdown杞琍DF', desc: '鍦ㄧ嚎Markdown杞琍DF宸ュ叿銆? },
  'lorem-ipsum': { name: 'Lorem Ipsum', desc: '鍦ㄧ嚎鍗犱綅鏂囨湰鐢熸垚鍣ㄣ€? },
  'text-to-speech': { name: '鏂囧瓧杞闊?, desc: '鍦ㄧ嚎鏂囧瓧杞闊虫湕璇诲伐鍏枫€? },
  'novel-reader': { name: '灏忚闃呰鍣?, desc: '鍦ㄧ嚎灏忚闃呰宸ュ叿銆? },
  'html-to-markdown': { name: 'HTML杞琈arkdown', desc: '鍦ㄧ嚎HTML杞琈arkdown鏍煎紡宸ュ叿銆? },
  'date-calculator': { name: '鏃ユ湡璁＄畻鍣?, desc: '鍦ㄧ嚎鏃ユ湡璁＄畻宸ュ叿锛岃绠楁棩鏈熷樊銆? },
  'age-calculator': { name: '骞撮緞璁＄畻鍣?, desc: '鍦ㄧ嚎骞撮緞璁＄畻鍣紝鏍规嵁鐢熸棩璁＄畻骞撮緞銆? },
  'unit-converter': { name: '鍗曚綅鎹㈢畻', desc: '鍦ㄧ嚎闀垮害銆侀噸閲忋€佹俯搴︾瓑鍗曚綅鎹㈢畻宸ュ叿銆? },
  'color-converter': { name: '棰滆壊杞崲', desc: '鍦ㄧ嚎HEX/RGB/HSL棰滆壊杞崲宸ュ叿銆? },
  'timestamp-converter': { name: '鏃堕棿鎴宠浆鎹?, desc: 'Unix鏃堕棿鎴充笌鏃ユ湡鏃堕棿浜掔浉杞崲宸ュ叿銆? },
  'number-base-converter': { name: '杩涘埗杞崲', desc: '浜岃繘鍒?鍏繘鍒?鍗佽繘鍒?鍗佸叚杩涘埗浜掕浆銆? },
  'ai-prompt': { name: 'AI缁樼敾鎻愮ず璇?, desc: 'AI缁樼敾鎻愮ず璇嶇敓鎴愬櫒锛屾彁鍗囧嚭鍥捐川閲忋€? },
  'video-prompt': { name: 'AI瑙嗛鎻愮ず璇?, desc: 'AI瑙嗛鐢熸垚鎻愮ず璇嶅伐鍏枫€? },
  'ai-writer': { name: 'AI鍐欎綔鍔╂墜', desc: 'AI鍐呭鍒涗綔鍐欎綔鍔╂墜銆? },
  'voiceover-script': { name: '閰嶉煶鑴氭湰', desc: '瑙嗛閰嶉煶鑴氭湰鐢熸垚鍣ㄣ€? },
  'short-drama-script': { name: '鐭墽鑴氭湰', desc: '鐭棰戝墽鏈垱浣滃伐鍏枫€? },
  'xiaohongshu-copy': { name: '灏忕孩涔︽枃妗?, desc: '灏忕孩涔﹀钩鍙版枃妗堝垱浣滃伐鍏枫€? },
  'douyin-script': { name: '鎶栭煶鑴氭湰', desc: '鎶栭煶鐭棰戣剼鏈敓鎴愬櫒銆? },
  'headline-slogan': { name: '鏍囬鏍囪', desc: '鍒涙剰鏍囬鏍囪鐢熸垚鍣ㄣ€? },
  'greeting-generator': { name: '鑺傛棩绁濈', desc: '鑺傛棩绁濈璇敓鎴愬櫒銆? },
  'moments-copy': { name: '鏈嬪弸鍦堟枃妗?, desc: '鏈嬪弸鍦堟枃妗堢敓鎴愬櫒銆? },
  'storyboard-generator': { name: '鍒嗛暅鑴氭湰', desc: '瑙嗛鍒嗛暅鑴氭湰鐢熸垚鍣ㄣ€? },
  'character-sheet': { name: '瑙掕壊璁惧畾鍗?, desc: '瑙掕壊灞炴€ц瀹氬崱鐗囩敓鎴愬櫒銆? },
  'video-downloader': { name: '瑙嗛涓嬭浇鍣?, desc: '鍦ㄧ嚎瑙嗛涓嬭浇瑙ｆ瀽宸ュ叿銆? },
  'video-to-gif': { name: '瑙嗛杞珿IF', desc: '鍦ㄧ嚎瑙嗛杞珿IF鍔ㄥ浘宸ュ叿銆? },
  'screen-recorder': { name: '褰曞睆', desc: '鍦ㄧ嚎灞忓箷褰曞埗宸ュ叿銆? },
  'm3u8-player': { name: 'M3U8鎾斁', desc: '鍦ㄧ嚎M3U8瑙嗛娴佹挱鏀惧櫒銆? },
  'qr-code-gen': { name: '浜岀淮鐮佺敓鎴?, desc: '鍦ㄧ嚎鐢熸垚浜岀淮鐮佸浘鐗囧伐鍏枫€? },
  'zip-tool': { name: 'ZIP鍘嬬缉瑙ｅ帇', desc: '鍦ㄧ嚎ZIP鏂囦欢鍘嬬缉宸ュ叿銆? },
  'phone-lookup': { name: '鎵嬫満鍙锋煡璇?, desc: '鍦ㄧ嚎鎵嬫満鍙风爜褰掑睘鍦版煡璇㈠伐鍏枫€? },
  'id-card-lookup': { name: '韬唤璇佹煡璇?, desc: '韬唤璇佸彿鐮佷俊鎭煡璇㈠伐鍏枫€? },
  'ip-lookup': { name: 'IP褰掑睘鍦?, desc: '鍦ㄧ嚎IP鍦板潃褰掑睘鍦版煡璇㈠伐鍏枫€? },
  'random-generator': { name: '闅忔満鐢熸垚鍣?, desc: '鍦ㄧ嚎闅忔満鏁板拰瀛楃涓茬敓鎴愬伐鍏枫€? },
  'http-status': { name: 'HTTP鐘舵€佺爜', desc: 'HTTP鐘舵€佺爜鏌ヨ鎵嬪唽銆? },
  'sql-formatter': { name: 'SQL鏍煎紡鍖?, desc: '鍦ㄧ嚎SQL璇彞鏍煎紡鍖栧伐鍏枫€? },
  'hash-generator': { name: '鍝堝笇鐢熸垚', desc: '鍦ㄧ嚎MD5/SHA鍝堝笇鍊肩敓鎴愬伐鍏枫€? },
  'password-strength': { name: '瀵嗙爜寮哄害', desc: '鍦ㄧ嚎瀵嗙爜寮哄害妫€娴嬪伐鍏枫€? },
  'password-generator': { name: '瀵嗙爜鐢熸垚鍣?, desc: '鍦ㄧ嚎鐢熸垚楂樺己搴﹂殢鏈哄瘑鐮佸伐鍏枫€? },
  'timer-stopwatch': { name: '璁℃椂鍣?绉掕〃', desc: '鍦ㄧ嚎璁℃椂鍣ㄥ拰绉掕〃宸ュ叿锛屾敮鎸佸€掕鏃躲€? },
  'gradient-generator': { name: '娓愬彉鑹茬敓鎴?, desc: '鍦ㄧ嚎CSS娓愬彉鑹茬敓鎴愬櫒銆? },
  'box-shadow-generator': { name: 'Box Shadow', desc: '鍦ㄧ嚎CSS闃村奖鐢熸垚鍣ㄣ€? },
  'csv-to-json': { name: 'CSV/JSON浜掕浆', desc: '鍦ㄧ嚎CSV鍜孞SON鏍煎紡浜掕浆宸ュ叿銆? },
  'jwt-decoder': { name: 'JWT瑙ｇ爜', desc: '鍦ㄧ嚎JWT Token瑙ｇ爜宸ュ叿銆? },
  'typing-speed': { name: '鎵撳瓧閫熷害娴嬭瘯', desc: '鍦ㄧ嚎鎵撳瓧閫熷害娴嬭瘯宸ュ叿銆? },
  'bmi-calculator': { name: 'BMI璁＄畻鍣?, desc: '鍦ㄧ嚎韬綋璐ㄩ噺鎸囨暟璁＄畻鍣ㄣ€? },
  'mortgage-calculator': { name: '鎴胯捶璁＄畻鍣?, desc: '鍦ㄧ嚎鎴胯捶鏈堜緵璁＄畻鍣ㄣ€? },
  'cron-generator': { name: 'Cron琛ㄨ揪寮忕敓鎴愬櫒', desc: '鍦ㄧ嚎Cron瀹氭椂浠诲姟琛ㄨ揪寮忕敓鎴愬櫒銆? },
  'code-beautifier': { name: '浠ｇ爜缇庡寲', desc: '鍦ㄧ嚎浠ｇ爜缇庡寲鍜屽帇缂╁伐鍏枫€? },
  'color-blind-simulator': { name: '鑹茬洸妯℃嫙鍣?, desc: '鍦ㄧ嚎鑹茬洸瑙嗚妯℃嫙宸ュ叿銆? },
  'regex-visualizer': { name: '姝ｅ垯鍙鍖?, desc: '鍦ㄧ嚎姝ｅ垯琛ㄨ揪寮忓彲瑙嗗寲宸ュ叿銆? },
  'file-hash-calculator': { name: '鏂囦欢鍝堝笇', desc: '鍦ㄧ嚎璁＄畻鏂囦欢MD5/SHA鍝堝笇鍊煎伐鍏枫€? },
  'uuid-generator': { name: 'UUID鐢熸垚鍣?, desc: '鍦ㄧ嚎鐢熸垚UUID闅忔満瀛楃涓插伐鍏枫€? },
  'excel-viewer': { name: 'Excel鏌ョ湅鍣?, desc: '鍦ㄧ嚎鏌ョ湅Excel琛ㄦ牸鏂囦欢宸ュ叿銆? },
};

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500"></div>
    </div>
  );
}

function RecentTools() {
  const [recent, setRecent] = React.useState([]);

  React.useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('recentTools') || '[]');
      setRecent(data.filter(t => t.id !== toolKey).slice(0, 5));
    } catch (e) {}
  }, [toolKey]);

  if (recent.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">鏈€杩戜娇鐢?/div>
      <div className="flex flex-wrap gap-2">
        {recent.map(t => (
          <Link
            key={t.id}
            to={`/tools/${t.id}`}
            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {t.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function ToolDetailPage() {
  const { toolKey } = useParams();
  const navigate = useNavigate();
  const ToolComponent = toolComponents[toolKey];
  const metadata = toolMetadata[toolKey] || { name: toolKey, desc: '' };

  // 璁板綍鏈€杩戜娇鐢ㄧ殑宸ュ叿
  useEffect(() => {
    if (toolKey) {
      try {
        const recent = JSON.parse(localStorage.getItem('recentTools') || '[]');
        const filtered = recent.filter(t => t.id !== toolKey);
        filtered.unshift({ id: toolKey, name: metadata.name, time: Date.now() });
        localStorage.setItem('recentTools', JSON.stringify(filtered.slice(0, 10)));
      } catch (e) {}
    }
  }, [toolKey, metadata.name]);

  if (!ToolComponent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">馃攳</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">宸ュ叿涓嶅瓨鍦?/h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">璇ュ伐鍏锋殏鏈紑鏀撅紝鏁鏈熷緟</p>
          <button onClick={() => navigate('/tools/')} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all">杩斿洖宸ュ叿鍒楄〃</button>
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
          <span>杩斿洖宸ュ叿鍒楄〃</span>
        </Link>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-3xl shadow-lg">馃敡</div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{metadata.name}</h1>
              <p className="text-gray-500 dark:text-gray-400">{metadata.desc}</p>
            </div>
          </div>
          {/* 鏈€杩戜娇鐢?*/}
          <RecentTools />
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
