/**
 * Markdown 转 JSON 工具 - 优化版
 * 用于将 Markdown 博客文章转换为 articles.json 格式
 * 
 * 使用方法：
 * 1. 将所有 .md 文件放入 posts/ 目录
 * 2. 运行: node tools/md-to-json.js
 * 3. 转换后的数据会追加到 data/articles.json
 * 
 * Markdown 文件格式要求：
 * ---
 * title: 文章标题
 * category: technology|design|life
 * tags: 标签1, 标签2, 标签3
 * icon: 🚀
 * excerpt: 文章摘要（可选）
 * featured: true|false（可选）
 * publishDate: 2025-01-20（可选，默认为当前日期）
 * readTime: 8分钟（可选，自动计算）
 * ---
 * 
 * 正文内容...
 */

const fs = require('fs');
const path = require('path');

// ANSI 颜色代码
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
};

class MarkdownConverter {
    constructor() {
        this.postsDir = path.join(__dirname, '../posts');
        this.articlesJsonPath = path.join(__dirname, '../data/articles.json');
        this.categoryMap = {
            'technology': '技术',
            'tech': '技术',
            '技术': '技术',
            'design': '设计',
            '设计': '设计',
            'life': '生活',
            '生活': '生活'
        };
    }

    /**
     * 解析 Markdown Front Matter
     */
    parseFrontMatter(content) {
        const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
        const match = content.match(frontMatterRegex);
        
        if (!match) {
            console.warn('未找到 Front Matter，使用默认配置');
            return {
                metadata: {},
                content: content
            };
        }

        const [, frontMatter, markdown] = match;
        const metadata = {};
        
        frontMatter.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length > 0) {
                const value = valueParts.join(':').trim();
                metadata[key.trim()] = value;
            }
        });

        return {
            metadata,
            content: markdown.trim()
        };
    }

    /**
     * 计算阅读时间（基于字数）
     */
    calculateReadTime(content) {
        // 中文按字符数计算，英文按单词数
        const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
        const englishWords = content.replace(/[\u4e00-\u9fa5]/g, '').split(/\s+/).filter(w => w.length > 0).length;
        
        // 假设中文阅读速度 400字/分钟，英文 200词/分钟
        const minutes = Math.ceil((chineseChars / 400) + (englishWords / 200));
        return minutes > 0 ? `${minutes}分钟` : '1分钟';
    }

    /**
     * 生成文章摘要（如果未提供）
     */
    generateExcerpt(content, maxLength = 150) {
        // 移除 Markdown 语法
        let text = content
            .replace(/#{1,6}\s+/g, '') // 移除标题
            .replace(/\*\*([^*]+)\*\*/g, '$1') // 移除粗体
            .replace(/\*([^*]+)\*/g, '$1') // 移除斜体
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接
            .replace(/`([^`]+)`/g, '$1') // 移除代码
            .replace(/```[\s\S]*?```/g, '') // 移除代码块
            .trim();

        // 截取前 maxLength 个字符
        if (text.length > maxLength) {
            text = text.substring(0, maxLength) + '...';
        }

        return text || '暂无摘要';
    }

    /**
     * 生成 slug（URL友好的标识符）
     */
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[\u4e00-\u9fa5]/g, match => {
                // 简单的拼音映射（实际应用中可以使用 pinyin 库）
                return encodeURIComponent(match);
            })
            .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
            .replace(/^-|-$/g, '');
    }

    /**
     * 转换单个 Markdown 文件
     */
    convertFile(filePath, existingIds) {
        console.log(`处理文件: ${path.basename(filePath)}`);
        
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const { metadata, content: markdown } = this.parseFrontMatter(content);

            // 生成新的 ID（避免冲突）
            const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
            existingIds.push(newId);

            // 解析标签
            const tags = metadata.tags 
                ? metadata.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
                : [];

            // 转换分类
            const rawCategory = (metadata.category || 'technology').toLowerCase();
            const category = this.categoryMap[rawCategory] || '技术';

            // 构建文章对象
            const article = {
                id: newId,
                title: metadata.title || path.basename(filePath, '.md'),
                excerpt: metadata.excerpt || this.generateExcerpt(markdown),
                content: markdown,
                category: category,
                tags: tags,
                icon: metadata.icon || '📝',
                publishDate: metadata.publishDate || new Date().toISOString().split('T')[0],
                readTime: metadata.readTime || this.calculateReadTime(markdown),
                views: 0,
                likes: 0,
                featured: metadata.featured === 'true' || metadata.featured === true,
                slug: metadata.slug || this.generateSlug(metadata.title || path.basename(filePath, '.md'))
            };

            console.log(`${colors.green}✓${colors.reset} ${article.title} ${colors.gray}(${article.category})${colors.reset}`);
            return article;

        } catch (error) {
            console.error(`${colors.red}✗${colors.reset} ${path.basename(filePath)}: ${error.message}`);
            return null;
        }
    }

    /**
     * 创建备份
     */
    createBackup() {
        if (!fs.existsSync(this.articlesJsonPath)) {
            return null;
        }

        const backupDir = path.join(__dirname, '../backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const backupPath = path.join(backupDir, `articles-${timestamp}.json`);
        
        fs.copyFileSync(this.articlesJsonPath, backupPath);
        console.log(`${colors.gray}✓ 已创建备份: ${path.basename(backupPath)}${colors.reset}`);
        
        return backupPath;
    }

    /**
     * 验证 JSON 格式
     */
    validateJson(articles) {
        const errors = [];
        
        articles.forEach((article, index) => {
            if (!article.title) {
                errors.push(`文章 ${index + 1}: 缺少标题`);
            }
            if (!article.category) {
                errors.push(`文章 ${index + 1}: 缺少分类`);
            }
            if (!Array.isArray(article.tags)) {
                errors.push(`文章 ${index + 1}: 标签格式错误`);
            }
        });

        return errors;
    }

    /**
     * 批量转换所有 Markdown 文件
     */
    async convert() {
        console.log(`\n${colors.cyan}${colors.bright}=== Markdown 转 JSON 工具（优化版） ===${colors.reset}\n`);

        // 1. 检查 posts 目录
        if (!fs.existsSync(this.postsDir)) {
            console.log(`${colors.yellow}创建 posts 目录: ${this.postsDir}${colors.reset}`);
            fs.mkdirSync(this.postsDir, { recursive: true });
            console.log(`\n${colors.yellow}请将 Markdown 文件放入 posts/ 目录后重新运行此脚本。${colors.reset}`);
            this.generateExampleMarkdown();
            return;
        }

        // 2. 读取所有 .md 文件
        const files = fs.readdirSync(this.postsDir)
            .filter(file => file.endsWith('.md'))
            .map(file => path.join(this.postsDir, file));

        if (files.length === 0) {
            console.log(`\n${colors.yellow}posts/ 目录中没有找到 .md 文件。${colors.reset}`);
            console.log(`${colors.yellow}请添加 Markdown 文件后重新运行。${colors.reset}`);
            this.generateExampleMarkdown();
            return;
        }

        console.log(`${colors.bright}找到 ${files.length} 个 Markdown 文件${colors.reset}\n`);

        // 3. 创建备份
        this.createBackup();

        // 4. 读取现有的 articles.json
        let existingArticles = [];
        let existingIds = [];
        
        if (fs.existsSync(this.articlesJsonPath)) {
            try {
                const data = fs.readFileSync(this.articlesJsonPath, 'utf-8');
                existingArticles = JSON.parse(data);
                existingIds = existingArticles.map(a => a.id);
                console.log(`${colors.gray}已加载现有文章: ${existingArticles.length} 篇${colors.reset}\n`);
            } catch (error) {
                console.warn(`${colors.yellow}无法读取现有 articles.json，将创建新文件${colors.reset}`);
            }
        } else {
            console.log(`${colors.gray}articles.json 不存在，将创建新文件${colors.reset}\n`);
        }

        // 5. 转换所有文件
        const newArticles = [];
        let successCount = 0;
        let failCount = 0;

        for (const file of files) {
            const article = this.convertFile(file, existingIds);
            if (article) {
                newArticles.push(article);
                successCount++;
            } else {
                failCount++;
            }
        }

        console.log(''); // 空行

        if (newArticles.length === 0) {
            console.log(`${colors.red}✗ 没有成功转换任何文章。${colors.reset}\n`);
            return;
        }

        // 6. 合并并保存
        const allArticles = [...existingArticles, ...newArticles];
        
        // 按发布日期排序
        allArticles.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return new Date(b.publishDate) - new Date(a.publishDate);
        });

        // 确保 data 目录存在
        const dataDir = path.dirname(this.articlesJsonPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // 7. 验证数据
        const validationErrors = this.validateJson(allArticles);
        if (validationErrors.length > 0) {
            console.log(`${colors.yellow}⚠ 发现 ${validationErrors.length} 个验证警告:${colors.reset}`);
            validationErrors.slice(0, 5).forEach(err => {
                console.log(`  ${colors.yellow}• ${err}${colors.reset}`);
            });
            if (validationErrors.length > 5) {
                console.log(`  ${colors.gray}... 还有 ${validationErrors.length - 5} 个警告${colors.reset}`);
            }
            console.log('');
        }

        // 8. 保存 JSON 文件
        fs.writeFileSync(
            this.articlesJsonPath,
            JSON.stringify(allArticles, null, 2),
            'utf-8'
        );

        // 9. 输出统计信息
        console.log(`${colors.green}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
        console.log(`${colors.green}✓ 转换完成！${colors.reset}\n`);
        console.log(`  ${colors.bright}新增文章:${colors.reset} ${colors.green}${newArticles.length}${colors.reset} 篇`);
        if (failCount > 0) {
            console.log(`  ${colors.bright}失败:${colors.reset} ${colors.red}${failCount}${colors.reset} 篇`);
        }
        console.log(`  ${colors.bright}文章总数:${colors.reset} ${colors.cyan}${allArticles.length}${colors.reset} 篇`);
        console.log(`  ${colors.bright}保存位置:${colors.reset} ${colors.gray}${this.articlesJsonPath}${colors.reset}`);
        
        // 统计分类
        const categoryStats = {};
        allArticles.forEach(article => {
            categoryStats[article.category] = (categoryStats[article.category] || 0) + 1;
        });
        console.log(`\n  ${colors.bright}分类统计:${colors.reset}`);
        Object.entries(categoryStats).forEach(([cat, count]) => {
            console.log(`    ${cat}: ${count} 篇`);
        });
        
        console.log(`${colors.green}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
        
        // 10. 生成示例 Markdown 文件（如果不存在）
        this.generateExampleMarkdown();
        
        // 11. 下一步提示
        console.log(`${colors.cyan}下一步操作:${colors.reset}`);
        console.log(`  1. 查看博客页面预览效果`);
        console.log(`  2. 运行 ${colors.bright}git add .${colors.reset} 添加更改`);
        console.log(`  3. 运行 ${colors.bright}git commit -m "Add new blog posts"${colors.reset}`);
        console.log(`  4. 运行 ${colors.bright}git push${colors.reset} 推送到 GitHub`);
        console.log(`  5. Vercel 会自动部署\n`);
    }

    /**
     * 生成示例 Markdown 文件
     */
    generateExampleMarkdown() {
        const examplePath = path.join(this.postsDir, '_example.md');
        
        if (fs.existsSync(examplePath)) {
            return;
        }

        const exampleContent = `---
title: 示例博客文章
category: technology
tags: 示例, Markdown, 博客
icon: 🚀
excerpt: 这是一个示例博客文章，展示了如何使用 Markdown 编写博客。
featured: false
publishDate: 2025-01-20
---

# 欢迎使用 Markdown 博客系统

这是一个示例文章，展示了如何使用 Markdown 格式编写博客文章。

## 基本格式

### 文本样式

- **粗体文本**
- *斜体文本*
- ~~删除线~~
- \`行内代码\`

### 列表

1. 有序列表项 1
2. 有序列表项 2
3. 有序列表项 3

- 无序列表项
- 无序列表项
- 无序列表项

### 代码块

\`\`\`javascript
function hello() {
    console.log('Hello, World!');
}
\`\`\`

### 引用

> 这是一段引用文字。
> 可以有多行。

### 链接和图片

[链接文本](https://example.com)

![图片描述](https://via.placeholder.com/150)

## 结语

开始创建您自己的博客文章吧！
`;

        fs.writeFileSync(examplePath, exampleContent, 'utf-8');
        console.log(`✓ 已创建示例文件: ${examplePath}`);
    }
}

// 执行转换
if (require.main === module) {
    const converter = new MarkdownConverter();
    converter.convert().catch(error => {
        console.error('转换过程出错:', error);
        process.exit(1);
    });
}

module.exports = MarkdownConverter;

