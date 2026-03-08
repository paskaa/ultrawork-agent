# UltraWork 三国军团 - 模型 Key 获取指引

## ⚠️ 重要提示

Qoder/OpenCode 平台使用**内部 Key**而非显示名称，配置时必须使用正确的 Key！

## 模型 Key 对照表

| 显示名称 | 内部 Key | 平台 | 费用倍率 |
|----------|----------|------|----------|
| GLM-5 | `gmodel` | 智谱 AI | 0.5x |
| Qwen3.5-Plus | `q35model` | 阿里云 | 0.2x |
| Kimi-K2.5 | `kmodel` | 月之暗面 | 0.3x |
| MiniMax-M2.5 | `mmodel` | MiniMax | 0.2x |

## 获取方式

### 方式一：通过平台界面获取

1. 打开 Qoder/OpenCode 设置
2. 进入「模型配置」或「API 配置」
3. 查看已配置的模型列表
4. 记录每个模型对应的内部 Key

### 方式二：通过配置文件获取

查找以下位置的配置文件：
- `~/.qoder/config.json`
- `~/.opencode/config.json`
- 项目根目录的 `.opencode.json`

### 方式三：使用命令查看

```bash
# 查看当前配置的模型
ultrawork detect
```

## 费用说明

费用倍率是相对于平台基础价格的倍数：

| 模型 | 倍率 | 说明 |
|------|------|------|
| `gmodel` (GLM-5) | 0.5x | 智谱旗舰模型，适合调度决策 |
| `kmodel` (Kimi-K2.5) | 0.3x | 月之暗面，擅长复杂推理 |
| `q35model` (Qwen3.5-Plus) | 0.2x | 阿里云，编程能力强 |
| `mmodel` (MiniMax-M2.5) | 0.2x | MiniMax，性价比高 |

## 推荐配置

### 经济型配置
```json
{
  "agents": {
    "zhugeliang": { "model": "gmodel" },
    "zhaoyun": { "model": "q35model" },
    "simayi": { "model": "mmodel" }
  }
}
```

### 均衡型配置
```json
{
  "agents": {
    "zhugeliang": { "model": "gmodel" },
    "zhouyu": { "model": "gmodel" },
    "zhaoyun": { "model": "q35model" },
    "simayi": { "model": "mmodel" },
    "simazhao": { "model": "kmodel" }
  }
}
```

## 常见问题

### Q: 配置后不生效怎么办？
A: 检查是否使用了正确的内部 Key，不要使用显示名称。

### Q: 如何切换模型？
A: 修改配置文件中对应 agent 的 `model` 字段，保存后重新加载。

### Q: 可以自定义模型吗？
A: 可以在平台设置中添加自定义模型，然后在配置中使用其内部 Key。

## 更新日志

- 2026-03-08: 初始版本
