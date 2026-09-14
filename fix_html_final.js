const { Client } = require('ssh2');

console.log('=== 清理无效的 vendor 引用 ===\n');

const conn = new Client();
const serverPath = '/opt/1panel/www/sites/www.ityvip.xyz/index';

conn.on('ready', () => {
  console.log('[OK] SSH连接成功\n');
  
  // 更新 HTML，移除无效的 modulepreload 引用
  const newHtml = `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>全民影视VIP视频解析</title>
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <script type="module" crossorigin src="/assets/index-C0oHXt5Q.js"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;
  
  const b64 = Buffer.from(newHtml).toString('base64');
  
  conn.exec(`echo '${b64}' | base64 -d > ${serverPath}/index.html && echo "HTML_FIXED"`, (err, stream) => {
    stream.on('data', d => {
      if (d.toString().includes('HTML_FIXED')) {
        console.log('✅ HTML 已修复');
      }
    });
    stream.on('close', () => {
      console.log('\n请清除 Cloudflare 缓存并硬刷新浏览器测试:');
      console.log('https://www.ityvip.xyz/');
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