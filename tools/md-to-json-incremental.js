/**
 * Markdown 转 JSON 工具 - 增量版
 * 每次转换生成一个新的 JSON 文件，避免覆盖现有数据
 * 
 * 使用方法：
 * 1. 将新的 .md 文件放入 posts/ 目录
 * 2. 运行: node tools/md-to-json-incremental.js
 * 3. 自动生成新的 articles-YYYY-MM-DD.json 文件
 * 
 * 优势：
 * - 增量更新，不覆盖旧数据
 * - 减少单次处理的数据量
 * - 便于版本控制和回滚
 * - 支持懒加载和分页
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

class IncrementalMarkdownConverter {
    constructor() {
        this.postsDir = path.join(__dirname, '../posts');
        this.articlesDir = path.join(__dirname, '../data/articles');
        this.indexPath = path.join(__dirname, '../data/articles-index.json');
        this.processedFilesPath = path.join(__dirname, '../data/.processed-files.json');
        
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
     * 计算阅读时间
     */
    calculateReadTime(content) {
        const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
        const englishWords = content.replace(/[\u4e00-\u9fa5]/g, '').split(/\s+/).filter(w => w.length > 0).length;
        
        const minutes = Math.ceil((chineseChars / 400) + (englishWords / 200));
        return minutes > 0 ? `${minutes}分钟` : '1分钟';
    }

    /**
     * 生成文章摘要
     */
    generateExcerpt(content, maxLength = 150) {
        let text = content
            .replace(/#{1,6}\s+/g, '')
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/\*([^*]+)\*/g, '$1')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/```[\s\S]*?```/g, '')
            .trim();

        if (text.length > maxLength) {
            text = text.substring(0, maxLength) + '...';
        }

        return text || '暂无摘要';
    }

    /**
     * 生成 slug
     */
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[\u4e00-\u9fa5]/g, match => encodeURIComponent(match))
            .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
            .replace(/^-|-$/g, '');
    }

    /**
     * 获取文件的哈希值（基于内容 SHA-256 与相对路径，环境无关）
     */
    getFileHash(filePath) {
        const relativePath = path.relative(this.postsDir, filePath);
        const content = fs.readFileSync(filePath, 'utf-8');
        const contentHash = crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
        return `${relativePath}:${contentHash}`;
    }

    /**
     * 读取已处理文件列表
     */
    getProcessedFiles() {
        if (!fs.existsSync(this.processedFilesPath)) {
            return {};
        }
        try {
            return JSON.parse(fs.readFileSync(this.processedFilesPath, 'utf-8'));
        } catch (error) {
            console.warn(`${colors.yellow}无法读取已处理文件列表，将重新创建${colors.reset}`);
            return {};
        }
    }

    /**
     * 读取所有已有文章，用于去重防刷
     */
    getExistingArticles() {
        const existingArticles = [];
        if (!fs.existsSync(this.articlesDir)) {
            return existingArticles;
        }

        const files = fs.readdirSync(this.articlesDir)
            .filter(file => file.startsWith('articles-') && file.endsWith('.json'));

        for (const file of files) {
            try {
                const data = JSON.parse(fs.readFileSync(path.join(this.articlesDir, file), 'utf-8'));
                if (Array.isArray(data.articles)) {
                    existingArticles.push(...data.articles);
                }
            } catch (error) {
                console.warn(`${colors.yellow}读取已有文章文件 ${file} 失败${colors.reset}`);
            }
        }

        return existingArticles;
    }

    /**
     * 保存已处理文件列表
     */
    saveProcessedFiles(processedFiles) {
        fs.writeFileSync(
            this.processedFilesPath,
            JSON.stringify(processedFiles, null, 2),
            'utf-8'
        );
    }

    /**
     * 获取所有文章的最大 ID
     */
    getMaxArticleId() {
        let maxId = 0;
        
        if (!fs.existsSync(this.articlesDir)) {
            return maxId;
        }

        const files = fs.readdirSync(this.articlesDir)
            .filter(file => file.startsWith('articles-') && file.endsWith('.json'));

        for (const file of files) {
            try {
                const data = JSON.parse(fs.readFileSync(path.join(this.articlesDir, file), 'utf-8'));
                data.articles.forEach(article => {
                    if (article.id > maxId) {
                        maxId = article.id;
                    }
                });
            } catch (error) {
                console.warn(`${colors.yellow}读取 ${file} 失败${colors.reset}`);
            }
        }

        return maxId;
    }

    /**
     * 转换单个 Markdown 文件
     */
    convertFile(filePath, startId) {
        console.log(`  处理: ${colors.gray}${path.basename(filePath)}${colors.reset}`);
        
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const { metadata, content: markdown } = this.parseFrontMatter(content);

            const tags = metadata.tags 
                ? metadata.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
                : [];

            const rawCategory = (metadata.category || 'technology').toLowerCase();
            const category = this.categoryMap[rawCategory] || '技术';

            const article = {
                id: startId,
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
                slug: metadata.slug || this.generateSlug(metadata.title || path.basename(filePath, '.md')),
                sourceFile: path.basename(filePath)
            };

            console.log(`    ${colors.green}✓${colors.reset} ${article.title} ${colors.gray}(${article.category})${colors.reset}`);
            return article;

        } catch (error) {
            console.error(`    ${colors.red}✗${colors.reset} ${error.message}`);
            return null;
        }
    }

    /**
     * 读取或创建索引文件
     */
    getIndex() {
        if (!fs.existsSync(this.indexPath)) {
            return {
                version: '1.0',
                lastUpdate: null,
                totalArticles: 0,
                files: []
            };
        }

        try {
            return JSON.parse(fs.readFileSync(this.indexPath, 'utf-8'));
        } catch (error) {
            console.warn(`${colors.yellow}索引文件损坏，将重新创建${colors.reset}`);
            return {
                version: '1.0',
                lastUpdate: null,
                totalArticles: 0,
                files: []
            };
        }
    }

    /**
     * 保存索引文件
     */
    saveIndex(index) {
        fs.writeFileSync(
            this.indexPath,
            JSON.stringify(index, null, 2),
            'utf-8'
        );
    }

    /**
     * 批量转换 Markdown 文件
     */
    async convert() {
        console.log(`\n${colors.cyan}${colors.bright}╔════════════════════════════════════════════╗${colors.reset}`);
        console.log(`${colors.cyan}${colors.bright}║  Markdown 增量转换工具 v2.0               ║${colors.reset}`);
        console.log(`${colors.cyan}${colors.bright}╚════════════════════════════════════════════╝${colors.reset}\n`);

        // 1. 确保目录存在
        if (!fs.existsSync(this.postsDir)) {
            fs.mkdirSync(this.postsDir, { recursive: true });
            console.log(`${colors.yellow}posts/ 目录不存在，已自动创建${colors.reset}`);
            console.log(`${colors.yellow}请将 Markdown 文件放入该目录后重新运行${colors.reset}\n`);
            return;
        }

        if (!fs.existsSync(this.articlesDir)) {
            fs.mkdirSync(this.articlesDir, { recursive: true });
            console.log(`${colors.green}✓${colors.reset} 创建文章目录: data/articles/\n`);
        }

        // 2. 扫描所有 Markdown 文件
        const allFiles = fs.readdirSync(this.postsDir)
            .filter(file => file.endsWith('.md') && !file.startsWith('_'))
            .map(file => path.join(this.postsDir, file));

        if (allFiles.length === 0) {
            console.log(`${colors.yellow}posts/ 目录中没有找到 Markdown 文件${colors.reset}`);
            console.log(`${colors.gray}请添加 .md 文件后重新运行${colors.reset}\n`);
            return;
        }

        console.log(`${colors.bright}📄 发现 ${allFiles.length} 个 Markdown 文件${colors.reset}\n`);

        // 3. 检查哪些文件是新文件或已修改
        const processedFiles = this.getProcessedFiles();
        const existingArticles = this.getExistingArticles();
        const existingSourceFiles = new Set(existingArticles.map(a => a.sourceFile).filter(Boolean));

        const newOrModifiedFiles = [];
        let skippedExisting = 0;

        for (const file of allFiles) {
            const relKey = path.relative(this.postsDir, file);
            const baseName = path.basename(file);
            const hash = this.getFileHash(file);

            // 若记录中已存在且哈希一致，直接跳过
            if (processedFiles[relKey] === hash) {
                continue;
            }

            // 防刷与防重复机制：若现有数据中已有该 sourceFile 且未记录，自动记入缓存，防止克隆后重复生成
            if (existingSourceFiles.has(baseName) && !processedFiles[relKey]) {
                processedFiles[relKey] = hash;
                skippedExisting++;
                continue;
            }

            newOrModifiedFiles.push(file);
        }

        // 保存补齐后的已处理文件列表
        this.saveProcessedFiles(processedFiles);

        if (newOrModifiedFiles.length === 0) {
            console.log(`${colors.green}✓${colors.reset} 所有文件都已是最新的，无需转换${skippedExisting > 0 ? ` (已校准 ${skippedExisting} 篇历史文章缓存)` : ''}\n`);
            return;
        }

        console.log(`${colors.cyan}📝 需要处理 ${newOrModifiedFiles.length} 个文件:${colors.reset}\n`);

        // 4. 转换新文章
        let currentId = this.getMaxArticleId() + 1;
        const newArticles = [];

        for (const file of newOrModifiedFiles) {
            const article = this.convertFile(file, currentId);
            if (article) {
                newArticles.push(article);
                currentId++;
                // 标记为已处理
                const relKey = path.relative(this.postsDir, file);
                processedFiles[relKey] = this.getFileHash(file);
            }
        }

        if (newArticles.length === 0) {
            console.log(`\n${colors.red}✗ 没有成功转换任何文章${colors.reset}\n`);
            return;
        }

        console.log('');

        // 5. 生成新的 JSON 文件（按日期命名）
        const today = new Date().toISOString().split('T')[0];
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const newFileName = `articles-${today}.json`;
        const newFilePath = path.join(this.articlesDir, newFileName);

        // 如果今天已经有文件，添加时间戳避免覆盖
        let finalFileName = newFileName;
        let finalFilePath = newFilePath;
        
        if (fs.existsSync(newFilePath)) {
            finalFileName = `articles-${timestamp}.json`;
            finalFilePath = path.join(this.articlesDir, finalFileName);
        }

        const articleData = {
            generatedAt: new Date().toISOString(),
            date: today,
            count: newArticles.length,
            articles: newArticles
        };

        fs.writeFileSync(
            finalFilePath,
            JSON.stringify(articleData, null, 2),
            'utf-8'
        );

        console.log(`${colors.green}✓${colors.reset} 生成新文件: ${colors.cyan}${finalFileName}${colors.reset}`);

        // 6. 更新索引文件
        const index = this.getIndex();
        index.lastUpdate = new Date().toISOString();
        index.totalArticles += newArticles.length;
        
        // 检查是否已存在同名文件
        const existingFileIndex = index.files.findIndex(f => f.filename === finalFileName);
        if (existingFileIndex >= 0) {
            // 更新现有记录
            index.files[existingFileIndex].count = articleData.count;
            index.files[existingFileIndex].updatedAt = articleData.generatedAt;
        } else {
            // 添加新记录
            index.files.push({
                filename: finalFileName,
                date: today,
                count: articleData.count,
                createdAt: articleData.generatedAt
            });
        }

        // 按日期排序（最新的在前）
        index.files.sort((a, b) => new Date(b.date) - new Date(a.date));

        this.saveIndex(index);
        console.log(`${colors.green}✓${colors.reset} 更新索引文件\n`);

        // 7. 保存已处理文件列表
        this.saveProcessedFiles(processedFiles);

        // 8. 输出统计信息
        console.log(`${colors.green}${colors.bright}╔════════════════════════════════════════════╗${colors.reset}`);
        console.log(`${colors.green}${colors.bright}║            转换完成！                      ║${colors.reset}`);
        console.log(`${colors.green}${colors.bright}╚════════════════════════════════════════════╝${colors.reset}\n`);
        
        console.log(`  ${colors.bright}新增文章:${colors.reset} ${colors.green}${newArticles.length}${colors.reset} 篇`);
        console.log(`  ${colors.bright}文章总数:${colors.reset} ${colors.cyan}${index.totalArticles}${colors.reset} 篇`);
        console.log(`  ${colors.bright}JSON 文件数:${colors.reset} ${colors.cyan}${index.files.length}${colors.reset} 个`);
        console.log(`  ${colors.bright}保存位置:${colors.reset} ${colors.gray}data/articles/${finalFileName}${colors.reset}\n`);

        // 分类统计
        const categoryStats = {};
        newArticles.forEach(article => {
            categoryStats[article.category] = (categoryStats[article.category] || 0) + 1;
        });
        
        console.log(`  ${colors.bright}本次新增分类统计:${colors.reset}`);
        Object.entries(categoryStats).forEach(([cat, count]) => {
            console.log(`    ${cat}: ${count} 篇`);
        });
        
        console.log(`\n${colors.cyan}${colors.bright}下一步操作:${colors.reset}`);
        console.log(`  1. 检查网站是否正常显示新文章`);
        console.log(`  2. ${colors.bright}git add .${colors.reset}`);
        console.log(`  3. ${colors.bright}git commit -m "Add new blog posts"${colors.reset}`);
        console.log(`  4. ${colors.bright}git push${colors.reset}`);
        console.log(`  5. Vercel 会自动部署更新\n`);

        console.log(`${colors.gray}💡 提示: 原始 Markdown 文件保留在 posts/ 目录，可以继续编辑${colors.reset}\n`);
    }
}

// 执行转换
if (require.main === module) {
    const converter = new IncrementalMarkdownConverter();
    converter.convert().catch(error => {
        console.error('转换过程出错:', error);
        process.exit(1);
    });
}

module.exports = IncrementalMarkdownConverter;

