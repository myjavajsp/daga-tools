const https = require('https');
const zlib = require('zlib');

console.log('=== 详细检查 JS 内容 ===\n');

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
      
      // 搜索不同的模式
      console.log('\n=== 搜索组件相关代码 ===\n');
      
      // MUI AppBar 可能被压缩成不同的名称
      const patterns = [
        ['AppBar', 'AppBar'],
        ['Toolbar', 'Toolbar'],
        ['BrowserRouter', 'BrowserRouter'],
        ['Routes', 'Routes'],
        ['Route', 'Route'],
        ['navigate', 'navigate函数'],
        ['useNavigate', 'useNavigate'],
        ['/music', '音乐路由'],
        ['/meme', '表情包路由'],
        ['全民影视', '网站标题'],
        ['视频解析', '解析文本'],
        ['音乐解析', '音乐文本']
      ];
      
      patterns.forEach(([pattern, desc]) => {
        const idx = content.search(new RegExp(pattern, 'i'));
        console.log(`${desc} (${pattern}):`, idx >= 0 ? '✅ 找到' : '❌ 未找到');
      });
      
      // 检查是否包含 MUI 组件
      console.log('\n=== MUI 组件检查 ===\n');
      const muiPatterns = [
        'MuiAppBar',
        'MuiToolbar',
        'CssBaseline',
        'ThemeProvider',
        '@emotion/react',
        '@mui/material'
      ];
      
      muiPatterns.forEach(pattern => {
        const idx = content.indexOf(pattern);
        console.log(`${pattern}:`, idx >= 0 ? '✅' : '❌');
      });
      
      // 输出部分内容
      console.log('\n=== JS 内容片段 ===\n');
      console.log('前500字符:', content.substring(0, 500));
      
    } catch (e) {
      console.log('解压失败:', e.message);
    }
  });
});