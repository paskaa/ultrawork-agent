/**
 * Progress Monitor - 实时进度监控面板
 * 生成 HTML 侧边栏展示任务执行进度
 */

const fs = require('fs');
const path = require('path');

const ProgressMonitor = {
  taskProgress: {},
  agentProgress: {},
  logs: [],
  outputDir: '.ultrawork/monitor',

  /**
   * 初始化监控器
   */
  init() {
    this.taskProgress = {
      total: 0,
      completed: 0,
      failed: 0,
      status: 'idle'
    };
    this.agentProgress = {};
    this.logs = [];

    // 确保输出目录存在
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // 生成初始面板
    this.render();
  },

  /**
   * 开始任务
   */
  startTask(taskId, description) {
    this.taskProgress.total++;
    this.taskProgress.status = 'running';
    this.taskProgress.currentTask = description;
    this.addLog('system', `开始任务: ${description}`);
    this.render();
  },

  /**
   * 完成任务
   */
  completeTask(taskId, success = true) {
    if (success) {
      this.taskProgress.completed++;
      this.addLog('success', `任务完成: ${taskId}`);
    } else {
      this.taskProgress.failed++;
      this.addLog('error', `任务失败: ${taskId}`);
    }

    if (this.taskProgress.completed + this.taskProgress.failed >= this.taskProgress.total) {
      this.taskProgress.status = 'completed';
    }

    this.render();
  },

  /**
   * 注册 Agent
   */
  registerAgent(agentId, name, alias) {
    this.agentProgress[agentId] = {
      id: agentId,
      name: name,
      alias: alias,
      status: 'idle',
      progress: 0,
      task: '',
      startTime: null,
      logs: []
    };
    this.addLog('agent', `[${name}] 准备就绪`);
    this.render();
  },

  /**
   * Agent 开始工作
   */
  agentStart(agentId, task) {
    const agent = this.agentProgress[agentId];
    if (agent) {
      agent.status = 'running';
      agent.task = task;
      agent.progress = 0;
      agent.startTime = Date.now();
      this.addLog('agent', `[${agent.name}] 开始执行: ${task}`);
      this.render();
    }
  },

  /**
   * Agent 进度更新
   */
  agentProgress(agentId, progress, message = '') {
    const agent = this.agentProgress[agentId];
    if (agent) {
      agent.progress = progress;
      if (message) {
        agent.logs.push({ time: Date.now(), message });
        this.addLog('agent', `[${agent.name}] ${message}`);
      }
      this.render();
    }
  },

  /**
   * Agent 完成
   */
  agentComplete(agentId, success = true) {
    const agent = this.agentProgress[agentId];
    if (agent) {
      agent.status = success ? 'completed' : 'failed';
      agent.progress = 100;
      this.addLog(success ? 'success' : 'error',
        `[${agent.name}] ${success ? '完成' : '失败'}: ${agent.task}`);
      this.render();
    }
  },

  /**
   * 添加日志
   */
  addLog(type, message) {
    this.logs.push({
      time: new Date().toISOString(),
      type: type,
      message: message
    });

    // 保留最近 100 条日志
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }
  },

  /**
   * 渲染 HTML 面板
   */
  render() {
    const html = this.generateHTML();
    const outputPath = path.join(this.outputDir, 'progress.html');
    fs.writeFileSync(outputPath, html, 'utf-8');
    return outputPath;
  },

  /**
   * 生成 HTML
   */
  generateHTML() {
    const totalProgress = this.taskProgress.total > 0
      ? Math.round((this.taskProgress.completed + this.taskProgress.failed) / this.taskProgress.total * 100)
      : 0;

    const statusColor = {
      'idle': '#6b7280',
      'running': '#3b82f6',
      'completed': '#10b981'
    }[this.taskProgress.status] || '#6b7280';

    const agents = Object.values(this.agentProgress);
    const agentCards = agents.map(agent => {
      const statusIcon = {
        'idle': '⏸️',
        'running': '🔄',
        'completed': '✅',
        'failed': '❌'
      }[agent.status] || '⏸️';

      const statusColor = {
        'idle': 'gray',
        'running': 'blue',
        'completed': 'green',
        'failed': 'red'
      }[agent.status] || 'gray';

      return `
        <div class="agent-card ${agent.status}">
          <div class="agent-header">
            <span class="agent-icon">${statusIcon}</span>
            <span class="agent-name">${agent.name} (${agent.alias})</span>
            <span class="agent-status ${statusColor}">${agent.status}</span>
          </div>
          <div class="agent-task">${agent.task || '待命中...'}</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${agent.progress}%"></div>
          </div>
          <div class="agent-logs">
            ${agent.logs.slice(-3).map(log =>
              `<div class="log-entry small">${this.formatTime(log.time)} ${log.message}</div>`
            ).join('')}
          </div>
        </div>
      `;
    }).join('');

    const logEntries = this.logs.slice(-20).map(log => {
      const typeClass = {
        'system': 'text-blue',
        'agent': 'text-gray',
        'success': 'text-green',
        'error': 'text-red'
      }[log.type] || 'text-gray';

      return `<div class="log-entry ${typeClass}">
        <span class="log-time">[${this.formatTime(log.time)}]</span>
        <span class="log-message">${log.message}</span>
      </div>`;
    }).join('');

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UltraWork 进度监控</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      min-height: 100vh;
      padding: 20px;
    }
    .container { max-width: 400px; margin: 0 auto; }

    .header {
      text-align: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #334155;
    }
    .header h1 {
      font-size: 24px;
      color: #f8fafc;
      margin-bottom: 8px;
    }
    .header .subtitle {
      font-size: 14px;
      color: #94a3b8;
    }

    .status-bar {
      background: #1e293b;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .status-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .status-label { font-size: 14px; color: #94a3b8; }
    .status-value { font-size: 24px; font-weight: bold; }
    .progress-bar {
      height: 8px;
      background: #334155;
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
      transition: width 0.3s ease;
    }
    .stats {
      display: flex;
      justify-content: space-around;
      margin-top: 12px;
      font-size: 13px;
    }
    .stat { text-align: center; }
    .stat-value { font-weight: bold; font-size: 18px; }
    .stat-label { color: #64748b; }

    .agents-title {
      font-size: 14px;
      color: #94a3b8;
      margin: 16px 0 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .agent-card {
      background: #1e293b;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 8px;
      border-left: 3px solid #334155;
    }
    .agent-card.running { border-left-color: #3b82f6; }
    .agent-card.completed { border-left-color: #10b981; }
    .agent-card.failed { border-left-color: #ef4444; }

    .agent-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .agent-icon { font-size: 16px; }
    .agent-name { font-weight: 500; flex: 1; }
    .agent-status {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .agent-status.blue { background: #1e40af; color: #93c5fd; }
    .agent-status.green { background: #166534; color: #86efac; }
    .agent-status.red { background: #991b1b; color: #fca5a5; }
    .agent-status.gray { background: #374151; color: #9ca3af; }

    .agent-task {
      font-size: 13px;
      color: #94a3b8;
      margin-bottom: 8px;
    }

    .agent-card .progress-bar { height: 4px; }
    .agent-logs { margin-top: 8px; font-size: 11px; color: #64748b; }

    .logs-section {
      background: #1e293b;
      border-radius: 8px;
      padding: 12px;
      margin-top: 16px;
    }
    .logs-title {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    .log-entry {
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 11px;
      padding: 2px 0;
      border-bottom: 1px solid #334155;
    }
    .log-time { color: #64748b; margin-right: 8px; }
    .text-blue { color: #60a5fa; }
    .text-green { color: #34d399; }
    .text-red { color: #f87171; }
    .text-gray { color: #94a3b8; }

    .refresh-hint {
      text-align: center;
      margin-top: 16px;
      font-size: 11px;
      color: #475569;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏰 UltraWork</h1>
      <div class="subtitle">三国军团调度系统</div>
    </div>

    <div class="status-bar">
      <div class="status-header">
        <span class="status-label">总体进度</span>
        <span class="status-value" style="color: ${statusColor}">${totalProgress}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${totalProgress}%"></div>
      </div>
      <div class="stats">
        <div class="stat">
          <div class="stat-value">${this.taskProgress.total}</div>
          <div class="stat-label">总任务</div>
        </div>
        <div class="stat">
          <div class="stat-value" style="color: #34d399">${this.taskProgress.completed}</div>
          <div class="stat-label">已完成</div>
        </div>
        <div class="stat">
          <div class="stat-value" style="color: #f87171">${this.taskProgress.failed}</div>
          <div class="stat-label">失败</div>
        </div>
      </div>
    </div>

    <div class="agents-title">🎖️ 将领状态</div>
    ${agentCards || '<div class="agent-card"><div class="agent-task">暂无活动将领</div></div>'}

    <div class="logs-section">
      <div class="logs-title">📜 执行日志</div>
      ${logEntries || '<div class="log-entry text-gray">暂无日志</div>'}
    </div>

    <div class="refresh-hint">自动刷新 | 实时监控</div>
  </div>

  <script>
    // 自动刷新
    setTimeout(() => location.reload(), 2000);
  </script>
</body>
</html>`;
  },

  /**
   * 格式化时间
   */
  formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
};

module.exports = ProgressMonitor;