# Visual Engineering - 前端工程类别

## 类别描述

前端、UI/UX、设计相关工作。涉及用户界面开发、样式调整、交互实现等。

## 关键词

| 关键词 | 匹配权重 |
|--------|----------|
| UI | 高 |
| 界面 | 高 |
| 样式 | 高 |
| CSS | 高 |
| Vue | 高 |
| 组件 | 高 |
| 前端 | 高 |
| 页面 | 高 |
| 交互 | 中 |
| 布局 | 中 |
| element | 中 |
| 设计 | 中 |
| Element Plus | 中 |
| 按钮 | 低 |
| 表单 | 低 |
| 表格 | 低 |
| 弹窗 | 低 |
| 对话框 | 低 |

## 模型选择

| 优先级 | 模型 | 原因 |
|--------|------|------|
| 首选 | gemini-2.5-pro | 擅长视觉任务、多模态理解 |
| 备选 | glm-5 | 快速、支持中文 |

## 典型任务

### 高匹配度
- "实现用户管理页面"
- "修改登录界面样式"
- "开发数据统计图表组件"
- "调整表格布局"

### 中等匹配度
- "优化页面加载速度"
- "添加表单验证"
- "实现拖拽排序"

### 低匹配度
- "修改按钮文字"
- "调整字体大小"

## 执行策略

### 分配 Agent
- **Hephaestus**: 主要执行者
- **Explorer**: 查找现有组件和模式

### 并行策略
```
前端任务
├── Explorer: 搜索现有组件、样式规范
└── Hephaestus: 实现页面/组件
```

### 验证要点
- [ ] 功能是否完整
- [ ] 样式是否符合规范
- [ ] 交互是否流畅
- [ ] 响应式是否正常
- [ ] 是否遵循 Element Plus 规范

## OpenHIS 项目规范

### 前端技术栈
- Vue 3 + Vite
- Element Plus
- Pinia 状态管理
- Axios 请求

### 目录结构
```
openhis-ui-vue3/src/
├── views/          # 页面
│   └── [module]/
│       ├── index.vue
│       └── components/
├── components/     # 公共组件
├── api/            # API 接口
├── utils/          # 工具函数
└── assets/         # 静态资源
```

### 组件规范
```vue
<template>
  <!-- kebab-case 类名 -->
  <div class="user-management">
    <!-- Element Plus 组件 -->
  </div>
</template>

<script setup>
// Composition API
import { ref, onMounted } from 'vue'

// camelCase 变量
const userList = ref([])
</script>

<style scoped>
/* BEM 命名 */
.user-management {}
.user-management__header {}
</style>
```

## 输出模板

```markdown
## 前端开发报告

**任务**: [描述]
**类别**: visual-engineering
**模型**: [使用的模型]

### 实现内容

| 文件 | 操作 | 说明 |
|------|------|------|
| path/to/file.vue | 新增/修改 | 说明 |

### 功能清单

- [ ] 功能1
- [ ] 功能2

### 样式规范

- 遵循 Element Plus 设计规范
- 使用项目 CSS 变量

### 测试验证

1. 启动前端服务: `npm run dev`
2. 访问页面: [URL]
3. 验证功能: [步骤]
```