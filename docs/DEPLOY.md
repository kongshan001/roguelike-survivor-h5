# 部署文档

本文档记录游戏从开发环境到生产环境的部署过程、问题排查与解决方案。

## 部署方案对比

| 平台 | 网址 | 国内访问 | 备注 |
|------|------|----------|------|
| GitHub Pages | kongshan001.github.io/roguelike-survivor-h5/ | ✅ 稳定 | 推荐 |
| Vercel | roguelike-survivor-h5.vercel.app | ⚠️ 不稳定 | 需梯子 |

## GitHub Pages 部署

### 步骤

1. **启用 Pages**: 进入仓库 Settings → Pages
2. **Source**: 选 "Deploy from a branch"
3. **Branch**: main，Folder: /(root)
4. **保存** 后等待 1-2 分钟自动部署

### 自动化部署

使用 GitHub Actions 自动部署：

```yaml
# .github/workflows/pages.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      - uses: actions/deploy-pages@v4
```

## 关键问题与解决

### 1. ES6 Modules 跨域问题

**问题**: 直接双击 index.html 或部署到静态服务器时，浏览器报错：
```
Access to script ... has been blocked by CORS policy
```

**原因**: `src/main.js` 使用 ES6 Modules (`import`)，浏览器安全策略禁止 `file://` 协议加载模块。

**解决**: 打包所有 JS 为单文件：

```bash
# 安装 esbuild
npm install -g esbuild

# 打包
esbuild src/game.js --bundle --outfile=game-bundled.js --format=iife

# 修改 index.html
# <script type="module" src="src/main.js"></script>
# 改为：
# <script src="game-bundled.js"></script>
```

### 2. GitHub Pages 部署失败

**错误信息**:
```
Error: Get Pages site failed. Please verify that the repository has Pages enabled
```

**原因**: GitHub Actions workflow 尝试部署，但 Pages 设置为"分支部署"模式。

**解决**: 
- 方法一：保持 Pages 设置为"分支部署"，删除 Actions workflow
- 方法二：将 Pages 改为"GitHub Actions"部署（推荐，自动化更好）

### 3. Vercel 国内访问不稳定

**现象**: roguelike-survivor-h5.vercel.app 在大陆访问时快时慢或打不开。

**原因**: Vercel 节点在大陆网络环境下不稳定。

**建议**: 使用 GitHub Pages 作为主部署地址。

## 相关文件

- `index.html` - 入口 HTML（修改为引用打包后的 JS）
- `game-bundled.js` - 打包后的游戏代码
- `.nojekyll` - 防止 GitHub Pages 忽略下划线开头的文件
- `.github/workflows/pages.yml` - 自动部署流程
- `_redirects` - Netlify 兼容重定向规则（可选）

## 更新部署

每次推送代码到 main 分支后，GitHub Actions 会自动部署。

手动触发：在 GitHub 仓库页面 → Actions → Deploy to GitHub Pages → Run workflow