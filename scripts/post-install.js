#!/usr/bin/env node

/**
 * UltraWork 三国军团 - 安装后配置脚本
 * 
 * 功能：
 * 1. 检测用户配置目录
 * 2. 如果配置不存在，自动创建默认配置
 * 3. 提供配置升级/迁移功能
 */

const fs = require('fs');
const path = require('path');

// 配置路径
const USER_CONFIG_DIR = path.join(process.env.USERPROFILE || process.env.HOME, '.opencode');
const USER_CONFIG_FILE = path.join(USER_CONFIG_DIR, 'opencode.json');
const SANGUO_CONFIG_FILE = path.join(USER_CONFIG_DIR, 'ultrawork-sanguo.json');

// 模板路径
const PLUGIN_DIR = path.join(__dirname, '..');
const TEMPLATES_DIR = path.join(PLUGIN_DIR, 'templates', 'presets');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * 检查目录是否存在，不存在则创建
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    log(`✓ 创建目录：${dirPath}`, 'blue');
    return true;
  }
  return false;
}

/**
 * 检查文件是否存在
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * 读取 JSON 文件
 */
function readJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    log(`✗ 读取 JSON 失败：${error.message}`, 'red');
    return null;
  }
}

/**
 * 写入 JSON 文件
 */
function writeJson(filePath, data, indent = 2) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, indent), 'utf-8');
    log(`✓ 写入文件：${filePath}`, 'green');
    return true;
  } catch (error) {
    log(`✗ 写入文件失败：${error.message}`, 'red');
    return false;
  }
}

/**
 * 获取默认配置模板
 */
function get_defaultConfig(preset = 'standard') {
  const presetFile = path.join(TEMPLATES_DIR, `${preset}.json`);
  if (fileExists(presetFile)) {
    return readJson(presetFile);
  }
  
  // 如果模板文件不存在，返回内置默认配置
  return {
    plugins: ['ultrawork-sanguo'],
    commands: {
      ulw: { description: 'UltraWork 调度任务' },
      uls: { description: '查看三国军团状态' }
    },
    agents: {}
  };
}

/**
 * 创建用户级 opencode.json 配置
 */
function createUserConfig() {
  log('\n📋 检查用户配置...', 'cyan');
  
  if (fileExists(USER_CONFIG_FILE)) {
    log(`✓ 用户配置已存在：${USER_CONFIG_FILE}`, 'yellow');
    
    // 检查是否已配置插件
    const config = readJson(USER_CONFIG_FILE);
    if (config && config.plugins) {
      if (config.plugins.includes('ultrawork-sanguo')) {
        log('✓ ultrawork-sanguo 插件已配置', 'green');
        return true;
      } else {
        log('⚡ 添加 ultrawork-sanguo 到插件列表...', 'yellow');
        config.plugins.push('ultrawork-sanguo');
        writeJson(USER_CONFIG_FILE, config);
        return true;
      }
    }
  } else {
    log('创建新用户配置...', 'blue');
    ensureDir(USER_CONFIG_DIR);
    
    const defaultConfig = get_defaultConfig('standard');
    const newConfig = {
      plugins: ['ultrawork-sanguo'],
      commands: defaultConfig.commands,
      _comment: 'UltraWork 三国军团配置 - 由安装脚本自动生成'
    };
    
    return writeJson(USER_CONFIG_FILE, newConfig);
  }
  return true;
}

/**
 * 创建 ultrawork-sanguo.json 配置
 */
function createSanguoConfig(preset = 'standard') {
  log('\n📋 检查三国军团配置...', 'cyan');
  
  if (fileExists(SANGUO_CONFIG_FILE)) {
    log(`✓ 三国军团配置已存在：${SANGUO_CONFIG_FILE}`, 'yellow');
    return checkConfigUpgrade(SANGUO_CONFIG_FILE, preset);
  }
  
  log('创建三国军团配置...', 'blue');
  ensureDir(USER_CONFIG_DIR);
  
  const defaultConfig = get_defaultConfig(preset);
  return writeJson(SANGUO_CONFIG_FILE, defaultConfig);
}

/**
 * 检查配置是否需要升级
 */
