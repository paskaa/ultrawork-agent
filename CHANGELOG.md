# Changelog

All notable changes to this project will be documented in this file.

## [2.1.5] - 2026-03-14 🔧

### 🐛 Bug Fixes

- **修复模型解析问题** - 将 DEFAULT_AGENTS 中的模型从完整模型ID改为内部key（如 `mmodel-hs`, `q35model` 等），确保通过 `resolveModel()` 正确解析
- **添加会话模型参数** - 在创建子会话时传递模型参数，确保子会话使用正确的模型
- **修复配置加载路径** - 确保从 `.opencode/ultrawork-sanguo.json` 正确加载用户配置

### ⚙️ Technical Changes

- 更新 `src/config/schema.ts` 中的 DEFAULT_AGENTS 使用内部模型key
- 更新 `dist/config/schema.js` 同步更改
- 修改 `src/executor/index.ts` 在 `createSyncSession` 中接受并传递 `categoryModel` 参数
- 修改 `src/index.ts` 调用 `resolveModel()` 解析模型key

## [2.1.4] - 2026-03-13 ⚡

### 🚀 模型供应商配置优化 - 速度优先

#### 🔧 配置修复

- **bailian 端点修复** - 从 `/apps/anthropic/v1` 改为 `/v1`
- **npm 包修复** - 从 `@ai-sdk/anthropic` 改为 `@ai-sdk/openai`
- **Provider 配置正确**:
  - bailian: `/v1` + `@ai-sdk/openai`
  - AstronCodingPlan: `/v2` + `@ai-sdk/openai-compatible`  
  - minimax: `/v1` + `@ai-sdk/openai`

#### 📊 模型速度测试结果

| 模型 | 速度 | TTFT | 状态 |
|------|------|------|------|
| bailian/qwen3-coder-next | ~300ms ⚡ | 305ms | 最快 |
| bailian/kimi-k2.5 | ~16 tok/s | 822ms | 很快 |
| bailian/qwen3-coder-plus | ~11 tok/s | 457ms | 快 |
| minimax/MiniMax-M2.5-highspeed | ~800ms | 741ms | 快 |
| AstronCodingPlan/astron-code-latest | ~1500ms | 463ms | 中等 |
| bailian/qwen3.5-plus | ~3000ms | 11338ms | 慢 |
| bailian/glm-5 | ~6000ms | 14351ms | 最慢 |

#### 🎯 模型优化策略

根据速度测试结果，优化模型分配：

1. **代码类武将 (36个)** → qwen3-coder-next (最快 ~300ms)
2. **快速响应类 (10个)** → minimax/MiniMax-M2.5-highspeed (~800ms)
3. **文档类 (9个)** → AstronCodingPlan/astron-code-latest (~1500ms)
4. **质量审查类 (6个)** → qwen3.5-plus (保留)

#### 📈 最终模型分布

| 模型 | 数量 | 用途 |
|------|------|------|
| bailian/qwen3-coder-next | 36 | 代码开发、执行 |
| minimax/MiniMax-M2.5-highspeed | 10 | 快速修复、探索 |
| AstronCodingPlan/astron-code-latest | 9 | 文档整理、战略规划 |
| bailian/qwen3.5-plus | 6 | 质量审查 |

#### 🔧 整合优化

- 删除 16 个内置 Subagent 重复配置
- 合并 4 个监控变体 (-monitor 后缀)
- Agent 总数: 78 → 61

#### ✅ 测试结果

- 6/6 模型全部正常
- 61 位武将全部可调用

---

## [2.1.3] - 2026-03-13 🎯

### 🚀 模型智能分配 - 按武将职责配置

根据四个模型的长处，为每个武将配置最适合的模型：

#### 🧠 模型能力分析

| 模型 | 核心优势 | 最佳场景 | 分配数量 |
|------|---------|---------|---------|
| **GLM-5** | 战略规划、复杂推理、架构设计 | 主帅、大都督、决策规划 | 9 |
| **Qwen3.5-plus** | 代码能力最强、视觉理解 | 开发、审查、技术实现 | 30 |
| **Kimi-k2.5** | 长文本处理(256K)、图片理解 | 文档、分析、信息整理 | 1 |
| **MiniMax-M2.5** | 快速响应、Agent能力 | 探索、监控、快速任务 | 6 |

