# TOGETHER - 前端网页模板

一个现代化的中文前端网页模板，采用玻璃态设计风格，支持响应式布局和动态交互效果。

## 🌟 特性

- ✨ **现代设计** - 玻璃态UI设计，渐变色彩搭配
- 🌌 **动态背景** - 星云背景动画和WebGL流体特效
- 📱 **响应式布局** - 完美适配桌面端和移动端
- 🔍 **智能搜索** - 实时搜索和分类筛选功能
- ⚡ **性能优化** - 懒加载、代码分割、缓存优化
- 🎯 **SEO友好** - 完整的元数据和结构化数据
- 🌐 **多语言支持** - 中文界面，国际化准备

## 📁 项目结构

```
website sample/
├── index.html                    # 首页
├── pages/                        # 页面目录
│   ├── knowledge.html           # 知识库页面
│   ├── development.html         # 开发地带页面
│   ├── blog.html               # 博客页面
│   ├── admin.html              # 后台管理页面
│   └── about.html              # 关于页面
├── posts/                       # 📝 Markdown 博客文章
│   ├── example-tech-article.md
│   ├── example-design-article.md
│   └── example-life-article.md
├── data/                        # 📊 数据文件
│   ├── articles.json           # 博客文章数据
│   └── categories.json         # 分类数据
├── tools/                       # 🛠️ 工具脚本
│   ├── md-to-json.js           # Markdown 转 JSON 工具
│   ├── deploy.js               # 一键部署脚本
│   ├── backup.js               # 备份管理工具
│   └── README.md               # 工具使用说明
├── backups/                     # 💾 自动备份目录
├── css/                         # 样式文件
│   ├── style.css               # 主样式文件
│   ├── blog.css                # 博客页面样式
│   ├── knowledge.css           # 知识库页面样式
│   └── development.css         # 开发地带页面样式
├── js/                          # JavaScript文件
│   ├── nav.js                  # 导航交互脚本
│   ├── api-service.js          # API服务脚本
│   ├── blog.js                 # 博客页面脚本
│   ├── fluid.js                # 流体动画效果
│   ├── galaxy.js               # 星云背景动画
│   └── performance-utils.js    # 性能优化工具
├── assets/                      # 静态资源
│   └── favicon.ico             # 网站图标
├── package.json                 # Node.js 项目配置
├── vercel.json                  # Vercel 部署配置
├── .gitignore                   # Git 忽略文件
├── 404.html                     # 404错误页面
├── 50x.html                     # 服务器错误页面
├── privacy-policy.html          # 隐私政策
├── terms-of-service.html        # 服务条款
├── sitemap.xml                  # 网站地图
├── robots.txt                   # 搜索引擎规则
├── nginx.conf                   # Nginx配置文件
├── Dockerfile                   # Docker配置文件
├── QUICK_START.md               # 📖 快速开始指南
├── README_WORKFLOW.md           # 📖 完整工作流程
├── BLOG_IMPORT_GUIDE.md         # 📖 博客导入指南
├── DEPLOYMENT_SUMMARY.md        # 📖 部署方案总结
└── README.md                    # 项目说明文档
```

## 📝 博客系统

### Markdown 博客工作流程

本项目支持使用 Markdown 编写博客文章，通过 Node.js 工具转换为 JSON，然后自动部署到 Vercel。

#### 快速开始

```bash
# 1. 安装 Node.js (v16+)
# 下载: https://nodejs.org/

# 2. 创建新文章
# 在 posts/ 目录创建 .md 文件

# 3. 一键部署
npm run deploy
```

#### 工作流程

```
本地编写 Markdown → 转换为 JSON → Git 推送 → Vercel 自动部署
```

#### 详细文档

- **[快速开始指南](QUICK_START.md)** - 5分钟完成设置
- **[完整工作流程](README_WORKFLOW.md)** - 详细使用说明
- **[导入指南](BLOG_IMPORT_GUIDE.md)** - Markdown 格式和导入方法
- **[部署总结](DEPLOYMENT_SUMMARY.md)** - 方案可行性分析

#### 可用命令

```bash
npm run convert      # 转换 Markdown 为 JSON
npm run deploy       # 一键部署（转换+提交+推送）
npm run backup       # 创建备份
npm run backup:list  # 列出所有备份
npm run backup:clean # 清理旧备份
```

#### 示例文章

