const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

console.log('=== 上传最新构建 ===\n');

const conn = new Client();
const assetsDir = 'D:/MTC/daga-clone/frontend/dist/assets';

conn.on('ready', () => {
  console.log('Connected\n');
  
  // 获取所有 index- 文件
  const files = fs.readdirSync(assetsDir)
    .filter(f => f.startsWith('index-') && (f.endsWith('.js') || f.endsWith('.css')));
  
  console.log(`Files to upload: ${files.join(', ')}\n`);
  
  // 上传 index.html
  console.log('1. index.html...');
  const html = fs.readFileSync('D:/MTC/daga-clone/frontend/dist/index.html', 'utf8');
  const htmlB64 = Buffer.from(html).toString('base64');
  
  conn.exec(`echo '${htmlB64}' | base64 -d > /opt/1panel/apps/openresty/openresty/root/index.html && echo OK`, (err, s) => {
    let d = '';
    s.on('data', c => d += c);
    s.on('end', () => {
      console.log(d.trim());
      
      // 上传 JS/CSS 文件
      console.log('\n2. Assets...');
      
      let idx = 0;
      function uploadNext() {
        if (idx >= files.length) {
          console.log('\n=== Done! ===');
          conn.exec('grep index- /opt/1panel/apps/openresty/openresty/root/index.html', (err, s) => {
            let d = '';
            s.on('data', c => d += c);
            s.on('end', () => {
              console.log(d.trim());
              conn.end();
            });
          });
          return;
        }
        
        const file = files[idx++];
        const filePath = path.join(assetsDir, file);
        const size = fs.statSync(filePath).size;
        
        if (size < 50000) {
          const content = fs.readFileSync(filePath);
          const b64 = content.toString('base64');
          process.stdout.write(`   ${file} (${(size/1024).toFixed(1)}KB)... `);
          
          conn.exec(`echo '${b64}' | base64 -d > /opt/1panel/apps/openresty/openresty/root/assets/${file} && echo OK`, (err, s) => {
            let d = '';
            s.on('data', c => d += c);
            s.on('end', () => {
              console.log(d.trim());
              uploadNext();
            });
          });
        } else {
          process.stdout.write(`   ${file} (${(size/1024).toFixed(1)}KB)... `);
          conn.sftp((err, sftp) => {
            if (err) return console.error('SFTP error:', err);
            
            const ws = sftp.createWriteStream('/opt/1panel/apps/openresty/openresty/root/assets/' + file);
            fs.createReadStream(filePath).pipe(ws);
            
            ws.on('finish', () => {
              console.log('OK');
              uploadNext();
            });
          });
        }
      }
      
      uploadNext();
    });
  });
});

conn.connect({ host: '149.88.74.104', port: 22, username: 'root', password: '6ccNd5KeYR9y', readyTimeout: 15000 });
