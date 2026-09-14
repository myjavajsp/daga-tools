const https = require('https');
const zlib = require('zlib');
const fs = require('fs');

console.log('=== 分析服务器原始构建的所有页面 ===\n');

// 获取原始主 JS
https.get('https://www.ityvip.xyz/assets/index-C0oHXt5Q.js', {
  headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Encoding': 'gzip, br' }
}, (res) => {
  const chunks = [];
  res.on('data', chunk => chunks.push(chunk));
  res.on('end', () => {
    const decoded = zlib.gunzipSync(Buffer.concat(chunks));
    const content = decoded.toString('utf8');
    
    // 提取所有页面路径
    const routes = content.match(/path:"([^"]+)"/g) || [];
    const uniqueRoutes = [...new Set(routes.map(r => r.replace('path:"', '').replace('"', '')))];
    
    console.log('服务器路由数量:', uniqueRoutes.length);
    console.log('\n所有路由:');
    uniqueRoutes.forEach(r => console.log('  -', r));
    
    // 提取页面组件名
    const componentMatches = content.match(/element:<\w+\s*\/>/g) || [];
    const components = [...new Set(componentMatches.map(m => m.match(/<(\w+)/)[1]))];
    
    console.log('\n\n页面组件数量:', components.length);
    console.log('\n所有组件:');
    components.forEach(c => console.log('  -', c));
    
    // 保存到文件供参考
    fs.writeFileSync('D:/MTC/daga-clone/server_routes.json', JSON.stringify({
      routes: uniqueRoutes,
      components: components
    }, null, 2));
    
    console.log('\n已保存到 server_routes.json');
  });
});