# Traefik路由配置说明

## 概述

本项目已针对Dokploy平台的Traefik路由进行优化,支持多项目共存,避免路由冲突。

---

## 🔧 关键配置

### 1. 唯一标识符

所有Traefik标签使用`together-`前缀,确保不与其他项目冲突:
- Router: `together-web`, `together-web-secure`
- Middleware: `together-security`, `together-https-redirect`
- Service: `together-web`

### 2. 网络配置

```yaml
networks:
  blog-network:         # 应用内部网络
    driver: bridge
    # ✅ 让 Docker 自动生成网络名称
```

**说明**: Dokploy 会自动处理 Traefik 网络连接,无需手动配置外部网络。

### 3. 路由规则

#### HTTP路由 (端口80)
```yaml
traefik.http.routers.together-web.rule=Host(`171780.xyz`)
traefik.http.routers.together-web.entrypoints=web
```
自动重定向到HTTPS

#### HTTPS路由 (端口443)
```yaml
traefik.http.routers.together-web-secure.rule=Host(`171780.xyz`)
traefik.http.routers.together-web-secure.entrypoints=websecure
traefik.http.routers.together-web-secure.tls.certresolver=letsencrypt
```
自动获取Let's Encrypt证书

---

## 🚀 Dokploy部署步骤

### 步骤1: 创建Traefik网络(仅首次)

Dokploy 平台会自动管理网络,此步骤通常不需要手动执行。

### 步骤2: 设置环境变量

在Dokploy项目设置中添加:
```env
DOMAIN=171780.xyz
DB_NAME=together
DB_USER=together_user
DB_PASSWORD=your-secure-password
```

### 步骤3: 部署项目

Dokploy会自动:
1. 读取`docker-compose.yml`
2. 应用Traefik标签
3. 配置路由规则
4. 获取SSL证书

---

## 📝 Traefik标签说明

### 路由标签

| 标签 | 用途 |
|------|------|
| `traefik.enable=true` | 启用Traefik |
| `traefik.docker.network` | 指定网络 |
| `traefik.http.routers.<name>.rule` | 路由规则(域名) |
| `traefik.http.routers.<name>.entrypoints` | 入口点(web/websecure) |
| `traefik.http.routers.<name>.tls` | 启用TLS |

### 中间件标签

| 标签 | 用途 |
|------|------|
| `together-https-redirect` | HTTP→HTTPS重定向 |
| `together-security` | 安全头(HSTS, XSS等) |
| `together-www-redirect` | WWW→非WWW重定向 |

### 服务标签

| 标签 | 用途 |
|------|------|
| `traefik.http.services.<name>.loadbalancer.server.port` | 容器端口 |
| `traefik.http.services.<name>.loadbalancer.healthcheck` | 健康检查 |

---

## 🔒 安全特性

### 1. 强制HTTPS
- HTTP自动重定向到HTTPS
- HSTS头,有效期1年

### 2. 安全头
- `X-Frame-Options: DENY` (防点击劫持)
- `X-Content-Type-Options: nosniff` (防MINE嗅探)
- `X-XSS-Protection: 1; mode=block` (XSS保护)
- `Strict-Transport-Security` (HSTS)

### 3. 自动SSL证书
- Let's Encrypt自动续期
- 支持通配符证书(需DNS验证)

---

## 🌐 多域名配置

### 主域名
```yaml
Host(`171780.xyz`)
```

### WWW重定向
```yaml
Host(`www.171780.xyz`) → 重定向到 → https://171780.xyz
```

### 添加其他域名
在Traefik路由规则中使用`||`:
```yaml
traefik.http.routers.together-web-secure.rule=Host(`171780.xyz`) || Host(`other-domain.com`)
```

---

## 🔍 故障排除

### 问题1: 路由不生效

**检查**:
```bash
# 查看Traefik日志
docker logs traefik

# 验证网络连接
docker network inspect traefik-network

# 检查容器标签 (使用实际容器名)
docker inspect [container-name] | grep traefik
```

**解决**:
- 确认容器已正常启动
- 验证域名DNS已指向服务器
- 检查Traefik配置文件

### 问题2: SSL证书获取失败

**检查**:
```bash
# 查看证书状态
docker exec traefik cat /letsencrypt/acme.json
```

**解决**:
- 确认端口80和443开放
- 验证域名解析正确
- 检查Let's Encrypt速率限制

### 问题3: 路由冲突

**症状**: 访问域名时显示错误的项目

**解决**:
1. 确保Router名称唯一(`together-web`)
2. 检查域名规则是否重复
3. 使用优先级标签:
   ```yaml
   traefik.http.routers.together-web-secure.priority=100
   ```

---

## 📊 监控与日志

### 查看路由状态

访问Traefik Dashboard (如果启用):
```
https://traefik.your-domain.com/dashboard/
```

### 实时日志

```bash
# Traefik日志
docker logs -f traefik

# 应用日志 (使用实际容器名)
docker logs -f [container-name]
```

---

## 🎯 最佳实践

### 1. 命名规范
- 所有label使用项目前缀(`together-`)
- Router/Service/Middleware保持一致命名

### 2. 网络隔离
- 内部服务(数据库)仅连接内部网络
- Web服务连接两个网络(内部+Traefik)

### 3. 健康检查
- 配置合理的检查间隔
- 设置超时和重试次数

### 4. 资源限制
```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
```

---

## 📚 参考资源

- [Traefik文档](https://doc.traefik.io/traefik/)
- [Dokploy文档](https://dokploy.com/docs)
- [Let's Encrypt](https://letsencrypt.org/)

---

**版本**: v1.0  
**最后更新**: 2025-11-29  
**适用于**: Dokploy + Traefik 2.x+
