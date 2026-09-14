const https = require('https');
const zlib = require('zlib');

console.log('=== 检查主页状态 ===\n');

// 检查主页 HTML
https.get('https://www.ityvip.xyz/', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}, (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    console.log('HTML 状态码:', res.statusCode);
    
    // 检查 JS 引用
    const scriptMatch = html.match(/src="([^"]+)"/g) || [];
    console.log('\nJS 引用:', scriptMatch.length, '个');
    scriptMatch.forEach(s => console.log('  ', s));
    
    // 检查是否有新的 JS 文件
    const newJs = scriptMatch.find(s => s.includes('ilPE959f'));
    if (newJs) {
      console.log('\n⚠️ 检测到新的 JS 文件，可能需要清除缓存');
    }
    
    // 检查旧的 JS 文件
    const oldJs = scriptMatch.find(s => s.includes('C0oHXt5Q'));
    if (oldJs) {
      console.log('\n✅ 使用正确的 JS 文件');
    }
  });
});

// 检查主 JS 文件
setTimeout(() => {
  console.log('\n=== 检查主 JS 文件 ===');
  
  https.get('https://www.ityvip.xyz/assets/index-C0oHXt5Q.js', {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Encoding': 'gzip, br' }
  }, (res) => {
    console.log('index-C0oHXt5Q.js 状态码:', res.statusCode);
    
    const chunks = [];
    res.on('data', chunk => chunks.push(chunk));
    res.on('end', () => {
      try {
        const decoded = zlib.gunzipSync(Buffer.concat(chunks));
        console.log('解压后大小:', decoded.length, 'bytes');
        
        const content = decoded.toString('utf8');
        console.log('\n=== 功能检查 ===');
        console.log('nav:', content.includes('<nav') || content.includes('>nav') ? '✅' : '❌');
        console.log('Navigation:', content.includes('Navigation') ? '✅' : '❌');
        console.log('fullView:', content.includes('fullView') ? '✅' : '❌');
        console.log('PerformanceObserver:', content.includes('PerformanceObserver') ? '❌' : '✅');
        console.log('NotFoundError:', content.includes('NotFoundError') ? '❌' : '✅');
        
      } catch (e) {
        console.log('解压失败:', e.message);
      }
    });
  });
}, 500);