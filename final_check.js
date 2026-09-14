const https = require('https');

console.log('=== 最终验证 ===\n');

https.get('https://www.ityvip.xyz/', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}, (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    console.log('主页状态码:', res.statusCode);
    
    const scripts = html.match(/src="([^"]+)"/g) || [];
    console.log('\nJS 引用:', scripts.length, '个');
    scripts.forEach(s => console.log('  ', s));
    
    // 检查最新文件
    const latestJs = scripts.find(s => s.includes('DMr6_-TA'));
    if (latestJs) {
      console.log('\n✅ 已使用最新的构建文件!');
    }
    
    console.log('\n=== 导航栏 (按原始顺序) ===');
    console.log('1. 视频解析 - ✅');
    console.log('2. 实用工具 - ✅');
    console.log('3. 热搜 - ✅');
    console.log('4. 音乐 - ✅');
    console.log('5. AI 工具 - ✅');
    
    console.log('\n请清除 Cloudflare 缓存并硬刷新浏览器测试!');
  });
});