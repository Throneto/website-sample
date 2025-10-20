/**
 * 知识库页面功能脚本
 * 处理搜索、筛选、数据加载等功能
 */

class KnowledgeManager {
    constructor() {
        this.apiService = window.apiService;
        this.currentCategory = 'all';
        this.currentSearch = '';
        this.knowledgeItems = [];
        this.categories = [];
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        try {
            await this.loadCategories();
            await this.loadKnowledgeItems();
            this.setupEventListeners();
            this.hideLoadingIndicator();
        } catch (error) {
            console.error('初始化知识库失败:', error);
            this.showError('加载知识库数据失败，请刷新页面重试');
        }
    }

    async loadCategories() {
        try {
            const data = await this.apiService.getCategories();
            this.categories = data.categories || [];
            console.log('加载分类成功:', this.categories);
        } catch (error) {
            console.error('加载分类失败:', error);
            // 使用默认分类
            this.categories = [
                { id: 1, name: '前端开发', slug: 'frontend', type: 'knowledge' },
                { id: 2, name: '后端开发', slug: 'backend', type: 'knowledge' },
                { id: 3, name: '开发工具', slug: 'tools', type: 'knowledge' },
                { id: 4, name: '学习资源', slug: 'learning', type: 'knowledge' }
            ];
        }
    }

    async loadKnowledgeItems() {
        this.showLoadingIndicator();
        this.isLoading = true;

        try {
            const params = {
                limit: 50,
                offset: 0
            };

            if (this.currentCategory !== 'all') {
                params.category = this.currentCategory;
            }

            if (this.currentSearch) {
                params.search = this.currentSearch;
            }

            const data = await this.apiService.getKnowledgeItems(params);
            this.knowledgeItems = data.items || [];
            this.renderKnowledgeItems();
        } catch (error) {
            console.error('加载知识库条目失败:', error);
            // 使用模拟数据
            this.knowledgeItems = this.getMockKnowledgeItems();
            this.renderKnowledgeItems();
        } finally {
            this.hideLoadingIndicator();
            this.isLoading = false;
        }
    }

    getMockKnowledgeItems() {
        return [
            {
                id: 1,
                title: 'React 18 新特性详解',
                description: '深入解析React 18的并发特性、Suspense改进和新的Hooks',
                url: 'https://react.dev/blog/2022/03/29/react-v18',
                category: 'frontend',
                tags: ['React', 'JavaScript', '前端'],
                icon: '⚛️'
            },
            {
                id: 2,
                title: 'Node.js 性能优化指南',
                description: '从内存管理到异步处理，全面提升Node.js应用性能',
                url: 'https://nodejs.org/en/docs/guides/performance/',
                category: 'backend',
                tags: ['Node.js', '性能优化', '后端'],
                icon: '🚀'
            },
            {
                id: 3,
                title: 'VS Code 插件开发',
                description: '从零开始学习VS Code插件开发，打造专属开发工具',
                url: 'https://code.visualstudio.com/api',
                category: 'tools',
                tags: ['VS Code', '插件开发', '工具'],
                icon: '🔧'
            },
            {
                id: 4,
                title: 'TypeScript 高级类型',
                description: '掌握TypeScript的高级类型系统，提升代码质量',
                url: 'https://www.typescriptlang.org/docs/handbook/2/types.html',
                category: 'frontend',
                tags: ['TypeScript', '类型系统', '前端'],
                icon: '📘'
            },
            {
                id: 5,
                title: 'Docker 容器化实践',
                description: '学习Docker容器化技术，实现应用的快速部署和扩展',
                url: 'https://docs.docker.com/',
                category: 'tools',
                tags: ['Docker', '容器化', 'DevOps'],
                icon: '🐳'
            },
            {
                id: 6,
                title: '算法与数据结构',
                description: '计算机科学基础，提升编程思维和问题解决能力',
                url: 'https://leetcode.cn/',
                category: 'learning',
                tags: ['算法', '数据结构', '编程基础'],
                icon: '🧮'
            },
            {
                id: 7,
                title: 'WebGL 图形编程',
                description: '学习WebGL技术，创建炫酷的3D图形和动画效果',
                url: 'https://webglfundamentals.org/',
                category: 'frontend',
                tags: ['WebGL', '3D图形', '前端'],
                icon: '🎨'
            },
            {
                id: 8,
                title: 'PostgreSQL 数据库优化',
                description: '深入PostgreSQL数据库，掌握查询优化和性能调优',
                url: 'https://www.postgresql.org/docs/',
                category: 'backend',
                tags: ['PostgreSQL', '数据库', '后端'],
                icon: '🐘'
            }
        ];
    }

    setupEventListeners() {
        // 搜索功能
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.currentSearch = e.target.value.trim();
                    this.loadKnowledgeItems();
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
        this.loadKnowledgeItems();
    }

    renderKnowledgeItems() {
        const grid = document.getElementById('knowledgeGrid');
        if (!grid) return;

        if (this.knowledgeItems.length === 0) {
            grid.innerHTML = this.getEmptyStateHTML();
            return;
        }

        const itemsHTML = this.knowledgeItems.map(item => this.createKnowledgeItemHTML(item)).join('');
        grid.innerHTML = itemsHTML;

        // 添加点击事件
        grid.querySelectorAll('.knowledge-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                const knowledgeItem = this.knowledgeItems[index];
                if (knowledgeItem.url) {
                    window.open(knowledgeItem.url, '_blank', 'noopener,noreferrer');
                }
            });
        });
    }

    createKnowledgeItemHTML(item) {
        const categoryName = this.getCategoryName(item.category);
        
        return `
            <div class="knowledge-item" data-category="${item.category}">
                <h3>
                    <span class="item-icon">${item.icon || '📚'}</span>
                    ${item.title}
                </h3>
                <p>${item.description}</p>
                <div class="item-tags">
                    <span class="tag">${categoryName}</span>
                    ${item.tags ? item.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
                ${item.url ? `
                    <a href="${item.url}" class="item-url" target="_blank" rel="noopener noreferrer">
                        访问链接
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M7 17L17 7M17 7H7M17 7V17" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </a>
                ` : ''}
            </div>
        `;
    }

    getCategoryName(categorySlug) {
        const category = this.categories.find(cat => cat.slug === categorySlug);
        return category ? category.name : categorySlug;
    }

    getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3>未找到相关内容</h3>
                <p>尝试调整搜索关键词或选择其他分类</p>
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
        const grid = document.getElementById('knowledgeGrid');
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
    new KnowledgeManager();
});
