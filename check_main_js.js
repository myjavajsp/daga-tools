const https = require('https');
const zlib = require('zlib');

console.log('=== 检查主 JS 内容 ===\n');

// 获取主 JS 文件
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
      
      // 搜索关键字符串（不区分大小写）
      const searches = [
        'MemePage', 'MbtiTestPage', 'HotPage', 'AIToolsPage',
        'ScreenRecorder', 'AboutPage', 'PrivacyPolicy', 'TermsPage',
        'ContactPage', 'ArticleList', 'ArticleDetail', 'NotFoundPage',
        'ToolsPage', 'MediaPlayerTool'
      ];
      
      console.log('\n=== 搜索关键字符串 ===\n');
      searches.forEach(term => {
        const idx = content.search(new RegExp(term, 'i'));
        console.log(term + ':', idx >= 0 ? '✅ 找到' : '❌ 未找到');
      });
      
      // 统计字符数
      console.log('\n总字符数:', content.length);
      
    } catch (e) {
      console.log('解压失败:', e.message);
    }
  });
});