#!/usr/bin/env node
/**
 * UltraWork 环境检测与配置适配器
 * 自动检测运行环境并选择合适的配置
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// 支持的平台配置
const PLATFORMS = {
  qoder: {
    name: 'Qoder',
    detect: () => {
      // 检测 Qoder 环境
      try {
        const result = execSync('where qoder 2>nul || which qoder 2>/dev/null', { encoding: 'utf8' });
        if (result && result.trim()) return true;
      } catch (e) {}

      // 检测 Qoder 数据目录
      const qoderDataDir = path.join(os.homedir(), 'AppData', 'Roaming', 'Qoder');
      if (fs.existsSync(qoderDataDir)) return true;

      // 检测环境变量
      if (process.env.QODER_WORKSPACE || process.env.QODER_SESSION) return true;

      return false;
    },
    configPath: 'configs/qoder/config.qoder.json',
    modelsPath: 'configs/qoder/models.qoder.json'
  },
  bailian: {
    name: 'Aliyun Bailian Coding Plan',
    detect: () => {
      // 检测百炼环境变量或配置
      if (process.env.BAILIAN_API_KEY || process.env.ALIYUN_BAILIAN) return true;

      // 检测配置文件中的 provider
      try {
        const configPath = path.join(__dirname, '..', 'config.json');
        if (fs.existsSync(configPath)) {
          const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          if (config.provider === 'aliyun-bailian-coding-plan') return true;
        }
      } catch (e) {}

      return false;
    },
    configPath: 'config.json',
    modelsPath: 'models.json'
  },
  opencode: {
    name: 'OpenCode',
    detect: () => {
      // 检测 OpenCode 环境
      if (process.env.OPENCODE_SESSION || process.env.OPENCODE_WORKSPACE) return true;

      const opencodeDir = path.join(process.cwd(), '.opencode');
      if (fs.existsSync(opencodeDir)) return true;

      return false;
    },
    configPath: 'config.json',
    modelsPath: 'models.json'
  },
  claude_code: {
    name: 'Claude Code',
    detect: () => {
      // 检测 Claude Code 环境
      if (process.env.CLAUDE_CODE_SESSION) return true;
      if (process.env.ANTHROPIC_API_KEY) return true;

      return false;
    },
    configPath: 'configs/qoder/config.qoder.json',
    modelsPath: 'configs/qoder/models.qoder.json'
  },
  default: {
    name: 'Default',
    detect: () => true, // 总是返回 true 作为默认选项
    configPath: 'config.json',
    modelsPath: 'models.json'
  }
};

// 检测顺序（优先级从高到低）
const DETECTION_ORDER = ['qoder', 'bailian', 'claude_code', 'opencode', 'default'];

/**
 * 检测当前运行环境
 * @returns {Object} 检测结果
 */
function detectEnvironment() {
  const results = {
    platform: null,
    detected: [],
    environment: {
      os: os.type(),
      arch: os.arch(),
      nodeVersion: process.version,
      cwd: process.cwd(),
      envVars: {}
    }
  };

  // 收集相关环境变量
  const relevantEnvVars = [
    'QODER_WORKSPACE', 'QODER_SESSION',
    'BAILIAN_API_KEY', 'ALIYUN_BAILIAN',
    'OPENCODE_SESSION', 'OPENCODE_WORKSPACE',
    'CLAUDE_CODE_SESSION', 'ANTHROPIC_API_KEY'
  ];

  relevantEnvVars.forEach(key => {
    if (process.env[key]) {
      results.environment.envVars[key] = process.env[key];
    }
  });

  // 按优先级检测
  for (const platformKey of DETECTION_ORDER) {
    const platform = PLATFORMS[platformKey];
    if (platform.detect()) {
      results.detected.push({
        key: platformKey,
        name: platform.name,
        configPath: platform.configPath,
        modelsPath: platform.modelsPath
      });
    }
  }

  // 选择最高优先级的平台
  if (results.detected.length > 0) {
    results.platform = results.detected[0];
  }

  return results;
}

/**
 * 加载配置文件
 * @param {string} configPath 配置文件路径
 * @returns {Object|null} 配置对象
 */
function loadConfig(configPath) {
  const fullPath = path.join(__dirname, '..', configPath);
  try {
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error(`Failed to load config from ${fullPath}:`, e.message);
  }
  return null;
}

/**
 * 合并配置
 * @param {Object} base 基础配置
 * @param {Object} override 覆盖配置
 * @returns {Object} 合并后的配置
 */
