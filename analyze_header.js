const https = require('https');
const zlib = require('zlib');

console.log('=== 下载服务器原始 Header 组件 ===\n');

// 下载原始构建中的 Header 相关代码
https.get('https://www.ityvip.xyz/assets/index-C0oHXt5Q.js', {
  headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Encoding': 'gzip, br' }
}, (res) => {
  const chunks = [];
  res.on('data', chunk => chunks.push(chunk));
  res.on('end', () => {
    try {
      const decoded = zlib.gunzipSync(Buffer.concat(chunks));
      const content = decoded.toString('utf8');
      
      // 提取 Header 相关代码
      const headerMatch = content.match(/function\s+\w+\(\)\{[^}]*navbar[^}]*\}/is) || [];
      console.log('找到 Header 相关代码:', headerMatch.length, '个');
      
      // 查找导航相关的关键字符串
      const navKeywords = ['navbar', 'nav', 'Navigation', 'video解析', 'music', 'meme', 'hot'];
      navKeywords.forEach(kw => {
        const idx = content.indexOf(kw);
        if (idx >= 0) {
          console.log(`找到 "${kw}" 在位置 ${idx}`);
          console.log('  上下文:', content.substring(Math.max(0, idx-50), idx+100));
        }
      });
      
      // 保存完整内容供分析
      require('fs').writeFileSync('D:/MTC/daga-clone/original_header_analysis.js', content);
      console.log('\n完整内容已保存到 original_header_analysis.js');
      
    } catch (e) {
      console.log('错误:', e.message);
    }
  });
});