#### 🎖️ 武将模型配置

**战略型 (GLM-5)** - 9位
- 诸葛亮(主帅)、周瑜(战略)、鲁肃(资源)、张郃(性能)
- 陆逊(AI)、吕蒙(Web3)、满宠(监控)、徐庶(测试)、马超(后备)

**代码型 (Qwen3.5-plus)** - 30位
- 赵云(执行)、关羽(审查)、高顺(前端)、陈到(后端)
- 邓艾(DevOps)、张辽(数据库)、于禁(安全)、甘宁(移动)
- 太史慈(API)、郭淮(性能)、蒋钦(Web3)等

**快速型 (MiniMax-M2.5)** - 6位
- 司马懿(探索)、张飞(快修)、程昱(前端监控)、贾诩(后端监控)
- 司马师(分析)、雷绪(定位)

**文档型 (Kimi-k2.5)** - 1位
- 司马昭(信息整理)

#### 📊 分配效果

- 充分发挥各模型长处
- 战略类任务用GLM-5
- 代码类任务用Qwen3.5-plus
- 快速响应用MiniMax-M2.5
- 长文本用Kimi-k2.5

---

## [2.1.2] - 2026-03-13 🎯

### 🚀 主力模型切换 - GLM-5

#### 🔧 Changed

- **主力模型切换** - 将主力模型从 `qwen3.5-plus` 改为 `glm-5`
  - 32 个Agent已切换到 glm-5
  - 10 个类别已切换到 glm-5
  - fallback顺序: glm-5 → qwen3.5-plus → MiniMax-M2.5

- **模型职责重新定义**:
  1. `glm-5` - 主力模型/战略规划 (32 Agents)
  2. `qwen3.5-plus` - 代码/视觉理解 (fallback)
  3. `kimi-k2.5` - 长文本/文档处理 (2 Agents)
  4. `MiniMax-M2.5` - 快速响应/探索任务 (6 Agents)

#### 📊 新模型分布

| 模型 | 数量 | 用途 |
|------|------|------|
| glm-5 | 38 | 主力/战略/执行 |
| qwen3.5-plus | 0 | 仅作为fallback |
| MiniMax-M2.5 | 6 | 快速/探索 |
| kimi-k2.5 | 2 | 长文本/文档 |

---

## [2.1.1] - 2026-03-13 🧪

### ✅ Bug Fixes & Testing

#### 🔧 Fixed

- **重复Fallback模型** - 修复17个Agent的fallback_models重复问题
  - 移除与主模型重复的fallback项
  - 确保回退链中模型不重复

- **Categories Keywords** - 恢复19个类别的keywords配置
  - 修复模型优化脚本导致的keywords清空问题
  - 恢复路由关键词匹配功能

#### ✨ Added

- **全流程全链条测试脚本** (`test-full-chain.cjs`)
  - 7个测试阶段覆盖完整链路
  - 模型配置验证 (46 Agents)
  - Agent层级结构验证 (16 Commanders + 28 Lieutenants)
  - 任务路由验证 (19 Categories)
  - Subagent映射验证 (16 Mappings)
  - 模型回退链验证 (46 Agents)
  - 类别配置验证 (17 Categories)

- **辅助修复脚本**
  - `scripts/fix-duplicate-fallbacks.cjs` - 自动修复重复fallback
  - `scripts/restore-keywords.cjs` - 自动恢复keywords配置

#### 📊 Test Results

```
✅ 模型配置: 46/46 Agents使用允许模型 (4个核心模型)
✅ Agent层级: 主帅1 + 大都督16 + 部将28
✅ 任务路由: 19个类别配置关键词
✅ Subagent映射: 16个映射全部正确
✅ 模型回退链: 46/46 有效
✅ 类别配置: 17个必需类别存在
```

---

## [2.1.0] - 2026-03-13 🎯

### 🚀 Model Optimization - 精简模型配置

#### 🔧 Changed

