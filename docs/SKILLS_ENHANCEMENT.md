# UltraWork SanGuo - Skills Enhancement Guide

## 22位武将技能映射表

基于6大Skill合集分析，为每位武将匹配合适的Skill以提升能力。

---

## 📊 Skill 来源统计

| 来源 | Skills数量 | 特点 |
|------|-----------|------|
| anthropics/skills | 18+ | 官方出品，质量高 |
| obra/superpowers | 15+ | 开发工作流完整 |
| skills.sh (Vercel) | 8w+ | 社区最大，搜索方便 |
| everything-claude-code | 65+ | Hackathon冠军作品 |
| skillsmp.com | 8w+ | 数量最多，补充用 |
| Coze 技能商店 | - | 生产力、内容创作 |

---

## 🎯 主帅层

### 1. ZhugeLiang (诸葛亮) - 主帅/调度器

```yaml
skills:
  - name: dispatching-parallel-agents
    source: obra/superpowers
    priority: 1
    reason: 主帅需要并行调度多个将领
    
  - name: subagent-driven-development
    source: obra/superpowers
    priority: 2
    reason: 统筹子代理进行分布式开发
    
  - name: brainstorming
    source: obra/superpowers
    priority: 3
    reason: 战略决策前的头脑风暴
    
  - name: finishing-a-development-branch
    source: obra/superpowers
    priority: 4
    reason: 掌控整体开发进度和分支管理
    
  - name: continuous-learning
    source: everything-claude-code
    priority: 5
    reason: 持续学习以保持战略眼光
```

---

## ⚔️ 大将层

### 2. ZhouYu (周瑜) - 战略规划

```yaml
skills:
  - name: writing-plans
    source: obra/superpowers
    priority: 1
    
  - name: brainstorming
    source: obra/superpowers
    priority: 2
    
  - name: verification-before-completion
    source: obra/superpowers
    priority: 3
    
  - name: memory-persistence
    source: everything-claude-code
    priority: 4
```

### 3. ZhaoYun (赵云) - 深度执行

```yaml
skills:
  - name: executing-plans
    source: obra/superpowers
    priority: 1
    
  - name: test-driven-development
    source: obra/superpowers
    priority: 2
    
  - name: verification-before-completion
    source: obra/superpowers
    priority: 3
    
  - name: systematic-debugging
    source: obra/superpowers
    priority: 4
```

### 4. SimaYi (司马懿) - 情报侦察

```yaml
skills:
  - name: find-skills
    source: skills.sh
    priority: 1
    
  - name: systematic-debugging
    source: obra/superpowers
    priority: 2
    
  - name: security-scan
    source: everything-claude-code
    priority: 3
    
  - name: continuous-learning
    source: everything-claude-code
    priority: 4
```

### 5. GuanYu (关羽) - 质量守护

```yaml
skills:
  - name: requesting-code-review
    source: obra/superpowers
    priority: 1
    
  - name: receiving-code-review
    source: obra/superpowers
    priority: 2
    
  - name: security-scan
    source: everything-claude-code
    priority: 3
    
  - name: web-design-guidelines
    source: skills.sh
    priority: 4
```

### 6. ZhangFei (张飞) - 快速修复

```yaml
skills:
  - name: systematic-debugging
    source: obra/superpowers
    priority: 1
    
  - name: finishing-a-development-branch
    source: obra/superpowers
    priority: 2
    
  - name: verification-before-completion
    source: obra/superpowers
    priority: 3
    
  - name: executing-plans
    source: obra/superpowers
    priority: 4
```

### 7. XuShu (徐庶) - 测试专家

```yaml
skills:
  - name: test-driven-development
    source: obra/superpowers
    priority: 1
    
  - name: webapp-testing
    source: anthropics/skills
    priority: 2
    
  - name: verification-loop
    source: everything-claude-code
    priority: 3
    
  - name: systematic-debugging
    source: obra/superpowers
    priority: 4
```

---

## 🛡️ 部将层

### 8. GaoShun (高顺) - 前端开发专家

```yaml
skills:
  - name: frontend-design
    source: anthropics/skills
    priority: 1
    
  - name: web-design-guidelines
    source: skills.sh
    priority: 2
    
  - name: ui-ux-pro-max
    source: skills.sh
    priority: 3
    
  - name: theme-factory
    source: anthropics/skills
    priority: 4
```

### 9. ChenDao (陈到) - 后端开发专家

