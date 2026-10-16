# daga-clone — 全民影视 VIP 视频解析站

在线视频解析 + 90 余个浏览器工具的内容型站点。单仓库两部分：`server/` 是 Express 后端（同时托管前端产物并做服务端 SEO 注入），`frontend/` 是 Vite + React 单页应用。

- 线上站点 https://www.ityvip.xyz
- 远程仓库 `git@github.com:myjavajsp/daga-tools.git`（分支 `main`）

## 技术栈

后端 Express 4 + mysql2 连接池，认证用 jsonwebtoken + bcryptjs，安全相关用 helmet / express-rate-limit / compression，另有 sharp（OG 图生成）、maxmind + GeoLite2（访客地理）、web-push（订阅推送）、axios（上游请求与采集）、ssh2（部署脚本）。Node 要求 >= 18。

前端 Vite 5 + React 18 + MUI 5 + Tailwind 3，路由 react-router 6。重体积能力按需分片：pdf-lib / pdfjs-dist 做 PDF、fflate 做压缩包、tesseract.js 做 OCR、@imgly/background-removal 做抠图、docx 生成 Word、spark-md5 校验。

数据层 MySQL 8（utf8mb4 / InnoDB），建表与幂等迁移都在 `server/database.js` 启动时执行。

## 目录

```
server/            Express 应用：index.js 入口、database.js 数据层、routes/ 各业务路由、
                   middleware/ 认证与配额、scraper/ 内容采集器、scripts/ 种子与回填脚本
frontend/          Vite 项目：src/pages 页面、src/components/tools 工具组件、src/api 请求封装
deploy/            线上后端入口副本 index.merged.js（与 server/index.js 同步维护）
docs/              架构与运维文档，见 ARCHITECTURE.md
```

仓库根还有一批 `analyze_*.js` / `check_*.js` 调试脚本，属历史排查残留，不是运行时依赖。

## 本地开发

1. 准备 MySQL。仓库外已有便携版在 `E:/MTC/mysql-portable`，双击 `start-mysql.bat` 即在 `127.0.0.1:3306` 起服务，库与用户均为 `daga_clone`。用其它 MySQL 实例亦可。
2. 复制 `.env.example` 为 `.env`，填 `DB_PASSWORD`，并生成 `JWT_SECRET`：

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   `JWT_SECRET` 缺失时认证中间件直接退出，不会静默放行。
3. 装依赖并启动后端（默认 `PORT=3001`）：

   ```bash
   npm install
   node server/index.js
   ```

   首次启动自动建 23 张表并灌种子数据（含 190 条表情包、解析线路、站点设置、VAPID 密钥）。
4. 前端二选一。开发模式独立起 Vite（5173，需自行配 API 代理）：

   ```bash
   cd frontend && npm install && npm run dev
   ```

   或者构建后交给后端托管，更接近线上形态：

   ```bash
   cd frontend && npm run build   # 产出 frontend/dist，后端直接 Serve
   ```

## 改动后的检查

改过 `frontend/src/components/tools/` 下代码，先做语法预扫描再构建。工具组件经 `import.meta.glob` 动态加载，**未接入路由映射的文件在构建前不会被编译**，历史语法错容易漏到线上：

```bash
node E:/MTC/.workbuddy/skills/daga-build-check/scripts/scan-tools.js   # 期望 91/91 clean
cd frontend && npm run build
```

发布前用无头浏览器逐路由验收（零 `pageerror` 且页面有实质内容）：

```bash
node E:/MTC/.workbuddy/skills/daga-verify/scripts/check-routes.js https://www.ityvip.xyz <routesFile>
```

百度统计 `hm.js`、Cloudflare RUM、`/api/track` 三类请求失败是已知噪声，不代表页面故障。

## 部署

服务器 149.88.74.104（1Panel + OpenResty + Docker MySQL），后端 PM2 进程名 `ityvip-backend`（cluster 模式）跑 `node /opt/daga-clone/server/index.js`，监听 3001。

**`git push` 不会触发线上部署。** `/opt/daga-clone` 不是 git 仓库，也没有构建 cron，推送只是入库；上线必须显式执行脚本。

后端：`node deploy-backend.js`。按白名单上传，先传 `.tmp` 再 rename 避免 PM2 加载半截文件，覆盖前自动备份远端文件，最后 `pm2 restart --update-env`。**改了 `server/index.js` 必须同步 `deploy/index.merged.js`**，上传清单用的是后者。

前端：`frontend` 下 `npm run build`，产物需**同时**同步到静态根 `/opt/1panel/www/sites/www.ityvip.xyz/index/` 和主机 `/opt/daga-clone/frontend/dist` 两处——静态文件由前者 Serve，后者供后端 SPA 回退与 SEO 注入，只更一处会导致深链 404。文件多时用 tar 单文件上传再远端解压，全量 SFTP 易超时且必漏懒加载 chunk。

判断线上实际 Serve 的构建：`grep -o 'index-[A-Za-z0-9_-]*\.js' <静态根>/index.html`，与本地 `frontend/dist/index.html` 对比即可。排查"改了线上不生效"还可直接比对两端文件 md5。

更完整的链路说明、数据模型与已知坑见 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)。

## 凭据与配置安全

`.env` 与 6 个含明文服务器口令的运维脚本（`deploy-fix.js`、`ssh-cmd.js`、`deploy-dist.js`、`deploy-parse.js`、`deploy-cleanup.js`、`deploy/update-line.js`）已在 `.gitignore` 排除，只在本机保留。`deploy-backend.js` 等已入库脚本运行时需要仓库根的 `deploy-fix.js` 提供 SSH 凭据，换环境须自行重建该文件。

后台默认种子账号见 `server/init-db.js`，首次上线应立即改密。后台入口是混淆路径，由环境变量 `ADMIN_PATH` 决定，前端与后端都依赖它。

短视频去水印当前依赖第三方上游的公开 demo 密钥，属单点风险：该上游被限流或吊销后需换线路或改自托管方案。
