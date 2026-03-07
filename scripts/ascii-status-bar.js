/**
 * AsciiStatusBar - ASCII Status Bar
 * ANSI colors + ASCII chars (compatible with all terminals)
 */

const AsciiStatusBar = {
  state: {
    task: '',
    progress: 0,
    agents: [],
    logs: [],
    status: 'idle'
  },

  c: {
    r: '\x1b[0m',
    b: '\x1b[1m',
    d: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
  },

  setTask(task) {
    this.state.task = task;
    this.state.status = 'running';
    return this;
  },

  setProgress(percent) {
    this.state.progress = Math.min(100, Math.max(0, percent));
    return this;
  },

  addAgent(name, alias, model, status = 'IDLE', task = '') {
    this.state.agents.push({ name, alias, model, status, task });
    return this;
  },

  updateAgent(name, status, task = '') {
    const agent = this.state.agents.find(a => a.name === name);
    if (agent) {
      agent.status = status;
      agent.task = task;
    }
    return this;
  },

  addLog(message) {
    const time = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    });
    this.state.logs.push({ time, message });
    if (this.state.logs.length > 3) this.state.logs.shift();
    return this;
  },

  drawProgress(width = 20) {
    const filled = Math.round(this.state.progress / 100 * width);
    const empty = width - filled;
    return '#'.repeat(filled) + '-'.repeat(empty);
  },

  getStatus(status) {
    switch (status) {
      case 'OK': return { mark: '[OK] ', color: this.c.green };
      case 'RUN': return { mark: '[-->]', color: this.c.yellow };
      case 'FAIL': return { mark: '[FAIL]', color: this.c.red };
      default: return { mark: '[   ]', color: this.c.d };
    }
  },

  render() {
    const c = this.c;
    const lines = [];
    const line = '==================================================';

    lines.push(`${c.cyan}${line}${c.r}`);

    const statusTag = this.state.status === 'running' ? '[RUN]' :
                      this.state.status === 'completed' ? '[OK] ' : '[IDLE]';
    lines.push(`${c.b}${c.cyan}  UltraWork SanGuo Legion ${statusTag}${c.r}`);
    lines.push(`${c.yellow}  Task: ${this.state.task || 'Waiting...'}${c.r}`);
    lines.push(`${c.green}  Progress: [${this.drawProgress()}] ${this.state.progress}%${c.r}`);

    lines.push(`${c.cyan}${'--------------------------------------------------'}${c.r}`);

    lines.push(`${c.b}${c.cyan}  Agents:${c.r}`);
    for (const agent of this.state.agents.slice(0, 6)) {
      const s = this.getStatus(agent.status);
      const task = agent.task || 'waiting';
      lines.push(`    ${s.color}${s.mark}${c.r} ${agent.name}(${agent.alias}) - ${c.d}${task}${c.r}`);
    }

    lines.push(`${c.cyan}${'--------------------------------------------------'}${c.r}`);

    lines.push(`${c.b}${c.cyan}  Log:${c.r}`);
    for (const log of this.state.logs.slice(-3)) {
      lines.push(`    ${c.d}[${log.time}] ${log.message}${c.r}`);
    }

    lines.push(`${c.cyan}${line}${c.r}`);

    return lines.join('\n');
  },

  renderLine() {
    const c = this.c;
    const progress = this.drawProgress(10);
    const runningCount = this.state.agents.filter(a => a.status === 'RUN').length;
    const statusIcon = this.state.status === 'running' ? '-->' :
                       this.state.status === 'completed' ? '[OK]' : '[ ]';

    return `${c.cyan}[UltraWork]${c.r} ${statusIcon} ${this.state.task} | ${c.green}[${progress}] ${this.state.progress}%${c.r} | ${c.yellow}${runningCount} running${c.r}`;
  },

  clear() {},

  print() {
    console.log(this.render());
    return this;
  },

  printLine() {
    console.log(this.renderLine());
    return this;
  }
};

module.exports = AsciiStatusBar;

// Test
if (require.main === module) {
  AsciiStatusBar
    .setTask('Implement user login')
    .setProgress(0)
    .addAgent('ZhugeLiang', 'Kongming', 'Qwen3.5-Plus', 'IDLE')
    .addAgent('ZhaoYun', 'Zilong', 'Qwen-Coder', 'IDLE')
    .addAgent('ZhouYu', 'Gongjin', 'GLM-5', 'IDLE')
    .addAgent('ZhangFei', 'Yide', 'MiniMax', 'IDLE');

  console.log('\n=== Full Status Bar ===\n');
  AsciiStatusBar.print();

  setTimeout(() => {
    AsciiStatusBar
      .updateAgent('ZhugeLiang', 'RUN', 'analyzing')
      .addLog('ZhugeLiang: start analysis')
      .setProgress(20)
      .print();
  }, 500);

  setTimeout(() => {
    AsciiStatusBar
      .updateAgent('ZhugeLiang', 'OK')
      .updateAgent('ZhaoYun', 'RUN', 'coding')
      .addLog('ZhaoYun: start coding')
      .setProgress(50)
      .print();
  }, 1000);

  setTimeout(() => {
    AsciiStatusBar
      .updateAgent('ZhaoYun', 'OK')
      .updateAgent('ZhangFei', 'RUN', 'testing')
      .addLog('ZhangFei: testing')
      .setProgress(80)
      .print();
  }, 1500);

  setTimeout(() => {
    AsciiStatusBar
      .updateAgent('ZhangFei', 'OK')
      .addLog('Task completed!')
      .setProgress(100)
      .print();

    console.log('\n=== One Line Status ===\n');
    AsciiStatusBar.printLine();
  }, 2000);
}
