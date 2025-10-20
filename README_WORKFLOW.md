# 📝 博客工作流程完整指南

本文档提供从编写到部署的完整工作流程说明。

---

## 🎯 方案概述

**工作流程：** 本地编写 Markdown → 转换为 JSON → 提交到 GitHub → Vercel 自动部署

**优势：**
- ✅ 静态网站，速度快
- ✅ 免费部署（GitHub + Vercel）
- ✅ 版本控制
- ✅ 自动化部署
- ✅ 无需数据库

---

## 📋 前置要求

### 必需安装

1. **Node.js** (v16+)
   - 下载：https://nodejs.org/
   - 验证：`node --version`

2. **Git**
   - 下载：https://git-scm.com/
   - 验证：`git --version`

3. **GitHub 账号**
   - 注册：https://github.com/

4. **Vercel 账号**
   - 注册：https://vercel.com/（可用 GitHub 账号登录）

---

## 🚀 快速开始

### 第一次设置

```bash
# 1. 初始化 Git（如果还没有）
git init
git add .
git commit -m "Initial commit"

# 2. 关联 GitHub 仓库
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main

# 3. 连接 Vercel
# 访问 https://vercel.com/new
# 导入您的 GitHub 仓库
# Vercel 会自动检测配置并部署
```

### 日常写作流程

```bash
# 1. 在 posts/ 目录创建 .md 文件
# 2. 编写文章（参考 posts/example-*.md）
# 3. 运行一键部署脚本

npm run deploy
# 或
node tools/deploy.js "添加新文章：文章标题"
```

就这么简单！Vercel 会自动部署您的更改。

---

## 📝 详细工作流程

### 步骤 1：编写 Markdown 文章

在 `posts/` 目录创建新文件，例如 `my-new-post.md`：

```markdown
---
title: 我的新文章
category: technology
tags: JavaScript, 教程, 前端
icon: 🚀
excerpt: 这是一篇关于 JavaScript 的教程文章。
featured: false
publishDate: 2025-01-20
---

# 文章内容

这里是正文...
```

### 步骤 2：转换 Markdown

```bash
# 方式1：使用 npm 脚本（推荐）
npm run convert

# 方式2：直接运行 Node.js
node tools/md-to-json.js
```

**输出：**
- ✅ 文章已添加到 `data/articles.json`
- ✅ 自动创建备份（在 `backups/` 目录）
- ✅ 验证数据格式
- ✅ 显示统计信息

### 步骤 3：本地预览

打开 `pages/blog.html` 在浏览器中查看效果。

或使用简单的 HTTP 服务器：

```bash
# 使用 Python（如果已安装）
python -m http.server 8000

# 或使用 Node.js（需要安装 http-server）
npx http-server -p 8000

# 然后访问：http://localhost:8000/pages/blog.html
```

### 步骤 4：提交到 Git

```bash
# 查看更改
git status

# 添加文件
git add data/articles.json posts/

# 提交
git commit -m "添加新文章：文章标题"

# 推送到 GitHub
git push
```

### 步骤 5：自动部署

Vercel 检测到 GitHub 推送后会自动：
1. 拉取最新代码
2. 构建网站
3. 部署到生产环境
4. 发送通知（如果配置了）

通常需要 1-2 分钟完成。

---

## 🛠️ 可用脚本

### package.json 脚本

```bash
# 转换 Markdown 为 JSON
npm run convert

# 一键部署（转换 + Git 提交 + 推送）
npm run deploy

# 备份管理
npm run backup
```

### 手动脚本

```bash
# 转换工具
node tools/md-to-json.js

# 部署工具（带自定义提交信息）
node tools/deploy.js "你的提交信息"

# 备份管理
node tools/backup.js create   # 创建备份
node tools/backup.js list     # 列出备份
node tools/backup.js restore <filename>  # 恢复备份
node tools/backup.js clean    # 清理旧备份
```

---

## 📂 项目结构

```
.
├── posts/                      # 📝 Markdown 源文件
│   ├── example-tech-article.md
│   ├── example-design-article.md
│   └── your-new-post.md
│
├── data/
│   └── articles.json          # 📊 转换后的文章数据
│
├── backups/                   # 💾 自动备份
│   └── articles-2025-01-20T12-00-00.json
│
├── tools/                     # 🛠️ 工具脚本
│   ├── md-to-json.js         # 转换工具
│   ├── deploy.js             # 部署工具
│   └── backup.js             # 备份工具
│
├── pages/
│   └── blog.html             # 📄 博客页面
│
├── vercel.json               # ⚙️ Vercel 配置
├── package.json              # 📦 项目配置
└── .gitignore               # 🚫 Git 忽略文件
```

