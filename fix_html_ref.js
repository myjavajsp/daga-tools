const { Client } = require('ssh2');

console.log('=== 修复 HTML 引用 ===\n');

const conn = new Client();
const serverPath = '/opt/1panel/www/sites/www.ityvip.xyz/index';

conn.on('ready', () => {
  console.log('[OK] SSH连接成功\n');
  
  // 步骤1: 检查服务器上有哪些 JS 文件
  conn.exec(`ls -la ${serverPath}/assets/*.js | grep -E "index-(C0oHXt5Q|ilPE959f)"`, (err, stream) => {
    stream.on('data', d => console.log('当前 JS 文件:'));
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.on('close', () => {
      // 步骤2: 更新 HTML 引用
      console.log('\n更新 HTML 引用...');
      conn.exec(`sed -i 's|/assets/index-ilPE959f.js|/assets/index-C0oHXt5Q.js|g' ${serverPath}/index.html && echo "HTML_UPDATED"`, (err, stream) => {
        stream.on('data', d => process.stdout.write(d.toString()));
        stream.on('close', () => {
          // 步骤3: 验证
          console.log('\n验证修改...');
          conn.exec(`cat ${serverPath}/index.html`, (err, stream) => {
            stream.on('data', d => console.log(d.toString()));
            stream.on('close', () => {
              console.log('\n✅ HTML 引用已更新!');
              console.log('请清除 Cloudflare 缓存并硬刷新浏览器测试');
              conn.end();
            });
          });
        });
      });
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