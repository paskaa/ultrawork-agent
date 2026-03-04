#!/usr/bin/env node
/**
 * UltraWork 右侧进度面板测试
 * 直接在终端运行查看效果: node test-terminal-ui.js
 */

const TerminalUI = require('./scripts/terminal-ui');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('\n');
  console.log('='.repeat(50));
  console.log('  UltraWork 右侧进度面板测试');
  console.log('='.repeat(50));
  console.log('\n正在初始化...\n');

  // 初始化 UI
  TerminalUI.init();
  TerminalUI.setTask('实现用户登录功能');

  // 注册将领
  TerminalUI.registerAgent('zhugeliang', '诸葛亮', '孔明');
  TerminalUI.registerAgent('zhaoyun', '赵云', '子龙');
  TerminalUI.registerAgent('simayi', '司马懿', '仲达');
  TerminalUI.registerAgent('zhangfei', '张飞', '翼德');

  await sleep(1000);

  // 诸葛亮分析意图
  TerminalUI.agentStart('zhugeliang', '意图分析');
  TerminalUI.setProgress(10);
  await sleep(800);
  TerminalUI.agentProgress('zhugeliang', 50, '兵法: 深入敌阵');
  TerminalUI.setProgress(15);
  await sleep(500);
  TerminalUI.agentComplete('zhugeliang');
  TerminalUI.setProgress(20);

  await sleep(500);

  // 赵云出征
  TerminalUI.agentStart('zhaoyun', '攻城拔寨 - 前端实现');
  TerminalUI.setProgress(25);
  await sleep(600);
  TerminalUI.agentProgress('zhaoyun', 30, '正在探索代码库...');
  TerminalUI.setProgress(35);
  await sleep(600);
  TerminalUI.agentProgress('zhaoyun', 60, '分析现有模式...');
  TerminalUI.setProgress(50);
  await sleep(600);
  TerminalUI.agentProgress('zhaoyun', 90, '实现功能中...');
  TerminalUI.setProgress(70);
  await sleep(600);
  TerminalUI.agentComplete('zhaoyun');
  TerminalUI.setProgress(80);

  await sleep(500);

  // 司马懿探查
  TerminalUI.agentStart('simayi', '探索代码库');
  TerminalUI.setProgress(82);
  await sleep(400);
  TerminalUI.agentProgress('simayi', 50, '搜索相关组件');
  TerminalUI.setProgress(88);
  await sleep(400);
  TerminalUI.agentComplete('simayi');
  TerminalUI.setProgress(95);

  await sleep(500);

  // 完成
  TerminalUI.setProgress(100);
  TerminalUI.addLog('🎉 任务完成！');
  TerminalUI.addLog('✅ 2 位将领凯旋');

  // 等待一下再销毁
  await sleep(2000);

  // 销毁 UI
  TerminalUI.destroy();

  console.log('\n\n测试完成！右侧面板应该显示了实时进度。\n');
}

main().catch(console.error);