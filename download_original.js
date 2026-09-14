const https = require('https');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

console.log('=== 下载服务器上的原始构建产物 ===\n');

const serverUrl = 'https://www.ityvip.xyz';
const outputDir = 'D:/MTC/daga-clone/original-build';

// 创建输出目录
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 需要下载的文件列表
const files = [
  '/assets/index-C0oHXt5Q.js',  // 原始主 JS
  '/assets/MediaPlayerTool-LpstSdCC.js',
  '/assets/Layout-DvaKAfYF.js',
  '/assets/react-vendor-6plG7eVM.js',
  '/assets/index-DcNlVx-A.js',
  '/assets/i18n-vendor-D9Kd0Kpi.js',
  '/assets/doc-vendor-DtBd-CYe.js',
  '/assets/image-vendor-C2AXu4gi.js',
  '/assets/leaflet-vendor-CZjAPeah.js',
  '/assets/leaflet-vendor-Dgihpmma.css'
];

let downloaded = 0;

files.forEach((file, i) => {
  setTimeout(() => {
    https.get(serverUrl + file, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Encoding': 'gzip, br' }
    }, (res) => {
      if (res.statusCode !== 200) {
        console.log(`❌ ${file} - ${res.statusCode}`);
        downloaded++;
        return;
      }
      
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        try {
          const decoded = zlib.gunzipSync(Buffer.concat(chunks));
          const filename = path.basename(file);
          fs.writeFileSync(path.join(outputDir, filename), decoded);
          console.log(`✅ ${filename} (${decoded.length} bytes)`);
        } catch (e) {
          console.log(`❌ ${file} - ${e.message}`);
        }
        downloaded++;
      });
    });
  }, i * 200);
});

setTimeout(() => {
  console.log('\n=== 下载完成 ===');
  console.log('文件保存在:', outputDir);
}, files.length * 200 + 1000);