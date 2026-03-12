/**
 * UltraWork State Server V4 - 45人军团完整版
 * 支持WebSocket实时通信 + 45位将领层级管理
 * CommonJS版本 - 兼容ES Module环境
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { EventEmitter } = require('events');

const STATE_DIR = path.join(__dirname, '..', '..', '..', '.ultrawork');
const PORT = process.env.ULTRAWORK_PORT || 3459;

// 事件发射器用于实时推送
const events = new EventEmitter();

// ═══════════════════════════════════════════════════════════════
// 45位将领完整配置
// ═══════════════════════════════════════════════════════════════
const AGENTS_CONFIG = {
  // ██████████████████████████████████████████████████████████████
  // 第一层级：主帅 (1人)
  // ██████████████████████████████████████████████████████████████
  zhugeliang: { name: '诸葛亮', role: '主帅/调度器', icon: '🎯', model: 'GLM-5', level: '主帅', leader: null, desc: '运筹帷幄，决胜千里' },

  // ██████████████████████████████████████████████████████████████
  // 第二层级：大都督 (1人)
  // ██████████████████████████████████████████████████████████████
  zhouyu: { name: '周瑜', role: '大都督/战略规划', icon: '📜', model: 'GLM-5', level: '大都督', leader: 'zhugeliang', desc: '雄姿英发，羽扇纶巾' },

  // ██████████████████████████████████████████████████████████████
  // 第三层级：五虎大将 (6人)
  // ██████████████████████████████████████████████████████████████
  zhaoyun: { name: '赵云', role: '大将/深度执行', icon: '⚔️', model: 'Qwen3.5-Plus', level: '五虎大将', leader: 'zhugeliang', desc: '一身是胆，常胜将军' },
  simayi: { name: '司马懿', role: '大将/情报侦察', icon: '🔍', model: 'MiniMax-M2.5', level: '五虎大将', leader: 'zhugeliang', desc: '冢虎之谋，算无遗策' },
  guanyu: { name: '关羽', role: '大将/质量守护', icon: '🛡️', model: 'Qwen3.5-Plus', level: '五虎大将', leader: 'zhugeliang', desc: '义薄云天，武圣降世' },
  zhangfei: { name: '张飞', role: '大将/快速突击', icon: '🔥', model: 'MiniMax-M2.5', level: '五虎大将', leader: 'zhugeliang', desc: '万人敌，当阳怒吼' },
  machao: { name: '马超', role: '大将/后备统领', icon: '🏇', model: 'GLM-5', level: '五虎大将', leader: 'zhugeliang', desc: '西凉锦马超，神威天将军' },
  huangzhong: { name: '黄忠', role: '大将/资深专家', icon: '🏹', model: 'Qwen3.5-Plus', level: '五虎大将', leader: 'zhugeliang', desc: '老当益壮，百步穿杨' },

  // ██████████████████████████████████████████████████████████████
  // 第四层级：各部将领 (38人)
  // ██████████████████████████████████████████████████████████████
  // 诸葛亮部将 (3人)
  lusu: { name: '鲁肃', role: '资源规划专家', icon: '📦', model: 'MiniMax-M2.5', level: '诸葛亮部将', leader: 'zhouyu', desc: '东吴谋士，忠厚长者' },
  huanggai: { name: '黄盖', role: '执行落地专家', icon: '🚀', model: 'Qwen3.5-Plus', level: '诸葛亮部将', leader: 'zhouyu', desc: '苦肉计，老当益壮' },
  xushu: { name: '徐庶', role: '测试专家/大都督', icon: '✅', model: 'GLM-5', level: '诸葛亮部将', leader: 'zhugeliang', desc: '单福归来，一言不发' },

  // 赵云部将 (5人)
  gaoshun: { name: '高顺', role: '前端开发专家', icon: '🎨', model: 'Qwen-Coder-Plus', level: '赵云部将', leader: 'zhaoyun', desc: '陷阵营统领，攻无不克' },
  chendao: { name: '陈到', role: '后端开发专家', icon: '🔧', model: 'Qwen-Coder-Plus', level: '赵云部将', leader: 'zhaoyun', desc: '白耳兵统领，忠勇无双' },
  zhangbao: { name: '张苞', role: '全栈开发专家', icon: '💻', model: 'Qwen3.5-Plus', level: '赵云部将', leader: 'zhaoyun', desc: '张飞长子，勇猛善战' },
  guanxing: { name: '关兴', role: 'DevOps专家', icon: '⚙️', model: 'Qwen3.5-Plus', level: '赵云部将', leader: 'zhaoyun', desc: '关羽次子，青龙偃月' },
  zhangyi: { name: '张翼', role: '容器编排专家', icon: '📦', model: 'Qwen-Coder-Plus', level: '赵云部将', leader: 'zhaoyun', desc: '蜀汉名将，稳健持重' },

  // 司马懿部将 (5人)
  simashi: { name: '司马师', role: '深度分析专家', icon: '🔬', model: 'MiniMax-M2.5', level: '司马懿部将', leader: 'simayi', desc: '司马长子，权谋深沉' },
  simazhao: { name: '司马昭', role: '信息整理专家', icon: '📝', model: 'Kimi-K2.5', level: '司马懿部将', leader: 'simayi', desc: '司马次子，路人皆知' },
  dengai: { name: '邓艾', role: 'DevOps大都督', icon: '🚀', model: 'GLM-5', level: '司马懿部将', leader: 'simayi', desc: '屯田名将，奇袭阴平' },
  zhonghui: { name: '钟会', role: '性能优化专家', icon: '⚡', model: 'MiniMax-M2.5', level: '司马懿部将', leader: 'simayi', desc: '魏国谋士，才华横溢' },
  wangshuang: { name: '王双', role: 'CI/CD专家', icon: '🔁', model: 'Qwen3.5-Plus', level: '司马懿部将', leader: 'simayi', desc: '曹魏猛将，刀法精湛' },

  // 关羽部将 (5人)
  guanping: { name: '关平', role: '代码审查专家', icon: '📋', model: 'Qwen3.5-Plus', level: '关羽部将', leader: 'guanyu', desc: '关羽义子，忠孝两全' },
  zhoucang: { name: '周仓', role: '安全检查专家', icon: '🔒', model: 'MiniMax-M2.5', level: '关羽部将', leader: 'guanyu', desc: '黄巾旧将，忠心耿耿' },
  guansuo: { name: '关索', role: '漏洞扫描专家', icon: '🔍', model: 'Qwen3.5-Plus', level: '关羽部将', leader: 'guanyu', desc: '关羽幼子，花关索传' },
  zhangliao: { name: '张辽', role: '数据库大都督', icon: '🗄️', model: 'GLM-5', level: '关羽部将', leader: 'guanyu', desc: '威震逍遥津，智勇双全' },
  yuejin: { name: '乐进', role: 'SQL优化专家', icon: '⚙️', model: 'Qwen3.5-Plus', level: '关羽部将', leader: 'guanyu', desc: '五子良将，勇猛果敢' },

  // 张飞部将 (4人)
  leixu: { name: '雷绪', role: '快速定位专家', icon: '🔎', model: 'MiniMax-M2.5', level: '张飞部将', leader: 'zhangfei', desc: '张飞部将，雷厉风行' },
  wulan: { name: '吴兰', role: '即时修复专家', icon: '⚡', model: 'Qwen3.5-Plus', level: '张飞部将', leader: 'zhangfei', desc: '张飞部将，迅捷如风' },
  lidian: { name: '李典', role: '数据迁移专家', icon: '📤', model: 'Qwen3.5-Plus', level: '张飞部将', leader: 'zhangfei', desc: '五子良将，沉稳持重' },
  yujin: { name: '于禁', role: '安全大都督', icon: '🛡️', model: 'GLM-5', level: '张飞部将', leader: 'zhangfei', desc: '五子良将，治军严谨' },

  // 马超部将 (4人)
  madai: { name: '马岱', role: '稳健支援专家', icon: '🤝', model: 'MiniMax-M2.5', level: '马超部将', leader: 'machao', desc: '马超从弟，斩杀魏延' },
  pangde: { name: '庞德', role: '特殊任务专家', icon: '💪', model: 'Qwen3.5-Plus', level: '马超部将', leader: 'machao', desc: '抬棺死战，忠烈无双' },
  hanzhong: { name: '韩忠', role: '探索任务专家', icon: '🔭', level: '马超部将', leader: 'machao', desc: '探索先锋，洞察先机' },
  mazhong: { name: '马忠', role: '实验功能专家', icon: '🧪', level: '马超部将', leader: 'machao', desc: '实验先锋，勇于创新' },

  // 黄忠部将 (3人)
  weiyan: { name: '魏延', role: '逆向工程专家', icon: '🔄', model: 'Qwen3.5-Plus', level: '黄忠部将', leader: 'huangzhong', desc: '汉中太守，谁敢杀我' },
  yanpu: { name: '严颜', role: '架构重构专家', icon: '🏗️', model: 'Qwen3.5-Plus', level: '黄忠部将', leader: 'huangzhong', desc: '蜀中老将，宁死不屈' },
  wuqi: { name: '吴懿', role: '性能压测专家', icon: '📊', model: 'MiniMax-M2.5', level: '黄忠部将', leader: 'huangzhong', desc: '蜀汉外戚，沉稳可靠' },

  // 监察团队 (4人)
  manchong: { name: '满宠', role: '监察指挥官', icon: '👁️', model: 'GLM-5', level: '监察团队', leader: 'zhugeliang', desc: '汝南太守，执法如山' },
  chengyu: { name: '程昱', role: '前端监控专家', icon: '📱', model: 'MiniMax-M2.5', level: '监察团队', leader: 'manchong', desc: '曹魏谋士，刚戾傲慢' },
  jiaxu: { name: '贾诩', role: '后端监控专家', icon: '💻', model: 'MiniMax-M2.5', level: '监察团队', leader: 'manchong', desc: '毒士之谋，算无遗策' },
  liuye: { name: '刘晔', role: 'E2E监控专家', icon: '🎭', model: 'Qwen3.5-Plus', level: '监察团队', leader: 'manchong', desc: '汉室宗亲，战略大师' },

  // 测试团队 (4人)
  panglin: { name: '庞林', role: '前端测试专家', icon: '🧪', model: 'Qwen3.5-Plus', level: '测试团队', leader: 'xushu', desc: '庞统之弟，测试先锋' },
  yanyan: { name: '严颜', role: '后端测试专家', icon: '🔬', model: 'Qwen3.5-Plus', level: '测试团队', leader: 'xushu', desc: '蜀中名将，测试严谨' },
  jiangwei: { name: '姜维', role: '集成测试专家', icon: '🔧', model: 'Qwen3.5-Plus', level: '测试团队', leader: 'xushu', desc: '天水麒麟儿，丞相传人' },
  jiangwan: { name: '蒋琬', role: '回归测试专家', icon: '📋', model: 'MiniMax-M2.5', level: '测试团队', leader: 'xushu', desc: '蜀汉丞相，沉稳持重' }
};

// 状态存储
let currentState = {
  version: '4.0.0',
  status: 'idle',
  currentTask: '',
  progress: 0,
  startTime: null,
  agents: {},
  logs: [],
  phases: {},
  stats: {
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0
  }
};

// ═══════════════════════════════════════════════════════════════
// WebSocket 客户端管理
// ═══════════════════════════════════════════════════════════════
const wsClients = new Set();

function broadcast(data) {
  const message = JSON.stringify(data);
  wsClients.forEach(client => {
    if (!client.destroyed) {
      sendWebSocketFrame(client, message);
    }
  });
}

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

function parseWebSocketFrame(buffer) {
  if (buffer.length < 2) return null;
  
  const opcode = buffer[0] & 0x0f;
  if (opcode === 0x08) return null;
  if (opcode === 0x09) return { type: 'ping' };
  
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
// 初始化状态
// ═══════════════════════════════════════════════════════════════
function initState() {
  // 初始化所有将领状态
  Object.keys(AGENTS_CONFIG).forEach(agentId => {
    currentState.agents[agentId] = {
      id: agentId,
      ...AGENTS_CONFIG[agentId],
      status: 'idle',
      task: '',
      progress: 0,
      startTime: null,
      endTime: null,
      logs: []
    };
  });

  // 创建状态目录
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
  }
}

// ═══════════════════════════════════════════════════════════════
// HTTP 服务器
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

  // API: 获取完整状态
  if (pathname === '/api/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      state: currentState,
      agents: Object.values(currentState.agents),
      timestamp: Date.now()
    }));
    return;
  }

  // API: 更新任务状态
  if (pathname === '/api/task/status' && req.method === 'POST') {
    parseBody(req, (body) => {
      currentState.status = body.status || currentState.status;
      currentState.currentTask = body.task || currentState.currentTask;
      currentState.progress = body.progress || currentState.progress;
      
      broadcast({
        type: 'status_update',
        state: currentState
      });
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, state: currentState }));
    });
    return;
  }

  // API: 更新将领状态
  if (pathname.startsWith('/api/agents/') && req.method === 'POST') {
    const agentId = pathname.split('/')[3];
    parseBody(req, (body) => {
      if (currentState.agents[agentId]) {
        Object.assign(currentState.agents[agentId], body);
        
        broadcast({
          type: 'agent_update',
          agent: currentState.agents[agentId]
        });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, agent: currentState.agents[agentId] }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Agent not found' }));
      }
    });
    return;
  }

  // API: 添加日志
  if (pathname === '/api/logs' && req.method === 'POST') {
    parseBody(req, (body) => {
      const logEntry = {
        time: Date.now(),
        agent: body.agent || 'system',
        agentId: body.agentId,
        message: body.message,
        type: body.type || 'action'
      };
      
      currentState.logs.push(logEntry);
      if (currentState.logs.length > 1000) {
        currentState.logs = currentState.logs.slice(-1000);
      }
      
      broadcast({
        type: 'log_added',
        log: logEntry
      });
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, log: logEntry }));
    });
    return;
  }

  // API: 更新任务进度
  if (pathname === '/api/task/progress' && req.method === 'POST') {
    parseBody(req, (body) => {
      currentState.progress = body.progress || 0;
      if (body.phase) {
        currentState.phases[body.phase] = {
          status: body.status || 'running',
          progress: body.progress || 0
        };
      }
      
      broadcast({
        type: 'progress_update',
        progress: currentState.progress,
        phases: currentState.phases
      });
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, progress: currentState.progress }));
    });
    return;
  }

  // API: 完成任务
  if (pathname === '/api/task/complete' && req.method === 'POST') {
    currentState.status = 'completed';
    currentState.progress = 100;
    currentState.stats.completedTasks++;
    
    // 重置所有将领状态
    Object.keys(currentState.agents).forEach(agentId => {
      currentState.agents[agentId].status = 'idle';
      currentState.agents[agentId].task = '';
      currentState.agents[agentId].progress = 0;
    });
    
    broadcast({
      type: 'task_complete',
      state: currentState
    });
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, state: currentState }));
    return;
  }

  // 首页 - Web面板
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
  wsClients.add(socket);
  
  // 发送初始状态
  sendWebSocketFrame(socket, JSON.stringify({
    type: 'init',
    state: currentState
  }));
  
  socket.on('data', (data) => {
    const message = parseWebSocketFrame(data);
    if (message) {
      console.log('[WebSocket] 收到:', message);
    }
  });
  
  socket.on('close', () => {
    wsClients.delete(socket);
  });
  
  socket.on('error', () => {
    wsClients.delete(socket);
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
// Web 面板 HTML (V3风格优化版)
// ═══════════════════════════════════════════════════════════════
function generateWebPanel() {
  const agentsByLevel = {};
  Object.entries(AGENTS_CONFIG).forEach(([id, config]) => {
    if (!agentsByLevel[config.level]) {
      agentsByLevel[config.level] = [];
    }
    agentsByLevel[config.level].push({ id, ...config });
  });

  const levelOrder = ['主帅', '大都督', '五虎大将', '诸葛亮部将', '赵云部将', '司马懿部将', '关羽部将', '张飞部将', '马超部将', '黄忠部将', '监察团队', '测试团队'];

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🏰 UltraWork 三国军团 - 45人完整版指挥中心</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
            background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
            color: #e0e0e0;
            min-height: 100vh;
            padding-bottom: 40px;
        }
        
        .header {
            background: rgba(0, 0, 0, 0.5);
            padding: 20px 30px;
            border-bottom: 2px solid rgba(0, 212, 255, 0.3);
            backdrop-filter: blur(10px);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        
        .header-content {
            max-width: 1600px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            background: linear-gradient(90deg, #ffd700, #ff6b35, #00d4ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
        }
        
        .header-stats {
            display: flex;
            gap: 30px;
        }
        
        .stat-box {
            text-align: center;
            padding: 12px 24px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .stat-value {
            font-size: 32px;
            font-weight: 700;
            color: #00d4ff;
        }
        
        .stat-label {
            font-size: 12px;
            color: #888;
            margin-top: 4px;
        }
        
        .main-container {
            max-width: 1600px;
            margin: 0 auto;
            padding: 30px;
            display: grid;
            grid-template-columns: 350px 1fr;
            gap: 30px;
        }
        
        .sidebar {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .panel {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .panel-title {
            font-size: 16px;
            font-weight: 600;
            color: #ffd700;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(255, 215, 0, 0.3);
        }
        
        .task-status-panel {
            background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(124, 58, 237, 0.1));
        }
        
        .status-indicator {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .status-dot {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        
        .status-dot.idle { background: #10b981; }
        .status-dot.running { background: #00d4ff; }
        .status-dot.completed { background: #10b981; }
        .status-dot.failed { background: #ef4444; }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.1); }
        }
        
        .current-task {
            font-size: 14px;
            color: #ccc;
            margin-bottom: 15px;
        }
        
        .progress-container {
            background: rgba(255, 255, 255, 0.1);
            height: 30px;
            border-radius: 15px;
            overflow: hidden;
            position: relative;
        }
        
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #00d4ff, #7c3aed, #ffd700);
            border-radius: 15px;
            transition: width 0.5s ease;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 10px;
        }
        
        .progress-text {
            font-size: 14px;
            font-weight: 700;
            color: white;
        }
        
        .logs-container {
            max-height: 400px;
            overflow-y: auto;
        }
        
        .log-entry {
            padding: 10px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            font-family: monospace;
            font-size: 12px;
            display: flex;
            gap: 10px;
        }
        
        .log-time {
            color: #64748b;
            min-width: 60px;
        }
        
        .log-agent {
            color: #00d4ff;
            min-width: 80px;
        }
        
        .log-message {
            color: #e0e0e0;
            flex: 1;
        }
        
        .content-area {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .level-section {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 16px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        
        .level-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
            font-size: 14px;
            font-weight: 600;
            color: #ffd700;
        }
        
        .level-badge {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            background: rgba(255, 215, 0, 0.2);
            color: #ffd700;
        }
        
        .agents-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 12px;
        }
        
        .agent-card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 15px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s;
            cursor: pointer;
        }
        
        .agent-card:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0, 212, 255, 0.2);
        }
        
        .agent-card.running {
            border-color: #00d4ff;
            background: rgba(0, 212, 255, 0.1);
            box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
        }
        
        .agent-card.completed {
            border-color: #10b981;
            background: rgba(16, 185, 129, 0.1);
        }
        
        .agent-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;
        }
        
        .agent-icon {
            font-size: 24px;
        }
        
        .agent-name {
            font-size: 14px;
            font-weight: 600;
            color: #f0f0f0;
        }
        
        .agent-role {
            font-size: 11px;
            color: #888;
            margin-bottom: 8px;
        }
        
        .agent-model {
            font-size: 10px;
            padding: 3px 8px;
            background: rgba(124, 58, 237, 0.3);
            border-radius: 6px;
            color: #a78bfa;
            display: inline-block;
        }
        
        .agent-status {
            margin-top: 10px;
            padding: 6px 10px;
            border-radius: 8px;
            font-size: 11px;
            text-align: center;
        }
        
        .agent-status.idle {
            background: rgba(255, 255, 255, 0.1);
            color: #888;
        }
        
        .agent-status.running {
            background: rgba(0, 212, 255, 0.2);
            color: #00d4ff;
        }
        
        .ws-status {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 1000;
        }
        
        .ws-connected {
            background: rgba(16, 185, 129, 0.2);
            color: #34d399;
            border: 1px solid rgba(16, 185, 129, 0.3);
        }
        
        .ws-disconnected {
            background: rgba(239, 68, 68, 0.2);
            color: #f87171;
            border: 1px solid rgba(239, 68, 68, 0.3);
        }
        
        /* 模态框样式 */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s;
        }
        
        .modal-overlay.active {
            opacity: 1;
            visibility: visible;
        }
        
        .modal-content {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 20px;
            padding: 30px;
            max-width: 800px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
            transform: scale(0.9);
            transition: transform 0.3s;
        }
        
        .modal-overlay.active .modal-content {
            transform: scale(1);
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .modal-title {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .modal-icon {
            font-size: 48px;
        }
        
        .modal-name {
            font-size: 24px;
            font-weight: 700;
            color: #ffd700;
        }
        
        .modal-role {
            font-size: 14px;
            color: #888;
            margin-top: 4px;
        }
        
        .modal-close {
            background: none;
            border: none;
            color: #888;
            font-size: 28px;
            cursor: pointer;
            padding: 5px;
            line-height: 1;
            transition: color 0.3s;
        }
        
        .modal-close:hover {
            color: #fff;
        }
        
        .modal-body {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        .modal-section {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 20px;
        }
        
        .modal-section-title {
            font-size: 14px;
            font-weight: 600;
            color: #00d4ff;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .modal-info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 13px;
        }
        
        .modal-info-label {
            color: #888;
        }
        
        .modal-info-value {
            color: #e0e0e0;
            font-weight: 500;
        }
        
        .modal-status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .modal-status-badge.idle {
            background: rgba(255, 255, 255, 0.1);
            color: #888;
        }
        
        .modal-status-badge.running {
            background: rgba(0, 212, 255, 0.2);
            color: #00d4ff;
        }
        
        .modal-status-badge.completed {
            background: rgba(16, 185, 129, 0.2);
            color: #10b981;
        }
        
        .modal-logs {
            grid-column: 1 / -1;
            max-height: 300px;
            overflow-y: auto;
        }
        
        .modal-log-entry {
            padding: 10px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            font-size: 12px;
            display: flex;
            gap: 10px;
        }
        
        .modal-log-time {
            color: #64748b;
            min-width: 60px;
        }
        
        .modal-log-message {
            color: #e0e0e0;
            flex: 1;
        }
        
        .modal-fullwidth {
            grid-column: 1 / -1;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-content">
            <h1>🏰 UltraWork 三国军团 V4 - 45人完整版指挥中心</h1>
            <div class="header-stats">
                <div class="stat-box">
                    <div class="stat-value" id="totalTasks">0</div>
                    <div class="stat-label">总任务</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value" id="completedTasks">0</div>
                    <div class="stat-label">已完成</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value" id="activeAgents">0</div>
                    <div class="stat-label">活跃将领</div>
                </div>
            </div>
        </div>
    </div>

    <div class="main-container">
        <div class="sidebar">
            <div class="panel task-status-panel">
                <div class="panel-title">⚡ 当前任务状态</div>
                <div class="status-indicator">
                    <div class="status-dot idle" id="statusDot"></div>
                    <span id="statusText">待机中</span>
                </div>
                <div class="current-task" id="currentTask">暂无进行中的任务</div>
                <div class="progress-container">
                    <div class="progress-bar" id="progressBar" style="width: 0%">
                        <span class="progress-text" id="progressText">0%</span>
                    </div>
                </div>
            </div>
            
            <div class="panel">
                <div class="panel-title">📜 实时日志</div>
                <div class="logs-container" id="logsContainer">
                    <div class="log-entry">
                        <span class="log-time">--:--</span>
                        <span class="log-agent">系统</span>
                        <span class="log-message">指挥中心已启动</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="content-area">
            ${levelOrder.map(level => {
              const agents = agentsByLevel[level] || [];
              if (agents.length === 0) return '';
              return `
                <div class="level-section">
                    <div class="level-header">
                        <span>${getLevelIcon(level)}</span>
                        <span>${level}</span>
                        <span class="level-badge">${agents.length}人</span>
                    </div>
                    <div class="agents-grid">
                        ${agents.map(agent => `
                            <div class="agent-card idle" id="agent-${agent.id}" onclick="openAgentModal('${agent.id}')">
                                <div class="agent-header">
                                    <span class="agent-icon">${agent.icon}</span>
                                    <span class="agent-name">${agent.name}</span>
                                </div>
                                <div class="agent-role">${agent.role}</div>
                                <span class="agent-model">${agent.model || 'N/A'}</span>
                                <div class="agent-status idle" id="status-${agent.id}">待机中</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
              `;
            }).join('')}
        </div>
    </div>
    
    <!-- 武将详情模态框 -->
    <div id="agentModal" class="modal-overlay" onclick="closeAgentModal(event)">
        <div class="modal-content" onclick="event.stopPropagation()">
            <div class="modal-header">
                <div class="modal-title">
                    <span class="modal-icon" id="modalIcon">🎯</span>
                    <div>
                        <div class="modal-name" id="modalName">诸葛亮</div>
                        <div class="modal-role" id="modalRole">主帅/调度器</div>
                    </div>
                </div>
                <button class="modal-close" onclick="closeAgentModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="modal-section">
                    <div class="modal-section-title">📋 基本信息</div>
                    <div class="modal-info-row">
                        <span class="modal-info-label">ID:</span>
                        <span class="modal-info-value" id="modalId">zhugeliang</span>
                    </div>
                    <div class="modal-info-row">
                        <span class="modal-info-label">层级:</span>
                        <span class="modal-info-value" id="modalLevel">主帅</span>
                    </div>
                    <div class="modal-info-row">
                        <span class="modal-info-label">上级:</span>
                        <span class="modal-info-value" id="modalLeader">无</span>
                    </div>
                    <div class="modal-info-row">
                        <span class="modal-info-label">模型:</span>
                        <span class="modal-info-value" id="modalModel">GLM-5</span>
                    </div>
                </div>
                <div class="modal-section">
                    <div class="modal-section-title">⚡ 运行状态</div>
                    <div class="modal-info-row">
                        <span class="modal-info-label">状态:</span>
                        <span class="modal-status-badge idle" id="modalStatus">待机中</span>
                    </div>
                    <div class="modal-info-row">
                        <span class="modal-info-label">当前任务:</span>
                        <span class="modal-info-value" id="modalTask">无</span>
                    </div>
                    <div class="modal-info-row">
                        <span class="modal-info-label">任务进度:</span>
                        <span class="modal-info-value" id="modalProgress">0%</span>
                    </div>
                    <div class="modal-info-row">
                        <span class="modal-info-label">描述:</span>
                        <span class="modal-info-value" id="modalDesc">运筹帷幄，决胜千里</span>
                    </div>
                </div>
                <div class="modal-section modal-fullwidth modal-logs">
                    <div class="modal-section-title">📜 执行日志</div>
                    <div id="modalLogs">
                        <div class="modal-log-entry">
                            <span class="modal-log-time">--:--</span>
                            <span class="modal-log-message">暂无日志</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div id="wsStatus" class="ws-status ws-disconnected">
        <span>🔴</span> 已断开
    </div>

    <script>
        let ws = null;
        let state = null;
        
        const levelIcons = {
            '主帅': '👑',
            '大都督': '⚔️',
            '五虎大将': '🏆',
            '诸葛亮部将': '📜',
            '赵云部将': '⚔️',
            '司马懿部将': '🔍',
            '关羽部将': '🛡️',
            '张飞部将': '🔥',
            '马超部将': '🏇',
            '黄忠部将': '🏹',
            '监察团队': '👁️',
            '测试团队': '✅'
        };
        
        function getLevelIcon(level) {
            return levelIcons[level] || '⭐';
        }
        
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
                handleMessage(data);
            };
            
            ws.onclose = () => {
                wsStatus.className = 'ws-status ws-disconnected';
                wsStatus.innerHTML = '<span>🔴</span> 已断开';
                setTimeout(connectWebSocket, 3000);
            };
        }
        
        function handleMessage(data) {
            switch(data.type) {
                case 'init':
                    state = data.state;
                    updateUI();
                    break;
                case 'status_update':
                    state = data.state;
                    updateTaskStatus();
                    break;
                case 'agent_update':
                    updateAgent(data.agent);
                    break;
                case 'log_added':
                    addLog(data.log);
                    break;
                case 'progress_update':
                    updateProgress(data.progress);
                    break;
                case 'task_complete':
                    state = data.state;
                    updateUI();
                    break;
            }
        }
        
        function updateUI() {
            if (!state) return;
            
            // 更新统计
            document.getElementById('totalTasks').textContent = state.stats?.totalTasks || 0;
            document.getElementById('completedTasks').textContent = state.stats?.completedTasks || 0;
            
            const activeCount = Object.values(state.agents || {}).filter(a => a.status === 'running').length;
            document.getElementById('activeAgents').textContent = activeCount;
            
            // 更新任务状态
            updateTaskStatus();
            
            // 更新所有将领
            Object.values(state.agents || {}).forEach(agent => {
                updateAgent(agent);
            });
        }
        
        function updateTaskStatus() {
            if (!state) return;
            
            const statusDot = document.getElementById('statusDot');
            const statusText = document.getElementById('statusText');
            const currentTask = document.getElementById('currentTask');
            
            statusDot.className = 'status-dot ' + state.status;
            
            const statusMap = {
                'idle': '待机中',
                'running': '进行中',
                'completed': '已完成',
                'failed': '失败'
            };
            statusText.textContent = statusMap[state.status] || state.status;
            currentTask.textContent = state.currentTask || '暂无进行中的任务';
            
            updateProgress(state.progress);
        }
        
        function updateProgress(progress) {
            const progressBar = document.getElementById('progressBar');
            const progressText = document.getElementById('progressText');
            progressBar.style.width = (progress || 0) + '%';
            progressText.textContent = (progress || 0) + '%';
        }
        
        function updateAgent(agent) {
            const card = document.getElementById('agent-' + agent.id);
            const status = document.getElementById('status-' + agent.id);
            if (!card || !status) return;
            
            card.className = 'agent-card ' + agent.status;
            status.className = 'agent-status ' + agent.status;
            
            const statusMap = {
                'idle': '待机中',
                'running': '执行中: ' + (agent.task || ''),
                'completed': '已完成'
            };
            status.textContent = statusMap[agent.status] || agent.status;
            
            // 如果模态框打开且显示的是当前agent，更新模态框
            const modal = document.getElementById('agentModal');
            if (modal.classList.contains('active')) {
                const modalId = document.getElementById('modalId').textContent;
                if (modalId === agent.id) {
                    // 更新状态和进度
                    const modalStatus = document.getElementById('modalStatus');
                    modalStatus.className = 'modal-status-badge ' + (agent.status || 'idle');
                    const modalStatusMap = {
                        'idle': '待机中',
                        'running': '执行中',
                        'completed': '已完成',
                        'failed': '失败'
                    };
                    modalStatus.textContent = modalStatusMap[agent.status] || agent.status || '待机中';
                    document.getElementById('modalTask').textContent = agent.task || '无';
                    document.getElementById('modalProgress').textContent = (agent.progress || 0) + '%';
                    
                    // 更新日志
                    const logsContainer = document.getElementById('modalLogs');
                    const logs = agent.logs || [];
                    if (logs.length > 0) {
                        logsContainer.innerHTML = logs.slice(-20).map(log => \`
                            <div class="modal-log-entry">
                                <span class="modal-log-time">\${formatTime(log.time)}</span>
                                <span class="modal-log-message">\${log.message}</span>
                            </div>
                        \`).join('');
                    }
                }
            }
        }
        
        function addLog(log) {
            const container = document.getElementById('logsContainer');
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            entry.innerHTML = \`
                <span class="log-time">\${formatTime(log.time)}</span>
                <span class="log-agent">\${log.agent}</span>
                <span class="log-message">\${log.message}</span>
            \`;
            container.insertBefore(entry, container.firstChild);
            
            // 限制日志数量
            while (container.children.length > 100) {
                container.removeChild(container.lastChild);
            }
        }
        
        function formatTime(timestamp) {
            const date = new Date(timestamp);
            return date.toTimeString().split(' ')[0].substring(0, 5);
        }
        
        // 打开武将详情模态框
        function openAgentModal(agentId) {
            if (!state || !state.agents[agentId]) return;
            
            const agent = state.agents[agentId];
            
            // 填充模态框数据
            document.getElementById('modalIcon').textContent = agent.icon || '⭐';
            document.getElementById('modalName').textContent = agent.name || agentId;
            document.getElementById('modalRole').textContent = agent.role || '暂无角色';
            document.getElementById('modalId').textContent = agentId;
            document.getElementById('modalLevel').textContent = agent.level || '未知';
            document.getElementById('modalLeader').textContent = agent.leader ? (state.agents[agent.leader]?.name || agent.leader) : '无';
            document.getElementById('modalModel').textContent = agent.model || 'N/A';
            document.getElementById('modalDesc').textContent = agent.desc || '暂无描述';
            document.getElementById('modalTask').textContent = agent.task || '无';
            document.getElementById('modalProgress').textContent = (agent.progress || 0) + '%';
            
            // 更新状态标签
            const statusBadge = document.getElementById('modalStatus');
            statusBadge.className = 'modal-status-badge ' + (agent.status || 'idle');
            const statusMap = {
                'idle': '待机中',
                'running': '执行中',
                'completed': '已完成',
                'failed': '失败'
            };
            statusBadge.textContent = statusMap[agent.status] || agent.status || '待机中';
            
            // 填充日志
            const logsContainer = document.getElementById('modalLogs');
            const logs = agent.logs || [];
            if (logs.length > 0) {
                logsContainer.innerHTML = logs.slice(-20).map(log => \`
                    <div class="modal-log-entry">
                        <span class="modal-log-time">\${formatTime(log.time)}</span>
                        <span class="modal-log-message">\${log.message}</span>
                    </div>
                \`).join('');
            } else {
                logsContainer.innerHTML = \`
                    <div class="modal-log-entry">
                        <span class="modal-log-time">--:--</span>
                        <span class="modal-log-message">暂无执行日志</span>
                    </div>
                \`;
            }
            
            // 显示模态框
            document.getElementById('agentModal').classList.add('active');
        }
        
        // 关闭武将详情模态框
        function closeAgentModal(event) {
            if (!event || event.target === document.getElementById('agentModal') || event.target.className === 'modal-close') {
                document.getElementById('agentModal').classList.remove('active');
            }
        }
        
        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAgentModal();
            }
        });
        
        // 启动
        connectWebSocket();
        
        // 定期刷新状态
        setInterval(async () => {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                if (data.success) {
                    state = data.state;
                    updateUI();
                }
            } catch (e) {}
        }, 5000);
    </script>
</body>
</html>`;
}

function getLevelIcon(level) {
  const icons = {
    '主帅': '👑',
    '大都督': '⚔️',
    '五虎大将': '🏆',
    '诸葛亮部将': '📜',
    '赵云部将': '⚔️',
    '司马懿部将': '🔍',
    '关羽部将': '🛡️',
    '张飞部将': '🔥',
    '马超部将': '🏇',
    '黄忠部将': '🏹',
    '监察团队': '👁️',
    '测试团队': '✅'
  };
  return icons[level] || '⭐';
}

// ═══════════════════════════════════════════════════════════════
// 启动服务器
// ═══════════════════════════════════════════════════════════════
initState();

server.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     🏰 UltraWork 三国军团 V4 - 45人完整版指挥中心 🏰          ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║  状态: ✅ 运行中                                              ║');
  console.log('║  端口: ' + PORT + '                                           ║');
  console.log('║  军团规模: 45位将领                                           ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║  📱 Web面板: http://localhost:' + PORT + '                    ║');
  console.log('║  📊 API文档: http://localhost:' + PORT + '/api/status        ║');
  console.log('║  🔌 WebSocket: ws://localhost:' + PORT + '/ws                ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('可用端点:');
  console.log('  GET  /api/status          - 获取完整状态');
  console.log('  POST /api/task/status     - 更新任务状态');
  console.log('  POST /api/agents/:id      - 更新将领状态');
  console.log('  POST /api/logs            - 添加日志');
  console.log('  POST /api/task/progress   - 更新进度');
  console.log('  POST /api/task/complete   - 完成任务');
  console.log('');
});
