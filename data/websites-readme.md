# 知识库网站数据管理

## 概述

知识库页面采用卡片式导航设计，用于收集和展示您喜欢的网站链接。数据存储在 `data/websites.json` 文件中。

## 数据结构

```json
{
  "categories": [
    {
      "name": "分类名称",
      "icon": "分类图标（Emoji）",
      "websites": [
        {
          "name": "网站名称",
          "description": "网站简介",
          "subscription": "订阅方式",
          "url": "网站链接"
        }
      ]
    }
  ]
}
```

## 如何添加新网站

### 1. 添加到现有分类

在对应的分类下的 `websites` 数组中添加新对象：

```json
{
  "name": "新网站名称",
  "description": "详细的网站描述，介绍网站特色和内容",
  "subscription": "订阅方式说明",
  "url": "https://example.com"
}
```

### 2. 创建新分类

在 `categories` 数组中添加新的分类对象：

```json
{
  "name": "新分类名称",
  "icon": "🔥",
  "websites": [
    {
      "name": "网站名称",
      "description": "网站描述",
      "subscription": "订阅方式",
      "url": "https://example.com"
    }
  ]
}
```

## 可用的 Emoji 图标建议

- 🎮 Gaming（游戏）
- 📸 Photography（摄影）
- 🎵 Music（音乐）
- 📚 Reading（阅读）
- ✈️ Travel（旅行）
- 🌐 Web Development（Web开发）
- 🎨 Design（设计）
- ⚙️ DevOps（运维）
- 🤖 AI Security（AI安全）
- 💻 Programming（编程）
- 🎬 Film（电影）
- 🍳 Cooking（烹饪）
- 🏋️ Fitness（健身）
- 💰 Finance（金融）
- 🎓 Education（教育）
- 🔬 Science（科学）
- 🎪 Entertainment（娱乐）

## 字段说明

### name（必填）
网站的名称，会显示为卡片标题。

### description（必填）
网站的详细描述，建议包含：
- 网站的主要内容和特色
- 适合的人群
- 独特的价值点

### subscription（必填）
告诉用户如何订阅或访问，例如：
- "在其官网填写邮箱"
- "Substack上搜索"
- "免费注册即可"

### url（可选）
网站的链接地址。如果没有链接或不希望显示链接按钮，可以留空或设为空字符串。

## 示例：添加新网站

假设要在 Web Development 分类下添加一个新网站：

```json
{
  "name": "React Newsletter",
  "description": "专注于React生态系统的周刊，包含最新的React新闻、教程、库和工具推荐。适合React开发者保持技术更新。",
  "subscription": "在其官网填写邮箱",
  "url": "https://reactnewsletter.com/"
}
```

## 注意事项

1. **JSON 格式**：确保添加数据时保持正确的 JSON 格式，注意逗号和引号。
2. **字符转义**：如果描述中包含引号，需要使用 `\"` 转义。
3. **URL 格式**：确保 URL 以 `http://` 或 `https://` 开头。
4. **分类顺序**：分类会按照在数组中的顺序显示在页面上。
5. **网站编号**：每个分类下的网站会自动编号（1、2、3...）。

## 搜索功能

页面内置搜索功能，可以搜索：
- 分类名称
- 网站名称
- 网站描述
- 订阅信息

## 技术实现

- **数据文件**：`data/websites.json`
- **HTML**：`pages/knowledge.html`
- **样式**：`css/knowledge.css`
- **脚本**：`js/knowledge.js`

## 未来扩展

可以考虑添加的功能：
- 网站标签系统
- 收藏功能
- 分类折叠/展开
- 导出书签功能
- 网站访问统计

