// 知识库交互脚本 - 动态加载数据版本
(function() {
    'use strict';

    // DOM元素
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const viewBtns = document.querySelectorAll('.view-btn');
    const knowledgeGrid = document.getElementById('knowledgeGrid');
    const emptyState = document.getElementById('emptyState');
    const resultsCount = document.querySelector('.results-count strong');

    // 当前筛选状态
    let currentCategory = 'all';
    let currentSearch = '';
    let currentSort = 'newest';
    let currentView = 'grid';
    let currentPageType = 'hobby'; // 'hobby' 或 'niche'

    // 数据缓存
    let knowledgeItems = [];
    let categoriesData = [];
    let isLoading = false;

    // 检测当前页面类型
    function detectPageType() {
        const path = window.location.pathname;
        if (path.includes('hobby')) {
            currentPageType = 'hobby';
        } else if (path.includes('niche')) {
            currentPageType = 'niche';
        }
        console.log('📄 Page type:', currentPageType);
    }

    // 初始化
    async function init() {
        console.log('🚀 Initializing Knowledge Base...');
        
        // 检测页面类型
        detectPageType();
        
        // 检查API连接
        const apiAvailable = await checkApiConnection();
        
        if (apiAvailable) {
            // 加载分类数据
            await loadCategories();
            
            // 加载知识条目
            await loadKnowledgeItems();
        } else {
            // API不可用，显示提示
            showApiError();
        }
        
        // 绑定事件
        bindEvents();
        
        console.log('✅ Knowledge Base initialized successfully');
    }

    // 绑定事件
    function bindEvents() {
        // 搜索功能
        if (searchInput) {
            searchInput.addEventListener('input', handleSearch);
        }

        // 分类筛选
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', handleCategoryFilter);
        });

        // 排序
        if (sortSelect) {
            sortSelect.addEventListener('change', handleSort);
        }

        // 视图切换
        viewBtns.forEach(btn => {
            btn.addEventListener('click', handleViewToggle);
        });

        // 添加键盘快捷键
        addKeyboardShortcuts();
    }

    // 检查API连接
    async function checkApiConnection() {
        try {
            if (window.apiService) {
                const health = await window.apiService.checkHealth();
                console.log('✅ API connection successful:', health);
                return true;
            } else {
                console.warn('⚠️ API service not available');
                return false;
            }
        } catch (error) {
            console.error('❌ API connection failed:', error);
            return false;
        }
    }

    // 加载分类数据
    async function loadCategories() {
        if (isLoading) return;
        
        isLoading = true;
        try {
            if (window.apiService) {
                const response = await window.apiService.getCategoriesByType(currentPageType);
                if (response.success) {
                    categoriesData = response.data;
                    console.log(`📂 Loaded ${categoriesData.length} ${currentPageType} categories from API`);
                    updateCategoryButtons();
                }
            }
        } catch (error) {
            console.error('❌ Failed to load categories:', error);
        } finally {
            isLoading = false;
        }
    }

    // 更新分类按钮（确保与数据库数据一致）
    function updateCategoryButtons() {
        if (!categoriesData || categoriesData.length === 0) return;
        
        // 更新现有按钮的属性和文本，确保与数据库一致
        categoryBtns.forEach(btn => {
            const categorySlug = btn.dataset.category;
            
            // 跳过 "all" 按钮
            if (categorySlug === 'all') return;
            
            // 查找匹配的分类数据
            const categoryData = categoriesData.find(cat => cat.slug === categorySlug);
            
            if (categoryData) {
                // 更新图标和名称
                const iconSpan = btn.querySelector('.category-icon');
                const nameSpan = btn.querySelector('span:not(.category-icon):not(.count)');
                
                if (iconSpan) iconSpan.textContent = categoryData.icon;
                if (nameSpan) nameSpan.textContent = categoryData.name;
                
                console.log(`✓ Updated button for ${categoryData.name} (${categorySlug})`);
            } else {
                console.warn(`⚠️ No category data found for slug: ${categorySlug}`);
            }
        });
    }

    // 加载知识条目
    async function loadKnowledgeItems() {
        if (isLoading) return;
        
        isLoading = true;
        showLoadingState();
        
        try {
            if (!window.apiService) {
                throw new Error('API service not available');
            }

            // 获取所有符合页面类型的分类
            const categorySlugs = categoriesData.map(cat => cat.slug);
            console.log(`📚 Loading knowledge items for categories:`, categorySlugs);

            // 获取知识条目（我们需要按分类过滤）
            const response = await window.apiService.getKnowledgeItems({
                limit: 100,
                offset: 0
            });

            if (response.success) {
                // 过滤出符合当前页面类型的条目
                knowledgeItems = response.data.items.filter(item => {
                    // 如果条目有 category_id，检查它是否属于当前页面类型
                    if (!item.category_id) return false;
                    
                    // 查找匹配的分类
                    const matchingCategory = categoriesData.find(cat => cat.id === item.category_id);
                    return matchingCategory !== undefined;
                });

                console.log(`✅ Loaded ${knowledgeItems.length} knowledge items for ${currentPageType}`);
                
                // 渲染卡片
                renderKnowledgeCards(knowledgeItems);
                
                // 更新计数
                updateCategoryCounts();
                updateDisplay(knowledgeItems.length);
            } else {
                throw new Error(response.error || 'Failed to load knowledge items');
            }
        } catch (error) {
            console.error('❌ Failed to load knowledge items:', error);
            showEmptyState('无法加载数据，请检查网络连接');
        } finally {
            isLoading = false;
        }
    }

    // 渲染知识卡片
    function renderKnowledgeCards(items) {
        if (!knowledgeGrid) return;

        // 清空现有内容
        knowledgeGrid.innerHTML = '';

        if (items.length === 0) {
            showEmptyState();
            return;
        }

        // 渲染每个卡片
        items.forEach(item => {
            const card = createKnowledgeCard(item);
            knowledgeGrid.appendChild(card);
        });

        // 添加动画效果
        addScrollAnimation();
        addParallaxEffect();
    }

    // 创建知识卡片
    function createKnowledgeCard(item) {
        const card = document.createElement('article');
        card.className = 'knowledge-card glass-card';
        
        // 查找分类信息
        const category = categoriesData.find(cat => cat.id === item.category_id);
        const categorySlug = category ? category.slug : 'uncategorized';
        const categoryName = category ? category.name : 'Uncategorized';
        const categoryIcon = category ? category.icon : '📁';
        
        card.setAttribute('data-category', categorySlug);
        card.setAttribute('data-id', item.id);

        // 格式化日期
        const date = formatDate(item.created_at);

        // 提取摘要（如果没有 excerpt，从 content 中提取）
        const excerpt = item.excerpt || truncateText(item.content, 150);

        // 提取标签（如果有）
        const tags = item.tags || [];

        // 检查是否来自Gmail
        const isFromGmail = item.source && item.source.includes('Gmail');

        card.innerHTML = `
            <div class="card-header">
                <span class="card-category">${categoryIcon} ${escapeHtml(categoryName)}</span>
                <span class="card-date">${date}</span>
            </div>
            <h3 class="card-title">${escapeHtml(item.title)}</h3>
            <p class="card-excerpt">${escapeHtml(excerpt)}</p>
            ${tags.length > 0 ? `
                <div class="card-tags">
                    ${tags.slice(0, 3).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
            ` : ''}
            <div class="card-footer">
                <span class="card-source">${isFromGmail ? '📧 ' : ''}${escapeHtml(item.source || 'Unknown Source')}</span>
                <button class="card-expand" data-id="${item.id}">Read More →</button>
            </div>
        `;

        // 绑定展开按钮事件
        const expandBtn = card.querySelector('.card-expand');
        expandBtn.addEventListener('click', (e) => handleCardExpand(e, item));

        // 绑定标签点击事件
        const tagElements = card.querySelectorAll('.tag');
        tagElements.forEach(tag => {
            tag.addEventListener('click', handleTagClick);
        });

        return card;
    }

    // 更新分类按钮计数
    function updateCategoryCounts() {
        const counts = {};
        let totalCount = 0;

        // 计算每个分类的条目数
        knowledgeItems.forEach(item => {
            const category = categoriesData.find(cat => cat.id === item.category_id);
            if (category) {
                const slug = category.slug;
                counts[slug] = (counts[slug] || 0) + 1;
                totalCount++;
            }
        });

        // 更新按钮上的计数
        categoryBtns.forEach(btn => {
            const category = btn.dataset.category;
            const countElement = btn.querySelector('.count');
            
            if (countElement) {
                if (category === 'all') {
                    countElement.textContent = totalCount;
                } else {
                    countElement.textContent = counts[category] || 0;
                }
            }
        });
    }

    // 搜索处理
    function handleSearch(e) {
        currentSearch = e.target.value.toLowerCase().trim();
        filterAndSort();
    }

    // 分类筛选
    function handleCategoryFilter(e) {
        const btn = e.currentTarget;
        const category = btn.dataset.category;

        // 更新按钮状态
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        currentCategory = category;
        filterAndSort();
    }

    // 排序处理
    function handleSort(e) {
        currentSort = e.target.value;
        filterAndSort();
    }

    // 视图切换
    function handleViewToggle(e) {
        const btn = e.currentTarget;
        const view = btn.dataset.view;

        // 更新按钮状态
        viewBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // 更新网格样式
        if (view === 'list') {
            knowledgeGrid.classList.add('list-view');
        } else {
            knowledgeGrid.classList.remove('list-view');
        }

        currentView = view;
    }

    // 卡片展开
    async function handleCardExpand(e, item) {
        e.preventDefault();
        const button = e.target;
        
        // 只保存必要的数据到 sessionStorage（避免数据过大）
        try {
            const itemCache = {
                id: item.id,
                title: item.title,
                excerpt: item.excerpt || '',
                category_name: item.category_name,
                category_icon: item.category_icon,
                created_at: item.created_at,
                view_count: item.view_count || 0,
                source: item.source,
                // 不保存 content 字段，因为可能太大
            };
            sessionStorage.setItem('currentKnowledgeItem', JSON.stringify(itemCache));
        } catch (error) {
            console.warn('Failed to cache item to sessionStorage:', error);
            // 即使失败也继续跳转
        }
        
        // 跳转到详情页
        window.location.href = `/pages/knowledge-detail.html?id=${item.id}`;
    }

    // 标签点击
    function handleTagClick(e) {
        const tagText = e.target.textContent.toLowerCase();
        if (searchInput) {
            searchInput.value = tagText;
            currentSearch = tagText;
            filterAndSort();
            
            // 滚动到顶部
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }

    // 筛选和排序
    function filterAndSort() {
        const cards = Array.from(document.querySelectorAll('.knowledge-card'));
        let visibleCards = [];

        cards.forEach(card => {
            const category = card.dataset.category;
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            const excerpt = card.querySelector('.card-excerpt').textContent.toLowerCase();
            const tagElements = card.querySelectorAll('.tag');
            const tags = Array.from(tagElements).map(tag => tag.textContent.toLowerCase());

            // 分类筛选
            const categoryMatch = currentCategory === 'all' || category === currentCategory;

            // 搜索筛选
            const searchMatch = currentSearch === '' || 
                title.includes(currentSearch) || 
                excerpt.includes(currentSearch) ||
                tags.some(tag => tag.includes(currentSearch));

            if (categoryMatch && searchMatch) {
                card.style.display = 'flex';
                visibleCards.push(card);
            } else {
                card.style.display = 'none';
            }
        });

        // 排序
        if (currentSort !== 'newest') {
            sortCards(visibleCards);
        }

        // 更新显示
        updateDisplay(visibleCards.length);
    }

    // 排序卡片
    function sortCards(cards) {
        if (!knowledgeGrid) return;
        
        cards.sort((a, b) => {
            if (currentSort === 'oldest') {
                const dateA = a.querySelector('.card-date').textContent;
                const dateB = b.querySelector('.card-date').textContent;
                return dateA.localeCompare(dateB);
            } else if (currentSort === 'title') {
                const titleA = a.querySelector('.card-title').textContent;
                const titleB = b.querySelector('.card-title').textContent;
                return titleA.localeCompare(titleB);
            }
            return 0;
        });

        // 重新排列DOM
        cards.forEach(card => {
            knowledgeGrid.appendChild(card);
        });
    }

    // 更新显示
    function updateDisplay(count) {
        // 更新计数
        if (resultsCount) {
            resultsCount.textContent = count !== undefined ? count : 0;
        }

        // 显示/隐藏空状态
        if (count === 0) {
            if (knowledgeGrid) knowledgeGrid.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
        } else {
            if (knowledgeGrid) knowledgeGrid.style.display = 'grid';
            if (emptyState) emptyState.style.display = 'none';
        }
    }

    // 显示加载状态
    function showLoadingState() {
        if (!knowledgeGrid) return;
        
        knowledgeGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <div class="spinner" style="width: 50px; height: 50px; margin: 0 auto 1rem;"></div>
                <p style="color: #9ca3af;">Loading knowledge items...</p>
            </div>
        `;
    }

    // 显示空状态
    function showEmptyState(message = 'No results found') {
        if (knowledgeGrid) knowledgeGrid.style.display = 'none';
        if (emptyState) {
            emptyState.style.display = 'block';
            const emptyText = emptyState.querySelector('h3');
            if (emptyText) emptyText.textContent = message;
        }
    }

    // 显示API错误
    function showApiError() {
        if (!knowledgeGrid) return;
        
        knowledgeGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                <h3 style="color: #ef4444; margin-bottom: 0.5rem;">API Connection Failed</h3>
                <p style="color: #9ca3af;">Unable to connect to the backend API. Please try again later.</p>
            </div>
        `;
    }

    // 为卡片添加悬停视差效果
    function addParallaxEffect() {
        const cards = document.querySelectorAll('.knowledge-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 30;
                const rotateY = (centerX - x) / 30;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // 添加键盘快捷键
    function addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K 聚焦搜索框
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (searchInput) searchInput.focus();
            }
            
            // ESC 清空搜索
            if (e.key === 'Escape' && searchInput && document.activeElement === searchInput) {
                searchInput.value = '';
                currentSearch = '';
                filterAndSort();
                searchInput.blur();
            }
        });
    }

    // 添加滚动加载动画
    function addScrollAnimation() {
        const cards = document.querySelectorAll('.knowledge-card');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        entry.target.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, 100);
                    
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        cards.forEach(card => {
            observer.observe(card);
        });
    }

    // 工具函数：格式化日期
    function formatDate(dateString) {
        if (!dateString) return 'Unknown';
        
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return 'Today';
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return `${days} days ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        }
    }

    // 工具函数：截断文本
    function truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // 工具函数：HTML转义
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('🔖 Knowledge Base System Loaded (Dynamic Version)');
})();
