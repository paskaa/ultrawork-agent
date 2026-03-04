---
name: ultrawork
description: |
  UltraWork 三国军团调度系统 - 运筹帷幄，决胜千里。

  触发方式:
  - 执行 /ultrawork 或 /ulw 命令
  - 以 "ultrawork" 开头的请求
  - 包含 "ulw " 的请求
version: "1.1.0"
---

# UltraWork - 三国军团调度系统

> 运筹帷幄之中，决胜千里之外。

一键触发，三国名将齐聚。任务完成前绝不收兵。

## 快速使用

### 命令触发
```
/ultrawork 实现用户登录功能
/ulw 修复登录页面的样式问题
```

### 关键词触发
```
ultrawork 重构订单模块
ulw 添加导出功能
```

## 五虎上将 + 军师团

| 将领 | 字 | 职责 | 擅长 |
|------|-----|------|------|
| **诸葛亮** | 孔明 | 主调度器 | 运筹帷幄、调兵遣将 |
| **赵云** | 子龙 | 深度执行 | 攻坚克难、独立作战 |
| **周瑜** | 公瑾 | 战略规划 | 架构设计、访谈分析 |
| **司马懿** | 仲达 | 情报收集 | 代码探索、模式发现 |
| **关羽** | 云长 | 质量守护 | Code Review、质量把关 |
| **张飞** | 翼德 | 快速突击 | Bug修复、应急处理 |

## 作战流程

```
军令(用户请求)
    ↓
┌─────────────────┐
│   诸葛亮·孔明   │  ← 观星推演，意图分析
│   意图门        │
└────────┬────────┘
         ↓
┌─────────────────┐
│   诸葛亮·孔明   │  ← 兵法分类，选将出征
│   调兵遣将      │
└────────┬────────┘
         ↓
    ┌────┴────┬────────┬────────┬────────┐
    ↓         ↓        ↓        ↓        ↓
┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│ 赵云  │ │ 周瑜  │ │司马懿  │ │ 关羽  │ │ 张飞  │
│ 子龙  │ │ 公瑾  │ │ 仲达  │ │ 云长  │ │ 翼德  │
│攻坚克难│ │运筹帷幄│ │洞察敌情│ │质量把关│ │速战速决│
└───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘
    └────┬────┴────────┴────────┴────────┘
         ↓
┌─────────────────┐
│   连环计        │  ← 循环执行直到大捷
│   Ralph Loop    │
└────────┬────────┘
         ↓
     凯旋回朝
```

## 兵法分类

| 类别 | 兵法 | 关键词 | 选将 | 模型 |
|------|------|--------|------|------|
| `visual-engineering` | 攻城拔寨 | UI, 界面, Vue, 前端 | 子龙+仲达 | qwen3-coder-plus |
| `deep` | 深入敌阵 | 重构, 架构, 实现, 功能 | 子龙+仲达 | qwen3-coder-next |
| `quick` | 速战速决 | 修复, bug, 改, 错误 | 翼德 | glm-5 |
| `ultrabrain` | 运筹帷幄 | 设计, 方案, 决策, 规划 | 公瑾 | qwen3-max |
| `review` | 质量把关 | review, 审查, 质量, 优化 | 云长 | glm-5 |

## 模型路由

根据兵法自动选择最优模型：

| 兵法 | 首选模型 | 备选模型 |
|------|----------|----------|
| 攻城拔寨 | qwen3-coder-plus | glm-5 |
| 深入敌阵 | qwen3-coder-next | glm-5 |
| 速战速决 | glm-5 | glm-5 |
| 运筹帷幄 | qwen3-max-2026-01-23 | glm-5 |
| 质量把关 | glm-5 | glm-5 |

## 连环计 (Ralph Loop)

战果未达预期时自动循环执行：

1. 分析当前战况
2. 识别未完成任务
3. 调遣将领执行
4. 计算完成度
5. 未达 100% 则继续

最大迭代：10 次

## 兼容性

| 平台 | 状态 | 说明 |
|------|------|------|
| Claude Code | ✅ | 原生支持 |
| QwenCode | ✅ | 完全兼容 |
| Qoder | ✅ | 完全兼容 |
| Cursor | ✅ | 完全兼容 |
| GitHub Copilot | ✅ | 完全兼容 |
| Cline | ✅ | 完全兼容 |
| OpenCode | ✅ | 完全兼容 |

## 安装方式

### 方式一：npm 安装
```bash
npm install -g ultrawork-agent
```

### 方式二：GitHub 克隆
```bash
# Claude Code
git clone https://github.com/paskaa/ultrawork-agent.git ~/.claude/skills/ultrawork

# QwenCode / Qoder
git clone https://github.com/paskaa/ultrawork-agent.git ~/.qencode/skills/ultrawork

# OpenCode
git clone https://github.com/paskaa/ultrawork-agent.git ~/.opencode/skills/ultrawork

# Cline
git clone https://github.com/paskaa/ultrawork-agent.git ~/.cline/skills/ultrawork
```

### 方式三：项目级安装
将 `skills/ultrawork` 目录复制到项目的 `.claude/skills/` 或对应平台的 skills 目录。

## 作战示例

### 示例 1：攻城拔寨
```
军令: /ulw 实现用户管理页面

诸葛亮分析:
- 兵法: 攻城拔寨 (visual-engineering)
- 选将: 赵云(实现) + 司马懿(探查)
- 模型: qwen3-coder-plus

战果: 完整的用户管理 CRUD 页面
```

### 示例 2：速战速决
```
军令: ulw 修复登录失败的问题

诸葛亮分析:
- 兵法: 速战速决 (quick)
- 选将: 张飞(快速修复)
- 模型: glm-5

战果: 定位并修复认证逻辑错误
```

### 示例 3：运筹帷幄
```
军令: /ultrawork 设计支付系统架构

诸葛亮分析:
- 兵法: 运筹帷幄 (ultrabrain)
- 选将: 周瑜(战略规划)
- 模型: qwen3-max

战果: 完整的支付系统设计方案
```

## 配置文件

- `config.json` - 军团配置
- `models.json` - 模型映射
- `agents/*.md` - 将领提示词
- `categories/*.md` - 兵法定义

## 自定义配置

可修改 `config.json` 调整：

- **将领分配** - 为不同任务指定首选将领
- **模型选择** - 配置各任务类别的模型
- **触发词** - 添加自定义触发命令
- **并行度** - 调整最大并行数量

---

*UltraWork - 鞠躬尽瘁，死而后已*