import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Icon from '../components/Icons';

const tools = [
  { id: 'compress', name: '图片压缩', category: '图片工具', path: '/tools/compress', icon: 'image' },
  { id: 'convert', name: '格式转换', category: '图片工具', path: '/tools/convert', icon: 'swap' },
  { id: 'crop', name: '图片裁剪', category: '图片工具', path: '/tools/crop', icon: 'crop' },
  { id: 'ocr', name: '文字识别', category: '图片工具', path: '/tools/ocr', icon: 'scan' },
  { id: 'watermark', name: '添加水印', category: '图片工具', path: '/tools/watermark', icon: 'pen' },
  { id: 'remove-watermark', name: '去水印', category: '图片工具', path: '/tools/remove-watermark', icon: 'wand' },
  { id: 'nine-grid', name: '九宫格切图', category: '图片工具', path: '/tools/nine-grid', icon: 'grid9' },
  { id: 'image-bg-remove', name: '去背景', category: '图片工具', path: '/tools/image-bg-remove', icon: 'droplet' },
  { id: 'image-upscaler', name: '图片放大', category: '图片工具', path: '/tools/image-upscaler', icon: 'search' },
  { id: 'image-editor', name: '在线PS', category: '图片工具', path: '/tools/image-editor', icon: 'wand' },
  { id: 'maker', name: '制图', category: '图片工具', path: '/tools/maker', icon: 'palette' },
  { id: 'image-filters', name: '图片滤镜', category: '图片工具', path: '/tools/image-filters', icon: 'sliders' },
  { id: 'qr-decoder', name: '二维码解码', category: '图片工具', path: '/tools/qr-decoder', icon: 'qr' },

  // PDF工具
  { id: 'pdf-merge', name: 'PDF合并', category: 'PDF工具', path: '/tools/pdf-merge', icon: 'docs' },
  { id: 'pdf-split', name: 'PDF拆分', category: 'PDF工具', path: '/tools/pdf-split', icon: 'scissors' },
  { id: 'pdf-compress', name: 'PDF压缩', category: 'PDF工具', path: '/tools/pdf-compress', icon: 'file' },
  { id: 'jpg-to-pdf', name: '图片转PDF', category: 'PDF工具', path: '/tools/jpg-to-pdf', icon: 'file' },
  { id: 'pdf-lock', name: 'PDF加密', category: 'PDF工具', path: '/tools/pdf-lock', icon: 'lock' },
  { id: 'pdf-unlock', name: 'PDF解密', category: 'PDF工具', path: '/tools/pdf-unlock', icon: 'unlock' },
  { id: 'pdf-to-image', name: 'PDF转图片', category: 'PDF工具', path: '/tools/pdf-to-image', icon: 'image' },
  { id: 'pdf-to-word', name: 'PDF转Word', category: 'PDF工具', path: '/tools/pdf-to-word', icon: 'doc' },

  // 音频工具
  { id: 'audio-cut', name: '音频裁剪', category: '音频工具', path: '/tools/audio-cut', icon: 'scissors' },
  { id: 'audio-convert', name: '格式转换', category: '音频工具', path: '/tools/audio-convert', icon: 'swap' },
  { id: 'audio-compress', name: '音频压缩', category: '音频工具', path: '/tools/audio-compress', icon: 'music' },

  // 文本工具
  { id: 'word-counter', name: '字数统计', category: '文本工具', path: '/tools/word-counter', icon: 'text' },
  { id: 'case-converter', name: '大小写转换', category: '文本工具', path: '/tools/case-converter', icon: 'text' },
  { id: 'zh-converter', name: '简繁转换', category: '文本工具', path: '/tools/zh-converter', icon: 'swap' },
  { id: 'regex-tester', name: '正则测试', category: '文本工具', path: '/tools/regex-tester', icon: 'text' },
  { id: 'json-formatter', name: 'JSON格式化', category: '文本工具', path: '/tools/json-formatter', icon: 'doc' },
  { id: 'base64-tool', name: 'Base64编解码', category: '文本工具', path: '/tools/base64-tool', icon: 'swap' },
  { id: 'url-encoder', name: 'URL编解码', category: '文本工具', path: '/tools/url-encoder', icon: 'link' },
  { id: 'html-entity', name: 'HTML实体转换', category: '文本工具', path: '/tools/html-entity', icon: 'text' },
  { id: 'text-sort', name: '文本排序', category: '文本工具', path: '/tools/text-sort', icon: 'sliders' },
  { id: 'text-diff', name: '文本对比', category: '文本工具', path: '/tools/text-diff', icon: 'scale' },
  { id: 'markdown-preview', name: 'Markdown预览', category: '文本工具', path: '/tools/markdown-preview', icon: 'eye' },
  { id: 'markdown-to-pdf', name: 'Markdown转PDF', category: '文本工具', path: '/tools/markdown-to-pdf', icon: 'file' },
  { id: 'lorem-ipsum', name: 'Lorem Ipsum', category: '文本工具', path: '/tools/lorem-ipsum', icon: 'doc' },
  { id: 'text-to-speech', name: '文字转语音', category: '文本工具', path: '/tools/text-to-speech', icon: 'music' },
  { id: 'novel-reader', name: '小说阅读器', category: '文本工具', path: '/tools/novel-reader', icon: 'docs' },

  // 换算工具
  { id: 'date-calculator', name: '日期计算器', category: '换算工具', path: '/tools/date-calculator', icon: 'calendar' },
  { id: 'age-calculator', name: '年龄计算器', category: '换算工具', path: '/tools/age-calculator', icon: 'timer' },
  { id: 'unit-converter', name: '单位换算', category: '换算工具', path: '/tools/unit-converter', icon: 'swap' },
  { id: 'color-converter', name: '颜色转换', category: '换算工具', path: '/tools/color-converter', icon: 'palette' },

  // AI工具
  { id: 'ai-prompt', name: 'AI绘画提示词', category: 'AI工具', path: '/tools/ai-prompt', icon: 'sparkles' },
  { id: 'video-prompt', name: 'AI视频提示词', category: 'AI工具', path: '/tools/video-prompt', icon: 'film' },
  { id: 'ai-writer', name: 'AI写作助手', category: 'AI工具', path: '/tools/ai-writer', icon: 'pen' },
  { id: 'voiceover-script', name: '配音脚本', category: 'AI工具', path: '/tools/voiceover-script', icon: 'music' },
  { id: 'short-drama-script', name: '短剧脚本', category: 'AI工具', path: '/tools/short-drama-script', icon: 'film' },
  { id: 'xiaohongshu-copy', name: '小红书文案', category: 'AI工具', path: '/tools/xiaohongshu-copy', icon: 'chat' },
  { id: 'douyin-script', name: '抖音脚本', category: 'AI工具', path: '/tools/douyin-script', icon: 'music' },
  { id: 'headline-slogan', name: '标题标语', category: 'AI工具', path: '/tools/headline-slogan', icon: 'pen' },
  { id: 'greeting-generator', name: '节日祝福', category: 'AI工具', path: '/tools/greeting-generator', icon: 'mail' },
  { id: 'moments-copy', name: '朋友圈文案', category: 'AI工具', path: '/tools/moments-copy', icon: 'chat' },
  { id: 'storyboard-generator', name: '分镜脚本', category: 'AI工具', path: '/tools/storyboard-generator', icon: 'grid9' },
  { id: 'character-sheet', name: '角色设定卡', category: 'AI工具', path: '/tools/character-sheet', icon: 'idcard' },

  // 视频工具
  { id: 'video-downloader', name: '视频下载器', category: '视频工具', path: '/tools/video-downloader', icon: 'download' },
  { id: 'video-to-gif', name: '视频转GIF', category: '视频工具', path: '/tools/video-to-gif', icon: 'film' },
  { id: 'screen-recorder', name: '录屏', category: '视频工具', path: '/tools/screen-recorder', icon: 'camera' },
  { id: 'm3u8-player', name: 'M3U8播放', category: '视频工具', path: '/tools/m3u8-player', icon: 'tv' },

  // 其他工具
  { id: 'qr-code-gen', name: '二维码生成', category: '其他工具', path: '/tools/qr-code-gen', icon: 'qr' },
  { id: 'zip-tool', name: 'ZIP压缩解压', category: '其他工具', path: '/tools/zip-tool', icon: 'box' },
  { id: 'phone-lookup', name: '手机号查询', category: '其他工具', path: '/tools/phone-lookup', icon: 'phone' },
  { id: 'id-card-lookup', name: '身份证查询', category: '其他工具', path: '/tools/id-card-lookup', icon: 'idcard' },
  { id: 'ip-lookup', name: 'IP归属地', category: '其他工具', path: '/tools/ip-lookup', icon: 'globe' },
  { id: 'random-generator', name: '随机生成器', category: '其他工具', path: '/tools/random-generator', icon: 'sliders' },
  { id: 'http-status', name: 'HTTP状态码', category: '其他工具', path: '/tools/http-status', icon: 'alert' },
  { id: 'sql-formatter', name: 'SQL格式化', category: '其他工具', path: '/tools/sql-formatter', icon: 'doc' },
  { id: 'hash-generator', name: '哈希生成', category: '其他工具', path: '/tools/hash-generator', icon: 'lock' },
  { id: 'password-strength', name: '密码强度', category: '其他工具', path: '/tools/password-strength', icon: 'lock' },
  { id: 'timer-stopwatch', name: '计时器/秒表', category: '其他工具', path: '/tools/timer-stopwatch', icon: 'timer' },
  { id: 'gradient-generator', name: '渐变色生成', category: '其他工具', path: '/tools/gradient-generator', icon: 'palette' },
  { id: 'box-shadow-generator', name: 'Box Shadow', category: '其他工具', path: '/tools/box-shadow-generator', icon: 'box' },
  { id: 'csv-to-json', name: 'CSV/JSON互转', category: '其他工具', path: '/tools/csv-to-json', icon: 'sheet' },
  { id: 'jwt-decoder', name: 'JWT解码', category: '其他工具', path: '/tools/jwt-decoder', icon: 'unlock' },
  { id: 'typing-speed', name: '打字速度测试', category: '其他工具', path: '/tools/typing-speed', icon: 'text' },
  { id: 'bmi-calculator', name: 'BMI计算器', category: '其他工具', path: '/tools/bmi-calculator', icon: 'scale' },
  { id: 'mortgage-calculator', name: '房贷计算器', category: '其他工具', path: '/tools/mortgage-calculator', icon: 'chart' },
  { id: 'cron-generator', name: 'Cron表达式生成器', category: '其他工具', path: '/tools/cron-generator', icon: 'calendar' },
  { id: 'code-beautifier', name: '代码美化', category: '其他工具', path: '/tools/code-beautifier', icon: 'wand' },
  { id: 'color-blind-simulator', name: '色盲模拟器', category: '其他工具', path: '/tools/color-blind-simulator', icon: 'eye' },
  { id: 'regex-visualizer', name: '正则可视化', category: '其他工具', path: '/tools/regex-visualizer', icon: 'scan' },
  { id: 'audio-extractor', name: '音频提取', category: '其他工具', path: '/tools/audio-extractor', icon: 'music' },
  { id: 'timestamp-converter', name: '时间戳转换', category: '换算工具', path: '/tools/timestamp-converter', icon: 'timer' },
  { id: 'password-generator', name: '密码生成器', category: '其他工具', path: '/tools/password-generator', icon: 'lock' },
  { id: 'uuid-generator', name: 'UUID生成器', category: '其他工具', path: '/tools/uuid-generator', icon: 'scan' },
  { id: 'file-hash-calculator', name: '文件哈希', category: '其他工具', path: '/tools/file-hash-calculator', icon: 'file' },
  { id: 'excel-viewer', name: 'Excel查看器', category: '其他工具', path: '/tools/excel-viewer', icon: 'sheet' },
  { id: 'html-to-markdown', name: 'HTML转Markdown', category: '文本工具', path: '/tools/html-to-markdown', icon: 'swap' },
  { id: 'number-base-converter', name: '进制转换', category: '换算工具', path: '/tools/number-base-converter', icon: 'swap' },
];

