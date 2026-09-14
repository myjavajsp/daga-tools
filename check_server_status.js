const https = require('https');
const zlib = require('zlib');

console.log('=== 检查当前服务器状态 ===\n');

// 检查主页
https.get('https://www.ityvip.xyz/', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}, (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    console.log('HTML 状态码:', res.statusCode);
    
    const scripts = html.match(/src="([^"]+)"/g) || [];
    console.log('\nJS 引用:', scripts.length, '个');
    scripts.forEach(s => console.log('  ', s));
    
    // 检查主 JS
    const jsMatch = html.match(/src="([^"]+index[^"]+)"/);
    if (jsMatch) {
      checkJS(jsMatch[1]);
    }
  });
});

function checkJS(url) {
  https.get('https://www.ityvip.xyz' + url, {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Encoding': 'gzip, br' }
  }, (res) => {
    const chunks = [];
    res.on('data', chunk => chunks.push(chunk));
    res.on('end', () => {
      try {
        const decoded = zlib.gunzipSync(Buffer.concat(chunks));
        const content = decoded.toString('utf8');
        
        console.log('\nJS 大小:', decoded.length, 'bytes');
        console.log('文件名:', url.split('/').pop());
        
        // 检查关键功能
        console.log('\n=== 功能检查 ===');
        console.log('nav:', content.includes('<nav') || content.includes('>nav') ? '✅ 有导航' : '❌ 缺少导航');
        console.log('Header:', content.includes('Header') || content.includes('header') ? '✅' : '❌');
        console.log('fullView:', content.includes('fullView') ? '✅' : '❌');
        console.log('onMouseEnter:', content.includes('onMouseEnter') ? '✅' : '❌');
        console.log('PerformanceObserver:', content.includes('PerformanceObserver') ? '❌' : '✅');
        console.log('NotFoundError:', content.includes('NotFoundError') ? '❌' : '✅');
        
      } catch (e) {
        console.log('解压失败:', e.message);
      }
    });
  });
}