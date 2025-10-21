/**
 * 博客页面功能脚本
 * 处理文章展示、分类筛选、搜索等功能
 */

class BlogManager {
    constructor() {
        this.apiService = window.apiService;
        this.currentCategory = 'all';
        this.currentSearch = '';
        this.currentPage = 1;
        this.articlesPerPage = 6;
        this.articles = [];
        this.isLoading = false;
        this.selectedTag = null; // 当前选中的标签
        this.tagStats = {}; // 标签统计数据
        
        this.init();
    }

    async init() {
        try {
            // 强制刷新文章缓存，确保加载最新数据
            await this.apiService.refreshArticles();
            await this.loadArticles();
            this.generateTagCloud(); // 生成标签云
            this.setupEventListeners();
            this.hideLoadingIndicator();
        } catch (error) {
            console.error('初始化博客失败:', error);
            this.showError('加载博客数据失败，请刷新页面重试');
        }
    }

    async loadArticles() {
        this.showLoadingIndicator();
        this.isLoading = true;

        try {
            // 从本地数据层读取
            const { items, total } = await this.apiService.getArticles({
                category: this.currentCategory,
                search: this.currentSearch,
                page: this.currentPage,
                limit: this.articlesPerPage
            });
            this.articles = items || [];
            this.renderArticles();
        } catch (error) {
            console.error('加载文章失败:', error);
            // 回落到内置模拟（避免空白）
            this.articles = this.getMockArticles();
            this.renderArticles();
        } finally {
            this.hideLoadingIndicator();
            this.isLoading = false;
        }
    }

    getMockArticles() {
        return [
            {
                id: 1,
                title: 'WebGL流体动画实现',
                excerpt: '深入探索基于WebGL的流体动力学模拟技术，从基础概念到实际实现，带你了解如何创建逼真的流体动画效果。',
                content: 'WebGL流体动画是一种基于GPU加速的图形技术...',
                category: '技术',
                tags: ['WebGL', '图形编程', '动画', 'JavaScript'],
                icon: '🌊',
                publishDate: '2025-01-15',
                readTime: '8分钟',
                views: 1250,
                likes: 89,
                featured: true,
                slug: 'webgl-fluid-animation'
            },
            {
                id: 2,
                title: '玻璃态设计趋势分析',
                excerpt: '2025年最受欢迎的UI设计风格——玻璃态设计详解，从设计原理到实现技巧，全面解析这一视觉趋势。',
                content: '玻璃态设计（Glassmorphism）是一种现代UI设计风格...',
                category: '设计',
                tags: ['UI设计', '玻璃态', '设计趋势', 'CSS'],
                icon: '🎨',
                publishDate: '2025-01-14',
                readTime: '6分钟',
                views: 980,
                likes: 67,
                featured: false,
                slug: 'glassmorphism-design-trend'
            },
            {
                id: 3,
                title: 'TypeScript高级类型系统',
                excerpt: '掌握TypeScript的高级类型系统，从基础类型到复杂泛型，提升代码质量和开发效率。',
                content: 'TypeScript的类型系统是其最强大的特性之一...',
                category: '技术',
                tags: ['TypeScript', '类型系统', '前端开发', 'JavaScript'],
                icon: '📘',
                publishDate: '2025-01-12',
                readTime: '12分钟',
                views: 1560,
                likes: 124,
                featured: false,
                slug: 'typescript-advanced-types'
            },
            {
                id: 4,
                title: '现代前端开发工作流',
                excerpt: '从代码编写到部署上线的完整工作流，介绍现代前端开发的最佳实践和工具链。',
                content: '现代前端开发已经不再是简单的HTML、CSS、JavaScript...',
                category: '技术',
                tags: ['前端开发', '工作流', '工具链', 'DevOps'],
                icon: '⚙️',
                publishDate: '2025-01-10',
                readTime: '10分钟',
                views: 2100,
                likes: 156,
                featured: false,
                slug: 'modern-frontend-workflow'
            },
            {
                id: 5,
                title: '设计师的编程思维',
                excerpt: '探讨设计师学习编程的必要性和方法，如何将设计思维与编程思维结合，创造更好的用户体验。',
                content: '在数字化时代，设计师和开发者的界限越来越模糊...',
                category: '设计',
                tags: ['设计思维', '编程', '用户体验', '跨界学习'],
                icon: '🎯',
                publishDate: '2025-01-08',
                readTime: '7分钟',
                views: 890,
                likes: 45,
                featured: false,
                slug: 'designer-programming-mindset'
            },
            {
                id: 6,
                title: '远程工作的艺术',
                excerpt: '分享远程工作的经验和技巧，如何在家办公时保持高效和专注，平衡工作与生活。',
                content: '远程工作已经成为现代职场的新常态...',
                category: '生活',
                tags: ['远程工作', '效率', '工作生活平衡', '职场'],
                icon: '🏠',
                publishDate: '2025-01-05',
                readTime: '5分钟',
                views: 1200,
                likes: 78,
                featured: false,
                slug: 'art-of-remote-work'
            },
            {
                id: 7,
                title: 'AI辅助编程的未来',
                excerpt: '探讨人工智能在编程领域的应用前景，从代码生成到智能调试，AI如何改变我们的开发方式。',
                content: '人工智能技术正在快速发展，对编程领域产生了深远影响...',
                category: '技术',
                tags: ['人工智能', '编程', '代码生成', '未来技术'],
                icon: '🤖',
                publishDate: '2025-01-03',
                readTime: '9分钟',
                views: 1800,
                likes: 112,
                featured: false,
                slug: 'ai-assisted-programming-future'
            },
            {
                id: 8,
                title: '色彩心理学在UI设计中的应用',
                excerpt: '了解色彩如何影响用户情绪和行为，在UI设计中合理运用色彩心理学原理。',
                content: '色彩不仅仅是视觉元素，更是情感和信息的载体...',
                category: '设计',
                tags: ['色彩心理学', 'UI设计', '用户体验', '视觉设计'],
                icon: '🌈',
                publishDate: '2025-01-01',
                readTime: '6分钟',
                views: 1450,
                likes: 93,
                featured: false,
                slug: 'color-psychology-ui-design'
            }
        ];
    }

