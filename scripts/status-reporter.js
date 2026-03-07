/**
 * StatusReporter - 状态报告器
 * 将状态写入共享文件，供 tmux 状态面板读取
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 状态文件路径 - 在 Windows 上通过 WSL 写入
const STATE_FILE_WSL = '/tmp/ultrawork-state.json';
const LOG_FILE_WSL = '/tmp/ultrawork-log.txt';

const StatusReporter = {
  state: {
    task: '',
    progress: 0,
    agents: {},
    status: 'idle',
    updatedAt: ''
  },

  /**
   * 初始化
   */
  init() {
    this.load();
  },

  /**
   * 加载状态
   */
  load() {
    try {
      const content = this._readFile(STATE_FILE_WSL);
      if (content) {
        this.state = JSON.parse(content);
      }
    } catch (e) {
      // 忽略错误
    }
  },

  /**
   * 保存状态
   */
  save() {
    this.state.updatedAt = new Date().toISOString();
    try {
      this._writeFile(STATE_FILE_WSL, JSON.stringify(this.state, null, 2));
    } catch (e) {
      // 忽略错误，避免影响主流程
    }
  },

  /**
   * 读取文件（跨平台）
   */
  _readFile(filePath) {
    if (process.platform === 'win32') {
      try {
        const result = execSync(`wsl bash -c "cat '${filePath}' 2>/dev/null || echo ''"`, { encoding: 'utf-8' });
        return result.trim() || null;
      } catch {
        return null;
      }
    } else {
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf-8');
      }
      return null;
    }
  },

  /**
   * 写入文件（跨平台）
   */
  _writeFile(filePath, content) {
    if (process.platform === 'win32') {
      // 通过 WSL 写入 - 使用 base64 编码避免转义问题
      const base64Content = Buffer.from(content).toString('base64');
      execSync(`wsl bash -c "echo '${base64Content}' | base64 -d > '${filePath}'"`, { encoding: 'utf-8' });
    } else {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, content);
    }
  },

  /**
   * 追加文件（跨平台）
   */
  _appendFile(filePath, content) {
    if (process.platform === 'win32') {
      // 使用 base64 编码避免转义问题
      const base64Content = Buffer.from(content).toString('base64');
      execSync(`wsl bash -c "echo '${base64Content}' | base64 -d >> '${filePath}'"`, { encoding: 'utf-8' });
    } else {
      fs.appendFileSync(filePath, content);
    }
  },

  /**
   * 设置任务
   */
  setTask(task) {
    this.state.task = task;
    this.state.status = 'running';
    this.log(`📋 军令: ${task}`);
    this.save();
  },

  /**
   * 设置进度
   */
  setProgress(progress) {
    this.state.progress = Math.min(100, Math.max(0, progress));
    this.save();
  },

  /**
   * 设置状态
   */
  setStatus(status) {
    this.state.status = status;
    this.save();
  },

  /**
   * 注册 Agent
   */
  registerAgent(id, name, alias) {
    this.state.agents[id] = {
      id,
      name,
      alias,
      status: 'idle',
      progress: 0,
      task: ''
    };
    this.log(`🎖️  ${name}(${alias}) 就绪`);
    this.save();
  },

  /**
   * Agent 开始
   */
  agentStart(id, task) {
    if (this.state.agents[id]) {
      this.state.agents[id].status = 'running';
      this.state.agents[id].task = task;
      this.state.agents[id].progress = 0;
      this.log(`⚔️  ${this.state.agents[id].name} 出征: ${task}`);
      this.save();
    }
  },

  /**
   * Agent 进度
   */
  agentProgress(id, progress, message = '') {
    if (this.state.agents[id]) {
      this.state.agents[id].progress = progress;
      if (message) {
        this.log(`   ${this.state.agents[id].name}: ${message}`);
      }
      this.save();
    }
  },

  /**
   * Agent 完成
   */
  agentComplete(id, success = true) {
    if (this.state.agents[id]) {
      this.state.agents[id].status = success ? 'completed' : 'failed';
      this.state.agents[id].progress = 100;
      this.log(`${success ? '✅' : '❌'} ${this.state.agents[id].name} ${success ? '凯旋' : '败退'}`);
      this.save();
    }
  },

  /**
   * 任务完成
   */
  complete(summary) {
    this.state.status = 'completed';
    this.state.progress = 100;
    this.log(`🎉 任务完成: ${summary}`);
    this.save();
  },

  /**
   * 任务失败
   */
  fail(error) {
    this.state.status = 'failed';
    this.log(`❌ 任务失败: ${error}`);
    this.save();
  },

  /**
   * 写入日志
   */
  log(message) {
    const time = new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const line = `[${time}] ${message}`;

    try {
      this._appendFile(LOG_FILE_WSL, line + '\n');
    } catch (e) {
      // 忽略错误
    }
  },

  /**
   * 清除状态
   */
  clear() {
    this.state = {
      task: '',
      progress: 0,
      agents: {},
      status: 'idle',
      updatedAt: ''
    };
    try {
      this._writeFile(STATE_FILE_WSL, JSON.stringify(this.state, null, 2));
      this._writeFile(LOG_FILE_WSL, '');
    } catch (e) {
      // 忽略错误
    }
  }
};

module.exports = StatusReporter;