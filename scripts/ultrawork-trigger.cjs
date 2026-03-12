/**
 * UltraWork Trigger Server - 触发报告服务器
 * 
 * 功能：
 * - 接收 HTTP 请求触发 OpenCode 报告
 * - 通过文件系统作为 IPC 机制
 * - OpenCode 定期检查触发文件并响应
 */

const fs = require('fs');
const path = require('path');

const TRIGGER_DIR = path.join(__dirname, '..', '..', '..', '.ultrawork', 'triggers');

// 确保触发目录存在
function ensureTriggerDir() {
  if (!fs.existsSync(TRIGGER_DIR)) {
    fs.mkdirSync(TRIGGER_DIR, { recursive: true });
  }
}

/**
 * 创建触发文件
 * @param {string} type - 触发类型
 * @param {object} data - 触发数据
 */
function createTrigger(type, data = {}) {
  ensureTriggerDir();
  
  const triggerFile = path.join(TRIGGER_DIR, `${type}-${Date.now()}.json`);
  const triggerData = {
    type,
    timestamp: Date.now(),
    data
  };
  
  fs.writeFileSync(triggerFile, JSON.stringify(triggerData, null, 2));
  console.log(`[Trigger] 创建触发: ${type} -> ${triggerFile}`);
  
  // 5秒后自动清理
  setTimeout(() => {
    if (fs.existsSync(triggerFile)) {
      fs.unlinkSync(triggerFile);
      console.log(`[Trigger] 自动清理: ${triggerFile}`);
    }
  }, 5000);
  
  return triggerFile;
}

/**
 * 获取所有待处理的触发
 */
function getPendingTriggers() {
  ensureTriggerDir();
  
  const triggers = [];
  const files = fs.readdirSync(TRIGGER_DIR);
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(TRIGGER_DIR, file);
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        triggers.push({
          file: filePath,
          ...data
        });
      } catch (e) {
        console.error(`[Trigger] 读取失败: ${file}`, e.message);
      }
    }
  }
  
  return triggers.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * 清理触发文件
 * @param {string} filePath - 文件路径
 */
function clearTrigger(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`[Trigger] 已清理: ${filePath}`);
  }
}

/**
 * 处理触发请求
 */
function handleTriggerRequest(req, res, pathname) {
  // API: 请求报告最近的 sessions
  if (pathname === '/api/trigger/report' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const sessionId = data.sessionId || 'default';
        
        // 创建触发文件
        const triggerFile = createTrigger('report-request', {
          sessionId,
          reason: data.reason || 'manual',
          timestamp: Date.now()
        });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: '报告请求已发送，等待 OpenCode 响应',
          triggerFile: path.basename(triggerFile),
          timeout: 5000
        }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request body' }));
      }
    });
    return true;
  }
  
  // API: 获取待处理的触发（供 OpenCode 查询）
  if (pathname === '/api/triggers/pending' && req.method === 'GET') {
    const triggers = getPendingTriggers();
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      triggers: triggers.map(t => ({
        type: t.type,
        timestamp: t.timestamp,
        data: t.data
      }))
    }));
    
    // 清理已读取的触发文件
    triggers.forEach(t => clearTrigger(t.file));
    
    return true;
  }
  
  return false;
}

module.exports = {
  createTrigger,
  getPendingTriggers,
  clearTrigger,
  handleTriggerRequest,
  TRIGGER_DIR
};
