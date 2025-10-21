# 📋 增量式博客系统 - 快速参考

## 🚀 常用命令

### 添加新文章
```bash
# 1. 创建 Markdown 文件
# posts/my-article.md

# 2. 运行转换
node tools/md-to-json-incremental.js
```

### 修改现有文章
```bash
# 1. 编辑 Markdown 文件

# 2. 运行转换（自动检测变化）
node tools/md-to-json-incremental.js
```

### 批量导入文章
```bash
# 1. 将所有 .md 文件放入 posts/

# 2. 运行转换
node tools/md-to-json-incremental.js
```

### 清空重新生成
```bash
# 删除所有生成文件
rm -rf data/articles/
rm data/articles-index.json
rm data/.processed-files.json

# 重新转换
node tools/md-to-json-incremental.js
```

## 📝 Markdown 模板

### 最简模板
```markdown
---
title: 文章标题
category: technology
---

# 内容标题

正文...
```

### 完整模板
```markdown
---
title: 文章标题
category: technology
tags: 标签1, 标签2, 标签3
icon: 🚀
excerpt: 这是文章摘要
featured: true
publishDate: 2025-01-20
readTime: 5分钟
---

# 文章标题

正文内容...
```

## 🔧 浏览器调试命令

### 查看加载模式
```javascript
// 打开浏览器控制台 (F12)

// 查看索引
await window.apiService.loadArticlesIndex()

// 查看所有文章
await window.apiService.getArticles()

// 强制刷新
await window.apiService.refreshArticles()

// 清除缓存
localStorage.removeItem('valarz_articles')
location.reload()
```

## 📁 文件结构

```
项目根目录/
├── posts/                          # Markdown 源文件
│   ├── my-article.md
│   └── another-article.md
│
├── data/
│   ├── articles-index.json         # 索引文件
│   ├── articles/                   # 文章 JSON 文件
│   │   ├── articles-2025-01-15.json
│   │   └── articles-2025-01-20.json
│   └── .processed-files.json       # 已处理文件记录
│
└── tools/
    ├── md-to-json-incremental.js   # 增量转换脚本
    ├── md-to-json.js               # 单一文件转换脚本
    └── README.md                   # 完整文档
```

## 🎯 分类选项

| Front Matter | 显示名称 |
|-------------|---------|
| `technology` / `tech` / `技术` | 技术 |
| `design` / `设计` | 设计 |
| `life` / `生活` | 生活 |

## ❓ 常见问题速查

### 文章不显示？
1. 检查 Front Matter 格式
2. 确认 title 和 category 字段存在
3. 打开浏览器控制台查看错误
4. 运行 `await window.apiService.refreshArticles()`

### 修改未生效？
1. 确认文件已保存
2. 重新运行转换脚本
3. 清除浏览器缓存

### 文章重复？
1. 检查是否重复运行脚本
2. 查看 `data/.processed-files.json`
3. 删除重复的 JSON 文件
4. 更新索引文件

### 想回到单一文件模式？
```bash
node tools/md-to-json.js
rm data/articles-index.json
```

## 🔗 相关文档

- **完整文档**: `tools/README.md`
- **详细指南**: `tools/INCREMENTAL_GUIDE.md`
- **性能对比**: `tools/COMPARISON.md`

## 💡 最佳实践

1. ✅ 使用 Git 版本控制
2. ✅ 定期备份 `data/` 目录
3. ✅ 文章命名用英文或数字
4. ✅ 添加 Front Matter 完整信息
5. ✅ 图片放在 `assets/images/` 目录

## 🎨 Emoji 图标推荐

```
技术类: 🚀 💻 ⚙️ 🔧 📱 🌐 ⚡ 🔬
设计类: 🎨 🎭 ✨ 🎯 💎 🌈 🖼️ 📐
生活类: 🏠 ☕ 📚 ✈️ 🎵 🍰 🌟 💭
学习类: 📝 📖 🎓 💡 🧠 🔍 📊 📈
```

## ⚡ 性能建议

| 文章数量 | 推荐模式 | 理由 |
|---------|---------|------|
| < 30篇 | 任意模式 | 性能差异不大 |
| 30-50篇 | 增量式 | 更新更快 |
| > 50篇 | 增量式 | 显著提升 |
| > 200篇 | 增量式 | 强烈推荐 |

---

**📌 打印此页面，贴在显示器旁边，随时参考！**