    setupEventListeners() {
        // 搜索功能
        const searchInput = document.getElementById('blogSearch');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.currentSearch = e.target.value.trim();
                    this.currentPage = 1;
                    this.selectedTag = null; // 清除标签筛选
                    this.updateTagCloudState();
                    this.loadArticles();
                }, 300);
            });
        }

        // 分类筛选
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.getAttribute('data-category');
                this.filterByCategory(category);
            });
        });
    }

    filterByCategory(category) {
        // 更新按钮状态
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        this.currentCategory = category;
        this.currentPage = 1;
        this.selectedTag = null; // 清除标签筛选
        this.updateTagCloudState();
        this.loadArticles();
    }

    renderArticles() {
        const grid = document.getElementById('blogGrid');
        if (!grid) return;

        const filteredArticles = this.getFilteredArticles();
        
        if (filteredArticles.length === 0) {
            grid.innerHTML = this.getEmptyStateHTML();
            return;
        }

        const articlesHTML = filteredArticles.map(article => this.createArticleHTML(article)).join('');
        grid.innerHTML = articlesHTML;

        // 添加文章点击事件
        grid.querySelectorAll('.blog-article').forEach((article, index) => {
            article.addEventListener('click', () => {
                const articleData = filteredArticles[index];
                this.openArticle(articleData);
            });
        });
    }

    getFilteredArticles() {
        let filtered = this.articles;

        // 按分类筛选
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(article => article.category === this.currentCategory);
        }

        // 按标签筛选
        if (this.selectedTag) {
            filtered = filtered.filter(article => 
                article.tags && article.tags.includes(this.selectedTag)
            );
        }

        // 按搜索关键词筛选
        if (this.currentSearch) {
            const searchLower = this.currentSearch.toLowerCase();
            filtered = filtered.filter(article => 
                article.title.toLowerCase().includes(searchLower) ||
                article.excerpt.toLowerCase().includes(searchLower) ||
                (article.tags && article.tags.some(tag => tag.toLowerCase().includes(searchLower)))
            );
        }

        // 按特色文章排序（特色文章在前）
        filtered.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return new Date(b.publishDate) - new Date(a.publishDate);
        });

        return filtered;
    }

    createArticleHTML(article) {
        const isFeatured = article.featured;
        const featuredClass = isFeatured ? 'featured-article' : '';
        
        return `
            <article class="blog-article ${featuredClass}" data-category="${article.category}">
                ${isFeatured ? '<div class="featured-badge">精选</div>' : ''}
                
                <div class="article-header">
                    <div class="article-meta">
                        <div class="article-date">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke-width="2"/>
                                <line x1="16" y1="2" x2="16" y2="6" stroke-width="2"/>
                                <line x1="8" y1="2" x2="8" y2="6" stroke-width="2"/>
                                <line x1="3" y1="10" x2="21" y2="10" stroke-width="2"/>
                            </svg>
                            ${this.formatDate(article.publishDate)}
                        </div>
                        <div class="article-category">${article.category}</div>
                        <div class="article-read-time">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10" stroke-width="2"/>
                                <polyline points="12,6 12,12 16,14" stroke-width="2"/>
                            </svg>
                            ${article.readTime}
                        </div>
                    </div>
                    
                    <h2 class="article-title">
                        <span class="article-icon">${article.icon}</span>
                        ${article.title}
                    </h2>
                </div>
                
                <div class="article-excerpt">${article.excerpt}</div>
                
                <div class="article-tags">
                    ${article.tags.map(tag => `<span class="article-tag">${tag}</span>`).join('')}
                </div>
                
                <div class="article-actions">
                    <a href="#" class="read-more" data-slug="${article.slug}">
                        阅读更多
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M5 12h14M12 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </a>
                    
                    <div class="article-stats">
                        <div class="stat-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-width="2"/>
                                <circle cx="12" cy="12" r="3" stroke-width="2"/>
                            </svg>
                            ${article.views}
                        </div>
                        <div class="stat-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke-width="2"/>
                            </svg>
                            ${article.likes}
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    openArticle(article) {
        // 这里可以实现文章详情页面的打开逻辑
        // 目前只是简单的跳转或显示
        console.log('打开文章:', article.title);
        
        // 可以跳转到文章详情页
        // window.location.href = `/blog/${article.slug}`;
        
        // 或者显示文章内容模态框
        this.showArticleModal(article);
    }

    showArticleModal(article) {
        // 创建模态框显示文章内容
        const modal = document.createElement('div');
        modal.className = 'article-modal';
        
        // 简单的Markdown转HTML处理
        const formattedContent = this.formatMarkdownContent(article.content);
        
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${this.escapeHtml(article.title)}</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="article-meta">
                            <span>${this.formatDate(article.publishDate)}</span>
                            <span>${article.category}</span>
                            <span>${article.readTime}</span>
                        </div>
                        <div class="article-content">
                            ${formattedContent}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 防止背景滚动
        document.body.style.overflow = 'hidden';
        
        // 添加关闭事件
        const closeModal = () => {
            modal.style.animation = 'modalFadeOut 0.3s ease-out forwards';
            setTimeout(() => {
                document.body.removeChild(modal);
                document.body.style.overflow = '';
            }, 300);
        };
        
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        
        modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.modal-overlay')) {
                closeModal();
            }
        });
        
        // ESC键关闭
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }
    
    formatMarkdownContent(content) {
        if (!content) return '';
        
        let html = content;
        
        // ⚠️ 先处理图片和链接（在转义之前）
        // 处理图片（带感叹号）- 必须在链接之前
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
            // 转义alt文本，但保持URL原样
            const safeAlt = this.escapeHtml(alt);
            return `<img src="${url}" alt="${safeAlt}" loading="lazy">`;
        });
        
        // 处理链接（不带感叹号）
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
            const safeText = this.escapeHtml(text);
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${safeText}</a>`;
        });
        
        // 处理代码块（在其他转义之前）
        html = html.replace(/```([\s\S]+?)```/g, (match, code) => {
            return '<pre><code>' + this.escapeHtml(code) + '</code></pre>';
        });
        
        html = html.replace(/`([^`]+)`/g, (match, code) => {
            return '<code>' + this.escapeHtml(code) + '</code>';
        });
        
        // 处理标题
        html = html.replace(/^### (.+)$/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.+)$/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.+)$/gim, '<h1>$1</h1>');
        
        // 处理粗体和斜体
        html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        
        // 处理引用
        html = html.replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>');
        
        // 处理无序列表
        html = html.replace(/^[\*\-] (.+)$/gim, '<li>$1</li>');
        // 包裹连续的<li>为<ul>
        html = html.replace(/(<li>.*?<\/li>\s*)+/gs, (match) => {
            return '<ul>' + match + '</ul>';
        });
        
        // 处理有序列表
        html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>');
        // 包裹连续的<li>为<ol>（如果不在<ul>中）
        html = html.replace(/(<li>.*?<\/li>\s*)+/gs, (match) => {
            if (!match.includes('<ul>')) {
                return '<ol>' + match + '</ol>';
            }
            return match;
        });
        
        // 处理换行和段落
        const lines = html.split('\n');
        const processed = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // 跳过空行
            if (!line) continue;
            
            // 检查是否是HTML标签开头（不需要包裹<p>）
            if (line.match(/^<(h[1-6]|img|ul|ol|li|pre|code|blockquote|a|strong|em)/)) {
                processed.push(line);
            } else {
                // 普通文本包裹在<p>标签中
                processed.push(`<p>${line}</p>`);
            }
        }
        
        return processed.join('\n');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <h3>暂无文章</h3>
                <p>当前筛选条件下没有找到文章，尝试调整搜索关键词或选择其他分类</p>
            </div>
        `;
    }

    showLoadingIndicator() {
        const indicator = document.getElementById('loadingIndicator');
        if (indicator) {
            indicator.classList.remove('hidden');
        }
    }

    hideLoadingIndicator() {
        const indicator = document.getElementById('loadingIndicator');
        if (indicator) {
            indicator.classList.add('hidden');
        }
    }

    showError(message) {
        const grid = document.getElementById('blogGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚠️</div>
                    <h3>加载失败</h3>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    // ========== 标签云相关方法 ==========

    /**
     * 生成标签云
     */
    generateTagCloud() {
        const tagCloudElement = document.getElementById('tagCloud');
        if (!tagCloudElement) return;

        // 收集所有标签并统计频率
        this.tagStats = this.collectTagStats();

        // 如果没有标签
        if (Object.keys(this.tagStats).length === 0) {
            tagCloudElement.innerHTML = '<div class="empty-state">暂无标签</div>';
            tagCloudElement.classList.add('empty');
            return;
        }

        // 根据频率排序标签
        const sortedTags = Object.entries(this.tagStats)
            .sort((a, b) => b[1] - a[1]) // 按频率降序
            .slice(0, 20); // 只显示前20个标签

        // 计算标签大小
        const maxCount = sortedTags[0][1];
        const minCount = sortedTags[sortedTags.length - 1][1];

        // 生成标签云HTML
        const tagsHTML = sortedTags.map(([tag, count]) => {
            const size = this.getTagSize(count, minCount, maxCount);
            return `
                <div class="tag-cloud-item ${size}" data-tag="${this.escapeHtml(tag)}">
                    <span class="tag-name">${this.escapeHtml(tag)}</span>
                    <span class="tag-count">${count}</span>
                </div>
            `;
        }).join('');

        tagCloudElement.innerHTML = tagsHTML;
        tagCloudElement.classList.remove('loading', 'empty');

        // 添加标签点击事件
        this.setupTagCloudListeners();
    }

    /**
     * 收集所有文章的标签并统计频率
     */
    collectTagStats() {
        const tagCounts = {};

        this.articles.forEach(article => {
            if (article.tags && Array.isArray(article.tags)) {
                article.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });

        return tagCounts;
    }

    /**
     * 根据标签频率计算大小等级
     */
    getTagSize(count, minCount, maxCount) {
        if (maxCount === minCount) {
            return 'size-md';
        }

        const percentage = (count - minCount) / (maxCount - minCount);

        if (percentage >= 0.8) return 'size-xl';
        if (percentage >= 0.6) return 'size-lg';
        if (percentage >= 0.4) return 'size-md';
        if (percentage >= 0.2) return 'size-sm';
        return 'size-xs';
    }

    /**
     * 设置标签云点击事件
     */
    setupTagCloudListeners() {
        const tagItems = document.querySelectorAll('.tag-cloud-item');
        
        tagItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const tag = e.currentTarget.getAttribute('data-tag');
                this.filterByTag(tag);
            });
        });
    }

    /**
     * 按标签筛选文章
     */
    filterByTag(tag) {
        // 如果点击的是当前已选中的标签，则取消筛选
        if (this.selectedTag === tag) {
            this.selectedTag = null;
        } else {
            this.selectedTag = tag;
        }

        // 更新标签云状态
        this.updateTagCloudState();

        // 重新加载文章
        this.currentPage = 1;
        this.loadArticles();

        // 滚动到文章列表
        const blogGrid = document.getElementById('blogGrid');
        if (blogGrid) {
            blogGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /**
     * 更新标签云的选中状态
     */
    updateTagCloudState() {
        const tagItems = document.querySelectorAll('.tag-cloud-item');
        
        tagItems.forEach(item => {
            const tag = item.getAttribute('data-tag');
            if (tag === this.selectedTag) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new BlogManager();
});
