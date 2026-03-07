#!/usr/bin/env node
/**
 * UltraWork 自动初始化脚本
 * 在技能加载时自动检测环境并应用配置
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function log(color, ...args) {
  console.log(colors[color] || '', ...args, colors.reset);
}

// 平台检测器
const PLATFORMS = {
  qoder: {
    name: 'Qoder',
    marker: '🟢',
    detect: () => {
      try {
        execSync('where qoder 2>nul', { encoding: 'utf8', stdio: 'pipe' });
        return true;
      } catch (e) {}
      const qoderDir = path.join(os.homedir(), 'AppData', 'Roaming', 'Qoder');
      return fs.existsSync(qoderDir);
    },
    getConfig: () => ({
      configPath: 'configs/qoder/config.qoder.json',
      modelsPath: 'configs/qoder/models.qoder.json',
      defaultModel: 'Qwen-Coder-Qoder-1.0',
      models: ['Qwen-Coder-Qoder-1.0', 'Qwen3.5-Plus', 'GLM-5', 'Kimi-K2.5', 'MiniMax-M2.5']
    })
  },
  claude_code: {
    name: 'Claude Code',
    marker: '🟣',
    detect: () => {
      return !!(process.env.CLAUDE_CODE_SESSION || process.env.ANTHROPIC_API_KEY);
    },
    getConfig: () => ({
      configPath: 'configs/claude-code/config.claude-code.json',
      modelsPath: 'configs/claude-code/models.claude-code.json',
      defaultModel: 'claude-sonnet-4-20250514',
      models: ['claude-sonnet-4-20250514', 'claude-opus-4-20250514', 'claude-3-5-sonnet-20241022']
    })
  },
  bailian: {
    name: '百炼 Coding Plan',
    marker: '🟠',
    detect: () => {
      return !!(process.env.BAILIAN_API_KEY || process.env.ALIYUN_BAILIAN);
    },
    getConfig: () => ({
      configPath: 'config.json',
      modelsPath: 'models.json',
      defaultModel: 'qwen3-coder-plus',
      models: ['qwen3-coder-plus', 'qwen3-coder-next', 'qwen3-max-2026-01-23', 'glm-5', 'kimi-k2.5']
    })
  },
  default: {
    name: 'Default',
    marker: '⚪',
    detect: () => true,
    getConfig: () => ({
      configPath: 'config.json',
      modelsPath: 'models.json',
      defaultModel: 'qwen3-coder-plus',
      models: []
    })
  }
};

const DETECTION_ORDER = ['qoder', 'claude_code', 'bailian', 'default'];

/**
 * 检测当前平台
 */
function detectPlatform() {
  for (const key of DETECTION_ORDER) {
    const platform = PLATFORMS[key];
    if (platform.detect()) {
      return { key, ...platform, ...platform.getConfig() };
    }
  }
  return { key: 'default', ...PLATFORMS.default, ...PLATFORMS.default.getConfig() };
}

/**
 * 加载 JSON 配置
 */
function loadJson(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
      return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    }
  } catch (e) {
    log('red', `  加载配置失败: ${e.message}`);
  }
  return null;
}

/**
 * 生成平台适配的配置摘要
 */
function generateConfigSummary(platform) {
  const config = loadJson(platform.configPath);
  const models = loadJson(platform.modelsPath);

  if (!config || !models) {
    return null;
  }

  return {
    platform: platform.name,
    marker: platform.marker,
    defaultModel: models.defaultModel,
    agents: Object.entries(config.agents || {}).slice(0, 6).map(([key, agent]) => ({
      name: agent.name,
      role: agent.role,
      model: agent.model
    })),
    categories: Object.keys(config.categories || {}),
    availableModels: Object.values(models.models || {}).map(m => m.modelId)
  };
}

/**
 * 输出初始化信息
 */
function printInitInfo(summary) {
  console.log('\n');
  log('cyan', '═'.repeat(60));
  log('cyan', '  UltraWork SanGuo Legion - 多智能体调度系统');
  log('cyan', '═'.repeat(60));
  console.log('');
  log('green', `  ${summary.marker} 检测到平台: ${summary.platform}`);
  log('blue', `  📦 默认模型: ${summary.defaultModel}`);
  console.log('');
  log('yellow', '  ┌─ 三国军团 ─────────────────────────────────────┐');

  summary.agents.forEach(agent => {
    const rolePad = agent.role.padEnd(8, ' ');
    const namePad = agent.name.padEnd(6, ' ');
    log('yellow', `  │  ${namePad} (${rolePad}) → ${agent.model}`);
  });

  log('yellow', '  └────────────────────────────────────────────────┘');
  console.log('');
  log('cyan', `  可用模型: ${summary.availableModels.join(', ')}`);
  console.log('');
  log('cyan', '═'.repeat(60));
  console.log('');
}

/**
 * 生成 SKILL.md 片段（供动态插入）
 */
function generateSkillSnippet(summary) {
  return `
<!--
UltraWork 自动适配配置
平台: ${summary.platform}
默认模型: ${summary.defaultModel}
更新时间: ${new Date().toISOString()}
-->

## 当前平台配置

| 属性 | 值 |
|------|-----|
| 平台 | ${summary.marker} ${summary.platform} |
| 默认模型 | ${summary.defaultModel} |

### Agent 模型分配

| Agent | 角色 | 模型 |
|-------|------|------|
${summary.agents.map(a => `| ${a.name} | ${a.role} | ${a.model} |`).join('\n')}

### 可用模型

${Object.keys(summary.availableModels).map(m => `- ${m}`).join('\n')}
`;
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const platform = detectPlatform();
  const summary = generateConfigSummary(platform);

  if (!summary) {
    log('red', '❌ 配置加载失败');
    process.exit(1);
  }

  switch (command) {
    case 'detect':
      console.log(JSON.stringify({ platform: platform.key, ...summary }, null, 2));
      break;

    case 'snippet':
      console.log(generateSkillSnippet(summary));
      break;

    case 'init':
      printInitInfo(summary);
      break;

    case 'json':
      // 输出供外部调用的 JSON
      console.log(JSON.stringify({
        platform: platform.key,
        configPath: platform.configPath,
        modelsPath: platform.modelsPath,
        defaultModel: summary.defaultModel
      }));
      break;

    default:
      printInitInfo(summary);
  }
}

main();
