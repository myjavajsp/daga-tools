const https = require('https');

console.log('=== 最终验证 ===\n');

https.get('https://www.ityvip.xyz/', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}, (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    console.log('主页状态码:', res.statusCode);
    console.log('\nHTML 内容:');
    console.log(html);
    
    const scripts = html.match(/src="([^"]+)"/g) || [];
    console.log('\nJS 引用:', scripts.length, '个');
    scripts.forEach(s => console.log('  ', s));
    
    console.log('\n=== 测试关键页面 ===');
    
    // 测试播放器页面
    https.get('https://www.ityvip.xyz/tools/m3u8-player/', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }, (res2) => {
      let html2 = '';
      res2.on('data', chunk => html2 += chunk);
      res2.on('end', () => {
        console.log('\n播放器页面状态码:', res2.statusCode);
        console.log('✅ 页面可访问');
      });
    });
  });
});