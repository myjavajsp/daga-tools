# daga-clone 架构说明

与代码同仓维护，事实基线为 `main` 分支 2026-10-16 状态（线上代码与仓库逐字节一致，已用 md5 比对验证）。

## 1. 请求流向

```
浏览器 → Cloudflare（TLS）→ OpenResty
  ├─ /api/*            → 反代 127.0.0.1:3001（主机 node，PM2 cluster）
  └─ 其余              → try_files $uri $uri/ @app
        ├─ 磁盘有静态文件（含历史预渲染 HTML）→ 直接返回，不进 SPA
        └─ @app        → Express：Serve frontend/dist + 按路由注入 SEO meta / 统计代码
```

中间件顺序：`compression` → `helmet`（自定义 CSP）→ `cors`（白名单仅 ityvip.xyz 两域名，`credentials:true`）→ JSON/text body（1MB）→ `/api` 限流 200 次/分（`/api/admin/login` 10 次/分、`/api/admin` 30 次/分）→ 非 `/api` 的 GET 走 PV/UV 埋点。`app.set('trust proxy', 2)`。

`express.static` 显式 `index:false`，让 `/` 也进入 SEO 注入分支——此前首页被静态直出，SEO 与统计代码从不生效。

## 2. 后端模块

| 文件 | 职责 | 关键点 |
|---|---|---|
| `server/index.js` | 应用入口、静态托管、SEO 注入、埋点、GeoIP | 内联 ROUTE_SEO 常量表；`deploy/index.merged.js` 是其线上副本，须同步 |
| `server/database.js` | mysql2 连接池 + 建表 + 幂等迁移 + 种子 | 自封装 SQLite 风格 API（`prepare().all/get/run`、`exec`、`transaction`）；VAPID 密钥首次启动生成 |
| `server/init-db.js` | 一次性种子（管理员、16 条线路、引导、FAQ、设置） | |
| `server/middleware/auth.js` | 后台 JWT（HS256，24h，payload `type:'admin'`） | 缺 `JWT_SECRET` 直接 `process.exit(1)` |
| `server/middleware/user-auth.js` | 前台用户 JWT（7d，`type:'user'`），`auth` / `optional` | 与后台令牌双向隔离，类型不符即 401 |
| `server/middleware/quota.js` | `userOptional` + `quotaGuard` 配额守卫 | 见第 5 节 |
| `server/cache.js` | `MemoryCache`（Map + TTL + 60s 清理） | 解析结果 10min、manifest 5min、设置 5min 等复用 |
| `server/utils.js` | `isAllowedUrl`、`getClientIp`（cf-connecting-ip → x-forwarded-for）、`SITE_URL`、`ADMIN_PATH` | |
| `server/routes/` | 业务路由，工厂函数 `require('./routes/x')(db)` | 见第 3 节 |
| `server/scraper/` | 内容采集器注册表 | 见第 7 节 |
| `server/scripts/` | 种子与回填（豆瓣详情、地理、SEO/工具/采集文章） | |

## 3. 路由挂载

挂载顺序即代码顺序（`server/index.js` 276–309），`/api` 前缀下的注册式路由排在具名前缀之后。

| 前缀 | 文件 | 功能域 |
|---|---|---|
| `/api/public` | `public.js` | 站点配置读取（5min 缓存）、文章列表/详情/浏览/点赞、`img-proxy`（含爱奇艺封面 referer 规则） |
| `/api/admin` | `admin.js` + `routes/admin/{auth,content,users}.js` | 统计、访客地图、表情包 CRUD、投稿、解析记录、工具统计、文章、线路/广告/设置、用户管理 |
| `/api/admin/click-events` | `admin-clicks.js` | 元素级点击埋点查询 |
| `/api/parser` | `parser.js` | 服务端直解抖音/快手/B站/小红书 + iframe 解析记录 + 流式代理下载 |
| `/api/music` `/api/meme` `/api/m3u8` `/api/hot` | 同名文件 | 音乐、表情包（dicebear 生成 + 白名单图床代理）、HLS 清单解析与代理、多平台热榜 |
| `/api/ai` | `ai.js`、`ai-writer.js` | AI 工具导航与投稿；文案生成（`LLM_API_URL/KEY/MODEL` 仅服务端可见） |
| `/api/push` | `push.js` | web-push 订阅、群发、每日通知 |
| `/api/contact` | `contact.js` | 留言入库 |
| `/api/user` | `user.js` | 注册、登录、`me`、改密 |
| `/api/media` `/api/pdf` | `media.js`、`pdf.js` | 后端 ffmpeg 音视频作业、qpdf 加解密（裸字节体 + `X-Job`/`X-Options` 头） |
| `/api/search` | `search.js` | 影片搜索，爱奇艺官方搜索上游 |
| `/api` | `parse.js` | `POST /video/parse` 解析入口、`GET /video/download` 下载代理 |
| `/api` | `jx.js` | `/video/jx`、`/video/jxa` 解析站同源 HTML/资源代理 |
| `/api` | `og-image.js`、`rss.js`、`tracking.js` | OG 图（sharp 1200×630）、RSS、referrer 渠道归类 |
| 顶层 | — | `/api/health`、`/api/web-vitals`、`/api/track/*`、`/api/ping-search-engines`、`/sitemap.xml`、`/rss.xml` |

