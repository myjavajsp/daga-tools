const https = require('https');
const zlib = require('zlib');

console.log('=== 检查新页面组件 ===\n');

// 检查主 JS 文件中的页面引用
https.get('https://www.ityvip.xyz/assets/index-ilPE959f.js', {
  headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Encoding': 'gzip, br' }
}, (res) => {
  const chunks = [];
  res.on('data', chunk => chunks.push(chunk));
  res.on('end', () => {
    try {
      const decoded = zlib.gunzipSync(Buffer.concat(chunks));
      const content = decoded.toString('utf8');
      
      console.log('主 JS 大小:', decoded.length, 'bytes');
      
      // 检查是否包含新页面的引用
      const checks = [
        'MemePage', 'MbtiTestPage', 'HotPage', 'AIToolsPage',
        'ScreenRecorderPage', 'AboutPage', 'PrivacyPolicyPage',
        'TermsPage', 'ContactPage', 'ArticleListPage', 'ArticleDetailPage',
        'NotFoundPage', 'ToolsPage'
      ];
      
      console.log('\n=== 页面组件检查 ===\n');
      checks.forEach(page => {
        const found = content.includes(page);
        console.log(page + ':', found ? '✅' : '❌');
      });
      
      // 提取 chunk 引用
      const refs = content.match(/"assets\/[^"]+/g) || [];
      const uniqueRefs = [...new Set(refs.map(r => r.replace('"assets/', '')))];
      
      console.log('\n引用的 chunk 文件:', uniqueRefs.length, '个');
      uniqueRefs.forEach(r => console.log('  -', r));
      
    } catch (e) {
      console.log('解压失败:', e.message);
    }
  });
});