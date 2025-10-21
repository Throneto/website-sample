# 博客工具 - Markdown 导入

本目录包含将 Markdown 文件转换为博客文章的工具。

## 🚀 快速开始

### 方法 1：增量式转换工具（推荐 ✨新功能）

**优势：**
- ✅ 每次只转换新增或修改的文章
- ✅ 不覆盖现有数据，更安全
- ✅ 减少单次处理的数据量
- ✅ 便于版本控制和回滚
- ✅ 自动跟踪已处理文件

**使用方法：**

1. **准备 Markdown 文件**
   
   将您的 Markdown 文件放入 `posts/` 目录：
   ```
   posts/
   ├── my-first-post.md
   ├── another-article.md
   └── tech-tutorial.md
   ```

2. **运行增量转换脚本**
   ```bash
   node tools/md-to-json-incremental.js
   ```

3. **完成！**
   
   - 脚本会自动检测新增或修改的文章
   - 生成新的 JSON 文件（如 `data/articles/articles-2025-01-20.json`）
   - 更新索引文件 `data/articles-index.json`
   - 网页端自动加载所有文章文件

**文件结构：**
```
data/
├── articles-index.json          # 索引文件（记录所有文章文件）
└── articles/                    # 文章目录
    ├── articles-2025-01-15.json # 第一批文章
    ├── articles-2025-01-20.json # 第二批文章
    └── articles-2025-01-25.json # 第三批文章
```

### 方法 2：传统单一文件转换（兼容模式）

如果您更喜欢传统方式，可以继续使用：

```bash
node tools/md-to-json.js
```

这会将所有文章合并到 `data/articles.json` 单一文件中。

**注意：** 网站同时支持两种模式，会自动检测并使用相应的加载方式。

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

### Q: 增量模式和单一文件模式有什么区别？

**A:** 

| 特性 | 增量模式 | 单一文件模式 |
|------|---------|-------------|
| 文件生成 | 每次生成新的 JSON 文件 | 覆盖单一 articles.json |
| 安全性 | ✅ 不会覆盖旧数据 | ⚠️ 会覆盖旧数据 |
| 处理速度 | ✅ 只处理新增/修改的文章 | ⚠️ 每次处理所有文章 |
| 适用场景 | 适合文章数量多、频繁更新 | 适合文章数量少、偶尔更新 |

**推荐：** 对于长期维护的博客，推荐使用增量模式。

### Q: 如何批量导入旧博客？

**A:** 

**增量模式：**
```bash
# 1. 将所有 Markdown 文件放入 posts/ 目录
# 2. 运行增量转换
node tools/md-to-json-incremental.js
```
脚本会自动检测并转换所有新文章。

**单一文件模式：**
```bash
node tools/md-to-json.js
```

### Q: 转换后原始 Markdown 文件会被删除吗？

**A:** 不会。原始文件保持不变，方便您继续编辑和备份。

### Q: 可以修改已转换的文章吗？

**A:** 可以，有以下几种方式：

1. **修改原始 Markdown 文件后重新转换**（推荐）
   ```bash
   # 增量模式会自动检测文件变化
   node tools/md-to-json-incremental.js
   ```

2. **直接编辑 JSON 文件**
   - 增量模式：编辑 `data/articles/articles-YYYY-MM-DD.json`
   - 单一文件模式：编辑 `data/articles.json`

3. **删除旧记录重新生成**
   - 增量模式：删除 `data/.processed-files.json` 中的记录
   - 单一文件模式：删除 JSON 中的对应条目

### Q: 增量模式如何避免重复？

**A:** 增量模式通过 `data/.processed-files.json` 文件跟踪已处理的文件：
- 记录文件路径、修改时间、文件大小
- 只转换新增或修改的文件
- 自动跳过已处理的文件

如果需要重新转换某个文件，删除 `.processed-files.json` 中的对应记录即可。

### Q: 如何清空缓存重新加载文章？

**A:** 
```javascript
// 在浏览器控制台执行
await window.apiService.refreshArticles();
```

或者清除浏览器的 localStorage：
```javascript
localStorage.removeItem('valarz_articles');
```

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

## 🔧 高级配置

### 切换模式

**从单一文件模式迁移到增量模式：**

1. 备份现有 `data/articles.json`
2. 创建 `data/articles/` 目录
3. 运行增量转换脚本
4. 验证网站是否正常显示
5. 如有问题，恢复备份

**从增量模式回退到单一文件模式：**

1. 删除 `data/articles-index.json`
2. 运行单一文件转换脚本
3. 网站会自动使用 `articles.json`

### 自定义配置

编辑转换脚本可以修改：

**增量模式 (`md-to-json-incremental.js`)：**
- `articlesDir` - 文章文件存储目录
- `indexPath` - 索引文件路径
- `processedFilesPath` - 已处理文件记录路径

**单一文件模式 (`md-to-json.js`)：**
- `articlesJsonPath` - 输出文件路径

### 性能优化建议

1. **文章数量 < 50 篇：** 两种模式都可以
2. **文章数量 50-200 篇：** 推荐增量模式
3. **文章数量 > 200 篇：** 强烈推荐增量模式

增量模式优势在文章数量多时更明显：
- 减少 JSON 文件体积
- 加快首次加载速度
- 便于实现懒加载和分页

## 技术支持

如有问题，请检查：

1. **环境检查**
   - Node.js 是否已安装（`node --version`）
   - 是否在项目根目录运行脚本

2. **文件检查**
   - Markdown 文件格式是否正确
   - Front Matter 分隔符是否为 `---`
   - 文件编码是否为 UTF-8

3. **目录检查**
   - `posts/` 目录是否存在
   - `data/` 目录是否有写入权限

4. **浏览器控制台**
   - 检查是否有加载错误
   - 查看文章加载日志

**调试技巧：**
```javascript
// 浏览器控制台查看加载模式
window.apiService.loadArticlesIndex().then(console.log)

// 查看已加载的文章
window.apiService.getArticles().then(console.log)

// 强制刷新
window.apiService.refreshArticles().then(console.log)
```

---

**💡 提示：**
- 增量模式会自动创建备份（`backups/` 目录）
- 单一文件模式建议手动备份 `data/articles.json`
- 两种模式可以共存，网站会自动选择可用的模式

