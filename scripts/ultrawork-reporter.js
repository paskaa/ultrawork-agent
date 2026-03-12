/**
 * UltraWork Panel Reporter - OpenCode 状态自动推送插件
 * 
 * 功能：
 * - 自动将 OpenCode 任务状态推送到 Web 面板
 * - 支持将领分配和状态更新
 * - 支持日志推送
 * - 自动检测当前 Session
 * 
 * 使用方法：
 * 1. 在 OpenCode 中引入此文件
 * 2. 使用 ultrawork.report(status) 推送状态
 * 3. 使用 ultrawork.assign(agentId, task) 分配将领
 * 4. 使用 ultrawork.log(message) 推送日志
 */

const http = require('http');

const PANEL_CONFIG = {
  host: 'localhost',
  port: 3459,
  defaultSession: 'default'
};

// 获取当前 Session（从环境变量或配置文件）
function getCurrentSession() {
  return process.env.ULTRAWORK_SESSION || PANEL_CONFIG.defaultSession;
}

// HTTP 请求封装
function request(path, method, data) {
  return new Promise((resolve, reject) => {
    const sessionId = getCurrentSession();
    const url = `http://${PANEL_CONFIG.host}:${PANEL_CONFIG.port}${path}?session=${sessionId}`;
    
    const options = {
      hostname: PANEL_CONFIG.host,
      port: PANEL_CONFIG.port,
      path: `${path}?session=${sessionId}`,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseData));
        } catch (e) {
          resolve({ success: false, raw: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// UltraWork 面板报告器
const ultrawork = {
  /**
   * 更新整体任务状态
   * @param {string} status - 'idle' | 'running' | 'completed' | 'failed'
   * @param {string} task - 任务描述
   * @param {number} progress - 进度 0-100
   */
  async report(status, task = '', progress = 0) {
    try {
      const result = await request('/api/task/status', 'POST', {
        status,
        task,
        progress
      });
      console.log(`[UltraWork] 状态更新: ${status} - ${task} (${progress}%)`);
      return result;
    } catch (error) {
      console.error('[UltraWork] 状态推送失败:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * 分配将领执行任务
   * @param {string} agentId - 将领 ID (如: 'zhaoyun', 'guanyu')
   * @param {string} task - 任务描述
   * @param {number} progress - 进度 0-100
   */
  async assign(agentId, task = '', progress = 0) {
    try {
      const result = await request(`/api/agents/${agentId}`, 'POST', {
        status: 'running',
        task,
        progress
      });
      console.log(`[UltraWork] ${agentId} 开始任务: ${task}`);
      return result;
    } catch (error) {
      console.error('[UltraWork] 将领分配失败:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * 完成将领任务
   * @param {string} agentId - 将领 ID
   */
  async complete(agentId) {
    try {
      const result = await request(`/api/agents/${agentId}`, 'POST', {
        status: 'completed',
        task: '',
        progress: 100
      });
      console.log(`[UltraWork] ${agentId} 任务完成`);
      return result;
    } catch (error) {
      console.error('[UltraWork] 任务完成通知失败:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * 推送日志
   * @param {string} agentId - 将领 ID
   * @param {string} agentName - 将领名称
   * @param {string} message - 日志内容
   */
  async log(agentId, agentName, message) {
    try {
      const result = await request('/api/logs', 'POST', {
        agent: agentName,
        agentId: agentId,
        message: message,
        type: 'action'
      });
      return result;
    } catch (error) {
      console.error('[UltraWork] 日志推送失败:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * 更新进度
   * @param {number} progress - 进度 0-100
   * @param {string} phase - 阶段名称（可选）
   */
  async progress(progress, phase = '') {
    try {
      const result = await request('/api/task/progress', 'POST', {
        progress,
        phase,
        status: progress >= 100 ? 'completed' : 'running'
      });
      return result;
    } catch (error) {
      console.error('[UltraWork] 进度更新失败:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * 完成任务
   */
  async finish() {
    try {
      const result = await request('/api/task/complete', 'POST', {});
      console.log('[UltraWork] 任务完成');
      return result;
    } catch (error) {
      console.error('[UltraWork] 任务完成通知失败:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * 创建新 Session
   * @param {string} name - Session 名称
   */
  async createSession(name = '') {
    try {
      const result = await request('/api/sessions', 'POST', { name });
      if (result.success) {
        process.env.ULTRAWORK_SESSION = result.sessionId;
        console.log(`[UltraWork] 创建 Session: ${result.sessionName} (${result.sessionId})`);
      }
      return result;
    } catch (error) {
      console.error('[UltraWork] 创建 Session 失败:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * 设置当前 Session
   * @param {string} sessionId - Session ID
   */
  setSession(sessionId) {
    process.env.ULTRAWORK_SESSION = sessionId;
    console.log(`[UltraWork] 切换到 Session: ${sessionId}`);
  },

  /**
   * 获取当前 Session
   */
  getSession() {
    return getCurrentSession();
  }
};

// 导出模块
module.exports = ultrawork;

// 如果直接运行此文件，显示帮助信息
if (require.main === module) {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     UltraWork Panel Reporter - OpenCode 状态推送工具        ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║  使用示例:                                                    ║');
  console.log('║                                                               ║');
  console.log('║  const ultrawork = require("./ultrawork-reporter");           ║');
  console.log('║                                                               ║');
  console.log('║  // 1. 创建/设置 Session                                     ║');
  console.log('║  await ultrawork.createSession("修复登录bug");                ║');
  console.log('║  // 或: ultrawork.setSession("abc123");                       ║');
  console.log('║                                                               ║');
  console.log('║  // 2. 开始任务                                              ║');
  console.log('║  await ultrawork.report("running", "分析代码", 0);            ║');
  console.log('║                                                               ║');
  console.log('║  // 3. 分配将领                                              ║');
  console.log('║  await ultrawork.assign("zhaoyun", "深度分析", 10);           ║');
  console.log('║  await ultrawork.log("zhaoyun", "赵云", "开始分析代码...");    ║');
  console.log('║                                                               ║');
  console.log('║  // 4. 更新进度                                              ║');
  console.log('║  await ultrawork.progress(50, "分析阶段");                    ║');
  console.log('║                                                               ║');
  console.log('║  // 5. 完成将领任务                                          ║');
  console.log('║  await ultrawork.complete("zhaoyun");                        ║');
  console.log('║                                                               ║');
  console.log('║  // 6. 完成任务                                              ║');
  console.log('║  await ultrawork.finish();                                   ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
}
