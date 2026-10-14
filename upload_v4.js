const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

console.log('=== 上传 v4 版本 ===\n');

const conn = new Client();
const assetsDir = 'D:/MTC/daga-clone/frontend/dist/assets';

conn.on('ready', () => {
  console.log('Connected\n');
  
  // 获取新文件
  const newFiles = fs.readdirSync(assetsDir)
    .filter(f => f.startsWith('index-') && (f.endsWith('.js') || f.endsWith('.css')));
  
  console.log(`New files: ${newFiles.join(', ')}\n`);
  
  // 上传 index.html
  console.log('1. Uploading index.html...');
  const html = fs.readFileSync('D:/MTC/daga-clone/frontend/dist/index.html', 'utf8');
  const htmlB64 = Buffer.from(html).toString('base64');
  
  conn.exec(`echo '${htmlB64}' | base64 -d > /opt/1panel/apps/openresty/openresty/root/index.html`, (err, s) => {
    let d = '';
    s.on('data', c => d += c);
    s.on('end', () => {
      console.log('   Done\n');
      
      // 上传小文件
      const smallFiles = newFiles.filter(f => fs.statSync(path.join(assetsDir, f)).size < 50000);
      const bigFiles = newFiles.filter(f => fs.statSync(path.join(assetsDir, f)).size >= 50000);
      
      console.log(`2. Uploading ${smallFiles.length} small files via base64...`);
      
      let idx = 0;
      function uploadSmall() {
        if (idx >= smallFiles.length) {
          console.log('   Small files done\n');
          
          console.log(`3. Uploading ${bigFiles.length} big files via SFTP...`);
          
          let bigIdx = 0;
          function uploadBig() {
            if (bigIdx >= bigFiles.length) {
              console.log('\n=== All uploaded! ===');
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
            
            const file = bigFiles[bigIdx++];
            const filePath = path.join(assetsDir, file);
            const size = fs.statSync(filePath).size;
            
            process.stdout.write(`   [${bigIdx}/${bigFiles.length}] ${file} (${(size/1024).toFixed(1)}KB)... `);
            
            conn.sftp((err, sftp) => {
              if (err) return console.error('SFTP error:', err);
              
              const ws = sftp.createWriteStream('/opt/1panel/apps/openresty/openresty/root/assets/' + file);
              fs.createReadStream(filePath).pipe(ws);
              
              ws.on('finish', () => {
                console.log('OK');
                uploadBig();
              });
            });
          }
          
          uploadBig();
          return;
        }
        
        const file = smallFiles[idx++];
        const filePath = path.join(assetsDir, file);
        const content = fs.readFileSync(filePath);
        const b64 = content.toString('base64');
        
        process.stdout.write(`[${idx}/${smallFiles.length}] ${file}... `);
        
        conn.exec(`echo '${b64}' | base64 -d > /opt/1panel/apps/openresty/openresty/root/assets/${file}`, (err, s) => {
          let d = '';
          s.on('data', c => d += c);
          s.on('end', () => {
            console.log('OK');
            uploadSmall();
          });
        });
      }
      
      uploadSmall();
    });
  });
});

conn.connect({ host: '149.88.74.104', port: 22, username: 'root', password: '6ccNd5KeYR9y', readyTimeout: 15000 });
