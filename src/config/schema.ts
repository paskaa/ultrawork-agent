import { z } from "zod"

export const AgentConfigSchema = z.object({
  model: z.string().optional(),
  fallback_models: z.array(z.string()).optional(),
  temperature: z.number().min(0).max(2).optional(),
  variant: z.enum(["max", "high", "medium", "low", "xhigh"]).optional(),
  description: z.string().optional(),
  role: z.string().optional(),
  categories: z.array(z.string()).optional(),
  prompt_append: z.string().optional(),
  disable: z.boolean().optional(),
})

export const CategoryConfigSchema = z.object({
  model: z.string().optional(),
  fallback_models: z.array(z.string()).optional(),
  variant: z.enum(["max", "high", "medium", "low", "xhigh"]).optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  primaryAgent: z.string().optional(),
  supportAgents: z.array(z.string()).optional(),
  temperature: z.number().min(0).max(2).optional(),
})

export const TaskRoutingRuleSchema = z.object({
  condition: z.string(),
  category: z.string(),
  primary_agent: z.string(),
  support_agents: z.array(z.string()).optional(),
})

export const BackgroundTaskConfigSchema = z.object({
  defaultConcurrency: z.number().optional(),
  staleTimeoutMs: z.number().optional(),
  providerConcurrency: z.record(z.string(), z.number()).optional(),
  modelConcurrency: z.record(z.string(), z.number()).optional(),
})

export const RuntimeFallbackConfigSchema = z.object({
  enabled: z.boolean().optional(),
  retry_on_errors: z.array(z.number()).optional(),
  max_fallback_attempts: z.number().optional(),
  cooldown_seconds: z.number().optional(),
  notify_on_fallback: z.boolean().optional(),
})

export const UltraworkConfigSchema = z.object({
  triggers: z.array(z.string()).optional(),
  default_orchestrator: z.string().optional(),
  auto_category_detection: z.boolean().optional(),
  parallel_execution: z.boolean().optional(),
  max_concurrent_agents: z.number().optional(),
  progress_reporting: z.boolean().optional(),
})

export const UltraWorkSanguoConfigSchema = z.object({
  $schema: z.string().optional(),
  agents: z.record(z.string(), AgentConfigSchema).optional(),
  categories: z.record(z.string(), CategoryConfigSchema).optional(),
  task_routing: z.object({
    rules: z.array(TaskRoutingRuleSchema).optional(),
    default_category: z.string().optional(),
    default_agent: z.string().optional(),
  }).optional(),
  background_task: BackgroundTaskConfigSchema.optional(),
  runtime_fallback: RuntimeFallbackConfigSchema.optional(),
  provider_priority: z.record(z.string(), z.number()).optional(),
  ultrawork: UltraworkConfigSchema.optional(),
  disabled_agents: z.array(z.string()).optional(),
  disabled_categories: z.array(z.string()).optional(),
})

export type AgentConfig = z.infer<typeof AgentConfigSchema>
export type CategoryConfig = z.infer<typeof CategoryConfigSchema>
export type TaskRoutingRule = z.infer<typeof TaskRoutingRuleSchema>
export type BackgroundTaskConfig = z.infer<typeof BackgroundTaskConfigSchema>
export type RuntimeFallbackConfig = z.infer<typeof RuntimeFallbackConfigSchema>
export type UltraworkConfig = z.infer<typeof UltraworkConfigSchema>
export type UltraWorkSanguoConfig = z.infer<typeof UltraWorkSanguoConfigSchema>

