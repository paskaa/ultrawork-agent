# UltraWork - SanGuo Legion v2.1.4

> 鞠躬尽瘁，死而后已
> 将帅齐心，其利断金

A hierarchical multi-agent orchestration system with Three Kingdoms themed commanders and lieutenants. **61 generals**, **4 model providers**, **speed optimized**, supporting multiple platforms (OpenCode, Claude Code, Bailian, AstronCodingPlan, minimax).

## 🌟 Features

- **61 Generals** - 1 Commander-in-Chief, 17 Commanders, 43 Lieutenants
- **4 Model Providers** - Bailian, AstronCodingPlan, minimax, OpenAI compatible
- **Speed Optimized** - Auto-assign fastest model based on capabilities
- **Strict Hierarchy** - ZhugeLiang → Commanders → Lieutenants
- **17 Task Categories** - Auto-routing based on keywords
- **Multi-Platform** - OpenCode, Claude Code, Bailian
- **Advanced Models** - qwen3-coder-next (fastest), MiniMax-M2.5-highspeed, astron-code-latest, qwen3.5-plus

## 🧠 Model Assignment Strategy (v2.1.4)

### 📊 Model Speed Ranking

| Rank | Model | Speed | TTFT | Best For |
|------|-------|-------|------|----------|
| 🥇 | qwen3-coder-next | ~300ms ⚡ | 305ms | Code development |
| 🥈 | MiniMax-M2.5-highspeed | ~800ms | 741ms | Quick response |
| 🥉 | astron-code-latest | ~1500ms | 463ms | Documentation |
| 4 | qwen3.5-plus | ~3000ms | 11338ms | Code review |

### 📈 Current Distribution

| Model | Count | Usage |
|-------|-------|-------|
| **qwen3-coder-next** | 36 | Code development, execution |
| **MiniMax-M2.5-highspeed** | 10 | Quick fix, exploration |
| **astron-code-latest** | 9 | Documentation, planning |
| **qwen3.5-plus** | 6 | Quality review |

### 🎖️ Provider Configuration

- **bailian**: `https://coding.dashscope.aliyuncs.com/v1` + `@ai-sdk/openai`
- **AstronCodingPlan**: `https://maas-coding-api.cn-huabei-1.xf-yun.com/v2` + `@ai-sdk/openai-compatible`
- **minimax**: `https://api.minimaxi.com/v1` + `@ai-sdk/openai`

---

## 📦 Installation

```bash
npm install ultrawork-sanguo
```

## 🚀 Usage

### Trigger Commands

| Command | Description |
|---------|-------------|
| `/ulw <task>` | Execute a task with auto-routing |
| `/ultrawork` | Show help and status |
| `/zt <url>` | Process Zentao tasks |

### Example Usage

