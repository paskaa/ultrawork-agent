# UltraWork 多平台配置指南

UltraWork 支持自动检测运行环境并加载对应的配置。

## 支持的平台

| 平台 | 检测方式 | 配置路径 |
|------|----------|----------|
| **Qoder** | `qoder` 命令或 `%APPDATA%\Qoder` 目录 | `configs/qoder/` |
| **百炼 Coding Plan** | `BAILIAN_API_KEY` 环境变量或 provider 配置 | 根目录 (config.json) |
| **Claude Code** | `CLAUDE_CODE_SESSION` 或 `ANTHROPIC_API_KEY` | `configs/qoder/` |
| **OpenCode** | `.opencode` 目录或 `OPENCODE_SESSION` | 根目录 |

## 检测优先级

1. Qoder
2. 百炼 Coding Plan
3. Claude Code
4. OpenCode
5. Default (默认配置)

## 使用方法

### 查看当前环境

```bash
node scripts/index.js detect
# 或
npm run detect
```

### 查看当前平台信息

```bash
node scripts/index.js platform
```

### 初始化配置

```bash
node scripts/env-detector.js init
# 强制覆盖
node scripts/env-detector.js init --force
```

## Qoder 平台配置

Qoder 平台使用的模型配置：

| Agent | 模型 | 用途 |
|-------|------|------|
| 诸葛亮 | Claude Sonnet 4 | 主调度器 |
| 赵云 | Claude Sonnet 4 | 深度执行 |
| 周瑜 | Claude Opus 4 | 战略规划 |
| 司马懿 | Claude Sonnet 4 | 情报收集 |
| 关羽 | Claude Sonnet 4 | 代码审查 |
| 张飞 | Claude Sonnet 4 | 快速修复 |

### 支持的模型

- **Claude 系列**: Opus 4, Sonnet 4, 3.5 Sonnet, 3.5 Haiku
- **GPT 系列**: GPT-4o, GPT-4o Mini, GPT-4 Turbo, O1, O1 Mini
- **Gemini 系列**: Gemini 2.0 Flash, Gemini 1.5 Pro
- **DeepSeek 系列**: V3, R1

## 百炼 Coding Plan 配置

百炼平台使用的国产模型：

| Agent | 模型 | 用途 |
|-------|------|------|
| 诸葛亮 | GLM-5 | 主调度器 |
| 赵云 | Qwen3 Coder Next | 深度执行 |
| 周瑜 | Qwen3 Max | 战略规划 |
| 司马懿 | Qwen3 Coder Plus | 情报收集 |
| 关羽 | Qwen3.5 Coder | 代码审查 |
| 张飞 | GLM-5 | 快速修复 |

## 配置文件结构

```
ultrawork/
├── config.json              # 默认/百炼配置
├── models.json              # 默认/百炼模型配置
├── configs/
│   └── qoder/
│       ├── config.qoder.json    # Qoder 专用配置
│       └── models.qoder.json    # Qoder 模型配置
├── scripts/
│   ├── index.js             # 主入口 (自动适配)
│   └── env-detector.js      # 环境检测器
└── ...
```

## 添加新平台配置

1. 在 `configs/` 下创建新平台目录
2. 创建 `config.<platform>.json` 和 `models.<platform>.json`
3. 在 `scripts/env-detector.js` 的 `PLATFORMS` 对象中添加检测逻辑

示例：

```javascript
newplatform: {
  name: 'New Platform',
  detect: () => {
    // 检测逻辑
    return process.env.NEW_PLATFORM === 'true';
  },
  configPath: 'configs/newplatform/config.newplatform.json',
  modelsPath: 'configs/newplatform/models.newplatform.json'
}
```
