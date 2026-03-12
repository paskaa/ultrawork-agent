/**
 * UltraWork Multi-Task Manager V4 - With Full Web Panel
 * 支持多任务并行执行 + 完整Web面板
 */

const http = require('http');
const crypto = require('crypto');
const { EventEmitter } = require('events');

const PORT = process.env.ULTRAWORK_PORT || 3459;
const MAX_TASKS = 10;

// 任务管理器
class TaskManager {
  constructor() {
    this.tasks = new Map();
    this.events = new EventEmitter();
    this.wsClients = new Set();
    setInterval(() => this.cleanupCompletedTasks(), 60000);
  }

  createTask(title) {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const taskState = {
      id: taskId,
      title: title || '未命名任务',
      progress: 0,
      status: 'running',
      agents: this.initAgents(),
      logs: [],
      phases: {},
      startTime: Date.now(),
      endTime: null,
      elapsedTime: 0,
      createdAt: Date.now()
    };

    this.tasks.set(taskId, taskState);
    this.broadcast({ type: 'task_created', data: taskState });
    console.log(`[TaskManager] 任务创建: ${taskId} - ${title}`);
    return taskState;
  }

  initAgents() {
    const agents = {};
    const agentConfigs = {
      zhugeliang: { name: '诸葛亮', role: '主帅/调度器', icon: '🎯', model: 'GLM-5', level: '主帅' },
      zhouyu: { name: '周瑜', role: '大都督/战略规划', icon: '📜', model: 'GLM-5', level: '大都督' },
      zhaoyun: { name: '赵云', role: '大将/深度执行', icon: '⚔️', model: 'Qwen3.5-Plus', level: '五虎大将' },
      simayi: { name: '司马懿', role: '大将/情报侦察', icon: '🔍', model: 'MiniMax-M2.5', level: '五虎大将' },
      guanyu: { name: '关羽', role: '大将/质量守护', icon: '🛡️', model: 'Qwen3.5-Plus', level: '五虎大将' },
      zhangfei: { name: '张飞', role: '大将/快速突击', icon: '🔥', model: 'MiniMax-M2.5', level: '五虎大将' },
      machao: { name: '马超', role: '大将/后备统领', icon: '🏇', model: 'GLM-5', level: '五虎大将' },
      huangzhong: { name: '黄忠', role: '大将/资深专家', icon: '🏹', model: 'Qwen3.5-Plus', level: '五虎大将' },
      lusu: { name: '鲁肃', role: '部将/资源规划', icon: '📦', model: 'MiniMax-M2.5', level: '诸葛亮部将' },
      huanggai: { name: '黄盖', role: '部将/执行落地', icon: '🚀', model: 'Qwen3.5-Plus', level: '诸葛亮部将' },
      xushu: { name: '徐庶', role: '部将/测试专家', icon: '✅', model: 'Qwen3.5-Plus', level: '诸葛亮部将' },
      gaoshun: { name: '高顺', role: '部将/前端开发', icon: '🎨', model: 'Qwen-Coder-Plus', level: '赵云部将' },
      chendao: { name: '陈到', role: '部将/后端开发', icon: '🔧', model: 'Qwen-Coder-Plus', level: '赵云部将' },
      simashi: { name: '司马师', role: '部将/深度分析', icon: '🔬', model: 'MiniMax-M2.5', level: '司马懿部将' },
      guanping: { name: '关平', role: '部将/代码审查', icon: '📋', model: 'Qwen3.5-Plus', level: '关羽部将' },
      leixu: { name: '雷绪', role: '部将/快速定位', icon: '🔎', model: 'MiniMax-M2.5', level: '张飞部将' },
      manchong: { name: '满宠', role: '监察指挥官', icon: '👁️', model: 'GLM-5', level: '监察团队' }
    };

    Object.keys(agentConfigs).forEach(id => {
      agents[id] = { id, ...agentConfigs[id], status: 'idle', task: '', progress: 0, startTime: null, endTime: null, logs: [] };
    });

    return agents;
  }

