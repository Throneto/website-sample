/**
 * 开发地带页面功能脚本
 * 处理项目展示、状态筛选等功能
 */

class DevelopmentManager {
    constructor() {
        this.apiService = window.apiService;
        this.currentStatus = 'all';
        this.projects = [];
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        try {
            await this.loadProjects();
            this.setupEventListeners();
            this.hideLoadingIndicator();
        } catch (error) {
            console.error('初始化开发地带失败:', error);
            this.showError('加载项目数据失败，请刷新页面重试');
        }
    }

    async loadProjects() {
        this.showLoadingIndicator();
        this.isLoading = true;

        try {
            // 尝试从API加载项目数据
            // const data = await this.apiService.getProjects();
            // this.projects = data.projects || [];
            
            // 使用模拟数据
            this.projects = this.getMockProjects();
            this.renderProjects();
        } catch (error) {
            console.error('加载项目失败:', error);
            this.projects = this.getMockProjects();
            this.renderProjects();
        } finally {
            this.hideLoadingIndicator();
            this.isLoading = false;
        }
    }

    getMockProjects() {
        return [
            {
                id: 1,
                title: 'H5游戏世界',
                description: '基于HTML5技术的网页游戏平台，无需下载安装即可畅玩。收录了各类经典游戏、益智游戏和休闲游戏，支持手机和电脑浏览器直接运行。',
                status: 'active',
                icon: '🎮',
                technologies: ['HTML5', 'Canvas', 'JavaScript', 'Web Audio'],
                githubUrl: 'https://github.com/yourusername/h5-games',
                demoUrl: 'https://h5.171780.xyz',
                features: ['即点即玩', '跨平台', '无需安装', '响应式设计'],
                startDate: '2024-08-01',
                lastUpdate: '2025-10-15'
            },
            {
                id: 2,
                title: '白噪音放松站',
                description: '专注力与放松的声音世界。提供大自然白噪音、环境音效、冥想音乐等多种声音场景，帮助你专注工作、放松身心、改善睡眠质量。',
                status: 'active',
                icon: '🎵',
                technologies: ['Web Audio API', 'React', 'CSS3', 'IndexedDB'],
                githubUrl: 'https://github.com/yourusername/white-noise',
                demoUrl: 'https://mood.171780.xyz',
                features: ['多种场景', '定时功能', '混音器', '收藏列表'],
                startDate: '2024-09-10',
                lastUpdate: '2025-10-12'
            },
            {
                id: 3,
                title: 'Draw虚拟白板',
                description: '在线手绘风格图表绘制工具。支持流程图、架构图、思维导图等多种图表类型，采用手绘风格呈现，让你的图表更具个性和艺术感。',
                status: 'active',
                icon: '✏️',
                technologies: ['Canvas', 'SVG', 'Excalidraw', 'TypeScript'],
                githubUrl: 'https://github.com/yourusername/draw-board',
                demoUrl: 'https://draw.171780.xyz',
                features: ['手绘风格', '实时协作', '导出多格式', '丰富组件库'],
                startDate: '2024-07-15',
                lastUpdate: '2025-10-18'
            },
            {
                id: 4,
                title: 'IT工具百宝箱',
                description: '为开发者精心准备的在线工具集合。包含JSON格式化、Base64编解码、时间戳转换、正则测试、颜色选择器、加密解密等数十种实用工具。',
                status: 'active',
                icon: '🛠️',
                technologies: ['Vue.js', 'TypeScript', 'Vite', 'TailwindCSS'],
                githubUrl: 'https://github.com/yourusername/it-tools',
                demoUrl: 'https://ittools.171780.xyz',
                features: ['工具齐全', '纯前端', '隐私安全', '快速便捷'],
                startDate: '2024-06-20',
                lastUpdate: '2025-10-20'
            },
            {
                id: 5,
                title: '在线影视中心',
                description: '聚合式在线视频播放平台。整合了多个视频源，提供电影、电视剧、综艺、动漫等海量影视资源，支持搜索、分类、收藏和播放历史记录。',
                status: 'active',
                icon: '📺',
                technologies: ['React', 'Node.js', 'Video.js', 'MongoDB'],
                githubUrl: 'https://github.com/yourusername/online-tv',
                demoUrl: 'https://tv.171780.xyz',
                features: ['海量资源', '高清播放', '智能推荐', '断点续播'],
                startDate: '2024-05-01',
                lastUpdate: '2025-10-16'
            }
        ];
    }

    setupEventListeners() {
        // 状态筛选
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const status = e.target.getAttribute('data-status');
                this.filterByStatus(status);
            });
        });
    }

    filterByStatus(status) {
        // 更新按钮状态
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-status="${status}"]`).classList.add('active');

        this.currentStatus = status;
        this.renderProjects();
    }

    renderProjects() {
        const grid = document.getElementById('projectGrid');
        if (!grid) return;

        const filteredProjects = this.getFilteredProjects();
        
        if (filteredProjects.length === 0) {
            grid.innerHTML = this.getEmptyStateHTML();
            return;
        }

        const projectsHTML = filteredProjects.map(project => this.createProjectHTML(project)).join('');
        grid.innerHTML = projectsHTML;

        // 添加链接点击事件
        grid.querySelectorAll('.project-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.stopPropagation();
                // 链接已经在HTML中设置了target="_blank"，这里不需要额外处理
            });
        });
    }

    getFilteredProjects() {
        if (this.currentStatus === 'all') {
            return this.projects;
        }
        return this.projects.filter(project => project.status === this.currentStatus);
    }

    createProjectHTML(project) {
        const statusClass = project.status;
        const statusText = this.getStatusText(project.status);
        const statusIcon = this.getStatusIcon(project.status);
        
        return `
            <div class="project-item" data-status="${project.status}">
                <div class="project-header">
                    <h3 class="project-title">
                        <span class="project-icon">${project.icon}</span>
                        ${project.title}
                    </h3>
                    <span class="project-status ${statusClass}">
                        ${statusIcon} ${statusText}
                    </span>
                </div>
                
                <p class="project-description">${project.description}</p>
                
                <div class="project-tech">
                    ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
                
                <div class="project-links">
                    ${project.githubUrl ? `
                        <a href="${project.githubUrl}" class="project-link github" target="_blank" rel="noopener noreferrer">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                            </svg>
                            GitHub
                        </a>
                    ` : ''}
                    ${project.demoUrl ? `
                        <a href="${project.demoUrl}" class="project-link demo" target="_blank" rel="noopener noreferrer">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke-width="2"/>
                                <polyline points="15,3 21,3 21,9" stroke-width="2"/>
                                <line x1="10" y1="14" x2="21" y2="3" stroke-width="2"/>
                            </svg>
                            在线演示
                        </a>
                    ` : ''}
                </div>
                
                <div class="project-meta">
                    <small style="color: var(--text-gray); font-size: 0.8rem;">
                        开始时间: ${project.startDate} | 最后更新: ${project.lastUpdate}
                    </small>
                </div>
            </div>
        `;
    }

    getStatusText(status) {
        const statusMap = {
            'active': '在线运行',
            'completed': '已完成',
            'maintenance': '维护中',
            'paused': '暂停'
        };
        return statusMap[status] || status;
    }

    getStatusIcon(status) {
        const iconMap = {
            'active': '✨',
            'completed': '✅',
            'maintenance': '🔧',
            'paused': '⏸️'
        };
        return iconMap[status] || '📋';
    }

    getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3>暂无产品</h3>
                <p>当前筛选条件下没有找到产品，尝试选择其他状态查看更多内容</p>
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
        const grid = document.getElementById('projectGrid');
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
    new DevelopmentManager();
});
