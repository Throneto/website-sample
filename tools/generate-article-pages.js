/**
 * Generate Static Article Pages Tool
 * Generates individual HTML pages for each blog article
 * 
 * Usage: node tools/generate-article-pages.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
};

class ArticlePageGenerator {
    constructor() {
        this.templatePath = path.join(__dirname, '../pages/blog/article-template.html');
        this.outputDir = path.join(__dirname, '../pages/blog');
        this.articlesIndexPath = path.join(__dirname, '../data/articles-index.json');
        this.articlesJsonPath = path.join(__dirname, '../data/articles.json');

        // Read base URL from environment variable with fallback
        this.baseUrl = process.env.SITE_URL || process.env.DOMAIN
            ? `https://${process.env.DOMAIN}`
            : 'https://171780.xyz';

        console.log(`${colors.gray}Using base URL: ${this.baseUrl}${colors.reset}`);
    }

    /**
     * Load articles from JSON
     */
    async loadArticles() {
        try {
            // Try incremental mode first
            if (fs.existsSync(this.articlesIndexPath)) {
                console.log(`${colors.gray}Using incremental mode${colors.reset}`);
                const index = JSON.parse(fs.readFileSync(this.articlesIndexPath, 'utf-8'));
                const allArticles = [];

                for (const file of index.files) {
                    const filePath = path.join(__dirname, `../data/articles/${file.filename}`);
                    if (fs.existsSync(filePath)) {
                        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                        allArticles.push(...data.articles);
                    }
                }

                return allArticles;
            }

            // Fallback to single file mode
            if (fs.existsSync(this.articlesJsonPath)) {
                console.log(`${colors.gray}Using single file mode${colors.reset}`);
                return JSON.parse(fs.readFileSync(this.articlesJsonPath, 'utf-8'));
            }

            throw new Error('No articles found');
        } catch (error) {
            console.error(`${colors.red}Error loading articles: ${error.message}${colors.reset}`);
            throw error;
        }
    }

    /**
     * Load HTML template
     */
    loadTemplate() {
        if (!fs.existsSync(this.templatePath)) {
            throw new Error(`Template not found: ${this.templatePath}`);
        }
        return fs.readFileSync(this.templatePath, 'utf-8');
    }

    /**
     * Format Markdown-like content to HTML
     */
    formatContent(content) {
        if (!content) return '';

        let html = content
            // Headers
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Code blocks
            .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
                return `<pre><code class="language-${lang || 'plaintext'}">${this.escapeHtml(code.trim())}</code></pre>`;
            })
            // Inline code
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            // Blockquotes
            .replace(/^> (.*)$/gim, '<blockquote>$1</blockquote>')
            // Unordered lists
            .replace(/^\- (.*)$/gim, '<li>$1</li>')
            // Paragraphs
            .split('\n\n').map(para => {
                if (para.match(/^<(h[1-6]|pre|blockquote|ul|ol|li)/)) {
                    return para;
                }
                return `<p>${para}</p>`;
            }).join('\n');

        // Wrap list items in ul/ol
        html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

        return html;
    }

    /**
     * Escape HTML special characters
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * Generate meta tags for article
     */
    generateMetaTags(article) {
        const title = `${article.title} - TOGETHER博客`;
        const description = article.excerpt || '技术分享、设计思考、生活感悟';
        const url = `${this.baseUrl}/pages/blog/${article.slug}.html`;
        const image = `${this.baseUrl}/assets/favicon.ico`;

        return `
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="keywords" content="${article.tags ? article.tags.join(', ') : ''}, TOGETHER, 博客, 技术">
<meta name="author" content="TOGETHER">
<meta name="robots" content="index, follow">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${image}">
<meta property="og:site_name" content="TOGETHER">
<meta property="og:locale" content="zh_CN">
<meta property="article:published_time" content="${article.publishDate}">
<meta property="article:author" content="TOGETHER">
<meta property="article:section" content="${article.category}">
${article.tags ? article.tags.map(tag => `<meta property="article:tag" content="${tag}">`).join('\n') : ''}

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="${url}">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${image}">
<meta name="twitter:creator" content="@Vincentcharming">
        `.trim();
    }

    /**
     * Generate structured data for article
     */
    generateStructuredData(article) {
        const url = `${this.baseUrl}/pages/blog/${article.slug}.html`;

        const structuredData = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": article.title,
            "description": article.excerpt || '',
            "image": `${this.baseUrl}/assets/favicon.ico`,
            "author": {
                "@type": "Person",
                "name": "WANG",
                "url": `${this.baseUrl}/pages/about.html`
            },
            "publisher": {
                "@type": "Organization",
                "name": "TOGETHER",
                "logo": {
                    "@type": "ImageObject",
                    "url": `${this.baseUrl}/assets/favicon.ico`
                }
            },
            "datePublished": article.publishDate,
            "dateModified": article.publishDate,
            "url": url,
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": url
            },
            "keywords": article.tags ? article.tags.join(', ') : '',
            "articleSection": article.category,
            "inLanguage": "zh-CN"
        };

        return `<script type="application/ld+json">\n${JSON.stringify(structuredData, null, 2)}\n</script>`;
    }

    /**
     * Generate article content HTML
     */
    generateArticleContent(article) {
        const tagsHtml = article.tags && article.tags.length > 0
            ? `<div class="article-tags">
                ${article.tags.map(tag => `<a href="/pages/blog.html?tag=${encodeURIComponent(tag)}" class="tag-item">${tag}</a>`).join('')}
               </div>`
            : '';

        return `
<div class="article-content">
    <div class="article-hero">
        <div class="article-icon">${article.icon || '📝'}</div>
        <h1 class="article-title">${article.title}</h1>
        ${article.excerpt ? `<p class="article-excerpt">${article.excerpt}</p>` : ''}
        <div class="article-metadata">
            <span>📅 ${article.publishDate}</span>
            <span>📂 ${article.category}</span>
            ${article.readTime ? `<span>⏱️ ${article.readTime}</span>` : ''}
        </div>
    </div>
    
    <div class="article-body">
        ${this.formatContent(article.content)}
    </div>
    
    ${tagsHtml}
    
    <div class="article-actions">
        <a href="/pages/blog.html" class="action-btn">← 返回博客列表</a>
        <a href="/" class="action-btn">回到首页</a>
    </div>
</div>
        `.trim();
    }

    /**
     * Generate single article page
     */
    async generateArticlePage(article, template) {
        try {
            const metaTags = this.generateMetaTags(article);
            const canonicalUrl = `<link rel="canonical" href="${this.baseUrl}/pages/blog/${article.slug}.html">`;
            const structuredData = this.generateStructuredData(article);
            const articleContent = this.generateArticleContent(article);

            // Replace placeholders in template
            let html = template
                .replace('<!-- TEMPLATE_META_TAGS -->', metaTags)
                .replace('<!-- TEMPLATE_CANONICAL_URL -->', canonicalUrl)
                .replace('<!-- TEMPLATE_STRUCTURED_DATA -->', structuredData)
                .replace('<!-- TEMPLATE_ARTICLE_CONTENT -->', articleContent);

            // Write to file
            const outputPath = path.join(this.outputDir, `${article.slug}.html`);
            fs.writeFileSync(outputPath, html, 'utf-8');

            console.log(`${colors.green}✓${colors.reset} ${article.title} ${colors.gray}(${article.slug}.html)${colors.reset}`);
            return outputPath;
        } catch (error) {
            console.error(`${colors.red}✗${colors.reset} ${article.title}: ${error.message}`);
            return null;
        }
    }

    /**
     * Generate all article pages
     */
    async generate() {
        console.log(`\n${colors.cyan}${colors.bright}=== Article Pages Generator ===${colors.reset}\n`);

        try {
            // Ensure output directory exists
            if (!fs.existsSync(this.outputDir)) {
                fs.mkdirSync(this.outputDir, { recursive: true });
                console.log(`${colors.yellow}Created output directory: ${this.outputDir}${colors.reset}\n`);
            }

            // Load template
            const template = this.loadTemplate();
            console.log(`${colors.gray}✓ Template loaded${colors.reset}\n`);

            // Load articles
            const articles = await this.loadArticles();
            console.log(`${colors.bright}Found ${articles.length} articles${colors.reset}\n`);

            if (articles.length === 0) {
                console.log(`${colors.yellow}No articles to process${colors.reset}\n`);
                return;
            }

            // Generate pages
            const generatedPages = [];
            for (const article of articles) {
                const outputPath = await this.generateArticlePage(article, template);
                if (outputPath) {
                    generatedPages.push(outputPath);
                }
            }

            // Summary
            console.log(`\n${colors.green}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
            console.log(`${colors.green}✓ Generation complete!${colors.reset}\n`);
            console.log(`  ${colors.bright}Generated pages:${colors.reset} ${colors.green}${generatedPages.length}${colors.reset}`);
            console.log(`  ${colors.bright}Failed:${colors.reset} ${colors.red}${articles.length - generatedPages.length}${colors.reset}`);
            console.log(`  ${colors.bright}Output directory:${colors.reset} ${colors.gray}${this.outputDir}${colors.reset}`);
            console.log(`${colors.green}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

        } catch (error) {
            console.error(`${colors.red}${colors.bright}Error:${colors.reset} ${error.message}\n`);
            process.exit(1);
        }
    }
}

// Run generator
if (require.main === module) {
    const generator = new ArticlePageGenerator();
    generator.generate().catch(error => {
        console.error('Generation failed:', error);
        process.exit(1);
    });
}

module.exports = ArticlePageGenerator;
