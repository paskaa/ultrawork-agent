/**
 * Enhanced Status Bar - 增强版状态栏
 * 提供多种状态栏样式供选择
 */

const StatusBar = {
  // 状态数据
  state: {
    task: '',
    progress: 0,
    agents: {},
    logs: [],
    status: 'idle' // idle, running, completed, failed
  },

  // 样式配置
  styles: {
    classic: {
      topLeft: '+', topRight: '+', bottomLeft: '+', bottomRight: '+',
      horizontal: '-', vertical: '|',
      progressFilled: '#', progressEmpty: '-',
      width: 44
    },
    double: {
      topLeft: '╔', topRight: '╗', bottomLeft: '╚', bottomRight: '╝',
      horizontal: '═', vertical: '║',
      progressFilled: '█', progressEmpty: '░',
      width: 44
    },
    rounded: {
      topLeft: '╭', topRight: '╮', bottomLeft: '╰', bottomRight: '╯',
      horizontal: '─', vertical: '│',
      progressFilled: '▓', progressEmpty: '░',
      width: 44
    },
    minimal: {
      topLeft: '┌', topRight: '┐', bottomLeft: '└', bottomRight: '┘',
      horizontal: '─', vertical: '│',
      progressFilled: '●', progressEmpty: '○',
      width: 44
    }
  },

  currentStyle: 'classic',

  /**
   * 设置样式
   */
  setStyle(styleName) {
    if (this.styles[styleName]) {
      this.currentStyle = styleName;
    }
    return this;
  },

  /**
   * 设置任务
   */
  setTask(task) {
    this.state.task = task;
    this.state.status = 'running';
    this.addLog('Task: ' + task);
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
   * 注册 Agent
   */
  registerAgent(id, name, model) {
    this.state.agents[id] = { name, model, status: 'IDLE', task: '' };
    return this;
  },

  /**
   * Agent 开始
   */
  agentStart(id, task) {
    if (this.state.agents[id]) {
      this.state.agents[id].status = 'RUN';
      this.state.agents[id].task = task;
      this.addLog(`${this.state.agents[id].name} started: ${task}`);
    }
    return this;
  },

  /**
   * Agent 完成
   */
  agentComplete(id, success = true) {
    if (this.state.agents[id]) {
      this.state.agents[id].status = success ? 'OK' : 'FAIL';
      this.addLog(`${this.state.agents[id].name} ${success ? 'completed' : 'failed'}`);
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
    if (this.state.logs.length > 5) this.state.logs.shift();
    return this;
  },

  /**
   * 完成任务
   */
  complete() {
    this.state.status = 'completed';
    this.state.progress = 100;
    this.addLog('Task completed!');
    return this;
  },

  /**
   * 渲染状态栏
   */
  render() {
    const s = this.styles[this.currentStyle];
    const w = s.width;

    const lines = [];

    // 标题行
    const title = '  UltraWork SanGuo Legion';
    const statusTag = this.state.status === 'completed' ? '[OK]' :
                      this.state.status === 'running' ? '[RUN]' :
                      this.state.status === 'failed' ? '[FAIL]' : '[IDLE]';
    lines.push(`${s.topLeft}${s.horizontal.repeat(w - 2)}${s.topRight}`);
    lines.push(`${s.vertical}${this._pad(title + ' '.repeat(w - title.length - statusTag.length - 2) + statusTag, w - 2)}${s.vertical}`);
    lines.push(`${s.vertical}${s.horizontal.repeat(w - 2)}${s.vertical}`);

    // 任务行
    const taskText = '  Task: ' + (this.state.task || 'Waiting...');
    lines.push(`${s.vertical}${this._pad(this._truncate(taskText, w - 2), w - 2)}${s.vertical}`);

    // 进度行
    const filled = Math.round(this.state.progress / 100 * 20);
    const empty = 20 - filled;
    const progressBar = s.progressFilled.repeat(filled) + s.progressEmpty.repeat(empty);
    lines.push(`${s.vertical}${this._pad(`  Progress: [${progressBar}] ${this.state.progress}%`, w - 2)}${s.vertical}`);

    lines.push(`${s.vertical}${s.horizontal.repeat(w - 2)}${s.vertical}`);

    // Agent 行
    lines.push(`${s.vertical}${this._pad('  Agents:', w - 2)}${s.vertical}`);
    for (const agent of Object.values(this.state.agents)) {
      const statusIcon = agent.status === 'OK' ? '[OK]  ' :
                        agent.status === 'RUN' ? '[RUN] ' :
                        agent.status === 'FAIL' ? '[FAIL]' : '[IDLE]';
      const dots = '.'.repeat(Math.max(0, 5 - (agent.task.length > 0 ? agent.task.slice(0, 5).length : 0)));
      const taskDisplay = agent.task ? this._truncate(agent.task, 10) : 'waiting';
      lines.push(`${s.vertical}${this._pad(`    ${statusIcon} ${this._truncate(agent.name, 10)} ${dots} ${taskDisplay}`, w - 2)}${s.vertical}`);
    }

    lines.push(`${s.vertical}${s.horizontal.repeat(w - 2)}${s.vertical}`);

    // 日志行
    lines.push(`${s.vertical}${this._pad('  Log:', w - 2)}${s.vertical}`);
    const lastLog = this.state.logs[this.state.logs.length - 1];
    if (lastLog) {
      lines.push(`${s.vertical}${this._pad(`    [${lastLog.time}] >> ${this._truncate(lastLog.message, 28)}`, w - 2)}${s.vertical}`);
    }

    lines.push(`${s.bottomLeft}${s.horizontal.repeat(w - 2)}${s.bottomRight}`);

    return lines.join('\n');
  },

  /**
   * 辅助函数
   */
  _pad(str, len) {
    return str + ' '.repeat(Math.max(0, len - this._stripAnsi(str).length));
  },

  _truncate(str, maxLen) {
    if (!str) return '';
    const stripped = this._stripAnsi(str);
    return stripped.length > maxLen ? stripped.slice(0, maxLen - 2) + '..' : str;
  },

  _stripAnsi(str) {
    return str.replace(/\x1b\[[0-9;]*m/g, '');
  },

  /**
   * 快速输出
   */
  toString() {
    return this.render();
  }
};

module.exports = StatusBar;

// 测试
if (require.main === module) {
  StatusBar
    .setStyle('classic')
    .setTask('Implement user login feature')
    .registerAgent('zhuge', 'ZhugeLiang', 'glm-5')
    .registerAgent('zhao', 'ZhaoYun', 'kimik2.5')
    .registerAgent('sima', 'SimaYi', 'qwen3.5-coder')
    .setProgress(10);

  console.log('\n=== Classic Style ===\n');
  console.log(StatusBar.render());

  StatusBar.agentStart('zhuge', 'intent analysis');
  StatusBar.setProgress(30);
  console.log('\n=== After Intent Analysis ===\n');
  console.log(StatusBar.render());

  StatusBar.agentComplete('zhuge');
  StatusBar.agentStart('zhao', 'coding');
  StatusBar.agentStart('sima', 'exploring');
  StatusBar.setProgress(60);
  console.log('\n=== During Execution ===\n');
  console.log(StatusBar.render());

  StatusBar.agentComplete('sima');
  StatusBar.agentComplete('zhao');
  StatusBar.complete();
  console.log('\n=== Completed ===\n');
  console.log(StatusBar.render());

  // 其他样式
  console.log('\n=== Double Style ===\n');
  StatusBar.setStyle('double');
  console.log(StatusBar.render());

  console.log('\n=== Rounded Style ===\n');
  StatusBar.setStyle('rounded');
  console.log(StatusBar.render());

  console.log('\n=== Minimal Style ===\n');
  StatusBar.setStyle('minimal');
  console.log(StatusBar.render());
}