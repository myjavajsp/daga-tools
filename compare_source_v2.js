const fs = require('fs');
const path = require('path');

console.log('============================================');
console.log('  本地源码 vs 服务器内容 对比分析');
console.log('============================================\n');

const localFrontend = 'D:/MTC/daga-clone/frontend';
const localServer = 'D:/MTC/daga-clone/server';
const serverAssets = 'D:/MTC/daga-clone/server-source/assets';

// ========== 本地源码分析 ==========
console.log('【一、本地源码结构】\n');

function listFiles(dir, prefix = '') {
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const filepath = path.join(dir, item);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      console.log(prefix + '📁 ' + item + '/');
      listFiles(filepath, prefix + '  ');
    } else {
      console.log(prefix + '📄 ' + item + ' (' + stat.size + ' bytes)');
    }
  });
}

console.log('frontend/ 目录:');
listFiles(localFrontend);

console.log('\n\nserver/ 目录:');
listFiles(localServer);

// ========== 组件对比 ==========
console.log('\n\n【二、组件对比】\n');

// 本地组件列表
const localComponents = [
  'App.jsx', 'HomePage.jsx', 'MusicPage.jsx',
  'components/Layout.jsx', 'components/Header.jsx', 'components/Footer.jsx',
  'components/home/HeroSection.jsx', 'components/home/ParseForm.jsx',
  'components/home/PlayerArea.jsx', 'components/home/AdBanner.jsx',
  'pages/admin/AdminLayout.jsx', 'pages/admin/Dashboard.jsx'
];

console.log('本地源码组件:');
localComponents.forEach(c => {
  const filepath = path.join(localFrontend, 'src', c);
  if (fs.existsSync(filepath)) {
    const stat = fs.statSync(filepath);
    console.log('  ✅', c, '(' + stat.size + ' bytes)');
  } else {
    console.log('  ❌', c, '- 不存在');
  }
});

// ========== 服务器 chunk 分析 ==========
console.log('\n\n【三、服务器 Chunk 文件分析】\n');

if (fs.existsSync(serverAssets)) {
  const serverFiles = fs.readdirSync(serverAssets);
  console.log('服务器文件数:', serverFiles.length);
  
  // 找出关键 chunk
  const keyChunks = [
    'MediaPlayerTool-LpstSdCC.js',
    'ToolDetailPage-ChbxY0SS.js',
    'VideoParser-NQlKsKJO.js',
    'index-C0oHXt5Q.js'
  ];
  
  keyChunks.forEach(chunk => {
    const filepath = path.join(serverAssets, chunk);
    if (fs.existsSync(filepath)) {
      const stat = fs.statSync(filepath);
      console.log('  ✅', chunk, '(' + stat.size + ' bytes)');
      
      // 读取并分析
      const content = fs.readFileSync(filepath, 'utf8');
      
      // 检查关键功能
      if (chunk === 'MediaPlayerTool-LpstSdCC.js') {
        console.log('     fullView:', content.includes('fullView') ? '✅' : '❌');
        console.log('     onMouseEnter:', content.includes('onMouseEnter') ? '✅' : '❌');
        console.log('     navigator.mediaSession:', content.includes('navigator.mediaSession') ? '✅' : '❌');
      }
    } else {
      console.log('  ❌', chunk, '- 不存在');
    }
  });
}

// ========== 差异分析 ==========
console.log('\n\n【四、缺失内容分析】\n');

// 检查本地是否有 MediaPlayerTool 组件
const mediaplayerLocal = path.join(localFrontend, 'src', 'components', 'MediaPlayerTool.jsx');
console.log('MediaPlayerTool.jsx:', fs.existsSync(mediaplayerLocal) ? '✅ 存在' : '❌ 缺失');

// 检查 ToolDetailPage
const toolDetailLocal = path.join(localFrontend, 'src', 'pages', 'ToolDetailPage.jsx');
console.log('ToolDetailPage.jsx:', fs.existsSync(toolDetailLocal) ? '✅ 存在' : '❌ 缺失');

// 检查 VideoParser
const videoParserLocal = path.join(localFrontend, 'src', 'pages', 'VideoParserPage.jsx');
console.log('VideoParserPage.jsx:', fs.existsSync(videoParserLocal) ? '✅ 存在' : '❌ 缺失');

// 检查构建配置
const viteConfig = path.join(localFrontend, 'vite.config.js');
console.log('\nvite.config.js:', fs.existsSync(viteConfig) ? '✅ 存在' : '❌ 缺失');
if (fs.existsSync(viteConfig)) {
  const content = fs.readFileSync(viteConfig, 'utf8');
  console.log('  output dir:', content.match(/output:\s*['"]([^'"]+)['"]/)?.[1] || '未指定');
  console.log('  assetsDir:', content.match(/assetsDir:\s*['"]([^'"]+)['"]/)?.[1] || '未指定');
}

// ========== 总结 ==========
console.log('\n\n【五、补齐建议】\n');
console.log('缺失的关键组件:');
console.log('  1. MediaPlayerTool.jsx - 媒体播放器组件（已修复版本在服务器）');
console.log('  2. ToolDetailPage.jsx - 工具详情页（大文件 40KB+）');
console.log('  3. 其他动态生成的页面组件');
console.log('\n建议操作:');
console.log('  1. 从 GitHub 拉取完整源码: git clone https://github.com/myjavajsp/daga-clone.git');
console.log('  2. 检查 frontend/package.json 中的依赖');
console.log('  3. 运行 npm install && npm run build');
console.log('  4. 将 dist/assets/ 复制到服务器');