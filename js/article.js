/**
 * 文章详情页功能脚本
 * 处理文章详情展示、SEO优化、分享等功能
 */

class ArticleManager {
    constructor() {
        this.apiService = window.apiService;
        this.currentArticle = null;
        this.allArticles = [];
        this.currentIndex = -1;
        
        this.init();
    }

    async init() {
        try {
            // 从URL参数获取文章标识
            const urlParams = new URLSearchParams(window.location.search);
            const slug = urlParams.get('slug');
            const id = urlParams.get('id');

            // 优先直接使用预渲染的静态文章页面
            if (slug && !window.location.pathname.endsWith(`/${slug}.html`)) {
                window.location.replace(`/pages/blog/${encodeURIComponent(slug)}.html`);
                return;
            }

            if (!slug && !id) {
                this.showError('缺少文章参数');
                return;
            }

            // 加载所有文章（用于导航）
            await this.loadAllArticles();

            // 加载当前文章
            await this.loadArticle(slug, id);
        } catch (error) {
            console.error('初始化文章详情页失败:', error);
            this.showError('加载文章失败，请刷新页面重试');
        }
    }

    async loadAllArticles() {
        try {
            const { items } = await this.apiService.getArticles({
                limit: 1000 // 获取所有文章用于导航
            });
            this.allArticles = items || [];
            
            // 按发布日期排序
            this.allArticles.sort((a, b) => {
                return new Date(b.publishDate || 0) - new Date(a.publishDate || 0);
            });
        } catch (error) {
            console.warn('加载文章列表失败，导航功能可能不可用:', error);
            this.allArticles = [];
        }
    }

    async loadArticle(slug, id) {
        this.showLoading();

        try {
            let article = null;

            // 优先使用slug查找
            if (slug) {
                article = this.allArticles.find(a => a.slug === slug);
            } else if (id) {
                article = this.allArticles.find(a => Number(a.id) === Number(id));
            }

            // 如果从缓存中找不到，尝试从API获取
            if (!article) {
                const { items } = await this.apiService.getArticles({
                    limit: 1000
                });
                const allArticles = items || [];
                
                if (slug) {
                    article = allArticles.find(a => a.slug === slug);
                } else if (id) {
                    article = allArticles.find(a => Number(a.id) === Number(id));
                }
            }

            if (!article) {
                this.showError('文章未找到');
                return;
            }

            this.currentArticle = article;
            
            // 找到当前文章在列表中的位置
            this.currentIndex = this.allArticles.findIndex(a => 
                (slug && a.slug === slug) || (id && Number(a.id) === Number(id))
            );

            // 渲染文章
            this.renderArticle(article);
            
            // 更新SEO元数据
            this.updateSEO(article);
            
            // 设置导航
            this.setupNavigation();
            
            // 设置分享功能
            this.setupShare();
            
            this.hideLoading();
        } catch (error) {
            console.error('加载文章失败:', error);
            this.showError('加载文章失败，请刷新页面重试');
        }
    }

