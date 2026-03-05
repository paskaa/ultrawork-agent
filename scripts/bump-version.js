#!/usr/bin/env node
/**
 * 版本递增脚本
 * 自动递增 package.json 版本号并更新相关文件
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 获取参数
const args = process.argv.slice(2);
const releaseType = args[0] || 'patch'; // patch, minor, major

function parseVersion(version) {
  const parts = version.replace(/^v/, '').split('.');
  return {
    major: parseInt(parts[0] || 0, 10),
    minor: parseInt(parts[1] || 0, 10),
    patch: parseInt(parts[2] || 0, 10)
  };
}

function bumpVersion(version, type) {
  const v = parseVersion(version);
  switch (type) {
    case 'major':
      return `${v.major + 1}.0.0`;
    case 'minor':
      return `${v.major}.${v.minor + 1}.0`;
    case 'patch':
    default:
      return `${v.major}.${v.minor}.${v.patch + 1}`;
  }
}

function main() {
  // 查找 package.json
  let packagePath = path.join(process.cwd(), 'package.json');

  if (!fs.existsSync(packagePath)) {
    console.error('❌ 未找到 package.json');
    process.exit(1);
  }

  // 读取当前版本
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const currentVersion = pkg.version;
  const newVersion = bumpVersion(currentVersion, releaseType);

  console.log(`📦 版本递增: ${currentVersion} → ${newVersion} (${releaseType})`);

  // 更新 package.json
  pkg.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
  console.log('✅ 已更新 package.json');

  // 检查并更新其他可能包含版本的文件
  const filesToUpdate = [
    'SKILL.md',
    'config.json',
    'models.json'
  ];

  filesToUpdate.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(`"version": "${currentVersion}"`)) {
        content = content.replace(`"version": "${currentVersion}"`, `"version": "${newVersion}"`);
        fs.writeFileSync(filePath, content);
        console.log(`✅ 已更新 ${file}`);
      }
    }
  });

  // 输出新版本供外部使用
  console.log(`\n📝 新版本: ${newVersion}`);

  return newVersion;
}

main();