- **模型精简** - 移除所有 `qwen3-coder-plus` 和 `qwen3-coder-next` 模型
  - 只保留4个核心模型：
    1. `bailian/qwen3.5-plus` - 主力模型（支持图片理解）
    2. `bailian/kimi-k2.5` - 长文本/文档处理（支持图片理解）
    3. `bailian/glm-5` - 战略规划/复杂推理
    4. `bailian/MiniMax-M2.5` - 快速响应/探索任务
  
- **配置更新** - 更新所有武将和类别的模型配置
  - 44 处模型引用已替换
  - 所有 fallback_models 已精简为允许的4个模型
  - `qwen3-coder-plus` → `qwen3.5-plus`
  - `qwen3-coder-next` → `qwen3.5-plus`

- **文件更新**:
  - ✅ `config/ultrawork-sanguo.json` - 37 处替换
  - ✅ `config/subagent-mapping.json` - 7 处替换
  - ✅ `src/config/schema.ts` - 4 处替换
  - ✅ `dist/config/schema.js` - 4 处替换
  - ✅ `README.md` - 5 处替换
  - ✅ `CHANGELOG.md` - 16 处替换

#### 📚 Documentation

- 更新模型说明，移除 coder 模型相关描述
- 简化模型选择指南

#### 🎯 Benefits

- **简化配置** - 从7个模型精简到4个核心模型
- **降低成本** - 减少模型切换和冗余调用
- **提高稳定性** - 统一的模型配置，减少兼容性问题
- **易于维护** - 清晰的模型分工和职责

---

## [2.0.3] - 2026-03-12 📦

### 🔄 Patch Release - Version Sync

#### 🔧 Changed

- 版本号同步更新到 2.0.3 (npm 发布需要)
- README 和 package.json 版本号统一

---

## [2.0.2] - 2026-03-12 🎯

### 🚀 OpenCode 内置 Subagent 类型映射支持

#### ✨ Added

- **OpenCode 内置类型映射** - 完整支持 OpenCode 内置 subagent 类型路由到三国武将
  - 新增 16 种内置类型映射规则到 `task_routing.rules`
  - 新增 `config/subagent-mapping.json` 配置文件
  - 新增 `docs/subagent-mapping-guide.md` 完整映射指南

- **新增映射类型**:
  - `explore` → 司马懿 (代码探索)
  - `code-reviewer` → 关羽 (代码审查)
  - `tdd-guide` → 徐庶 (测试驱动开发)
  - `security-reviewer` → 于禁 (安全审计)
  - `refactor-cleaner` → 司马懿 (重构清理)
  - `python-reviewer` → 陈到 (Python审查)
  - `go-reviewer` → 陈到 (Go审查)
  - `go-build-resolver` → 陈到 (Go构建修复)
  - `e2e-runner` → 刘晔 (E2E测试)
  - `doc-updater` → 司马昭 (文档更新)
  - `database-reviewer` → 张辽 (数据库审查)
  - `build-error-resolver` → 张飞 (构建错误修复)
  - `loop-operator` → 诸葛亮 (Agent循环)
  - `harness-optimizer` → 周瑜 (Harness优化)
  - `planner` → 周瑜 (任务规划)
  - `architect` → 周瑜 (架构设计)

- **Subagent Router 模块** - 新增 `src/agents/subagent-router.ts`
  - `routeBySubagentType()` 函数用于类型到武将的路由
  - 完整的类型别名支持
  - 双向查找映射表

- **Session Monitor Hook** - 新增 `scripts/session-monitor-hook.js`
  - 自动监控 Task 工具调用
  - 拦截内置类型并路由到三国武将

#### 🔧 Technical

- 新增 `config/subagent-mapping.json` - 集中管理所有类型映射
- 新增 `scripts/decision-matrix.js` - 智能决策矩阵
- 新增 `scripts/ultrawork-session-router.js` - 会话路由器
- 更新 `scripts/state-server-v5.cjs` - 增强状态同步
- 新增测试脚本 `test-subagent-mapping.js`

#### 📚 Documentation

- 新增 `docs/subagent-mapping-guide.md` - 完整的三层配置指南
- 新增 `scripts/README-smart-dispatch.md` - 智能调度说明
- 新增 `scripts/examples-smart-dispatch.js` - 使用示例

