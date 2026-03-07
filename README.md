# UltraWork SanGuo Legion (三国军团)

🏯 **OpenCode 多智能体编排插件 - 基于 Three Kingdoms (三国) 将领体系的多模型路由系统**

## 特性

- 🎯 **19 位将领** - 每位将领有独特的职责和模型配置
- 🔄 **多模型路由** - 自动根据任务类型选择最佳模型
- ⚡ **Fallback 链** - 模型故障时自动切换备用模型
- 🎭 **三国主题** - 以三国名将命名的智能体系统

## 安装

```bash
# npm
npm install @opencode-plugin/ultrawork-sanguo

# 或在 opencode.json 中配置
{
  "plugin": ["@opencode-plugin/ultrawork-sanguo"]
}
```

## 将领列表

### 主将层 (7人)

| 将领 | 字 | 模型 | 职责 |
|------|-----|------|------|
| **ZhugeLiang** | 孔明 | glm-5 | 主帅/调度器 |
| **ZhouYu** | 公瑾 | glm-5 | 战略规划专家 |
| **ZhaoYun** | 子龙 | qwen3.5-plus | 深度执行者 |
| **SimaYi** | 仲达 | MiniMax-M2.5 | 情报官 |
| **GuanYu** | 云长 | qwen3.5-plus | 质量守护者 |
| **ZhangFei** | 翼德 | MiniMax-M2.5 | 快速突击者 |
| **MaChao** | 孟起 | glm-5 | 后备军团统领 |

### 部将层 (12人)

| 部将 | 主将 | 模型 | 职责 |
|------|------|------|------|
| LuSu | 周瑜 | MiniMax-M2.5 | 资源规划 |
| HuangGai | 周瑜 | qwen3.5-plus | 执行落地 |
| GaoShun | 赵云 | qwen3-coder-plus | 前端专家 |
| ChenDao | 赵云 | qwen3-coder-plus | 后端专家 |
| SimaShi | 司马懿 | MiniMax-M2.5 | 深度分析 |
| SimaZhao | 司马懿 | kimi-k2.5 | 信息整理 |
| GuanPing | 关羽 | qwen3.5-plus | 代码审查 |
| ZhouCang | 关羽 | MiniMax-M2.5 | 安全检查 |
| LeiXu | 张飞 | MiniMax-M2.5 | 快速定位 |
| WuLan | 张飞 | qwen3.5-plus | 即时修复 |
| MaDai | 马超 | MiniMax-M2.5 | 稳健支援 |
| PangDe | 马超 | qwen3.5-plus | 特殊任务 |

## 使用方法

### 工具调用

```
ultrawork_task(
  description="修复登录bug",
  prompt="Fix the login button not responding",
  category="quick"  // 或 agent="zhangfei"
)
```

### 任务类别

| 类别 | 描述 | 主将 | 关键词 |
|------|------|------|--------|
| `visual-engineering` | 前端/UI开发 | zhaoyun | UI, Vue, 前端 |
| `deep` | 深度执行/重构 | zhaoyun | 重构, 架构, 开发 |
| `quick` | 快速修复 | zhangfei | bug, fix, 修改 |
| `ultrabrain` | 战略规划 | zhouyu | 设计, 方案, 决策 |
| `review` | 代码审查 | guanyu | review, 审查 |
| `explore` | 代码探索 | simayi | 搜索, 查找, locate |
| `writing` | 文档撰写 | simazhao | 文档, readme |
| `reserve` | 特殊任务 | machao | 特殊, 实验 |

## 配置

在项目根目录创建 `.opencode/ultrawork-sanguo.json`：

```json
{
  "agents": {
    "zhaoyun": {
      "model": "bailian/qwen3.5-plus",
      "fallback_models": ["bailian/glm-5"],
      "description": "赵云 - 深度执行者"
    }
  },
  "categories": {
    "quick": {
      "model": "bailian/MiniMax-M2.5",
      "primaryAgent": "zhangfei"
    }
  }
}
```

## 支持的模型提供商

配置为 [bailian](https://bailian.console.aliyun.com/) 模型：

| 模型 | 说明 |
|------|------|
| `bailian/glm-5` | GLM-5 (支持思考模式) |
| `bailian/qwen3.5-plus` | Qwen3.5 Plus |
| `bailian/qwen3-coder-plus` | Qwen3 Coder Plus |
| `bailian/MiniMax-M2.5` | MiniMax M2.5 |
| `bailian/kimi-k2.5` | Kimi K2.5 |

## 开发

```bash
# 安装依赖
npm install

# 构建
npm run build

# 开发模式
npm run dev
```

## License

MIT

---

*鞠躬尽瘁，死而后已*

*将帅齐心，其利断金*