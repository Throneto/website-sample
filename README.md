# Frontend - VALARZAI

## 📁 项目结构

```
frontend/
├── index.html           # 主页
├── pages/               # 其他页面
│   ├── hobby.html      # 兴趣爱好知识库
│   └── niche.html      # 专业领域知识库
├── css/                 # 样式文件
│   ├── style.css       # 主样式
│   └── knowledge.css   # 知识库样式
├── js/                  # JavaScript文件
│   ├── galaxy.js       # 星云背景动画
│   ├── fluid.js        # 流体鼠标特效
│   ├── nav.js          # 导航交互
│   └── knowledge.js    # 知识库功能
└── assets/              # 静态资源（图片等）
```

## 🚀 使用方法

### 开发环境

使用任意HTTP服务器启动：

```bash
# 使用 Python
python -m http.server 3000

# 使用 Node.js (http-server)
npx http-server -p 3000

# 使用 VS Code Live Server
右键 index.html → Open with Live Server
```

访问：`http://localhost:3000`

## 📄 页面说明

- **index.html** - 首页，展示Hero区域和各栏目介绍
- **pages/hobby.html** - 兴趣爱好知识库（游戏、摄影、音乐等）
- **pages/niche.html** - 专业知识库（Web开发、AI、设计等）

## 🎨 特性

- ✨ 星云背景动画
- 💧 WebGL流体鼠标特效
- 🔍 实时搜索和筛选
- 📱 完全响应式设计
- 🎯 玻璃态UI设计
- ⌨️ 键盘快捷键支持

## 🔗 API集成

后端API地址配置在 `js/api.js` 中（待创建）

默认：`http://localhost:5000/api`

