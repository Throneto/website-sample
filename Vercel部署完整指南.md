# Vercel部署完整指南

> 本指南整合了Vercel部署的所有配置、故障排除和优化方案。

## 📋 目录

- [快速部署](#快速部署)
- [配置说明](#配置说明)
- [缓存策略](#缓存策略)
- [故障排除](#故障排除)
- [性能优化](#性能优化)
- [最佳实践](#最佳实践)

---

## 🚀 快速部署

### 第一次设置

#### 步骤 1: 准备 GitHub 仓库

```bash
# 1. 初始化 Git（如果还没有）
git init
git add .
git commit -m "Initial commit"

# 2. 创建 GitHub 仓库
# 访问 https://github.com/new

# 3. 关联远程仓库
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

#### 步骤 2: 连接 Vercel

1. 访问 https://vercel.com/new
2. 点击 "Import Project"
3. 选择 "Import Git Repository"
4. 选择您的 GitHub 仓库
5. 点击 "Deploy"（无需修改配置）

✅ **完成！** 您的网站已经部署成功！

#### 步骤 3: 配置自动部署

Vercel 会自动：
- 检测 GitHub 推送
- 拉取最新代码
- 构建网站
- 部署到生产环境

---

## ⚙️ 配置说明

### vercel.json 配置文件

项目根目录的 `vercel.json` 文件配置了Vercel的行为。

#### 推荐配置

```json
{
  "headers": [
    {
      "source": "/pages/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/data/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=300, s-maxage=600"
        }
      ]
    },
    {
      "source": "/css/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, must-revalidate"
        }
      ]
    },
    {
      "source": "/js/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, must-revalidate"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*).html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ],
  "cleanUrls": true,
  "trailingSlash": false
}
```

### 配置选项说明

#### headers - HTTP响应头

控制资源的缓存行为和安全策略。

```json
{
  "headers": [
    {
      "source": "/路径匹配模式",
      "headers": [
        {
          "key": "头名称",
          "value": "头值"
        }
      ]
    }
  ]
}
```

#### cleanUrls - 清理URL

```json
{
  "cleanUrls": true
}
```

**效果：**
- `/page.html` → `/page`
- `/about.html` → `/about`

#### trailingSlash - 尾部斜杠处理

```json
{
  "trailingSlash": false
}
```

**效果：**
- `true`: `/page` → `/page/`
- `false`: `/page/` → `/page`

### 路径匹配模式

Vercel 支持以下模式：

```json
// 1. 精确匹配
{
  "source": "/about"
}

// 2. 单层通配符
{
  "source": "/blog/*"  // 匹配 /blog/post1
}

// 3. 多层通配符
{
  "source": "/blog/(.*)"  // 匹配 /blog/post1 和 /blog/2024/post1
}

// 4. 文件扩展名
{
  "source": "/(.*).html"  // 匹配所有.html文件
}

// 5. 目录匹配
{
  "source": "/css/(.*)"  // 匹配 /css/ 目录下所有文件
}
```

### 常见配置错误

#### ❌ 错误：使用复杂正则表达式

```json
{
  "source": "/(.*\\.(css|js))"  // ❌ 不支持
}
```

#### ✅ 正确：使用目录路径

```json
{
  "source": "/css/(.*)"  // ✅ 推荐
}
```

#### ❌ 错误：同时使用 routes 和 headers

```json
{
  "routes": [...],    // ❌ 旧配置
  "headers": [...]    // ❌ 冲突
}
```

#### ✅ 正确：只使用现代配置

```json
{
  "headers": [...],   // ✅ 推荐
  "cleanUrls": true
}
```

---

## 🗄️ 缓存策略

### 缓存时间建议

| 文件类型 | 推荐缓存时间 | 原因 |
|---------|-------------|------|
| HTML | 0秒或5分钟 | 入口文件，需要立即更新 |
| CSS/JS | 1小时到1天 | 配合版本号使用 |
| 图片/字体 | 1个月到1年 | 很少改动 |
| JSON数据 | 5-30分钟 | 根据更新频率调整 |

### Cache-Control 详解

```
Cache-Control: public, max-age=3600, must-revalidate
```

**参数说明：**
- `public`: 可以被任何缓存存储
- `max-age=3600`: 缓存1小时（3600秒）
- `must-revalidate`: 过期后必须重新验证
- `immutable`: 永不改变（适用于静态资源）
- `no-cache`: 使用前必须验证
- `no-store`: 完全禁止缓存

### 版本号策略

配合版本号使用缓存：

```html
<!-- HTML 中引用资源时添加版本号 -->
<link rel="stylesheet" href="/css/style.css?v=20251021">
<script src="/js/app.js?v=c65fe41"></script>
```

**版本号格式：**
- 时间戳：`?v=20251021` 或 `?v=202510211430`
- Git哈希：`?v=c65fe41`
- 语义化版本：`?v=1.2.3`

### 缓存问题解决

#### 问题：CSS/JS 更新但浏览器看不到

**原因：** 缓存时间过长

**解决方案：**

1. **更新版本号**（推荐）
```html
<link rel="stylesheet" href="/css/blog.css?v=20251021-new">
```

2. **减少缓存时间**
```json
{
  "source": "/css/(.*)",
  "headers": [
    {
      "key": "Cache-Control",
      "value": "public, max-age=3600, must-revalidate"  // 1小时
    }
  ]
}
```

3. **强制刷新**
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Command + Shift + R`

---

## 🔧 故障排除

### 部署未更新

#### 症状
本地更新了代码，但Vercel网站显示旧内容。

#### 诊断步骤

**1. 确认 Git 提交和推送**

```bash
# 检查Git状态
git status

# 查看最近的提交
git log --oneline -5

# 推送到远程
git push origin main
```

**2. 检查 Vercel 部署状态**

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到你的项目
3. 查看 **Deployments** 页面
4. 确认：
   - ✅ 部署状态为 "Ready"
   - ✅ 提交哈希是最新的
   - ✅ 部署分支是 `main`

**3. 清除缓存**

**方法一：强制刷新（推荐）**
- Windows/Linux: `Ctrl + Shift + R` 或 `Ctrl + F5`
- Mac: `Command + Shift + R`

**方法二：隐私窗口测试**
- Chrome/Edge: `Ctrl + Shift + N`
- Firefox: `Ctrl + Shift + P`

**方法三：开发者工具**
1. 按 `F12` 打开开发者工具
2. 右键点击刷新按钮
3. 选择 "清空缓存并硬性重新加载"

**4. 验证部署**

**直接访问 CSS 文件**
```
https://your-domain.vercel.app/css/blog.css?v=20251021
```

**检查 Network 请求**
1. 按 `F12` → Network 标签
2. 勾选 "Disable cache"
3. 刷新页面
4. 查看 `blog.css` 请求
5. 检查 Response Headers 中的 `Cache-Control`

**使用部署特定URL**
1. 在 Vercel Dashboard 中找到最新部署
2. 复制部署特定的 URL（包含哈希）
3. 在隐私窗口中打开该 URL
4. 如果显示正确，说明部署成功，是缓存问题

**5. 强制重新部署**

在 Vercel Dashboard 中：
1. 找到最新的部署
2. 点击右上角的 "..." 菜单
3. 选择 "Redeploy"
4. **取消勾选** "Use existing Build Cache"
5. 点击 "Redeploy"

### 部署失败

#### 常见错误

**错误 1: Source Pattern 语法错误**

```
Header at index X has invalid `source` pattern
```

**原因：** 使用了不支持的正则表达式

**解决：** 使用目录路径匹配
```json
// ❌ 错误
"source": "/(.*\\.(css|js))"

// ✅ 正确
"source": "/css/(.*)"
```

**错误 2: routes 和 headers 冲突**

```
If `headers` are used, then `routes` cannot be present.
```

**原因：** 不能同时使用旧配置（routes）和新配置（headers）

**解决：** 删除 `routes` 和 `builds` 配置
```json
// 删除这些
{
  "version": 2,       // 删除
  "builds": [...],    // 删除
  "routes": [...]     // 删除
}

// 只保留现代配置
{
  "headers": [...],
  "cleanUrls": true,
  "trailingSlash": false
}
```

**错误 3: 文件 404**

**症状：** 控制台显示 `Failed to load resource: 404`

**原因：** 文件路径不正确

**解决：**
1. 检查文件是否存在
2. 验证路径大小写
3. 确认相对路径正确

### 文件加载问题

#### CSS/JS 加载失败

**症状：** 
- 控制台显示 404 错误
- 或 MIME 类型错误

**检查清单：**
- [ ] 文件路径是否正确
- [ ] 文件是否已提交到 Git
- [ ] vercel.json 配置是否正确
- [ ] 浏览器缓存是否已清除

**解决方案：**

1. **验证文件存在**
```bash
# 检查文件
ls css/blog.css
```

2. **检查 Git 状态**
```bash
git status
git log --name-only -1
```

3. **直接访问文件**
```
https://your-domain.vercel.app/css/blog.css
```

#### MIME 类型错误

**症状：**
```
Refused to apply style ... MIME type 'text/html' is not a supported stylesheet MIME type
```

**原因：** 返回的是 HTML 而不是 CSS（通常是 404 页面）

**解决：**
1. 确认文件路径正确
2. 检查文件是否存在
3. 验证 vercel.json 路由配置

### Edge 缓存问题

#### Vercel显示"Ready"但内容是旧的

**原因：** Vercel Edge CDN 缓存未更新

**解决方案：**

1. **等待 5-10 分钟**（CDN 缓存 TTL）

2. **访问部署特定URL**
```
https://your-project-abc123.vercel.app
```

3. **清除 CDN 缓存**
```bash
# 使用 Vercel CLI
vercel env pull
curl -X PURGE https://your-domain.vercel.app/css/blog.css
```

4. **重新部署**（不使用缓存）

---

## 🚄 性能优化

### 构建设置

在 Vercel Dashboard → Settings → General:

```
Framework Preset: Other（静态网站）
Build Command: 留空
Output Directory: .
Install Command: 留空
```

### 环境变量

可以在 Vercel Dashboard 配置环境变量：

1. Settings → Environment Variables
2. 添加变量
3. 选择应用环境（Production/Preview/Development）

### 自动优化

Vercel 自动提供：
- ✅ HTTP/2 支持
- ✅ Gzip/Brotli 压缩
- ✅ CDN 加速
- ✅ 自动 HTTPS
- ✅ DDoS 防护

### 性能监控

在 Vercel Dashboard 可以查看：
- 部署历史
- 访问统计
- 性能分析
- 错误日志

### 自定义域名

1. Vercel Dashboard → Settings → Domains
2. 添加自定义域名
3. 配置 DNS 记录：
```
CNAME: your-domain.com → cname.vercel-dns.com
```

---

## 💡 最佳实践

### 1. 合理的缓存策略

```json
{
  "headers": [
    {
      "source": "/(.*).html",
      "headers": [
        {"key": "Cache-Control", "value": "public, max-age=0, must-revalidate"}
      ]
    },
    {
      "source": "/css/(.*)",
      "headers": [
        {"key": "Cache-Control", "value": "public, max-age=3600, must-revalidate"}
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {"key": "Cache-Control", "value": "public, max-age=31536000, immutable"}
      ]
    }
  ]
}
```

### 2. 使用版本号

```html
<link rel="stylesheet" href="/css/style.css?v=20251021">
```

### 3. 配置 CI/CD

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### 4. 部署前检查

```bash
# 本地验证 JSON 格式
node -e "console.log(JSON.parse(require('fs').readFileSync('vercel.json', 'utf8')))"

# 使用 Vercel CLI 本地预览
vercel dev

# 检查 Git 状态
git status
```

### 5. 监控部署

1. 启用 Vercel 通知
2. 集成 Slack/Discord
3. 设置邮件提醒
4. 定期检查部署日志

### 6. 安全头设置

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## 📊 诊断工具

### 检查清单

部署前请确认：

- [ ] Git 提交已推送到 GitHub
- [ ] Vercel 部署状态为 "Ready"
- [ ] 部署的提交哈希是最新的
- [ ] vercel.json 配置正确
- [ ] 文件路径正确
- [ ] 版本号已更新

部署后请验证：

- [ ] 已清除浏览器缓存（硬刷新）
- [ ] 在隐私窗口测试过
- [ ] 直接访问资源 URL 验证内容
- [ ] 检查 Network 标签中的缓存状态
- [ ] 等待了 5-10 分钟（CDN 传播）
- [ ] 尝试了部署特定 URL

### 使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 本地预览
vercel dev

# 查看部署列表
vercel ls

# 查看部署日志
vercel logs <deployment-url>

# 手动部署
vercel --prod
```

### 浏览器诊断

**控制台检查：**
```javascript
// 查看缓存信息
window.caches.keys().then(console.log);

// 查看 localStorage
console.log(localStorage);

// 查看已加载的资源
console.log(performance.getEntriesByType("resource"));
```

---

## 📚 参考资料

### 官方文档

- [Vercel 配置文档](https://vercel.com/docs/project-configuration)
- [Headers 配置](https://vercel.com/docs/edge-network/headers)
- [Cache-Control 指南](https://vercel.com/docs/edge-network/caching)
- [路径匹配](https://vercel.com/docs/edge-network/routing)

### 工具资源

- [Vercel CLI](https://vercel.com/docs/cli)
- [Git 教程](https://git-scm.com/book/zh/v2)
- [JSONLint](https://jsonlint.com/) - JSON 验证工具

---

## 🆘 需要帮助？

如果以上方法都无法解决问题，请提供以下信息：

1. **Vercel 部署 URL**（包括部署特定 URL）
2. **浏览器控制台截图**（Console + Network 标签）
3. **Vercel 部署日志**（如果有错误）
4. **期望行为 vs 实际行为**
5. **问题复现步骤**

### 联系支持

- Vercel Support: https://vercel.com/support
- GitHub Issues: 在你的仓库创建 issue
- Vercel 社区: https://github.com/vercel/vercel/discussions

---

## 🎉 总结

Vercel 部署的关键要点：

1. ✅ 正确配置 `vercel.json`
2. ✅ 使用合理的缓存策略
3. ✅ 配合版本号管理资源
4. ✅ 定期检查部署状态
5. ✅ 了解缓存机制
6. ✅ 掌握故障排除方法

遵循本指南，您的网站将获得：
- 🚀 快速的部署流程
- ⚡ 优异的访问性能
- 🔒 可靠的安全保障
- 💰 零成本的托管服务

**开始部署您的网站吧！** 🎊

---

**文档版本**: v2.0  
**最后更新**: 2025-10-21  
**适用平台**: Vercel Platform

