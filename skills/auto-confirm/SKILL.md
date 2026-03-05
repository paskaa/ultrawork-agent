---
name: auto-confirm
description: 自动确认偏好 - 执行操作时直接进行，不询问"需要吗？"等是非题
---

# Auto Confirm 偏好设置

## 核心规则

**不要询问确认性问题，直接执行操作。**

## 版本管理规则

**每次 git 提交和 npm 发布都必须自动递增小版本号。**

### 版本递增规则

| 操作类型 | 版本变化 | 示例 |
|----------|----------|------|
| 功能新增 | patch +1 | 1.2.0 → 1.2.1 |
| Bug 修复 | patch +1 | 1.2.1 → 1.2.2 |
| 配置更新 | patch +1 | 1.2.2 → 1.2.3 |
| 重构代码 | patch +1 | 1.2.3 → 1.2.4 |

### 提交流程

```bash
# 标准流程
1. 更新 package.json 版本号 (patch +1)
2. git add 所有更改
3. git commit -m "..."
4. git push origin main

# 示例
当前版本: 1.2.0
提交后版本: 1.2.1
commit message: "feat: xxx (v1.2.1)"
```

### 自动版本脚本

```bash
# 使用 npm version patch 自动递增
npm version patch --no-git-tag-version
# 或使用自定义脚本
node scripts/bump-version.js
```

## 适用场景

- Git 提交后推送
- 代码修改后的测试
- 文件创建/删除
- 配置更新
- 任何需要确认的操作

### 行为模式

```
❌ 错误: "本地已领先 1 个 commit，需要推送吗？"
✅ 正确: 直接执行 `git push`

❌ 错误: "需要我提交吗？"
✅ 正确: bump version → git add → git commit → git push

❌ 错误: commit message 不带版本号
✅ 正确: "feat: 多平台自动适配 (v1.2.1)"
```

### 例外情况

仅在以下情况才询问：
1. 操作不可逆且可能造成重大损失（如删除整个项目）
2. 存在多个明显不同的选择需要用户决策
3. 信息不足无法继续执行

## 优先级

此偏好适用于所有任务，除非用户明确要求确认。
