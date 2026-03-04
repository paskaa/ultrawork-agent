/**
 * Terminal UI - 终端实时进度面板
 * 在 Claude Code CLI 右侧显示实时进度
 */

const ANSI = {
  // 光标控制
  cursorTo: (x, y) => `\x1b[${y};${x}H`,
  cursorUp: (n = 1) => `\x1b[${n}A`,
  cursorDown: (n = 1) => `\x1b[${n}B`,
  cursorForward: (n = 1) => `\x1b[${n}C`,
  cursorBack: (n = 1) => `\x1b[${n}D`,
  saveCursor: '\x1b[s',
  restoreCursor: '\x1b[u',
  hideCursor: '\x1b[?25l',
  showCursor: '\x1b[?25h',

  // 清除
  clearScreen: '\x1b[2J',
  clearLine: '\x1b[2K',
  clearRight: '\x1b[0K',
  clearDown: '\x1b[J',

  // 颜色
  colors: {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m'
  }
};

const TerminalUI = {
  // 状态
  agents: {},
  logs: [],
  totalProgress: 0,
  currentTask: '',
  panelWidth: 40,
  enabled: true,

  /**
   * 初始化
   */
  init() {
    this.agents = {};
    this.logs = [];
    this.totalProgress = 0;
    this.currentTask = '';
    this.enabled = process.stdout.isTTY;

    if (this.enabled) {
      process.stdout.write(ANSI.hideCursor);
      this.render();
    }
  },

  /**
   * 销毁
   */
  destroy() {
    if (this.enabled) {
      process.stdout.write(ANSI.showCursor);
      process.stdout.write(ANSI.colors.reset);
    }
  },

  /**
   * 设置当前任务
   */
  setTask(task) {
    this.currentTask = task;
    this.addLog('📋 ' + task);
    this.render();
  },

  /**
   * 设置总进度
   */
  setProgress(progress) {
    this.totalProgress = Math.min(100, Math.max(0, progress));
    this.render();
  },

  /**
   * 注册 Agent
   */
  registerAgent(id, name, alias) {
    this.agents[id] = {
      id,
      name,
      alias,
      status: 'idle',
      progress: 0,
      task: ''
    };
    this.addLog(`🎖️  ${name}(${alias}) 就绪`);
    this.render();
  },

  /**
   * Agent 开始
   */
  agentStart(id, task) {
    if (this.agents[id]) {
      this.agents[id].status = 'running';
      this.agents[id].task = task;
      this.agents[id].progress = 0;
      this.addLog(`⚔️  ${this.agents[id].name} 出征: ${task}`);
      this.render();
    }
  },

  /**
   * Agent 进度
   */
  agentProgress(id, progress, message = '') {
    if (this.agents[id]) {
      this.agents[id].progress = progress;
      if (message) {
        this.addLog(`   ${this.agents[id].name}: ${message}`);
      }
      this.render();
    }
  },

  /**
   * Agent 完成
   */
  agentComplete(id, success = true) {
    if (this.agents[id]) {
      this.agents[id].status = success ? 'completed' : 'failed';
      this.agents[id].progress = 100;
      this.addLog(`${success ? '✅' : '❌'} ${this.agents[id].name} ${success ? '凯旋' : '败退'}`);
      this.render();
    }
  },

  /**
   * 添加日志
   */
  addLog(message) {
    const time = new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    this.logs.push({ time, message });
    if (this.logs.length > 10) {
      this.logs.shift();
    }
  },

  /**
   * 渲染面板
   */
  render() {
    if (!this.enabled) return;

    const width = this.panelWidth;
    const line = '─'.repeat(width - 2);

    // 构建面板内容
    const lines = [];

    // 标题
    lines.push(`🏰 ${ANSI.colors.bold}UltraWork 三国军团${ANSI.colors.reset}`);
    lines.push(`┌${line}┐`);

    // 任务
    lines.push(`│ ${ANSI.colors.cyan}军令:${ANSI.colors.reset} ${this.truncate(this.currentTask || '待命中...', width - 10)}`);
    lines.push(`├${line}┤`);

    // 总进度
    const progressText = this.drawProgressBar(this.totalProgress, width - 6);
    lines.push(`│ ${ANSI.colors.bold}总进度${ANSI.colors.reset} ${progressText} ${this.totalProgress}%`);
    lines.push(`├${line}┤`);

    // Agent 状态
    lines.push(`│ ${ANSI.colors.bold}🎖️  将领状态${ANSI.colors.reset}`);
    lines.push(`│`);

    for (const agent of Object.values(this.agents)) {
      const statusIcon = {
        idle: '⏸️',
        running: '🔄',
        completed: '✅',
        failed: '❌'
      }[agent.status] || '⏸️';

      const statusColor = {
        idle: ANSI.colors.dim,
        running: ANSI.colors.cyan,
        completed: ANSI.colors.green,
        failed: ANSI.colors.red
      }[agent.status] || ANSI.colors.reset;

      const progressBar = this.drawMiniBar(agent.progress);
      const taskText = this.truncate(agent.task || '待命', 12);

      lines.push(`│ ${statusIcon} ${statusColor}${agent.name}${ANSI.colors.reset}(${agent.alias}) ${progressBar}`);
      lines.push(`│   ${ANSI.colors.dim}${taskText}${ANSI.colors.reset}`);
    }

    lines.push(`├${line}┤`);

    // 日志
    lines.push(`│ ${ANSI.colors.bold}📜 执行日志${ANSI.colors.reset}`);

    for (const log of this.logs.slice(-5)) {
      const logText = this.truncate(log.message, width - 12);
      lines.push(`│ ${ANSI.colors.dim}${log.time}${ANSI.colors.reset} ${logText}`);
    }

    lines.push(`└${line}┘`);

    // 输出到终端右侧
    this.drawToRight(lines);
  },

  /**
   * 绘制进度条
   */
  drawProgressBar(percent, width) {
    const filled = Math.round(percent / 100 * width);
    const empty = width - filled;
    return `${ANSI.colors.bgCyan}${' '.repeat(filled)}${ANSI.colors.reset}${' '.repeat(empty)}`;
  },

  /**
   * 绘制迷你进度条
   */
  drawMiniBar(percent) {
    const filled = Math.round(percent / 100 * 5);
    const empty = 5 - filled;
    return `${ANSI.colors.cyan}${'█'.repeat(filled)}${ANSI.colors.reset}${'░'.repeat(empty)}`;
  },

  /**
   * 截断文本
   */
  truncate(text, maxLen) {
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen - 3) + '...';
  },

  /**
   * 绘制到终端右侧
   */
  drawToRight(lines) {
    const terminalWidth = process.stdout.columns || 80;
    const startX = terminalWidth - this.panelWidth;

    // 保存当前光标位置
    process.stdout.write(ANSI.saveCursor);

    // 从顶部开始绘制
    lines.forEach((line, index) => {
      process.stdout.write(ANSI.cursorTo(startX, index + 1));
      process.stdout.write(ANSI.clearLine);
      process.stdout.write(line.padEnd(this.panelWidth));
    });

    // 恢复光标位置
    process.stdout.write(ANSI.restoreCursor);
  }
};

module.exports = TerminalUI;