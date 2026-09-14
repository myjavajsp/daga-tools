const fs = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');

console.log('============================================');
console.log('  本地源码 vs 服务器内容 - 完整对比报告');
console.log('============================================\n');

// ========== 1. 分析本地目录 ==========
console.log('【一、本地目录结构】\n');

const localRoot = 'D:/MTC/daga-clone';
const items = fs.readdirSync(localRoot);

const dirs = items.filter(i => {
  try { return fs.statSync(path.join(localRoot, i)).isDirectory(); } catch(e) { return false; }
});
const files = items.filter(i => {
  try { return fs.statSync(path.join(localRoot, i)).isFile(); } catch(e) { return false; }
});

console.log('根目录目录 (' + dirs.length + '个):', dirs.join(', '));
console.log('根目录文件 (' + files.length + '个)');

// 分析重要文件
console.log('\n重要文件:');
const importantFiles = files.filter(f => 
  ['server.js', 'package.json', 'README.md', '.env.example'].includes(f)
);
importantFiles.forEach(f => {
  const stat = fs.statSync(path.join(localRoot, f));
  console.log('  📄', f, '(' + stat.size + ' bytes)');
});

// 检查是否有 src/ 目录
const srcDir = path.join(localRoot, 'src');
console.log('\n前端源码目录 src/:', fs.existsSync(srcDir) ? '✅ 存在' : '❌ 不存在');

// 检查是否有 dist/ 或 frontend/ 目录
const distDir = path.join(localRoot, 'dist');
const frontendDir = path.join(localRoot, 'frontend');
console.log('构建产物 dist/:', fs.existsSync(distDir) ? '✅ 存在' : '❌ 不存在');
console.log('前端目录 frontend/:', fs.existsSync(frontendDir) ? '✅ 存在' : '❌ 不存在');

// ========== 2. 分析服务器 Assets ==========
console.log('\n\n【二、服务器 Assets 分析】\n');

const serverAssetsDir = 'D:/MTC/daga-clone/server-source/assets';
let serverFiles = [];
if (fs.existsSync(serverAssetsDir)) {
  serverFiles = fs.readdirSync(serverAssetsDir);
}
console.log('已下载文件数:', serverFiles.length);

// 分类
const jsFiles = serverFiles.filter(f => f.endsWith('.js'));
const cssFiles = serverFiles.filter(f => f.endsWith('.css'));
console.log('  JS 文件:', jsFiles.length, '个');
console.log('  CSS 文件:', cssFiles.length, '个');

// ========== 3. 关键组件对比 ==========
console.log('\n\n【三、关键组件对比】\n');

const keyComponents = [
  // 主入口
  { local: 'index-C0oHXt5Q.js', server: 'index-C0oHXt5Q.js', desc: '主应用入口' },
  { local: 'index-DcNlVx-A.js', server: 'index-DcNlVx-A.js', desc: '工具注册表' },
  
  // 核心组件
  { local: 'MediaPlayerTool-LpstSdCC.js', server: 'MediaPlayerTool-LpstSdCC.js', desc: '媒体播放器' },
  { local: 'Layout-DvaKAfYF.js', server: 'Layout-DvaKAfYF.js', desc: '布局组件' },
  { local: 'ToolDetailPage-ChbxY0SS.js', server: 'ToolDetailPage-ChbxY0SS.js', desc: '工具详情页' },
  
  // Vendor 库
  { local: 'react-vendor-6plG7eVM.js', server: 'react-vendor-6plG7eVM.js', desc: 'React 运行时' },
  { local: 'doc-vendor-DtBd-CYe.js', server: 'doc-vendor-DtBd-CYe.js', desc: '文档处理库' },
  { local: 'i18n-vendor-D9Kd0Kpi.js', server: 'i18n-vendor-D9Kd0Kpi.js', desc: '国际化' },
  
  // 功能页面
  { local: 'HomePage-Chg2lopD.js', server: 'HomePage-Chg2lopD.js', desc: '首页' },
  { local: 'ToolsPage-C_T8Ap0j.js', server: 'ToolsPage-C_T8Ap0j.js', desc: '工具列表' },
  { local: 'VideoParser-NQlKsKJO.js', server: 'VideoParser-NQlKsKJO.js', desc: '视频解析' },
];

