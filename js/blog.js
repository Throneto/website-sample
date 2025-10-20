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
        
        this.init();
    }

    async init() {
        try {
            await this.loadArticles();
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

        // 按搜索关键词筛选
        if (this.currentSearch) {
            const searchLower = this.currentSearch.toLowerCase();
            filtered = filtered.filter(article => 
                article.title.toLowerCase().includes(searchLower) ||
                article.excerpt.toLowerCase().includes(searchLower) ||
                article.tags.some(tag => tag.toLowerCase().includes(searchLower))
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
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${article.title}</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="article-meta">
                            <span>${this.formatDate(article.publishDate)}</span>
                            <span>${article.category}</span>
                            <span>${article.readTime}</span>
                        </div>
                        <div class="article-content">
                            ${article.content}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 添加关闭事件
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.modal-overlay')) {
                document.body.removeChild(modal);
            }
        });
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
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new BlogManager();
});