```
User: /ulw 搜索用户登录相关代码

+==============================================================+
|  UltraWork SanGuo Legion                               [RUN] |
+==============================================================+
|  Task: 搜索用户登录相关代码                                    |
|  Route: explore → SimaYi                                     |
+==============================================================+
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    三国军团层级架构 v2.0                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Level 1: 主帅 (1人)                                        │
│  └── 诸葛亮 (ZhugeLiang)                                    │
│                                                             │
│           ↓ 只能调用大都督                                   │
│                                                             │
│  Level 2: 大都督 (17人)                                     │
│  ├── 周瑜 (ZhouYu)      → 鲁肃、黄盖                        │
│  ├── 赵云 (ZhaoYun)     → 高顺、陈到                        │
│  ├── 司马懿 (SimaYi)    → 司马师、司马昭                     │
│  ├── 关羽 (GuanYu)      → 关平、周仓                        │
│  ├── 张飞 (ZhangFei)    → 雷绪、吴兰                        │
│  ├── 满宠 (ManChong)    → 程昱、贾诩、刘晔                   │
│  ├── 徐庶 (XuShu)       → 庞林、严颜                        │
│  ├── 马超 (MaChao)      → 庞德                              │
│  ├── 姜维 (JiangWei)    → [独立执行]                        │
│  ├── 邓艾 (DengAi) 🔥   → 王双、张翼 [DevOps]               │
│  ├── 张辽 (ZhangLiao) 🔥 → 乐进、李典 [Database]            │
│  ├── 于禁 (YuJin) 🔥    → 毛玠、董昭 [Security]             │
│  ├── 张郃 (ZhangHe) 🚀  → 郭淮 [Performance]                │
│  ├── 甘宁 (GanNing) 🚀  → 凌统、丁奉 [Mobile]               │
│  ├── 太史慈 (TaiShiCi) 🚀 → 周泰 [API]                      │
│  ├── 陆逊 (LuXun) 🚀    → 潘璋 [AI]                         │
│  └── 吕蒙 (LuMeng) 🚀   → 蒋钦 [Web3]                       │
│                                                             │
│           ↓ 只能调用自己的部将                               │
│                                                             │
│  Level 3: 部将 (27人)                                       │
│  └── 向各自的大都督汇报，禁止越级                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 👥 Commanders

| Commander | Role | Team | Category |
|-----------|------|------|----------|
| 周瑜 (ZhouYu) | Strategist | 鲁肃、黄盖 | ultrabrain |
| 赵云 (ZhaoYun) | Deep Executor | 高顺、陈到 | deep/visual-engineering |
| 司马懿 (SimaYi) | Explorer | 司马师、司马昭 | explore/writing |
| 关羽 (GuanYu) | Quality Guard | 关平、周仓 | review |
| 张飞 (ZhangFei) | Quick Fixer | 雷绪、吴兰 | quick |
| 满宠 (ManChong) | Monitor Commander | 程昱、贾诩、刘晔 | monitor |
| 徐庶 (XuShu) | Test Expert | 庞林、严颜 | test |
| 马超 (MaChao) | Reserve Commander | 庞德 | reserve |
| 姜维 (JiangWei) | File Operations | [独立执行] | fileops |
| 邓艾 (DengAi) 🔥 | DevOps Commander | 王双、张翼 | devops |
| 张辽 (ZhangLiao) 🔥 | Database Commander | 乐进、李典 | database |
| 于禁 (YuJin) 🔥 | Security Commander | 毛玠、董昭 | security |
| 张郃 (ZhangHe) 🚀 | Performance Commander | 郭淮 | performance |
| 甘宁 (GanNing) 🚀 | Mobile Commander | 凌统、丁奉 | mobile |
| 太史慈 (TaiShiCi) 🚀 | API Commander | 周泰 | api |
| 陆逊 (LuXun) 🚀 | AI Commander | 潘璋 | ai |
| 吕蒙 (LuMeng) 🚀 | Web3 Commander | 蒋钦 | web3 |

## 📋 Task Categories

| Category | Commander | Keywords |
|----------|-----------|----------|
| monitor | 满宠 | 监控, 日志, 异常, console, network |
| test | 徐庶 | 单元测试, 集成测试, JUnit, Vitest |
| explore | 司马懿 | 搜索, 查找, 定位, find, search |
| ultrabrain | 周瑜 | 设计, 方案, 决策, 规划 |
| quick | 张飞 | 修复, bug, fix, 问题 |
| review | 关羽 | review, 审查, 检查, 质量 |
| visual-engineering | 赵云 | UI, Vue, 组件, 页面 |
| deep | 赵云 | 重构, 架构, 开发, 模块 |
| writing | 司马懿 | 文档, readme, 说明 |
| reserve | 马超 | 特殊, 实验, 备用 |
| fileops | 姜维 | 迁移, 整合, 备份 |
| devops | 邓艾 🔥 | CI/CD, Docker, K8s |
| database | 张辽 🔥 | SQL, MySQL, 索引 |
| security | 于禁 🔥 | 安全, 渗透, 漏洞 |
| performance | 张郃 🚀 | 性能, Profiling, JVM |
| mobile | 甘宁 🚀 | iOS, Android, App |
| api | 太史慈 🚀 | RESTful, GraphQL |
| ai | 陆逊 🚀 | ML, 深度学习, NLP |
| web3 | 吕蒙 🚀 | 区块链, 智能合约 |

## 🔒 Hierarchy Constraints

```
✅ ZhugeLiang can only call Commanders (17 total)
✅ Commanders can only call their own Lieutenants
✅ Lieutenants can only report to their Commander
❌ No skipping levels
❌ No cross-team calls
```

## 📁 Project Structure

```
ultrawork-sanguo/
├── config/
│   └── ultrawork-sanguo.json    # Main config
├── skills/                      # General skills
│   ├── manchong-monitor/        # 满宠 - 监察指挥
│   ├── chengyu-frontend-monitor/# 程昱 - 前端监控
│   ├── jiaxu-backend-monitor/   # 贾诩 - 后端监控
│   ├── liuye-e2e-tester/        # 刘晔 - E2E测试
│   ├── xushu-test-expert/       # 徐庶 - 测试专家
│   ├── panglin-frontend-tester/ # 庞林 - 前端测试
│   ├── yanyan-backend-tester/   # 严颜 - 后端测试
│   └── zentao-workflow/         # 禅道工作流
├── commands/
│   └── zt.md                    # Zentao command
└── ...
```

## 📝 Changelog

### v2.0.2 (2026-03-12)

- ✨ **Added**: OpenCode 内置 Subagent 类型映射系统
  - 16 种内置类型完整映射到三国军团武将
  - 新增 `config/subagent-mapping.json` 配置文件
  - 新增 `src/agents/subagent-router.ts` 路由模块
  - 支持 explore, code-reviewer, tdd-guide, security-reviewer 等类型
- ✨ **Added**: Web 面板智能调度 API
  - 新增 `/api/router/plan` 智能路由接口
  - 实时负载计算和策略选择
  - 支持 idle/normal/heavy/overloaded 四种负载等级
  - 自动调整并行度和资源配置
- ✨ **Added**: 武将专业领域配置
  - 为每位武将定义专业领域标签
  - 支持基于专业领域的智能任务分配
  - 覆盖前端、后端、DevOps、安全、数据库等领域
- 📚 **Docs**: 新增 `docs/subagent-mapping-guide.md` 完整文档
  - 包含所有内置类型的映射表
  - 提供 4 种使用方法的详细说明
  - 包含故障排除和自定义配置指南

### v2.0.1 (2026-03-12)

- 🐛 **Fixed**: OpenCode SDK v1 API compatibility issues
  - Correct parameter structure for `session.create`, `promptAsync`, `get`, `messages`
  - Fixed Basic Auth injection for plugin API calls
  - Improved session polling with `session.status()` API
  - Added `safeStringify()` for robust error handling
- ✨ **Added**: `opencode-sdk-v1-api` skill with complete SDK usage documentation
- ✨ **Added**: Enhanced debug logging throughout execution pipeline
- ✨ **Added**: Web panel start scripts (`start-panel.bat`, `start-server.bat`)
- 📚 **Docs**: Updated README with SDK compatibility notes

### v2.0.0 (2026-03-11)

- 🎉 **Major Release**: 45 Generals (17 Commanders + 27 Lieutenants + 1 Chief)
- ✨ **New Chains**: ZhangHe (Performance), GanNing (Mobile), TaiShiCi (API), LuXun (AI), LuMeng (Web3)
- ✨ **New Categories**: performance, mobile, api, ai, web3
- 📚 **Docs**: Complete architecture documentation

### v1.8.1 (2026-03-09)

- ✨ **New Models**: Added Bailian Coding Plan models support
  - `qwen3.5-plus` - Primary coding model for specialists
  - `qwen3.5-plus` - Fast fallback for coding tasks
  - `qwen3-max-2026-01-23` - Latest Qwen Max variant
  - `glm-4.7` - Updated GLM model
- 🔧 **Updated**: Enhanced fallback chains for all coding specialists (GaoShun, ChenDao, ChengYu, JiaXu, PangLin, YanYan)
- 🔧 **Updated**: LiuYe (E2E Test) model upgraded to `qwen3.5-plus`

### v1.8.0 (2026-03-08)

- ✨ **New**: 26 Generals (up from 19)
- ✨ **New**: XuShu Test Team (庞林，严颜)
- ✨ **New**: ManChong Monitor Team (程昱，贾诩，刘晔)
- ✨ **New**: Strict hierarchy dispatch system
- ✨ **New**: 10 task categories with auto-routing
- 🔧 **Fix**: All agents have `name` and `commander` fields
- 🔧 **Fix**: Task routing priority optimized
- 📚 **Docs**: Complete architecture documentation

### v1.4.0

- Initial release with 19 generals

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 🖥️ Web 面板 (v5.0)

实时 Web 面板支持 Session 多会话管理和 45 位将领状态监控。

### 面板截图

![Web Panel Screenshot](docs/web-panel-screenshot.png)

### 快速启动

```bash
# 启动面板服务器
/panel:start