未匹配 GET `/api/*` 返回 404 JSON，不再挂起连接。`routes/seo.js` 存在但**未挂载**，其 SEO 逻辑由 `index.js` 内联一份，属重复实现（见第 9 节）。

## 4. 数据模型

`database.js` 启动时幂等建 23 张表：

- 站点内容 `site_settings`（KV：SEO、配额三项、开关组、公告、统计代码、VAPID）、`ads`、`recommend_links`、`guide_steps`、`faqs`、`articles`、`memes`、`ai_tools_submissions`、`parse_interfaces`
- 账号与配额 `admins`（bcrypt）、`users`（`level` 0–3、`vip_expires_at`、`daily_quota`、`quota_used`、`quota_date`、`status` 软删）、`parse_quota_log`（`uk_date_ip`）
- 解析记录 `parse_records`、`m3u8_play_records`
- 分析 `page_views`、`visitor_ips`（IP 日去重 + 国家省市经纬度）、`page_behavior`、`click_events`、`traffic_sources`、`tool_usage`、`web_vitals`
- 其它 `push_subscriptions`、`contact_submissions`

线上库实有 26 张，多出 `monitor_alerts` / `monitor_logs` / `monitor_summaries` 三张监控表，**不在本仓库建表代码内**，来源是线上历史遗留。前端有 `/monitor` 页面对应位置。这构成本地与线上的结构差异。

表情包种子在 `memes < 150` 时触发 `TRUNCATE` 重播 190 条。

## 5. 解析与配额

**三条解析链路，职责不同。**

`parse.js` 的 `POST /api/video/parse` 按 `detectPlatform` 分流：长视频 VIP 不请求上游，直接读 `parse_interfaces` 中 `type='video'` 的行拼 `encodeURIComponent(url)` 生成 `playerUrl` 与线路列表，交给 iframe；短视频（抖音/快手/TikTok/微博/小红书）走 `parseShortVideo` 轮询 `type='short'` 上游去水印。`GET /video/download` 是流式下载代理，回源补移动端 UA 与 `Referer: https://www.douyin.com/`，响应带 RFC 5987 中文文件名。

`parser.js` 做服务端直解：跟随短链重定向拿 `aweme_id`，按平台抓页面/接口，第三方兜底，成功结果进 `MemoryCache` 10 分钟。

`jx.js` 是同源代理层：拉取线路白名单（`parse_interfaces`，5min 缓存）+ referer 同站校验，正则重写 `src`/`href`/`srcset`/`poster`、内联绝对 URL 与 m3u8 分片，注入 MutationObserver 补 `allowfullscreen`，并覆盖 helmet 头（去 `X-Frame-Options`、放开 `RELAXED_CSP`）以解决全屏被拒。

**SSRF 防护**统一为 `dns.lookup(hostname)` 后判私网（127/10/172.16–31/192.168/169.254/100.64–127/::1/fc/fd/fe80）拦截；`search.js` 只允许 `SEARCH_API_BASE` 白名单内的 host。

**配额口径**（`middleware/quota.js`，`/me` 与守卫共用同一函数）：

```
isVip      = level > 0 且 (vip_expires_at 为空或未过期)
effective  = daily_quota > 0 ? daily_quota : (isVip ? vip_daily_quota : free_daily_quota)
```

登录用户按 `users` 行计，游客按日期 + IP 记 `parse_quota_log`。默认免费 5、VIP 100、游客 5。**只在 `res.json` 且 `body.success` 为真时 +1**，失败不计次；跨日重置；中间件异常 fail-open 并记日志，不阻断解析。实测：成功一次 5→4，非法 URL 返回 400 后仍为 4；游客用尽返回 429 且响应体带 `remaining:0, guest:true` 与注册引导文案，前端据此显示注册入口。

## 6. 前端

`App.jsx` 单一路由表，`main.jsx` 挂 BrowserRouter + MUI 主题。页面分四类：解析与版块（`/`、`/parser`、`/search`、`/m3u8`、`/mp4`、`/music`、`/meme`、`/maker`、`/hot`、`/ai`、`/mbti/:type`、`/tests`、`/memes`、`/articles`、`/recommend`、`/categories`）、工具箱（`/tools`、`/tools/:toolKey`）、用户（`/login`、`/register`、`/member`）、后台（`ADMIN_PATH` 下的 `interfaces`/`ads`/`links`/`settings`/`guide`/`faq`/`users` 与数据页）。`/member` 未登录时回落到登录页。

