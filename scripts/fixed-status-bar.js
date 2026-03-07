/**
 * Fixed Status Bar - 使用 blessed 实现真正的终端固定状态栏
 * 状态栏会固定在终端窗口的右侧，不会随输出滚动
 */

const blessed = require('blessed');

const FixedStatusBar = {
  screen: null,
  statusBox: null,
  logBox: null,
  agents: {},
  currentTask: '',
  progress: 0,
  logs: [],

  /**
   * 初始化固定状态栏
   */
  init() {
    // 创建 blessed screen
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'UltraWork 三国军团',
      fullUnicode: true, // 支持中文和 emoji
    });

    // 创建右侧状态栏容器
    this.statusBox = blessed.box({
      parent: this.screen,
      right: 0,
      top: 0,
      width: 38,
      height: '100%',
      tags: true,
      border: {
        type: 'line'
      },
      style: {
        border: { fg: 'cyan' },
        bg: 'black',
      },
      label: ' 🏰 UltraWork ',
    });

    // 任务显示
    this.taskBox = blessed.box({
      parent: this.statusBox,
      top: 1,
      left: 1,
      width: 34,
      height: 3,
      tags: true,
      style: { bg: 'black' },
    });

    // 进度条
    this.progressBox = blessed.box({
      parent: this.statusBox,
      top: 4,
      left: 1,
      width: 34,
      height: 3,
      tags: true,
      style: { bg: 'black' },
    });

    // 将领状态
    this.agentBox = blessed.box({
      parent: this.statusBox,
      top: 7,
      left: 1,
      width: 34,
      height: 12,
      tags: true,
      style: { bg: 'black' },
    });

    // 日志区域
    this.logBox = blessed.box({
      parent: this.statusBox,
      bottom: 1,
      left: 1,
      width: 34,
      height: 10,
      tags: true,
      scrollable: true,
      alwaysScroll: true,
      style: { bg: 'black' },
    });

    // 退出按键
    this.screen.key(['escape', 'q', 'C-c'], () => {
      this.destroy();
      process.exit(0);
    });

    // 初始渲染
    this.render();
  },

  /**
   * 设置任务
   */
  setTask(task) {
    this.currentTask = task;
    this.addLog('📋 ' + task);
    this.render();
  },

  /**
   * 设置进度
   */
  setProgress(percent) {
    this.progress = Math.min(100, Math.max(0, percent));
    this.render();
  },

  /**
   * 注册 Agent
   */
  registerAgent(id, name, alias, model) {
    this.agents[id] = {
      id, name, alias, model,
      status: 'idle',
      progress: 0,
      task: ''
    };
    this.addLog(`🎖️ ${name}(${alias}) 就绪`);
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
      this.addLog(`⚔️ ${this.agents[id].name} 出征: ${task}`);
      this.render();
    }
  },

  /**
   * Agent 进度
   */
  agentProgress(id, percent, message = '') {
    if (this.agents[id]) {
      this.agents[id].progress = percent;
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
    if (this.logs.length > 20) {
      this.logs.shift();
    }
    this.render();
  },

  /**
   * 渲染状态栏
   */
  render() {
    if (!this.screen) return;

    // 渲染任务
    const taskText = this.currentTask || '等待指令...';
    this.taskBox.setContent(`{cyan-fg}📋 军令:{/cyan-fg} ${this._truncate(taskText, 24)}`);

    // 渲染进度条
    const filled = Math.round(this.progress / 100 * 20);
    const empty = 20 - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    this.progressBox.setContent(`{cyan-fg}📊 进度:{/cyan-fg} [${bar}] ${this.progress}%`);

    // 渲染将领状态
    const agentLines = ['{bold}🎖️ 将领状态:{/bold}', ''];
    for (const agent of Object.values(this.agents)) {
      const icon = {
        'idle': '⏸️',
        'running': '🔄',
        'completed': '✅',
        'failed': '❌'
      }[agent.status] || '⏸️';

      const color = {
        'idle': 'white',
        'running': 'cyan',
        'completed': 'green',
        'failed': 'red'
      }[agent.status] || 'white';

      const miniBar = this._miniBar(agent.progress);
      const task = agent.task ? this._truncate(agent.task, 10) : '待命';

      agentLines.push(`{${color}-fg}${icon} ${agent.name}(${agent.alias}){/} ${miniBar} ${task}`);
    }
    this.agentBox.setContent(agentLines.join('\n'));

    // 渲染日志
    const logLines = ['{bold}📜 执行日志:{/bold}', ''];
    for (const log of this.logs.slice(-6)) {
      logLines.push(`{white-fg}[${log.time}]{/} ${this._truncate(log.message, 22)}`);
    }
    this.logBox.setContent(logLines.join('\n'));

    // 刷新屏幕
    this.screen.render();
  },

  /**
   * 迷你进度条
   */
  _miniBar(percent) {
    const filled = Math.round(percent / 100 * 5);
    return '█'.repeat(filled) + '░'.repeat(5 - filled);
  },

  /**
   * 截断文本
   */
  _truncate(text, maxLen) {
    if (!text) return '';
    return text.length > maxLen ? text.slice(0, maxLen - 2) + '..' : text;
  },

  /**
   * 销毁
   */
  destroy() {
    if (this.screen) {
      this.screen.destroy();
      this.screen = null;
    }
  }
};

module.exports = FixedStatusBar;

// CLI 测试
if (require.main === module) {
  FixedStatusBar.init();

  // 注册将领
  FixedStatusBar.registerAgent('zhugeliang', '诸葛亮', '孔明', 'glm-5');
  FixedStatusBar.registerAgent('zhaoyun', '赵云', '子龙', 'kimik2.5');
  FixedStatusBar.registerAgent('simayi', '司马懿', '仲达', 'qwen3.5-coder');

  // 模拟任务执行
  let progress = 0;
  FixedStatusBar.setTask('实现用户登录功能');

  const interval = setInterval(() => {
    progress += 10;
    FixedStatusBar.setProgress(progress);

    if (progress === 20) {
      FixedStatusBar.agentStart('zhugeliang', '意图分析');
    }
    if (progress === 30) {
      FixedStatusBar.agentProgress('zhugeliang', 50);
    }
    if (progress === 40) {
      FixedStatusBar.agentComplete('zhugeliang');
      FixedStatusBar.agentStart('zhaoyun', '实现登录逻辑');
      FixedStatusBar.agentStart('simayi', '探索代码库');
    }
    if (progress === 60) {
      FixedStatusBar.agentProgress('zhaoyun', 50);
      FixedStatusBar.agentProgress('simayi', 60);
    }
    if (progress === 80) {
      FixedStatusBar.agentProgress('zhaoyun', 80);
      FixedStatusBar.agentComplete('simayi');
    }
    if (progress >= 100) {
      FixedStatusBar.agentComplete('zhaoyun');
      FixedStatusBar.addLog('🎉 任务完成!');
      clearInterval(interval);
    }
  }, 500);
}