/**
 * UltraWork State Sync V3 - 45人军团状态同步
 * 支持WebSocket实时通信 + 增强日志记录
 * 
 * 使用方法:
 * const sync = require('./state-sync');
 * 
 * // 开始任务
 * await sync.startTask('修复登录页面Bug');
 * 
 * // 将领开始执行
 * await sync.agentStart('simayi', '搜索代码库');
 * 
 * // 记录日志 (支持多种类型)
 * await sync.log('simayi', '找到3个相关文件', 'action');
 * await sync.log('simayi', '分析验证码逻辑...', 'thinking');
 * await sync.log('simayi', '修改了login.js', 'modify');
 * 
 * // 更新进度
 * await sync.updateProgress(50);
 * 
 * // 将领完成
 * await sync.agentComplete('simayi');
 * 
 * // 完成任务
 * await sync.completeTask();
 */

const http = require('http');

const DEFAULT_PORT = process.env.ULTRAWORK_PORT || 3459;

// 当前任务ID
let currentTaskId = null;

// ═══════════════════════════════════════════════════════════════
// 45位将领常量定义
// ═══════════════════════════════════════════════════════════════
const AGENTS = {
  // 主帅 (1人)
  ZHUGELIANG: 'zhugeliang',
  
  // 大都督 (1人)
  ZHOUYU: 'zhouyu',
  
  // 五虎大将 (6人)
  ZHAOYUN: 'zhaoyun',
  SIMAYI: 'simayi',
  GUANYU: 'guanyu',
  ZHANGFEI: 'zhangfei',
  MACHAO: 'machao',
  HUANGZHONG: 'huangzhong',
  
  // 诸葛亮部将 (3人)
  LUSU: 'lusu',
  HUANGGAI: 'huanggai',
  XUSHU: 'xushu',
  
  // 赵云部将 (5人)
  GAOSHUN: 'gaoshun',
  CHENDAO: 'chendao',
  ZHANGBAO: 'zhangbao',
  GUANXING: 'guanxing',
  ZHANGYI: 'zhangyi',
  
  // 司马懿部将 (5人)
  SIMASHI: 'simashi',
  SIMAZHAO: 'simazhao',
  DENGAI: 'dengai',
  ZHONGHUI: 'zhonghui',
  WANGSHUANG: 'wangshuang',
  
  // 关羽部将 (5人)
  GUANPING: 'guanping',
  ZHOUCANG: 'zhoucang',
  GUANSUO: 'guansuo',
  ZHANGLIAO: 'zhangliao',
  YUEJIN: 'yuejin',
  
  // 张飞部将 (4人)
  LEIXU: 'leixu',
  WULAN: 'wulan',
  LIDIAN: 'lidian',
  YUJIN: 'yujin',
  
  // 马超部将 (4人)
  MADAI: 'madai',
  PANGDE: 'pangde',
  HANZHONG: 'hanzhong',
  MAZHONG: 'mazhong',
  
  // 黄忠部将 (3人)
  WEIYAN: 'weiyan',
  YANPU: 'yanpu',
  WUQI: 'wuqi',
  
  // 监察团队 (4人)
  MANCHONG: 'manchong',
  CHENGYU: 'chengyu',
  JIAXU: 'jiaxu',
  LIUYE: 'liuye',
  
  // 测试团队 (4人)
  PANGLIN: 'panglin',
  YANYAN_TEST: 'yanyan_test',
  JIANGWEI: 'jiangwei',
  JIANGWAN: 'jiangwan'
};

// 阶段常量
const PHASES = {
  ANALYSIS: 'analysis',
  PLANNING: 'planning',
  FIX: 'fix',
  REVIEW: 'review',
  TEST: 'test',
  MONITOR: 'monitor'
};

