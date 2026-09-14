const https = require('https');
const zlib = require('zlib');

console.log('=== 检查 MediaPlayerTool 修复状态 ===\n');

// 检查 MediaPlayerTool chunk
https.get('https://www.ityvip.xyz/assets/MediaPlayerTool-LpstSdCC.js', {
  headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Encoding': 'gzip, br' }
}, (res) => {
  const chunks = [];
  res.on('data', chunk => chunks.push(chunk));
  res.on('end', () => {
    try {
      const decoded = zlib.gunzipSync(Buffer.concat(chunks));
      const content = decoded.toString('utf8');
      
      console.log('MediaPlayerTool 大小:', decoded.length, 'bytes');
      console.log('\n=== 修复检查 ===');
      console.log('fullView:', content.includes('fullView') ? '✅' : '❌');
      console.log('onMouseEnter:', content.includes('onMouseEnter') ? '✅' : '❌');
      console.log('onMouseLeave:', content.includes('onMouseLeave') ? '✅' : '❌');
      console.log('PerformanceObserver:', content.includes('PerformanceObserver') ? '❌ 仍存在' : '✅ 已移除');
      console.log('NotFoundError:', content.includes('NotFoundError') ? '❌ 仍存在' : '✅ 已修复');
      
    } catch (e) {
      console.log('解压失败:', e.message);
    }
  });
});