const categories = ['全部', '图片工具', 'PDF工具', '音频工具', '文本工具', '换算工具', 'AI工具', '视频工具', '其他工具'];

// 分类图标一律走 Icons.jsx 的 PATHS，别在这里手写 svg 字符串。
// 旧版是 <svg class="w-4.5 h-4.5">：Tailwind 默认刻度没有 4.5，这条类根本不会生成，
// 实测图标宽度 0，8 个分类芯片全是空白方块。
const categoryIcons = {
  '图片工具': 'image',
  'PDF工具': 'file',
  '音频工具': 'music',
  '文本工具': 'text',
  '换算工具': 'sliders',
  'AI工具': 'sparkles',
  '视频工具': 'film',
  '其他工具': 'tools',
};

export default function ToolsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');

  const filteredTools = tools.filter(tool => {
    const matchSearch = tool.name.includes(searchTerm);
    const matchCategory = activeCategory === '全部' || tool.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const getCategoryTools = (category) => tools.filter(t => t.category === category);

  return (
    <div className="min-h-screen bg-paper">
      <Header />
      
      <main className="wrap py-8">
        <div className="phead">
          <h1>在线工具箱</h1>
          <span className="note">精选 {tools.length} 个浏览器直接可用的工具，无需下载安装</span>
        </div>

        {/* Search & Filter */}
        <div className="card p-4 mb-5">
          <div className="relative mb-3">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 sz15 text-ink-3" />
            <input
              type="text"
              placeholder="搜索工具..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const count = cat === '全部' ? tools.length : getCategoryTools(cat).length;
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={
                    'px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ' +
                    (isActive
                      ? 'bg-accent text-accent-fg'
                      : 'bg-surface-2 text-ink-2 hover:bg-accent-soft hover:text-accent-press')
                  }
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Tools by Category */}
        {activeCategory === '全部' ? (
          categories.filter(c => c !== '全部').map((category) => {
            const categoryTools = getCategoryTools(category);
            return (
              <div key={category} className="mb-8" id={`cat-${category.replace('工具', '')}`}>
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="chip"><Icon name={categoryIcons[category]} /></span>
                  <h2 className="text-lg font-bold text-ink">{category}</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface-2 text-ink-3 font-medium">
                    {categoryTools.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {categoryTools.map((tool) => (
                    <Link
                      key={tool.id}
                      to={tool.path}
                      className="group flex items-center gap-3 px-4 py-3.5 bg-surface rounded-card border border-line hover:border-accent hover:shadow-lift transition-all duration-200"
                    >
                      <span className="chip"><Icon name={tool.icon} /></span>
                      <span className="text-sm font-semibold text-ink-2 group-hover:text-accent transition-colors truncate">
                        {tool.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredTools.map((tool) => (
              <Link
                key={tool.id}
                to={tool.path}
                className="group flex items-center gap-3 px-4 py-3.5 bg-surface rounded-card border border-line hover:border-accent hover:shadow-lift transition-all duration-200"
              >
                <span className="chip"><Icon name={tool.icon} /></span>
                <span className="text-sm font-semibold text-ink-2 group-hover:text-accent transition-colors truncate">
                  {tool.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
