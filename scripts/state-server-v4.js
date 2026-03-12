/**
 * UltraWork Multi-Task Manager V4
 * 支持多任务并行执行，Web面板实时显示所有任务状态
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { EventEmitter } = require('events');

const STATE_DIR = path.join(__dirname, '..', '..', '..', '.ultrawork');
const PORT = process.env.ULTRAWORK_PORT || 3459;
const MAX_TASKS = 10; // 最大并行任务数

// 任务管理器
class TaskManager {
  constructor() {
    this.tasks = new Map(); // taskId -> taskState
    this.events = new EventEmitter();
    this.wsClients = new Set();
    
    // 定期清理已完成的任务
    setInterval(() => this.cleanupCompletedTasks(), 60000);
  }
  
  // 创建新任务
  createTask(title) {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const taskState = {
      id: taskId,
      title: title || '未命名任务',
      progress: 0,
      status: 'running', // running, completed, failed, paused
      agents: {},
      logs: [],
      phases: {},
      startTime: Date.now(),
      endTime: null,
      elapsedTime: 0,
      createdAt: Date.now()
    };
    
    // 初始化所有45位将领
    this.initAgents(taskState);
    
    this.tasks.set(taskId, taskState);
    
    // 广播新任务创建
    this.broadcast({
      type: 'task_created',
      data: taskState
    });
    
    console.log(`[TaskManager] ✅ 任务创建: ${taskId} - ${title}`);
    return taskState;
  }
  
  // 初始化将领
  initAgents(taskState) {
    const agentConfigs = {
      // 主帅
      zhugeliang: { name: '诸葛亮', role: '主帅/调度器', icon: '🎯', model: 'GLM-5', level: '主帅' },
      // 大都督
      zhouyu: { name: '周瑜', role: '大都督/战略规划', icon: '📜', model: 'GLM-5', level: '大都督' },
      // 五虎大将
      zhaoyun: { name: '赵云', role: '大将/深度执行', icon: '⚔️', model: 'Qwen3.5-Plus', level: '五虎大将' },
      simayi: { name: '司马懿', role: '大将/情报侦察', icon: '🔍', model: 'MiniMax-M2.5', level: '五虎大将' },
      guanyu: { name: '关羽', role: '大将/质量守护', icon: '🛡️', model: 'Qwen3.5-Plus', level: '五虎大将' },
      zhangfei: { name: '张飞', role: '大将/快速突击', icon: '🔥', model: 'MiniMax-M2.5', level: '五虎大将' },
      machao: { name: '马超', role: '大将/后备统领', icon: '🏇', model: 'GLM-5', level: '五虎大将' },
      huangzhong: { name: '黄忠', role: '大将/资深专家', icon: '🏹', model: 'Qwen3.5-Plus', level: '五虎大将' },
      // 其他部将...
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
      taskState.agents[id] = {
        id,
        ...agentConfigs[id],
        status: 'idle',
        task: '',
        progress: 0,
        startTime: null,
        endTime: null,
        logs: []
      };
    });
  }
  
  // 获取所有任务
  getAllTasks() {
    return Array.from(this.tasks.values()).sort((a, b) => b.createdAt - a.createdAt);
  }
  
  // 获取单个任务
  getTask(taskId) {
    return this.tasks.get(taskId);
  }
  
  // 更新任务
  updateTask(taskId, updates) {
    const task = this.tasks.get(taskId);
    if (!task) return null;
    
    Object.assign(task, updates);
    task.elapsedTime = Date.now() - task.startTime;
    
    this.broadcast({
      type: 'task_updated',
      data: task
    });
    
    return task;
  }
  
  // 更新将领状态
  updateAgent(taskId, agentId, updates) {
    const task = this.tasks.get(taskId);
    if (!task || !task.agents[agentId]) return null;
    
    Object.assign(task.agents[agentId], updates);
    
    this.broadcast({
      type: 'agent_updated',
      taskId,
      agentId,
      agent: task.agents[agentId]
    });
    
    return task.agents[agentId];
  }
  
  // 添加日志
  addLog(taskId, agentId, message, type = 'action') {
    const task = this.tasks.get(taskId);
    if (!task) return null;
    
    const logEntry = {
      time: Date.now(),
      agent: task.agents[agentId]?.name || agentId,
      agentId,
      message,
      type,
      taskId
    };
    
    task.logs.push(logEntry);
    if (task.logs.length > 500) {
      task.logs = task.logs.slice(-500);
    }
    
    this.broadcast({
      type: 'log_added',
      taskId,
      log: logEntry
    });
    
    return logEntry;
  }
  
  // 完成任务
  completeTask(taskId, status = 'completed') {
    const task = this.tasks.get(taskId);
    if (!task) return null;
    
    task.status = status;
    task.progress = 100;
    task.endTime = Date.now();
    task.elapsedTime = task.endTime - task.startTime;
    
    // 重置所有将领状态
    Object.values(task.agents).forEach(agent => {
      if (agent.status === 'running') {
        agent.status = 'completed';
        agent.endTime = Date.now();
      }
    });
    
    this.broadcast({
      type: 'task_completed',
      taskId,
      data: task
    });
    
    console.log(`[TaskManager] ✅ 任务完成: ${taskId}`);
    return task;
  }
  
  // 清理已完成的任务
  cleanupCompletedTasks() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (const [taskId, task] of this.tasks) {
      if ((task.status === 'completed' || task.status === 'failed') && 
          task.endTime && (now - task.endTime > oneHour)) {
        this.tasks.delete(taskId);
        console.log(`[TaskManager] 🗑️ 清理任务: ${taskId}`);
      }
    }
  }
  
  // WebSocket 广播
  broadcast(data) {
    const message = JSON.stringify(data);
    this.wsClients.forEach(client => {
      if (!client.destroyed) {
        sendWebSocketFrame(client, message);
      }
    });
  }
  
  // 添加 WebSocket 客户端
  addClient(socket) {
    this.wsClients.add(socket);
    
    // 发送所有任务列表
    sendWebSocketFrame(socket, JSON.stringify({
      type: 'init',
      data: {
        tasks: this.getAllTasks(),
        taskCount: this.tasks.size
      }
    }));
  }
  
  // 移除客户端
  removeClient(socket) {
    this.wsClients.delete(socket);
  }
}

// WebSocket 帧发送
function sendWebSocketFrame(socket, message) {
  if (socket.destroyed) return;
  
  const length = Buffer.byteLength(message);
  let frame;
  
  if (length < 126) {
    frame = Buffer.allocUnsafe(2 + length);
    frame[0] = 0x81;
    frame[1] = length;
    frame.write(message, 2);
  } else if (length < 65536) {
    frame = Buffer.allocUnsafe(4 + length);
    frame[0] = 0x81;
    frame[1] = 126;
    frame.writeUInt16BE(length, 2);
    frame.write(message, 4);
  } else {
    frame = Buffer.allocUnsafe(10 + length);
    frame[0] = 0x81;
    frame[1] = 127;
    frame.writeBigUInt64BE(BigInt(length), 2);
    frame.write(message, 10);
  }
  
  try {
    socket.write(frame);
  } catch (e) {}
}

// WebSocket 帧解析
function parseWebSocketFrame(buffer) {
  if (buffer.length < 2) return null;
  
  const opcode = buffer[0] & 0x0f;
  if (opcode === 0x08) return null; // 关闭帧
  if (opcode === 0x09) return { type: 'ping' }; // Ping
  
  if (opcode === 0x01 || opcode === 0x02) {
    let offset = 2;
    let payloadLength = buffer[1] & 0x7f;
    
    if (payloadLength === 126) {
      payloadLength = buffer.readUInt16BE(2);
      offset = 4;
    } else if (payloadLength === 127) {
      payloadLength = Number(buffer.readBigUInt64BE(2));
      offset = 10;
    }
    
    const mask = (buffer[1] & 0x80) !== 0;
    let payload = buffer.slice(offset + (mask ? 4 : 0));
    
    if (mask && payload.length >= 4) {
      const maskingKey = buffer.slice(offset, offset + 4);
      payload = Buffer.from(payload.map((byte, i) => byte ^ maskingKey[i % 4]));
    }
    
    try {
      return JSON.parse(payload.toString());
    } catch (e) {
      return payload.toString();
    }
  }
  
  return null;
}

// ═══════════════════════════════════════════════════════════════
// 初始化任务管理器
// ═══════════════════════════════════════════════════════════════
const taskManager = new TaskManager();

// ═══════════════════════════════════════════════════════════════
// HTTP服务器
// ═══════════════════════════════════════════════════════════════
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // API: 创建任务
  if (pathname === '/api/tasks' && req.method === 'POST') {
    parseBody(req, (body) => {
      const task = taskManager.createTask(body.title);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, task }));
    });
    return;
  }

  // API: 获取所有任务
  if (pathname === '/api/tasks' && req.method === 'GET') {
    const tasks = taskManager.getAllTasks();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: true, 
      tasks,
      taskCount: tasks.length,
      runningCount: tasks.filter(t => t.status === 'running').length
    }));
    return;
  }

  // API: 获取单个任务
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

  // API: 更新任务
  if (pathname.startsWith('/api/tasks/') && req.method === 'PUT') {
    const taskId = pathname.split('/')[3];
    parseBody(req, (body) => {
      const task = taskManager.updateTask(taskId, body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, task }));
    });
    return;
  }

  // API: 完成任务
  if (pathname.startsWith('/api/tasks/') && pathname.endsWith('/complete') && req.method === 'POST') {
    const taskId = pathname.split('/')[3];
    parseBody(req, (body) => {
      const task = taskManager.completeTask(taskId, body.status);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, task }));
    });
    return;
  }

  // API: 更新将领状态
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

  // API: 添加日志
  if (pathname.startsWith('/api/tasks/') && pathname.endsWith('/logs') && req.method === 'POST') {
    const taskId = pathname.split('/')[3];
    parseBody(req, (body) => {
      const log = taskManager.addLog(taskId, body.agentId, body.message, body.type);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, log }));
    });
    return;
  }

  // 首页
  if (pathname === '/' || pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(generateWebPanel());
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// WebSocket 升级
server.on('upgrade', (request, socket, head) => {
  if (request.headers.upgrade === 'websocket') {
    handleWebSocket(request, socket);
  } else {
    socket.end();
  }
});

function handleWebSocket(req, socket) {
  const key = req.headers['sec-websocket-key'];
  if (!key) {
    socket.destroy();
    return;
  }
  
  const accept = crypto.createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
    .digest('base64');
  
  const response = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${accept}`,
    '',
    ''
  ].join('\r\n');
  
  socket.write(response);
  taskManager.addClient(socket);
  
  socket.on('data', (data) => {
    const message = parseWebSocketFrame(data);
    if (message) {
      // 处理客户端消息（如订阅特定任务）
      console.log('[WebSocket] 收到:', message);
    }
  });
  
  socket.on('close', () => {
    taskManager.removeClient(socket);
  });
  
  socket.on('error', () => {
    taskManager.removeClient(socket);
  });
}

function parseBody(req, callback) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      callback(JSON.parse(body));
    } catch (e) {
      callback({});
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// Web 面板 HTML
// ═══════════════════════════════════════════════════════════════
function generateWebPanel() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UltraWork 三国军团 - 多任务指挥中心</title>
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
            padding: 16px 24px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
        }
        
        .header-content {
            max-width: 1800px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .header h1 {
            font-size: 22px;
            font-weight: 600;
            background: linear-gradient(90deg, #00d4ff, #7c3aed);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .stats {
            display: flex;
            gap: 20px;
        }
        
        .stat-item {
            text-align: center;
            padding: 8px 16px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
        }
        
        .stat-value {
            font-size: 20px;
            font-weight: 700;
            color: #00d4ff;
        }
        
        .stat-label {
            font-size: 11px;
            color: #64748b;
            margin-top: 4px;
        }
        
        .main-content {
            max-width: 1800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .tasks-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
            gap: 20px;
        }
        
        .task-card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 16px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s;
        }
        
        .task-card:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(0, 212, 255, 0.3);
        }
        
        .task-card.running {
            border-left: 3px solid #00d4ff;
            box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
        }
        
        .task-card.completed {
            border-left: 3px solid #10b981;
        }
        
        .task-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }
        
        .task-title {
            font-size: 14px;
            font-weight: 600;
            color: #f0f0f0;
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        .task-status {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
        }
        
        .status-running { background: rgba(59, 130, 246, 0.3); color: #60a5fa; }
        .status-completed { background: rgba(16, 185, 129, 0.3); color: #34d399; }
        .status-failed { background: rgba(239, 68, 68, 0.3); color: #f87171; }
        
        .task-progress {
            margin-bottom: 12px;
        }
        
        .progress-bar {
            height: 6px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
            overflow: hidden;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #00d4ff, #7c3aed);
            transition: width 0.5s;
            border-radius: 3px;
        }
        
        .progress-text {
            text-align: right;
            font-size: 11px;
            color: #64748b;
            margin-top: 4px;
        }
        
        .task-agents {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: 12px;
        }
        
        .agent-badge {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 4px 8px;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 6px;
            font-size: 11px;
        }
        
        .agent-badge.running {
            background: rgba(0, 212, 255, 0.2);
            border: 1px solid rgba(0, 212, 255, 0.3);
        }
        
        .task-logs {
            max-height: 120px;
            overflow-y: auto;
            font-family: monospace;
            font-size: 11px;
        }
        
        .log-entry {
            padding: 3px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .log-time { color: #64748b; margin-right: 8px; }
        .log-agent { color: #00d4ff; margin-right: 8px; }
        
        .ws-status {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .ws-connected { background: rgba(16, 185, 129, 0.2); color: #34d399; }
        .ws-disconnected { background: rgba(239, 68, 68, 0.2); color: #f87171; }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-content">
            <h1>🏰 UltraWork 三国军团 - 多任务指挥中心</h1>
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

    <div class="main-content">
        <div id="tasksGrid" class="tasks-grid"></div>
    </div>
    
    <div id="wsStatus" class="ws-status ws-disconnected">
        <span>🔴</span> 已断开
    </div>

    <script>
        let ws = null;
        let tasks = [];
        
        // 连接 WebSocket
        function connectWebSocket() {
            const wsStatus = document.getElementById('wsStatus');
            wsStatus.className = 'ws-status ws-disconnected';
            wsStatus.innerHTML = '<span>🔄</span> 连接中...';
            
            ws = new WebSocket('ws://localhost:${PORT}/ws');
            
            ws.onopen = () => {
                wsStatus.className = 'ws-status ws-connected';
                wsStatus.innerHTML = '<span>🟢</span> 实时连接';
            };
            
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                handleWebSocketMessage(data);
            };
            
            ws.onclose = () => {
                wsStatus.className = 'ws-status ws-disconnected';
                wsStatus.innerHTML = '<span>🔴</span> 已断开';
                setTimeout(connectWebSocket, 3000);
            };
        }
        
        function handleWebSocketMessage(data) {
            switch(data.type) {
                case 'init':
                    tasks = data.data.tasks;
                    updateUI();
                    break;
                case 'task_created':
                    tasks.unshift(data.data);
                    updateUI();
                    break;
                case 'task_updated':
                    const taskIndex = tasks.findIndex(t => t.id === data.data.id);
                    if (taskIndex >= 0) {
                        tasks[taskIndex] = data.data;
                        updateTaskCard(data.data);
                    }
                    break;
                case 'agent_updated':
                    const task = tasks.find(t => t.id === data.taskId);
                    if (task) {
                        task.agents[data.agentId] = data.agent;
                        updateTaskCard(task);
                    }
                    break;
                case 'log_added':
                    const taskWithLog = tasks.find(t => t.id === data.taskId);
                    if (taskWithLog) {
                        taskWithLog.logs.push(data.log);
                        updateTaskLogs(taskWithLog);
                    }
                    break;
            }
            updateStats();
        }
        
        function updateUI() {
            const grid = document.getElementById('tasksGrid');
            grid.innerHTML = tasks.map(task => generateTaskCard(task)).join('');
            updateStats();
        }
        
        function generateTaskCard(task) {
            const runningAgents = Object.values(task.agents).filter(a => a.status === 'running');
            const recentLogs = task.logs.slice(-5);
            
            return \`
                <div class="task-card \${task.status}" id="task-\${task.id}">
                    <div class="task-header">
                        <div class="task-title">\${task.title}</div>
                        <span class="task-status status-\${task.status}">\${getStatusText(task.status)}</span>
                    </div>
                    
                    <div class="task-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: \${task.progress}%"></div>
                        </div>
                        <div class="progress-text">\${task.progress}%</div>
                    </div>
                    
                    <div class="task-agents">
                        \${runningAgents.map(a => \`
                            <div class="agent-badge running">
                                <span>\${a.icon}</span>
                                <span>\${a.name}</span>
                                <span>\${a.progress}%</span>
                            </div>
                        \`).join('')}
                    </div>
                    
                    <div class="task-logs" id="logs-\${task.id}">
                        \${recentLogs.map(log => \`
                            <div class="log-entry">
                                <span class="log-time">\${formatTime(log.time)}</span>
                                <span class="log-agent">\${log.agent}</span>
                                <span>\${log.message}</span>
                            </div>
                        \`).join('')}
                    </div>
                </div>
            \`;
        }
        
        function updateTaskCard(task) {
            const card = document.getElementById(\`task-\${task.id}\`);
            if (card) {
                card.outerHTML = generateTaskCard(task);
            }
        }
        
        function updateTaskLogs(task) {
            const logsContainer = document.getElementById(\`logs-\${task.id}\`);
            if (logsContainer) {
                const recentLogs = task.logs.slice(-5);
                logsContainer.innerHTML = recentLogs.map(log => \`
                    <div class="log-entry">
                        <span class="log-time">\${formatTime(log.time)}</span>
                        <span class="log-agent">\${log.agent}</span>
                        <span>\${log.message}</span>
                    </div>
                \`).join('');
            }
        }
        
        function updateStats() {
            document.getElementById('totalTasks').textContent = tasks.length;
            document.getElementById('runningTasks').textContent = tasks.filter(t => t.status === 'running').length;
            document.getElementById('completedTasks').textContent = tasks.filter(t => t.status === 'completed').length;
        }
        
        function getStatusText(status) {
            const map = { running: '进行中', completed: '已完成', failed: '失败', paused: '暂停' };
            return map[status] || status;
        }
        
        function formatTime(timestamp) {
            const date = new Date(timestamp);
            return date.toTimeString().split(' ')[0];
        }
        
        // 启动
        connectWebSocket();
    </script>
</body>
</html>\`;
}

// 启动服务器
server.listen(PORT, () => {
  console.log('=== UltraWork State Server V4 - Multi-Task Command Center ===');
  console.log('Status: RUNNING');
  console.log('Port: ' + PORT);
  console.log('Max Parallel Tasks: ' + MAX_TASKS);
  console.log('Web Panel: http://localhost:' + PORT);
  console.log('API Docs: http://localhost:' + PORT + '/api/tasks');
  console.log('WebSocket: ws://localhost:' + PORT + '/ws');
  console.log('');
  console.log('API Endpoints:');
  console.log('  POST /api/tasks                 - Create new task');
  console.log('  GET  /api/tasks                 - Get all tasks');
  console.log('  GET  /api/tasks/:id             - Get single task');
  console.log('  PUT  /api/tasks/:id             - Update task');
  console.log('  POST /api/tasks/:id/complete    - Complete task');
  console.log('  POST /api/tasks/:id/agents/:aid - Update agent status');
  console.log('  POST /api/tasks/:id/logs        - Add log');
  console.log('===========================================================');
});

module.exports = { taskManager, server };