    renderArticle(article) {
        const detailContainer = document.getElementById('articleDetail');
        if (!detailContainer) return;

        // 渲染标题和图标
        const titleText = document.getElementById('articleTitleText');
        const icon = document.getElementById('articleIcon');
        if (titleText) titleText.textContent = article.title;
        if (icon) icon.textContent = article.icon || '📝';

        // 渲染元数据
        const category = document.getElementById('articleCategory');
        const date = document.getElementById('articleDate');
        const readTime = document.getElementById('articleReadTime');
        const views = document.getElementById('articleViews');
        
        if (category) {
            category.textContent = article.category || '未分类';
        }
        if (date) {
            date.textContent = this.formatDate(article.publishDate);
        }
        if (readTime) {
            readTime.textContent = article.readTime || '5分钟';
        }
        if (views) {
            views.textContent = `${article.views || 0} 次阅读`;
        }

        // 渲染摘要
        const excerpt = document.getElementById('articleExcerpt');
        if (excerpt) {
            excerpt.textContent = article.excerpt || '';
        }

        // 渲染标签
        const tagsContainer = document.getElementById('articleTags');
        if (tagsContainer && article.tags && article.tags.length > 0) {
            tagsContainer.innerHTML = article.tags.map(tag => 
                `<span class="article-tag-detail">${this.escapeHtml(tag)}</span>`
            ).join('');
        } else if (tagsContainer) {
            tagsContainer.innerHTML = '';
        }

        // 渲染内容
        const body = document.getElementById('articleBody');
        if (body) {
            const formattedContent = this.formatMarkdownContent(article.content || '');
            body.innerHTML = formattedContent;
            
            // 处理图片加载
            this.setupImageLoading();
        }

        // 渲染统计信息
        const viewsFooter = document.getElementById('articleViewsFooter');
        const likesFooter = document.getElementById('articleLikesFooter');
        if (viewsFooter) viewsFooter.textContent = article.views || 0;
        if (likesFooter) likesFooter.textContent = article.likes || 0;

        // 显示文章容器
        detailContainer.style.display = 'block';
    }

