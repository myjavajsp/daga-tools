const https = require('https');
const zlib = require('zlib');

console.log('=== 检查 CSS 加载 ===\n');

// 检查 CSS 文件
https.get('https://www.ityvip.xyz/assets/index-YZbUhiRi.css', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('CSS 状态码:', res.statusCode);
    console.log('CSS 大小:', data.length, 'bytes');
    console.log('\nCSS 内容前200字符:');
    console.log(data.substring(0, 200));
    
    // 检查是否包含 Tailwind 指令
    console.log('\n=== CSS 内容检查 ===');
    console.log('包含 @tailwind:', data.includes('@tailwind'));
    console.log('包含 @apply:', data.includes('@apply'));
    console.log('包含 .container:', data.includes('.container'));
    console.log('包含 .flex:', data.includes('.flex'));
    
    if (data.length < 1000) {
      console.log('\n⚠️ CSS 文件可能未正确生成或编译');
    }
  });
});

// 同时检查主 JS 中的路由配置
console.log('\n=== 检查 JS 文件 ===\n');
https.get('https://www.ityvip.xyz/assets/index-ilPE959f.js', {
  headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Encoding': 'gzip, br' }
}, (res) => {
  const chunks = [];
  res.on('data', chunk => chunks.push(chunk));
  res.on('end', () => {
    try {
      const decoded = zlib.gunzipSync(Buffer.concat(chunks));
      const content = decoded.toString('utf8');
      
      console.log('JS 大小:', decoded.length, 'bytes');
      
      // 检查是否包含 Header 组件
      console.log('\n=== 组件检查 ===');
      console.log('Header:', content.includes('Header') || content.includes('header') ? '✅' : '❌');
      console.log('Footer:', content.includes('Footer') || content.includes('footer') ? '✅' : '❌');
      console.log('nav:', content.includes('<nav') || content.includes('>nav') ? '✅' : '❌');
      
      // 检查路由
      console.log('\n=== 路由检查 ===');
      console.log('/:', content.includes('path:"/"') ? '✅' : '❌');
      console.log('/music:', content.includes('path:"/music"') ? '✅' : '❌');
      console.log('/meme:', content.includes('path:"/meme"') ? '✅' : '❌');
      console.log('/tools:', content.includes('path:"/tools"') ? '✅' : '❌');
      
    } catch (e) {
      console.log('解压失败:', e.message);
    }
  });
});