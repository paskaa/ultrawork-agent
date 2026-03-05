---
name: ultrawork
description: UltraWork SanGuo Legion - Multi-agent orchestration system with auto platform detection. Triggers: /ultrawork, /ulw
---

# UltraWork - SanGuo Legion (自适应多平台版)

## 🔄 自动平台检测

UltraWork 会自动检测运行环境并加载对应配置：

| 平台 | 检测方式 | 配置目录 |
|------|----------|----------|
| 🟢 **Qoder** | `qoder` 命令或 `%APPDATA%\Qoder` | `configs/qoder/` |
| 🟣 **Claude Code** | `ANTHROPIC_API_KEY` 或 `CLAUDE_CODE_SESSION` | `configs/claude-code/` |
| 🟠 **百炼** | `BAILIAN_API_KEY` | `config.json` (根目录) |
| ⚪ **Default** | 默认配置 | `config.json` |

### 快速检测命令

```bash
# 查看当前检测到的平台
node scripts/auto-init.js

# 输出 JSON 格式
node scripts/auto-init.js json
```

---

## 当前平台配置

> 运行 `node scripts/auto-init.js` 查看当前平台的实际配置

### Qoder 平台 (🟢)

| Agent | 角色 | 模型 | Credit |
|-------|------|------|--------|
| 诸葛亮 | 主调度器 | Qwen3.5-Plus | 0.2x |
| 赵云 | 深度执行 | Qwen-Coder-Qoder-1.0 | 0.2x |
| 周瑜 | 战略规划 | GLM-5 | 0.5x |
| 司马懿 | 情报官 | Qwen3.5-Plus | 0.2x |
| 关羽 | 质量守护 | Qwen-Coder-Qoder-1.0 | 0.2x |
| 张飞 | 快速突击 | MiniMax-M2.5 | 0.2x |

**可用模型**: Qwen-Coder-Qoder-1.0, Qwen3.5-Plus, GLM-5, Kimi-K2.5, MiniMax-M2.5

### Claude Code 平台 (🟣)

| Agent | 角色 | 模型 |
|-------|------|------|
| 诸葛亮 | 主调度器 | claude-sonnet-4-20250514 |
| 赵云 | 深度执行 | claude-sonnet-4-20250514 |
| 周瑜 | 战略规划 | claude-opus-4-20250514 |
| 司马懿 | 情报官 | claude-sonnet-4-20250514 |
| 关羽 | 质量守护 | claude-sonnet-4-20250514 |
| 张飞 | 快速突击 | claude-sonnet-4-20250514 |

**可用模型**: claude-opus-4-20250514, claude-sonnet-4-20250514, claude-3-5-sonnet-20241022, claude-3-5-haiku-20241022

---

## 架构概览

```
                    ┌─────────────────┐
                    │   ZhugeLiang    │
                    │   (主帅/调度)    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   ZhouYu      │    │   ZhaoYun     │    │   SimaYi      │
│  (大都督)      │    │   (大将)      │    │   (谋士)      │
│  Strategy     │    │   Execute     │    │   Explore     │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                    │

        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   GuanYu      │    │   ZhangFei    │    │   Reserved    │
│  (大将)        │    │   (猛将)      │    │   (后备)      │
│  Quality      │    │   QuickFix    │    │               │
└───────────────┘    └───────────────┘    └───────────────┘
```

---

## 任务路由 (Task Routing)

| 类别 | 关键词 | 主将 | 说明 |
|------|--------|------|------|
| **visual-engineering** | UI,Vue,前端,组件 | ZhaoYun | 前端开发任务 |
| **deep** | 重构,架构,实现,开发 | ZhaoYun | 深度执行任务 |
| **quick** | 修复,bug,修改,fix | ZhangFei | 快速修复任务 |
| **ultrabrain** | 设计,方案,决策,架构 | ZhouYu | 战略规划任务 |
| **explore** | 搜索,查找,定位 | SimaYi | 探索侦察任务 |
| **review** | review,审查,质量 | GuanYu | 质量把控任务 |

---

## 使用方式

### 触发命令

```
/ultrawork <任务描述>
/ulw <任务描述>
ulw <任务描述>
```

### 示例

```
/ulw 实现用户登录模块
/ulw 修复登录按钮无响应的bug
/ulw 设计微服务架构方案
```

---

## 执行流程

```
┌─────────────────────────────────────────────────────────────┐
│                     1. 意图分析                              │
│  ZhugeLiang 分析用户意图，分解复杂任务                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     2. 任务分发                              │
│  根据任务类别，指派对应主将                                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     3. 并行执行                              │
│  主将统筹执行，支持并行处理子任务                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     4. 进度监控                              │
│  ZhugeLiang 监控进度，汇报状态                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 配置文件结构

```
ultrawork/
├── SKILL.md                      # 技能定义 (本文件)
├── config.json                   # 默认/百炼配置
├── models.json                   # 默认/百炼模型配置
├── configs/
│   ├── qoder/
│   │   ├── config.qoder.json     # Qoder 专用配置
│   │   └── models.qoder.json     # Qoder 模型配置
│   └── claude-code/
│       ├── config.claude-code.json  # Claude Code 专用配置
│       └── models.claude-code.json  # Claude Code 模型配置
├── agents/                       # Agent 定义文件
│   ├── zhugeliang.md
│   ├── zhaoyun.md
│   ├── zhouyu.md
│   ├── simayi.md
│   ├── guanyu.md
│   └── zhangfei.md
├── categories/                   # 任务类别定义
│   ├── deep.md
│   ├── quick.md
│   ├── visual-engineering.md
│   └── ultrabrain.md
└── scripts/
    ├── index.js                  # 主入口 (自动适配)
    ├── auto-init.js              # 自动初始化脚本
    └── env-detector.js           # 环境检测器
```

---

## 添加新平台

1. 在 `configs/` 下创建新平台目录
2. 创建 `config.<platform>.json` 和 `models.<platform>.json`
3. 在 `scripts/auto-init.js` 的 `PLATFORMS` 对象中添加检测逻辑

---

*鞠躬尽瘁，死而后已*

*将帅齐心，其利断金*
