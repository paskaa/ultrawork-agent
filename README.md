# 🏰 UltraWork SanGuo Legion

> 鞠躬尽瘁，死而后已
> 将帅齐心，其利断金

[![npm version](https://badge.fury.io/js/ultrawork-sanguo.svg)](https://www.npmjs.com/package/ultrawork-sanguo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**UltraWork SanGuo Legion** 是一个为 [OpenCode](https://opencode.ai) 设计的多智能体插件系统，灵感源自三国时期的分层指挥体系。它将复杂的开发任务自动分配给不同的"将领"（AI Agent），实现高效的并行执行和智能调度。

同时支持 Claude Code、Qoder 等多平台使用。

## ✨ 核心特性

- 🎭 **25位三国将领**: 诸葛亮、赵云、周瑜、司马懿、关羽、张飞、马超、徐庶等，各司其职
- 🧠 **多模型路由**: 支持 GLM-5、Qwen3.5-Plus、Kimi-K2.5、MiniMax-M2.5 等多种模型
- ⚡ **智能任务分类**: 自动识别任务类型（前端开发、后端开发、架构设计、代码探索等）
- 🔄 **并行执行**: 同一消息中并行调度多个将领，提高执行效率
- 📊 **状态可视化**: 实时显示任务进度和将领状态
- 🎯 **成本优化**: 相比单模型方案节省约 56% 的费用

## 📦 安装

### 方式1: 作为 OpenCode 插件使用（推荐）

```bash
# 克隆到 OpenCode 插件目录 (用户级别配置)
git clone https://github.com/paskaa/ultrawork-sanguo.git ~/.config/opencode/plugins/ultrawork-sanguo
```

然后重启 OpenCode，插件将自动加载。

**注意**: 所有配置统一存放在 `~/.config/opencode/` 用户级别目录下，不再在项目级别维护。

### 方式2: 通过 npm 安装

```bash
npm install ultrawork-sanguo
```

### 方式3: 作为 Claude Code Skill 使用

```bash
# 复制 SKILL.md 到 Claude Code skills 目录
cp SKILL.md ~/.claude/skills/ultrawork/SKILL.md
```

## 🚀 快速开始

### 命令触发

| 命令 | 描述 |
|------|------|
| `/ultrawork` | 显示帮助和状态 |
| `/ulw <任务>` | 执行一个任务 |
| `ulw-` | 启动 UltraWork 对话模式 |

### 使用示例

```
用户: /ulw 实现用户登录功能

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🏰 UltraWork 三国军团                                    [运行中] ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  📋 军令: 实现用户登录功能                                      ┃
┃  📊 总进度: [████████████████████] 100%                        ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  🎖️ 将领状态                                                   ┃
┃  ✅ 诸葛亮(孔明)    █████  调度完成                              ┃
┃  ✅ 赵云(子龙)      █████  任务分配完成                          ┃
┃  ✅ 司马懿(仲达)    █████  代码探索完成                          ┃
┃  ✅ 高顺           █████  前端页面完成                           ┃
┃  ✅ 陈到           █████  后端接口完成                           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

🎯 战果摘要:
- 创建文件: src/views/login/index.vue
- 创建文件: src/api/auth.js
- 创建文件: backend/api/auth.py
- 添加功能: JWT认证、密码加密、会话管理
```

## 🏛️ 组织架构

```
                    ┌─────────────────┐
                    │   ZhugeLiang    │
                    │   (主帅/调度)    │
                    │    gmodel       │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   ZhouYu      │    │   ZhaoYun     │    │   SimaYi      │
│  (大都督)      │    │   (大将)      │    │   (谋士)      │
│  Strategy     │    │   Execute     │    │   Explore     │
│   gmodel      │    │   q35model    │    │   mmodel      │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                    │
   ┌────┴────┐          ┌────┴────┐          ┌────┴────┐
   ▼         ▼          ▼         ▼          ▼         ▼
┌─────┐  ┌─────┐    ┌─────┐  ┌─────┐    ┌─────┐  ┌─────┐
│LuSu │  │Huang│    │Gao  │  │Chen │    │Sima │  │Sima │
│     │  │Gai  │    │Shun │  │Dao  │    │Shi  │  │Zhao │
│mmodel│ │q35  │    │q35  │  │q35  │    │mmodel│ │kmodel│
└─────┘  └─────┘    └─────┘  └─────┘    └─────┘  └─────┘
```

## 👥 将领阵容

### 顶层 - 主帅

| Agent | 角色 | 职责 | 模型 | 费用 |
|-------|------|------|------|------|
| **ZhugeLiang** | 诸葛亮(孔明) | 主帅/调度器 | GLM-5 | 0.5x |

### 中层 - 三大都督

| Agent | 角色 | 职责 | 模型 | 费用 |
|-------|------|------|------|------|
| **ZhouYu** | 周瑜(公瑾) | 战略规划 | GLM-5 | 0.5x |
| **ZhaoYun** | 赵云(子龙) | 执行大将 | Qwen3.5-Plus | 0.2x |
| **SimaYi** | 司马懿(仲达) | 探索谋士 | MiniMax-M2.5 | 0.2x |

### 中层 - 质量监控

| Agent | 角色 | 职责 | 模型 | 费用 |
|-------|------|------|------|------|
| **GuanYu** | 关羽(云长) | 质量守护者 | Qwen3.5-Plus | 0.2x |
| **ZhangFei** | 张飞(翼德) | 快速修复者 | Qwen3.5-Plus | 0.2x |
| **MaChao** | 马超(孟起) | 实验性任务 | MiniMax-M2.5 | 0.2x |
| **XuShu** | 徐庶(元直) | 测试专家 | Qwen3.5-Plus | 0.2x |
| **ManChong** | 满宠(伯宁) | 监察指挥官 | GLM-5 | 0.5x |

### 底层 - 部将

| 上级 | Agent | 角色 | 职责 | 模型 | 费用 |
|------|-------|------|------|------|------|
| ZhouYu | **LuSu** | 鲁肃(子敬) | 资源规划、方案分析 | MiniMax-M2.5 | 0.2x |
| ZhouYu | **HuangGai** | 黄盖(公覆) | 执行落地、原型验证 | Qwen3.5-Plus | 0.2x |
| ZhaoYun | **GaoShun** | 高顺 | 前端开发专家 | Qwen3.5-Plus | 0.2x |
| ZhaoYun | **ChenDao** | 陈到 | 后端开发专家 | Qwen3.5-Plus | 0.2x |
| SimaYi | **SimaShi** | 司马师 | 深度分析专家 | MiniMax-M2.5 | 0.2x |
| SimaYi | **SimaZhao** | 司马昭 | 信息整理专家 | Kimi-K2.5 | 0.3x |
| GuanYu | **GuanPing** | 关平 | 代码审查专家 | Qwen3.5-Plus | 0.2x |
| GuanYu | **ZhouCang** | 周仓 | 安全检查专家 | MiniMax-M2.5 | 0.2x |
| ZhangFei | **LeiXu** | 雷绪 | 快速定位专家 | MiniMax-M2.5 | 0.2x |
| ZhangFei | **WuLan** | 吴兰 | 即时修复专家 | Qwen3.5-Plus | 0.2x |
| MaChao | **PangDe** | 庞德 | 特殊任务专家 | Qwen3.5-Plus | 0.2x |
| MaChao | **MaDai** | 马岱 | 稳健支援专家 | MiniMax-M2.5 | 0.2x |
| XuShu | **PangLin** | 庞林 | 前端测试专家 | Qwen3.5-Plus | 0.2x |
| XuShu | **YanYan** | 严颜 | 后端测试专家 | Qwen3.5-Plus | 0.2x |
| ManChong | **ChengYu** | 程昱(仲德) | 前端监控专家 | MiniMax-M2.5 | 0.2x |
| ManChong | **JiaXu** | 贾诩(文和) | 后端监控专家 | MiniMax-M2.5 | 0.2x |

## 📋 任务分类与调度

| 类别 | 关键词 | 主将 | 部将 |
|------|--------|------|------|
| **前端开发** | UI, Vue, 界面, 样式 | ZhaoYun | GaoShun |
| **后端开发** | API, 接口, 数据库 | ZhaoYun | ChenDao |
| **架构设计** | 设计, 方案, 架构 | ZhouYu | LuSu |
| **代码探索** | 搜索, 查找, 分析 | SimaYi | SimaShi |
| **快速修复** | bug, 修复, fix | ZhangFei | WuLan, LeiXu |
| **代码审查** | review, 审查 | GuanYu | GuanPing, ZhouCang |
| **实验任务** | 探索, 原型, 攻坚 | MaChao | PangDe, MaDai |
| **信息整理** | 文档, 汇总 | SimaYi | SimaZhao |
| **测试** | 测试, test, 单元测试 | XuShu | PangLin, YanYan |
| **监控诊断** | 监控, 日志, 诊断 | ManChong | ChengYu, JiaXu |

## 🧮 费用对比

```
传统单模型方案:
  4 × ultimate (1.6x) = 6.4x

UltraWork SanGuo 方案 (25位将领):
  - 主帅调度: 诸葛亮 glm-5 (0.5x)
  - 中层9将: 大都督 + 三大都督 + 质量监控 + 测试团队 + 监察团队 = 2.1x
  - 底层12将: 各部将按需调用 ≈ 0.2-0.3x/次
  典型任务组合: 3.0x (节省53%)
```

## 🛠️ 配置说明

### 模型 Key 映射 (Qoder/OpenCode 平台)

⚠️ **重要**: Qoder/OpenCode 平台使用内部 key 而非显示名称:

| 显示名称 | 正确 key | 错误写法 |
|----------|----------|----------|
| GLM-5 | `gmodel` | ~~glm-5~~ |
| Qwen3.5-Plus | `q35model` | ~~qwen3.5-plus~~ |
| Kimi-K2.5 | `kmodel` | ~~kimi-k2.5~~ |
| MiniMax-M2.5 | `mmodel` | ~~minimax-m2.5~~ |

### 配置文件示例

```typescript
// ultrawork.config.ts
export default {
  agents: {
    zhaoyun: {
      description: "执行大将 - 攻坚克难",
      model: "q35model",
      category: "deep"
    },
    simayi: {
      description: "探索谋士 - 洞察秋毫",
      model: "mmodel",
      category: "explore"
    }
  },
  categories: {
    "frontend": {
      description: "前端开发",
      primaryAgent: "zhaoyun",
      secondaryAgents: ["gaoshun"]
    }
  }
}
```

## 📊 状态栏显示

UltraWork 会在每次输出末尾显示实时状态栏:

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🏰 UltraWork 三国军团                                    [运行中] ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  📋 军令: 实现用户管理页面                                     ┃
┃  📊 总进度: [████████░░░░░░░░░░░░] 40%                        ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  🎖️ 将领状态                                                   ┃
┃  ⏸️ 诸葛亮(孔明)    ░░░░░  待命中                               ┃
┃  🔄 赵云(子龙)      ███░░░  攻城拔寨中...                        ┃
┃  ✅ 司马懿(仲达)    █████  完成                                 ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  📜 执行日志                                                   ┃
┃  [14:30:01] 📋 收到军令                                        ┃
┃  [14:30:02] ⚔️  赵云(子龙) 出征: 实现功能                       ┃
┃  [14:30:15] ✅ 赵云(子龙) 凯旋                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

## 🔌 支持的平台

- ✅ **OpenCode** - 原生插件支持（推荐）
- ✅ **Qoder** - 通过插件系统
- ✅ **Claude Code** - 通过 SKILL.md
- ✅ **其他 AI 编辑器** - 通过 npm 包集成

## 📝 API 参考

### 工具调用

```typescript
// 使用 ultrawork_task 工具
{
  "description": "任务描述",
  "prompt": "详细的任务内容",
  "category": "任务类别 (可选)",
  "agent": "指定将领 (可选)"
}
```

### @提及语法

在 prompt 中使用 `@将领名` 直接指定将领:

```
@zhaoyun 实现用户管理功能
@simayi 搜索数据库相关代码
@zhouyu 设计一个缓存架构
```

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤:

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

[MIT License](LICENSE) © UltraWork Team

## 🔗 相关链接

- [GitHub 仓库](https://github.com/paskaa/ultrawork-sanguo)
- [npm 包](https://www.npmjs.com/package/ultrawork-sanguo)
- [问题反馈](https://github.com/paskaa/ultrawork-sanguo/issues)

---

<p align="center">
  <i>鞠躬尽瘁，死而后已</i><br>
  <i>UltraWork - 让 AI 协作更高效</i>
</p>