---

## [2.0.1] - 2026-03-12 🎉

### 🚀 Major Bug Fix Release - SDK v1 API Compatibility

#### 🐛 Fixed

- **OpenCode SDK v1 API Compatibility** - Fixed critical API parameter structure issues
  - `session.create` now uses correct `{ body: {...}, query: {...} }` format
  - `session.promptAsync` now uses `{ path: { id }, body: {...} }` format
  - `session.get` now uses `{ path: { id } }` format
  - `session.messages` now uses `{ path: { id } }` format
  - Message parsing updated to use `info.role` and `parts` structure

- **Authentication** - Added proper Basic Auth injection for plugin API calls
  - New `auth.ts` module with `injectServerAuthIntoClient()`
  - Automatic auth header injection via `setConfig` and interceptors

- **Session Polling** - Improved session completion detection
  - Added `session.status()` API usage for real-time status checks
  - Fallback to `session.get()` for busy state detection

- **Error Handling** - Added `safeStringify()` for robust error message extraction
  - Handles circular references and complex error objects
  - Prevents `[object Object]` errors in output

#### ✨ Added

- **OpenCode Skill** - New `opencode-sdk-v1-api` skill documenting SDK usage patterns
- **Debug Logging** - Enhanced logging throughout the execution pipeline
- **Web Panel Scripts** - Added multiple start scripts for web monitoring panel
  - `start-panel.bat`, `start-server.bat`, `start-v4-full.bat`
  - Real-time log viewing with state sync

#### 📚 Documentation

- Added `opencode-sdk-v1-api` skill with complete API usage examples
- Updated README with SDK compatibility notes

#### 🔧 Technical

- Fixed TypeScript compilation issues
- Updated dist files with correct API implementations
- Added `.gitignore` entries for generated files

---

## [2.0.0] - 2026-03-11 🎉🎉🎉

### 🚀 Major Release - Full Expansion

#### ✨ Phase 4 Complete - 45 Generals (17 Commanders + 27 Lieutenants + 1 Chief)

**New Commander-Lieutenant Chains (5 chains, 10 new generals):**

- **ZhangHe Chain** (Performance) 🆕
  - ZhangHe (儁乂) - Performance Commander: Profiling, system tuning, capacity planning
  - GuoHuai - System Performance Specialist: JVM tuning, bottleneck analysis

- **GanNing Chain** (Mobile) 🆕
  - GanNing (兴霸) - Mobile Commander: iOS/Android development, cross-platform
  - LingTong - iOS Specialist: Swift/UIKit/SwiftUI
  - DingFeng - Android Specialist: Kotlin/Jetpack

- **TaiShiCi Chain** (API) 🆕
  - TaiShiCi (子义) - API Commander: RESTful design, GraphQL, API documentation
  - ZhouTai - API Design Specialist: Interface standards, compatibility

- **LuXun Chain** (AI) 🆕
  - LuXun (伯言) - AI Commander: Machine learning, deep learning, recommendations
  - PanZhang - Data Scientist: Data modeling, feature engineering

- **LuMeng Chain** (Web3) 🆕
  - LuMeng (子明) - Web3 Commander: Blockchain, smart contracts, DApp
  - JiangQin - Smart Contract Specialist: Solidity, contract security

#### 🔥 Phase 2 Additions (Already Released)

**New Commander-Lieutenant Chains (3 chains, 9 new generals):**

- **DengAi Chain** (DevOps) 🔥
  - DengAi (士载) - DevOps Commander: CI/CD, containerization
  - WangShuang - CI/CD Specialist: Jenkins, GitLab CI
  - ZhangYi - Container Specialist: Docker, Kubernetes

- **ZhangLiao Chain** (Database) 🔥
  - ZhangLiao (文远) - Database Commander: Architecture, optimization
  - YueJin - SQL Optimization Specialist: Index design, slow queries
  - LiDian - Data Migration Specialist: ETL, data synchronization

