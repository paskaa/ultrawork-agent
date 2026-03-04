/**
 * TmuxManager - tmux 状态面板管理器
 * 在 WSL 中自动启动状态显示面板
 */

const { spawn, exec, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const TmuxManager = {
  statusProcess: null,
  isWindows: process.platform === 'win32',

  /**
   * 启动 tmux 状态面板
   * @param {string} task - 任务描述
   */
  async startStatusPanel(task) {
    const scriptDir = this._getScriptDir();
    const statusScript = path.join(scriptDir, 'ulw-status.sh');

    // 确保脚本存在
    if (!fs.existsSync(statusScript)) {
      console.log('[TmuxManager] 状态脚本不存在，跳过面板启动');
      return false;
    }

    // 修复脚本行尾符
    try {
      execSync(`wsl bash -c "sed -i 's/\\r$//' '${this._toWslPath(statusScript)}' && chmod +x '${this._toWslPath(statusScript)}'"`);
    } catch (e) {
      // 忽略
    }

    // 初始化状态文件
    this._initStateFile(task);

    if (this.isWindows) {
      return await this._openStatusWindow();
    } else {
      return await this._startInTmux(statusScript, task);
    }
  },

  /**
   * 打开状态窗口（直接在新窗口显示状态面板）
   */
  async _openStatusWindow() {
    return new Promise((resolve) => {
      try {
        // 使用 cmd 打开新窗口运行状态面板
        // 直接运行 ulw-status.sh panel 命令
        const wslScript = '/mnt/d/his/ultrawork-skill/scripts/ulw-status.sh';

        // 方法1: 使用 start 命令打开新窗口
        const cmd = spawn('cmd', [
          '/c', 'start', 'UltraWork状态面板',
          'wsl', '-e', 'bash', '-c',
          `sed -i 's/\\r$//' ${wslScript} && chmod +x ${wslScript} && ${wslScript} panel`
        ], {
          detached: true,
          stdio: 'ignore'
        });

        cmd.on('error', (err) => {
          console.log('[TmuxManager] 打开窗口失败:', err.message);
          // 后备方案
          spawn('wsl', ['-e', 'bash', '-c', `${wslScript} panel`], {
            detached: true,
            stdio: 'ignore'
          });
        });

        cmd.unref();
        console.log('[TmuxManager] 已在新窗口打开状态面板');
        resolve(true);
      } catch (e) {
        console.log('[TmuxManager] 打开状态窗口失败:', e.message);
        resolve(false);
      }
    });
  },

  /**
   * 在 tmux 中启动（从 Linux/WSL 内部调用）
   */
  async _startInTmux(scriptPath, task) {
    return new Promise((resolve) => {
      const inTmux = process.env.TMUX;

      if (inTmux) {
        // 已在 tmux 中
        console.log('[TmuxManager] 创建状态面板...');
        exec(`tmux split-window -h -p 30 '${scriptPath} panel'`, (err) => {
          resolve(!err);
        });
      } else {
        // 不在 tmux 中，直接运行
        spawn('bash', ['-c', `${scriptPath} panel`], {
          detached: true,
          stdio: 'ignore'
        });
        resolve(true);
      }
    });
  },

  /**
   * 停止状态面板
   */
  stopStatusPanel() {
    if (this.statusProcess) {
      this.statusProcess.kill();
      this.statusProcess = null;
    }
  },

  /**
   * 获取脚本目录
   */
  _getScriptDir() {
    return path.join(__dirname);
  },

  /**
   * Windows 路径转 WSL 路径
   */
  _toWslPath(winPath) {
    return winPath
      .replace(/\\/g, '/')
      .replace(/^([A-Za-z]):/, (_, letter) => `/mnt/${letter.toLowerCase()}`);
  },

  /**
   * 初始化状态文件
   */
  _initStateFile(task) {
    try {
      const wslStateFile = '/tmp/ultrawork-state.json';
      const state = {
        task: task,
        progress: 0,
        agents: {},
        status: 'running',
        updatedAt: new Date().toISOString()
      };

      // 使用 base64 编码写入
      if (this.isWindows) {
        const base64Content = Buffer.from(JSON.stringify(state, null, 2)).toString('base64');
        execSync(`wsl bash -c "echo '${base64Content}' | base64 -d > ${wslStateFile}"`);
      } else {
        fs.writeFileSync(wslStateFile, JSON.stringify(state, null, 2));
      }
    } catch (e) {
      console.log('[TmuxManager] 初始化状态文件失败:', e.message);
    }
  }
};

module.exports = TmuxManager;