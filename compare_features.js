const fs = require('fs');
const path = require('path');

console.log('=== 本地 vs 服务器 功能对比 ===\n');

const localSrc = 'D:/MTC/daga-clone/frontend/src';
const serverAssets = 'D:/MTC/daga-clone/server-build/assets';

// ========== 1. 分析本地源码 ==========
console.log('【一、本地源码功能分析】\n');

const localFiles = {
  pages: [],
  components: [],
  api: []
};

function analyzeDir(dir, category) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const filepath = path.join(dir, item);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      analyzeDir(filepath, category);
    } else if (item.endsWith('.jsx') || item.endsWith('.js')) {
      const content = fs.readFileSync(filepath, 'utf8');
      const info = {
        name: item.replace('.jsx', '').replace('.js', ''),
        file: item,
        path: filepath.replace(localSrc + '/', ''),
        size: stat.size,
        content: content
      };
      
      // 提取关键特征
      info.hasRouter = content.includes('Route') || content.includes('routes');
      info.hasState = content.includes('useState') || content.includes('useReducer');
      info.hasEffect = content.includes('useEffect');
      info.hasFetch = content.includes('fetch') || content.includes('axios') || content.includes('api.');
      info.hasVideo = content.includes('video') || content.includes('Video');
      info.hasPlayer = content.includes('Player') || content.includes('player');
      info.hasAdmin = content.includes('admin') || content.includes('Admin');
      info.hasMusic = content.includes('music') || content.includes('Music');
      info.hasParser = content.includes('parse') || content.includes('Parse');
      info.hasMeme = content.includes('meme') || content.includes('Meme');
      info.hasTool = content.includes('tool') || content.includes('Tool');
      info.hasMBTI = content.includes('mbti') || content.includes('MBTI');
      info.hasScreenRecorder = content.includes('screen') || content.includes('ScreenRecorder');
      info.hasAI = content.includes('ai') || content.includes('AI');
      
      localFiles[category].push(info);
    }
  });
}

analyzeDir(path.join(localSrc, 'pages'), 'pages');
analyzeDir(path.join(localSrc, 'components'), 'components');
analyzeDir(path.join(localSrc, 'api'), 'api');

console.log('本地页面 (' + localFiles.pages.length + '个):');
localFiles.pages.forEach(p => {
  console.log(`  ${p.path} (${p.size} bytes)`);
  console.log(`    路由:${p.hasRouter ? 'Y' : 'N'} 状态:${p.hasState ? 'Y' : 'N'} 请求:${p.hasFetch ? 'Y' : 'N'}`);
});

console.log('\n本地组件 (' + localFiles.components.length + '个):');
localFiles.components.forEach(c => {
  console.log(`  ${c.path} (${c.size} bytes)`);
});

console.log('\n本地 API (' + localFiles.api.length + '个):');
localFiles.api.forEach(a => {
  console.log(`  ${a.name}: ${Object.keys(a).filter(k => a[k] === true).join(', ')}`);
});

// ========== 2. 分析服务器 chunk ==========
console.log('\n\n【二、服务器 Chunk 功能分析】\n');

const serverFiles = fs.readdirSync(serverAssets);
const serverAnalysis = {};

