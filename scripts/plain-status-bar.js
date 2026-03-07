/**
 * PlainStatusBar - 自适应终端宽度的纯文本状态栏
 */

const PlainStatusBar = {
  state: {
    task: '',
    progress: 0,
    agents: [],
    logs: [],
    status: 'idle',
    startTime: null,
    details: {}
  },

  /**
   * 获取终端宽度
   */
  getWidth() {
    return process.stdout.columns || 80;
  },

  /**
   * 生成指定长度的分隔线
   */
  line(char = '=', width = null) {
    return char.repeat(width || this.getWidth());
  },

  setTask(task) {
    this.state.task = task;
    this.state.status = 'running';
    this.state.startTime = new Date();
    return this;
  },

  setProgress(percent) {
    this.state.progress = Math.min(100, Math.max(0, percent));
    return this;
  },

  setDetail(key, value) {
    this.state.details[key] = value;
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

  addLog(message, level = 'INFO') {
    const time = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    });
    this.state.logs.push({ time, message, level });
    if (this.state.logs.length > 10) this.state.logs.shift();
    return this;
  },

  drawProgress(width = 20) {
    const filled = Math.round(this.state.progress / 100 * width);
    const empty = width - filled;
    return '#'.repeat(filled) + '-'.repeat(empty);
  },

  getStatusMark(status) {
    switch (status) {
      case 'OK': return 'OK ';
      case 'RUN': return '-> ';
      case 'FAIL': return 'X  ';
      default: return '   ';
    }
  },

  getElapsedTime() {
    if (!this.state.startTime) return '00:00';
    const elapsed = Math.floor((new Date() - this.state.startTime) / 1000);
    const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const secs = (elapsed % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  },

  /**
   * 自适应模式 - 根据终端宽度调整，无分隔线
   */
  render() {
    const width = this.getWidth();
    const lines = [];
    const w = width;

    // 行1: 标题 + 状态 + 耗时
    const statusTag = this.state.status === 'running' ? '[执行中]' : '[已完成]';
    const elapsed = this.getElapsedTime();
    const title = `UltraWork 三国军团 ${statusTag}`;
    const rightInfo = `耗时: ${elapsed}`;
    const padding = w - title.length - rightInfo.length - 2;
    lines.push(`${title}${' '.repeat(Math.max(0, padding))}${rightInfo}`);

    // 行2: 任务 + 进度条
    const taskLabel = `任务: ${this.state.task}`;
    const progressWidth = Math.min(30, Math.floor(w / 4));
    const progress = `[${this.drawProgress(progressWidth)}] ${this.state.progress}%`;
    const taskPadding = w - taskLabel.length - progress.length - 2;
    lines.push(`${taskLabel}${' '.repeat(Math.max(0, taskPadding))}${progress}`);

    // 将领状态
    const running = this.state.agents.filter(a => a.status === 'RUN');
    const done = this.state.agents.filter(a => a.status === 'OK').length;
    const total = this.state.agents.length;

    // 行3: 所有将领状态 (一行显示)
    const agentParts = this.state.agents.map(a => {
      const mark = this.getStatusMark(a.status);
      return `${a.name}[${mark}]`;
    });
    const agentLine = `将领: ${agentParts.join(' | ')}  [完成: ${done}/${total}]`;
    lines.push(agentLine.slice(0, w));

    // 行4: 执行中的任务详情
    if (running.length > 0) {
      const runningParts = running.map(a => `${a.name}→${a.task || '执行中'}`);
      const runningLine = `执行中: ${runningParts.join(' | ')}`;
      lines.push(runningLine.slice(0, w));
    }

    // 日志
    const maxLogs = 3;
    const recentLogs = this.state.logs.slice(-maxLogs);
    for (const log of recentLogs) {
      const logLine = `[${log.time}] ${log.message}`;
      lines.push(logLine.slice(0, w));
    }

    // 如果没有日志
    if (recentLogs.length === 0) {
      lines.push('(暂无日志)');
    }

    return lines.join('\n');
  },

  /**
   * Mini模式 - 极简 4 行
   */
  renderMini() {
    const width = this.getWidth();
    const lines = [];

    const running = this.state.agents.filter(a => a.status === 'RUN');
    const done = this.state.agents.filter(a => a.status === 'OK').length;
    const total = this.state.agents.length;

    // 行1: 任务 + 进度
    const progressW = Math.floor(width / 4);
    const line1 = `${this.state.task} [${this.drawProgress(progressW)}] ${this.state.progress}% (${done}/${total})`;
    lines.push(line1.slice(0, width));

    // 行2: 执行中的将领
    if (running.length > 0) {
      const runningInfo = running.map(a => `${a.name}→${a.task}`).join(' | ');
      lines.push(`执行: ${runningInfo}`.slice(0, width));
    } else {
      lines.push(`状态: 已完成 ${done}/${total} 将领`);
    }

    // 行3-4: 最新日志
    const logs = this.state.logs.slice(-2);
    for (const log of logs) {
      lines.push(`[${log.time}] ${log.message}`.slice(0, width));
    }

    return lines.join('\n');
  },

  /**
   * 宽屏模式 - 充分利用宽度，显示更多信息，无分隔线
   */
  renderWide() {
    const width = this.getWidth();
    const lines = [];

    // 行1: 标题行 - 充分利用宽度
    const statusTag = this.state.status === 'running' ? '执行中' : '已完成';
    const elapsed = this.getElapsedTime();
    const done = this.state.agents.filter(a => a.status === 'OK').length;
    const running = this.state.agents.filter(a => a.status === 'RUN').length;
    const failed = this.state.agents.filter(a => a.status === 'FAIL').length;

    const header = `UltraWork 三国军团 [${statusTag}]  |  任务: ${this.state.task}  |  进度: [${this.drawProgress(20)}] ${this.state.progress}%  |  耗时: ${elapsed}  |  完成: ${done}  执行: ${running}  失败: ${failed}`;
    lines.push(header.slice(0, width));

    // 将领表格 - 单行紧凑显示
    const agentCells = this.state.agents.map(a => {
      const mark = this.getStatusMark(a.status);
      return `${a.name}(${a.alias})[${mark}] ${a.task || '-'}`;
    });

    // 根据宽度决定每个 agent 显示多少信息
    const cellWidth = Math.floor((width - 4) / Math.min(this.state.agents.length, 3));
    for (let i = 0; i < this.state.agents.length; i += 3) {
      const rowAgents = agentCells.slice(i, i + 3);
      const row = rowAgents.map(cell => cell.slice(0, cellWidth - 1).padEnd(cellWidth)).join(' | ');
      lines.push(row.slice(0, width));
    }

    // 日志区域 - 显示更多日志
    const logCount = Math.min(5, Math.floor((width - 20) / 30));
    const recentLogs = this.state.logs.slice(-logCount);
    for (const log of recentLogs) {
      const levelMark = log.level === 'ERROR' ? '[ERR]' : log.level === 'WARN' ? '[WRN]' : '[INF]';
      lines.push(`[${log.time}] ${levelMark} ${log.message}`.slice(0, width));
    }

    return lines.join('\n');
  },

  renderLine() {
    const width = this.getWidth();
    const progress = this.drawProgress(Math.floor(width / 8));
    const runningCount = this.state.agents.filter(a => a.status === 'RUN').length;

    return `[UltraWork] ${this.state.task} | [${progress}] ${this.state.progress}% | ${runningCount} 执行中`.slice(0, width);
  },

  clear() {},

  print() {
    const width = this.getWidth();
    // 根据宽度选择显示模式
    if (width >= 100) {
      console.log(this.renderWide());
    } else if (width >= 60) {
      console.log(this.render());
    } else {
      console.log(this.renderMini());
    }
    return this;
  },

  printMini() {
    console.log(this.renderMini());
    return this;
  },

  printWide() {
    console.log(this.renderWide());
    return this;
  }
};