// 19将领完整配置 - bailian 模型
export const DEFAULT_AGENTS: Record<string, AgentConfig> = {
  zhugeliang: { 
    model: "bailian/glm-5", 
    fallback_models: ["bailian/qwen3.5-plus", "bailian/MiniMax-M2.5"],
    temperature: 0.1, 
    description: "诸葛亮 (孔明) - 主帅/调度器", 
    role: "orchestrator" 
  },
  zhouyu: { 
    model: "bailian/glm-5", 
    fallback_models: ["bailian/qwen3.5-plus", "bailian/MiniMax-M2.5"],
    temperature: 0.2, 
    description: "周瑜 (公瑾) - 大都督/战略规划专家", 
    role: "planner", 
    categories: ["ultrabrain"] 
  },
  zhaoyun: { 
    model: "bailian/qwen3.5-plus", 
    fallback_models: ["bailian/glm-5", "bailian/MiniMax-M2.5"],
    temperature: 0.1, 
    description: "赵云 (子龙) - 大将/深度执行者", 
    role: "executor", 
    categories: ["deep", "visual-engineering"] 
  },
  simayi: { 
    model: "bailian/MiniMax-M2.5", 
    fallback_models: ["bailian/qwen3.5-plus", "bailian/glm-5"],
    temperature: 0.2, 
    description: "司马懿 (仲达) - 谋士/情报官", 
    role: "explorer", 
    categories: ["explore"] 
  },
  guanyu: { 
    model: "bailian/qwen3.5-plus", 
    fallback_models: ["bailian/glm-5", "bailian/MiniMax-M2.5"],
    temperature: 0.1, 
    description: "关羽 (云长) - 质量守护者", 
    role: "reviewer", 
    categories: ["review"] 
  },
  zhangfei: { 
    model: "bailian/MiniMax-M2.5", 
    fallback_models: ["bailian/glm-5", "bailian/qwen3.5-plus"],
    temperature: 0.15, 
    description: "张飞 (翼德) - 快速突击者", 
    role: "quickfixer", 
    categories: ["quick"] 
  },
  lusu: { 
    model: "bailian/MiniMax-M2.5", 
    fallback_models: ["bailian/qwen3.5-plus", "bailian/glm-5"],
    temperature: 0.2, 
    description: "鲁肃 (子敬) - 资源规划专家", 
    role: "resource_planner", 
    categories: ["ultrabrain"] 
  },
  huanggai: { 
    model: "bailian/qwen3.5-plus", 
    fallback_models: ["bailian/glm-5", "bailian/MiniMax-M2.5"],
    temperature: 0.15, 
    description: "黄盖 - 执行落地专家", 
    role: "implementer", 
    categories: ["deep"] 
  },
  gaoshun: { 
    model: "bailian/qwen3-coder-plus", 
    fallback_models: ["bailian/qwen3.5-plus", "bailian/glm-5"],
    temperature: 0.1, 
    description: "高顺 - 前端开发专家 (陷阵营统领)", 
    role: "frontend_specialist", 
    categories: ["visual-engineering"] 
  },
  chendao: { 
    model: "bailian/qwen3-coder-plus", 
    fallback_models: ["bailian/qwen3.5-plus", "bailian/glm-5"],
    temperature: 0.1, 
    description: "陈到 - 后端开发专家 (白耳兵统领)", 
    role: "backend_specialist", 
    categories: ["deep"] 
  },
  simashi: { 
    model: "bailian/MiniMax-M2.5", 
    fallback_models: ["bailian/qwen3.5-plus", "bailian/glm-5"],
    temperature: 0.2, 
    description: "司马师 - 深度分析专家", 
    role: "deep_analyst", 
    categories: ["explore"] 
  },
  simazhao: { 
    model: "bailian/kimi-k2.5", 
    fallback_models: ["bailian/qwen3.5-plus", "bailian/MiniMax-M2.5"],
    temperature: 0.15, 
    description: "司马昭 - 信息整理专家", 
    role: "information_synthesizer", 
    categories: ["writing"] 
  },
  guanping: { 
    model: "bailian/qwen3.5-plus", 
    fallback_models: ["bailian/glm-5", "bailian/MiniMax-M2.5"],
    temperature: 0.1, 
    description: "关平 - 代码审查专家 (关羽义子)", 
    role: "code_reviewer", 
    categories: ["review"] 
  },
  zhoucang: { 
    model: "bailian/MiniMax-M2.5", 
    fallback_models: ["bailian/glm-5", "bailian/qwen3.5-plus"],
    temperature: 0.15, 
    description: "周仓 - 安全检查专家 (关羽部将)", 
    role: "security_checker", 
    categories: ["review"] 
  },
  leixu: { 
    model: "bailian/MiniMax-M2.5", 
    fallback_models: ["bailian/glm-5", "bailian/qwen3.5-plus"],
    temperature: 0.1, 
    description: "雷绪 - 快速定位专家 (张飞部将)", 
    role: "quick_locator", 
    categories: ["quick"] 
  },
  wulan: { 
    model: "bailian/qwen3.5-plus", 
    fallback_models: ["bailian/glm-5", "bailian/MiniMax-M2.5"],
    temperature: 0.15, 
    description: "吴兰 - 即时修复专家 (张飞部将)", 
    role: "quick_fixer", 
    categories: ["quick"] 
  },
  machao: { 
    model: "bailian/glm-5", 
    fallback_models: ["bailian/qwen3.5-plus", "bailian/MiniMax-M2.5"],
    temperature: 0.2, 
    description: "马超 (孟起) - 西凉猛将/后备军团统领", 
    role: "reserve_commander", 
    categories: ["reserve"] 
  },
  madai: { 
    model: "bailian/MiniMax-M2.5", 
    fallback_models: ["bailian/glm-5", "bailian/qwen3.5-plus"],
    temperature: 0.15, 
    description: "马岱 - 稳健支援专家 (马超堂弟)", 
    role: "general_support", 
    categories: ["reserve"] 
  },
  pangde: { 
    model: "bailian/qwen3.5-plus", 
    fallback_models: ["bailian/glm-5", "bailian/MiniMax-M2.5"],
    temperature: 0.1, 
    description: "庞德 - 特殊任务专家 (原马超部将)", 
    role: "special_scout", 
    categories: ["reserve"] 
  },
}