  getAllTasks() {
    return Array.from(this.tasks.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  getTask(taskId) {
    return this.tasks.get(taskId);
  }

  updateTask(taskId, updates) {
    const task = this.tasks.get(taskId);
    if (!task) return null;
    Object.assign(task, updates);
    task.elapsedTime = Date.now() - task.startTime;
    this.broadcast({ type: 'task_updated', data: task });
    return task;
  }

  updateAgent(taskId, agentId, updates) {
    const task = this.tasks.get(taskId);
    if (!task || !task.agents[agentId]) return null;
    Object.assign(task.agents[agentId], updates);
    this.broadcast({ type: 'agent_updated', taskId, agentId, agent: task.agents[agentId] });
    return task.agents[agentId];
  }

  addLog(taskId, agentId, message, type = 'action') {
    const task = this.tasks.get(taskId);
    if (!task) return null;
    const logEntry = { time: Date.now(), agent: task.agents[agentId]?.name || agentId, agentId, message, type, taskId };
    task.logs.push(logEntry);
    if (task.logs.length > 500) task.logs = task.logs.slice(-500);
    this.broadcast({ type: 'log_added', taskId, log: logEntry });
    return logEntry;
  }

  completeTask(taskId, status = 'completed') {
    const task = this.tasks.get(taskId);
    if (!task) return null;
    task.status = status;
    task.progress = 100;
    task.endTime = Date.now();
    task.elapsedTime = task.endTime - task.startTime;
    Object.values(task.agents).forEach(agent => {
      if (agent.status === 'running') {
        agent.status = 'completed';
        agent.endTime = Date.now();
      }
    });
    this.broadcast({ type: 'task_completed', taskId, data: task });
    console.log(`[TaskManager] 任务完成: ${taskId}`);
    return task;
  }

  cleanupCompletedTasks() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    for (const [taskId, task] of this.tasks) {
      if ((task.status === 'completed' || task.status === 'failed') && task.endTime && (now - task.endTime > oneHour)) {
        this.tasks.delete(taskId);
        console.log(`[TaskManager] 清理任务: ${taskId}`);
      }
    }
  }

  broadcast(data) {
    const message = JSON.stringify(data);
    this.wsClients.forEach(client => {
      if (!client.destroyed) sendWebSocketFrame(client, message);
    });
  }

  addClient(socket) {
    this.wsClients.add(socket);
    sendWebSocketFrame(socket, JSON.stringify({ type: 'init', data: { tasks: this.getAllTasks(), taskCount: this.tasks.size } }));
  }

  removeClient(socket) {
    this.wsClients.delete(socket);
  }
}

function sendWebSocketFrame(socket, message) {
  if (socket.destroyed) return;
  const length = Buffer.byteLength(message);
  let frame;
  if (length < 126) {
    frame = Buffer.allocUnsafe(2 + length);
    frame[0] = 0x81; frame[1] = length; frame.write(message, 2);
  } else if (length < 65536) {
    frame = Buffer.allocUnsafe(4 + length);
    frame[0] = 0x81; frame[1] = 126; frame.writeUInt16BE(length, 2); frame.write(message, 4);
  } else {
    frame = Buffer.allocUnsafe(10 + length);
    frame[0] = 0x81; frame[1] = 127; frame.writeBigUInt64BE(BigInt(length), 2); frame.write(message, 10);
  }
  try { socket.write(frame); } catch (e) {}
}

const taskManager = new TaskManager();

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  if (pathname === '/api/tasks' && req.method === 'POST') {
    parseBody(req, (body) => {
      const task = taskManager.createTask(body.title);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, task }));
    });
    return;
  }

  if (pathname === '/api/tasks' && req.method === 'GET') {
    const tasks = taskManager.getAllTasks();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, tasks, taskCount: tasks.length, runningCount: tasks.filter(t => t.status === 'running').length }));
    return;
  }

  if (pathname.startsWith('/api/tasks/') && req.method === 'GET') {
    const taskId = pathname.split('/')[3];
    const task = taskManager.getTask(taskId);
    if (task) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, task }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Task not found' }));
    }
    return;
  }

  if (pathname.startsWith('/api/tasks/') && req.method === 'PUT') {
    const taskId = pathname.split('/')[3];
    parseBody(req, (body) => {
      const task = taskManager.updateTask(taskId, body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, task }));
    });
    return;
  }

  if (pathname.startsWith('/api/tasks/') && pathname.endsWith('/complete') && req.method === 'POST') {
    const taskId = pathname.split('/')[3];
    parseBody(req, (body) => {
      const task = taskManager.completeTask(taskId, body.status);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, task }));
    });
    return;
  }

  if (pathname.startsWith('/api/tasks/') && pathname.includes('/agents/') && req.method === 'POST') {
    const parts = pathname.split('/');
    const taskId = parts[3];
    const agentId = parts[5];
    parseBody(req, (body) => {
      const agent = taskManager.updateAgent(taskId, agentId, body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, agent }));
    });
    return;
  }

  if (pathname.startsWith('/api/tasks/') && pathname.endsWith('/logs') && req.method === 'POST') {
    const taskId = pathname.split('/')[3];
    parseBody(req, (body) => {
      const log = taskManager.addLog(taskId, body.agentId, body.message, body.type);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, log }));
    });
    return;
  }

  if (pathname === '/' || pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(generateWebPanel());
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.on('upgrade', (request, socket, head) => {
  if (request.headers.upgrade === 'websocket') {
    handleWebSocket(request, socket);
  } else {
    socket.end();
  }
});

function handleWebSocket(req, socket) {
  const key = req.headers['sec-websocket-key'];
  if (!key) { socket.destroy(); return; }

  const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  const response = ['HTTP/1.1 101 Switching Protocols', 'Upgrade: websocket', 'Connection: Upgrade', `Sec-WebSocket-Accept: ${accept}`, '', ''].join('\r\n');

  socket.write(response);
  taskManager.addClient(socket);

  socket.on('data', (data) => {
    console.log('[WebSocket] 收到数据');
  });

  socket.on('close', () => taskManager.removeClient(socket));
  socket.on('error', () => taskManager.removeClient(socket));
}

function parseBody(req, callback) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try { callback(JSON.parse(body)); } catch (e) { callback({}); }
  });
}

