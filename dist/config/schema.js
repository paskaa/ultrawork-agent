import { z } from "zod";
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
});
export const CategoryConfigSchema = z.object({
    model: z.string().optional(),
    fallback_models: z.array(z.string()).optional(),
    variant: z.enum(["max", "high", "medium", "low", "xhigh"]).optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    primaryAgent: z.string().optional(),
    supportAgents: z.array(z.string()).optional(),
    temperature: z.number().min(0).max(2).optional(),
});
export const TaskRoutingRuleSchema = z.object({
    condition: z.string(),
    category: z.string(),
    primary_agent: z.string(),
    support_agents: z.array(z.string()).optional(),
});
export const BackgroundTaskConfigSchema = z.object({
    defaultConcurrency: z.number().optional(),
    staleTimeoutMs: z.number().optional(),
    providerConcurrency: z.record(z.string(), z.number()).optional(),
    modelConcurrency: z.record(z.string(), z.number()).optional(),
});
export const RuntimeFallbackConfigSchema = z.object({
    enabled: z.boolean().optional(),
    retry_on_errors: z.array(z.number()).optional(),
    max_fallback_attempts: z.number().optional(),
    cooldown_seconds: z.number().optional(),
    notify_on_fallback: z.boolean().optional(),
});
export const UltraworkConfigSchema = z.object({
    triggers: z.array(z.string()).optional(),
    default_orchestrator: z.string().optional(),
    auto_category_detection: z.boolean().optional(),
    parallel_execution: z.boolean().optional(),
    max_concurrent_agents: z.number().optional(),
    progress_reporting: z.boolean().optional(),
});
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
});
// 19将领完整配置 - bailian 模型
export const DEFAULT_AGENTS = {
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
        model: "bailian/qwen3.5-plus",
        fallback_models: ["bailian/qwen3.5-plus", "bailian/glm-5"],
        temperature: 0.1,
        description: "高顺 - 前端开发专家 (陷阵营统领)",
        role: "frontend_specialist",
        categories: ["visual-engineering"]
    },
    chendao: {
        model: "bailian/qwen3.5-plus",
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
        model: "AstronCodingPlan/astron-code-latest",
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
};
export const DEFAULT_CATEGORIES = {
    "visual-engineering": {
        model: "bailian/qwen3.5-plus",
        fallback_models: ["bailian/qwen3.5-plus", "bailian/glm-5"],
        description: "攻城拔寨 - 前端/UI/UX",
        keywords: ["UI", "Vue", "前端", "组件", "页面"],
        primaryAgent: "zhaoyun",
        supportAgents: ["gaoshun", "simayi"]
    },
    "deep": {
        model: "bailian/qwen3.5-plus",
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
        model: "AstronCodingPlan/astron-code-latest",
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
};
export const DEFAULT_ROUTING_RULES = [
    { condition: "contains(['UI', 'Vue', '前端', '组件', '页面'], task)", category: "visual-engineering", primary_agent: "zhaoyun", support_agents: ["gaoshun", "simayi"] },
    { condition: "contains(['重构', '架构', '实现', '开发', '模块'], task)", category: "deep", primary_agent: "zhaoyun", support_agents: ["simayi", "chendao"] },
    { condition: "contains(['修复', 'bug', 'fix', '修改', '问题'], task)", category: "quick", primary_agent: "zhangfei", support_agents: ["leixu", "wulan"] },
    { condition: "contains(['设计', '方案', '决策', '规划', '架构'], task)", category: "ultrabrain", primary_agent: "zhouyu", support_agents: ["lusu", "huanggai"] },
    { condition: "contains(['review', '审查', '检查', '质量'], task)", category: "review", primary_agent: "guanyu", support_agents: ["guanping", "zhoucang"] },
    { condition: "contains(['搜索', '查找', '定位', 'find', 'search'], task)", category: "explore", primary_agent: "simayi", support_agents: ["simashi"] },
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZW1hLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbmZpZy9zY2hlbWEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLENBQUMsRUFBRSxNQUFNLEtBQUssQ0FBQTtBQUV2QixNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3hDLEtBQUssRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQzVCLGVBQWUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRTtJQUMvQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFO0lBQ2hELE9BQU8sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFO0lBQ3JFLFdBQVcsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ2xDLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQzNCLFVBQVUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRTtJQUMxQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUNwQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBRTtDQUNoQyxDQUFDLENBQUE7QUFFRixNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQzNDLEtB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cG9ydCBjb25zdCBBZ2VudENvbmZpZ1NjaGVtYSA9IHoub2JqZWN0KHtcbiAgbW9kZWw6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgZmFsbGJhY2tfbW9kZWxzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCksXG4gIHRlbXBlcmF0dXJlOiB6Lm51bWJlcigpLm1pbigwKS5tYXgoMikub3B0aW9uYWwoKSxcbiAgdmFyaWFudDogei5lbnVtKFtcIm1heFwiLCBcImhpZ2hcIiwgXCJtZWRpdW1cIiwgXCJsb3dcIiwgXCJ4aGlnaFwiXSkub3B0aW9uYWwoKSxcbiAgZGVzY3JpcHRpb246IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgcm9sZTogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICBjYXRlZ29yaWVzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCksXG4gIHByb21wdF9hcHBlbmQ6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgZGlzYWJsZTogei5ib29sZWFuKCkub3B0aW9uYWwoKSxcbn0pXG5cbmV4cG9ydCBjb25zdCBDYXRlZ29yeUNvbmZpZ1NjaGVtYSA9IHoub2JqZWN0KHtcbiAgbW9kZWw6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgZmFsbGJhY2tfbW9kZWxzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCksXG4gIHZhcmlhbnQ6IHouZW51bShbXCJtYXhcIiwgXCJoaWdoXCIsIFwibWVkaXVtXCIsIFwibG93XCIsIFwieGhpZ2hcIl0pLm9wdGlvbmFsKCksXG4gIGRlc2NyaXB0aW9uOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gIGtleXdvcmRzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCksXG4gIHByaW1hcnlBZ2VudDogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICBzdXBwb3J0QWdlbnRzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCksXG4gIHRlbXBlcmF0dXJlOiB6Lm51bWJlcigpLm1pbigwKS5tYXgoMikub3B0aW9uYWwoKSxcbn0pXG5cbmV4cG9ydCBjb25zdCBUYXNrUm91dGluZ1J1bGVTY2hlbWEgPSB6Lm9iamVjdCh7XG4gIGNvbmRpdGlvbjogei5zdHJpbmcoKSxcbiAgY2F0ZWdvcnk6IHouc3RyaW5nKCksXG4gIHByaW1hcnlfYWdlbnQ6IHouc3RyaW5nKCksXG4gIHN1cHBvcnRfYWdlbnRzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCksXG59KVxuXG5leHBvcnQgY29uc3QgQmFja2dyb3VuZFRhc2tDb25maWdTY2hlbWEgPSB6Lm9iamVjdCh7XG4gIGRlZmF1bHRDb25jdXJyZW5jeTogei5udW1iZXIoKS5vcHRpb25hbCgpLFxuICBzdGFsZVRpbWVvdXRNczogei5udW1iZXIoKS5vcHRpb25hbCgpLFxuICBwcm92aWRlckNvbmN1cnJlbmN5OiB6LnJlY29yZCh6LnN0cmluZygpLCB6Lm51bWJlcigpKS5vcHRpb25hbCgpLFxuICBtb2RlbENvbmN1cnJlbmN5OiB6LnJlY29yZCh6LnN0cmluZygpLCB6Lm51bWJlcigpKS5vcHRpb25hbCgpLFxufSlcblxuZXhwb3J0IGNvbnN0IFJ1bnRpbWVGYWxsYmFja0NvbmZpZ1NjaGVtYSA9IHoub2JqZWN0KHtcbiAgZW5hYmxlZDogei5ib29sZWFuKCkub3B0aW9uYWwoKSxcbiAgcmV0cnlfb25fZXJyb3JzOiB6LmFycmF5KHoubnVtYmVyKCkpLm9wdGlvbmFsKCksXG4gIG1heF9mYWxsYmFja19hdHRlbXB0czogei5udW1iZXIoKS5vcHRpb25hbCgpLFxuICBjb29sZG93bl9zZWNvbmRzOiB6Lm51bWJlcigpLm9wdGlvbmFsKCksXG4gIG5vdGlmeV9vbl9mYWxsYmFjazogei5ib29sZWFuKCkub3B0aW9uYWwoKSxcbn0pXG5cbmV4cG9ydCBjb25zdCBVbHRyYXdvcmtDb25maWdTY2hlbWEgPSB6Lm9iamVjdCh7XG4gIHRyaWdnZXJzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCksXG4gIGRlZmF1bHRfb3JjaGVzdHJhdG9yOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gIGF1dG9fY2F0ZWdvcnlfZGV0ZWN0aW9uOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLFxuICBwYXJhbGxlbF9leGVjdXRpb246IHouYm9vbGVhbigpLm9wdGlvbmFsKCksXG4gIG1heF9jb25jdXJyZW50X2FnZW50czogei5udW1iZXIoKS5vcHRpb25hbCgpLFxuICBwcm9ncmVzc19yZXBvcnRpbmc6IHouYm9vbGVhbigpLm9wdGlvbmFsKCksXG59KVxuXG5leHBvcnQgY29uc3QgVWx0cmFXb3JrU2FuZ3VvQ29uZmlnU2NoZW1hID0gei5vYmplY3Qoe1xuICAkc2NoZW1hOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gIGFnZW50czogei5yZWNvcmQoei5zdHJpbmcoKSwgQWdlbnRDb25maWdTY2hlbWEpLm9wdGlvbmFsKCksXG4gIGNhdGVnb3JpZXM6IHoucmVjb3JkKHouc3RyaW5nKCksIENhdGVnb3J5Q29uZmlnU2NoZW1hKS5vcHRpb25hbCgpLFxuICB0YXNrX3JvdXRpbmc6IHoub2JqZWN0KHtcbiAgICBydWxlczogei5hcnJheShUYXNrUm91dGluZ1J1bGVTY2hlbWEpLm9wdGlvbmFsKCksXG4gICAgZGVmYXVsdF9jYXRlZ29yeTogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICAgIGRlZmF1bHRfYWdlbnQ6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgfSkub3B0aW9uYWwoKSxcbiAgYmFja2dyb3VuZF90YXNrOiBCYWNrZ3JvdW5kVGFza0NvbmZpZ1NjaGVtYS5vcHRpb25hbCgpLFxuICBydW50aW1lX2ZhbGxiYWNrOiBSdW50aW1lRmFsbGJhY2tDb25maWdTY2hlbWEub3B0aW9uYWwoKSxcbiAgcHJvdmlkZXJfcHJpb3JpdHk6IHoucmVjb3JkKHouc3RyaW5nKCksIHoubnVtYmVyKCkpLm9wdGlvbmFsKCksXG4gIHVsdHJhd29yazogVWx0cmF3b3JrQ29uZmlnU2NoZW1hLm9wdGlvbmFsKCksXG4gIGRpc2FibGVkX2FnZW50czogei5hcnJheSh6LnN0cmluZygpKS5vcHRpb25hbCgpLFxuICBkaXNhYmxlZF9jYXRlZ29yaWVzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCksXG59KVxuXG5leHBvcnQgdHlwZSBBZ2VudENvbmZpZyA9IHouaW5mZXI8dHlwZW9mIEFnZW50Q29uZmlnU2NoZW1hPlxuZXhwb3J0IHR5cGUgQ2F0ZWdvcnlDb25maWcgPSB6LmluZmVyPHR5cGVvZiBDYXRlZ29yeUNvbmZpZ1NjaGVtYT5cbmV4cG9ydCB0eXBlIFRhc2tSb3V0aW5nUnVsZSA9IHouaW5mZXI8dHlwZW9mIFRhc2tSb3V0aW5nUnVsZVNjaGVtYT5cbmV4cG9ydCB0eXBlIEJhY2tncm91bmRUYXNrQ29uZmlnID0gei5pbmZlcjx0eXBlb2YgQmFja2dyb3VuZFRhc2tDb25maWdTY2hlbWE+XG5leHBvcnQgdHlwZSBSdW50aW1lRmFsbGJhY2tDb25maWcgPSB6LmluZmVyPHR5cGVvZiBSdW50aW1lRmFsbGJhY2tDb25maWdTY2hlbWE+XG5leHBvcnQgdHlwZSBVbHRyYXdvcmtDb25maWcgPSB6LmluZmVyPHR5cGVvZiBVbHRyYXdvcmtDb25maWdTY2hlbWE+XG5leHBvcnQgdHlwZSBVbHRyYVdvcmtTYW5ndW9Db25maWcgPSB6LmluZmVyPHR5cGVvZiBVbHRyYVdvcmtTYW5ndW9Db25maWdTY2hlbWE+XG5cbi8vIDE55bCG6aKG5a6M5pW06YWN572uIC0gYmFpbGlhbiDmqKHlnotcbmV4cG9ydCBjb25zdCBERUZBVUxUX0FHRU5UUzogUmVjb3JkPHN0cmluZywgQWdlbnRDb25maWc+ID0ge1xuICB6aHVnZWxpYW5nOiB7IFxuICAgIG1vZGVsOiBcImJhaWxpYW4vZ2xtLTVcIiwgXG4gICAgZmFsbGJhY2tfbW9kZWxzOiBbXCJiYWlsaWFuL3F3ZW4zLjUtcGx1c1wiLCBcImJhaWxpYW4vTWluaU1heC1NMi41XCJdLFxuICAgIHRlbXBlcmF0dXJlOiAwLjEsIFxuICAgIGRlc2NyaXB0aW9uOiBcIuivuOiRm+S6riAo5a2U5piOKSAtIOS4u+W4hS/osIPluqblmahcIiwgXG4gICAgcm9sZTogXCJvcmNoZXN0cmF0b3JcIiBcbiAgfSxcbiAgemhvdXl1OiB7IFxuICAgIG1vZGVsOiBcImJhaWxpYW4vZ2xtLTVcIiwgXG4gICAgZmFsbGJhY2tfbW9kZWxzOiBbXCJiYWlsaWFuL3F3ZW4zLjUtcGx1c1wiLCBcImJhaWxpYW4vTWluaU1heC1NMi41XCJdLFxuICAgIHRlbXBlcmF0dXJlOiAwLjIsIFxuICAgIGRlc2NyaXB0aW9uOiBcIuWRqOeRnCAo5YWs55G+KSAtIOWkp+mDveedoy/miJjnlaXop4TliJLkuJPlrrZcIiwgXG4gICAgcm9sZTogXCJwbGFubmVyXCIsIFxuICAgIGNhdGVnb3JpZXM6IFtcInVsdHJhYnJhaW5cIl0gXG4gIH0sXG4gIHpoYW95dW46IHsgXG4gICAgbW9kZWw6IFwiYmFpbGlhbi9xd2VuMy41LXBsdXNcIiwgXG4gICAgZmFsbGJhY2tfbW9kZWxzOiBbXCJiYWlsaWFuL2dsbS01XCIsIFwiYmFpbGlhbi9NaW5pTWF4LU0yLjVcIl0sXG4gICAgdGVtcGVyYXR1cmU6IDAuMSwgXG4gICAgZGVzY3JpcHRpb246IFwi6LW15LqRICjlrZDpvpkpIC0g5aSn5bCGL+a3seW6puaJp+ihjOiAhVwiLCBcbiAgICByb2xlOiBcImV4ZWN1dG9yXCIsIFxuICAgIGNhdGVnb3JpZXM6IFtcImRlZXBcIiwgXCJ2aXN1YWwtZW5naW5lZXJpbmdcIl0gXG4gIH0sXG4gIHNpbWF5aTogeyBcbiAgICBtb2RlbDogXCJiYWlsaWFuL01pbmlNYXgtTTIuNVwiLCBcbiAgICBmYWxsYmFja19tb2RlbHM6IFtcImJhaWxpYW4vcXdlbjMuNS1wbHVzXCIsIFwiYmFpbGlhbi9nbG0tNVwiXSxcbiAgICB0ZW1wZXJhdHVyZTogMC4yLCBcbiAgICBkZXNjcmlwdGlvbjogXCLlj7jpqazmh78gKOS7sui+vikgLSDosIvlo6sv5oOF5oql5a6YXCIsIFxuICAgIHJvbGU6IFwiZXhwbG9yZXJcIiwgXG4gICAgY2F0ZWdvcmllczogW1wiZXhwbG9yZVwiXSBcbiAgfSxcbiAgZ3Vhbnl1OiB7IFxuICAgIG1vZGVsOiBcImJhaWxpYW4vcXdlbjMuNS1wbHVzXCIsIFxuICAgIGZhbGxiYWNrX21vZGVsczogW1wiYmFpbGlhbi9nbG0tNVwiLCBcImJhaWxpYW4vTWluaU1heC1NMi41XCJdLFxuICAgIHRlbXBlcmF0dXJlOiAwLjEsIFxuICAgIGRlc2NyaXB0aW9uOiBcIuWFs+e+vSAo5LqR6ZW/KSAtIOi0qOmHj+WuiOaKpOiAhVwiLCBcbiAgICByb2xlOiBcInJldmlld2VyXCIsIFxuICAgIGNhdGVnb3JpZXM6IFtcInJldmlld1wiXSBcbiAgfSxcbiAgemhhbmdmZWk6IHsgXG4gICAgbW9kZWw6IFwiYmFpbGlhbi9NaW5pTWF4LU0yLjVcIiwgXG4gICAgZmFsbGJhY2tfbW9kZWxzOiBbXCJiYWlsaWFuL2dsbS01XCIsIFwiYmFpbGlhbi9xd2VuMy41LXBsdXNcIl0sXG4gICAgdGVtcGVyYXR1cmU6IDAuMTUsIFxuICAgIGRlc2NyaXB0aW9uOiBcIuW8oOmjniAo57+85b63KSAtIOW/q+mAn+eqgeWHu+iAhVwiLCBcbiAgICByb2xlOiBcInF1aWNrZml4ZXJcIiwgXG4gICAgY2F0ZWdvcmllczogW1wicXVpY2tcIl0gXG4gIH0sXG4gIGx1c3U6IHsgXG4gICAgbW9kZWw6IFwiYmFpbGlhbi9NaW5pTWF4LU0yLjVcIiwgXG4gICAgZmFsbGJhY2tfbW9kZWxzOiBbXCJiYWlsaWFuL3F3ZW4zLjUtcGx1c1wiLCBcImJhaWxpYW4vZ2xtLTVcIl0sXG4gICAgdGVtcGVyYXR1cmU6IDAuMiwgXG4gICAgZGVzY3JpcHRpb246IFwi6bKB6IKDICjlrZDmlawpIC0g6LWE5rqQ6KeE5YiS5LiT5a62XCIsIFxuICAgIHJvbGU6IFwicmVzb3VyY2VfcGxhbm5lclwiLCBcbiAgICBjYXRlZ29yaWVzOiBbXCJ1bHRyYWJyYWluXCJdIFxuICB9LFxuICBodWFuZ2dhaTogeyBcbiAgICBtb2RlbDogXCJiYWlsaWFuL3F3ZW4zLjUtcGx1c1wiLCBcbiAgICBmYWxsYmFja19tb2RlbHM6IFtcImJhaWxpYW4vZ2xtLTVcIiwgXCJiYWlsaWFuL01pbmlNYXgtTTIuNVwiXSxcbiAgICB0ZW1wZXJhdHVyZTogMC4xNSwgXG4gICAgZGVzY3JpcHRpb246IFwi6buE55uWIC0g5omn6KGM6JC95Zyw5LiT5a62XCIsIFxuICAgIHJvbGU6IFwiaW1wbGVtZW50ZXJcIiwgXG4gICAgY2F0ZWdvcmllczogW1wiZGVlcFwiXSBcbiAgfSxcbiAgZ2Fvc2h1bjogeyBcbiAgICBtb2RlbDogXCJiYWlsaWFuL3F3ZW4zLWNvZGVyLXBsdXNcIiwgXG4gICAgZmFsbGJhY2tfbW9kZWxzOiBbXCJiYWlsaWFuL3F3ZW4zLjUtcGx1c1wiLCBcImJhaWxpYW4vZ2xtLTVcIl0sXG4gICAgdGVtcGVyYXR1cmU6IDAuMSwgXG4gICAgZGVzY3JpcHRpb246IFwi6auY6aG6IC0g5YmN56uv5byA5Y+R5LiT5a62ICjpmbfpmLXokKXnu5/pooYpXCIsIFxuICAgIHJvbGU6IFwiZnJvbnRlbmRfc3BlY2lhbGlzdFwiLCBcbiAgICBjYXRlZ29yaWVzOiBbXCJ2aXN1YWwtZW5naW5lZXJpbmdcIl0gXG4gIH0sXG4gIGNoZW5kYW86IHsgXG4gICAgbW9kZWw6IFwiYmFpbGlhbi9xd2VuMy1jb2Rlci1wbHVzXCIsIFxuICAgIGZhbGxiYWNrX21vZGVsczogW1wiYmFpbGlhbi9xd2VuMy41LXBsdXNcIiwgXCJiYWlsaWFuL2dsbS01XCJdLFxuICAgIHRlbXBlcmF0dXJlOiAwLjEsIFxuICAgIGRlc2NyaXB0aW9uOiBcIumZiOWIsCAtIOWQjuerr+W8gOWPkeS4k+WutiAo55m96ICz5YW157uf6aKGKVwiLCBcbiAgICByb2xlOiBcImJhY2tlbmRfc3BlY2lhbGlzdFwiLCBcbiAgICBjYXRlZ29yaWVzOiBbXCJkZWVwXCJdIFxuICB9LFxuICBzaW1hc2hpOiB7IFxuICAgIG1vZGVsOiBcImJhaWxpYW4vTWluaU1heC1NMi41XCIsIFxuICAgIGZhbGxiYWNrX21vZGVsczogW1wiYmFpbGlhbi9xd2VuMy41LXBsdXNcIiwgXCJiYWlsaWFuL2dsbS01XCJdLFxuICAgIHRlbXBlcmF0dXJlOiAwLjIsIFxuICAgIGRlc2NyaXB0aW9uOiBcIuWPuOmprOW4iCAtIOa3seW6puWIhuaekOS4k+WutlwiLCBcbiAgICByb2xlOiBcImRlZXBfYW5hbHlzdFwiLCBcbiAgICBjYXRlZ29yaWVzOiBbXCJleHBsb3JlXCJdIFxuICB9LFxuICBzaW1hemhhbzogeyBcbiAgICBtb2RlbDogXCJiYWlsaWFuL2tpbWktazIuNVwiLCBcbiAgICBmYWxsYmFja19tb2RlbHM6IFtcImJhaWxpYW4vcXdlbjMuNS1wbHVzXCIsIFwiYmFpbGlhbi9NaW5pTWF4LU0yLjVcIl0sXG4gICAgdGVtcGVyYXR1cmU6IDAuMTUsIFxuICAgIGRlc2NyaXB0aW9uOiBcIuWPuOmprOaYrSAtIOS/oeaBr+aVtOeQhuS4k+WutlwiLCBcbiAgICByb2xlOiBcImluZm9ybWF0aW9uX3N5bnRoZXNpemVyXCIsIFxuICAgIGNhdGVnb3JpZXM6IFtcIndyaXRpbmdcIl0gXG4gIH0sXG4gIGd1YW5waW5nOiB7IFxuICAgIG1vZGVsOiBcImJhaWxpYW4vcXdlbjMuNS1wbHVzXCIsIFxuICAgIGZhbGxiYWNrX21vZGVsczogW1wiYmFpbGlhbi9nbG0tNVwiLCBcImJhaWxpYW4vTWluaU1heC1NMi41XCJdLFxuICAgIHRlbXBlcmF0dXJlOiAwLjEsIFxuICAgIGRlc2NyaXB0aW9uOiBcIuWFs+W5syAtIOS7o+eggeWuoeafpeS4k+WutiAo5YWz57695LmJ5a2QKVwiLCBcbiAgICByb2xlOiBcImNvZGVfcmV2aWV3ZXJcIiwgXG4gICAgY2F0ZWdvcmllczogW1wicmV2aWV3XCJdIFxuICB9LFxuICB6aG91Y2FuZzogeyBcbiAgICBtb2RlbDogXCJiYWlsaWFuL01pbmlNYXgtTTIuNVwiLCBcbiAgICBmYWxsYmFja19tb2RlbHM6IFtcImJhaWxpYW4vZ2xtLTVcIiwgXCJiYWlsaWFuL3F3ZW4zLjUtcGx1c1wiXSxcbiAgICB0ZW1wZXJhdHVyZTogMC4xNSwgXG4gICAgZGVzY3JpcHRpb246IFwi5ZGo5LuTIC0g5a6J5YWo5qOA5p+l5LiT5a62ICjlhbPnvr3pg6jlsIYpXCIsIFxuICAgIHJvbGU6IFwic2VjdXJpdHlfY2hlY2tlclwiLCBcbiAgICBjYXRlZ29yaWVzOiBbXCJyZXZpZXdcIl0gXG4gIH0sXG4gIGxlaXh1OiB7IFxuICAgIG1vZGVsOiBcImJhaWxpYW4vTWluaU1heC1NMi41XCIsIFxuICAgIGZhbGxiYWNrX21vZGVsczogW1wiYmFpbGlhbi9nbG0tNVwiLCBcImJhaWxpYW4vcXdlbjMuNS1wbHVzXCJdLFxuICAgIHRlbXBlcmF0dXJlOiAwLjEsIFxuICAgIGRlc2NyaXB0aW9uOiBcIumbt+e7qiAtIOW/q+mAn+WumuS9jeS4k+WutiAo5byg6aOe6YOo5bCGKVwiLCBcbiAgICByb2xlOiBcInF1aWNrX2xvY2F0b3JcIiwgXG4gICAgY2F0ZWdvcmllczogW1wicXVpY2tcIl0gXG4gIH0sXG4gIHd1bGFuOiB7IFxuICAgIG1vZGVsOiBcImJhaWxpYW4vcXdlbjMuNS1wbHVzXCIsIFxuICAgIGZhbGxiYWNrX21vZGVsczogW1wiYmFpbGlhbi9nbG0tNVwiLCBcImJhaWxpYW4vTWluaU1heC1NMi41XCJdLFxuICAgIHRlbXBlcmF0dXJlOiAwLjE1LCBcbiAgICBkZXNjcmlwdGlvbjogXCLlkLTlhbAgLSDljbPml7bkv67lpI3kuJPlrrYgKOW8oOmjnumDqOWwhilcIiwgXG4gICAgcm9sZTogXCJxdWlja19maXhlclwiLCBcbiAgICBjYXRlZ29yaWVzOiBbXCJxdWlja1wiXSBcbiAgfSxcbiAgbWFjaGFvOiB7IFxuICAgIG1vZGVsOiBcImJhaWxpYW4vZ2xtLTVcIiwgXG4gICAgZmFsbGJhY2tfbW9kZWxzOiBbXCJiYWlsaWFuL3F3ZW4zLjUtcGx1c1wiLCBcImJhaWxpYW4vTWluaU1heC1NMi41XCJdLFxuICAgIHRlbXBlcmF0dXJlOiAwLjIsIFxuICAgIGRlc2NyaXB0aW9uOiBcIumprOi2hSAo5a2f6LW3KSAtIOilv+WHieeMm+Wwhi/lkI7lpIflhpvlm6Lnu5/pooZcIiwgXG4gICAgcm9sZTogXCJyZXNlcnZlX2NvbW1hbmRlclwiLCBcbiAgICBjYXRlZ29yaWVzOiBbXCJyZXNlcnZlXCJdIFxuICB9LFxuICBtYWRhaTogeyBcbiAgICBtb2RlbDogXCJiYWlsaWFuL01pbmlNYXgtTTIuNVwiLCBcbiAgICBmYWxsYmFja19tb2RlbHM6IFtcImJhaWxpYW4vZ2xtLTVcIiwgXCJiYWlsaWFuL3F3ZW4zLjUtcGx1c1wiXSxcbiAgICB0ZW1wZXJhdHVyZTogMC4xNSwgXG4gICAgZGVzY3JpcHRpb246IFwi6ams5bKxIC0g56iz5YGl5pSv5o+05LiT5a62ICjpqazotoXloILlvJ8pXCIsIFxuICAgIHJvbGU6IFwiZ2VuZXJhbF9zdXBwb3J0XCIsIFxuICAgIGNhdGVnb3JpZXM6IFtcInJlc2VydmVcIl0gXG4gIH0sXG4gIHBhbmdkZTogeyBcbiAgICBtb2RlbDogXCJiYWlsaWFuL3F3ZW4zLjUtcGx1c1wiLCBcbiAgICBmYWxsYmFja19tb2RlbHM6IFtcImJhaWxpYW4vZ2xtLTVcIiwgXCJiYWlsaWFuL01pbmlNYXgtTTIuNVwiXSxcbiAgICB0ZW1wZXJhdHVyZTogMC4xLCBcbiAgICBkZXNjcmlwdGlvbjogXCLlup7lvrcgLSDnibnmrorku7vliqHkuJPlrrYgKOWOn+mprOi2hemDqOWwhilcIiwgXG4gICAgcm9sZTogXCJzcGVjaWFsX3Njb3V0XCIsIFxuICAgIGNhdGVnb3JpZXM6IFtcInJlc2VydmVcIl0gXG4gIH0sXG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0NBVEVHT1JJRVM6IFJlY29yZDxzdHJpbmcsIENhdGVnb3J5Q29uZmlnPiA9IHtcbiAgXCJ2aXN1YWwtZW5naW5lZXJpbmdcIjogeyBcbiAgICBtb2RlbDogXCJiYWlsaWFuL3F3ZW4zLWNvZGVyLXBsdXNcIiwgXG4gICAgZmFsbGJhY2tfbW9kZWxzOiBbXCJiYWlsaWFuL3F3ZW4zLjUtcGx1c1wiLCBcImJhaWxpYW4vZ2xtLTVcIl0sXG4gICAgZGVzY3JpcHRpb246IFwi5pS75Z+O5ouU5a+oIC0g5YmN56uvL1VJL1VYXCIsIFxuICAgIGtleXdvcmRzOiBbXCJVSVwiLCBcIlZ1ZVwiLCBcIuWJjeerr1wiLCBcIue7hOS7tlwiLCBcIumhtemdolwiXSwgXG4gICAgcHJpbWFyeUFnZW50OiBcInpoYW95dW5cIixcbiAgICBzdXBwb3J0QWdlbnRzOiBbXCJnYW9zaHVuXCIsIFwic2ltYXlpXCJdXG4gIH0sXG4gIFwiZGVlcFwiOiB7IFxuICAgIG1vZGVsOiBcImJhaWxpYW4vcXdlbjMtY29kZXItcGx1c1wiLCBcbiAgICBmYWxsYmFja19tb2RlbHM6IFtcImJhaWxpYW4vcXdlbjMuNS1wbHVzXCIsIFwiYmFpbGlhbi9nbG0tNVwiXSxcbiAgICBkZXNjcmlwdGlvbjogXCLmt7HlhaXmlYzpmLUgLSDmt7HluqbmiafooYxcIiwgXG4gICAga2V5d29yZHM6IFtcIumHjeaehFwiLCBcIuaetuaehFwiLCBcIuWunueOsFwiLCBcIuW8gOWPkVwiXSwgXG4gICAgcHJpbWFyeUFnZW50OiBcInpoYW95dW5cIixcbiAgICBzdXBwb3J0QWdlbnRzOiBbXCJzaW1heWlcIiwgXCJjaGVuZGFvXCJdXG4gIH0sXG4gIFwicXVpY2tcIjogeyBcbiAgICBtb2RlbDogXCJiYWlsaWFuL01pbmlNYXgtTTIuNVwiLCBcbiAgICBmYWxsYmFja19tb2RlbHM6IFtcImJhaWxpYW4vZ2xtLTVcIiwgXCJiYWlsaWFuL3F3ZW4zLjUtcGx1c1wiXSxcbiAgICBkZXNjcmlwdGlvbjogXCLpgJ/miJjpgJ/lhrMgLSDlv6vpgJ/kv67lpI1cIiwgXG4gICAga2V5d29yZHM6IFtcIuS/ruWkjVwiLCBcImJ1Z1wiLCBcImZpeFwiLCBcIuS/ruaUuVwiXSwgXG4gICAgcHJpbWFyeUFnZW50OiBcInpoYW5nZmVpXCIsXG4gICAgc3VwcG9ydEFnZW50czogW1wibGVpeHVcIiwgXCJ3dWxhblwiXVxuICB9LFxuICBcInVsdHJhYnJhaW5cIjogeyBcbiAgICBtb2RlbDogXCJiYWlsaWFuL2dsbS01XCIsIFxuICAgIGZhbGxiYWNrX21vZGVsczogW1wiYmFpbGlhbi9xd2VuMy41LXBsdXNcIiwgXCJiYWlsaWFuL01pbmlNYXgtTTIuNVwiXSxcbiAgICBkZXNjcmlwdGlvbjogXCLov5DnrbnluLfluYQgLSDmiJjnlaXop4TliJJcIiwgXG4gICAga2V5d29yZHM6IFtcIuiuvuiuoVwiLCBcIuaWueahiFwiLCBcIuWGs+etllwiLCBcIuaetuaehFwiXSwgXG4gICAgcHJpbWFyeUFnZW50OiBcInpob3V5dVwiLFxuICAgIHN1cHBvcnRBZ2VudHM6IFtcImx1c3VcIiwgXCJodWFuZ2dhaVwiXVxuICB9LFxuICBcInJldmlld1wiOiB7IFxuICAgIG1vZGVsOiBcImJhaWxpYW4vcXdlbjMuNS1wbHVzXCIsIFxuICAgIGZhbGxiYWNrX21vZGVsczogW1wiYmFpbGlhbi9nbG0tNVwiLCBcImJhaWxpYW4vTWluaU1heC1NMi41XCJdLFxuICAgIGRlc2NyaXB0aW9uOiBcIui0qOmHj+aKiuWFsyAtIOS7o+eggeWuoeafpVwiLCBcbiAgICBrZXl3b3JkczogW1wicmV2aWV3XCIsIFwi5a6h5p+lXCIsIFwi6LSo6YePXCJdLCBcbiAgICBwcmltYXJ5QWdlbnQ6IFwiZ3Vhbnl1XCIsXG4gICAgc3VwcG9ydEFnZW50czogW1wiZ3VhbnBpbmdcIiwgXCJ6aG91Y2FuZ1wiXVxuICB9LFxuICBcImV4cGxvcmVcIjogeyBcbiAgICBtb2RlbDogXCJiYWlsaWFuL01pbmlNYXgtTTIuNVwiLCBcbiAgICBmYWxsYmFja19tb2RlbHM6IFtcImJhaWxpYW4vcXdlbjMuNS1wbHVzXCIsIFwiYmFpbGlhbi9nbG0tNVwiXSxcbiAgICBkZXNjcmlwdGlvbjogXCLmg4XmiqXkvqblr58gLSDku6PnoIHmjqLntKJcIiwgXG4gICAga2V5d29yZHM6IFtcIuaQnOe0olwiLCBcIuafpeaJvlwiLCBcIuWumuS9jVwiLCBcImZpbmRcIl0sIFxuICAgIHByaW1hcnlBZ2VudDogXCJzaW1heWlcIixcbiAgICBzdXBwb3J0QWdlbnRzOiBbXCJzaW1hc2hpXCJdXG4gIH0sXG4gIFwid3JpdGluZ1wiOiB7IFxuICAgIG1vZGVsOiBcImJhaWxpYW4va2ltaS1rMi41XCIsIFxuICAgIGZhbGxiYWNrX21vZGVsczogW1wiYmFpbGlhbi9xd2VuMy41LXBsdXNcIiwgXCJiYWlsaWFuL01pbmlNYXgtTTIuNVwiXSxcbiAgICBkZXNjcmlwdGlvbjogXCLmlofkuabmkrDlhpkgLSDmlofmoaPnvJblhplcIiwgXG4gICAga2V5d29yZHM6IFtcIuaWh+aho1wiLCBcImRvY1wiLCBcInJlYWRtZVwiXSwgXG4gICAgcHJpbWFyeUFnZW50OiBcInNpbWF6aGFvXCIgXG4gIH0sXG4gIFwicmVzZXJ2ZVwiOiB7IFxuICAgIG1vZGVsOiBcImJhaWxpYW4vZ2xtLTVcIiwgXG4gICAgZmFsbGJhY2tfbW9kZWxzOiBbXCJiYWlsaWFuL3F3ZW4zLjUtcGx1c1wiLCBcImJhaWxpYW4vTWluaU1heC1NMi41XCJdLFxuICAgIGRlc2NyaXB0aW9uOiBcIuWQjuWkh+aUr+aPtCAtIOeJueauiuS7u+WKoVwiLCBcbiAgICBrZXl3b3JkczogW1wi54m55q6KXCIsIFwi5a6e6aqMXCIsIFwi5aSH55SoXCIsIFwi5pSv5o+0XCIsIFwicmVzZXJ2ZVwiXSwgXG4gICAgcHJpbWFyeUFnZW50OiBcIm1hY2hhb1wiLFxuICAgIHN1cHBvcnRBZ2VudHM6IFtcIm1hZGFpXCIsIFwicGFuZ2RlXCJdXG4gIH0sXG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1JPVVRJTkdfUlVMRVM6IFRhc2tSb3V0aW5nUnVsZVtdID0gW1xuICB7IGNvbmRpdGlvbjogXCJjb250YWlucyhbJ1VJJywgJ1Z1ZScsICfliY3nq68nLCAn57uE5Lu2JywgJ+mhtemdoiddLCB0YXNrKVwiLCBjYXRlZ29yeTogXCJ2aXN1YWwtZW5naW5lZXJpbmdcIiwgcHJpbWFyeV9hZ2VudDogXCJ6aGFveXVuXCIsIHN1cHBvcnRfYWdlbnRzOiBbXCJnYW9zaHVuXCIsIFwic2ltYXlpXCJdIH0sXG4gIHsgY29uZGl0aW9uOiBcImNvbnRhaW5zKFsn6YeN5p6EJywgJ+aetuaehCcsICflrp7njrAnLCAn5byA5Y+RJywgJ+aooeWdlyddLCB0YXNrKVwiLCBjYXRlZ29yeTogXCJkZWVwXCIsIHByaW1hcnlfYWdlbnQ6IFwiemhhb3l1blwiLCBzdXBwb3J0X2FnZW50czogW1wic2ltYXlpXCIsIFwiY2hlbmRhb1wiXSB9LFxuICB7IGNvbmRpdGlvbjogXCJjb250YWlucyhbJ+S/ruWkjScsICdidWcnLCAnZml4JywgJ+S/ruaUuScsICfpl67popgnXSwgdGFzaylcIiwgY2F0ZWdvcnk6IFwicXVpY2tcIiwgcHJpbWFyeV9hZ2VudDogXCJ6aGFuZ2ZlaVwiLCBzdXBwb3J0X2FnZW50czogW1wibGVpeHVcIiwgXCJ3dWxhblwiXSB9LFxuICB7IGNvbmRpdGlvbjogXCJjb250YWlucyhbJ+iuvuiuoScsICfmlrnmoYgnLCAn5Yaz562WJywgJ+inhOWIkicsICfmnrbmnoQnXSwgdGFzaylcIiwgY2F0ZWdvcnk6IFwidWx0cmFicmFpblwiLCBwcmltYXJ5X2FnZW50OiBcInpob3V5dVwiLCBzdXBwb3J0X2FnZW50czogW1wibHVzdVwiLCBcImh1YW5nZ2FpXCJdIH0sXG4gIHsgY29uZGl0aW9uOiBcImNvbnRhaW5zKFsncmV2aWV3JywgJ+WuoeafpScsICfmo4Dmn6UnLCAn6LSo6YePJ10sIHRhc2spXCIsIGNhdGVnb3J5OiBcInJldmlld1wiLCBwcmltYXJ5X2FnZW50OiBcImd1YW55dVwiLCBzdXBwb3J0X2FnZW50czogW1wiZ3VhbnBpbmdcIiwgXCJ6aG91Y2FuZ1wiXSB9LFxuICB7IGNvbmRpdGlvbjogXCJjb250YWlucyhbJ+aQnOe0oicsICfmn6Xmib4nLCAn5a6a5L2NJywgJ2ZpbmQnLCAnc2VhcmNoJ10sIHRhc2spXCIsIGNhdGVnb3J5OiBcImV4cGxvcmVcIiwgcHJpbWFyeV9hZ2VudDogXCJzaW1heWlcIiwgc3VwcG9ydF9hZ2VudHM6IFtcInNpbWFzaGlcIl0gfSxcbl0iXX0=