export const DEFAULT_CATEGORIES: Record<string, CategoryConfig> = {
  "visual-engineering": { 
    model: "bailian/qwen3-coder-plus", 
    fallback_models: ["bailian/qwen3.5-plus", "bailian/glm-5"],
    description: "攻城拔寨 - 前端/UI/UX", 
    keywords: ["UI", "Vue", "前端", "组件", "页面"], 
    primaryAgent: "zhaoyun",
    supportAgents: ["gaoshun", "simayi"]
  },
  "deep": { 
    model: "bailian/qwen3-coder-plus", 
    fallback_models: ["bailian/qwen3.5-plus", "bailian/glm-5"],
    description: "深入敌阵 - 深度执行", 
    keywords: ["重构", "架构", "实现", "开发"], 
    primaryAgent: "zhaoyun",
    supportAgents: ["simayi", "chendao"]
  },
  "quick": { 
    model: "bailian/MiniMax-M2.5", 
    fallback_models: ["bailian/glm-5", "bailian/qwen3.5-plus"],
    description: "速战速决 - 快速修复", 
    keywords: ["修复", "bug", "fix", "修改"], 
    primaryAgent: "zhangfei",
    supportAgents: ["leixu", "wulan"]
  },
  "ultrabrain": { 
    model: "bailian/glm-5", 
    fallback_models: ["bailian/qwen3.5-plus", "bailian/MiniMax-M2.5"],
    description: "运筹帷幄 - 战略规划", 
    keywords: ["设计", "方案", "决策", "架构"], 
    primaryAgent: "zhouyu",
    supportAgents: ["lusu", "huanggai"]
  },
  "review": { 
    model: "bailian/qwen3.5-plus", 
    fallback_models: ["bailian/glm-5", "bailian/MiniMax-M2.5"],
    description: "质量把关 - 代码审查", 
    keywords: ["review", "审查", "质量"], 
    primaryAgent: "guanyu",
    supportAgents: ["guanping", "zhoucang"]
  },
  "explore": { 
    model: "bailian/MiniMax-M2.5", 
    fallback_models: ["bailian/qwen3.5-plus", "bailian/glm-5"],
    description: "情报侦察 - 代码探索", 
    keywords: ["搜索", "查找", "定位", "find"], 
    primaryAgent: "simayi",
    supportAgents: ["simashi"]
  },
  "writing": { 
    model: "bailian/kimi-k2.5", 
    fallback_models: ["bailian/qwen3.5-plus", "bailian/MiniMax-M2.5"],
    description: "文书撰写 - 文档编写", 
    keywords: ["文档", "doc", "readme"], 
    primaryAgent: "simazhao" 
  },
  "reserve": { 
    model: "bailian/glm-5", 
    fallback_models: ["bailian/qwen3.5-plus", "bailian/MiniMax-M2.5"],
    description: "后备支援 - 特殊任务", 
    keywords: ["特殊", "实验", "备用", "支援", "reserve"], 
    primaryAgent: "machao",
    supportAgents: ["madai", "pangde"]
  },
}

export const DEFAULT_ROUTING_RULES: TaskRoutingRule[] = [
  { condition: "contains(['UI', 'Vue', '前端', '组件', '页面'], task)", category: "visual-engineering", primary_agent: "zhaoyun", support_agents: ["gaoshun", "simayi"] },
  { condition: "contains(['重构', '架构', '实现', '开发', '模块'], task)", category: "deep", primary_agent: "zhaoyun", support_agents: ["simayi", "chendao"] },
  { condition: "contains(['修复', 'bug', 'fix', '修改', '问题'], task)", category: "quick", primary_agent: "zhangfei", support_agents: ["leixu", "wulan"] },
  { condition: "contains(['设计', '方案', '决策', '规划', '架构'], task)", category: "ultrabrain", primary_agent: "zhouyu", support_agents: ["lusu", "huanggai"] },
  { condition: "contains(['review', '审查', '检查', '质量'], task)", category: "review", primary_agent: "guanyu", support_agents: ["guanping", "zhoucang"] },
  { condition: "contains(['搜索', '查找', '定位', 'find', 'search'], task)", category: "explore", primary_agent: "simayi", support_agents: ["simashi"] },
]