    formatMarkdownContent(content) {
        if (!content) return '<p>文章内容为空</p>';

        let html = content;

        // ⚠️ 先处理图片和链接（在转义之前）
        // 处理图片（带感叹号）- 必须在链接之前
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
            const safeAlt = this.escapeHtml(alt);
            // 处理图片URL：确保正确编码和路径处理
            const processedUrl = this.processImageUrl(url);
            return `<img src="${processedUrl}" alt="${safeAlt}" loading="lazy" class="article-image" onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'200\'%3E%3Crect fill=\'%23f0f0f0\' width=\'400\' height=\'200\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' fill=\'%23999\' font-family=\'Arial\' font-size=\'14\'%3E图片加载失败%3C/text%3E%3C/svg%3E'; this.style.border='1px solid rgba(255,59,48,0.3)'; this.style.background='rgba(255,59,48,0.05)';" onload="this.style.opacity='1'; this.style.transition='opacity 0.3s ease';">`;
        });

        // 处理链接（不带感叹号，增加安全协议校验防范 XSS）
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
            const safeText = this.escapeHtml(text);
            const trimmedUrl = url.trim();
            const isSafeProtocol = /^(https?:|\/|#|mailto:)/i.test(trimmedUrl);
            const safeUrl = isSafeProtocol ? this.escapeHtml(trimmedUrl) : '#';
            return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="article-link">${safeText}</a>`;
        });

        // 处理代码块（在其他转义之前）
        html = html.replace(/```([\s\S]+?)```/g, (match, code) => {
            const language = code.match(/^(\w+)\n/);
            const codeContent = language ? code.replace(/^\w+\n/, '') : code;
            const lang = language ? language[1] : '';
            return `<pre><code class="language-${lang}">${this.escapeHtml(codeContent.trim())}</code></pre>`;
        });

        html = html.replace(/`([^`]+)`/g, (match, code) => {
            return `<code class="inline-code">${this.escapeHtml(code)}</code>`;
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

    /**
     * 处理图片URL，确保正确编码和路径转换
     */
    processImageUrl(url) {
        if (!url) return '';
        
        // 去除首尾空格
        url = url.trim();
        
        // 如果已经是完整的URL（http:// 或 https://），直接返回
        // URL对象会自动处理编码
        if (url.match(/^https?:\/\//i)) {
            try {
                // 尝试解析URL，如果成功则返回标准化的URL
                const urlObj = new URL(url);
                return urlObj.href;
            } catch (e) {
                // 如果URL解析失败（可能是相对路径被误判），返回原URL
                console.warn('URL解析失败，使用原URL:', url);
                return url;
            }
        }
        
        // 如果是data URI，直接返回
        if (url.match(/^data:/i)) {
            return url;
        }
        
        // 处理相对路径
        // 如果以 / 开头，从根目录开始
        if (url.startsWith('/')) {
            // 编码路径中的特殊字符（但保留 /）
            return url.split('/').map(part => part ? encodeURIComponent(part) : '').join('/');
        }
        
        // 如果以 ../ 开头，需要根据当前页面路径计算
        if (url.startsWith('../')) {
            // 当前页面是 /pages/blog/article.html
            // 需要回到根目录，所以 ../ 会到 /pages/，../../ 会到根目录
            const basePath = window.location.pathname;
            const pathParts = basePath.split('/').filter(p => p);
            // 移除 article.html
            pathParts.pop();
            
            // 计算需要向上几级
            let upLevels = 0;
            let remainingUrl = url;
            while (remainingUrl.startsWith('../')) {
                upLevels++;
                remainingUrl = remainingUrl.substring(3);
            }
            
            // 构建新路径
            const newPathParts = pathParts.slice(0, -upLevels);
            const newPath = '/' + newPathParts.join('/') + '/' + remainingUrl;
            // 编码路径
            return newPath.split('/').map(part => part ? encodeURIComponent(part) : '').join('/');
        }
        
        // 如果是相对路径（不以 / 开头），相对于当前页面
        // 当前页面是 /pages/blog/article.html，所以相对路径应该相对于 /pages/blog/
        if (!url.startsWith('/') && !url.match(/^https?:\/\//i)) {
            const basePath = window.location.pathname;
            const pathParts = basePath.split('/').filter(p => p);
            pathParts.pop(); // 移除 article.html
            const baseDir = '/' + pathParts.join('/') + '/';
            // 编码路径
            const encodedUrl = url.split('/').map(part => encodeURIComponent(part)).join('/');
            return baseDir + encodedUrl;
        }
        
        // 默认返回原URL（已经处理过的情况）
        return url;
    }

    /**
     * 设置图片加载处理
     */
    setupImageLoading() {
        const images = document.querySelectorAll('.article-body img');
        
        images.forEach(img => {
            // 如果图片已经加载完成
            if (img.complete && img.naturalHeight !== 0) {
                img.style.opacity = '1';
            } else {
                // 等待图片加载
                img.addEventListener('load', function() {
                    this.style.opacity = '1';
                });
                
                // 处理加载错误
                img.addEventListener('error', function() {
                    console.warn('图片加载失败:', this.src);
                    // onerror 属性已经处理了错误显示
                });
            }
        });
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    updateSEO(article) {
        const baseUrl = 'https://171780.xyz';
        const articleUrl = `${baseUrl}/pages/blog/article.html?slug=${encodeURIComponent(article.slug || article.id)}`;

        // 更新页面标题
        document.title = `${article.title} - TOGETHER | 技术分享与生活感悟`;
        document.getElementById('pageTitle').textContent = `${article.title} - TOGETHER`;

        // 更新描述
        const description = article.excerpt || article.title;
        const metaDescription = document.getElementById('pageDescription');
        if (metaDescription) {
            metaDescription.setAttribute('content', description);
        }

        // 更新Canonical URL
        const canonical = document.getElementById('canonicalUrl');
        if (canonical) {
            canonical.setAttribute('href', articleUrl);
        }

        // 更新Open Graph
        document.getElementById('ogUrl').setAttribute('content', articleUrl);
        document.getElementById('ogTitle').setAttribute('content', article.title);
        document.getElementById('ogDescription').setAttribute('content', description);
        if (article.publishDate) {
            document.getElementById('ogPublishedTime').setAttribute('content', new Date(article.publishDate).toISOString());
        }

        // 更新Twitter Card
        document.getElementById('twitterUrl').setAttribute('content', articleUrl);
        document.getElementById('twitterTitle').setAttribute('content', article.title);
        document.getElementById('twitterDescription').setAttribute('content', description);

        // 更新结构化数据
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": article.title,
            "description": description,
            "author": {
                "@type": "Person",
                "name": "WANG",
                "url": `${baseUrl}/pages/about.html`
            },
            "publisher": {
                "@type": "Person",
                "name": "WANG",
                "url": `${baseUrl}/pages/about.html`
            },
            "datePublished": article.publishDate ? new Date(article.publishDate).toISOString() : "",
            "dateModified": article.publishDate ? new Date(article.publishDate).toISOString() : "",
            "inLanguage": "zh-CN",
            "url": articleUrl
        };

        if (article.tags && article.tags.length > 0) {
            structuredData.keywords = article.tags.join(', ');
        }

        const structuredDataScript = document.getElementById('structuredData');
        if (structuredDataScript) {
            structuredDataScript.textContent = JSON.stringify(structuredData);
        }
    }

    setupNavigation() {
        if (this.allArticles.length === 0 || this.currentIndex === -1) return;

        const prevArticle = this.currentIndex > 0 ? this.allArticles[this.currentIndex - 1] : null;
        const nextArticle = this.currentIndex < this.allArticles.length - 1 ? this.allArticles[this.currentIndex + 1] : null;

        // 上一篇
        const prevLink = document.getElementById('navPrev');
        if (prevLink && prevArticle) {
            prevLink.href = `/pages/blog/article.html?slug=${encodeURIComponent(prevArticle.slug || prevArticle.id)}`;
            document.getElementById('prevTitle').textContent = prevArticle.title;
            prevLink.style.display = 'flex';
        } else if (prevLink) {
            prevLink.style.display = 'none';
        }

        // 下一篇
        const nextLink = document.getElementById('navNext');
        if (nextLink && nextArticle) {
            nextLink.href = `/pages/blog/article.html?slug=${encodeURIComponent(nextArticle.slug || nextArticle.id)}`;
            document.getElementById('nextTitle').textContent = nextArticle.title;
            nextLink.style.display = 'flex';
        } else if (nextLink) {
            nextLink.style.display = 'none';
        }
    }

    setupShare() {
        const shareButtons = document.querySelectorAll('.share-btn');
        const articleUrl = window.location.href;
        const articleTitle = this.currentArticle ? this.currentArticle.title : '';
        const articleDescription = this.currentArticle ? (this.currentArticle.excerpt || this.currentArticle.title) : '';

        shareButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const platform = btn.getAttribute('data-platform');

                switch (platform) {
                    case 'weibo':
                        window.open(
                            `https://service.weibo.com/share/share.php?url=${encodeURIComponent(articleUrl)}&title=${encodeURIComponent(articleTitle)}`,
                            '_blank',
                            'width=600,height=400'
                        );
                        break;
                    case 'twitter':
                        window.open(
                            `https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(articleTitle)}`,
                            '_blank',
                            'width=600,height=400'
                        );
                        break;
                    case 'copy':
                        this.copyToClipboard(articleUrl, btn);
                        break;
                }
            });
        });
    }

    async copyToClipboard(text, btnElement) {
        try {
            await navigator.clipboard.writeText(text);
            
            // 显示提示
            if (btnElement) {
                const originalHTML = btnElement.innerHTML;
                btnElement.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                btnElement.style.color = '#00f3ff';
                
                setTimeout(() => {
                    btnElement.innerHTML = originalHTML;
                    btnElement.style.color = '';
                }, 2000);
            }
        } catch (error) {
            console.error('复制失败:', error);
            alert('复制失败，请手动复制链接');
        }
    }

    showLoading() {
        const loading = document.getElementById('articleLoading');
        const detail = document.getElementById('articleDetail');
        const error = document.getElementById('articleError');
        
        if (loading) loading.style.display = 'flex';
        if (detail) detail.style.display = 'none';
        if (error) error.style.display = 'none';
    }

    hideLoading() {
        const loading = document.getElementById('articleLoading');
        if (loading) loading.style.display = 'none';
    }

    showError(message) {
        const loading = document.getElementById('articleLoading');
        const detail = document.getElementById('articleDetail');
        const error = document.getElementById('articleError');
        
        if (loading) loading.style.display = 'none';
        if (detail) detail.style.display = 'none';
        if (error) {
            const errorText = error.querySelector('p');
            if (errorText) errorText.textContent = message || '文章未找到';
            error.style.display = 'block';
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new ArticleManager();
});