function generateWebPanel() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UltraWork V4 - 三国军团多任务指挥中心</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
            background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
            color: #e0e0e0;
            min-height: 100vh;
        }
        .header {
            background: rgba(0, 0, 0, 0.4);
            padding: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
        }
        .header-content {
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            background: linear-gradient(90deg, #00d4ff, #7b2cbf);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .session-selector {
            margin-top: 10px;
        }
        .session-selector select {
            background: rgba(0, 0, 0, 0.5);
            color: #00d4ff;
            border: 1px solid rgba(0, 212, 255, 0.3);
            padding: 8px 15px;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            min-width: 300px;
        }
        .session-selector select:hover {
            border-color: rgba(0, 212, 255, 0.6);
        }
        .session-selector select option {
            background: #1a1a2e;
            color: #e0e0e0;
        }
        .stats {
            display: flex;
            gap: 20px;
        }
        .stat-item {
            text-align: center;
            padding: 10px 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
        }
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #00d4ff;
        }
        .stat-label {
            font-size: 12px;
            color: #888;
        }
        .container {
            max-width: 1400px;
            margin: 20px auto;
            padding: 0 20px;
        }
        .task-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
            gap: 20px;
        }
        .task-card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .task-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 32px rgba(0, 212, 255, 0.2);
        }
        .task-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .task-title {
            font-size: 18px;
            font-weight: bold;
            color: #fff;
        }
        .task-status {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
        }
        .status-running { background: rgba(0, 212, 255, 0.3); color: #00d4ff; }
        .status-completed { background: rgba(0, 255, 136, 0.3); color: #00ff88; }
        .status-failed { background: rgba(255, 68, 68, 0.3); color: #ff4444; }
        .progress-bar {
            height: 6px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
            margin-bottom: 15px;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #00d4ff, #7b2cbf);
            border-radius: 3px;
            transition: width 0.3s;
        }
        .agents-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            gap: 8px;
            margin-top: 15px;
        }
        .agent-badge {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 8px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            text-align: center;
            font-size: 11px;
        }
        .agent-icon {
            font-size: 20px;
            margin-bottom: 4px;
        }
        .agent-name {
            color: #ccc;
            margin-bottom: 2px;
        }
        .agent-status {
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 4px;
        }
        .agent-idle { background: rgba(255, 255, 255, 0.1); color: #888; }
        .agent-running { background: rgba(0, 212, 255, 0.3); color: #00d4ff; }
        .agent-completed { background: rgba(0, 255, 136, 0.3); color: #00ff88; }
        .logs-container {
            margin-top: 15px;
            max-height: 150px;
            overflow-y: auto;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            padding: 10px;
        }
        .log-entry {
            font-size: 12px;
            padding: 4px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            gap: 10px;
        }
        .log-time { color: #888; }
        .log-agent { color: #00d4ff; }
        .log-message { color: #ccc; }
        .connection-status {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
        }
        .connected { background: rgba(0, 255, 136, 0.3); color: #00ff88; }
        .disconnected { background: rgba(255, 68, 68, 0.3); color: #ff4444; }
        .empty-state {
            text-align: center;
            padding: 60px;
            color: #888;
        }
        .empty-state-icon {
            font-size: 64px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-content">
            <div>
                <div class="title">🏰 UltraWork V4 - 三国军团多任务指挥中心</div>
                <div class="session-selector">
                    <select id="sessionSelect" onchange="selectSession(this.value)">
                        <option value="">未选择 Session</option>
                    </select>
                </div>
            </div>
            <div class="stats">
                <div class="stat-item">
                    <div class="stat-value" id="totalTasks">0</div>
                    <div class="stat-label">总任务</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="runningTasks">0</div>
                    <div class="stat-label">进行中</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="completedTasks">0</div>
                    <div class="stat-label">已完成</div>
                </div>
            </div>
        </div>
    </div>

    <div class="container">
        <div id="taskContainer" class="task-grid"></div>
    </div>

    <div id="connectionStatus" class="connection-status disconnected">🔴 未连接</div>

    <script>
        let tasks = [];
        let ws = null;
        let selectedSessionId = null;

        function connectWebSocket() {
            ws = new WebSocket('ws://localhost:3459/ws');
            
            ws.onopen = () => {
                console.log('WebSocket 已连接');
                updateConnectionStatus(true);
            };
            
            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                handleWebSocketMessage(message);
            };
            
            ws.onclose = () => {
                console.log('WebSocket 已断开');
                updateConnectionStatus(false);
                setTimeout(connectWebSocket, 3000);
            };
            
            ws.onerror = (error) => {
                console.error('WebSocket 错误:', error);
                updateConnectionStatus(false);
            };
        }

        function updateConnectionStatus(connected) {
            const status = document.getElementById('connectionStatus');
            if (connected) {
                status.textContent = '🟢 已连接';
                status.className = 'connection-status connected';
            } else {
                status.textContent = '🔴 未连接';
                status.className = 'connection-status disconnected';
            }
        }

        function selectSession(taskId) {
            selectedSessionId = taskId;
            console.log('选择 Session:', taskId);
            
            // 高亮显示选中的任务
            document.querySelectorAll('.task-card').forEach(card => {
                card.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                card.style.boxShadow = 'none';
            });
            
            if (taskId) {
                const selectedCard = document.getElementById('task-' + taskId);
                if (selectedCard) {
                    selectedCard.style.border = '2px solid #00d4ff';
                    selectedCard.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.5)';
                    selectedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }

        function handleWebSocketMessage(message) {
            switch (message.type) {
                case 'init':
                    tasks = message.data.tasks;
                    renderTasks();
                    break;
                case 'task_created':
                    tasks.unshift(message.data);
                    renderTasks();
                    break;
                case 'task_updated':
                    updateTask(message.data);
                    break;
                case 'task_completed':
                    updateTask(message.data);
                    break;
                case 'agent_updated':
                    updateAgent(message.taskId, message.agentId, message.agent);
                    break;
                case 'log_added':
                    addLog(message.taskId, message.log);
                    break;
            }
            updateStats();
        }

        function updateStats() {
            document.getElementById('totalTasks').textContent = tasks.length;
            document.getElementById('runningTasks').textContent = tasks.filter(t => t.status === 'running').length;
            document.getElementById('completedTasks').textContent = tasks.filter(t => t.status === 'completed').length;
            
            // 更新 Session 选择器
            const sessionSelect = document.getElementById('sessionSelect');
            const currentValue = sessionSelect.value;
            
            // 保存当前选项，如果它不在任务列表中
            let optionsHTML = '<option value="">未选择 Session</option>';
            
            tasks.forEach(task => {
                const statusIcon = task.status === 'running' ? '🟢' : 
                                  task.status === 'completed' ? '✅' : '⚪';
                optionsHTML += '<option value="' + task.id + '"' + 
                              (task.id === currentValue ? ' selected' : '') + '>' +
                              statusIcon + ' ' + task.title + ' (' + task.status + ')' +
                              '</option>';
            });
            
            sessionSelect.innerHTML = optionsHTML;
            
            // 如果之前有选中的 session，但现在不在列表中了，清空选择
            if (currentValue && !tasks.find(t => t.id === currentValue)) {
                selectedSessionId = null;
                sessionSelect.value = '';
            }
        }

        function renderTasks() {
            const container = document.getElementById('taskContainer');
            
            if (tasks.length === 0) {
                container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><div>暂无任务</div></div>';
                return;
            }
            
            container.innerHTML = tasks.map(task => generateTaskCard(task)).join('');
        }

        function generateTaskCard(task) {
            const runningAgents = Object.values(task.agents).filter(a => a.status === 'running');
            const recentLogs = task.logs.slice(-5);
            
            return \`
                <div class="task-card" id="task-\${task.id}">
                    <div class="task-header">
                        <div class="task-title">\${task.title}</div>
                        <span class="task-status status-\${task.status}">\${getStatusText(task.status)}</span>
                    </div>
                    
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: \${task.progress}%"></div>
                    </div>
                    
                    <div class="agents-grid">
                        \${Object.values(task.agents).map(agent => \`
                            <div class="agent-badge" id="agent-\${task.id}-\${agent.id}">
                                <div class="agent-icon">\${agent.icon}</div>
                                <div class="agent-name">\${agent.name}</div>
                                <div class="agent-status agent-\${agent.status}">\${getAgentStatusText(agent.status)}</div>
                            </div>
                        \`).join('')}
                    </div>
                    
                    <div class="logs-container" id="logs-\${task.id}">
                        \${recentLogs.map(log => \`
                            <div class="log-entry">
                                <span class="log-time">\${formatTime(log.time)}</span>
                                <span class="log-agent">\${log.agent}</span>
                                <span class="log-message">\${log.message}</span>
                            </div>
                        \`).join('')}
                    </div>
                </div>
            \`;
        }

        function updateTask(taskData) {
            const index = tasks.findIndex(t => t.id === taskData.id);
            if (index !== -1) {
                tasks[index] = taskData;
                renderTasks();
            }
        }

        function updateAgent(taskId, agentId, agentData) {
            const task = tasks.find(t => t.id === taskId);
            if (task && task.agents[agentId]) {
                task.agents[agentId] = agentData;
                const badge = document.getElementById(\`agent-\${taskId}-\${agentId}\`);
                if (badge) {
                    badge.querySelector('.agent-status').textContent = getAgentStatusText(agentData.status);
                    badge.querySelector('.agent-status').className = \`agent-status agent-\${agentData.status}\`;
                }
            }
        }

        function addLog(taskId, logData) {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                task.logs.push(logData);
                const logsContainer = document.getElementById(\`logs-\${taskId}\`);
                if (logsContainer) {
                    const logEntry = document.createElement('div');
                    logEntry.className = 'log-entry';
                    logEntry.innerHTML = \`
                        <span class="log-time">\${formatTime(logData.time)}</span>
                        <span class="log-agent">\${logData.agent}</span>
                        <span class="log-message">\${logData.message}</span>
                    \`;
                    logsContainer.appendChild(logEntry);
                    logsContainer.scrollTop = logsContainer.scrollHeight;
                }
            }
        }

        function getStatusText(status) {
            const map = { running: '进行中', completed: '已完成', failed: '失败', paused: '暂停', idle: '空闲' };
            return map[status] || status;
        }

        function getAgentStatusText(status) {
            const map = { idle: '空闲', running: '执行中', completed: '已完成' };
            return map[status] || status;
        }

        function formatTime(timestamp) {
            const date = new Date(timestamp);
            return date.toTimeString().split(' ')[0];
        }

        // 启动
        connectWebSocket();
        
        // 定期刷新
        setInterval(() => {
            fetch('/api/tasks')
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        tasks = data.tasks;
                        renderTasks();
                        updateStats();
                    }
                })
                .catch(console.error);
        }, 5000);
    </script>
</body>
</html>`;
}

server.listen(PORT, () => {
  console.log('=== UltraWork V4 Multi-Task Server ===');
  console.log('Status: RUNNING on port ' + PORT);
  console.log('Web Panel: http://localhost:' + PORT);
  console.log('API: http://localhost:' + PORT + '/api/tasks');
  console.log('WebSocket: ws://localhost:' + PORT + '/ws');
});

module.exports = { taskManager, server };
