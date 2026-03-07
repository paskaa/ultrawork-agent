/**
 * SimpleStatusBar - 简洁状态栏
 * 兼容所有终端，不使用复杂的光标定位
 */

const SimpleStatusBar = {
  // 状态数据
  state: {
    task: '',
    progress: 0,
    agents: [],
    logs: [],
    status: 'idle'
  },

  // 颜色（基础 ANSI，广泛支持）
  colors: {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
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
   * 获取状态图标
   */
  getStatusIcon(status) {
    switch (status) {
      case 'OK': return '[OK]';
      case 'RUN': return '[RUN]';
      case 'FAIL': return '[FAIL]';
      default: return '[IDLE]';
    }
  },

  /**
   * 获取状态颜色
   */
  getStatusColor(status) {
    switch (status) {
      case 'OK': return this.colors.green;
      case 'RUN': return this.colors.yellow;
      case 'FAIL': return this.colors.red;
      default: return this.colors.dim;
    }
  },

  /**
   * 绘制进度条
   */
  drawProgress(width = 20) {
    const filled = Math.round(this.state.progress / 100 * width);
    const empty = width - filled;
    const bar = '#'.repeat(filled) + '-'.repeat(empty);
    return `[${bar}] ${this.state.progress}%`;
  },

  /**
   * 渲染状态栏（简洁版）
   */
  render() {
    const c = this.colors;
    const lines = [];

    // 顶部分隔线
    lines.push(`${c.cyan}${'='.repeat(50)}${c.reset}`);

    // 标题
    const statusTag = this.state.status === 'running' ? '[RUN]' :
                      this.state.status === 'completed' ? '[OK]' : '[IDLE]';
    lines.push(`${c.bold}${c.cyan}  UltraWork 三国军团 ${statusTag}${c.reset}`);

    // 任务
    lines.push(`${c.yellow}  Task: ${this.state.task || 'Waiting...'}${c.reset}`);

    // 进度
    lines.push(`${c.green}  Progress: ${this.drawProgress()}${c.reset}`);

    // 分隔线
    lines.push(`${c.cyan}${'─'.repeat(50)}${c.reset}`);

    // Agent 状态
    lines.push(`${c.bold}${c.cyan}  Agents:${c.reset}`);
    for (const agent of this.state.agents.slice(0, 6)) {
      const icon = this.getStatusIcon(agent.status);
      const color = this.getStatusColor(agent.status);
      const task = agent.task || 'waiting';
      lines.push(`    ${color}${icon}${c.reset} ${agent.name}(${agent.alias}) - ${c.dim}${task}${c.reset}`);
    }

    // 分隔线
    lines.push(`${c.cyan}${'─'.repeat(50)}${c.reset}`);

    // 日志
    lines.push(`${c.bold}${c.cyan}  Log:${c.reset}`);
    for (const log of this.state.logs.slice(-3)) {
      lines.push(`    ${c.dim}[${log.time}] ${log.message}${c.reset}`);
    }

    // 底部分隔线
    lines.push(`${c.cyan}${'='.repeat(50)}${c.reset}`);

    return lines.join('\n');
  },

  /**
   * 单行状态（更简洁）
   */
  renderLine() {
    const c = this.colors;
    const progress = this.drawProgress(10);
    const agentCount = this.state.agents.filter(a => a.status === 'RUN').length;
    const statusIcon = this.state.status === 'running' ? '🔄' :
                       this.state.status === 'completed' ? '✅' : '⏸️';

    return `${c.cyan}[UltraWork]${c.reset} ${statusIcon} ${this.state.task} | ${c.green}${progress}${c.reset} | ${c.yellow}${agentCount} agents running${c.reset}`;
  },

  /**
   * 清除（空操作，保持兼容）
   */
  clear() {
    // 简单版本不需要清除
  },

  /**
   * 打印
   */
  print() {
    console.log(this.render());
    return this;
  },

  /**
   * 打印单行
   */
  printLine() {
    console.log(this.renderLine());
    return this;
  }
};

module.exports = SimpleStatusBar;

// 测试
if (require.main === module) {
  SimpleStatusBar
    .setTask('实现用户登录功能')
    .setProgress(0)
    .addAgent('诸葛亮', '孔明', 'Qwen3.5-Plus', 'IDLE')
    .addAgent('赵云', '子龙', 'Qwen-Coder', 'IDLE')
    .addAgent('周瑜', '公瑾', 'GLM-5', 'IDLE')
    .addAgent('张飞', '翼德', 'MiniMax', 'IDLE');

  console.log('\n=== 完整状态栏 ===\n');
  SimpleStatusBar.print();

  // 模拟执行
  setTimeout(() => {
    SimpleStatusBar
      .updateAgent('诸葛亮', 'RUN', '意图分析')
      .addLog('诸葛亮: 开始分析')
      .setProgress(20)
      .print();
  }, 500);

  setTimeout(() => {
    SimpleStatusBar
      .updateAgent('诸葛亮', 'OK')
      .updateAgent('赵云', 'RUN', '代码实现')
      .addLog('赵云: 开始编码')
      .setProgress(50)
      .print();
  }, 1000);

  setTimeout(() => {
    SimpleStatusBar
      .updateAgent('赵云', 'OK')
      .updateAgent('张飞', 'RUN', '快速测试')
      .addLog('张飞: 验证中')
      .setProgress(80)
      .print();
  }, 1500);

  setTimeout(() => {
    SimpleStatusBar
      .updateAgent('张飞', 'OK')
      .addLog('任务完成!')
      .setProgress(100)
      .print();

    console.log('\n=== 单行状态 ===\n');
    SimpleStatusBar.printLine();
  }, 2000);
}