`components/tools/` 共 91 个组件，`pages/ToolsPage.jsx` 注册表 89 项，8 个分类：其他 27、文本 16、图片 13、AI 12、PDF 8、换算 6、视频 4、音频 3。`ToolDetailPage.jsx` 用 `import.meta.glob('../components/tools/*.jsx')` 建立 loader map，保证每个工具独立分片——**不要改回字符串拼接的动态 import**，Vite 无法静态分析会导致生产 404。

请求封装：`api/client.js` 是 Axios 实例（baseURL `/api`，请求拦截附 `localStorage.daga_token`，401 跳后台登录）；`api/user.js` 是**独立实例**，令牌存 `daga_user_token`，与后台令牌互不干扰。`lib/file-utils.js` 统一格式化与 Blob 下载，`lib/upload.js` 提供带进度的 XHR 上传，`components/tools/MediaJob.jsx` 抽出后端媒体作业的任务轮询与三态进度 UI，`components/common/FullscreenFrame.jsx` 供同源代理全屏播放。

`public/sw.js` 是手写 Service Worker（非 PWA 插件，无 manifest），API 与静态资源均 `no-store` 直连，缓存名 `daga-v30` 需手动递增。主入口 chunk 已超 1MB（gzip 约 325KB），MUI 全量进入口是主因，后续可考虑按需引入或 manualChunks 拆分。

## 7. 采集器

`scraper/index.js` 注册表式 9 个源（hackernews、arxiv、imdb、dgxspark、github-trending、douban、github、freebies、ai-news），每源导出 `fetch()` 返回文章数组 → `image-downloader.processArticleImages` 本地化图片 → `insertArticleIfNotExists`（slug 去重）→ 推送百度 `data.zz.baidu.com`。支持 `node index.js <source>` 单源运行。

不在后端进程内调度，由服务器 cron 每日 00:00 跑 `scraper/run_scraper.sh`，末尾 `curl /api/ping-search-engines`。

## 8. 部署链路与已知坑

1. **`git push` 不触发线上部署**。`/opt/daga-clone` 非 git 仓库、无构建 cron，只有采集与备份两条 cron。上线必须显式跑部署脚本。
2. **改了 `server/index.js` 要同步 `deploy/index.merged.js`**，后端上传清单用的是后者。
3. **前端产物要同步两处**（静态根 + 主机 dist），只更一处 → 深链 404。
4. **陈旧预渲染 HTML 会拦截路由**。`try_files $uri $uri/` 优先命中磁盘上的 `tools/*/index.html` 等旧预渲染品；删文件必须连空目录一起删，否则 nginx 命中目录后返回 403 且永不回退。根 `index.html`、`robots.txt`、`sw.js`、`assets/` 是活文件不能删。
5. **SFTP 四坑**：`fastPut` 覆盖已存在文件报 Failure（用 `.tmp` + rename）；`rename` 不覆盖（先 unlink）；`mkdir` 不递归；文件超百个前台必超时（用 tar 单包或后台跑）。
6. **含密码的文件写不进仓库**：本机会被敏感内容过滤静默改写值，表现为认证失败。凭据一律放 `.env` 或 gitignore 排除的本地脚本。
7. **验证线上生效**：比对 `index-*.js` hash；或两端 `md5sum` 直接比对（推荐，能一次确认全部文件一致性）。
8. **旧后台令牌会失效**：加入 `type:'admin'` 校验后，历史无 `type` 的令牌全部拒用，上线后需重新登录。

## 9. 待办与风险

- **凭据治理**：`database.js` 与 `routes/parse.js` 代码内存在硬编码口令/密钥兜底；`DEPLOY_GUIDE.md` 含 root 公钥与 scp 流程；`.env` 与 6 个运维脚本已 gitignore，但历史提交里是否残留需单独审计。建议统一迁到环境变量并轮换。
- **短视频上游单点**：抖音去水印依赖第三方公开 demo 密钥，随时可能被限流或吊销。备选是自托管 `Evil0ctal/Douyin_TikTok_Download_API`（约 0.5–1GB 内存，服务器 8C/8G 放得下）或轻量签名服务；当前决策是沿用第三方直至失效。抖音签名地址约 10 分钟过期，须解析后立即下载。
- **`routes/seo.js` 未挂载**，SEO 逻辑在 `index.js` 内联一份，两处易失同步。
- **线上多 3 张 `monitor_*` 表**且本仓库无对应建表代码，需确认是保留（补进代码）还是清理。
- **9 个占位管理页**（visitors/submissions/click-events/parse-records/m3u8-records/tool-usage/push/categories/monitor/articles）路由已注册但菜单无入口，待补 API 或摘除。
- **入口 chunk 体积**超 1MB，建议 manualChunks 拆分。
- **仓库根散落的 `analyze_*.js` / `check_*.js`** 调试脚本可清理。
