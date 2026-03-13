#!/usr/bin/env node
/**
 * 根据模型长处为武将配置最适合的模型
 * 
 * 模型特点:
 * - glm-5: 战略规划、复杂推理、架构设计 (主帅、大都督)
 * - qwen3.5-plus: 代码能力最强、视觉理解 (开发、代码审查)
 * - AstronCodingPlan/astron-code-latest: 长文本处理、代码理解 (文档、分析、信息整理)
 * - MiniMax-M2.5: 快速响应、Agent能力 (探索、监控、快速任务)
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'config', 'ultrawork-sanguo.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// 模型分配策略
const MODEL_ASSIGNMENTS = {
  // 主帅 - 战略决策
  'zhugeliang': { model: 'bailian/glm-5', reason: '主帅需要战略规划和复杂推理' },
  
  // 大都督 - 战略规划
  'zhouyu': { model: 'bailian/glm-5', reason: '战略规划、方案决策' },
  
  // 深度执行 - 代码开发
  'zhaoyun': { model: 'bailian/qwen3.5-plus', reason: '深度执行、代码开发' },
  'gaoshun': { model: 'bailian/qwen3.5-plus', reason: '前端开发、视觉工程' },
  'chendao': { model: 'bailian/qwen3.5-plus', reason: '后端开发、代码实现' },
  
  // 探索收集 - 快速响应
  'simayi': { model: 'bailian/MiniMax-M2.5', reason: '快速探索、代码搜索' },
  'simashi': { model: 'bailian/MiniMax-M2.5', reason: '深度分析、模式发现' },
  
  // 质量把关 - 代码审查
  'guanyu': { model: 'bailian/qwen3.5-plus', reason: '代码审查、质量把控' },
  'guanping': { model: 'bailian/qwen3.5-plus', reason: '代码风格检查' },
  'zhoucang': { model: 'bailian/qwen3.5-plus', reason: '安全审计' },
  
  // 快速突击
  'zhangfei': { model: 'bailian/MiniMax-M2.5', reason: '快速响应、速战速决' },
  'leixu': { model: 'bailian/MiniMax-M2.5', reason: '快速定位' },
  'wulan': { model: 'bailian/qwen3.5-plus', reason: '即时修复、代码补丁' },
  
  // 资源规划
  'lusu': { model: 'bailian/glm-5', reason: '资源分析、可行性研究' },
  'huanggai': { model: 'bailian/qwen3.5-plus', reason: '执行落地、原型验证' },
  
  // 文档整理
  'simazhao': { model: 'AstronCodingPlan/astron-code-latest', reason: '信息整理、文档生成、长文本' },
  
  // 后备支援
  'machao': { model: 'bailian/glm-5', reason: '特殊任务、实验功能' },
  'pangde': { model: 'bailian/qwen3.5-plus', reason: '探索任务、稳健执行' },
  
  // DevOps
  'dengai': { model: 'bailian/qwen3.5-plus', reason: 'DevOps、CI/CD配置' },
  'wangshuang': { model: 'bailian/qwen3.5-plus', reason: 'CI/CD流水线' },
  'zhangyi_devops': { model: 'bailian/qwen3.5-plus', reason: '容器编排' },
  
  // 数据库
  'zhangliao': { model: 'bailian/qwen3.5-plus', reason: '数据库架构' },
  'yuejin': { model: 'bailian/qwen3.5-plus', reason: 'SQL优化' },
  'lidian': { model: 'bailian/qwen3.5-plus', reason: '数据迁移' },
  
  // 安全
  'yujin': { model: 'bailian/qwen3.5-plus', reason: '安全审计' },
  'maojie': { model: 'bailian/qwen3.5-plus', reason: '渗透测试' },
  'dongzhao': { model: 'bailian/qwen3.5-plus', reason: '加密安全' },
  
  // 性能
  'zhanghe': { model: 'bailian/glm-5', reason: '性能分析、容量规划' },
  'guohuai': { model: 'bailian/qwen3.5-plus', reason: '系统性能优化' },
  
  // 移动开发
  'ganning': { model: 'bailian/qwen3.5-plus', reason: '移动开发' },
  'lingtong': { model: 'bailian/qwen3.5-plus', reason: 'iOS开发' },
  'dingfeng': { model: 'bailian/qwen3.5-plus', reason: 'Android开发' },
  
  // API
  'taishici': { model: 'bailian/qwen3.5-plus', reason: 'API设计' },
  'zhoutai': { model: 'bailian/qwen3.5-plus', reason: '接口设计' },
  
  // AI
  'luxun': { model: 'bailian/glm-5', reason: 'AI战略、ML/DL规划' },
  'panzhang': { model: 'bailian/qwen3.5-plus', reason: '数据科学、模型实现' },
  
  // Web3
  'lvmeng': { model: 'bailian/glm-5', reason: 'Web3战略、区块链架构' },
  'jiangqin': { model: 'bailian/qwen3.5-plus', reason: '智能合约开发' },
  
  // 监控
  'manchong': { model: 'bailian/glm-5', reason: '监控指挥、决策告警' },
  'chengyu': { model: 'bailian/MiniMax-M2.5', reason: '前端监控' },
  'jiaxu': { model: 'bailian/MiniMax-M2.5', reason: '后端监控' },
  'liuye': { model: 'bailian/qwen3.5-plus', reason: 'E2E测试' },
  
  // 测试
  'xushu': { model: 'bailian/glm-5', reason: '测试策略、质量规划' },
  'panglin': { model: 'bailian/qwen3.5-plus', reason: '前端测试' },
  'yanyan': { model: 'bailian/qwen3.5-plus', reason: '后端测试' },
  
  // 文件操作
  'jiangwei': { model: 'bailian/qwen3.5-plus', reason: '文件操作、系统管理' }
};

// 更新agents
let updatedCount = 0;
const modelStats = {};

for (const [agentName, agentConfig] of Object.entries(config.agents)) {
  const assignment = MODEL_ASSIGNMENTS[agentName];
  
  if (assignment) {
    const oldModel = agentConfig.model;
    agentConfig.model = assignment.model;
    
    // 设置fallback链
    if (assignment.model === 'bailian/glm-5') {
      agentConfig.fallback_models = ['bailian/qwen3.5-plus', 'bailian/MiniMax-M2.5'];
    } else if (assignment.model === 'bailian/qwen3.5-plus') {
      agentConfig.fallback_models = ['bailian/glm-5', 'bailian/MiniMax-M2.5'];
    } else if (assignment.model === 'bailian/MiniMax-M2.5') {
      agentConfig.fallback_models = ['bailian/qwen3.5-plus', 'bailian/glm-5'];
    } else if (assignment.model === 'AstronCodingPlan/astron-code-latest') {
      agentConfig.fallback_models = ['bailian/glm-5', 'bailian/qwen3.5-plus'];
    }
    
    if (oldModel !== assignment.model) {
      console.log(`🔧 ${agentName}: ${oldModel} → ${assignment.model}`);
      console.log(`   └─ ${assignment.reason}`);
      updatedCount++;
    }
    
    modelStats[assignment.model] = (modelStats[assignment.model] || 0) + 1;
  }
}

// 保存配置
fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');

console.log(`\n✅ 模型分配完成！`);
console.log(`   - ${updatedCount} 个Agent已更新`);
console.log(`\n📊 新模型分布:`);
for (const [model, count] of Object.entries(modelStats).sort((a, b) => b[1] - a[1])) {
  const modelName = model.split('/')[1];
  console.log(`   - ${modelName}: ${count} 个Agent`);
}

console.log(`\n🎯 模型分配策略:`);
console.log(`   - glm-5 (战略型): 主帅、大都督、规划类`);
console.log(`   - qwen3.5-plus (代码型): 开发、审查、技术实现`);
console.log(`   - MiniMax-M2.5 (快速型): 探索、监控、快速响应`);
console.log(`   - AstronCodingPlan/astron-code-latest (文档型): 信息整理、文档生成`);
