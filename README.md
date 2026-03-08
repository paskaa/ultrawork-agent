# UltraWork - SanGuo Legion

> 鞠躬尽瘁，死而后已
> 将帅齐心，其利断金

A hierarchical multi-agent orchestration skill for Claude Code with Three Kingdoms themed commanders and lieutenants. **22 agents** with specialized roles.

## Installation

### Option 1: Install via npm

```bash
npm install ultrawork-skill
```

### Option 2: Manual Installation

Copy the `SKILL.md` file to your Claude Code skills directory:

```
~/.claude/skills/ultrawork/SKILL.md
```

## Usage

### Trigger Commands

| Command | Description |
|---------|-------------|
| `/ultrawork` | Show help and status |
| `/ulw <task>` | Execute a task |

### Example Usage

```
User: /ulw implement user login

+==============================================================+
|  UltraWork SanGuo Legion                               [RUN] |
+==============================================================+
|  Task: implement user login                                  |
|  Progress: [####################] 100%                        |
+--------------------------------------------------------------+
|  Agents:                                                     |
|    [OK] ZhugeLiang ##### intent done                         |
|    [OK] ZhaoYun   ##### login done                           |
|    [OK] SimaYi    ##### explore done                         |
+--------------------------------------------------------------+
|  Log: [15:30] >> Task completed!                             |
+==============================================================+
```

## Architecture

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
   ┌────┴────┐          ┌────┴────┐          ┌────┴────┐
   ▼         ▼          ▼         ▼          ▼         ▼
┌─────┐  ┌─────┐    ┌─────┐  ┌─────┐    ┌─────┐  ┌─────┐
│LuSu │  │Huang│    │Gao  │  │Chen │    │Sima │  │Sima │
│     │  │Gai  │    │Shun │  │Dao  │    │Shi  │  │Zhao │
└─────┘  └─────┘    └─────┘  └─────┘    └─────┘  └─────┘
```

## Commanders (大将层)

| Commander | Role | Specialization |
|-----------|------|----------------|
| ZhouYu (周瑜) | Strategist | System design, architecture, decisions |
| ZhaoYun (赵云) | Deep Executor | Core code, complex features, refactoring |
| SimaYi (司马懿) | Explorer | Code search, issue location, dependency tracking |
| GuanYu (关羽) | Quality Guard | Code review, quality check, best practices |
| ZhangFei (张飞) | Quick Fixer | Fast positioning, instant fixes, emergency response |
| XuShu (徐庶) | Test Expert | Unit tests, integration tests, E2E, coverage |

## Task Categories

| Category | Keywords | Assigned Commanders |
|----------|----------|---------------------|
| visual-engineering | UI, Vue, frontend | ZhaoYun + SimaYi |
| deep | refactor, arch, feature | ZhaoYun + SimaYi |
| quick | fix, bug, change | ZhangFei |
| ultrabrain | design, plan, decision | ZhouYu |
| explore | search, find, locate | SimaYi |
| review | review, quality | GuanYu |
| test | test, unit, e2e, coverage | XuShu |

## All Agents (22 Total)

### 主帅层 (1)
| Agent | Role | Model |
|-------|------|-------|
| ZhugeLiang | 主帅/调度器 | glm-5 |

### 大将层 (6)
| Agent | Role | Model |
|-------|------|-------|
| ZhouYu | 战略规划 | glm-5 |
| ZhaoYun | 深度执行 | qwen3.5-plus |
| SimaYi | 情报侦察 | minimax-m2.5 |
| GuanYu | 质量守护 | qwen3.5-plus |
| ZhangFei | 快速修复 | minimax-m2.5 |
| XuShu | 测试专家 | qwen3.5-plus |

### 部将层 (15)
| Agent | 所属 | Role |
|-------|------|------|
| GaoShun | ZhaoYun | 前端开发专家 |
| ChenDao | ZhaoYun | 后端开发专家 |
| LuSu | ZhouYu | 资源规划专家 |
| HuangGai | ZhouYu | 执行落地专家 |
| SimaShi | SimaYi | 深度分析专家 |
| SimaZhao | SimaYi | 信息整理专家 |
| GuanPing | GuanYu | 代码审查专家 |
| ZhouCang | GuanYu | 安全检查专家 |
| LeiXu | ZhangFei | 快速定位专家 |
| WuLan | ZhangFei | 即时修复专家 |
| PangLin | XuShu | 前端测试专家 |
| YanYan | XuShu | 后端测试专家 |
| MaChao | Reserve | 特殊任务专家 |
| MaDai | MaChao | 稳健支援专家 |
| PangDe | MaChao | 特殊任务专家 |

## License

MIT License - See [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

*鞠躬尽瘁，死而后已*
