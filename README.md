# Kastave Landing — 正式静态站源

这是 kastave.com 的**唯一正式来源**：一个纯静态站（HTML + CSS + 原生 JS），
通过 **GitHub → Vercel 自动部署**上线。改完 `push` 即上线，不要再用 Vercel CLI 直传。

## 文件

- `index.html` / `styles.css` / `script.js`：页面本体
- `assets/`：页面引用的图片/视频（仅保留被引用的素材）
- `robots.txt` / `_headers`：爬虫与响应头配置

## 部署（详见仓库根目录 DEPLOYMENT_SOP.md）

1. 在 `pics/` 改内容。
2. 本地预览：根目录 `node preview-server.mjs`（或在本目录起任意静态服务器）。
3. `git add . && git commit && git push` 到已连接 Vercel 的仓库的 `main`。
4. Vercel 自动构建上线，几十秒后 kastave.com 更新。

## 红线

- 不要把 `.vercel`、`.env*`、密钥提交进仓库（已在 .gitignore）。
- 不要再用 `vercel deploy` CLI 直传（那会和 git 自动部署互相覆盖）。
- 付款/留资 webhook（`api/`）属第二阶段，见 DEPLOYMENT_SOP.md。
