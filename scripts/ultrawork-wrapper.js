/**
 * UltraWork Auto-Reporter - 自动状态推送 Hook
 * 
 * 自动检测 OpenCode 任务执行并推送到 Web 面板
 * 
 * 使用方法：
 * const { startTask, updateProgress, completeTask, assignAgent, logMessage } = require('./ultrawork-wrapper');
 * 
 * // 开始任务
 * await startTask('zhaoyun', '修复登录bug', '分析代码问题');
 * 
 * // 更新进度
 * await updateProgress(50);
 * 
 * // 分配另一个将领
 * await assignAgent('guanyu', '代码审查');
 * 
 * // 推送日志
 * await logMessage('guanyu', '关羽', '发现问题：缺少参数校验');
 * 
 * // 完成任务
 * await completeTask();
 */

const ultrawork = require('./ultrawork-reporter');

// 当前任务状态
let currentState = {
  sessionId: null,
  status: 'idle',
  task: '',
  progress: 0,
  agents: new Map()
};

/**
 * 初始化并创建/设置 Session
 * @param {string} sessionName - Session 名称（可选）
 * @param {string} sessionId - 现有 Session ID（可选）
 */
async function init(sessionName = '', sessionId = null) {
  if (sessionId) {
    ultrawork.setSession(sessionId);
    currentState.sessionId = sessionId;
    console.log(`[UltraWork] 使用现有 Session: ${sessionId}`);
  } else {
    const result = await ultrawork.createSession(sessionName);
    if (result.success) {
      currentState.sessionId = result.sessionId;
    }
  }
  return currentState.sessionId;
}

/**
 * 开始任务
 * @param {string} primaryAgent - 主将 ID
 * @param {string} taskName - 任务名称
 * @param {string} description - 任务描述
 */
async function startTask(primaryAgent, taskName, description = '') {
  if (!currentState.sessionId) {
    await init(taskName);
  }
  
  currentState.status = 'running';
  currentState.task = taskName;
  currentState.progress = 0;
  
  // 更新整体状态
  await ultrawork.report('running', taskName, 0);
  
  // 分配主将
  await ultrawork.assign(primaryAgent, description || taskName, 0);
  await ultrawork.log(primaryAgent, getAgentName(primaryAgent), `开始任务: ${taskName}`);
  
  currentState.agents.set(primaryAgent, {
    status: 'running',
    task: description || taskName,
    progress: 0
  });
  
  console.log(`[UltraWork] 任务开始: ${taskName} (${primaryAgent})`);
}

/**
 * 分配将领
 * @param {string} agentId - 将领 ID
 * @param {string} task - 任务描述
 * @param {number} progress - 初始进度
 */
async function assignAgent(agentId, task, progress = 0) {
  await ultrawork.assign(agentId, task, progress);
  await ultrawork.log(agentId, getAgentName(agentId), `分配任务: ${task}`);
  
  currentState.agents.set(agentId, {
    status: 'running',
    task,
    progress
  });
  
  console.log(`[UltraWork] 分配将领: ${getAgentName(agentId)} - ${task}`);
}

/**
 * 更新进度
 * @param {number} progress - 进度 0-100
 * @param {string} phase - 阶段名称
 */
async function updateProgress(progress, phase = '') {
  currentState.progress = progress;
  await ultrawork.progress(progress, phase);
  
  // 更新所有运行中的将领进度
  for (const [agentId, agentState] of currentState.agents) {
    if (agentState.status === 'running') {
      await ultrawork.assign(agentId, agentState.task, progress);
    }
  }
  
  console.log(`[UltraWork] 进度更新: ${progress}%`);
}

/**
 * 推送日志
 * @param {string} agentId - 将领 ID
 * @param {string} message - 日志消息
 */
async function logMessage(agentId, message) {
  const agentName = getAgentName(agentId);
  await ultrawork.log(agentId, agentName, message);
  console.log(`[UltraWork] [${agentName}] ${message}`);
}

/**
 * 完成将领任务
 * @param {string} agentId - 将领 ID
 */
async function completeAgent(agentId) {
  await ultrawork.complete(agentId);
  await ultrawork.log(agentId, getAgentName(agentId), '任务完成');
  
  if (currentState.agents.has(agentId)) {
    const agent = currentState.agents.get(agentId);
    agent.status = 'completed';
    agent.progress = 100;
  }
  
  console.log(`[UltraWork] 将领完成: ${getAgentName(agentId)}`);
}

/**
 * 完成任务
 */
async function completeTask() {
  currentState.status = 'completed';
  currentState.progress = 100;
  
  // 完成所有将领
  for (const [agentId, agentState] of currentState.agents) {
    if (agentState.status === 'running') {
      await completeAgent(agentId);
    }
  }
  
  await ultrawork.finish();
  console.log(`[UltraWork] 任务完成: ${currentState.task}`);
  
  // 重置状态
  currentState = {
    sessionId: currentState.sessionId,
    status: 'idle',
    task: '',
    progress: 0,
    agents: new Map()
  };
}

/**
 * 获取将领中文名
 * @param {string} agentId - 将领 ID
 */
function getAgentName(agentId) {
  const names = {
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
    panglin: '庞林', yanyan: '严颜', jiangwei: '姜维', jiangwan: '蒋琬'
  };
  return names[agentId] || agentId;
}

module.exports = {
  init,
  startTask,
  assignAgent,
  updateProgress,
  logMessage,
  completeAgent,
  completeTask,
  ultrawork
};
