const fs = require('fs');
const path = require('path');

console.log('=== 分析服务器 MediaPlayerTool chunk ===\n');

const chunkPath = 'D:/MTC/daga-clone/server-build/assets/MediaPlayerTool-LpstSdCC.js';
if (!fs.existsSync(chunkPath)) {
  console.log('文件不存在，需要先下载');
  process.exit(1);
}

const content = fs.readFileSync(chunkPath, 'utf8');
console.log('文件大小:', content.length, 'bytes\n');

// 分析关键代码模式
console.log('【代码特征分析】\n');
console.log('包含 fullView:', content.includes('fullView'));
console.log('包含 onMouseEnter:', content.includes('onMouseEnter'));
console.log('包含 onMouseLeave:', content.includes('onMouseLeave'));
console.log('包含 navigator.mediaSession:', content.includes('navigator.mediaSession'));
console.log('包含 hls.js:', content.includes('hls') || content.includes('Hls'));
console.log('包含 video 元素:', content.includes('<video') || content.includes('>video'));

// 提取关键函数和组件
const patterns = [
  /function\s+(\w+)/g,
  /const\s+\w+\s*=\s*\([^)]*\)\s*=>/g,
  /export\s+default\s+function\s+(\w+)/g
];

console.log('\n【尝试提取组件名】\n');
const funcMatches = content.match(/function\s+(\w+)/g) || [];
console.log('函数定义:', funcMatches.slice(0, 10).join(', '));

const constMatches = content.match(/const\s+(\w+)\s*=/g) || [];
console.log('常量定义:', constMatches.slice(0, 10).join(', '));