- **YuJin Chain** (Security) 🔥
  - YuJin (文则) - Security Commander: Security audit, penetration testing
  - MaoJie - Penetration Testing Specialist: Web/API security
  - DongZhao - Crypto Security Specialist: Encryption, TLS

#### 🔄 Phase 1 Optimization

- **MaDai Consolidation**: MaDai's responsibilities merged into PangDe
  - Reduced total from 27 to 26 generals
  - Improved efficiency and reduced redundancy

#### 📊 Statistics

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **Total Generals** | 27 | 45 | +18 (+67%) |
| **Commanders** | 9 | 17 | +8 (+89%) |
| **Lieutenants** | 17 | 27 | +10 (+59%) |
| **Command Chains** | 9 | 17 | +8 (+89%) |
| **Skill Coverage** | 80% | 100% | +20% |

#### 🎯 New Task Categories (5 new categories)

- `performance` - Performance optimization, profiling, tuning
- `mobile` - iOS/Android development, cross-platform
- `api` - API design, GraphQL, documentation
- `ai` - Machine learning, deep learning, NLP
- `web3` - Blockchain, smart contracts, DApp

#### 🔧 Technical Improvements

- **Enhanced Hierarchy Constraints**: Updated strict mode for 17 commanders
- **New Task Routing**: 5 additional routing rules for new categories
- **Agent Dispatch Config**: Full dispatch configuration for all 17 chains
- **Model Configuration**: Consistent model assignment across all 45 generals

#### 📚 Documentation

- Updated `HIERARCHY_ARCHITECTURE.md` with complete 45-general roster
- Added Phase 2/3/4 implementation records
- Complete command chain documentation

---

## [1.8.1] - 2026-03-09

### 🔧 Updated

- ✨ **New Models**: Added support for Bailian Coding Plan models
  - `qwen3.5-plus` - Primary model for coding specialists (GaoShun, ChenDao, ChengYu, JiaXu, PangLin, YanYan)
  - `qwen3.5-plus` - Fast fallback model for coding tasks
  - `qwen3-max-2026-01-23` - Latest Qwen Max variant
  - `glm-4.7` - Updated GLM model support

- 🔧 **Model Config**: Updated fallback model chains for all coding specialists
  - GaoShun (Frontend): `qwen3.5-plus` → `qwen3.5-plus` → `qwen3.5-plus` → `glm-5`
  - ChenDao (Backend): `qwen3.5-plus` → `qwen3.5-plus` → `qwen3.5-plus` → `glm-5`
  - ChengYu (Frontend Monitor): `qwen3.5-plus` → `qwen3.5-plus` → `qwen3.5-plus` → `glm-5`
  - JiaXu (Backend Monitor): `qwen3.5-plus` → `qwen3.5-plus` → `qwen3.5-plus` → `glm-5`
  - PangLin (Frontend Test): `qwen3.5-plus` → `qwen3.5-plus` → `qwen3.5-plus` → `glm-5`
  - YanYan (Backend Test): `qwen3.5-plus` → `qwen3.5-plus` → `qwen3.5-plus` → `glm-5`
  - LiuYe (E2E Test): Updated to `qwen3.5-plus`

### 📦 Technical

- Updated category model configurations for `visual-engineering` and `deep` to use `qwen3.5-plus`
- Enhanced model fallback chains for better reliability

---

## [1.8.0] - 2026-03-08

### ✨ Added

- **26 Generals** - Complete Three Kingdoms commander roster
- **XuShu Test Team** - PangLin (Frontend Test), YanYan (Backend Test)
- **ManChong Monitor Team** - ChengYu (Frontend), JiaXu (Backend), LiuYe (E2E)
- **Strict Hierarchy System** - Enforced commander-lieutenant call chains
- **10 Task Categories** - Auto-routing with keyword detection

### 🔧 Fixed

- All agents now have proper `name` and `commander` fields
- Task routing priority optimized for better accuracy

### 📚 Docs

- Complete architecture documentation
- Updated platform configuration guides

---

## [1.4.0] - 2026-03-07

### ✨ Initial Release

- 19 Generals with hierarchical structure
- Multi-platform support (Qoder, OpenCode, Claude Code, Bailian)
- Task categorization and auto-routing