# 在浏览器中打开
/panel:open

# 查看状态
/panel:status
```

### Web 面板功能

- ✅ **45 位将领** - 完整的三国军团层级显示
- ✅ **Session 多会话** - 独立的调度环境
- ✅ **实时通信** - WebSocket 推送
- ✅ **最近 5 个 Session** - 快速切换
- ✅ **分配总览** - 活跃将领分布图
- ✅ **自动推送** - OpenCode 集成
- ✅ **自定义名称** - Session 命名

### 访问地址

- **Web 面板**: http://localhost:3459
- **Session 列表**: http://localhost:3459/api/sessions
- **最近 5 个**: http://localhost:3459/api/sessions/recent

### 在代码中使用

```javascript
const { init, startTask, assignAgent, updateProgress, completeTask } = 
  require('./ultrawork-sanguo/scripts/ultrawork-wrapper');

// 创建 Session 并开始任务
await init('修复登录Bug');
await startTask('zhaoyun', '修复登录Bug', '分析代码');
await updateProgress(50);
await completeTask();
```

### 文件结构

```
ultrawork-sanguo/
├── plugin.json                 # 插件配置
├── scripts/
│   ├── state-server-v5.cjs    # Web 服务器
│   ├── ultrawork-reporter.js  # API 封装
│   ├── ultrawork-wrapper.js   # 高级封装
│   └── ultrawork-example.js   # 使用示例
└── skills/
    └── ultrawork-web-panel/   # 技能文档
```

### 配置

```json
{
  "config": {
    "port": 3459,
    "defaultSession": "default",
    "autoReport": true
  }
}
```

### 命令列表

| 命令 | 描述 |
|------|------|
| `/panel:start` | 启动面板 |
| `/panel:stop` | 停止面板 |
| `/panel:open` | 打开浏览器 |
| `/panel:status` | 检查状态 |
| `/session:create <name>` | 创建 Session |
| `/session:list` | 列出 Sessions |
| `/session:switch <id>` | 切换 Session |
| `/example:bugfix` | 运行示例 |

---

*鞠躬尽瘁，死而后已*