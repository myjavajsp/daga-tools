const fs = require('fs');
const path = require('path');

console.log('=== 分析原始构建产物 ===\n');

const originalJs = 'D:/MTC/daga-clone/original-build/index-C0oHXt5Q.js';
const content = fs.readFileSync(originalJs, 'utf8');

console.log('原始 JS 大小:', content.length, 'bytes\n');

// 提取关键信息
console.log('=== 路由分析 ===\n');
const routeMatches = content.match(/path:"([^"]+)"/g) || [];
const uniqueRoutes = [...new Set(routeMatches.map(r => r.replace('path:"', '').replace('"', '')))];
console.log('发现的路由:', uniqueRoutes.length, '个');
uniqueRoutes.forEach(r => console.log('  -', r));

console.log('\n=== 组件分析 ===\n');
const componentMatches = content.match(/function\s+(\w+)\(\)/g) || [];
const uniqueComponents = [...new Set(componentMatches.map(c => c.replace('function ', '').replace('()', '')))];
console.log('发现的组件函数:', uniqueComponents.length, '个');
uniqueComponents.slice(0, 20).forEach(c => console.log('  -', c));

console.log('\n=== 页面功能分析 ===\n');
const pageIndicators = {
  '导航栏/Header': ['nav', 'Navigation', 'Navbar', 'AppBar'],
  '视频解析': ['parse', 'Parse', '解析', 'VideoParser'],
  '音乐': ['music', 'Music', '音乐'],
  '表情包': ['meme', 'Meme', '表情包'],
  '热门': ['hot', 'Hot', '热门'],
  'MBTI': ['mbti', 'MBTI', '性格测试'],
  '工具': ['tool', 'Tool', '工具'],
  'AI工具': ['ai', 'AI', '人工智能'],
  '录屏': ['screen', 'Screen', '录屏'],
  '关于': ['about', 'About', '关于'],
  '联系': ['contact', 'Contact', '联系'],
  '隐私': ['privacy', 'Privacy', '隐私'],
  '条款': ['terms', 'Terms', '条款'],
  '文章': ['article', 'Article', '文章'],
  '管理后台': ['admin', 'Admin', 'dashboard', 'Dashboard']
};

Object.entries(pageIndicators).forEach(([name, keywords]) => {
  const found = keywords.some(k => content.includes(k));
  console.log(`${name}:`, found ? '✅' : '❌');
});

// 保存分析结果
const analysis = {
  routes: uniqueRoutes,
  components: uniqueComponents.slice(0, 30),
  size: content.length
};
fs.writeFileSync('D:/MTC/daga-clone/analysis.json', JSON.stringify(analysis, null, 2));
console.log('\n分析结果已保存到 analysis.json');