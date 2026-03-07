#!/usr/bin/env node

/**
 * UltraWork CLI 入口
 * 多智能体调度系统命令行工具
 */

const path = require('path');
const UltraWork = require('../scripts/index.js');

// 获取命令行参数
const args = process.argv.slice(2);

// 显示帮助
if (args.length === 0 || args[0] === '-h' || args[0] === '--help') {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ██╗   ██╗██╗   ██╗██╗  ██╗████████╗██████╗ ██╗ █████╗ ██╗║
║   ██║   ██║██║   ██║██║ ██╔╝╚══██╔══╝██╔══██╗██║██╔══██╗██║║
║   ██║   ██║██║   ██║█████╔╝    ██║   ██████╔╝██║███████║██║║
║   ╚██╗ ██╔╝██║   ██║██╔═██╗    ██║   ██╔══██╗██║██╔══██║██║║
║    ╚████╔╝ ╚██████╔╝██║  ██╗   ██║   ██║  ██║██║██║  ██║██║║
║     ╚═══╝   ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═╝║
║                                                           ║
║          多智能体调度系统 - 自律军团                        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

用法:
  ultrawork <请求内容>        执行任务
  ultrawork --loop <请求>     循环执行模式
  ultrawork --analyze <请求>  仅分析意图
  ultrawork --models          查看可用模型

命令别名:
  ulw                         ultrawork 的简写

示例:
  ultrawork 实现用户登录功能
  ultrawork --loop 重构订单模块
  ultrawork --analyze "设计支付系统架构"
  ulw 修复登录页面的样式问题

触发词:
  你也可以在请求中使用触发词:
  - ultrawork 实现登录功能
  - ulw 修复 bug

任务类别:
  visual-engineering  前端、UI/UX、设计
  deep               深度开发、重构、功能实现
  quick              快速修复、小改动
  ultrabrain         架构设计、决策分析

专家 Agent:
  Sisyphus    主调度器 - 协调整体流程
  Hephaestus  深度执行者 - 自主完成任务
  Prometheus  战略规划师 - 访谈式规划
  Explorer    探索者 - 信息收集

选项:
  -h, --help     显示帮助信息
  -v, --version  显示版本号
  --loop         启用循环执行模式
  --analyze      仅分析意图，不执行
  --models       显示可用模型列表
  --config       显示当前配置

更多信息: https://github.com/your-username/ultrawork-agent
`);
  process.exit(0);
}

// 显示版本
if (args[0] === '-v' || args[0] === '--version') {
  const pkg = require('../package.json');
  console.log(`ultrawork v${pkg.version}`);
  process.exit(0);
}

// 显示可用模型
if (args[0] === '--models') {
  const models = UltraWork.getAvailableModels();
  console.log('\n可用模型:\n');
  console.log('  名称'.padEnd(20) + '速度'.padEnd(10) + '成本'.padEnd(10) + '擅长领域');
  console.log('  '.padEnd(50, '-'));
  for (const model of models) {
    console.log(`  ${model.displayName.padEnd(18)} ${model.speed.padEnd(10)} ${model.cost.padEnd(10)} ${model.strengths.join(', ')}`);
  }
  console.log('');
  process.exit(0);
}

// 显示配置
if (args[0] === '--config') {
  console.log('\n当前配置:\n');
  console.log(JSON.stringify(UltraWork.config, null, 2));
  console.log('');
  process.exit(0);
}

// 仅分析意图
if (args[0] === '--analyze') {
  const request = args.slice(1).join(' ');
  if (!request) {
    console.error('错误: 请提供要分析的内容');
    process.exit(1);
  }

  const intent = UltraWork.analyzeIntent(request);
  console.log('\n意图分析结果:\n');
  console.log(JSON.stringify(intent, null, 2));
  console.log('');
  process.exit(0);
}

// 执行任务
const loopMode = args[0] === '--loop';
const request = loopMode ? args.slice(1).join(' ') : args.join(' ');

if (!request) {
  console.error('错误: 请提供任务内容');
  process.exit(1);
}

// 执行
UltraWork.execute(request, { loop: loopMode })
  .then(result => {
    console.log('\n结果:');
    console.log(JSON.stringify(result, null, 2));
  })
  .catch(error => {
    console.error('\n执行失败:', error.message);
    process.exit(1);
  });