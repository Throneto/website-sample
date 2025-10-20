# 🚀 快速开始指南

> 5分钟内完成博客系统的设置和首次部署！

---

## ✅ 检查清单

在开始之前，确保已安装：

- [ ] **Node.js** (v16+) - [下载地址](https://nodejs.org/)
- [ ] **Git** - [下载地址](https://git-scm.com/)
- [ ] **GitHub 账号** - [注册](https://github.com/)
- [ ] **Vercel 账号** - [注册](https://vercel.com/)（可用 GitHub 登录）

---

## 📋 第一次设置（仅需一次）

### 步骤 1: 初始化 Git 仓库

```bash
# 如果还没有 Git 仓库，运行：
git init
git add .
git commit -m "Initial commit"
```

### 步骤 2: 创建 GitHub 仓库并推送

1. 访问 https://github.com/new 创建新仓库
2. 命名仓库（例如：`my-blog`）
3. 不要初始化 README、.gitignore 或 license
4. 创建后，运行以下命令：

```bash
# 替换为你的仓库地址
git remote add origin https://github.com/your-username/your-repo.git
git branch -M main
git push -u origin main
```

### 步骤 3: 连接 Vercel

1. 访问 https://vercel.com/new
2. 点击 "Import Project"
3. 选择 "Import Git Repository"
4. 选择您刚创建的 GitHub 仓库
5. 点击 "Deploy"（无需修改配置，Vercel 会自动识别 `vercel.json`）

✅ **完成！** 您的网站已经部署成功！

---

## ✍️ 日常使用

### 方式一：一键部署（推荐）

```bash
# 1. 在 posts/ 目录创建 Markdown 文件
# 2. 编写文章
# 3. 运行一键部署命令

npm run deploy
```

这个命令会自动：
- 转换 Markdown 为 JSON
- 提交到 Git
- 推送到 GitHub
- 触发 Vercel 自动部署

### 方式二：分步操作

```bash
# 1. 转换 Markdown
npm run convert

# 2. 查看更改
git status

# 3. 提交
git add .
git commit -m "添加新文章"

# 4. 推送
git push
```

---

## 📝 创建你的第一篇文章

在 `posts/` 目录创建文件 `my-first-post.md`：

```markdown
---
title: 我的第一篇博客
category: technology
tags: 博客, 教程, 入门
icon: 🎉
excerpt: 这是我的第一篇博客文章，很高兴在这里分享我的想法。
featured: true
---

# 欢迎来到我的博客

这是我的第一篇文章内容...

## 章节标题

段落内容...

### 代码示例

\`\`\`javascript
console.log('Hello, World!');
\`\`\`

### 列表

- 列表项 1
- 列表项 2
- 列表项 3

**加粗文字** 和 *斜体文字*
```

然后运行：

```bash
npm run deploy
```

几分钟后访问你的 Vercel 网站，新文章就会显示在博客页面！

---

## 🎨 Markdown 元数据说明

| 字段 | 必需 | 说明 | 示例 |
|------|------|------|------|
| `title` | ✅ | 文章标题 | `我的第一篇博客` |
| `category` | ✅ | 分类 | `technology`、`design`、`life` |
| `tags` | 推荐 | 标签（逗号分隔） | `JavaScript, 教程, 前端` |
| `icon` | 可选 | 图标 Emoji | `🚀`、`📝`、`💡` |
| `excerpt` | 可选 | 摘要（不写会自动生成） | `这是文章简介...` |
| `featured` | 可选 | 精选文章 | `true` 或 `false` |

---

## 🛠️ 常用命令

```bash
# 转换 Markdown 为 JSON
npm run convert

# 一键部署
npm run deploy

# 创建备份
npm run backup

# 查看所有备份
npm run backup:list

# 清理旧备份
npm run backup:clean
```

---

## 🔍 验证设置

### 检查 Node.js

```bash
node --version
# 应该显示：v16.x.x 或更高
```

### 检查 Git

```bash
git --version
# 应该显示：git version x.x.x
```

### 检查远程仓库

```bash
git remote -v
# 应该显示您的 GitHub 仓库地址
```

---

## 📂 项目目录结构

```
your-project/
├── posts/                      # 📝 在这里写 Markdown 文章
│   ├── example-tech-article.md
│   ├── example-design-article.md
│   └── my-first-post.md       # 👈 创建你的文章
│
├── data/
│   └── articles.json          # 自动生成，不要手动编辑
│
├── pages/
│   └── blog.html              # 博客页面
│
└── tools/                     # 工具脚本（无需修改）
```

---

## 💡 提示

### 写作提示

1. **标题**：简洁明了，25字以内
2. **摘要**：100-150字，概括核心内容
3. **标签**：3-5个，便于搜索
4. **图标**：选择与主题相关的 Emoji

### 图片使用

```markdown
<!-- 本地图片 -->
![图片描述](/assets/images/blog/my-image.jpg)

<!-- 外部图片 -->
![图片描述](https://example.com/image.jpg)
```

### 代码高亮

```markdown
\`\`\`javascript
// 指定语言以获得语法高亮
const hello = () => {
    console.log('Hello!');
};
\`\`\`
```

---

## ❓ 遇到问题？

### 问题：npm 命令不存在

**解决方案：** 安装 Node.js，它会自动包含 npm。

### 问题：git 命令不存在

**解决方案：** 下载并安装 Git。

### 问题：转换失败

**解决方案：** 
1. 检查 Markdown 文件格式
2. 确保有 `---` 分隔符
3. 验证必需字段（title, category）
4. 查看控制台错误信息

### 问题：文章不显示

**解决方案：**
1. 检查 `data/articles.json` 是否更新
2. 清除浏览器缓存（Ctrl+F5）
3. 查看浏览器控制台是否有错误

---

## 📚 深入学习

- **完整指南**：查看 `README_WORKFLOW.md`
- **导入指南**：查看 `BLOG_IMPORT_GUIDE.md`
- **工具文档**：查看 `tools/README.md`

---

## 🎉 下一步

1. ✅ 完成环境设置
2. ✅ 连接 GitHub 和 Vercel
3. ✅ 创建第一篇文章
4. ✅ 运行部署命令
5. ✅ 访问你的网站看效果！

---

## 🌐 访问你的网站

部署完成后，Vercel 会提供一个网址：

```
https://your-project.vercel.app/pages/blog.html
```

你可以在 Vercel 仪表板查看：
- 部署状态
- 访问统计
- 部署历史

---

## 🚀 开始创作

```bash
# 创建新文章
code posts/my-article.md

# 编写内容...

# 部署
npm run deploy

# 完成！🎉
```

**现在开始你的博客之旅吧！** ✨

---

**需要帮助？** 查看详细文档或创建 GitHub Issue。

