# UltraWork - SanGuo Legion

> 鞠躬尽瘁，死而后已
> 将帅齐心，其利断金

A hierarchical multi-agent orchestration system with **Three-Level Parallel Dispatch** architecture. **22 agents** with specialized roles, supporting multiple platforms (OpenCode, Claude Code, Qoder, Bailian).

[![npm version](https://badge.fury.io/js/ultrawork-sanguo.svg)](https://badge.fury.io/js/ultrawork-sanguo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 What's New in v1.6.0

### Three-Level Parallel Dispatch Architecture

```
Level 1: ZhugeLiang (Commander) → Parallel dispatch to commanders
Level 2: Commanders (6) → Parallel dispatch to lieutenants  
Level 3: Lieutenants (14) → Execute tasks in parallel
```

### Key Features

- ✅ **Parallel Dispatch**: Same message dispatches multiple agents simultaneously
- ✅ **Permission System**: Hierarchical permission control for agent orchestration
- ✅ **Multi-Model Support**: glm-5, qwen3.5-plus, MiniMax-M2.5
- ✅ **Multi-Platform**: OpenCode, Claude Code, Qoder, Bailian
- ✅ **Skills Integration**: obra/superpowers, anthropics/skills, everything-claude-code

## 📦 Installation

```bash
npm install ultrawork-sanguo
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    UltraWork SanGuo Legion v1.6.0                        │
│                        22 Agents - 3 Levels                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Level 1: Commander (1)                                                 │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  🎖️ ZhugeLiang (诸葛亮) - Commander/Dispatcher                     │ │
│  │     Permission: task.* → Can dispatch ALL agents                  │ │
│  │     Model: glm-5                                                   │ │
│  │     Skills: dispatching-parallel-agents, subagent-driven-dev      │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                              ↓ Parallel Dispatch                         │
│  Level 2: Commanders (6)                                                │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐            │
│  │ ZhouYu      │ ZhaoYun     │ SimaYi      │ GuanYu      │            │
│  │ (周瑜)      │ (赵云)      │ (司马懿)    │ (关羽)      │            │
│  │ Strategy    │ Execute     │ Explore     │ Quality     │            │
│  │ glm-5       │ qwen3.5+    │ minimax     │ qwen3.5+    │            │
│  ├─────────────┼─────────────┼─────────────┼─────────────┤            │
│  │ ZhangFei    │ XuShu       │ MaChao      │             │            │
│  │ (张飞)      │ (徐庶)      │ (马超)      │             │            │
│  │ Quick Fix   │ Test        │ Reserve     │             │            │
│  │ minimax     │ qwen3.5+    │ glm-5       │             │            │
│  └─────────────┴─────────────┴─────────────┴─────────────┘            │
│                              ↓ Parallel Dispatch                         │
│  Level 3: Lieutenants (14)                                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ZhouYu:  LuSu (Resource) + HuangGai (Execution)                  │   │
│  │ ZhaoYun: GaoShun (Frontend) + ChenDao (Backend)                  │   │
│  │ SimaYi:  SimaShi (Analysis) + SimaZhao (Documentation)           │   │
│  │ GuanYu:  GuanPing (Review) + ZhouCang (Security)                 │   │
│  │ ZhangFei: LeiXu (Locate) + WuLan (Fix)                           │   │
│  │ XuShu:   PangLin (Frontend Test) + YanYan (Backend Test)         │   │
│  │ MaChao:  MaDai (Support) + PangDe (Special Ops)                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 🎯 Task Routing

| Category | Keywords | Commander | Lieutenants |
|----------|----------|-----------|-------------|
| visual-engineering | UI, Vue, frontend | ZhaoYun | GaoShun/ChenDao |
| deep | refactor, arch, feature | ZhaoYun | GaoShun/ChenDao |
| quick | fix, bug, change | ZhangFei | LeiXu/WuLan |
| ultrabrain | design, plan, decision | ZhouYu | LuSu/HuangGai |
| review | review, quality | GuanYu | GuanPing/ZhouCang |
| test | test, unit, e2e, coverage | XuShu | PangLin/YanYan |
| explore | search, find, locate | SimaYi | SimaShi/SimaZhao |
| reserve | special, experimental | MaChao | MaDai/PangDe |

## ⚡ Parallel Dispatch Examples

### Example 1: Full-Stack Feature Development

```javascript
// ZhugeLiang dispatches to ZhaoYun, SimaYi, ZhouYu in parallel
Task({subagent_type: "zhaoyun", prompt: "Implement frontend page..."})
Task({subagent_type: "simayi", prompt: "Explore existing code structure..."})
Task({subagent_type: "zhouyu", prompt: "Design API interface..."})
```

### Example 2: ZhaoYun Dispatches to Lieutenants

```javascript
// ZhaoYun dispatches to GaoShun and ChenDao in parallel
Task({subagent_type: "gaoshun", prompt: "Implement Vue component..."})
Task({subagent_type: "chendao", prompt: "Implement API endpoint..."})
```

### Example 3: Bug Fix with Parallel Analysis

```javascript
// ZhangFei dispatches to LeiXu and WuLan in parallel
Task({subagent_type: "leixu", prompt: "Locate bug root cause..."})
Task({subagent_type: "wulan", prompt: "Prepare hotfix patch..."})
```

## 📋 All Agents (22 Total)

### Level 1: Commander (1)

| Agent | Role | Model | Permission |
|-------|------|-------|------------|
| ZhugeLiang | 主帅/调度器 | glm-5 | task.* (all agents) |

### Level 2: Commanders (7)

| Agent | Role | Model | Lieutenants |
|-------|------|-------|-------------|
| ZhouYu (周瑜) | 战略规划 | glm-5 | LuSu, HuangGai |
| ZhaoYun (赵云) | 深度执行 | qwen3.5-plus | GaoShun, ChenDao |
| SimaYi (司马懿) | 情报侦察 | minimax-m2.5 | SimaShi, SimaZhao |
| GuanYu (关羽) | 质量守护 | qwen3.5-plus | GuanPing, ZhouCang |
| ZhangFei (张飞) | 快速修复 | minimax-m2.5 | LeiXu, WuLan |
| XuShu (徐庶) | 测试专家 | qwen3.5-plus | PangLin, YanYan |
| MaChao (马超) | 特殊任务 | glm-5 | MaDai, PangDe |

### Level 3: Lieutenants (14)

| Agent | Commander | Role | Specialization |
|-------|-----------|------|----------------|
| LuSu (鲁肃) | ZhouYu | 资源规划专家 | Resource planning, feasibility |
| HuangGai (黄盖) | ZhouYu | 执行落地专家 | Execution, prototype validation |
| GaoShun (高顺) | ZhaoYun | 前端开发专家 | Vue, UI implementation |
| ChenDao (陈到) | ZhaoYun | 后端开发专家 | API, Service implementation |
| SimaShi (司马师) | SimaYi | 深度分析专家 | Architecture analysis |
| SimaZhao (司马昭) | SimaYi | 信息整理专家 | Documentation, knowledge |
| GuanPing (关平) | GuanYu | 代码审查专家 | Code review, style check |
| ZhouCang (周仓) | GuanYu | 安全检查专家 | Security audit, vulnerability |
| LeiXu (雷绪) | ZhangFei | 快速定位专家 | Bug location, root cause |
| WuLan (吴兰) | ZhangFei | 即时修复专家 | Hotfix, quick patch |
| PangLin (庞林) | XuShu | 前端测试专家 | Vitest, Playwright |
| YanYan (严颜) | XuShu | 后端测试专家 | JUnit, Mockito |
| MaDai (马岱) | MaChao | 稳健支援专家 | Cross-domain support |
| PangDe (庞德) | MaChao | 特殊任务专家 | Exploratory tasks |

## 🔧 Configuration

### Permission Structure

```yaml
# ZhugeLiang - Can dispatch all agents
permission:
  task:
    "*": allow

# Commanders - Can dispatch their lieutenants
permission:
  task:
    "lieutenant1": allow
    "lieutenant2": allow
```

### Model Routing

| Agent Type | Model | Use Case |
|------------|-------|----------|
| Commander | glm-5 | Complex reasoning, strategy |
| Executor | qwen3.5-plus | Code implementation |
| Explorer | minimax-m2.5 | Search, analysis |
| Specialist | qwen3.5-plus | Domain expertise |

## 📚 Skills Integration

| Source | Skills Count | Description |
|--------|--------------|-------------|
| obra/superpowers | 15+ | Development workflow skills |
| anthropics/skills | 18+ | Official Anthropic skills |
| everything-claude-code | 65+ | Hackathon winner collection |
| skills.sh | 80K+ | Community marketplace |

### Recommended Skills by Commander

| Commander | Recommended Skills |
|-----------|-------------------|
| ZhugeLiang | dispatching-parallel-agents, subagent-driven-development |
| ZhouYu | writing-plans, brainstorming |
| ZhaoYun | executing-plans, test-driven-development |
| SimaYi | find-skills, systematic-debugging |
| GuanYu | requesting-code-review, security-scan |
| ZhangFei | systematic-debugging, verification-before-completion |
| XuShu | test-driven-development, webapp-testing |

## 🛠️ Usage

### Command Line

```bash
# Install
npm install ultrawork-sanguo

# Initialize
npx ultrawork-init
```

### In Claude Code / OpenCode

```
User: /ulw implement user login feature

+==============================================================+
|  UltraWork SanGuo Legion                               [RUN] |
+==============================================================+
|  Task: implement user login feature                          |
|  Progress: [####################] 100%                        |
+--------------------------------------------------------------+
|  Agents:                                                     |
|    [OK] ZhugeLiang ##### intent analyzed                     |
|    [OK] ZhouYu     ##### architecture designed                |
|    [OK] ZhaoYun    ##### implementation done                  |
|    [OK] GaoShun    ##### frontend completed                   |
|    [OK] ChenDao    ##### backend completed                    |
|    [OK] XuShu      ##### tests written                        |
+--------------------------------------------------------------+
|  Result: Feature implemented successfully!                   |
+==============================================================+
```

## 📝 Changelog

### v1.6.0 (2025-03-08)
- ✨ Three-level parallel dispatch architecture
- ✨ All commanders support parallel lieutenant dispatch
- ✨ Permission system for hierarchical agent orchestration
- ✨ 22 agents with specialized roles

### v1.5.3 (2025-03-08)
- ✨ ZhugeLiang parallel dispatch capability

### v1.5.2 (2025-03-08)
- 🐛 Fixed commander permission configuration

### v1.5.0 (2025-03-08)
- ✨ Added XuShu (test expert) with lieutenants PangLin and YanYan

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines.

## 🔗 Links

- [npm](https://www.npmjs.com/package/ultrawork-sanguo)
- [GitHub](https://github.com/paskaa/ultrawork-sanguo)
- [Releases](https://github.com/paskaa/ultrawork-sanguo/releases)

---

*鞠躬尽瘁，死而后已*