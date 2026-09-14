const https = require('https');
const zlib = require('zlib');
const fs = require('fs');

console.log('=== 分析原始导航栏 ===\n');

// 获取原始主 JS 文件
https.get('https://www.ityvip.xyz/assets/index-C0oHXt5Q.js', {
  headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Encoding': 'gzip, br' }
}, (res) => {
  const chunks = [];
  res.on('data', chunk => chunks.push(chunk));
  res.on('end', () => {
    try {
      const decoded = zlib.gunzipSync(Buffer.concat(chunks));
      const content = decoded.toString('utf8');
      
      // 提取导航相关的文本
      const navPatterns = [
        '视频解析', '热搜', '表情包', '制图', '去水印', '实用工具', 
        'M3U8', 'MP4播放', '在线播放', '录屏', '音乐', 'AI工具',
        'MBTI', '测试', '关于', '隐私', '条款', '联系'
      ];
      
      console.log('原始导航相关关键词:');
      navPatterns.forEach(p => {
        if (content.includes(p)) {
          // 找到上下文
          const idx = content.indexOf(p);
          const context = content.substring(Math.max(0, idx-20), idx+p.length+20);
          console.log(`  ${p}: 找到`);
        }
      });
      
      // 保存原始内容供分析
      fs.writeFileSync('D:/MTC/daga-clone/original_nav_analysis.txt', content);
      console.log('\n原始 JS 已保存到 original_nav_analysis.txt');
      
    } catch (e) {
      console.log('错误:', e.message);
    }
  });
});