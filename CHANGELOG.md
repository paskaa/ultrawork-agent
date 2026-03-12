# Changelog

All notable changes to this project will be documented in this file.

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
  - `qwen3-coder-plus` - Primary model for coding specialists (GaoShun, ChenDao, ChengYu, JiaXu, PangLin, YanYan)
  - `qwen3-coder-next` - Fast fallback model for coding tasks
  - `qwen3-max-2026-01-23` - Latest Qwen Max variant
  - `glm-4.7` - Updated GLM model support

- 🔧 **Model Config**: Updated fallback model chains for all coding specialists
  - GaoShun (Frontend): `qwen3-coder-plus` → `qwen3-coder-next` → `qwen3.5-plus` → `glm-5`
  - ChenDao (Backend): `qwen3-coder-plus` → `qwen3-coder-next` → `qwen3.5-plus` → `glm-5`
  - ChengYu (Frontend Monitor): `qwen3-coder-plus` → `qwen3-coder-next` → `qwen3.5-plus` → `glm-5`
  - JiaXu (Backend Monitor): `qwen3-coder-plus` → `qwen3-coder-next` → `qwen3.5-plus` → `glm-5`
  - PangLin (Frontend Test): `qwen3-coder-plus` → `qwen3-coder-next` → `qwen3.5-plus` → `glm-5`
  - YanYan (Backend Test): `qwen3-coder-plus` → `qwen3-coder-next` → `qwen3.5-plus` → `glm-5`
  - LiuYe (E2E Test): Updated to `qwen3-coder-next`

### 📦 Technical

- Updated category model configurations for `visual-engineering` and `deep` to use `qwen3-coder-plus`
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