keyComponents.forEach(comp => {
  const localPath = path.join(localRoot, comp.local);
  const serverPath = path.join(serverAssetsDir, comp.server);
  
  const localExists = fs.existsSync(localPath);
  const serverExists = fs.existsSync(serverPath);
  
  let localSize = 0;
  let serverSize = 0;
  if (localExists) localSize = fs.statSync(localPath).size;
  if (serverExists) serverSize = fs.statSync(serverPath).size;
  
  const status = localExists && serverExists ? '✅' : 
                 localExists ? '📍本地有' : 
                 serverExists ? '🌐服务器有' : '❌';
  
  console.log(status, comp.desc);
  console.log('    本地:', localExists ? localSize + ' bytes' : '不存在');
  console.log('    服务器:', serverExists ? serverSize + ' bytes' : '不存在');
  
  // 比较内容差异
  if (localExists && serverExists && localSize > 0 && serverSize > 0) {
    const localContent = fs.readFileSync(localPath, 'utf8');
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    const isSame = localContent === serverContent;
    console.log('    内容:', isSame ? '✅ 相同' : '❌ 不同 (' + Math.abs(localSize - serverSize) + ' bytes 差异)');
  }
  console.log('');
});

// ========== 4. 服务器独有文件 ==========
console.log('\n\n【四、服务器独有文件（本地缺失）】\n');

const localFileSet = new Set(files.map(f => f.toLowerCase()));
const serverOnlyFiles = serverFiles.filter(f => !localFileSet.has(f.toLowerCase()));

console.log('服务器有但本地没有的文件 (' + serverOnlyFiles.length + '个):');
serverOnlyFiles.slice(0, 30).forEach(f => {
  const filepath = path.join(serverAssetsDir, f);
  const stat = fs.statSync(filepath);
  console.log('  🌐', f, '(' + stat.size + ' bytes)');
});

// ========== 5. 本地独有文件 ==========
console.log('\n\n【五、本地独有文件（服务器没有）】\n');

const serverFileSet = new Set(serverFiles.map(f => f.toLowerCase()));
const localOnlyFiles = files.filter(f => !serverFileSet.has(f.toLowerCase()) && f.endsWith('.js'));

console.log('本地有但服务器没有的文件 (' + localOnlyFiles.length + '个):');
localOnlyFiles.filter(f => f.length < 30).slice(0, 20).forEach(f => {
  console.log('  📍', f);
});

// ========== 6. 总结 ==========
console.log('\n\n【六、补齐建议】\n');
console.log('1. 前端源代码 (src/) 完全缺失，需要从 GitHub 拉取:');
console.log('   git clone https://github.com/myjavajsp/daga-clone.git');
console.log('');
console.log('2. 已构建的 chunk 文件已下载到:');
console.log('   D:/MTC/daga-clone/server-source/assets/');
console.log('');
console.log('3. 如果只需部署，可直接复制 server-source/assets/ 到服务器');
console.log('   如果需要修改源码，必须获取原始 React/TypeScript 源码');

// ========== 7. 详细文件列表 ==========
console.log('\n\n【七、完整服务器 Assets 文件列表】\n');
serverFiles.sort().forEach(f => {
  const filepath = path.join(serverAssetsDir, f);
  const stat = fs.statSync(filepath);
  const inLocal = localFileSet.has(f.toLowerCase());
  const marker = inLocal ? '✅' : '🌐';
  console.log(marker, f.padEnd(45), stat.size.toString().padStart(8), 'bytes');
});