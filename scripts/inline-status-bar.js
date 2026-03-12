/**
 * InlineStatusBar - 内联状态栏
 * 在当前终端右侧固定显示状态面板
 */

const ANSI = {
  // 光标控制
  save: '\x1b[s',           // 保存光标位置
  restore: '\x1b[u',        // 恢复光标位置
  hide: '\x1b[?25l',        // 隐藏光标
  show: '\x1b[?25h',        // 显示光标

  // 清除
  clearLine: '\x1b[2K',     // 清除当前行
  clearRight: '\x1b[K',     // 清除到行尾

  // 移动
  moveTo: (row, col) => `\x1b[${row};${col}H`,
  moveRight: (n) => `\x1b[${n}C`,
  moveLeft: (n) => `\x1b[${n}D`,
  moveUp: (n) => `\x1b[${n}A`,
  moveDown: (n) => `\x1b[${n}B`,

  // 颜色
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',

  // 前景色
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // 背景色
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
};

const InlineStatusBar = {
  // 配置
  config: {
    width: 40,           // 状态栏宽度
    startRow: 1,         // 起始行
    enabled: true,
    bgColor: ANSI.bgBlue,
    borderColor: ANSI.cyan,
  },

  // 状态
  state: {
    task: '',
    progress: 0,
    agents: [],
    logs: [],
    status: 'idle'
  },

  // 终端尺寸
  terminal: {
    cols: process.stdout.columns || 80,
    rows: process.stdout.rows || 24,
  },

  /**
   * 初始化
   */
  init() {
    // 更新终端尺寸
    this.terminal.cols = process.stdout.columns || 80;
    this.terminal.rows = process.stdout.rows || 24;

    // 监听终端 resize
    process.stdout.on('resize', () => {
      this.terminal.cols = process.stdout.columns || 80;
      this.terminal.rows = process.stdout.rows || 24;
    });

    return this;
  },

  /**
   * 设置任务
   */
  setTask(task) {
    this.state.task = task;
    this.state.status = 'running';
    return this;
  },

  /**
   * 设置进度
   */
  setProgress(percent) {
    this.state.progress = Math.min(100, Math.max(0, percent));
    return this;
  },

  /**
   * 添加 Agent
   */
  addAgent(name, alias, model, status = 'IDLE', task = '') {
    this.state.agents.push({ name, alias, model, status, task });
    return this;
  },

  /**
   * 更新 Agent 状态
   */
  updateAgent(name, status, task = '') {
    const agent = this.state.agents.find(a => a.name === name);
    if (agent) {
      agent.status = status;
      agent.task = task;
    }
    return this;
  },

  /**
   * Agent 开始任务 (别名方法，兼容插件API)
   */
  agentStart(agentId, action) {
    // 武将ID到名称的映射
    const agentMap = {
      'zhugeliang': { name: '诸葛亮', alias: '孔明', model: 'GLM-5' },
      'zhaoyun': { name: '赵云', alias: '子龙', model: 'Qwen-Coder' },
      'simayi': { name: '司马懿', alias: '仲达', model: 'Kimi-k2.5' },
      'zhangfei': { name: '张飞', alias: '翼德', model: 'MiniMax-M2.5' },
      'guanyu': { name: '关羽', alias: '云长', model: 'Qwen3.5-Plus' },
      'zhouyu': { name: '周瑜', alias: '公瑾', model: 'GLM-5' },
      'chendao': { name: '陈到', alias: '叔至', model: 'Kimi-k2.5' },
      'gaoshun': { name: '高顺', alias: '', model: 'Qwen-Coder' },
      'huanggai': { name: '黄盖', alias: '公覆', model: 'Gemini-2.5' },
      'lusu': { name: '鲁肃', alias: '子敬', model: 'Kimi-k2.5' },
      'manchong': { name: '满宠', alias: '伯宁', model: 'GLM-5' },
      'zhoucang': { name: '周仓', alias: '', model: 'Qwen-Coder' },
      'wulan': { name: '吴兰', alias: '', model: 'Qwen-Coder' },
      'leixu': { name: '雷绪', alias: '', model: 'MiniMax-M2.5' },
      'pangde': { name: '庞德', alias: '令明', model: 'MiniMax-M2.5' },
      'madai': { name: '马岱', alias: '', model: 'Qwen-Coder' },
      'guanping': { name: '关平', alias: '', model: 'Qwen-Coder' },
      'simashi': { name: '司马师', alias: '子元', model: 'Kimi-k2.5' },
      'simazhao': { name: '司马昭', alias: '子上', model: 'Kimi-k2.5' },
      'machao': { name: '马超', alias: '孟起', model: 'MiniMax-M2.5' }
    };

    const agentInfo = agentMap[agentId];
    if (!agentInfo) return this;

    const existingAgent = this.state.agents.find(a => a.name === agentInfo.name);
    if (existingAgent) {
      existingAgent.status = 'RUN';
      existingAgent.task = action;
    } else {
      this.addAgent(agentInfo.name, agentInfo.alias, agentInfo.model, 'RUN', action);
    }
    return this;
  },

  /**
   * Agent 更新进度
   */
  agentProgress(agentId, progress, message) {
    const agentMap = {
      'zhugeliang': '诸葛亮',
      'zhaoyun': '赵云',
      'simayi': '司马懿',
      'zhangfei': '张飞',
      'guanyu': '关羽',
      'zhouyu': '周瑜',
      'chendao': '陈到',
      'gaoshun': '高顺',
      'huanggai': '黄盖',
      'lusu': '鲁肃',
      'manchong': '满宠',
      'zhoucang': '周仓',
      'wulan': '吴兰',
      'leixu': '雷绪',
      'pangde': '庞德',
      'madai': '马岱',
      'guanping': '关平',
      'simashi': '司马师',
      'simazhao': '司马昭',
      'machao': '马超'
    };

    const agentName = agentMap[agentId];
    if (!agentName) return this;

    const agent = this.state.agents.find(a => a.name === agentName);
    if (agent) {
      if (message) {
        agent.task = message;
      }
      // 这里可以添加进度相关的逻辑
      this.addLog(`${agentName}: ${message || '进度更新 ' + progress + '%'}`);
    }
    return this;
  },

  /**
   * Agent 完成任务
   */
  agentComplete(agentId, success = true) {
    const agentMap = {
      'zhugeliang': '诸葛亮',
      'zhaoyun': '赵云',
      'simayi': '司马懿',
      'zhangfei': '张飞',
      'guanyu': '关羽',
      'zhouyu': '周瑜',
      'chendao': '陈到',
      'gaoshun': '高顺',
      'huanggai': '黄盖',
      'lusu': '鲁肃',
      'manchong': '满宠',
      'zhoucang': '周仓',
      'wulan': '吴兰',
      'leixu': '雷绪',
      'pangde': '庞德',
      'madai': '马岱',
      'guanping': '关平',
      'simashi': '司马师',
      'simazhao': '司马昭',
      'machao': '马超'
    };

    const agentName = agentMap[agentId];
    if (!agentName) return this;

    const agent = this.state.agents.find(a => a.name === agentName);
    if (agent) {
      agent.status = success ? 'OK' : 'FAIL';
      agent.task = success ? '已完成' : '失败';
    }
    return this;
  },

  /**
   * 添加日志
   */
  addLog(message) {
    const time = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    });
    this.state.logs.push({ time, message });
    if (this.state.logs.length > 3) this.state.logs.shift();
    return this;
  },

  /**
   * 计算右侧起始列
   */
  getRightCol() {
    return this.terminal.cols - this.config.width + 1;
  },

  /**
   * 在右侧绘制行
   */
  drawRightLine(row, content, style = '') {
    const col = this.getRightCol();
    const line = `${ANSI.save}${ANSI.moveTo(row, col)}${style}${content.padEnd(this.config.width)}${ANSI.reset}${ANSI.restore}`;
    process.stdout.write(line);
  },

  /**
   * 绘制状态栏
   */
  render() {
    if (!this.config.enabled) return;

    const w = this.config.width - 2; // 内容宽度
    let row = this.config.startRow;

    // 清除右侧区域
    for (let i = 0; i < 20; i++) {
      this.drawRightLine(row + i, ' '.repeat(this.config.width));
    }

    // 标题
    this.drawRightLine(row, `┌${'─'.repeat(w)}┐`, ANSI.cyan);
    row++;

    const title = '🏰 UltraWork 三国军团';
    this.drawRightLine(row, `│${title.padEnd(w)}│`, ANSI.cyan + ANSI.bold);
    row++;

    // 分隔线
    this.drawRightLine(row, `├${'─'.repeat(w)}┤`, ANSI.cyan);
    row++;

    // 任务
    const taskText = `📋 ${this.state.task || '待命中...'}`;
    this.drawRightLine(row, `│ ${this._truncate(taskText, w - 2).padEnd(w - 1)}│`, ANSI.yellow);
    row++;

    // 进度
    const filled = Math.round(this.state.progress / 100 * 16);
    const empty = 16 - filled;
    const progress = `${'█'.repeat(filled)}${'░'.repeat(empty)} ${this.state.progress}%`;
    this.drawRightLine(row, `│ 进度: ${progress.padEnd(w - 8)}│`, ANSI.green);
    row++;

    // 分隔线
    this.drawRightLine(row, `├${'─'.repeat(w)}┤`, ANSI.cyan);
    row++;

    // Agent 状态
    this.drawRightLine(row, `│ 🎖️  将领状态${' '.repeat(w - 8)}│`, ANSI.cyan + ANSI.bold);
    row++;

    for (const agent of this.state.agents.slice(0, 6)) {
      const statusIcon = agent.status === 'OK' ? '✅' :
                        agent.status === 'RUN' ? '🔄' :
                        agent.status === 'FAIL' ? '❌' : '⏸️';
      const agentLine = `${statusIcon} ${agent.name}(${agent.alias})`;
      const taskPart = agent.task ? agent.task.slice(0, 8) : '待命';
      this.drawRightLine(row, `│ ${this._truncate(agentLine, w - 12).padEnd(w - 12)}${taskPart.padEnd(10)}│`, ANSI.dim);
      row++;
    }

    // 分隔线
    this.drawRightLine(row, `├${'─'.repeat(w)}┤`, ANSI.cyan);
    row++;

    // 日志
    this.drawRightLine(row, `│ 📜 执行日志${' '.repeat(w - 7)}│`, ANSI.cyan + ANSI.bold);
    row++;

    for (const log of this.state.logs.slice(-3)) {
      const logLine = `${log.time} ${log.message}`;
      this.drawRightLine(row, `│ ${this._truncate(logLine, w - 2).padEnd(w - 1)}│`, ANSI.dim);
      row++;
    }

    // 底部
    this.drawRightLine(row, `└${'─'.repeat(w)}┘`, ANSI.cyan);
  },

  /**
   * 清除状态栏
   */
  clear() {
    for (let i = 0; i < 20; i++) {
      this.drawRightLine(this.config.startRow + i, ' '.repeat(this.config.width));
    }
  },

  /**
   * 辅助函数
   */
  _truncate(str, maxLen) {
    if (!str) return '';
    // 去除 ANSI 转义序列
    const stripped = str.replace(/\x1b\[[0-9;]*m/g, '');
    if (stripped.length > maxLen) {
      return str.slice(0, maxLen - 2) + '..';
    }
    return str;
  },

  /**
   * 启用/禁用
   */
  enable() {
    this.config.enabled = true;
    return this;
  },

  disable() {
    this.config.enabled = false;
    this.clear();
    return this;
  }
};