---

## 🔧 高级配置

### Vercel 环境变量（可选）

如果需要，可以在 Vercel 仪表板添加环境变量：

1. 访问 https://vercel.com/dashboard
2. 选择您的项目
3. Settings → Environment Variables
4. 添加变量（例如 API 密钥）

### 自定义域名

1. 在 Vercel 项目设置中点击 "Domains"
2. 添加您的自定义域名
3. 按照提示配置 DNS

### 性能优化

`vercel.json` 已配置：
- ✅ 静态资源缓存（1年）
- ✅ JSON 数据缓存（5分钟）
- ✅ Gzip/Brotli 压缩
- ✅ HTTP/2 支持

---

## 🐛 常见问题

### Q: Node.js 未安装怎么办？

**A:** 下载并安装 Node.js：
- Windows: https://nodejs.org/en/download/
- Mac: `brew install node`
- Linux: `sudo apt install nodejs npm`

### Q: 转换失败怎么办？

**A:** 检查：
1. Markdown 文件格式是否正确
2. Front Matter 是否有 `---` 分隔符
3. 必需字段（title, category）是否存在
4. 文件编码是否为 UTF-8

查看错误信息获取具体原因。

### Q: Git 推送失败？

**A:** 可能的原因：
1. 未设置远程仓库：`git remote add origin <url>`
2. 权限问题：检查 SSH 密钥或使用 HTTPS
3. 分支保护：检查 GitHub 仓库设置

### Q: Vercel 部署失败？

**A:** 检查：
1. GitHub 和 Vercel 是否正确连接
2. `vercel.json` 配置是否正确
3. 查看 Vercel 部署日志获取详细错误

### Q: 文章不显示？

**A:** 检查：
1. `data/articles.json` 是否更新
2. 浏览器缓存：按 Ctrl+F5 强制刷新
3. JSON 格式是否有效：使用 JSONLint 验证

### Q: 如何删除文章？

**A:** 两种方式：
1. **手动**：直接编辑 `data/articles.json`，删除对应条目
2. **重新生成**：删除 MD 文件，清空 JSON，重新运行转换工具

### Q: 如何修改已发布的文章？

**A:** 
1. 编辑 `posts/` 中的 Markdown 文件
2. 在 `data/articles.json` 中删除旧版本
3. 重新运行 `npm run convert`
4. 提交并推送

### Q: 备份在哪里？

**A:** 
- 自动备份：`backups/` 目录
- Git 历史：`git log` 查看
- 手动备份：`node tools/backup.js create`

---

## 📊 工作流程图

```
┌─────────────────┐
│  编写 Markdown   │
│   (posts/*.md)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  运行转换工具    │
│ npm run convert │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  生成 JSON 数据  │
│ (data/articles) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Git 提交推送   │
│   git push      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Vercel 自动部署 │
│   (1-2 分钟)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   部署完成 ✅    │
│  网站已更新      │
└─────────────────┘
```

---

## 📚 相关资源

- [Markdown 语法指南](https://www.markdownguide.org/)
- [Git 教程](https://git-scm.com/book/zh/v2)
- [Vercel 文档](https://vercel.com/docs)
- [GitHub 文档](https://docs.github.com/)

---

## 💡 最佳实践

### 1. 版本控制

```bash
# 使用有意义的提交信息
git commit -m "添加文章：Web性能优化实战"
git commit -m "修复文章：修正代码示例"
git commit -m "更新文章：添加新的章节"
```

### 2. 定期备份

```bash
# 每周运行一次
node tools/backup.js create
node tools/backup.js clean  # 清理旧备份
```

### 3. 文件组织

```
posts/
├── 2025/
│   ├── 01/
│   │   ├── article-1.md
│   │   └── article-2.md
│   └── 02/
│       └── article-3.md
└── drafts/  # 草稿（不会被转换）
```

### 4. 图片管理

```markdown
<!-- 本地图片 -->
![描述](/assets/images/blog/2025/my-image.jpg)

<!-- 使用 CDN -->
![描述](https://cdn.example.com/my-image.jpg)
```

建议：
- 压缩图片（使用 TinyPNG 等工具）
- 使用 WebP 格式
- 图片命名规范

---

## 🎉 开始使用

现在您已经了解完整的工作流程，开始创作吧！

```bash
# 1. 创建新文章
code posts/my-first-post.md

# 2. 编写内容

# 3. 一键部署
npm run deploy

# 完成！🎉
```

---

**祝写作愉快！** ✨

有问题？查看 `BLOG_IMPORT_GUIDE.md` 获取更多详细信息。

