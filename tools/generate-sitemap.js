/**
 * Generate Sitemap Tool
 * Generates sitemap.xml with all blog articles
 * 
 * Usage: node tools/generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
    red: '\x1b[31m'
};

class SitemapGenerator {
    constructor() {
        this.articlesIndexPath = path.join(__dirname, '../data/articles-index.json');
        this.articlesJsonPath = path.join(__dirname, '../data/articles.json');
        this.sitemapPath = path.join(__dirname, '../sitemap.xml');

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
                return JSON.parse(fs.readFileSync(this.articlesJsonPath, 'utf-8'));
            }

            return [];
        } catch (error) {
            console.error(`${colors.red}Error loading articles: ${error.message}${colors.reset}`);
            return [];
        }
    }

    /**
     * Generate sitemap XML
     */
    generateSitemapXml(articles) {
        const now = new Date().toISOString().split('T')[0];

        // Static pages
        const staticPages = [
            { loc: '/', priority: '1.0', changefreq: 'daily', lastmod: now },
            { loc: '/pages/blog.html', priority: '0.9', changefreq: 'daily', lastmod: now },
            { loc: '/pages/knowledge.html', priority: '0.8', changefreq: 'weekly', lastmod: now },
            { loc: '/pages/development.html', priority: '0.8', changefreq: 'weekly', lastmod: now },
            { loc: '/pages/about.html', priority: '0.7', changefreq: 'monthly', lastmod: now },
            { loc: '/privacy-policy.html', priority: '0.3', changefreq: 'yearly', lastmod: now },
            { loc: '/terms-of-service.html', priority: '0.3', changefreq: 'yearly', lastmod: now }
        ];

        // Article pages
        const articlePages = articles.map(article => ({
            loc: `/pages/blog/${article.slug}.html`,
            priority: article.featured ? '0.8' : '0.7',
            changefreq: 'weekly',
            lastmod: article.publishDate || now
        }));

        const allPages = [...staticPages, ...articlePages];

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  
  <!-- Main Pages -->`;

        for (const page of allPages) {
            xml += `\n  <url>
    <loc>${this.baseUrl}${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
        }

        xml += `\n  \n</urlset>`;

        return xml;
    }

    /**
     * Generate sitemap
     */
    async generate() {
        console.log(`\n${colors.cyan}${colors.bright}=== Sitemap Generator ===${colors.reset}\n`);

        try {
            // Load articles
            const articles = await this.loadArticles();
            console.log(`${colors.bright}Found ${articles.length} articles${colors.reset}\n`);

            // Generate sitemap XML
            const sitemapXml = this.generateSitemapXml(articles);

            // Write to file
            fs.writeFileSync(this.sitemapPath, sitemapXml, 'utf-8');

            // Summary
            console.log(`${colors.green}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
            console.log(`${colors.green}✓ Sitemap generated!${colors.reset}\n`);
            console.log(`  ${colors.bright}Total URLs:${colors.reset} ${colors.green}${articles.length + 7}${colors.reset}`);
            console.log(`  ${colors.bright}Static pages:${colors.reset} 7`);
            console.log(`  ${colors.bright}Article pages:${colors.reset} ${articles.length}`);
            console.log(`  ${colors.bright}Output:${colors.reset} ${colors.gray}${this.sitemapPath}${colors.reset}`);
            console.log(`${colors.green}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

            console.log(`${colors.cyan}Next steps:${colors.reset}`);
            console.log(`  1. Submit sitemap to Google Search Console:`);
            console.log(`     ${colors.bright}${this.baseUrl}/sitemap.xml${colors.reset}`);
            console.log(`  2. Monitor indexing status\n`);

        } catch (error) {
            console.error(`${colors.red}${colors.bright}Error:${colors.reset} ${error.message}\n`);
            process.exit(1);
        }
    }
}

// Run generator
if (require.main === module) {
    const generator = new SitemapGenerator();
    generator.generate().catch(error => {
        console.error('Generation failed:', error);
        process.exit(1);
    });
}

module.exports = SitemapGenerator;
