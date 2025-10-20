# 博客工具 - Markdown 导入

本目录包含将 Markdown 文件转换为博客文章的工具。

## 快速开始

### 方法 1：使用 Node.js 转换工具（推荐）

1. **准备 Markdown 文件**
   
   将您的 Markdown 文件放入 `posts/` 目录：
   ```
   posts/
   ├── my-first-post.md
   ├── another-article.md
   └── tech-tutorial.md
   ```

2. **运行转换脚本**
   ```bash
   node tools/md-to-json.js
   ```

3. **完成！**
   
   您的文章已自动添加到 `data/articles.json`，刷新博客页面即可看到新文章。

### 方法 2：直接在前端读取 Markdown（高级）

如果您想保留原始 Markdown 文件格式，可以使用前端动态加载方案（需要额外配置）。

## Markdown 文件格式

每个 Markdown 文件应该包含 Front Matter 元数据：

```markdown
---
title: 文章标题
category: technology
tags: 标签1, 标签2, 标签3
icon: 🚀
excerpt: 这是文章摘要，会显示在列表页
featured: false
publishDate: 2025-01-20
readTime: 8分钟
---

# 文章正文

这里是您的文章内容...

## 章节标题

段落内容...
```

### 元数据字段说明

| 字段 | 必需 | 说明 | 示例 |
|------|------|------|------|
| `title` | ✓ | 文章标题 | `我的第一篇博客` |
| `category` | ✓ | 分类 | `technology`、`design`、`life` |
| `tags` | 推荐 | 标签（逗号分隔） | `JavaScript, 前端, 教程` |
| `icon` | 可选 | 文章图标 emoji | `🚀`、`📝`、`💡` |
| `excerpt` | 可选 | 文章摘要（未提供则自动生成） | `这是一篇关于...的文章` |
| `featured` | 可选 | 是否为精选文章 | `true` 或 `false` |
| `publishDate` | 可选 | 发布日期（未提供则使用当前日期） | `2025-01-20` |
| `readTime` | 可选 | 阅读时间（未提供则自动计算） | `8分钟` |

### 分类选项

- `technology` 或 `tech` 或 `技术` → 技术
- `design` 或 `设计` → 设计  
- `life` 或 `生活` → 生活

## 示例文章

运行转换脚本后，会在 `posts/` 目录自动生成 `_example.md` 示例文件，您可以参考其格式。

## 常见问题

### Q: 如何批量导入旧博客？

**A:** 将所有 Markdown 文件放入 `posts/` 目录，然后运行 `node tools/md-to-json.js`。脚本会自动处理所有 `.md` 文件并合并到现有文章列表。

### Q: 转换后原始 Markdown 文件会被删除吗？

**A:** 不会。原始文件保持不变，转换后的数据只是添加到 `data/articles.json`。

### Q: 可以修改已转换的文章吗？

**A:** 可以。直接编辑 `data/articles.json` 文件，或者修改原始 Markdown 文件后重新运行转换脚本（注意：需要先删除 JSON 中的旧条目以避免重复）。

### Q: 支持图片吗？

**A:** 支持。在 Markdown 中使用标准图片语法：
```markdown
![图片描述](/path/to/image.jpg)
```
建议将图片放在 `assets/images/blog/` 目录。

### Q: 如何使文章显示在首页？

**A:** 在 Front Matter 中设置 `featured: true`。精选文章会以更大的卡片显示在顶部。

### Q: 代码高亮支持吗？

**A:** 目前基础支持。如需完整代码高亮，建议添加 `highlight.js` 或 `prism.js` 库。

## 高级用法

### 自定义转换规则

编辑 `tools/md-to-json.js` 文件，修改以下方法：

- `parseFrontMatter()` - 修改元数据解析逻辑
- `calculateReadTime()` - 修改阅读时间计算方式
- `generateExcerpt()` - 修改摘要生成规则
- `generateSlug()` - 修改 URL slug 生成方式

### 从其他平台导入

如果您从其他博客平台（如 Medium、WordPress、Hexo）迁移：

1. 导出为 Markdown 格式
2. 确保文件包含 Front Matter
3. 根据需要调整元数据字段名称
4. 运行转换脚本

## 技术支持

如有问题，请检查：

1. Node.js 是否已安装（`node --version`）
2. Markdown 文件格式是否正确
3. Front Matter 分隔符是否为 `---`
4. 文件编码是否为 UTF-8

---

**提示**：建议在转换前备份 `data/articles.json` 文件。

