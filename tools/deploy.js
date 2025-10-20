/**
 * 一键部署脚本
 * 自动化执行：转换 MD -> 提交 Git -> 推送到 GitHub
 * 
 * 使用方法：
 * node tools/deploy.js [commit-message]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 颜色代码
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
};

class DeployManager {
    constructor() {
        this.rootDir = path.join(__dirname, '..');
        this.commitMessage = process.argv[2] || '更新博客文章';
    }

    /**
     * 执行命令
     */
    exec(command, options = {}) {
        try {
            const output = execSync(command, {
                cwd: this.rootDir,
                encoding: 'utf-8',
                stdio: options.silent ? 'pipe' : 'inherit',
                ...options
            });
            return output;
        } catch (error) {
            if (!options.ignoreError) {
                throw error;
            }
            return null;
        }
    }

    /**
     * 检查 Git 状态
     */
    checkGitStatus() {
        console.log(`${colors.cyan}检查 Git 状态...${colors.reset}`);
        
        try {
            // 检查是否是 Git 仓库
            this.exec('git status', { silent: true });
        } catch (error) {
            console.log(`${colors.red}✗ 不是 Git 仓库。请先运行 git init${colors.reset}\n`);
            return false;
        }

        // 检查是否有远程仓库
        const remotes = this.exec('git remote -v', { silent: true });
        if (!remotes || remotes.trim() === '') {
            console.log(`${colors.yellow}⚠ 未配置远程仓库。${colors.reset}`);
            console.log(`${colors.gray}请运行: git remote add origin <your-repo-url>${colors.reset}\n`);
            return false;
        }

        console.log(`${colors.green}✓ Git 配置正常${colors.reset}\n`);
        return true;
    }

    /**
     * 转换 Markdown 文件
     */
    async convertMarkdown() {
        console.log(`${colors.cyan}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
        console.log(`${colors.cyan}步骤 1/4: 转换 Markdown 文件${colors.reset}`);
        console.log(`${colors.cyan}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

        try {
            this.exec('node tools/md-to-json.js');
            return true;
        } catch (error) {
            console.log(`${colors.red}✗ Markdown 转换失败${colors.reset}\n`);
            console.error(error.message);
            return false;
        }
    }

    /**
     * 添加文件到 Git
     */
    addFiles() {
        console.log(`${colors.cyan}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
        console.log(`${colors.cyan}步骤 2/4: 添加文件到 Git${colors.reset}`);
        console.log(`${colors.cyan}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

        try {
            // 检查是否有更改
            const status = this.exec('git status --porcelain', { silent: true });
            if (!status || status.trim() === '') {
                console.log(`${colors.yellow}⚠ 没有文件需要提交${colors.reset}\n`);
                return false;
            }

            // 显示将要添加的文件
            console.log(`${colors.gray}准备添加以下文件:${colors.reset}`);
            status.split('\n').filter(line => line.trim()).forEach(line => {
                console.log(`  ${colors.gray}${line}${colors.reset}`);
            });
            console.log('');

            // 添加所有更改
            this.exec('git add data/articles.json posts/');
            console.log(`${colors.green}✓ 文件已添加${colors.reset}\n`);
            return true;
        } catch (error) {
            console.log(`${colors.red}✗ 添加文件失败${colors.reset}\n`);
            console.error(error.message);
            return false;
        }
    }

    /**
     * 提交更改
     */
    commit() {
        console.log(`${colors.cyan}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
        console.log(`${colors.cyan}步骤 3/4: 提交更改${colors.reset}`);
        console.log(`${colors.cyan}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

        try {
            console.log(`${colors.gray}提交信息: ${this.commitMessage}${colors.reset}\n`);
            this.exec(`git commit -m "${this.commitMessage}"`);
            console.log(`${colors.green}✓ 提交成功${colors.reset}\n`);
            return true;
        } catch (error) {
            console.log(`${colors.red}✗ 提交失败${colors.reset}\n`);
            console.error(error.message);
            return false;
        }
    }

    /**
     * 推送到远程仓库
     */
    push() {
        console.log(`${colors.cyan}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
        console.log(`${colors.cyan}步骤 4/4: 推送到 GitHub${colors.reset}`);
        console.log(`${colors.cyan}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

        try {
            // 获取当前分支
            const branch = this.exec('git branch --show-current', { silent: true }).trim();
            console.log(`${colors.gray}推送分支: ${branch}${colors.reset}\n`);

            // 推送
            this.exec(`git push origin ${branch}`);
            console.log(`${colors.green}✓ 推送成功${colors.reset}\n`);
            return true;
        } catch (error) {
            console.log(`${colors.red}✗ 推送失败${colors.reset}\n`);
            console.error(error.message);
            return false;
        }
    }

    /**
     * 执行完整部署流程
     */
    async deploy() {
        console.log(`\n${colors.cyan}${colors.bright}╔═══════════════════════════════════╗${colors.reset}`);
        console.log(`${colors.cyan}${colors.bright}║     博客自动部署脚本 v1.0         ║${colors.reset}`);
        console.log(`${colors.cyan}${colors.bright}╚═══════════════════════════════════╝${colors.reset}\n`);

        // 检查 Git 状态
        if (!this.checkGitStatus()) {
            return;
        }

        // 1. 转换 Markdown
        const converted = await this.convertMarkdown();
        if (!converted) {
            console.log(`${colors.red}部署中止${colors.reset}\n`);
            return;
        }

        // 2. 添加文件
        const added = this.addFiles();
        if (!added) {
            console.log(`${colors.yellow}没有需要部署的更改${colors.reset}\n`);
            return;
        }

        // 3. 提交
        const committed = this.commit();
        if (!committed) {
            console.log(`${colors.red}部署中止${colors.reset}\n`);
            return;
        }

        // 4. 推送
        const pushed = this.push();
        if (!pushed) {
            console.log(`${colors.red}部署未完成。请手动运行 git push${colors.reset}\n`);
            return;
        }

        // 成功
        console.log(`${colors.green}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
        console.log(`${colors.green}${colors.bright}✓ 部署完成！${colors.reset}`);
        console.log(`${colors.green}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

        console.log(`${colors.cyan}Vercel 将自动部署您的更改。${colors.reset}`);
        console.log(`${colors.gray}查看部署状态: https://vercel.com/dashboard${colors.reset}\n`);
    }
}

// 运行部署
if (require.main === module) {
    const manager = new DeployManager();
    manager.deploy().catch(error => {
        console.error(`${colors.red}部署出错:${colors.reset}`, error);
        process.exit(1);
    });
}

module.exports = DeployManager;