function mergeConfigs(base, override) {
  if (!base) return override;
  if (!override) return base;

  const result = { ...base };

  for (const key of Object.keys(override)) {
    if (typeof override[key] === 'object' && !Array.isArray(override[key])) {
      result[key] = mergeConfigs(result[key], override[key]);
    } else {
      result[key] = override[key];
    }
  }

  return result;
}

/**
 * 获取适合当前环境的配置
 * @returns {Object} 配置对象
 */
function getConfig() {
  const detection = detectEnvironment();

  console.log('\n🔍 UltraWork 环境检测');
  console.log('═'.repeat(50));
  console.log(`操作系统: ${detection.environment.os} (${detection.environment.arch})`);
  console.log(`Node 版本: ${detection.environment.nodeVersion}`);
  console.log(`工作目录: ${detection.environment.cwd}`);

  if (Object.keys(detection.environment.envVars).length > 0) {
    console.log('\n检测到的环境变量:');
    Object.entries(detection.environment.envVars).forEach(([key, value]) => {
      const maskedValue = value.length > 10 ? value.substring(0, 6) + '...' + value.substring(value.length - 4) : '***';
      console.log(`  ${key}: ${maskedValue}`);
    });
  }

  console.log('\n检测到的平台:');
  detection.detected.forEach((p, i) => {
    const marker = i === 0 ? '✓ [已选择]' : '  ';
    console.log(`${marker} ${p.name}`);
  });

  if (detection.platform) {
    console.log(`\n📦 使用配置: ${detection.platform.name}`);
    console.log(`   配置文件: ${detection.platform.configPath}`);
    console.log(`   模型配置: ${detection.platform.modelsPath}`);
  }

  // 加载配置
  let config = null;
  let models = null;

  if (detection.platform) {
    config = loadConfig(detection.platform.configPath);
    models = loadConfig(detection.platform.modelsPath);
  }

  // 如果配置加载失败，尝试默认配置
  if (!config) {
    config = loadConfig('config.json');
  }
  if (!models) {
    models = loadConfig('models.json');
  }

  return {
    detection,
    config,
    models
  };
}

/**
 * 初始化配置 - 将检测到的配置复制到主配置文件
 * @param {boolean} force 是否强制覆盖
 */
function initializeConfig(force = false) {
  const { detection, config, models } = getConfig();

  if (!detection.platform) {
    console.log('\n⚠️ 未检测到已知平台，使用默认配置');
    return false;
  }

  const baseDir = path.join(__dirname, '..');

  // 备份现有配置
  const backupDir = path.join(baseDir, 'backup');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // 备份并写入 config.json
  const configPath = path.join(baseDir, 'config.json');
  if (fs.existsSync(configPath) && !force) {
    const backupPath = path.join(backupDir, `config.${timestamp}.json`);
    fs.copyFileSync(configPath, backupPath);
    console.log(`\n💾 已备份现有配置到: ${backupPath}`);
  }

  if (config) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`✅ 已更新配置文件: ${configPath}`);
  }

  // 备份并写入 models.json
  const modelsPath = path.join(baseDir, 'models.json');
  if (fs.existsSync(modelsPath) && !force) {
    const backupPath = path.join(backupDir, `models.${timestamp}.json`);
    fs.copyFileSync(modelsPath, backupPath);
    console.log(`💾 已备份现有模型配置到: ${backupPath}`);
  }

  if (models) {
    fs.writeFileSync(modelsPath, JSON.stringify(models, null, 2));
    console.log(`✅ 已更新模型配置: ${modelsPath}`);
  }

  console.log('\n🎉 UltraWork 配置初始化完成!');
  return true;
}

// CLI 接口
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'detect':
      const result = detectEnvironment();
      console.log(JSON.stringify(result, null, 2));
      break;

    case 'init':
      initializeConfig(args.includes('--force'));
      break;

    case 'config':
      const { config, models } = getConfig();
      console.log('\n📋 当前配置:');
      console.log(JSON.stringify({ config, models }, null, 2));
      break;

    default:
      console.log(`
UltraWork 环境检测与配置适配器

用法:
  node env-detector.js <command>

命令:
  detect    检测当前环境并输出结果
  init      初始化配置 (--force 强制覆盖)
  config    显示当前配置

示例:
  node env-detector.js detect
  node env-detector.js init --force
  node env-detector.js config
`);
  }
}

module.exports = {
  detectEnvironment,
  getConfig,
  initializeConfig,
  PLATFORMS
};
