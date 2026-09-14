const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

console.log('=== 开始部署到服务器 ===\n');

const conn = new Client();
const serverPath = '/opt/1panel/www/sites/www.ityvip.xyz/index';
const localDist = 'D:/MTC/daga-clone/frontend/dist';
const localPublic = 'D:/MTC/daga-clone/frontend/public';

conn.on('ready', () => {
  console.log('[OK] SSH连接成功\n');
  
  // 创建目录
  conn.exec(`mkdir -p ${serverPath}/assets`, (err, stream) => {
    if (err) {
      console.error('创建目录失败:', err);
      conn.end();
      return;
    }
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.on('close', () => {
      console.log('\n开始上传文件...\n');
      
      // 收集所有文件
      const files = [];
      collectFiles(localDist, '', files);
      collectFiles(localPublic, '', files);
      
      console.log('需要上传', files.length, '个文件\n');
      
      // 逐个上传
      uploadNext(conn, files, 0, serverPath);
    });
  });
});

function collectFiles(dir, prefix, files) {
  fs.readdirSync(dir).forEach(item => {
    const localPath = path.join(dir, item);
    const stat = fs.statSync(localPath);
    if (stat.isDirectory()) {
      collectFiles(localPath, prefix + item + '/', files);
    } else {
      files.push({
        local: localPath,
        server: serverPath + '/' + prefix + item,
        name: prefix + item
      });
    }
  });
}

function uploadNext(conn, files, index, serverPath) {
  if (index >= files.length) {
    console.log('\n✅ 所有文件上传完成!');
    verifyFiles(conn, serverPath);
    return;
  }
  
  const file = files[index];
  const content = fs.readFileSync(file.local);
  const b64 = content.toString('base64');
  
  // 分批上传，每批 3000 字符
  const chunkSize = 3000;
  const chunks = [];
  for (let i = 0; i < b64.length; i += chunkSize) {
    chunks.push(b64.substring(i, i + chunkSize));
  }
  
  const cmd = `echo '${chunks.join("")}' | base64 -d > '${file.server}' && echo "OK_${path.basename(file.local)}"`;
  
  process.stdout.write(`[${index + 1}/${files.length}] 上传 ${file.name}... `);
  
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.log('❌ 错误:', err.message);
      uploadNext(conn, files, index + 1, serverPath);
      return;
    }
    
    stream.on('data', d => {
      if (d.toString().includes('OK_')) {
        console.log('✅ (' + content.length + ' bytes)');
      }
    });
    
    stream.on('close', code => {
      if (code === 0) {
        uploadNext(conn, files, index + 1, serverPath);
      } else {
        console.log(`❌ 退出码: ${code}`);
        uploadNext(conn, files, index + 1, serverPath);
      }
    });
    
    stream.on('error', e => {
      console.log('❌ 流错误:', e.message);
      uploadNext(conn, files, index + 1, serverPath);
    });
  });
}

function verifyFiles(conn, serverPath) {
  console.log('\n=== 验证部署结果 ===\n');
  
  const checks = [
    `ls -la ${serverPath}`,
    `ls -la ${serverPath}/assets`,
    `cat ${serverPath}/index.html`
  ];
  
  let step = 0;
  function runCheck() {
    if (step >= checks.length) {
      conn.end();
      return;
    }
    
    conn.exec(checks[step], (err, stream) => {
      if (err) {
        console.error('验证失败:', err);
        conn.end();
        return;
      }
      stream.on('data', d => process.stdout.write(d.toString()));
      stream.on('close', () => {
        step++;
        setTimeout(runCheck, 500);
      });
    });
  }
  runCheck();
}

conn.on('error', e => console.error('[SSH错误]', e.message));
conn.connect({
  host: '149.88.74.104',
  port: 22,
  username: 'root',
  password: '6ccNd5KeYR9y',
  keepaliveCountMax: 3,
  keepaliveInterval: 10000
});