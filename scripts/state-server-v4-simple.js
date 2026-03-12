/**
 * UltraWork Multi-Task Manager V4 - Simplified
 * 支持多任务并行执行
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
    res.end('<html><body><h1>UltraWork V4 - Multi-Task Server</h1><p>API: /api/tasks</p><p>WebSocket: /ws</p></body></html>');
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

server.listen(PORT, () => {
  console.log('=== UltraWork V4 Multi-Task Server ===');
  console.log('Status: RUNNING on port ' + PORT);
  console.log('API: http://localhost:' + PORT + '/api/tasks');
  console.log('WebSocket: ws://localhost:' + PORT + '/ws');
});

module.exports = { taskManager, server };