serverFiles.forEach(file => {
  if (!file.endsWith('.js')) return;
  
  const content = fs.readFileSync(path.join(serverAssets, file), 'utf8');
  const name = file.replace('.js', '');
  
  serverAnalysis[name] = {
    file: file,
    size: content.length,
    hasVideo: content.includes('video') || content.includes('Video'),
    hasPlayer: content.includes('Player') || content.includes('player'),
    hasAdmin: content.includes('admin') || content.includes('Admin'),
    hasMusic: content.includes('music') || content.includes('Music'),
    hasParser: content.includes('parse') || content.includes('Parse'),
    hasMeme: content.includes('meme') || content.includes('Meme'),
    hasTool: content.includes('tool') || content.includes('Tool'),
    hasMBTI: content.includes('mbti') || content.includes('MBTI'),
    hasScreenRecorder: content.includes('screen') || content.includes('ScreenRecorder'),
    hasAI: content.includes('ai') || content.includes('AI'),
    hasArticle: content.includes('article') || content.includes('Article'),
    hasTest: content.includes('test') || content.includes('Test'),
    hasAssessment: content.includes('assessment') || content.includes('Assessment'),
    hasDashboard: content.includes('Dashboard'),
    hasManage: content.includes('Manage'),
    hasSettings: content.includes('Settings') || content.includes('settings'),
    hasFaq: content.includes('Faq') || content.includes('FAQ'),
    hasGuide: content.includes('Guide') || content.includes('guide'),
    hasLink: content.includes('Link') || content.includes('link'),
    hasAd: content.includes('Ad') || content.includes('ad'),
    hasInterface: content.includes('Interface') || content.includes('interface'),
    hasSubmission: content.includes('Submission') || content.includes('submission'),
    hasClickEvent: content.includes('ClickEvent') || content.includes('click'),
    hasMonitor: content.includes('Monitor') || content.includes('monitor'),
    hasPush: content.includes('Push') || content.includes('push'),
    hasCategory: content.includes('Category') || content.includes('category'),
    hasImage: content.includes('image') || content.includes('Image'),
    hasDoc: content.includes('doc') || content.includes('Doc'),
    hasAudio: content.includes('audio') || content.includes('Audio'),
    hasFullView: content.includes('fullView'),
    hasMediaSession: content.includes('mediaSession') || content.includes('MediaSession'),
    hasHls: content.includes('hls') || content.includes('Hls'),
    hasOnError: content.includes('NotFoundError') || content.includes('ErrorBoundary'),
    hasPerformanceObserver: content.includes('PerformanceObserver')
  };
});

// 分类服务器文件
const serverPages = [];
const serverComponents = [];
const serverManagers = [];

Object.keys(serverAnalysis).forEach(name => {
  const info = serverAnalysis[name];
  
  if (info.hasDashboard || info.hasAdmin) {
    serverManagers.push({ name, ...info });
  } else if (info.hasManage) {
    serverManagers.push({ name, ...info });
  } else if (name.includes('Page') || name.includes('page') || 
             name.includes('Home') || name.includes('Music') || 
             name.includes('Meme') || name.includes('Tool') ||
             name.includes('Article') || name.includes('Test') ||
             name.includes('Assessment') || name.includes('About') ||
             name.includes('Contact') || name.includes('Privacy') ||
             name.includes('Terms') || name.includes('NotFound') ||
             name.includes('VideoParser') || name.includes('MediaPlayer')) {
    serverPages.push({ name, ...info });
  } else {
    serverComponents.push({ name, ...info });
  }
});

console.log('服务器页面 (' + serverPages.length + '个):');
serverPages.forEach(p => {
  console.log(`  ${p.name} (${p.size} bytes)`);
});

console.log('\n服务器管理后台 (' + serverManagers.length + '个):');
serverManagers.forEach(m => {
  console.log(`  ${m.name} (${m.size} bytes)`);
});

console.log('\n服务器组件 (' + serverComponents.length + '个):');
serverComponents.slice(0, 15).forEach(c => {
  console.log(`  ${c.name} (${c.size} bytes)`);
});

// ========== 3. 功能对比 ==========
console.log('\n\n【三、功能缺失对比】\n');

