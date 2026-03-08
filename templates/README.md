# UltraWork 三国军团 - 配置模板说明

本目录包含用户级配置模板，用于新用户安装插件后自动生成默认配置。

## 目录结构

```
templates/
├── presets/              # 预设配置模板
│   ├── minimal.json      # 精简版 (3 位核心将领)
│   ├── standard.json     # 标准版 (9 位核心将领)
│   └── complete.json     # 完整版 (19 位全部将领)
├── MODEL_KEY_GUIDE.md    # 模型 Key 获取指引
└── README.md             # 本说明文件
```

## 预设配置说明

### minimal.json - 精简版

**适用场景**: 快速启动、简单任务、资源受限环境

**包含将领** (3 位):
| 将领 | 职责 | 模型 |
|------|------|------|
| 诸葛亮 | 主帅/调度器 | GLM-5 |
| 赵云 | 大将/执行专家 | Qwen3.5-Plus |
| 司马懿 | 谋士/探索专家 | MiniMax-M2.5 |

**特点**:
- 最小化配置，快速启动
- 覆盖基本任务类型
- 费用最低

---

### standard.json - 标准版

**适用场景**: 日常开发、一般项目

**包含将领** (9 位):
| 将领 | 职责 | 模型 | 上级 |
|------|------|------|------|
| 诸葛亮 | 主帅/调度器 | GLM-5 | - |
| 周瑜 | 大都督/战略专家 | GLM-5 | - |
| 赵云 | 大将/执行专家 | Qwen3.5-Plus | - |
| 司马懿 | 谋士/探索专家 | MiniMax-M2.5 | - |
| 鲁肃 | 方案分析专家 | MiniMax-M2.5 | 周瑜 |
| 黄盖 | 执行落地专家 | Qwen3.5-Plus | 周瑜 |
| 高顺 | 前端开发专家 | Qwen3.5-Plus | 赵云 |
| 陈到 | 后端开发专家 | Qwen3.5-Plus | 赵云 |
| 司马师 | 深度分析专家 | MiniMax-M2.5 | 司马懿 |

**特点**:
- 均衡配置，适合大多数场景
- 支持前后端并行开发
- 包含战略规划和代码探索

---

### complete.json - 完整版

**适用场景**: 大型项目、完整功能需求

**包含将领** (19 位):

**顶层 - 主帅**
| 将领 | 职责 | 模型 |
|------|------|------|
| 诸葛亮 | 主帅/调度器 | GLM-5 |

**中层 - 三大都督**
| 将领 | 职责 | 模型 |
|------|------|------|
| 周瑜 | 战略规划 | GLM-5 |
| 赵云 | 执行大将 | Qwen3.5-Plus |
| 司马懿 | 探索谋士 | MiniMax-M2.5 |

**底层 - 部将 (15 位)**
| 将领 | 职责 | 模型 | 上级 |
|------|------|------|------|
| 鲁肃 | 方案分析 | MiniMax-M2.5 | 周瑜 |
| 黄盖 | 执行落地 | Qwen3.5-Plus | 周瑜 |
| 高顺 | 前端开发 | Qwen3.5-Plus | 赵云 |
| 陈到 | 后端开发 | Qwen3.5-Plus | 赵云 |
| 关平 | 代码审查 | Qwen3.5-Plus | 赵云 |
| 司马师 | 深度分析 | MiniMax-M2.5 | 司马懿 |
| 司马昭 | 信息整理 | Kimi-K2.5 | 司马懿 |
| 关羽 | 质量守护 | Qwen3.5-Plus | - |
| 周仓 | 安全检查 | MiniMax-M2.5 | 关羽 |
| 张飞 | 快速突击 | MiniMax-M2.5 | - |
| 吴兰 | 即时修复 | Qwen3.5-Plus | 张飞 |
| 雷绪 | 快速定位 | MiniMax-M2.5 | 张飞 |
| 马超 | 后备统领 | GLM-5 | - |
| 马岱 | 稳健支援 | MiniMax-M2.5 | 马超 |
| 庞德 | 特殊任务 | Qwen3.5-Plus | 马超 |

**特点**:
- 完整功能支持
- 覆盖所有任务场景
- 包含安全审计、文档编写等专项能力

---

## 配置项说明

### agents 配置

```json
{
  "agents": {
    "zhugeliang": {
      "enabled": true,           // 是否启用
      "name": "诸葛亮",          // 将领名称
      "description": "...",      // 职责描述
      "model": "gmodel",         // 模型 Key (重要!)
      "role": "coordinator",     // 角色类型
      "tools": ["Bash", "..."],  // 可用工具
      "superior": null,          // 上级将领
      "subordinates": [...]      // 下属将领
    }
  }
}
```

### modelMapping 配置

```json
{
  "modelMapping": {
    "gmodel": {
      "name": "GLM-5",
      "provider": "智谱 AI",
      "cost": "0.5x",
      "useCase": "主帅调度、战略规划"
    }
  }
}
```

**⚠️ 重要**: 必须使用内部 Key，不能使用显示名称！

| 显示名称 | 内部 Key |
|----------|----------|
| GLM-5 | `gmodel` |
| Qwen3.5-Plus | `q35model` |
| Kimi-K2.5 | `kmodel` |
| MiniMax-M2.5 | `mmodel` |

### taskCategories 配置

```json
{
  "taskCategories": {
    "visual-engineering": {
      "description": "UI/前端任务",
      "mainAgent": "zhaoyun",
      "supportingAgents": ["gaoshun", "chendao"],
      "keywords": ["UI", "界面", "Vue", ...],
      "model": "q35model"
    }
  }
}
```

## 使用方法

### 安装后自动初始化

```bash
npm install -g ultrawork-sanguo
ultrawork-init    # 使用标准预设
```

### 手动切换预设

```bash
# 切换到精简版
ultrawork-init minimal

# 切换到完整版
ultrawork-init complete
```

### 配置升级

```bash
# 检查并升级配置
ultrawork upgrade
```

## 配置文件位置

- **主配置**: `~/.opencode/opencode.json`
- **三国配置**: `~/.opencode/ultrawork-sanguo.json`

## 模型 Key 获取

查看 `MODEL_KEY_GUIDE.md` 获取详细的模型 Key 配置指引。

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-03-08 | 初始版本 |

## 许可证

MIT License
