const https = require('https');

console.log('=== 检查服务器 HTML ===\n');

https.get('https://www.ityvip.xyz/', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}, (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    console.log('HTML 内容:');
    console.log(html);
    
    // 检查 CSS 引用
    const cssMatch = html.match(/href="([^"]+\.css[^"]*)"/g);
    console.log('\nCSS 引用:', cssMatch);
    
    // 检查 JS 引用
    const jsMatch = html.match(/src="([^"]+\.js[^"]*)"/g);
    console.log('JS 引用:', jsMatch);
  });
});