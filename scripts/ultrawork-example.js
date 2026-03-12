/**
 * UltraWork 使用示例
 * 
 * 展示如何在 OpenCode 任务中自动推送状态到 Web 面板
 */

const { init, startTask, assignAgent, updateProgress, logMessage, completeAgent, completeTask } = require('./ultrawork-wrapper');

// 示例：修复登录 Bug 的完整流程
async function exampleBugFix() {
  console.log('=== 开始修复登录 Bug ===');
  
  // 1. 初始化（创建 Session）
  await init('修复登录Bug');
  
  // 2. 开始任务（赵云负责）
  await startTask('zhaoyun', '修复登录Bug', '分析登录失败原因');
  
  // 3. 赵云分析代码
  await logMessage('zhaoyun', '正在分析登录模块...');
  await updateProgress(20);
  
  // 4. 发现问题，分配给关羽审查
  await assignAgent('guanyu', '审查登录验证代码');
  await logMessage('guanyu', '发现缺少参数校验');
  await updateProgress(40);
  
  // 5. 张飞快速修复
  await assignAgent('zhangfei', '修复参数校验问题');
  await logMessage('zhangfei', '已添加参数校验逻辑');
  await updateProgress(70);
  
  // 6. 徐庶测试
  await assignAgent('xushu', '测试修复结果');
  await logMessage('xushu', '测试通过，登录功能正常');
  await updateProgress(90);
  
  // 7. 完成各个将领的任务
  await completeAgent('zhaoyun');
  await completeAgent('guanyu');
  await completeAgent('zhangfei');
  await completeAgent('xushu');
  
  // 8. 完成任务
  await completeTask();
  
  console.log('=== 任务完成 ===');
}

// 示例：重构代码
async function exampleRefactor() {
  console.log('=== 开始代码重构 ===');
  
  await init('订单模块重构');
  
  await startTask('zhouyu', '订单模块重构', '制定重构方案');
  await logMessage('zhouyu', '分析现有代码结构');
  await updateProgress(10);
  
  await assignAgent('lusu', '资源评估');
  await logMessage('lusu', '评估完成，需要5位将领');
  await updateProgress(20);
  
  await assignAgent('gaoshun', '重构前端代码');
  await logMessage('gaoshun', '开始重构 Vue 组件');
  await updateProgress(40);
  
  await assignAgent('chendao', '重构后端 API');
  await logMessage('chendao', '优化数据库查询');
  await updateProgress(60);
  
  await assignAgent('guanping', '代码审查');
  await logMessage('guanping', '审查通过，代码质量良好');
  await updateProgress(80);
  
  await completeAgent('zhouyu');
  await completeAgent('lusu');
  await completeAgent('gaoshun');
  await completeAgent('chendao');
  await completeAgent('guanping');
  await completeTask();
  
  console.log('=== 重构完成 ===');
}

// 如果直接运行
if (require.main === module) {
  // 选择要运行的示例
  const example = process.argv[2];
  
  if (example === 'bugfix') {
    exampleBugFix().catch(console.error);
  } else if (example === 'refactor') {
    exampleRefactor().catch(console.error);
  } else {
    console.log('使用方法: node example.js [bugfix|refactor]');
    console.log('');
    console.log('示例:');
    console.log('  node example.js bugfix    - 运行修复 Bug 示例');
    console.log('  node example.js refactor  - 运行重构示例');
  }
}

module.exports = { exampleBugFix, exampleRefactor };