module.exports = InlineStatusBar;

// 测试
if (require.main === module) {
  InlineStatusBar.init();

  // 模拟任务执行
  InlineStatusBar
    .setTask('实现用户登录功能')
    .setProgress(0)
    .addAgent('诸葛亮', '孔明', 'Qwen3.5-Plus', 'IDLE')
    .addAgent('赵云', '子龙', 'Qwen-Coder-Qoder', 'IDLE')
    .addAgent('周瑜', '公瑾', 'GLM-5', 'IDLE')
    .addAgent('张飞', '翼德', 'MiniMax-M2.5', 'IDLE');

  InlineStatusBar.render();

  // 模拟执行
  let progress = 0;
  const interval = setInterval(() => {
    progress += 20;

    if (progress === 20) {
      InlineStatusBar.updateAgent('诸葛亮', 'RUN', '意图分析');
      InlineStatusBar.addLog('诸葛亮: 开始分析');
    } else if (progress === 40) {
      InlineStatusBar.updateAgent('诸葛亮', 'OK');
      InlineStatusBar.updateAgent('赵云', 'RUN', '代码实现');
      InlineStatusBar.addLog('赵云: 开始编码');
    } else if (progress === 60) {
      InlineStatusBar.updateAgent('周瑜', 'RUN', '方案设计');
      InlineStatusBar.addLog('周瑜: 设计方案');
    } else if (progress === 80) {
      InlineStatusBar.updateAgent('赵云', 'OK');
      InlineStatusBar.updateAgent('周瑜', 'OK');
      InlineStatusBar.updateAgent('张飞', 'RUN', '快速测试');
      InlineStatusBar.addLog('张飞: 快速验证');
    } else if (progress >= 100) {
      InlineStatusBar.updateAgent('张飞', 'OK');
      InlineStatusBar.addLog('任务完成!');
      clearInterval(interval);

      // 3秒后清除
      setTimeout(() => InlineStatusBar.clear(), 3000);
    }

    InlineStatusBar.setProgress(progress);
    InlineStatusBar.render();
  }, 1000);
}
