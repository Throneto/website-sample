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
                title: 'TOGETHER 网站',
                description: '现代化的个人网站，采用玻璃态设计风格，支持响应式布局和动态交互效果。集成了知识库、开发地带、博客等功能模块。',
                status: 'active',
                icon: '🌐',
                technologies: ['HTML5', 'CSS3', 'JavaScript', 'WebGL'],
                githubUrl: 'https://github.com/username/together-website',
                demoUrl: 'https://171780.xyz',
                features: ['响应式设计', '动态背景', '玻璃态UI', 'SEO优化'],
                startDate: '2025-01-01',
                lastUpdate: '2025-01-15'
            },
            {
                id: 2,
                title: 'Gmail 知识库集成',
                description: '智能邮件管理系统，将Gmail邮件导入到分类知识库中。支持智能过滤、自动分类和OAuth2认证。',
                status: 'completed',
                icon: '📧',
                technologies: ['TypeScript', 'Node.js', 'PostgreSQL', 'Gmail API'],
                githubUrl: 'https://github.com/username/gmail-knowledge',
                demoUrl: null,
                features: ['OAuth2认证', '智能分类', '邮件搜索', '数据持久化'],
                startDate: '2024-12-01',
                lastUpdate: '2025-01-10'
            },
            {
                id: 3,
                title: 'WebGL 流体动画',
                description: '基于WebGL的流体动力学模拟，创建逼真的流体动画效果。支持实时交互和多种流体参数调节。',
                status: 'active',
                icon: '🌊',
                technologies: ['WebGL', 'GLSL', 'JavaScript', 'Three.js'],
                githubUrl: 'https://github.com/username/webgl-fluid',
                demoUrl: 'https://demo.171780.xyz/fluid',
                features: ['实时渲染', '交互控制', '参数调节', '性能优化'],
                startDate: '2024-11-15',
                lastUpdate: '2025-01-12'
            },
            {
                id: 4,
                title: 'AI 代码助手',
                description: '基于大语言模型的代码生成和优化工具，支持多种编程语言，提供智能代码建议和重构方案。',
                status: 'maintenance',
                icon: '🤖',
                technologies: ['Python', 'OpenAI API', 'FastAPI', 'React'],
                githubUrl: 'https://github.com/username/ai-code-assistant',
                demoUrl: 'https://ai.171780.xyz',
                features: ['代码生成', '智能补全', '错误检测', '重构建议'],
                startDate: '2024-10-01',
                lastUpdate: '2024-12-20'
            },
            {
                id: 5,
                title: '实时协作编辑器',
                description: '支持多人实时协作的在线代码编辑器，基于WebSocket实现实时同步，支持语法高亮和版本控制。',
                status: 'completed',
                icon: '👥',
                technologies: ['React', 'Socket.io', 'Monaco Editor', 'Node.js'],
                githubUrl: 'https://github.com/username/collab-editor',
                demoUrl: 'https://editor.171780.xyz',
                features: ['实时同步', '语法高亮', '版本控制', '用户管理'],
                startDate: '2024-09-01',
                lastUpdate: '2024-11-30'
            },
            {
                id: 6,
                title: '微服务监控平台',
                description: '分布式微服务架构的监控和管理平台，提供实时性能监控、日志分析和告警功能。',
                status: 'active',
                icon: '📊',
                technologies: ['Kubernetes', 'Prometheus', 'Grafana', 'Go'],
                githubUrl: 'https://github.com/username/microservice-monitor',
                demoUrl: null,
                features: ['实时监控', '日志分析', '告警系统', '可视化面板'],
                startDate: '2024-08-15',
                lastUpdate: '2025-01-08'
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
            'active': '进行中',
            'completed': '已完成',
            'maintenance': '维护中',
            'paused': '暂停'
        };
        return statusMap[status] || status;
    }

    getStatusIcon(status) {
        const iconMap = {
            'active': '🚀',
            'completed': '✅',
            'maintenance': '🔧',
            'paused': '⏸️'
        };
        return iconMap[status] || '📋';
    }

    getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <div class="empty-icon">📁</div>
                <h3>暂无项目</h3>
                <p>当前筛选条件下没有找到项目，尝试选择其他状态</p>
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
