# ✅ Vercel Source Pattern 语法修复

## 🔴 错误信息
```
Header at index 2 has invalid `source` pattern "/(.*\.(css|js))".
```

## 📊 问题分析

### 错误的语法 ❌
```json
{
  "source": "/(.*\\.(css|js))"
}
```

Vercel的 `source` 字段**不支持**复杂的正则表达式，特别是：
- ❌ `\.(extension)` - 点号转义的文件扩展名匹配
- ❌ `(option1|option2)` - 管道符的"或"逻辑
- ❌ 复杂的正则组合

### Vercel支持的模式 ✅

Vercel使用**路径匹配模式**（Path Pattern），类似于简化的正则表达式：

1. **通配符匹配**
   ```json
   "/path/*"       // 匹配单层
   "/path/(.*)"    // 匹配多层（包括子目录）
   ```

2. **参数匹配**
   ```json
   "/blog/:slug"   // 匹配 /blog/my-article
   ```

3. **简单正则**
   ```json
   "/(.*).html"    // 匹配所有.html文件
   ```

## ✅ 解决方案

### 修改前（错误）
```json
{
  "headers": [
    {
      "source": "/(.*\\.(css|js))",  // ❌ 不支持
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, must-revalidate"
        }
      ]
    },
    {
      "source": "/(.*\\.(jpg|jpeg|png|gif|ico|svg))",  // ❌ 不支持
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 修改后（正确）✅
```json
{
  "headers": [
    {
      "source": "/css/(.*)",  // ✅ 按目录匹配CSS
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, must-revalidate"
        }
      ]
    },
    {
      "source": "/js/(.*)",  // ✅ 按目录匹配JS
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, must-revalidate"
        }
      ]
    },
    {
      "source": "/assets/(.*)",  // ✅ 按目录匹配图片和字体
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*).html",  // ✅ 匹配所有HTML文件
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

## 🎯 方案优势

### 1. **更简单明了**
按目录结构匹配，一目了然：
- `/css/` → CSS文件
- `/js/` → JavaScript文件
- `/assets/` → 静态资源

### 2. **更符合最佳实践**
现代Web项目通常按文件类型组织目录结构，这种匹配方式更自然。

### 3. **更易维护**
- 不需要复杂的正则表达式
- 添加新规则很简单
- 不容易出错

### 4. **性能更好**
简单的路径匹配比复杂正则表达式更快。

## 📂 完整的缓存策略

### 当前配置说明

| 路径 | 缓存时间 | 说明 |
|------|----------|------|
| `/pages/*` | 0秒 | HTML页面立即验证更新 |
| `/data/*` | 5分钟 | JSON数据适度缓存 |
| `/css/*` | 1小时 | CSS样式短期缓存 |
| `/js/*` | 1小时 | JavaScript短期缓存 |
| `/assets/*` | 1年 | 图片字体长期缓存 |
| `/*.html` | 0秒 | 根目录HTML立即验证 |

### 为什么这样设计？

1. **HTML文件（0秒缓存）**
   - 是网站的入口
   - 包含对其他资源的引用
   - 需要立即反映更新

2. **CSS/JS文件（1小时缓存）**
   - 配合版本号使用（如 `?v=20251021`）
   - 短期缓存减少服务器负载
   - 更新时可以通过版本号强制刷新

3. **静态资源（1年缓存）**
   - 图片、字体等很少改动
   - 长期缓存大幅提升性能
   - 如需更新可以改文件名

## 🔍 Vercel Pattern 语法参考

### 基础模式

```json
// 1. 精确匹配
{
  "source": "/about"
}

// 2. 单层通配符
{
  "source": "/blog/*"  // 匹配 /blog/post1，不匹配 /blog/2024/post1
}

// 3. 多层通配符
{
  "source": "/blog/(.*)"  // 匹配 /blog/post1 和 /blog/2024/post1
}

// 4. 命名参数
{
  "source": "/blog/:year/:slug"
}

// 5. 文件扩展名
{
  "source": "/(.*).html"  // 匹配所有.html文件
}
```

### 组合示例

```json
{
  "headers": [
    {
      "source": "/:path*",  // 匹配所有路径
      "headers": [
        {
          "key": "X-Custom-Header",
          "value": "value"
        }
      ]
    },
    {
      "source": "/api/:path*",  // 匹配所有API路径
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache"
        }
      ]
    }
  ]
}
```

## ⚠️ 注意事项

### 1. 匹配优先级
Vercel按照配置文件中的**顺序**匹配，第一个匹配的规则生效。

**示例：**
```json
{
  "headers": [
    {
      "source": "/css/(.*)",  // 先匹配
      "headers": [{"key": "Cache-Control", "value": "max-age=3600"}]
    },
    {
      "source": "/:path*",  // 后匹配
      "headers": [{"key": "Cache-Control", "value": "max-age=0"}]
    }
  ]
}
```
访问 `/css/style.css` 会应用第一个规则（max-age=3600）。

### 2. 多个Headers可以叠加
同一个路径可以匹配多个规则，headers会合并。

### 3. 避免过于宽泛的匹配
```json
// ❌ 不推荐：太宽泛
{
  "source": "/:path*"
}

// ✅ 推荐：具体的路径
{
  "source": "/css/:file*"
}
```

## 🧪 测试配置

### 方法1: 使用Vercel CLI本地测试
```bash
# 安装Vercel CLI
npm i -g vercel

# 本地运行
vercel dev

# 访问并检查Response Headers
curl -I http://localhost:3000/css/style.css
```

### 方法2: 在线测试
部署后使用浏览器开发者工具：
1. 按F12打开开发者工具
2. 切换到Network标签
3. 刷新页面
4. 点击任意文件
5. 查看Response Headers中的Cache-Control

### 方法3: 使用curl测试生产环境
```bash
# 测试CSS文件
curl -I https://your-domain.vercel.app/css/blog.css

# 测试JS文件
curl -I https://your-domain.vercel.app/js/blog.js

# 测试图片文件
curl -I https://your-domain.vercel.app/assets/favicon.ico
```

预期输出：
```
HTTP/2 200
cache-control: public, max-age=3600, must-revalidate  ✅
content-type: text/css
...
```

## 📝 最终的 vercel.json

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

## 🚀 提交并部署

```bash
# 1. 查看修改
git diff vercel.json

# 2. 添加到暂存区
git add vercel.json

# 3. 提交
git commit -m "fix: 修复Vercel source pattern语法错误"

# 4. 推送
git push origin main

# 5. 等待Vercel自动部署（1-2分钟）
```

## ✅ 验证成功

部署完成后，访问你的网站并检查：

1. **没有部署错误** ✅
2. **网站正常访问** ✅
3. **CSS/JS正常加载** ✅
4. **缓存头正确应用** ✅

使用浏览器开发者工具验证：
```
Cache-Control: public, max-age=3600, must-revalidate
```

## 📚 参考资料

- [Vercel Headers 配置](https://vercel.com/docs/edge-network/headers)
- [Vercel Path Matching](https://vercel.com/docs/edge-network/routing)
- [Cache-Control 最佳实践](https://vercel.com/docs/edge-network/caching)

---

**修复时间**: 2025-10-21  
**问题类型**: Source Pattern 语法错误  
**解决方案**: 使用目录路径匹配替代复杂正则表达式  
**状态**: ✅ 已修复

