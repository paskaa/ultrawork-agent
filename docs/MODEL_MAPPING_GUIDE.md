# UltraWork 模型映射系统指南

## 概述

UltraWork 现在使用**内部模型key系统**来管理模型配置，实现模型与供应商的解耦。这样可以在不修改武将配置的情况下，灵活切换模型供应商或模型版本。

## 核心概念

### 四层架构

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: 武将配置 (使用内部key)                              │
│  - zhugeliang: { model: "gmodel", ... }                      │
│  - simazhao: { model: "kmodel", ... }                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: 模型映射表 (model-mapping.json)                     │
│  - gmodel → bailian/glm-5                                   │
│  - kmodel → AstronCodingPlan/astron-code-latest             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: 供应商配置 (opencode.json)                          │
│  - bailian: { baseURL: "...", apiKey: "..." }               │
│  - AstronCodingPlan: { baseURL: "...", apiKey: "..." }      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 4: 实际API调用                                        │
│  - 发送到对应的供应商API端点                                  │
└─────────────────────────────────────────────────────────────┘
```

## 内部模型Key

| Key | 名称 | 供应商 | 实际模型ID | 用途 | 费用系数 |
|-----|------|--------|-----------|------|---------|
| `gmodel` | GLM-5 | bailian | glm-5 | 战略/规划 | 0.5x |
| `q35model` | Qwen3.5-Plus | bailian | qwen3.5-plus | 代码/开发 | 0.2x |
| `kmodel` | Astron Coding Plan | AstronCodingPlan | astron-code-latest | 文档/整理 | 0.3x |
| `mmodel` | MiniMax-M2.5 | bailian | MiniMax-M2.5 | 快速/探索 | 0.2x |

## 配置文件

### 1. 模型映射表 (`config/model-mapping.json`)

定义内部key到实际模型的映射关系：

```json
{
  "modelMapping": {
    "kmodel": {
      "name": "Astron Coding Plan",
      "provider": "AstronCodingPlan",
      "modelId": "astron-code-latest",
      "fullId": "AstronCodingPlan/astron-code-latest",
      "description": "长文本/文档模型",
      "costMultiplier": 0.3,
      "fallbackChain": ["gmodel", "q35model"]
    }
  }
}
```

### 2. 武将配置 (`config/ultrawork-sanguo.json`)

使用内部key配置武将：

```json
{
  "simazhao": {
    "model": "kmodel",
    "fallback_models": ["gmodel", "q35model"],
    "description": "司马昭 - 信息整理专家"
  }
}
```

### 3. 供应商配置 (`opencode.json`)

配置供应商API信息：

```json
{
  "provider": {
    "AstronCodingPlan": {
      "name": "讯飞星辰 Coding Plan",
      "baseURL": "https://maas-coding-api.cn-huabei-1.xf-yun.com/v2",
      "apiKey": "..."
    }
  }
}
```

## 切换模型供应商

### 场景1: 更换kmodel的供应商

假设要将 `kmodel` 从 AstronCodingPlan 切换到其他供应商：

1. **修改映射表** (`config/model-mapping.json`):
```json
"kmodel": {
  "provider": "new-provider",
  "modelId": "new-model-id",
  "fullId": "new-provider/new-model-id"
}
```

2. **添加供应商配置** (`opencode.json`):
```json
"new-provider": {
  "baseURL": "https://api.new-provider.com/v1",
  "apiKey": "..."
}
```

3. **完成！** 所有使用 `kmodel` 的武将自动使用新供应商。

### 场景2: 更换特定武将的模型

假设要将司马昭从 `kmodel` 改为 `q35model`：

1. **修改武将配置** (`config/ultrawork-sanguo.json`):
```json
"simazhao": {
  "model": "q35model",
  "fallback_models": ["gmodel", "mmodel"]
}
```

2. **完成！** 无需修改其他配置。

## 模型解析器

使用 `src/config/model-resolver.ts` 解析模型：

```typescript
import { resolveModel, getAgentModel, getFallbackModels } from './config/model-resolver'

// 解析内部key为实际模型ID
const modelId = resolveModel('kmodel')
// 返回: "AstronCodingPlan/astron-code-latest"

// 获取武将的实际模型
const simazhaoModel = getAgentModel('simazhao')
// 返回: "AstronCodingPlan/astron-code-latest"

// 获取fallback链
const fallbacks = getFallbackModels('kmodel')
// 返回: ["bailian/glm-5", "bailian/qwen3.5-plus"]
```

## 迁移历史

### 2024-03-13: 从百炼kimi-k2.5迁移到讯飞星辰

**变更内容:**
- 将 `bailian/kimi-k2.5` 替换为 `AstronCodingPlan/astron-code-latest`
- 引入内部模型key系统 (`kmodel`)
- 创建模型映射表配置层

**影响范围:**
- simazhao (司马昭) - 信息整理专家
- writing 类别 - 文档编写任务
- doc-updater subagent - 文档更新

**迁移命令:**
```bash
node scripts/migrate-to-model-keys.cjs
```

## 最佳实践

1. **使用内部key配置武将** - 不要直接使用完整模型ID
2. **通过映射表管理供应商** - 集中管理模型供应商信息
3. **保持fallback链合理** - 确保fallback模型功能相近
4. **备份配置** - 迁移前自动创建备份文件

## 故障排除

### 问题: 模型解析失败

**症状:** `Unknown model key: xxx`

**解决:**
1. 检查 `config/model-mapping.json` 是否包含该key
2. 确认key拼写正确
3. 运行迁移脚本更新配置

### 问题: API调用失败

**症状:** 模型解析成功但API调用失败

**解决:**
1. 检查 `opencode.json` 中的供应商配置
2. 确认API key有效
3. 检查baseURL是否正确

## 参考

- [模型映射表](../config/model-mapping.json)
- [模型解析器](../src/config/model-resolver.ts)
- [迁移脚本](../scripts/migrate-to-model-keys.cjs)
- [武将配置](../config/ultrawork-sanguo.json)
