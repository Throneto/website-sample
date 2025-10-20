# 博客 Markdown 导入指南

本指南将帮助您将现有的 Markdown 博客文章导入到网站中并在前端展示。

## 📋 目录

- [快速开始](#快速开始)
- [Markdown 文件格式](#markdown-文件格式)
- [导入步骤](#导入步骤)
- [常见问题](#常见问题)
- [进阶功能](#进阶功能)

---

## 🚀 快速开始

### 准备工作

确保已安装 Node.js（建议 v16 或更高版本）：

```bash
node --version
```

### 三步完成导入

```bash
# 1. 将 Markdown 文件放入 posts/ 目录
# （已创建示例文件供参考）

# 2. 运行转换工具
node tools/md-to-json.js

# 3. 刷新博客页面查看效果
# 访问：http://localhost/pages/blog.html
```

就这么简单！ 🎉

---

## 📝 Markdown 文件格式

### 基本结构

每个 Markdown 文件应包含两部分：

1. **Front Matter**（YAML 格式的元数据）
2. **正文内容**（Markdown 格式）

### 完整示例

```markdown
---
title: 我的第一篇博客
category: technology
tags: JavaScript, 前端, 教程
icon: 🚀
excerpt: 这是一篇关于 JavaScript 基础的教程文章。
featured: false
publishDate: 2025-01-20
readTime: 8分钟
---

# 文章标题

这里是正文内容...

## 章节标题

段落内容...
```

### 元数据字段详解

| 字段 | 必需 | 类型 | 说明 | 示例 |
|------|------|------|------|------|
| `title` | ✅ | 文本 | 文章标题 | `Web性能优化指南` |
| `category` | ✅ | 枚举 | 分类（见下方） | `technology` |
| `tags` | 推荐 | 文本 | 标签，逗号分隔 | `React, Hooks, 教程` |
| `icon` | 可选 | Emoji | 文章图标 | `🎨` `💻` `📱` |
| `excerpt` | 可选 | 文本 | 文章摘要（未提供则自动生成） | `本文介绍...` |
| `featured` | 可选 | 布尔 | 是否为精选（显示为大卡片） | `true` / `false` |
| `publishDate` | 可选 | 日期 | 发布日期（未提供则为当前日期） | `2025-01-20` |
| `readTime` | 可选 | 文本 | 阅读时间（未提供则自动计算） | `5分钟` |

### 分类选项

支持以下三种分类（中英文均可）：

| 英文 | 中文 | 说明 |
|------|------|------|
| `technology` / `tech` | `技术` | 技术相关文章 |
| `design` | `设计` | 设计相关文章 |
| `life` | `生活` | 生活分享文章 |

---

## 📥 导入步骤

### 方法一：批量导入（推荐）

适合一次性导入多篇文章。

```bash
# 1. 准备文件
# 将所有 .md 文件复制到 posts/ 目录

posts/
├── article-1.md
├── article-2.md
├── article-3.md
└── ...

# 2. 运行转换
node tools/md-to-json.js

# 3. 查看结果
# 转换后的数据会自动添加到 data/articles.json
```

### 方法二：单篇导入

```bash
# 1. 将单个 .md 文件放入 posts/ 目录
cp my-article.md posts/

# 2. 运行转换
node tools/md-to-json.js

# 3. 完成！
```

### 导入后的文件结构

```
.
├── posts/                          # Markdown 源文件（保留）
│   ├── example-tech-article.md
│   ├── example-design-article.md
│   └── example-life-article.md
│
├── data/
│   └── articles.json               # 转换后的 JSON 数据
│
└── tools/
    └── md-to-json.js               # 转换工具
```

---

## ❓ 常见问题

### Q1: 转换后原始 Markdown 文件会被删除吗？

**A:** 不会。原始文件保持不变，转换后的数据只是添加到 `data/articles.json`。

---

### Q2: 如何避免重复导入？

**A:** 工具会自动生成唯一 ID。如果需要更新文章：

1. **方法一**：直接编辑 `data/articles.json` 中的对应条目
2. **方法二**：从 JSON 中删除旧条目，修改 MD 文件后重新导入

---

### Q3: 支持哪些 Markdown 语法？

**A:** 支持标准 Markdown 语法，包括：

- ✅ 标题 (`#` 至 `######`)
- ✅ 粗体、斜体、删除线
- ✅ 列表（有序、无序）
- ✅ 链接和图片
- ✅ 代码块（带语法高亮）
- ✅ 引用
- ✅ 表格

---

### Q4: 如何添加图片？

**A:** 两种方式：

**方式一：使用本地图片**

```markdown
![图片描述](/assets/images/blog/my-image.jpg)
```

建议将图片放在 `assets/images/blog/` 目录。

**方式二：使用外部图片**

```markdown
![图片描述](https://example.com/image.jpg)
```

---

### Q5: 如何使文章显示为精选（大卡片）？

**A:** 在 Front Matter 中设置：

```yaml
---
featured: true
---
```

精选文章会以更大的卡片样式显示在博客列表顶部。

---

### Q6: 阅读时间是如何计算的？

**A:** 自动计算规则：

- 中文：按 **400字/分钟** 计算
- 英文：按 **200词/分钟** 计算

也可以手动指定：

```yaml
readTime: 15分钟
```

---

### Q7: 标签有数量限制吗？

**A:** 没有硬性限制，但建议 **3-5个标签** 为佳，便于分类和搜索。

---

### Q8: 如何修改已发布的文章？

**A:** 两种方式：

**方式一：编辑 JSON（推荐用于小改动）**

直接编辑 `data/articles.json` 中的对应文章。

**方式二：重新导入（推荐用于大改动）**

1. 修改 `posts/` 中的 Markdown 文件
2. 从 `data/articles.json` 中删除旧版本
3. 重新运行 `node tools/md-to-json.js`

---

### Q9: 支持草稿功能吗？

**A:** 目前不直接支持，但可以：

1. 草稿文件放在 `posts/drafts/` 子目录（不会被扫描）
2. 或使用文件名前缀如 `draft-article.md`，导入前手动排除

---

### Q10: 转换失败怎么办？

**A:** 检查以下几点：

1. ✅ Node.js 是否已安装
2. ✅ Markdown 文件是否包含正确的 Front Matter
3. ✅ Front Matter 分隔符是否为 `---`（三个短横线）
4. ✅ 文件编码是否为 UTF-8
5. ✅ YAML 格式是否正确（注意缩进）

查看控制台错误信息获取更多详情。

---

## 🎨 Markdown 书写技巧

### 使用代码块

````markdown
```javascript
function hello() {
    console.log('Hello, World!');
}
```
````

### 使用表格

```markdown
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据1 | 数据2 | 数据3 |
```

### 使用引用

```markdown
> 这是一段引用文字。
> 可以多行。
```

### 使用任务列表

```markdown
- [x] 已完成任务
- [ ] 待办任务
```

---

## 🔧 进阶功能

### 自定义转换规则

编辑 `tools/md-to-json.js`，可以自定义：

- 摘要生成规则（`generateExcerpt` 方法）
- 阅读时间计算方式（`calculateReadTime` 方法）
- Slug 生成规则（`generateSlug` 方法）
- 分类映射（`categoryMap` 对象）

### 批量更新文章属性

使用 Node.js 脚本批量处理：

```javascript
const fs = require('fs');
const articles = require('./data/articles.json');

// 示例：批量更新某个分类的图标
articles.forEach(article => {
    if (article.category === '技术') {
        article.icon = '💻';
    }
});

fs.writeFileSync('./data/articles.json', JSON.stringify(articles, null, 2));
```

### 从其他平台迁移

#### 从 Hexo 迁移

Hexo 的 Front Matter 格式类似，只需调整字段名：

```javascript
// 在 md-to-json.js 中添加映射
const hexoToLocal = {
    'date': 'publishDate',
    'categories': 'category',
    // ... 其他映射
};
```

#### 从 WordPress 导出

1. 使用 WordPress 插件导出为 Markdown
2. 调整 Front Matter 格式
3. 运行转换工具

---

## 📊 示例文章

项目中已包含三篇示例文章：

1. **技术类** - `posts/example-tech-article.md`
   - Web性能优化实战指南
   
2. **设计类** - `posts/example-design-article.md`
   - 2025年UI设计趋势展望
   
3. **生活类** - `posts/example-life-article.md`
   - 程序员的健康指南

可以参考这些示例编写自己的文章。

---

## 🎯 最佳实践

### 1. 文件命名规范

```
✅ 推荐
- web-performance-optimization.md
- react-hooks-tutorial.md
- 2025-design-trends.md

❌ 避免
- 文章1.md
- new.md
- temp.md
```

### 2. 元数据填写建议

- **标题**：简洁明了，控制在 25 字以内
- **摘要**：100-150 字，概括文章核心内容
- **标签**：3-5 个，有助于搜索和分类
- **图标**：选择与主题相关的 Emoji

### 3. 内容组织

- 使用清晰的标题层级（H1 → H2 → H3）
- 适当使用列表和表格
- 代码示例要有注释
- 长文章添加目录

### 4. SEO 优化

- 标题包含关键词
- 摘要包含核心信息
- 使用语义化的标题
- 添加相关的标签

---

## 📚 相关资源

- [Markdown 语法指南](https://www.markdownguide.org/)
- [Emoji 速查表](https://emojipedia.org/)
- [Front Matter 规范](https://jekyllrb.com/docs/front-matter/)

---

## 💡 提示

- 📦 定期备份 `data/articles.json` 文件
- 🔄 可以使用 Git 管理 Markdown 源文件
- 🎨 保持一致的写作风格
- 📝 使用 Markdown 编辑器（如 Typora、VS Code）预览效果

---

## 🆘 需要帮助？

如果遇到问题：

1. 查看 `tools/README.md` 获取详细说明
2. 检查示例文章的格式
3. 查看控制台错误信息
4. 确认 Node.js 环境正常

---

**祝您写作愉快！** ✨

如果这个工具对您有帮助，欢迎分享给其他人。

