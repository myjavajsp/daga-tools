const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('=== 从服务器备份恢复原有文件 ===\n');

// 检查服务器上是否有备份
const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('[OK] SSH连接成功\n');
  
  // 检查备份文件
  conn.exec('ls -la /opt/1panel/www/sites/www.ityvip.xyz/index/assets/*.bak 2>/dev/null | head -5', (err, stream) => {
    stream.on('data', d => console.log(d.toString()));
    stream.on('close', () => {
      // 检查是否有 v2 备份
      conn.exec('ls /opt/1panel/www/sites/www.ityvip.xyz/index/assets/v2/latest/ | head -10', (err, stream) => {
        stream.on('data', d => console.log(d.toString()));
        stream.on('close', () => {
          conn.end();
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