项目已包含三篇示例文章，位于 `posts/` 目录：
- **技术类**: Web性能优化实战指南
- **设计类**: 2025年UI设计趋势展望
- **生活类**: 程序员的健康指南

---

## 🚀 快速开始

### 本地开发

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd website-sample
   ```

2. **启动本地服务器**
   ```bash
   # 使用 Python
   python -m http.server 3000
   
   # 使用 Node.js (http-server)
   npx http-server -p 3000
   
   # 使用 VS Code Live Server
   # 右键 index.html → Open with Live Server
   ```

3. **访问网站**
   ```
   http://localhost:3000
   ```

### Docker 部署

1. **构建镜像**
   ```bash
   docker build -t together-website .
   ```

2. **运行容器**
   ```bash
   docker run -d -p 80:80 --name together-site together-website
   ```

3. **访问网站**
   ```
   http://localhost
   ```

## 📄 页面说明

### 首页 (index.html)
- Hero区域展示品牌标识和主要介绍
- 知识库、开发地带、博客、关于四个功能模块预览
- 响应式卡片布局，支持悬停动画效果

### 知识库 (pages/knowledge.html)
- 精选技术文档和学习资源展示
- 支持分类筛选和实时搜索
- 卡片式布局，支持外部链接跳转

### 开发地带 (pages/development.html)
- 项目展示和技术实践案例
- 项目状态管理和技术栈标签
- 支持GitHub链接和在线演示

### 博客 (pages/blog.html)
- 📝 Markdown 文件管理，轻松编写博客
- 🔄 本地转换为 JSON，一键部署
- 🎯 文章列表展示和分类管理
- 🔍 支持按日期排序和标签筛选
- 🎨 响应式文章卡片布局
- ⭐ 精选文章突出显示

### 关于 (pages/about.html)
- 个人介绍和技能展示
- 项目案例和联系方式
- 社交链接和简历信息

## 🎨 设计系统

### 色彩方案
- **主色调**: 青色 (#00f3ff)
- **辅助色**: 紫色 (#7b2cbf)
- **强调色**: 粉色 (#ff006e)
- **背景色**: 黑色 (#000000)
- **文字色**: 白色 (#ffffff) / 灰色 (#a0a0a0)

### 字体系统
- **主字体**: Inter, -apple-system, BlinkMacSystemFont
- **中文字体**: PingFang SC, Hiragino Sans GB, Microsoft YaHei
- **字体大小**: 响应式缩放，支持移动端优化

### 组件库
- **玻璃态卡片**: 半透明背景，毛玻璃效果
- **渐变按钮**: 多色渐变，悬停动画
- **搜索框**: 实时搜索，防抖优化
- **导航栏**: 固定定位，滚动效果
- **加载动画**: 骨架屏和旋转加载器

## ⚙️ 配置说明

### API 配置
API服务地址在 `js/api-service.js` 中配置：
```javascript
// 生产环境
this.baseURL = 'https://api.171780.xyz/api';
// 开发环境
this.baseURL = 'http://localhost:5000/api';
```

### Nginx 配置
- 支持静态文件缓存
- 安全头设置
- 错误页面处理
- 域名配置：171780.xyz

### SEO 配置
- 完整的meta标签设置
- Open Graph和Twitter卡片支持
- 结构化数据标记
- 网站地图和robots.txt

## 🔧 自定义指南

### 修改品牌信息
1. 更新 `index.html` 中的品牌名称
2. 修改各页面的标题和描述
3. 更新 `sitemap.xml` 中的域名

### 添加新页面
1. 在 `pages/` 目录创建HTML文件
2. 更新导航菜单
3. 添加对应的CSS样式
4. 更新 `sitemap.xml`

### 修改样式主题
1. 编辑 `css/style.css` 中的CSS变量
2. 调整色彩方案和字体设置
3. 修改组件样式和动画效果

## 📱 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- 移动端浏览器

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 📞 联系方式

- **网站**: https://171780.xyz
- **邮箱**: contact@171780.xyz
- **GitHub**: [项目地址]

## 🆕 最新更新

### v2.0 - 博客系统

- ✅ 支持 Markdown 文章编写
- ✅ Node.js 转换工具（优化版）
- ✅ 一键部署脚本
- ✅ 自动备份功能
- ✅ Vercel 部署配置
- ✅ 完整文档和示例

---

**TOGETHER** - 用热情和技术构建的现代化网页模板

💡 **开始使用博客系统？** 查看 [QUICK_START.md](QUICK_START.md)