const https = require('https');

console.log('=== 尝试清除 Cloudflare 缓存 ===\n');

// 方法1: 使用 Cache-Control 头强制刷新
const options = {
  hostname: 'www.ityvip.xyz',
  path: '/',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
};

https.get(options, (res) => {
  console.log('状态码:', res.statusCode);
  console.log('CF-Cache-Status:', res.headers['cf-cache-status']);
  console.log('Cache-Control:', res.headers['cache-control']);
  
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    const scripts = html.match(/src="([^"]+)"/g) || [];
    console.log('\n当前 JS 引用:', scripts);
    
    // 检查最新文件
    const newJs = scripts.find(s => s.includes('KXEmRP3K'));
    if (newJs) {
      console.log('\n✅ 已使用最新构建文件!');
    } else {
      console.log('\n⚠️ 仍在使用旧文件，请清除 Cloudflare 缓存');
    }
  });
});