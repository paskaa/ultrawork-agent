# Changelog

All notable changes to this project will be documented in this file.

## [1.5.0] - 2025-03-08

### Added
- **XuShu (徐庶)** - 新增测试专家武将
  - 单元测试、集成测试、E2E测试
  - 测试覆盖率分析
  - Mock/Stub策略
- **PangLin (庞林)** - 新增前端测试专家 (徐庶部将)
  - Vitest 单元测试
  - Playwright E2E测试
  - Vue Test Utils
  - MSW Mock
- **YanYan (严颜)** - 新增后端测试专家 (徐庶部将)
  - JUnit 5 单元测试
  - Mockito 模拟框架
  - Spring Boot Test
  - TestContainers 集成测试
  - Jacoco 覆盖率

### Changed
- 更新诸葛亮调度规则，新增测试任务路由
- 将领总数从 19 位增加到 22 位
- 更新任务分配规则表

### Task Routing

| 任务类型 | 主将 | 副将 |
|----------|------|------|
| 测试任务 | XuShu | PangLin/YanYan |

## [1.4.1] - 2025-03-07

### Added
- 初始化项目结构
- 19 位三国武将 Agent 配置
- 多模型路由支持 (glm-5, qwen3.5-plus, minimax-m2.5)
- 多平台支持 (Qoder, OpenCode, Claude Code, Bailian)

### Commanders
- ZhouYu (周瑜) - 战略规划
- ZhaoYun (赵云) - 深度执行
- SimaYi (司马懿) - 情报侦察
- GuanYu (关羽) - 质量守护
- ZhangFei (张飞) - 快速修复

### Lieutenants
- GaoShun, ChenDao (ZhaoYun部将)
- LuSu, HuangGai (ZhouYu部将)
- SimaShi, SimaZhao (SimaYi部将)
- GuanPing, ZhouCang (GuanYu部将)
- LeiXu, WuLan (ZhangFei部将)
- MaChao, MaDai, PangDe (后备军团)