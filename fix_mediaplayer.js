const https = require('https');
const fs = require('fs');
const zlib = require('zlib');

console.log('=== 修复 MediaPlayerTool 组件 ===\n');

// 下载原始的 MediaPlayerTool chunk
https.get('https://www.ityvip.xyz/assets/MediaPlayerTool-LpstSdCC.js', {
  headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Encoding': 'gzip, br' }
}, (res) => {
  const chunks = [];
  res.on('data', chunk => chunks.push(chunk));
  res.on('end', () => {
    const decoded = zlib.gunzipSync(Buffer.concat(chunks));
    let content = decoded.toString('utf8');
    
    console.log('原始大小:', decoded.length, 'bytes');
    
    // 检查是否已包含修复
    const hasFullView = content.includes('fullView');
    const hasMouseEnter = content.includes('onMouseEnter');
    
    console.log('\n当前状态:');
    console.log('  fullView:', hasFullView ? '✅' : '❌');
    console.log('  onMouseEnter:', hasMouseEnter ? '✅' : '❌');
    
    if (!hasFullView || !hasMouseEnter) {
      console.log('\n需要应用修复...');
      
      // 修复1: 添加 fullView 到 fullScreenChange
      if (!hasFullView) {
        content = content.replace(
          /fullScreenChange:function\([^)]*\)\{/,
          'fullScreenChange:function(s){fullView:s,'
        );
        console.log('  ✅ 已添加 fullView');
      }
      
      // 修复2: 添加 onMouseEnter/onMouseLeave
      if (!hasMouseEnter) {
        // 找到 video ref 并添加事件
        const newHandlers = ',onMouseEnter:function(){var e=window.playerElement;if(e)try{e.dispatchEvent(new MouseEvent("mouseenter",{bubbles:!0,cancelable:!0,view:window})}catch(e){})},onMouseLeave:function(){var e=window.playerElement;if(e)try{e.dispatchEvent(new MouseEvent("mouseleave",{bubbles:!0,cancelable:!0,view:window})}catch(e){})}';
        content = content.replace(
          /ref:videoRef,/,
          'ref:videoRef' + newHandlers
        );
        console.log('  ✅ 已添加 onMouseEnter/onMouseLeave');
      }
      
      // 保存修复后的文件
      fs.writeFileSync('D:/MTC/daga-clone/fixed_MediaPlayerTool.js', content);
      console.log('\n修复后的文件已保存');
      console.log('新大小:', content.length, 'bytes');
      
      // 上传到服务器
      uploadFixedFile(content);
    } else {
      console.log('\n✅ 组件已包含修复，无需修改');
    }
  });
});

function uploadFixedFile(content) {
  const { Client } = require('ssh2');
  const conn = new Client();
  const serverPath = '/opt/1panel/www/sites/www.ityvip.xyz/index/assets';
  
  conn.on('ready', () => {
    console.log('\n[OK] SSH连接成功，开始上传...\n');
    
    const b64 = content.toString('base64');
    const cmd = `echo '${b64}' | base64 -d > '${serverPath}/MediaPlayerTool-LpstSdCC.js' && echo "UPLOAD_OK"`;
    
    conn.exec(cmd, (err, stream) => {
      stream.on('data', d => {
        if (d.toString().includes('UPLOAD_OK')) {
          console.log('✅ 上传成功!');
        }
      });
      stream.on('close', () => {
        console.log('\n请清除 Cloudflare 缓存并硬刷新浏览器测试');
        conn.end();
      });
    });
  });
  
  conn.on('error', e => console.error('[SSH错误]', e.message));
  conn.connect({
    host: '149.88.74.104',
    port: 22,
    username: 'root',
    password: '6ccNd5KeYR9y'
  });
}