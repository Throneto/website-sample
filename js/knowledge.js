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
                    },
                    {
                        name: 'LesFM 唱片公司',
                        description: '专业音乐版权平台，为YouTube博主和创作者提供2000+优质背景音乐曲目。涵盖Acoustic、Folk、Jazz、Electronic等多种风格，从平和宁静到充满活力应有尽有。支持商用授权，提供无限下载和在线发布服务。',
                        subscription: '免费试听，订阅后使用',
                        url: 'https://lesfm.net/zh-CN/'
                    },
                    {
                        name: 'Musicca 音乐工具',
                        description: '免费在线音乐学习工具集，提供虚拟钢琴、吉他、贝斯、鼓组等多种乐器练习工具。包含和弦播放器、节拍器、调音器、音程查找、音阶查找等实用功能，还有五度圈、空白五线谱等理论学习资源，适合音乐爱好者和学习者使用。',
                        subscription: '直接访问即可使用',
                        url: 'https://www.musicca.com/zh/tools'
                    },
                    {
                        name: 'Yue AI 音乐生成器',
                        description: '开源AI音乐生成器，可根据歌词自动生成带人声的专业级音乐作品。支持多种音乐风格和语言，可自定义曲风、节奏和人声类型。生成的音乐可商用，支持分轨下载（人声、伴奏分离），提供MP3和WAV高质量格式，让音乐创作变得简单高效。',
                        subscription: '直接访问即可使用',
                        url: 'https://yueai.ai/'
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
                    },
                    {
                        name: 'Project Gutenberg',
                        description: '拥有超过75,000本免费电子书的经典文学图书馆，自1971年以来一直致力于数字化保存人类文学遗产。100%免费无需注册，专注于美国版权已过期的世界名著，支持epub和Kindle格式在线阅读或下载，由数百名志愿者精心数字化和校对。',
                        subscription: '直接访问即可使用',
                        url: 'https://www.gutenberg.org/'
                    }
                ]
            },
            {
                name: 'Travel',
                icon: '✈️',
                websites: [
                    {
                        name: 'Lonely Planet',
                        description: '全球最权威的旅行指南品牌，提供世界各地的目的地指南、旅行灵感、Best in Travel 年度榜单以及详尽的旅行规划工具。从热门景点到小众秘境，从预算旅行到奢华体验，帮助您规划完美的旅程。',
                        subscription: '直接访问即可浏览',
                        url: 'https://www.lonelyplanet.com/'
                    },
                    {
                        name: 'National Geographic Travel',
                        description: '国家地理旅行频道，提供高品质的旅行目的地指南、摄影作品、文化探索和可持续旅行建议。从 UNESCO 世界遗产到隐藏宝藏，带您探索世界最精彩的地方和体验，适合追求深度旅行的探险者。',
                        subscription: '直接访问即可浏览',
                        url: 'https://www.nationalgeographic.com/travel/'
                    },
                    {
                        name: '马蜂窝',
                        description: '中国领先的旅行玩乐平台，汇聚海量真实旅行攻略、游记分享和旅行问答。提供全球热门目的地的自由行攻略、酒店预订、景点门票和当地玩乐服务，帮助旅行者规划个性化行程，发现小众玩法，适合中文用户深度了解目的地。',
                        subscription: '直接访问即可使用',
                        url: 'https://www.mafengwo.cn/'
                    }
                ]
            },
            {
                name: 'Web Development',
                icon: '🌐',
                websites: [
                    {
                        name: 'HelloGitHub',
                        description: '一个发现和分享有趣、入门级开源项目的平台。希望大家能够在这里找到编程的快乐、轻松搞定问题的技术方案、大呼过瘾的开源神器，顺其自然地开启开源之旅。',
                        subscription: '直接访问即可浏览',
                        url: 'https://hellogithub.com/'
                    },
                    {
                        name: '菜鸟教程',
                        description: '学的不仅是技术，更是梦想！提供 HTML、CSS、JavaScript、Python、Java、SQL、PHP 等各种编程语言的免费在线教程、在线实例和工具。适合初学者和进阶开发者学习参考。',
                        subscription: '直接访问即可学习',
                        url: 'https://www.runoob.com/'
                    },
                    {
                        name: 'GTmetrix',
                        description: '专业的网站性能分析和优化工具，提供详细的页面加载速度分析、性能评分和优化建议。支持多地测试、真实设备模拟和历史记录追踪，帮助开发者优化网站性能和用户体验。',
                        subscription: '免费使用，注册后解锁更多功能',
                        url: 'https://gtmetrix.com/'
                    }
                ]
            },
            {
                name: 'Design',
                icon: '🎨',
                websites: [
                    {
                        name: 'React Bits',
                        description: 'React开发者的优质资源平台，提供React组件、设计模式、最佳实践和开发技巧。精心整理的React生态系统工具和资源，帮助开发者构建更好的React应用。',
                        subscription: '直接访问即可使用',
                        url: 'https://www.reactbits.dev/'
                    },
                    {
                        name: 'SVG Loaders - MageCDN',
                        description: '100+ 开源SVG加载动画（Spinners）工具库。所有动画采用MIT许可证，可商用且无需归属。包含各种精美的SVG加载图标，可直接用于网站和应用的内容加载提示。',
                        subscription: '直接访问即可使用',
                        url: 'https://magecdn.com/tools/svg-loaders'
                    },
                    {
                        name: 'Icon-icons',
                        description: '海量免费图标资源库，提供数十万个高质量图标，支持SVG、PNG等多种格式下载。涵盖各种主题和风格，适合网站、应用和设计项目使用。支持中文界面，方便国内设计师使用。',
                        subscription: '直接访问即可下载',
                        url: 'https://icon-icons.com/zh/'
                    },
                    {
                        name: 'PatternCraft',
                        description: '专业级背景图案和渐变工具库，提供200+精美的CSS和Tailwind背景图案。包含渐变、几何、装饰和特效等多种分类，支持实时预览和一键复制代码，帮助开发者快速打造精美的网页背景。',
                        subscription: '直接访问即可使用',
                        url: 'https://patterncraft.fun/'
                    },
                    {
                        name: 'Icon Library',
                        description: '直观的图标库资源聚合平台，精心分类整理了多个优质开源图标库，包括Ionicons、Iconoir、Tabler Icons、Feather等。支持按风格（圆角、尖角、像素、手绘）分类浏览，方便设计师快速找到合适的图标资源。',
                        subscription: '直接访问即可浏览',
                        url: 'https://iconlibrary.framer.website/'
                    },
                    {
                        name: 'Maple Mono',
                        description: '专为极客匠心打造的编程字体，优雅的等宽字体设计，提供手写风格斜体和圆角设计。支持可变字重、丰富的智能连字、内置 Nerd-Font 图标，中英文 2:1 等宽设计，可精细自定义 OpenType 功能。让代码阅读体验更加丝滑流畅，提升工作效率。',
                        subscription: '直接访问即可下载',
                        url: 'https://font.subf.dev/zh-cn/'
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
