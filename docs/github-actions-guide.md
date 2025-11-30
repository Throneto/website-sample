# GitHub Actions 自动构建使用指南

本项目已配置 GitHub Actions 自动化工作流，可在您上传新的 Markdown 文章后自动构建博客。

## 🎯 功能说明

当您向 `posts/` 目录添加或修改 `.md` 文件并 push 到 GitHub 时，GitHub Actions 会自动：

1. ✅ 检测 Markdown 文件变化
2. ✅ 运行 `md-to-json-incremental.js` 转换为 JSON
3. ✅ 运行 `generate-article-pages.js` 生成 HTML 页面
4. ✅ 运行 `generate-sitemap.js` 更新站点地图
5. ✅ 自动提交生成的文件回仓库
6. ✅ 触发 Dokploy 自动部署（如已配置 webhook）

## 📝 使用方法

### 方式一：直接上传 Markdown 文件（推荐）

这是最简单的发布流程：

```bash
# 1. 将新文章放入 posts/ 目录
cp my-new-article.md posts/

# 2. 提交并推送（GitHub Actions 会自动构建）
git add posts/my-new-article.md
git commit -m "Add new article: My New Article"
git push origin main

# 3. 等待 GitHub Actions 完成（约 1-2 分钟）
# 4. Dokploy 会自动检测到更新并部署（如已配置 webhook）
```

**就这么简单！** 您无需再手动运行构建脚本。

---

### 方式二：本地构建后上传（可选）

如果您希望在本地预览构建结果：

```bash
# 1. 本地构建
npm run build

# 2. 提交所有文件
git add .
git commit -m "Add new article with build"
git push origin main
```

这种方式 GitHub Actions 会检测到没有新的 Markdown 变化，跳过构建步骤。

---

## 🔍 查看构建状态

### 在 GitHub 网页查看

1. 访问您的 GitHub 仓库
2. 点击顶部的 **Actions** 选项卡
3. 查看最近的 workflow 运行记录

### 构建状态说明

- 🟢 **Success (成功)**：文章已成功构建并提交
- 🔵 **Skipped (跳过)**：没有检测到 Markdown 文件变化
- 🔴 **Failed (失败)**：构建过程出错，查看日志排查问题

---

## ⚙️ Workflow 配置详解

### 触发条件

Workflow 在以下情况下触发：

1. **自动触发**：
   - Push 到 `main` 分支
   - 且修改了 `posts/**/*.md` 或 `tools/**/*.js` 文件

2. **手动触发**：
   - 在 GitHub Actions 页面点击 "Run workflow" 按钮

### 权限说明

Workflow 使用 `GITHUB_TOKEN` 自动授权，具有以下权限：
- ✅ 读取仓库代码
- ✅ 写入并提交更改（`contents: write`）

无需额外配置 secrets 或 personal access token。

### 提交信息

自动提交的 commit message 格式：
```
chore: auto-build blog articles [skip ci]
```

`[skip ci]` 标记防止触发无限循环构建。

---

## 🐛 故障排除

### 问题 1: Workflow 没有触发

**可能原因**：
- 修改的文件不在 `posts/` 目录
- 推送到了非 `main` 分支

**解决方法**：
1. 确认 Markdown 文件在 `posts/` 目录下
2. 确认推送到 `main` 分支
3. 或手动触发 workflow

---

### 问题 2: Workflow 失败

**查看错误日志**：
1. 进入 GitHub Actions 页面
2. 点击失败的 workflow run
3. 查看具体步骤的错误信息

**常见错误**：

**A. Node.js 依赖问题**
```
Error: Cannot find module 'xxx'
```

**解决方法**：确保 `package.json` 已提交到仓库。

---

**B. 权限不足**
```
Error: refusing to allow a GitHub App to create or update workflow
```

**解决方法**：
1. 进入仓库 **Settings** → **Actions** → **General**
2. 在 "Workflow permissions" 部分
3. 选择 **Read and write permissions**
4. 勾选 **Allow GitHub Actions to create and approve pull requests**
5. 点击 **Save**

---

**C. Git 冲突**
```
Error: failed to push some refs
```

**解决方法**：
1. 本地拉取最新代码：`git pull origin main`
2. 解决冲突后重新推送

---

### 问题 3: 构建成功但 Dokploy 没有部署

**可能原因**：
- Dokploy 的 Git webhook 未配置
- Dokploy 设置为手动部署

**解决方法**：
1. 在 Dokploy 服务设置中，确认 **Trigger Type** 设置为 **On Push**
2. 或手动在 Dokploy 面板点击 **Redeploy**

---

## 📊 查看构建摘要

每次 workflow 运行后，会在 Actions 页面生成构建摘要：

```
### Build Summary 📊

- ✅ Markdown changes detected
- ✅ Build process executed
- ✅ Generated files committed
```

点击对应的 workflow run 即可查看详细信息。

---

## 🔧 自定义配置

### 修改触发分支

编辑 `.github/workflows/build-blog.yml`：

```yaml
on:
  push:
    branches:
      - main
      - develop  # 添加其他分支
```

### 添加通知

可以集成 Slack、Discord 等通知服务，在构建完成时发送通知。

---

## 📚 相关资源

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Workflow 语法参考](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Dokploy 部署指南](./docs/dokploy-deploy.md)

---

## ✨ 优势对比

### 之前的流程

```bash
# 需要 5 个步骤
1. 添加 Markdown 文件
2. 运行 node tools/md-to-json-incremental.js
3. 运行 node tools/generate-article-pages.js
4. 运行 node tools/generate-sitemap.js
5. git add . && git commit && git push
```

### 现在的流程

```bash
# 只需 2 个步骤！
1. 添加 Markdown 文件
2. git add . && git commit && git push
```

**节省时间**：60%+ 🚀

---

**版本**：v1.1  
**最后更新**：2025-11-29
