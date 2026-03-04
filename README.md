# UltraWork - 三国军团调度系统

> 运筹帷幄之中，决胜千里之外。

[![npm version](https://img.shields.io/npm/v/ultrawork-agent.svg)](https://www.npmjs.com/package/ultrawork-agent)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**UltraWork** 是一个具有中国文化特色的多智能体调度系统。以三国名将作为 Agent 角色，自动分析任务意图，分配合适的将领执行，并持续执行直到任务完成。

## 特性

- 🏰 **三国军团** - 诸葛亮调度赵云、周瑜、司马懿、关羽、张飞六位名将
- 🎯 **意图门** - 执行前分析真实意图，消除歧义
- 🔀 **兵法分类** - 自动识别任务类别，选择最优模型和将领
- 🔁 **连环计** - 任务未完成时自动循环执行
- 📊 **实时监控** - 终端右侧实时显示进度和执行日志
- 📦 **多平台支持** - Claude Code、QwenCode、Qoder、Cursor、Cline

## 安装

```bash
# npm 全局安装
npm install -g ultrawork-agent

# 或使用 yarn
yarn global add ultrawork-agent
```

## 快速开始

### CLI 命令

```bash
# 执行任务
ultrawork 实现用户登录功能

# 简写
ulw 实现用户登录功能

# 循环执行模式
ultrawork --loop 重构订单模块
```

### 作为 Claude Code Skill 使用

```bash
# 克隆到 Claude Code skills 目录
git clone https://github.com/paskaa/ultrawork-agent.git ~/.claude/skills/ultrawork

# 然后可以使用
/ulw 实现用户管理页面
/ultrawork 设计支付系统架构
```

## 五虎上将 + 军师团

| 将领 | 字 | 职责 | 擅长领域 |
|------|-----|------|----------|
| **诸葛亮** | 孔明 | 主调度器 | 运筹帷幄、调兵遣将 |
| **赵云** | 子龙 | 深度执行 | 攻坚克难、独立作战 |
| **周瑜** | 公瑾 | 战略规划 | 架构设计、访谈分析 |
| **司马懿** | 仲达 | 情报收集 | 代码探索、模式发现 |
| **关羽** | 云长 | 质量守护 | Code Review、质量把关 |
| **张飞** | 翼德 | 快速突击 | Bug修复、应急处理 |

## 兵法分类

| 兵法 | 描述 | 关键词 | 选将 | 模型 |
|------|------|--------|------|------|
| 攻城拔寨 | 前端、UI/UX | UI, 界面, Vue, 前端 | 子龙+仲达 | qwen3-coder-plus |
| 深入敌阵 | 深度开发 | 重构, 架构, 实现, 功能 | 子龙+仲达 | qwen3-coder-next |
| 速战速决 | 快速修复 | 修复, bug, 改, 错误 | 翼德 | glm-5 |
| 运筹帷幄 | 架构决策 | 设计, 方案, 决策, 规划 | 公瑾 | qwen3-max |
| 质量把关 | 代码审查 | review, 审查, 质量 | 云长 | glm-5 |

## 作战流程

```
军令(用户请求)
    ↓
┌─────────────────┐
│   诸葛亮·孔明   │  ← 观星推演，意图分析
└────────┬────────┘
         ↓
┌─────────────────┐
│   诸葛亮·孔明   │  ← 兵法分类，选将出征
└────────┬────────┘
         ↓
    ┌────┴────┬────────┬────────┬────────┐
    ↓         ↓        ↓        ↓        ↓
┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│ 赵云  │ │ 周瑜  │ │司马懿  │ │ 关羽  │ │ 张飞  │
│ 子龙  │ │ 公瑾  │ │ 仲达  │ │ 云长  │ │ 翼德  │
└───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘
    └────┬────┴────────┴────────┴────────┘
         ↓
┌─────────────────┐
│   连环计        │  ← 循环执行直到大捷
└────────┬────────┘
         ↓
     凯旋回朝
```

## 实时进度监控

执行任务时，终端右侧会显示实时进度面板：

```
┌──────────────────────────────────────┐
│ 🏰 UltraWork 三国军团                 │
├──────────────────────────────────────┤
│ 军令: 实现用户登录功能                 │
├──────────────────────────────────────┤
│ 总进度 ████████████████░░░░ 75%       │
├──────────────────────────────────────┤
│ 🎖️  将领状态                          │
│                                       │
│ ✅ 诸葛亮(孔明) ████████████████       │
│    意图分析完成                        │
│ 🔄 赵云(子龙) ████████░░░░            │
│    攻城拔寨 - 前端实现                 │
│ ⏸️ 司马懿(仲达) ░░░░░░░░░░░░          │
│    待命中...                          │
├──────────────────────────────────────┤
│ 📜 执行日志                           │
│ 12:30:15 📋 实现用户登录功能           │
│ 12:30:16 ⚔️  赵云出征: 前端实现        │
│ 12:30:18 ✅ 诸葛亮 凯旋                │
└──────────────────────────────────────┘
```

## 多平台兼容

| 平台 | 安装路径 | 状态 |
|------|----------|------|
| Claude Code | `~/.claude/skills/ultrawork` | ✅ |
| QwenCode | `~/.qencode/skills/ultrawork` | ✅ |
| Qoder | `~/.qoder/skills/ultrawork` | ✅ |
| Cursor | `~/.cursor/skills/ultrawork` | ✅ |
| Cline | `~/.cline/skills/ultrawork` | ✅ |
| OpenCode | `~/.opencode/skills/ultrawork` | ✅ |

## 示例

### 攻城拔寨 (前端开发)
```bash
$ ulw 实现用户管理页面

🏰 [诸葛亮] 收到军令: 实现用户管理页面
📊 [诸葛亮] 兵法分析: visual-engineering (攻城拔寨)
🎯 [诸葛亮] 选将出征，模型: qwen3-coder-plus
⚔️  [诸葛亮] 调兵遣将: 赵云, 司马懿

⚔️  [赵云] 攻城拔寨 - 前端实现
   字: 子龙
   职责: 深度执行者
   ✅ 完成

⚔️  [司马懿] 探查现有组件和模式
   字: 仲达
   职责: 情报官
   ✅ 完成

🎉 战果汇总: 2 位将领出征，2 位凯旋
```

### 速战速决 (Bug修复)
```bash
$ ulw 修复登录失败的问题

🏰 [诸葛亮] 收到军令: 修复登录失败的问题
📊 [诸葛亮] 兵法分析: quick (速战速决)
🎯 [诸葛亮] 选将出征，模型: glm-5
⚔️  [诸葛亮] 调兵遣将: 张飞

⚔️  [张飞] 速战速决 - 快速修复
   字: 翼德
   职责: 快速突击者
   ✅ 完成

🎉 战果汇总: 1 位将领出征，1 位凯旋
```

## 配置

编辑 `config.json` 自定义：

```json
{
  "agents": {
    "zhaoyun": {
      "name": "赵云",
      "alias": "子龙",
      "role": "深度执行者",
      "model": "glm-5"
    }
  },
  "categories": {
    "visual-engineering": {
      "name": "攻城拔寨",
      "primaryModel": "qwen3-coder-plus",
      "primaryAgent": "zhaoyun"
    }
  }
}
```

## API

```javascript
const UltraWork = require('ultrawork-agent');

// 执行任务
const result = await UltraWork.execute('实现用户登录功能');

// 分析意图
const intent = UltraWork.analyzeIntent('设计支付系统架构');

// 检查触发
if (UltraWork.shouldTrigger(input)) {
  const parsed = UltraWork.parseTrigger(input);
}
```

## 开发

```bash
# 克隆仓库
git clone https://github.com/paskaa/ultrawork-agent.git
cd ultrawork-agent

# 本地链接
npm link

# 测试
ulw 测试任务
```

## 目录结构

```
ultrawork-agent/
├── agents/           # 将领定义
│   ├── zhugeliang.md # 诸葛亮 - 主调度器
│   ├── zhaoyun.md    # 赵云 - 深度执行
│   ├── zhouyu.md     # 周瑜 - 战略规划
│   ├── simayi.md     # 司马懿 - 情报收集
│   ├── guanyu.md     # 关羽 - 质量守护
│   └── zhangfei.md   # 张飞 - 快速突击
├── categories/       # 兵法定义
├── scripts/          # 核心脚本
│   ├── dispatcher.js # 调度器
│   ├── terminal-ui.js# 终端进度UI
│   └── ...
├── config.json       # 配置文件
├── models.json       # 模型配置
├── SKILL.md          # Skill 定义
└── README.md         # 使用手册
```

## License

MIT License - 详见 [LICENSE](LICENSE) 文件

---

*鞠躬尽瘁，死而后已。*