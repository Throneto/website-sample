# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.1.0] - 2025-11-29

### Fixed
- 修复 Dokploy 平台重新部署时的 "endpoint not found" 网络端点错误
- 解决 Docker 网络状态不一致导致的部署失败问题

### Changed
- **[BREAKING]** 简化网络配置：移除 `together-network-v3`，统一使用 `dokploy-network`
- 优化 Docker Compose 配置，添加显式容器命名
- 增强健康检查配置，添加启动宽限期（`start_period`）
- 优化服务依赖管理，Web 服务等待数据库健康检查通过后再启动

### Added
- 添加 Nginx 健康检查专用端点 `/health`，提高健康检查效率
- 新增 `scripts/network-cleanup.sh` 网络清理脚本，自动解决网络端点冲突
- 新增 `scripts/pre-deploy-check.sh` 部署前检查脚本，验证环境和配置
- 新增 `scripts/README.md` 脚本使用说明文档
- 添加项目标识标签（`com.together.project`, `com.together.version`）

### Improved
- 扩展 `docs/dokploy-deploy.md` 故障排除文档，添加自动化脚本使用说明
- 添加部署最佳实践和预防措施说明
- 优化 Traefik 健康检查配置，使用专用 `/health` 端点

---

## [1.0.0] - 2025-11-28

### Added
- 初始版本发布
- Docker Compose 支持
- Nginx 静态网站服务
- PostgreSQL 数据库支持
- Traefik 反向代理集成
- 完整的 Dokploy 部署文档
