/**
 * daga-clone — 后端增量部署脚本
 *
 * 用途：把本地 server/ 下改动过的文件上传到 /opt/daga-clone/server/，
 *      自动备份被覆盖的远端文件，然后重启 pm2 进程。
 *
 * 用法：node deploy-backend.js
 *
 * 约定（与 deploy-dist.js 一致）：
 *   - 凭据从 deploy-fix.js 里读取，不在此文件里硬编码
 *   - 先传 .tmp 再 rename，避免半截文件被 pm2 加载
 */

const { Client } = require('E:/MTC/daga-clone/node_modules/ssh2');
const fs = require('fs');
const path = require('path');

const fixSrc = fs.readFileSync('E:/MTC/daga-clone/deploy-fix.js', 'utf-8');
const host = (fixSrc.match(/host:\s*'([^']+)'/) || [])[1];
const user = (fixSrc.match(/username:\s*'([^']+)'/) || [])[1];
const pass = (fixSrc.match(/password:\s*'([^']+)'/) || [])[1];
const port = (fixSrc.match(/port:\s*(\d+)/) || [])[1] || 22;

const REMOTE_ROOT = '/opt/daga-clone/server';

/**
 * 上传清单：[本地路径, 远端相对路径]
 * ai.js 另存为 ai-writer.js：服务器 /api/ai 上原本已挂了一个「AI 工具导航」
 * 的路由（/tools、/submit），不能覆盖，新增的文案生成挂在同一个前缀下。
 *
 * W2 用户体系新增：database.js（users/parse_quota_log 建表 + 配额设置种子）、
 * middleware/auth.js（type:'admin' 隔离）、middleware/user-auth.js、middleware/quota.js、
 * routes/user.js、routes/admin.js、routes/admin/users.js、
 * routes/parse.js 与 routes/parser.js（解析配额挂载，属有意的本地领先改动）。
 * W3 影片搜索新增：routes/search.js（爱奇艺上游 + 缓存 + SSRF 白名单 + 降级）、
 * routes/public.js（/settings 白名单扩展公告/统计代码/开关组 + img-proxy 爱奇艺 referer 规则）。
 */
const FILES = [
  ['E:/MTC/daga-clone/deploy/index.merged.js', 'index.js'],
  ['E:/MTC/daga-clone/server/database.js', 'database.js'],
  ['E:/MTC/daga-clone/server/middleware/auth.js', 'middleware/auth.js'],
  ['E:/MTC/daga-clone/server/middleware/user-auth.js', 'middleware/user-auth.js'],
  ['E:/MTC/daga-clone/server/middleware/quota.js', 'middleware/quota.js'],
  ['E:/MTC/daga-clone/server/routes/user.js', 'routes/user.js'],
  ['E:/MTC/daga-clone/server/routes/admin.js', 'routes/admin.js'],
  ['E:/MTC/daga-clone/server/routes/admin/users.js', 'routes/admin/users.js'],
  ['E:/MTC/daga-clone/server/routes/search.js', 'routes/search.js'],
  ['E:/MTC/daga-clone/server/routes/public.js', 'routes/public.js'],
  ['E:/MTC/daga-clone/server/routes/parse.js', 'routes/parse.js'],
  ['E:/MTC/daga-clone/server/routes/parser.js', 'routes/parser.js'],
  ['E:/MTC/daga-clone/server/routes/media.js', 'routes/media.js'],
  ['E:/MTC/daga-clone/server/routes/pdf.js', 'routes/pdf.js'],
  ['E:/MTC/daga-clone/server/routes/ai.js', 'routes/ai-writer.js'],
  ['E:/MTC/daga-clone/server/routes/jx.js', 'routes/jx.js'],
];

const STAMP = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

function mkdirp(sftp, p) {
  return new Promise((res) => {
    const parts = p.split('/').filter(Boolean);
    let cur = '';
    (async () => {
      for (const part of parts) {
        cur += '/' + part;
        await new Promise((r) => sftp.mkdir(cur, () => r()));
      }
      res();
    })();
  });
}

function put(sftp, local, remote) {
  return new Promise((res, rej) => {
    const read = fs.createReadStream(local);
    const up = sftp.createWriteStream(remote + '.tmp');
    up.on('error', rej);
    read.on('error', rej);
    up.on('close', res);
    read.pipe(up);
  });
}

function rename(sftp, from, to) {
  return new Promise((res, rej) => {
    sftp.unlink(to, () => sftp.rename(from, to, (e) => (e ? rej(e) : res())));
  });
}

function run(conn, cmd) {
  return new Promise((res) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return res('[exec error] ' + err.message);
      let out = '';
      stream.on('data', (d) => (out += d.toString()));
      stream.stderr.on('data', (d) => (out += d.toString()));
      stream.on('close', () => res(out));
    });
  });
}

const conn = new Client();
conn.on('error', (e) => { console.error('CONN ERROR', e && e.message); process.exit(2); });
conn.on('ready', () => {
  conn.sftp(async (err, sftp) => {
    if (err) { console.error('SFTP error', err); process.exit(1); }
    try {
      for (const [local, rel] of FILES) {
        const remote = REMOTE_ROOT + '/' + rel;
        if (!fs.existsSync(local)) { console.error('MISSING LOCAL', local); process.exit(1); }
        await mkdirp(sftp, path.dirname(remote).replace(/^\//, ''));
        // 覆盖前备份
        const out = await run(conn, `[ -f ${remote} ] && cp ${remote} ${remote}.bak.${STAMP} && echo BACKED_UP || echo NO_EXISTING`);
        if (out.includes('BACKED_UP')) console.log('  备份 ->', `${remote}.bak.${STAMP}`);
        await put(sftp, local, remote);
        await rename(sftp, remote + '.tmp', remote);
        console.log('  已上传', rel);
      }
      // 语法自检
      const check = await run(conn, `cd /opt/daga-clone && node --check server/index.js && node --check server/database.js && node --check server/middleware/auth.js && node --check server/middleware/user-auth.js && node --check server/middleware/quota.js && node --check server/routes/user.js && node --check server/routes/admin.js && node --check server/routes/admin/users.js && node --check server/routes/search.js && node --check server/routes/public.js && node --check server/routes/parse.js && node --check server/routes/parser.js && node --check server/routes/media.js && node --check server/routes/pdf.js && node --check server/routes/ai-writer.js && node --check server/routes/jx.js && echo SYNTAX_OK`);
      console.log('语法检查:', check.trim().split('\n').pop());
      if (!check.includes('SYNTAX_OK')) { conn.end(); process.exit(1); }

      const rs = await run(conn, `cd /opt/daga-clone && pm2 restart ityvip-backend --update-env && sleep 4 && pm2 list | grep ityvip`);
      console.log('重启结果:\n' + rs.trim());
      conn.end();
    } catch (e) {
      console.error('DEPLOY FAILED:', e.message);
      conn.end();
      process.exit(1);
    }
  });
}).connect({ host, port: Number(port), username: user, password: pass, readyTimeout: 20000 });
