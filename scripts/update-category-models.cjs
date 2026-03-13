#!/usr/bin/env node
/**
 * 根据类别特点更新categories模型配置
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'config', 'ultrawork-sanguo.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// 类别模型分配
const CATEGORY_MODELS = {
  'visual-engineering': { model: 'bailian/qwen3.5-plus', reason: '前端/UI需要代码能力' },
  'deep': { model: 'bailian/qwen3.5-plus', reason: '深度开发需要代码能力' },
  'quick': { model: 'bailian/MiniMax-M2.5', reason: '快速修复需要快速响应' },
  'ultrabrain': { model: 'bailian/glm-5', reason: '战略规划' },
  'review': { model: 'bailian/qwen3.5-plus', reason: '代码审查' },
  'explore': { model: 'bailian/MiniMax-M2.5', reason: '快速探索' },
  'writing': { model: 'AstronCodingPlan/astron-code-latest', reason: '文档生成、长文本' },
  'reserve': { model: 'bailian/glm-5', reason: '特殊任务需要战略思维' },
  'monitor': { model: 'bailian/glm-5', reason: '监控指挥需要统筹' },
  'test': { model: 'bailian/glm-5', reason: '测试策略规划' },
  'fileops': { model: 'bailian/qwen3.5-plus', reason: '系统管理' },
  'devops': { model: 'bailian/qwen3.5-plus', reason: 'DevOps配置' },
  'database': { model: 'bailian/qwen3.5-plus', reason: '数据库技术' },
  'security': { model: 'bailian/qwen3.5-plus', reason: '安全技术' },
  'performance': { model: 'bailian/glm-5', reason: '性能规划' },
  'mobile': { model: 'bailian/qwen3.5-plus', reason: '移动开发' },
  'api': { model: 'bailian/qwen3.5-plus', reason: 'API设计' },
  'ai': { model: 'bailian/glm-5', reason: 'AI战略' },
  'web3': { model: 'bailian/glm-5', reason: 'Web3战略' }
};

let updatedCount = 0;

for (const [catName, catConfig] of Object.entries(config.categories)) {
  const assignment = CATEGORY_MODELS[catName];
  
  if (assignment) {
    const oldModel = catConfig.model;
    catConfig.model = assignment.model;
    
    // 设置fallback
    if (assignment.model === 'bailian/glm-5') {
      catConfig.fallback_models = ['bailian/qwen3.5-plus', 'bailian/MiniMax-M2.5'];
    } else if (assignment.model === 'bailian/qwen3.5-plus') {
      catConfig.fallback_models = ['bailian/glm-5', 'bailian/MiniMax-M2.5'];
    } else if (assignment.model === 'bailian/MiniMax-M2.5') {
      catConfig.fallback_models = ['bailian/qwen3.5-plus', 'bailian/glm-5'];
    } else if (assignment.model === 'AstronCodingPlan/astron-code-latest') {
      catConfig.fallback_models = ['bailian/glm-5', 'bailian/qwen3.5-plus'];
    }
    
    if (oldModel !== assignment.model) {
      console.log(`🔧 ${catName}: ${oldModel} → ${assignment.model}`);
      console.log(`   └─ ${assignment.reason}`);
      updatedCount++;
    }
  }
}

fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');

console.log(`\n✅ 类别模型分配完成！`);
console.log(`   - ${updatedCount} 个类别已更新`);