function checkConfigUpgrade(configFile, preset) {
  const existingConfig = readJson(configFile);
  const templateConfig = get_defaultConfig(preset);
  
  if (!existingConfig || !templateConfig) {
    return false;
  }
  
  const existingVersion = existingConfig._version || '1.0.0';
  const templateVersion = templateConfig._version || '1.0.0';
  
  if (existingVersion !== templateVersion) {
    log(`\n⚡ 检测到新版本配置 (当前：${existingVersion}, 最新：${templateVersion})`, 'yellow');
    log('是否升级配置？(y/n): ', 'cyan');
    
    // 简单处理：自动创建备份并升级
    const backupFile = `${configFile}.bak.${Date.now()}`;
    fs.copyFileSync(configFile, backupFile);
    log(`✓ 备份原配置：${backupFile}`, 'blue');
    
    // 合并配置（保留用户自定义部分）
    const mergedConfig = mergeConfig(existingConfig, templateConfig);
    mergedConfig._version = templateVersion;
    mergedConfig._upgradedAt = new Date().toISOString();
    
    return writeJson(configFile, mergedConfig);
  }
  
  log('✓ 配置已是最新版本', 'green');
  return true;
}

/**
 * 合并配置（保留用户自定义部分）
 */
function mergeConfig(existing, template) {
  const merged = { ...template };
  
  // 保留用户的 agents 配置
  if (existing.agents && template.agents) {
    merged.agents = { ...template.agents };
    for (const [key, value] of Object.entries(existing.agents)) {
      if (merged.agents.hasOwnProperty(key)) {
        merged.agents[key] = { ...merged.agents[key], ...value };
      } else {
        merged.agents[key] = value;
      }
    }
  } else if (existing.agents) {
    merged.agents = existing.agents;
  }
  
  // 保留用户的 commands 配置
  if (existing.commands) {
    merged.commands = { ...merged.commands, ...existing.commands };
  }
  
  return merged;
}

/**
 * 显示使用说明
 */
function showUsage() {
  log('\n' + '='.repeat(60), 'cyan');
  log('🎉 UltraWork 三国军团配置完成！', 'green');
  log('='.repeat(60), 'cyan');
  
  log('\n📖 使用说明:', 'yellow');
  log('  /ulw <任务描述>  - 调度三国军团执行任务');
  log('  /uls             - 查看军团状态');
  log('  /ulw-loop <任务>  - 循环模式，任务完成前持续执行');
  
  log('\n📁 配置文件位置:', 'yellow');
  log(`  主配置：${USER_CONFIG_FILE}`);
  log(`  三国配置：${SANGUO_CONFIG_FILE}`);
  
  log('\n⚙️  预设配置:', 'yellow');
  log('  minimal   - 精简版 (3 位核心将领)');
  log('  standard  - 标准版 (9 位核心将领)');
  log('  complete  - 完整版 (19 位全部将领)');
  
  log('\n🔄 切换预设:', 'yellow');
  log('  ultrawork-init <preset>  - 切换到指定预设');
  
  log('\n📚 更多帮助:', 'yellow');
  log('  查看 templates/MODEL_KEY_GUIDE.md 获取模型 Key 配置指引');
  log('  查看 templates/presets/*.json 查看配置模板');
  
  log('\n' + '='.repeat(60), 'cyan');
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  log('\n🚀 UltraWork 三国军团 - 配置工具', 'cyan');
  log('版本：1.4.1', 'blue');
  
  switch (command) {
    case 'init':
      const preset = args[1] || 'standard';
      log(`\n使用预设：${preset}`, 'blue');
      createUserConfig();
      createSanguoConfig(preset);
      break;
      
    case 'upgrade':
      log('\n检查配置升级...', 'blue');
      checkConfigUpgrade(SANGUO_CONFIG_FILE, 'standard');
      break;
      
    case 'migrate':
      const fromPreset = args[1] || 'minimal';
      const toPreset = args[2] || 'standard';
      log(`\n迁移配置：${fromPreset} -> ${toPreset}`, 'blue');
      createSanguoConfig(toPreset);
      break;
      
    case 'reset':
      log('\n⚠️  重置配置将覆盖现有配置！', 'yellow');
      const preset2 = args[1] || 'standard';
      if (fileExists(SANGUO_CONFIG_FILE)) {
        const backupFile = `${SANGUO_CONFIG_FILE}.bak.${Date.now()}`;
        fs.copyFileSync(SANGUO_CONFIG_FILE, backupFile);
        log(`✓ 备份原配置：${backupFile}`, 'blue');
      }
      createSanguoConfig(preset2);
      break;
      
    default:
      // 默认执行初始化
      createUserConfig();
      createSanguoConfig('standard');
      break;
  }
  
  showUsage();
}

// 运行主函数
main();