const featureMap = {
  '视频解析': { local: localFiles.pages.some(p => p.hasParser), server: serverPages.some(p => p.hasParser) },
  '音乐播放': { local: localFiles.pages.some(p => p.hasMusic), server: serverPages.some(p => p.hasMusic) },
  '表情包': { local: localFiles.components.some(c => c.hasMeme), server: serverPages.some(p => p.hasMeme) },
  'MBTI测试': { local: localFiles.pages.some(p => p.hasMBTI), server: serverPages.some(p => p.hasMBTI) },
  '录屏功能': { local: localFiles.components.some(c => c.hasScreenRecorder), server: serverPages.some(p => p.hasScreenRecorder) },
  'AI工具': { local: localFiles.pages.some(p => p.hasAI), server: serverPages.some(p => p.hasAI) },
  '文章系统': { local: false, server: serverPages.some(p => p.hasArticle) },
  '测试系统': { local: false, server: serverPages.some(p => p.hasTest || p.hasAssessment) },
  '管理后台': { local: localFiles.pages.some(p => p.hasAdmin), server: serverManagers.length > 0 },
  '仪表盘': { local: localFiles.pages.some(p => p.name === 'Dashboard'), server: serverManagers.some(m => m.hasDashboard) },
  '接口管理': { local: localFiles.pages.some(p => p.hasInterface), server: serverManagers.some(m => m.hasInterface) },
  '广告管理': { local: localFiles.pages.some(p => p.hasAd), server: serverManagers.some(m => m.hasAd) },
  '链接管理': { local: localFiles.pages.some(p => p.hasLink), server: serverManagers.some(m => m.hasLink) },
  '设置管理': { local: localFiles.pages.some(p => p.hasSettings), server: serverManagers.some(m => m.hasSettings) },
  'FAQ管理': { local: localFiles.pages.some(p => p.hasFaq), server: serverManagers.some(m => m.hasFaq) },
  '指南管理': { local: localFiles.pages.some(p => p.hasGuide), server: serverManagers.some(m => m.hasGuide) },
  '访问统计': { local: false, server: serverManagers.some(m => m.hasMonitor) },
  '推送管理': { local: false, server: serverManagers.some(m => m.hasPush) },
  '分类管理': { local: false, server: serverManagers.some(m => m.hasCategory) },
  '图片处理': { local: false, server: serverComponents.some(c => c.hasImage) },
  '文档处理': { local: false, server: serverComponents.some(c => c.hasDoc) },
  '音频处理': { local: false, server: serverComponents.some(c => c.hasAudio) }
};

console.log('功能对比:');
console.log('功能'.padEnd(15), '本地', '服务器', '状态');
console.log('-'.repeat(50));

Object.keys(featureMap).forEach(feature => {
  const local = featureMap[feature].local ? '✅' : '❌';
  const server = featureMap[feature].server ? '✅' : '❌';
  const status = local === server ? '一致' : (server === '✅' ? '⚠️ 缺失' : '✅ 已覆盖');
  console.log(feature.padEnd(15), local.padEnd(6), server.padEnd(6), status);
});

// ========== 4. 详细差异 ==========
console.log('\n\n【四、详细差异分析】\n');

console.log('本地有但服务器可能没有的功能:');
const localOnly = Object.entries(featureMap).filter(([k, v]) => v.local && !v.server);
localOnly.forEach(([k, v]) => console.log('  -', k));

console.log('\n服务器有但本地缺失的功能 (需要补充):');
const serverOnly = Object.entries(featureMap).filter(([k, v]) => !v.local && v.server);
serverOnly.forEach(([k, v]) => console.log('  -', k));

// ========== 5. 具体缺失的页面 ==========
console.log('\n\n【五、需要补充的页面组件】\n');

const missingPages = serverPages.filter(p => 
  !localFiles.pages.some(lp => 
    p.name.toLowerCase().includes(lp.name.toLowerCase()) ||
    lp.name.toLowerCase().includes(p.name.toLowerCase().split('.')[0])
  )
);

console.log('缺失的页面 (' + missingPages.length + '个):');
missingPages.forEach(p => {
  console.log(`  ${p.name} (${p.size} bytes)`);
});

console.log('\n缺失的管理后台 (' + serverManagers.filter(m => 
  !localFiles.pages.some(lp => 
    m.name.toLowerCase().includes(lp.name.toLowerCase())
  )
).length + '个):');
serverManagers.forEach(m => {
  if (!localFiles.pages.some(lp => m.name.toLowerCase().includes(lp.name.toLowerCase()))) {
    console.log(`  ${m.name} (${m.size} bytes)`);
  }
});

console.log('\n\n建议:');
console.log('1. 优先补充缺失的核心功能页面');
console.log('2. 管理后台可以根据需要选择性实现');
console.log('3. 第三方服务（如文章、测试）可以考虑暂时不实现');
