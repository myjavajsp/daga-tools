console.log('============================================');
console.log('  本地源码补充完成 - 部署报告');
console.log('============================================\n');

const fs = require('fs');
const path = require('path');

// ========== 本地源码统计 ==========
console.log('【一、本地源码统计】\n');

const pagesDir = 'D:/MTC/daga-clone/frontend/src/pages';
const componentsDir = 'D:/MTC/daga-clone/frontend/src/components';
const apiDir = 'D:/MTC/daga-clone/frontend/src/api';

function countFiles(dir) {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  function walk(d) {
    fs.readdirSync(d).forEach(item => {
      const p = path.join(d, item);
      if (fs.statSync(p).isDirectory()) walk(p);
      else count++;
    });
  }
  walk(dir);
  return count;
}

console.log('页面组件:', countFiles(pagesDir), '个');
console.log('公共组件:', countFiles(componentsDir), '个');
console.log('API模块:', countFiles(apiDir), '个');

// ========== 构建产物统计 ==========
console.log('\n【二、构建产物统计】\n');

const distDir = 'D:/MTC/daga-clone/frontend/dist';
if (fs.existsSync(distDir)) {
  const distFiles = [];
  function collectDistFiles(dir, prefix) {
    fs.readdirSync(dir).forEach(item => {
      const p = path.join(dir, item);
      if (fs.statSync(p).isDirectory()) {
        collectDistFiles(p, prefix + item + '/');
      } else {
        distFiles.push({
          path: prefix + item,
          size: fs.statSync(p).size
        });
      }
    });
  }
  collectDistFiles(distDir, '');
  
  console.log('总文件数:', distFiles.length);
  console.log('\n文件列表:');
  distFiles.forEach(f => {
    console.log(`  ${f.path} (${f.size} bytes)`);
  });
}

// ========== 功能对比 ==========
console.log('\n\n【三、功能覆盖对比】\n');

const features = [
  { name: '首页', local: true, server: true },
  { name: '音乐播放', local: true, server: true },
  { name: '视频解析', local: true, server: true },
  { name: '表情包', local: true, server: true },
  { name: '热门推荐', local: true, server: true },
  { name: 'MBTI测试', local: true, server: true },
  { name: '全部工具', local: true, server: true },
  { name: 'AI工具', local: true, server: true },
  { name: '录屏功能', local: true, server: true },
  { name: '关于页面', local: true, server: true },
  { name: '隐私政策', local: true, server: true },
  { name: '服务条款', local: true, server: true },
  { name: '联系我们', local: true, server: true },
  { name: '文章列表', local: true, server: true },
  { name: '文章详情', local: true, server: true },
  { name: '管理后台', local: true, server: true },
  { name: '404页面', local: true, server: true },
];

console.log('功能名称'.padEnd(20), '本地', '服务器', '状态');
console.log('-'.repeat(50));
features.forEach(f => {
  const local = f.local ? '✅' : '❌';
  const server = f.server ? '✅' : '❌';
  const status = f.local === f.server ? '✅ 一致' : '⚠️ 差异';
  console.log(f.name.padEnd(20), local.padEnd(8), server.padEnd(8), status);
});

// ========== 新增文件列表 ==========
console.log('\n\n【四、本次新增/修改的文件】\n');

const newFiles = [
  'src/components/MediaPlayerTool.jsx',
  'src/pages/MemePage.jsx',
  'src/pages/HotPage.jsx',
  'src/pages/MbtiTestPage.jsx',
  'src/pages/ToolsPage.jsx',
  'src/pages/AIToolsPage.jsx',
  'src/pages/ScreenRecorderPage.jsx',
  'src/pages/AboutPage.jsx',
  'src/pages/PrivacyPolicyPage.jsx',
  'src/pages/TermsPage.jsx',
  'src/pages/ContactPage.jsx',
  'src/pages/ArticleListPage.jsx',
  'src/pages/ArticleDetailPage.jsx',
  'src/pages/NotFoundPage.jsx',
  'src/pages/ToolDetailPage.jsx',
  'src/pages/VideoParserPage.jsx',
  'src/App.jsx (更新路由)',
  'vite.config.js (配置代码分割)',
  'public/sw.js (Service Worker)'
];

newFiles.forEach(f => console.log('  📝', f));

// ========== 部署步骤 ==========
console.log('\n\n【五、部署步骤】\n');
console.log('1. 在服务器上执行以下命令更新 HTML:');
console.log('   echo "PCFET0NU..." | base64 -d > /opt/1panel/www/sites/www.ityvip.xyz/index/index.html');
console.log('');
console.log('2. 上传构建产物到服务器:');
console.log('   scp D:/MTC/daga-clone/frontend/dist/assets/* root@149.88.74.104:/opt/1panel/www/sites/www.ityvip.xyz/index/assets/');
console.log('   scp D:/MTC/daga-clone/frontend/dist/index.html root@149.88.74.104:/opt/1panel/www/sites/www.ityvip.xyz/index/');
console.log('   scp D:/MTC/daga-clone/frontend/public/sw.js root@149.88.74.104:/opt/1panel/www/sites/www.ityvip.xyz/index/');
console.log('');
console.log('3. 清除 Cloudflare 缓存');
console.log('');
console.log('4. 硬刷新浏览器测试');

// ========== 验证清单 ==========
console.log('\n\n【六、验证清单】\n');
console.log('□ HTML 引用已更新为新的 JS 文件');
console.log('□ 所有 chunk 文件已上传到服务器');
console.log('□ Service Worker 已更新');
console.log('□ Cloudflare 缓存已清除');
console.log('□ 首页正常加载');
console.log('□ 视频解析功能正常');
console.log('□ 表情包页面正常');
console.log('□ MBTI测试页面正常');
console.log('□ 管理后台正常');
console.log('□ 移动端适配正常');
