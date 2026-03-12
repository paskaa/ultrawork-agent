/**
 * UltraWork Panel Auto-Start Hook
 * 
 * 功能：
 * - OpenCode 启动时自动检查面板状态
 * - 如果面板未运行，自动启动
 * - 提供多种启动模式
 * 
 * 使用方法：
 * 将此文件放入 OpenCode 的 hooks 目录，或手动调用
 */

const { exec, spawn } = require('child_process');
const http = require('http');
const path = require('path');

const PANEL_CONFIG = {
  host: 'localhost',
  port: 3459,
  scriptPath: path.join(__dirname, '..', 'plugins', 'ultrawork-sanguo', 'scripts', 'state-server-v5.cjs'),
  startupScript: path.join(__dirname, '..', 'plugins', 'ultrawork-sanguo', 'scripts', 'start-panel.bat')
};

/**
 * 检查面板是否运行
 */
async function isPanelRunning() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: PANEL_CONFIG.host,
      port: PANEL_CONFIG.port,
      path: '/api/sessions',
      method: 'GET',
      timeout: 2000
    }, (res) => {
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

/**
 * 启动面板
 */
async function startPanel() {
  console.log('[UltraWork] 正在启动 Web 面板...');
  
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32';
    
    if (isWindows && require('fs').existsSync(PANEL_CONFIG.startupScript)) {
      // Windows: 使用启动脚本
      const child = spawn('cmd', ['/c', 'start', '/min', PANEL_CONFIG.startupScript], {
        detached: true,
        windowsHide: true
      });
      
      child.on('error', reject);
      
      // 等待3秒后检查
      setTimeout(async () => {
        const running = await isPanelRunning();
        if (running) {
          console.log('[UltraWork] ✓ Web 面板已启动');
          console.log('[UltraWork] 访问: http://localhost:3459');
          resolve(true);
        } else {
          reject(new Error('启动失败'));
        }
      }, 3000);
    } else {
      // 其他平台: 直接启动
      const child = spawn('node', [PANEL_CONFIG.scriptPath], {
        detached: true,
        stdio: 'ignore'
      });
      
      child.unref();
      
      // 等待3秒后检查
      setTimeout(async () => {
        const running = await isPanelRunning();
        if (running) {
          console.log('[UltraWork] ✓ Web 面板已启动');
          console.log('[UltraWork] 访问: http://localhost:3459');
          resolve(true);
        } else {
          reject(new Error('启动失败'));
        }
      }, 3000);
    }
  });
}

/**
 * 自动启动（OpenCode 启动时调用）
 */
async function autoStart() {
  try {
    const running = await isPanelRunning();
    
    if (running) {
      console.log('[UltraWork] ✓ Web 面板已在运行');
      console.log('[UltraWork] 访问: http://localhost:3459');
      return { status: 'already-running', url: 'http://localhost:3459' };
    }
    
    console.log('[UltraWork] Web 面板未运行，正在自动启动...');
    await startPanel();
    return { status: 'started', url: 'http://localhost:3459' };
  } catch (error) {
    console.error('[UltraWork] 自动启动失败:', error.message);
    return { status: 'failed', error: error.message };
  }
}

/**
 * 停止面板
 */
async function stopPanel() {
  return new Promise((resolve) => {
    const isWindows = process.platform === 'win32';
    const cmd = isWindows 
      ? 'taskkill /F /IM node.exe 2>nul'
      : 'pkill -f state-server-v5.cjs';
    
    exec(cmd, (error) => {
      if (error) {
        console.log('[UltraWork] 面板可能已经停止');
      } else {
        console.log('[UltraWork] ✓ Web 面板已停止');
      }
      resolve();
    });
  });
}

/**
 * 重启面板
 */
async function restartPanel() {
  await stopPanel();
  await new Promise(r => setTimeout(r, 2000));
  return await autoStart();
}

// 导出模块
module.exports = {
  isPanelRunning,
  startPanel,
  stopPanel,
  restartPanel,
  autoStart
};

// 如果直接运行，执行自动启动
if (require.main === module) {
  autoStart().then(result => {
    if (result.status === 'started' || result.status === 'already-running') {
      console.log('\n按 Ctrl+C 退出（面板将继续在后台运行）\n');
    }
  });
}
