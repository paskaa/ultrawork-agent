#!/usr/bin/env node

/**
 * UltraWork 三国军团 - 配置初始化命令
 * 
 * 使用方式：
 *   ultrawork-init              # 使用标准预设
 *   ultrawork-init minimal      # 使用精简预设
 *   ultrawork-init complete     # 使用完整预设
 */

const fs = require('fs');
const path = require('path');

const USER_CONFIG_DIR = path.join(process.env.USERPROFILE || process.env.HOME, '.opencode');
const SANGUO_CONFIG_FILE = path.join(USER_CONFIG_DIR, 'ultrawork-sanguo.json');
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates', 'presets');

function log(message, color = '') {
  const colors = {
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[color] || ''}${message}${colors.reset}`);
}

function initConfig(preset = 'standard') {
  const templateFile = path.join(TEMPLATES_DIR, `${preset}.json`);
  
  if (!fs.existsSync(templateFile)) {
    log(`✗ 预设不存在：${preset}`, 'red');
    log('可用预设：minimal, standard, complete', 'yellow');
    process.exit(1);
  }
  
  // 备份现有配置
  if (fs.existsSync(SANGUO_CONFIG_FILE)) {
    const backupFile = `${SANGUO_CONFIG_FILE}.bak.${Date.now()}`;
    fs.copyFileSync(SANGUO_CONFIG_FILE, backupFile);
    log(`✓ 备份原配置：${backupFile}`, 'blue');
  }
  
  // 复制模板
  fs.mkdirSync(USER_CONFIG_DIR, { recursive: true });
  fs.copyFileSync(templateFile, SANGUO_CONFIG_FILE);
  log(`✓ 创建配置：${SANGUO_CONFIG_FILE}`, 'green');
  log(`  使用预设：${preset}`, 'blue');
  
  log('\n🎉 配置完成！使用 /ulw 开始任务', 'green');
}

const preset = process.argv[2] || 'standard';
initConfig(preset);
