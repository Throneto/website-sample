/**
 * 知识库页面 - 网站导航
 * 展示精选的优质网站和资源
 */

class KnowledgeNavigator {
    constructor() {
        this.allCategories = this.getWebsiteData();
        this.filteredCategories = [...this.allCategories];
        this.searchTerm = '';
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
    }

    // 网站数据
    getWebsiteData() {
        return [
            {
                name: 'Gaming',
                icon: '🎮',
                websites: [
                    {
                        name: '2.5D 卡通城市放置系统 (CubeCity)',
                        description: '一个有趣的2.5D卡通风格城市建设放置系统，采用等距视角设计，让您可以自由布置和规划自己的虚拟城市。轻松体验城市规划的乐趣，适合放松和创意发挥。',
                        subscription: '直接访问即可体验',
                        url: 'https://cube-city.vercel.app/'
                    },
                    {
                        name: '红色井界™ - 网页红警',
                        description: '首个完全基于网页技术的红色警戒2游戏引擎，支持跨平台（PC、Mac、手机、平板）在线对战。无需下载安装，打开浏览器即玩，支持全球联机和自定义地图，让您随时放松一下！',
                        subscription: '直接访问即可游玩',
                        url: 'https://ra2web.com/'
                    },
                    {
                        name: 'Pokemon Auto Chess',
                        description: '一款基于宝可梦（Pokemon）主题的在线自走棋游戏。它免费、开源、非盈利，结合了宠物小精灵和自走棋玩法，玩家可以选择不同的神奇宝贝和策略进行对战，支持多人对战、创建房间、物品、进化和排名等机制，增加了游戏的可玩性。',
                        subscription: '直接访问即可游玩',
                        url: 'https://pokemon-auto-chess.com/'
                    }
                ]
            },
            {
                name: 'Photography',
                icon: '📸',
                websites: [
                    {
                        name: '蜂鸟网',
                        description: '国内知名的摄影门户网站，提供丰富的摄影器材评测、摄影作品展示、摄影技巧教程和活跃的摄影社区。汇聚了大量摄影爱好者和专业摄影师，是中文摄影爱好者的优质交流平台。',
                        subscription: '直接访问浏览',
                        url: 'https://www.fengniao.com/'
                    },
                    {
                        name: 'iRentals 摄影器材社区',
                        description: '专业的摄影器材租赁平台社区，提供器材讨论、使用心得分享和摄影交流。适合想要体验各种摄影器材但不想立即购买的摄影爱好者，是了解器材性能和租赁服务的好去处。',
                        subscription: '注册后即可参与',
                        url: 'https://community.irentals.cn/community'
                    },
                    {
                        name: '视觉中国 VCG.COM',
                        description: '视觉中国旗下正版图片素材平台，提供海量高质量创意图片、视频、设计素材和版权字体。覆盖各主题类别，包含大量独家内容，支持4K分辨率及多种文件格式，满足不同项目的创意设计与配图需求。',
                        subscription: '注册登录后使用',
                        url: 'https://www.vcg.com/'
                    }
                ]
            },
            {
                name: 'Music',
                icon: '🎵',
                websites: [
                    {
                        name: '国家大剧院古典音乐频道',
                        description: '国家大剧院官方古典音乐平台，提供海量高清演出实况、歌剧、音乐会、纪录片等精品内容。汇集世界顶级指挥大师、名团巡礼和中国音乐精品，支持手机、电脑、平板多平台观看。',
                        subscription: '注册会员后观看',
                        url: 'https://www.ncpa-classic.com/'
                    },
                    {
                        name: '耳聆网 Ear0',
                        description: '专业的声音分享平台，采用CC知识共享授权协议。汇集众多录音师作品，提供自然、生活、人声、器乐、音效等多类型声音资源。非营利性开放项目，完全免费，支持智能音频解析和高效合辑管理。',
                        subscription: '直接访问即可使用',
                        url: 'https://www.ear0.com/'
                    }
                ]
            },
            {
                name: 'Reading',
                icon: '📚',
                websites: [
                    {
                        name: 'Z-Library',
                        description: '世界上最大的数字图书馆之一，您的知识和文化之门。提供数百万本书籍和学术论文的在线阅读和下载，支持多种格式，包括个性化推荐、电子书转换、Telegram机器人等功能，让每个人都能轻松获取知识。',
                        subscription: '注册登录后使用',
                        url: 'https://z-library.ec/'
                    },
                    {
                        name: 'Anna\'s Archive',
                        description: '人类历史上最大的真正开放图书馆，拥有超过5959万本书籍和9552万篇学术论文。代码和数据100%开源，致力于永久保存人类知识。支持多种数据源整合，包括Library Genesis、Sci-Hub、Z-Library等，提供强大的搜索和下载功能。',
                        subscription: '直接访问即可使用',
                        url: 'https://annas-archive.org/'
                    }
                ]
            },
            {
                name: 'Travel',
                icon: '✈️',
                websites: [
                    {
                        name: 'The Points Guy (TPG)',
                        description: '如果你对常旅客计划、信用卡积分、航空公司和酒店忠诚度计划感兴趣，这是圣经级别的存在。提供最专业的建议和最新优惠信息。',
                        subscription: 'The Points Guy官网',
                        url: 'https://thepointsguy.com/'
                    },
                    {
                        name: 'Atlas Obscura Newsletter',
                        description: '为你发现世界上那些奇妙、怪异和不起眼的角落。每周推送一个不可思议的地点，激发你的旅行灵感，适合喜欢探险和独特体验的旅行者。',
                        subscription: 'Atlas Obscura官网',
                        url: 'https://www.atlasobscura.com/'
                    }
                ]
            },
            {
                name: 'Web Development',
                icon: '🌐',
                websites: [
                    {
                        name: 'Frontend Focus',
                        description: '一份高质量的免费周刊，汇总前端开发领域的最新文章、教程、工具和新闻。内容经过精心筛选，是前端开发者的必读刊物。',
                        subscription: 'Cooper Press（搜索Frontend Focus）',
                        url: 'https://frontendfoc.us/'
                    },
                    {
                        name: 'JavaScript Weekly',
                        description: '同上，由Cooper Press出品，专注于JavaScript生态圈。无论是新闻、框架更新（React, Vue, Svelte等）、还是深度教程，这里都有。',
                        subscription: 'Cooper Press官网',
                        url: 'https://javascriptweekly.com/'
                    },
                    {
                        name: 'CSS-Tricks Newsletter',
                        description: 'CSS-Tricks网站的精华内容推送，包含最新的CSS特性、布局技巧、前端开发文章和优质代码笔。',
                        subscription: 'CSS-Tricks官网',
                        url: 'https://css-tricks.com/'
                    }
                ]
            },
            {
                name: 'Design',
                icon: '🎨',
                websites: [
                    {
                        name: 'Sidebar',
                        description: '每天只推送5个他们认为当天最好的设计链接，可能是关于UI/UX、产品设计、工具、技巧等。内容极其精炼，质量极高。',
                        subscription: 'Sidebar官网',
                        url: 'https://sidebar.io/'
                    },
                    {
                        name: 'UX Design Weekly',
                        description: '每周为你筛选和推荐关于用户体验设计的最佳文章、工具和资源。非常适合UX从业者保持学习和灵感更新。',
                        subscription: '在其官网填写邮箱',
                        url: 'https://uxdesignweekly.com/'
                    }
                ]
            },
            {
                name: 'DevOps',
                icon: '⚙️',
                websites: [
                    {
                        name: 'DevOps Weekly',
                        description: '由知名顾问Gareth Rushgrove主持，是历史最悠久、最受尊敬的DevOps通讯之一。内容涵盖技术文章、工具发布、文化讨论等。',
                        subscription: 'Cooper Press官网',
                        url: 'https://www.devopsweekly.com/'
                    },
                    {
                        name: 'SRE Weekly',
                        description: '专注于网站可靠性工程、运维和系统管理。内容非常技术导向，适合SRE和平台工程师。',
                        subscription: '在其官网填写邮箱',
                        url: 'https://sreweekly.com/'
                    }
                ]
            },
            {
                name: 'AI Security',
                icon: '🤖',
                websites: [
                    {
                        name: 'The Algorithm Bridge (by Gary Marcus)',
                        description: '虽然不完全是安全导向，但Gary Marcus是AI领域对当前深度学习范式最著名的批评者之一。阅读他的文章能让你从根本层面思考AI的可靠性、鲁棒性和安全性问题。',
                        subscription: '在Substack上搜索',
                        url: 'https://garymarcus.substack.com/'
                    },
                    {
                        name: 'AI Security Newsletter (by Reith & Associates)',
                        description: '一个专门关注AI与机器学习安全、隐私和对抗性攻击的通讯。内容专业，紧跟学术和工业界的最新进展。',
                        subscription: '在其官网填写邮箱',
                        url: '#'
                    },
                    {
                        name: 'The Batch (by DeepLearning.AI)',
                        description: '由吴恩达的DeepLearning.AI团队出品，每周汇总AI领域的重要新闻、研究论文解读和行业趋势。其中经常包含关于AI伦理、偏见和模型安全的内容。',
                        subscription: 'DeepLearning.AI官网',
                        url: 'https://www.deeplearning.ai/the-batch/'
                    }
                ]
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
                    this.searchTerm = e.target.value.trim().toLowerCase();
                    this.filterAndRender();
                }, 300);
            });
        }
    }

    filterAndRender() {
        if (!this.searchTerm) {
            this.filteredCategories = [...this.allCategories];
        } else {
            this.filteredCategories = this.allCategories
                .map(category => {
                    // 检查分类名是否匹配
                    const categoryMatches = category.name.toLowerCase().includes(this.searchTerm);
                    
                    // 过滤网站
                    const filteredWebsites = category.websites.filter(website => {
                        return website.name.toLowerCase().includes(this.searchTerm) ||
                               website.description.toLowerCase().includes(this.searchTerm) ||
                               website.subscription.toLowerCase().includes(this.searchTerm);
                    });

                    // 如果分类名匹配或有匹配的网站，则保留该分类
                    if (categoryMatches) {
                        return category;
                    } else if (filteredWebsites.length > 0) {
                        return {
                            ...category,
                            websites: filteredWebsites
                        };
                    }
                    return null;
                })
                .filter(category => category !== null);
        }

        this.render();
    }

    render() {
        const container = document.getElementById('categoriesContainer');
        if (!container) return;

        if (this.filteredCategories.length === 0) {
            container.innerHTML = this.getEmptyStateHTML();
            return;
        }

        const html = this.filteredCategories.map((category, index) => 
            this.renderCategory(category, index)
        ).join('');

        container.innerHTML = html;
        this.addAnimationDelays();
    }

    renderCategory(category, index) {
        const websitesHTML = category.websites.map((website, websiteIndex) => 
            this.renderWebsiteCard(website, websiteIndex + 1)
        ).join('');

        return `
            <div class="category-section" style="animation-delay: ${index * 0.1}s">
                <div class="category-header">
                    <span class="category-icon">${category.icon}</span>
                    <h2 class="category-title">${category.name}</h2>
                </div>
                <div class="websites-grid">
                    ${websitesHTML}
                </div>
            </div>
        `;
    }

    renderWebsiteCard(website, number) {
        return `
            <div class="website-card">
                <div class="website-card-header">
                    <h3 class="website-name">${website.name}</h3>
                    <span class="website-number">${number}</span>
                </div>
                <p class="website-description">${website.description}</p>
                <div class="website-subscription">
                    <strong>订阅：</strong>${website.subscription}
                </div>
                ${website.url && website.url !== '#' ? `
                    <a href="${website.url}" class="website-link" target="_blank" rel="noopener noreferrer">
                        访问网站
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M7 17L17 7M17 7H7M17 7V17" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </a>
                ` : ''}
            </div>
        `;
    }

    addAnimationDelays() {
        const sections = document.querySelectorAll('.category-section');
        sections.forEach((section, index) => {
            section.style.animationDelay = `${index * 0.1}s`;
        });
    }

    getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3>未找到相关内容</h3>
                <p>尝试调整搜索关键词或清空搜索框查看所有内容</p>
            </div>
        `;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new KnowledgeNavigator();
});
