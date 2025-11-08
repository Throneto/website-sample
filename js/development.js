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
                demoUrl: 'https://mood.171780.xyz',
                features: ['多种场景', '定时功能', '混音器', '收藏列表'],
                startDate: '2024-09-10',
                lastUpdate: '2025-10-12'
            },
            {
                id: 3,
                title: 'Draw虚拟白板',
                description: '专业的在线手绘风格图表绘制工具，基于 Excalidraw 技术构建。支持流程图、架构图、思维导图、UML 图等多种图表类型，采用自然手绘风格呈现，让技术文档更具个性和艺术感。支持实时协作、版本历史、多格式导出等功能，是团队协作和知识可视化的理想选择。',
                status: 'active',
                icon: '✏️',
                technologies: ['Canvas', 'SVG', 'Excalidraw', 'TypeScript', 'React'],
                demoUrl: 'https://draw.171780.xyz',
                features: ['手绘风格', '实时协作', '多格式导出', '丰富组件库', '版本历史', '云端同步'],
                startDate: '2024-07-15',
                lastUpdate: '2025-01-21'
            },
            {
                id: 4,
                title: 'IT工具百宝箱',
                description: '为开发者精心准备的在线工具集合。包含JSON格式化、Base64编解码、时间戳转换、正则测试、颜色选择器、加密解密等数十种实用工具。',
                status: 'active',
                icon: '🛠️',
                technologies: ['Vue.js', 'TypeScript', 'Vite', 'TailwindCSS'],
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
                demoUrl: 'https://tv.171780.xyz',
                features: ['海量资源', '高清播放', '智能推荐', '断点续播'],
                startDate: '2024-05-01',
                lastUpdate: '2025-10-16'
            },
            {
                id: 6,
                title: '极简倒计时',
                description: '功能全面的在线时间管理工具。支持世界时钟、倒计时、番茄钟等多种计时模式，内置快速预设（5分钟短休、25分钟番茄钟等），还能显示网络信息和系统时间。',
                status: 'active',
                icon: '⏱️',
                technologies: ['HTML5', 'JavaScript', 'CSS3', 'LocalStorage'],
                demoUrl: 'https://time.loc.cc',
                features: ['世界时钟', '倒计时器', '番茄工作法', '主题切换'],
                startDate: '2024-04-10',
                lastUpdate: '2025-10-19'
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
