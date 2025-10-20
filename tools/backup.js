/**
 * 备份管理工具
 * 用于管理 articles.json 的备份
 * 
 * 使用方法：
 * node tools/backup.js create  - 创建备份
 * node tools/backup.js list    - 列出所有备份
 * node tools/backup.js restore <filename> - 恢复备份
 * node tools/backup.js clean   - 清理旧备份（保留最近10个）
 */

const fs = require('fs');
const path = require('path');

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
};

class BackupManager {
    constructor() {
        this.rootDir = path.join(__dirname, '..');
        this.backupDir = path.join(this.rootDir, 'backups');
        this.articlesPath = path.join(this.rootDir, 'data/articles.json');
    }

    /**
     * 创建备份
     */
    create() {
        console.log(`\n${colors.cyan}创建备份...${colors.reset}\n`);

        if (!fs.existsSync(this.articlesPath)) {
            console.log(`${colors.red}✗ 找不到 articles.json${colors.reset}\n`);
            return;
        }

        // 确保备份目录存在
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }

        // 生成备份文件名
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const backupPath = path.join(this.backupDir, `articles-${timestamp}.json`);

        // 复制文件
        fs.copyFileSync(this.articlesPath, backupPath);

        // 获取文件大小
        const stats = fs.statSync(backupPath);
        const sizeKB = (stats.size / 1024).toFixed(2);

        console.log(`${colors.green}✓ 备份创建成功${colors.reset}`);
        console.log(`  ${colors.bright}文件名:${colors.reset} ${path.basename(backupPath)}`);
        console.log(`  ${colors.bright}大小:${colors.reset} ${sizeKB} KB`);
        console.log(`  ${colors.bright}位置:${colors.reset} ${backupPath}\n`);
    }

    /**
     * 列出所有备份
     */
    list() {
        console.log(`\n${colors.cyan}备份列表:${colors.reset}\n`);

        if (!fs.existsSync(this.backupDir)) {
            console.log(`${colors.gray}暂无备份${colors.reset}\n`);
            return;
        }

        const files = fs.readdirSync(this.backupDir)
            .filter(file => file.startsWith('articles-') && file.endsWith('.json'))
            .map(file => {
                const filePath = path.join(this.backupDir, file);
                const stats = fs.statSync(filePath);
                return {
                    name: file,
                    path: filePath,
                    size: stats.size,
                    mtime: stats.mtime
                };
            })
            .sort((a, b) => b.mtime - a.mtime);

        if (files.length === 0) {
            console.log(`${colors.gray}暂无备份${colors.reset}\n`);
            return;
        }

        files.forEach((file, index) => {
            const sizeKB = (file.size / 1024).toFixed(2);
            const date = file.mtime.toLocaleString('zh-CN');
            console.log(`${colors.bright}${index + 1}.${colors.reset} ${file.name}`);
            console.log(`   ${colors.gray}时间: ${date}  |  大小: ${sizeKB} KB${colors.reset}`);
        });

        console.log(`\n${colors.gray}总计: ${files.length} 个备份${colors.reset}\n`);
    }

    /**
     * 恢复备份
     */
    restore(filename) {
        console.log(`\n${colors.cyan}恢复备份...${colors.reset}\n`);

        if (!filename) {
            console.log(`${colors.red}✗ 请指定备份文件名${colors.reset}`);
            console.log(`${colors.gray}使用方法: node tools/backup.js restore <filename>${colors.reset}\n`);
            return;
        }

        const backupPath = path.join(this.backupDir, filename);

        if (!fs.existsSync(backupPath)) {
            console.log(`${colors.red}✗ 找不到备份文件: ${filename}${colors.reset}\n`);
            return;
        }

        // 先备份当前文件
        if (fs.existsSync(this.articlesPath)) {
            const beforeRestore = path.join(this.backupDir, `before-restore-${Date.now()}.json`);
            fs.copyFileSync(this.articlesPath, beforeRestore);
            console.log(`${colors.gray}已备份当前文件为: ${path.basename(beforeRestore)}${colors.reset}\n`);
        }

        // 恢复备份
        fs.copyFileSync(backupPath, this.articlesPath);

        console.log(`${colors.green}✓ 备份恢复成功${colors.reset}`);
        console.log(`  ${colors.bright}从:${colors.reset} ${filename}`);
        console.log(`  ${colors.bright}到:${colors.reset} data/articles.json\n`);
    }

    /**
     * 清理旧备份
     */
    clean(keepCount = 10) {
        console.log(`\n${colors.cyan}清理旧备份（保留最近 ${keepCount} 个）...${colors.reset}\n`);

        if (!fs.existsSync(this.backupDir)) {
            console.log(`${colors.gray}无需清理${colors.reset}\n`);
            return;
        }

        const files = fs.readdirSync(this.backupDir)
            .filter(file => file.startsWith('articles-') && file.endsWith('.json'))
            .map(file => {
                const filePath = path.join(this.backupDir, file);
                const stats = fs.statSync(filePath);
                return {
                    name: file,
                    path: filePath,
                    mtime: stats.mtime
                };
            })
            .sort((a, b) => b.mtime - a.mtime);

        if (files.length <= keepCount) {
            console.log(`${colors.gray}当前备份数: ${files.length}，无需清理${colors.reset}\n`);
            return;
        }

        const toDelete = files.slice(keepCount);
        let deletedCount = 0;

        toDelete.forEach(file => {
            try {
                fs.unlinkSync(file.path);
                console.log(`${colors.gray}✓ 删除: ${file.name}${colors.reset}`);
                deletedCount++;
            } catch (error) {
                console.log(`${colors.red}✗ 删除失败: ${file.name}${colors.reset}`);
            }
        });

        console.log(`\n${colors.green}✓ 清理完成，删除了 ${deletedCount} 个旧备份${colors.reset}\n`);
    }

    /**
     * 显示帮助信息
     */
    help() {
        console.log(`
${colors.cyan}${colors.bright}备份管理工具${colors.reset}

${colors.bright}使用方法:${colors.reset}
  node tools/backup.js <command> [options]

${colors.bright}命令:${colors.reset}
  ${colors.green}create${colors.reset}              创建新备份
  ${colors.green}list${colors.reset}                列出所有备份
  ${colors.green}restore${colors.reset} <filename>  恢复指定备份
  ${colors.green}clean${colors.reset}               清理旧备份（保留最近10个）
  ${colors.green}help${colors.reset}                显示帮助信息

${colors.bright}示例:${colors.reset}
  node tools/backup.js create
  node tools/backup.js list
  node tools/backup.js restore articles-2025-01-20T12-00-00.json
  node tools/backup.js clean
`);
    }
}

// 运行命令
if (require.main === module) {
    const manager = new BackupManager();
    const command = process.argv[2];
    const arg = process.argv[3];

    switch (command) {
        case 'create':
            manager.create();
            break;
        case 'list':
            manager.list();
            break;
        case 'restore':
            manager.restore(arg);
            break;
        case 'clean':
            manager.clean();
            break;
        case 'help':
        default:
            manager.help();
            break;
    }
}

module.exports = BackupManager;

