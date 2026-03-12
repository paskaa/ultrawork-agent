/**
 * UltraWork Trigger Listener - OpenCode 触发监听器
 * 
 * 功能：
 * - 监听 Web 面板的触发请求
 * - 自动推送当前会话状态到面板
 * 
 * 使用方法：
 * const listener = require('./plugins/ultrawork-sanguo/scripts/ultrawork-trigger-listener');
 * 
 * // 启动监听（每3秒检查一次）
 * listener.startPolling();
 * 
 * // 或者手动检查一次
 * await listener.checkAndReport();
 * 
 * // 停止监听
 * listener.stopPolling();
 */

const ultrawork = require('./ultrawork-reporter');
const http = require('http');

const PANEL_HOST = 'localhost';
const PANEL_PORT = 3459;
const POLL_INTERVAL = 3000; // 3秒

let pollingTimer = null;
let isPolling = false;

/**
 * 获取待处理的触发
 */
async function getPendingTriggers() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: PANEL_HOST,
      port: PANEL_PORT,
      path: '/api/triggers/pending',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ success: false, triggers: [] });
        }
      });
    });
    
    req.on('error', () => {
      resolve({ success: false, triggers: [] });
    });
    
    req.setTimeout(5000);
    req.end();
  });
}

/**
 * 处理触发
 */
async function handleTrigger(trigger) {
  console.log(`[UltraWork Trigger] 收到触发: ${trigger.type}`);
  
  switch (trigger.type) {
    case 'report-request':
      await handleReportRequest(trigger.data);
      break;
    default:
      console.log(`[UltraWork Trigger] 未知触发类型: ${trigger.type}`);
  }
}

/**
 * 处理报告请求
 */
async function handleReportRequest(data) {
  const sessionId = data.sessionId || 'default';
  const reason = data.reason || 'unknown';
  
  console.log(`[UltraWork Trigger] 处理报告请求: session=${sessionId}, reason=${reason}`);
  
  // 设置当前 session
  ultrawork.setSession(sessionId);
  
  // 推送当前状态
  try {
    // 报告任务状态
    await ultrawork.report('running', 'OpenCode 自动推送', 50);
    
    // 推送日志
    await ultrawork.log('zhugeliang', '诸葛亮', `收到面板请求，自动推送报告 (reason: ${reason})`);
    
    console.log(`[UltraWork Trigger] 报告已推送到 session: ${sessionId}`);
  } catch (e) {
    console.error('[UltraWork Trigger] 推送失败:', e.message);
  }
}

/**
 * 检查并报告
 */
async function checkAndReport() {
  try {
    const result = await getPendingTriggers();
    if (result.success && result.triggers.length > 0) {
      for (const trigger of result.triggers) {
        await handleTrigger(trigger);
      }
    }
  } catch (e) {
    console.error('[UltraWork Trigger] 检查失败:', e.message);
  }
}

/**
 * 开始轮询
 */
function startPolling() {
  if (isPolling) {
    console.log('[UltraWork Trigger] 已经在运行中');
    return;
  }
  
  isPolling = true;
  console.log('[UltraWork Trigger] 启动监听，间隔:', POLL_INTERVAL, 'ms');
  
  // 立即检查一次
  checkAndReport();
  
  // 定时检查
  pollingTimer = setInterval(checkAndReport, POLL_INTERVAL);
}

/**
 * 停止轮询
 */
function stopPolling() {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
  isPolling = false;
  console.log('[UltraWork Trigger] 已停止');
}

/**
 * 是否正在运行
 */
function isRunning() {
  return isPolling;
}

// 导出模块
module.exports = {
  startPolling,
  stopPolling,
  checkAndReport,
  isRunning,
  getPendingTriggers,
  POLL_INTERVAL
};

// 如果直接运行，启动监听
if (require.main === module) {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     UltraWork Trigger Listener - OpenCode 触发监听器        ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║  功能: 自动监听面板触发请求并推送报告                        ║');
  console.log('║  轮询间隔: ' + POLL_INTERVAL + 'ms                                          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('按 Ctrl+C 停止监听');
  console.log('');
  
  startPolling();
  
  // 优雅退出
  process.on('SIGINT', () => {
    console.log('\n[UltraWork Trigger] 正在停止...');
    stopPolling();
    process.exit(0);
  });
}
