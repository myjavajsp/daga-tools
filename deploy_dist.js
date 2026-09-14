const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

console.log('=== 部署构建产物到服务器 ===\n');

const serverPath = '/opt/1panel/www/sites/www.ityvip.xyz/index';
const localDist = 'D:/MTC/daga-clone/frontend/dist';
const localPublic = 'D:/MTC/daga-clone/frontend/public';

const c = new Client();
c.on('ready', () => {
  console.log('[OK] SSH connected\n');

  // 创建目录
  const mkdirCmds = [
    `mkdir -p ${serverPath}/assets`,
    `mkdir -p ${serverPath}/assets/v2/latest`
  ];

  let step = 0;
  function createDirs() {
    if (step >= mkdirCmds.length) {
      setTimeout(uploadFiles, 1000);
      return;
    }
    c.exec(mkdirCmds[step], (err, s) => {
      s.on('close', () => { step++; createDirs(); });
    });
  }

  function uploadFiles() {
    console.log('开始上传文件...\n');
    
    // 上传 dist 文件
    const files = [];
    
    // 获取本地文件列表
    function getFiles(dir, serverPrefix) {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const localPath = path.join(dir, item);
        const stat = fs.statSync(localPath);
        if (stat.isDirectory()) {
          getFiles(localPath, serverPrefix + item + '/');
        } else {
          files.push({ local: localPath, server: serverPrefix + item });
        }
      });
    }
    
    getFiles(localDist, '');
    getFiles(localPublic, '');
    
    console.log('需要上传 ' + files.length + ' 个文件\n');
    
    let uploaded = 0;
    files.forEach((file, i) => {
      setTimeout(() => {
        uploadFile(file.local, file.server);
      }, i * 200);
    });
  }

  function uploadFile(localPath, serverPath) {
    const content = fs.readFileSync(localPath);
    const b64 = content.toString('base64');
    
    c.exec(`echo '${b64}' | base64 -d > '${serverPath}' && echo "UPLOADED_${path.basename(localPath)}"`, (err, s) => {
      s.on('data', d => {
        if (d.toString().includes('UPLOADED')) {
          console.log('✅', path.basename(localPath));
        }
      });
      s.on('close', () => {
        uploaded++;
        if (uploaded === files.length) {
          console.log('\n✅ 所有文件上传完成');
          verifyFiles();
        }
      });
    });
  }

  function verifyFiles() {
    const cmds = [
      `ls ${serverPath}/assets/ | wc -l`,
      `ls ${serverPath}/ | head -10`,
      `cat ${serverPath}/index.html`
    ];
    
    let step = 0;
    function verify() {
      if (step >= cmds.length) { c.end(); return; }
      c.exec(cmds[step], (err, s) => {
        s.on('data', d => process.stdout.write(d.toString()));
        s.on('close', () => { step++; setTimeout(verify, 500); });
      });
    }
    verify();
  }

  createDirs();
});

c.on('error', e => console.error('[SSH 错误]', e.message));
c.connect({
  host: '149.88.74.104',
  port: 22,
  username: 'root',
  password: '6ccNd5KeYR9y',
  keepaliveCountMax: 3,
  keepaliveInterval: 10000
});