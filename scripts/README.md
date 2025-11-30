# 部署辅助脚本使用指南

本目录包含两个辅助脚本，用于优化 Dokploy 部署流程并解决网络端点问题。

## 📁 脚本清单

### 1. `pre-deploy-check.sh` - 部署前检查脚本

**用途**：在部署前验证 Docker 环境和配置文件是否正确。

**使用方法**：
```bash
# 在项目根目录执行
./scripts/pre-deploy-check.sh
```

**检查项目**：
- ✓ Docker 和 Docker Compose 安装
- ✓ docker-compose.yml 语法验证
- ✓ 环境变量完整性
- ✓ 数据库密码安全性
- ✓ 网络和容器冲突
- ✓ 磁盘空间充足性

**示例输出**：
```
========================================
TOGETHER Blog - Pre-Deployment Check
========================================

ℹ Checking Docker installation...
✓ Docker found: 24.0.7
✓ Docker daemon is running
✓ docker-compose.yml syntax is valid
✓ .env file found
✓ Database password is configured
✓ dokploy-network exists

========================================
All critical checks passed!
========================================
```

---

### 2. `network-cleanup.sh` - 网络清理脚本

**用途**：清理 Docker 网络端点残留，解决 "endpoint not found" 错误。

**使用方法**：
```bash
# 清理指定项目的网络
./scripts/network-cleanup.sh together-blog-5rcstl

# 或使用默认项目名
./scripts/network-cleanup.sh
```

**执行步骤**：
1. 查找并停止项目相关的所有容器
2. 删除已停止的容器
3. 清理未使用的 Docker 网络
4. 验证清理结果

**示例输出**：
```
========================================
TOGETHER Blog - Network Cleanup
========================================

ℹ Step 1: Finding containers for project: together-blog-5rcstl...
ℹ Step 2: Stopping running containers...
✓ All containers stopped
ℹ Step 3: Removing stopped containers...
✓ All stopped containers removed
ℹ Step 4: Pruning unused Docker networks...
✓ Unused networks pruned

========================================
Cleanup completed!
========================================
```

---

## 🔧 常见使用场景

### 场景 1: 首次部署

直接在 Dokploy 面板部署即可，无需运行脚本。

---

### 场景 2: 遇到网络端点错误

**错误信息**：
```
Error: endpoint not found
```

**解决方法**：
```bash
# 1. SSH 连接到服务器
ssh user@your-server

# 2. 进入项目目录
cd /path/to/project

# 3. 运行网络清理脚本
./scripts/network-cleanup.sh together-blog-5rcstl

# 4. 回到 Dokploy 面板重新部署
```

---

### 场景 3: 部署前验证环境

```bash
# 在部署前运行检查脚本
./scripts/pre-deploy-check.sh

# 如果所有检查通过，继续部署
# 如果有错误，根据提示修复后再部署
```

---

## ⚙️ 环境要求

- **操作系统**：Linux
- **Shell**：Bash 4.0+
- **依赖命令**：
  - `docker`
  - `docker compose`
  - `grep`, `awk`, `sed` (通常预装)

---

## 🔐 权限说明

脚本需要以下权限：
- Docker 命令执行权限（通常需要将用户添加到 `docker` 组）
- 读取项目配置文件权限

**添加用户到 docker 组**：
```bash
sudo usermod -aG docker $USER
# 退出并重新登录生效
```

---

## 📝 注意事项

1. **network-cleanup.sh** 会停止并删除容器，请确认没有重要数据未备份
2. 脚本会询问确认，输入 `y` 继续执行
3. 如果在 Dokploy 平台使用，可能需要通过 SSH 连接服务器

---

## 🐛 故障排除

### 问题：脚本无法执行

**解决方法**：
```bash
# 添加执行权限
chmod +x scripts/pre-deploy-check.sh
chmod +x scripts/network-cleanup.sh
```

### 问题：Docker 命令权限不足

**解决方法**：
```bash
# 方式 1: 添加用户到 docker 组
sudo usermod -aG docker $USER

# 方式 2: 使用 sudo 执行脚本
sudo ./scripts/network-cleanup.sh
```

---

## 📚 相关文档

- [Dokploy 部署完整指南](../docs/dokploy-deploy.md)
- [故障排除文档](../docs/dokploy-deploy.md#故障排除)

---

**版本**：v1.0  
**最后更新**：2025-11-29