// ═══════════════════════════════════════════════════════════════
// HTTP请求
// ═══════════════════════════════════════════════════════════════
async function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: DEFAULT_PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve(json);
        } catch (e) {
          resolve({ success: false, error: body });
        }
      });
    });

    req.on('error', (err) => {
      // 静默处理连接错误（服务器可能未启动）
      resolve({ success: false, error: err.message });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// ═══════════════════════════════════════════════════════════════
// 任务管理
// ═══════════════════════════════════════════════════════════════
async function startTask(title) {
  const result = await request('POST', '/api/task/start', { title });
  if (result.success) {
    currentTaskId = result.taskId;
    console.log('[UltraWork] 🚀 任务开始: ' + title);
  }
  return result;
}

async function updateProgress(progress) {
  const result = await request('POST', '/api/task/progress', { progress });
  return result;
}

async function completeTask(status = 'completed') {
  const result = await request('POST', '/api/task/complete', { status });
  if (result.success) {
    console.log('[UltraWork] ' + (status === 'completed' ? '✅ 任务完成' : '❌ 任务失败'));
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════
// 将领状态管理
// ═══════════════════════════════════════════════════════════════
async function agentStart(agentId, task) {
  const result = await request('POST', '/api/agents/' + agentId + '/status', {
    status: 'running',
    task,
    progress: 0
  });
  if (result.success) {
    const agentNames = {
      zhugeliang: '诸葛亮', zhouyu: '周瑜',
      zhaoyun: '赵云', simayi: '司马懿', guanyu: '关羽', zhangfei: '张飞', machao: '马超', huangzhong: '黄忠',
      lusu: '鲁肃', huanggai: '黄盖', xushu: '徐庶',
      gaoshun: '高顺', chendao: '陈到', zhangbao: '张苞', guanxing: '关兴', zhangyi: '张翼',
      simashi: '司马师', simazhao: '司马昭', dengai: '邓艾', zhonghui: '钟会', wangshuang: '王双',
      guanping: '关平', zhoucang: '周仓', guansuo: '关索', zhangliao: '张辽', yuejin: '乐进',
      leixu: '雷绪', wulan: '吴兰', lidian: '李典', yujin: '于禁',
      madai: '马岱', pangde: '庞德', hanzhong: '韩忠', mazhong: '马忠',
      weiyan: '魏延', yanpu: '严颜', wuqi: '吴懿',
      manchong: '满宠', chengyu: '程昱', jiaxu: '贾诩', liuye: '刘晔',
      panglin: '庞林', yanyan_test: '严颜', jiangwei: '姜维', jiangwan: '蒋琬'
    };
    console.log('[UltraWork] 🟢 ' + (agentNames[agentId] || agentId) + ' 开始执行: ' + task);
  }
  return result;
}

async function agentProgress(agentId, progress, task = null) {
  const data = { progress };
  if (task) data.task = task;
  
  const result = await request('POST', '/api/agents/' + agentId + '/status', data);
  return result;
}

async function agentComplete(agentId, success = true) {
  const result = await request('POST', '/api/agents/' + agentId + '/status', {
    status: success ? 'completed' : 'failed',
    progress: success ? 100 : 0
  });
  if (result.success) {
    const agentNames = {
      zhugeliang: '诸葛亮', zhouyu: '周瑜',
      zhaoyun: '赵云', simayi: '司马懿', guanyu: '关羽', zhangfei: '张飞', machao: '马超', huangzhong: '黄忠',
      lusu: '鲁肃', huanggai: '黄盖', xushu: '徐庶',
      gaoshun: '高顺', chendao: '陈到', zhangbao: '张苞', guanxing: '关兴', zhangyi: '张翼',
      simashi: '司马师', simazhao: '司马昭', dengai: '邓艾', zhonghui: '钟会', wangshuang: '王双',
      guanping: '关平', zhoucang: '周仓', guansuo: '关索', zhangliao: '张辽', yuejin: '乐进',
      leixu: '雷绪', wulan: '吴兰', lidian: '李典', yujin: '于禁',
      madai: '马岱', pangde: '庞德', hanzhong: '韩忠', mazhong: '马忠',
      weiyan: '魏延', yanpu: '严颜', wuqi: '吴懿',
      manchong: '满宠', chengyu: '程昱', jiaxu: '贾诩', liuye: '刘晔',
      panglin: '庞林', yanyan_test: '严颜', jiangwei: '姜维', jiangwan: '蒋琬'
    };
    console.log('[UltraWork] ' + (success ? '✅' : '❌') + ' ' + (agentNames[agentId] || agentId) + ' 执行完成');
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════
// 日志记录 (支持多种类型)
// ═══════════════════════════════════════════════════════════════
async function log(agentId, message, type = 'action') {
  const result = await request('POST', '/api/agents/' + agentId + '/log', {
    message,
    type
  });
  
  // 控制台输出带颜色
  const typeConfig = {
    thinking: { emoji: '💭', color: '\x1b[35m', label: '思考' },
    action: { emoji: '⚡', color: '\x1b[32m', label: '执行' },
    modify: { emoji: '✏️', color: '\x1b[33m', label: '修改' },
    error: { emoji: '❌', color: '\x1b[31m', label: '错误' },
    info: { emoji: 'ℹ️', color: '\x1b[36m', label: '信息' },
    warn: { emoji: '⚠️', color: '\x1b[33m', label: '警告' }
  };
  
  const config = typeConfig[type] || typeConfig.action;
  const reset = '\x1b[0m';
  
  console.log(\`[UltraWork] \${config.emoji} [\${config.color}\${config.label}\${reset}] [\${agentId}] \${message}\`);
  return result;
}

// 快捷日志方法
async function thinking(agentId, message) {
  return await log(agentId, message, 'thinking');
}

async function action(agentId, message) {
  return await log(agentId, message, 'action');
}

async function modify(agentId, message) {
  return await log(agentId, message, 'modify');
}

async function error(agentId, message) {
  return await log(agentId, message, 'error');
}

async function info(agentId, message) {
  return await log(agentId, message, 'info');
}

async function warn(agentId, message) {
  return await log(agentId, message, 'warn');
}

// ═══════════════════════════════════════════════════════════════
// 阶段管理
// ═══════════════════════════════════════════════════════════════
async function updatePhase(phaseName, status, agentId = null) {
  const result = await request('POST', '/api/phases/' + phaseName, {
    status,
    agentId
  });
  
  if (result.success) {
    const phaseNames = {
      analysis: '🔍 分析阶段',
      planning: '📋 规划阶段',
      fix: '🔧 修复阶段',
      review: '👁️ 审查阶段',
      test: '✅ 测试阶段',
      monitor: '👁️ 监控阶段'
    };
    const statusEmojis = {
      pending: '⏳',
      running: '🔄',
      completed: '✅',
      failed: '❌'
    };
    console.log('[UltraWork] ' + statusEmojis[status] + ' ' + (phaseNames[phaseName] || phaseName) + ': ' + status);
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════
// 批量日志
// ═══════════════════════════════════════════════════════════════
async function logBatch(agentId, logs) {
  for (const entry of logs) {
    await log(agentId, entry.message, entry.type);
    await new Promise(r => setTimeout(r, 10));
  }
}

// ═══════════════════════════════════════════════════════════════
// 执行器 (高级用法)
// ═══════════════════════════════════════════════════════════════
function createExecutor(agentId, taskName) {
  return {
    async start() {
      await agentStart(agentId, taskName);
    },
    
    async log(message, type = 'action') {
      await log(agentId, message, type);
    },
    
    async thinking(message) {
      await log(agentId, message, 'thinking');
    },
    
    async action(message) {
      await log(agentId, message, 'action');
    },
    
    async modify(message) {
      await log(agentId, message, 'modify');
    },
    
    async error(message) {
      await log(agentId, message, 'error');
    },
    
    async info(message) {
      await log(agentId, message, 'info');
    },
    
    async warn(message) {
      await log(agentId, message, 'warn');
    },
    
    async progress(percent, message = null) {
      await agentProgress(agentId, percent, message);
      if (message) {
        await log(agentId, message, 'action');
      }
    },
    
    async complete(success = true) {
      await agentComplete(agentId, success);
    }
  };
}

// ═══════════════════════════════════════════════════════════════
// 状态查询
// ═══════════════════════════════════════════════════════════════
async function getStatus() {
  return await request('GET', '/api/status');
}

// ═══════════════════════════════════════════════════════════════
// 导出模块
// ═══════════════════════════════════════════════════════════════
module.exports = {
  // 任务管理
  startTask,
  updateProgress,
  completeTask,
  
  // 将领状态
  agentStart,
  agentProgress,
  agentComplete,
  
  // 日志记录
  log,
  thinking,
  action,
  modify,
  error,
  info,
  warn,
  logBatch,
  
  // 阶段管理
  updatePhase,
  
  // 状态查询
  getStatus,
  
  // 高级功能
  createExecutor,
  
  // 常量
  AGENTS,
  PHASES,
  
  // 工具
  request
};
