#!/usr/bin/env node
/**
 * 迁移脚本: 将现有配置从完整模型ID转换为内部模型key
 * 
 * 使用方法:
 * node scripts/migrate-to-model-keys.cjs
 * 
 * 转换规则:
 * - bailian/glm-5 -> gmodel
 * - bailian/qwen3.5-plus -> q35model  
 * - AstronCodingPlan/astron-code-latest -> kmodel
 * - bailian/MiniMax-M2.5 -> mmodel
 */

const fs = require('fs');
const path = require('path');

// 模型映射表
const MODEL_TO_KEY = {
  'bailian/glm-5': 'gmodel',
  'bailian/qwen3.5-plus': 'q35model',
  'AstronCodingPlan/astron-code-latest': 'kmodel',
  'bailian/MiniMax-M2.5': 'mmodel'
};

const KEY_TO_MODEL = {
  'gmodel': 'bailian/glm-5',
  'q35model': 'bailian/qwen3.5-plus',
  'kmodel': 'AstronCodingPlan/astron-code-latest',
  'mmodel': 'bailian/MiniMax-M2.5'
};

// Fallback映射
const FALLBACK_MAPPING = {
  'gmodel': ['q35model', 'mmodel'],
  'q35model': ['gmodel', 'mmodel'],
  'kmodel': ['gmodel', 'q35model'],
  'mmodel': ['q35model', 'gmodel']
};

function convertModelToKey(fullModelId) {
  return MODEL_TO_KEY[fullModelId] || fullModelId;
}

function convertKeyToModel(key) {
  return KEY_TO_MODEL[key] || key;
}

function convertFallbackModels(fallbackModels) {
  if (!fallbackModels || !Array.isArray(fallbackModels)) {
    return undefined;
  }
  return fallbackModels.map(model => convertModelToKey(model));
}

function migrateConfig(config) {
  const migrated = JSON.parse(JSON.stringify(config)); // 深拷贝
  
  // 迁移agents
  if (migrated.agents) {
    for (const [agentName, agentConfig] of Object.entries(migrated.agents)) {
      if (agentConfig.model) {
        const oldModel = agentConfig.model;
        agentConfig.model = convertModelToKey(agentConfig.model);
        
        // 自动设置fallback_models
        if (FALLBACK_MAPPING[agentConfig.model]) {
          agentConfig.fallback_models = FALLBACK_MAPPING[agentConfig.model];
        }
        
        console.log(`🔄 ${agentName}: ${oldModel} -> ${agentConfig.model}`);
      }
    }
  }
  
  // 迁移categories
  if (migrated.categories) {
    for (const [catName, catConfig] of Object.entries(migrated.categories)) {
      if (catConfig.model) {
        const oldModel = catConfig.model;
        catConfig.model = convertModelToKey(catConfig.model);
        
        // 自动设置fallback_models
        if (FALLBACK_MAPPING[catConfig.model]) {
          catConfig.fallback_models = FALLBACK_MAPPING[catConfig.model];
        }
        
        console.log(`🔄 ${catName}: ${oldModel} -> ${catConfig.model}`);
      }
    }
  }
  
  return migrated;
}

function main() {
  const configPath = path.join(__dirname, '..', 'config', 'ultrawork-sanguo.json');
  const backupPath = path.join(__dirname, '..', 'config', 'ultrawork-sanguo.json.backup');
  
  console.log('🚀 开始迁移配置...\n');
  
  // 读取现有配置
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  
  // 创建备份
  fs.writeFileSync(backupPath, JSON.stringify(config, null, 2), 'utf-8');
  console.log(`✅ 已创建备份: ${backupPath}\n`);
  
  // 执行迁移
  const migrated = migrateConfig(config);
  
  // 保存新配置
  fs.writeFileSync(configPath, JSON.stringify(migrated, null, 2), 'utf-8');
  
  console.log('\n✅ 迁移完成!');
  console.log('\n📋 模型key对照表:');
  console.log('  gmodel -> bailian/glm-5 (GLM-5)');
  console.log('  q35model -> bailian/qwen3.5-plus (Qwen3.5-Plus)');
  console.log('  kmodel -> AstronCodingPlan/astron-code-latest (Astron Coding Plan)');
  console.log('  mmodel -> bailian/MiniMax-M2.5 (MiniMax-M2.5)');
  console.log('\n💡 提示:');
  console.log('  - 配置现在使用内部模型key');
  console.log('  - 实际模型解析由 model-resolver.ts 处理');
  console.log('  - 如需回滚，使用备份文件恢复');
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  convertModelToKey,
  convertKeyToModel,
  migrateConfig,
  MODEL_TO_KEY,
  KEY_TO_MODEL,
  FALLBACK_MAPPING
};