module.exports = PlainStatusBar;

// 测试
if (require.main === module) {
  PlainStatusBar
    .setTask('实现用户登录模块，包含前后端API和数据库设计')
    .setProgress(65)
    .setDetail('平台', 'Qoder')
    .setDetail('分支', 'feature/login')
    .addAgent('诸葛亮', '孔明', 'Qwen3.5-Plus', 'OK', '方案设计完成')
    .addAgent('赵云', '子龙', 'Qwen-Coder-Qoder', 'RUN', '编写后端API')
    .addAgent('周瑜', '公瑾', 'GLM-5', 'OK', '架构评审通过')
    .addAgent('司马懿', '仲达', 'Qwen3.5-Plus', 'RUN', '搜索相关代码')
    .addAgent('关羽', '云长', 'Qwen-Coder-Qoder', 'IDLE', '待命')
    .addAgent('张飞', '翼德', 'MiniMax-M2.5', 'IDLE', '待命');

  PlainStatusBar.addLog('诸葛亮: 完成任务意图分析');
  PlainStatusBar.addLog('周瑜: 登录流程架构设计完成');
  PlainStatusBar.addLog('司马懿: 找到 15 个相关代码文件');
  PlainStatusBar.addLog('赵云: 开始编写 LoginController');
  PlainStatusBar.addLog('创建文件: LoginController.java');
  PlainStatusBar.addLog('创建文件: LoginService.java');

  const width = PlainStatusBar.getWidth();
  console.log(`\n终端宽度: ${width}`);
  console.log('\n=== 自适应模式 ===\n');
  PlainStatusBar.print();

  console.log('\n=== Mini模式 ===\n');
  PlainStatusBar.printMini();

  console.log('\n=== 宽屏模式 ===\n');
  PlainStatusBar.printWide();
}