```yaml
skills:
  - name: mcp-builder
    source: anthropics/skills
    priority: 1
    
  - name: api-design
    source: skills.sh
    priority: 2
    
  - name: test-driven-development
    source: obra/superpowers
    priority: 3
```

### 10. LuSu (鲁肃) - 资源规划专家

```yaml
skills:
  - name: writing-plans
    source: obra/superpowers
    priority: 1
    
  - name: verification-before-completion
    source: obra/superpowers
    priority: 2
```

### 11. HuangGai (黄盖) - 执行落地专家

```yaml
skills:
  - name: executing-plans
    source: obra/superpowers
    priority: 1
    
  - name: finishing-a-development-branch
    source: obra/superpowers
    priority: 2
```

### 12. SimaShi (司马师) - 深度分析专家

```yaml
skills:
  - name: systematic-debugging
    source: obra/superpowers
    priority: 1
    
  - name: verification-loop
    source: everything-claude-code
    priority: 2
    
  - name: security-scan
    source: everything-claude-code
    priority: 3
```

### 13. SimaZhao (司马昭) - 信息整理专家

```yaml
skills:
  - name: memory-persistence
    source: everything-claude-code
    priority: 1
    
  - name: continuous-learning
    source: everything-claude-code
    priority: 2
    
  - name: xlsx
    source: anthropics/skills
    priority: 3
```

### 14. GuanPing (关平) - 代码审查专家

```yaml
skills:
  - name: requesting-code-review
    source: obra/superpowers
    priority: 1
    
  - name: receiving-code-review
    source: obra/superpowers
    priority: 2
```

### 15. ZhouCang (周仓) - 安全检查专家

```yaml
skills:
  - name: security-scan
    source: everything-claude-code
    priority: 1
    
  - name: verification-loop
    source: everything-claude-code
    priority: 2
```

### 16. LeiXu (雷绪) - 快速定位专家

```yaml
skills:
  - name: systematic-debugging
    source: obra/superpowers
    priority: 1
    
  - name: find-skills
    source: skills.sh
    priority: 2
```

### 17. WuLan (吴兰) - 即时修复专家

```yaml
skills:
  - name: systematic-debugging
    source: obra/superpowers
    priority: 1
    
  - name: verification-before-completion
    source: obra/superpowers
    priority: 2
```

### 18. PangLin (庞林) - 前端测试专家

```yaml
skills:
  - name: webapp-testing
    source: anthropics/skills
    priority: 1
    
  - name: test-driven-development
    source: obra/superpowers
    priority: 2
```

### 19. YanYan (严颜) - 后端测试专家

```yaml
skills:
  - name: test-driven-development
    source: obra/superpowers
    priority: 1
    
  - name: verification-loop
    source: everything-claude-code
    priority: 2
```

### 20. MaChao (马超) - 特殊任务专家

```yaml
skills:
  - name: subagent-driven-development
    source: obra/superpowers
    priority: 1
    
  - name: dispatching-parallel-agents
    source: obra/superpowers
    priority: 2
```

### 21. MaDai (马岱) - 稳健支援专家

```yaml
skills:
  - name: executing-plans
    source: obra/superpowers
    priority: 1
    
  - name: verification-before-completion
    source: obra/superpowers
    priority: 2
```

### 22. PangDe (庞德) - 特殊任务专家

```yaml
skills:
  - name: security-scan
    source: everything-claude-code
    priority: 1
    
  - name: verification-loop
    source: everything-claude-code
    priority: 2
```

---

## 📦 安装方法

### 方法1: 通过 skills.sh 安装

```bash
# 安装单个skill
npx skills add obra/superpowers --skill test-driven-development

# 安装多个skills
npx skills add obra/superpowers --skill brainstorming,writing-plans,executing-plans
```

### 方法2: 通过 GitHub 安装

```bash
# Clone anthropics/skills
git clone https://github.com/anthropics/skills.git

# 复制需要的skill到项目
cp -r skills/frontend-design ~/.claude/skills/
```

### 方法3: 通过 everything-claude-code 安装

```bash
# 安装插件
npm install ecc-universal

# 或使用GitHub App
# https://github.com/marketplace/ecc-tools
```

---

## 🔗 资源链接

| 资源 | 链接 |
|------|------|
| Anthropic Skills | https://github.com/anthropics/skills |
| Superpowers | https://github.com/obra/superpowers |
| skills.sh | https://skills.sh/ |
| Everything Claude Code | https://github.com/affaan-m/everything-claude-code |
| skillsmp | https://skillsmp.com/zh |
| Coze 技能商店 | https://www.coze.cn/skills |