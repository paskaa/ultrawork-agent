# UltraWork - SanGuo Legion

> 鞠躬尽瘁，死而后已
> 将帅齐心，其利断金

A hierarchical multi-agent orchestration skill for Claude Code with Three Kingdoms themed commanders and lieutenants.

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

## Task Categories

| Category | Keywords | Assigned Commanders |
|----------|----------|---------------------|
| visual-engineering | UI, Vue, frontend | ZhaoYun + SimaYi |
| deep | refactor, arch, feature | ZhaoYun + SimaYi |
| quick | fix, bug, change | ZhangFei |
| ultrabrain | design, plan, decision | ZhouYu |
| explore | search, find, locate | SimaYi |
| review | review, quality | GuanYu |

## License

MIT License - See [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

*鞠躬尽瘁，死而后已*
