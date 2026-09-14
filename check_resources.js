const https = require('https');
const zlib = require('zlib');

console.log('=== 检查资源可访问性 ===\n');

// 检查 CSS
https.get('https://www.ityvip.xyz/assets/index-YZbUhiRi.css', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}, (res) => {
  console.log('CSS 状态码:', res.statusCode);
  console.log('CF-Cache-Status:', res.headers['cf-cache-status']);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('CSS 大小:', data.length, 'bytes');
    
    // 检查是否包含关键样式
    console.log('\nCSS 内容检查:');
    console.log('  .container:', data.includes('.container') ? '✅' : '❌');
    console.log('  .flex:', data.includes('.flex') ? '✅' : '❌');
    console.log('  .fixed:', data.includes('.fixed') ? '✅' : '❌');
    console.log('  .absolute:', data.includes('.absolute') ? '✅' : '❌');
    console.log('  background:', data.includes('background') ? '✅' : '❌');
  });
});

// 检查 JS
setTimeout(() => {
  https.get('https://www.ityvip.xyz/assets/index-ilPE959f.js', {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Encoding': 'gzip, br' }
  }, (res) => {
    console.log('\nJS 状态码:', res.statusCode);
    console.log('CF-Cache-Status:', res.headers['cf-cache-status']);
    
    const chunks = [];
    res.on('data', chunk => chunks.push(chunk));
    res.on('end', () => {
      try {
        const decoded = zlib.gunzipSync(Buffer.concat(chunks));
        console.log('JS 解压后大小:', decoded.length, 'bytes');
        
        // 检查是否包含关键组件
        const content = decoded.toString('utf8');
        console.log('\nJS 内容检查:');
        console.log('  AppBar:', content.includes('AppBar') ? '✅' : '❌');
        console.log('  Toolbar:', content.includes('Toolbar') ? '✅' : '❌');
        console.log('  BrowserRouter:', content.includes('BrowserRouter') ? '✅' : '❌');
        console.log('  Routes:', content.includes('Routes') ? '✅' : '❌');
        
      } catch (e) {
        console.log('解压失败:', e.message);
      }
    });
  });
}, 500);