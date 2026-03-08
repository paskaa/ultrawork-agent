"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ROUTING_RULES = exports.DEFAULT_CATEGORIES = exports.DEFAULT_AGENTS = exports.UltraWorkSanguoConfigSchema = exports.UltraworkConfigSchema = exports.RuntimeFallbackConfigSchema = exports.BackgroundTaskConfigSchema = exports.TaskRoutingRuleSchema = exports.CategoryConfigSchema = exports.AgentConfigSchema = void 0;
const zod_1 = require("zod");
exports.AgentConfigSchema = zod_1.z.object({
    model: zod_1.z.string().optional(),
    fallback_models: zod_1.z.array(zod_1.z.string()).optional(),
    temperature: zod_1.z.number().min(0).max(2).optional(),
    variant: zod_1.z.enum(["max", "high", "medium", "low", "xhigh"]).optional(),
    description: zod_1.z.string().optional(),
    role: zod_1.z.string().optional(),
    categories: zod_1.z.array(zod_1.z.string()).optional(),
    prompt_append: zod_1.z.string().optional(),
    disable: zod_1.z.boolean().optional(),
});
exports.CategoryConfigSchema = zod_1.z.object({
    model: zod_1.z.string().optional(),
    fallback_models: zod_1.z.array(zod_1.z.string()).optional(),
    variant: zod_1.z.enum(["max", "high", "medium", "low", "xhigh"]).optional(),
    description: zod_1.z.string().optional(),
    keywords: zod_1.z.array(zod_1.z.string()).optional(),
    primaryAgent: zod_1.z.string().optional(),
    supportAgents: zod_1.z.array(zod_1.z.string()).optional(),
    temperature: zod_1.z.number().min(0).max(2).optional(),
});
exports.TaskRoutingRuleSchema = zod_1.z.object({
    condition: zod_1.z.string(),
    category: zod_1.z.string(),
    primary_agent: zod_1.z.string(),
    support_agents: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.BackgroundTaskConfigSchema = zod_1.z.object({
    defaultConcurrency: zod_1.z.number().optional(),
    staleTimeoutMs: zod_1.z.number().optional(),
    providerConcurrency: zod_1.z.record(zod_1.z.string(), zod_1.z.number()).optional(),
    modelConcurrency: zod_1.z.record(zod_1.z.string(), zod_1.z.number()).optional(),
});
exports.RuntimeFallbackConfigSchema = zod_1.z.object({
    enabled: zod_1.z.boolean().optional(),
    retry_on_errors: zod_1.z.array(zod_1.z.number()).optional(),
    max_fallback_attempts: zod_1.z.number().optional(),
    cooldown_seconds: zod_1.z.number().optional(),
    notify_on_fallback: zod_1.z.boolean().optional(),
});
exports.UltraworkConfigSchema = zod_1.z.object({
    triggers: zod_1.z.array(zod_1.z.string()).optional(),
    default_orchestrator: zod_1.z.string().optional(),
    auto_category_detection: zod_1.z.boolean().optional(),
    parallel_execution: zod_1.z.boolean().optional(),
    max_concurrent_agents: zod_1.z.number().optional(),
    progress_reporting: zod_1.z.boolean().optional(),
});
exports.UltraWorkSanguoConfigSchema = zod_1.z.object({
    $schema: zod_1.z.string().optional(),
    agents: zod_1.z.record(zod_1.z.string(), exports.AgentConfigSchema).optional(),
    categories: zod_1.z.record(zod_1.z.string(), exports.CategoryConfigSchema).optional(),
    task_routing: zod_1.z.object({
        rules: zod_1.z.array(exports.TaskRoutingRuleSchema).optional(),
        default_category: zod_1.z.string().optional(),
        default_agent: zod_1.z.string().optional(),
    }).optional(),
    background_task: exports.BackgroundTaskConfigSchema.optional(),
    runtime_fallback: exports.RuntimeFallbackConfigSchema.optional(),
    provider_priority: zod_1.z.record(zod_1.z.string(), zod_1.z.number()).optional(),
    ultrawork: exports.UltraworkConfigSchema.optional(),
    disabled_agents: zod_1.z.array(zod_1.z.string()).optional(),
    disabled_categories: zod_1.z.array(zod_1.z.string()).optional(),
});
// 19将领完整配置 - bailian 模型
exports.DEFAULT_AGENTS = {
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
};
exports.DEFAULT_CATEGORIES = {
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
};
exports.DEFAULT_ROUTING_RULES = [
    { condition: "contains(['UI', 'Vue', '前端', '组件', '页面'], task)", category: "visual-engineering", primary_agent: "zhaoyun", support_agents: ["gaoshun", "simayi"] },
    { condition: "contains(['重构', '架构', '实现', '开发', '模块'], task)", category: "deep", primary_agent: "zhaoyun", support_agents: ["simayi", "chendao"] },
    { condition: "contains(['修复', 'bug', 'fix', '修改', '问题'], task)", category: "quick", primary_agent: "zhangfei", support_agents: ["leixu", "wulan"] },
    { condition: "contains(['设计', '方案', '决策', '规划', '架构'], task)", category: "ultrabrain", primary_agent: "zhouyu", support_agents: ["lusu", "huanggai"] },
    { condition: "contains(['review', '审查', '检查', '质量'], task)", category: "review", primary_agent: "guanyu", support_agents: ["guanping", "zhoucang"] },
    { condition: "contains(['搜索', '查找', '定位', 'find', 'search'], task)", category: "explore", primary_agent: "simayi", support_agents: ["simashi"] },
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZW1hLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbmZpZy9zY2hlbWEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkJBQXVCO0FBRVYsUUFBQSxpQkFBaUIsR0FBRyxPQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3hDLEtBQUssRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQzVCLGVBQWUsRUFBRSxPQUFDLENBQUMsS0FBSyxDQUFDLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRTtJQUMvQyxXQUFXLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFO0lBQ2hELE9BQU8sRUFBRSxPQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFO0lBQ3JFLFdBQVcsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ2xDLElBQUksRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQzNCLFVBQVUsRUFBRSxPQUFDLENBQUMsS0FBSyxDQUFDLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRTtJQUMxQyxhQUFhLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUNwQyxPQUFPLEVBQUUsT0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBRTtDQUNoQyxDQUFDLENBQUE7QUFFVyxRQUFBLG9CQUFvQixHQUFHLE9BQUMsQ0FBQyxNQUFNLENBQUM7SUFDM0MsS0FBSyxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFD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QztLQUNuQztDQUNGLENBQUE7QUFFWSxRQUFBLHFCQUFxQixHQUFzQjtJQUN0RCxFQUFFLFNBQVMsRUFBRSxpREFBaUQsRUFBRSxRQUFRLEVBQUUsb0JBQW9CLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLEVBQUU7SUFDakssRUFBRSxTQUFTLEVBQUUsZ0RBQWdELEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsRUFBRTtJQUNsSixFQUFFLFNBQVMsRUFBRSxrREFBa0QsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxFQUFFO0lBQ25KLEVBQUUsU0FBUyxFQUFFLGdEQUFnRCxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLEVBQUU7SUFDdEosRUFBRSxTQUFTLEVBQUUsOENBQThDLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsRUFBRTtJQUNwSixFQUFFLFNBQVMsRUFBRSxzREFBc0QsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUU7Q0FDakosQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHogfSBmcm9tIFwiem9kXCJcblxuZXhwb3J0IGNvbnN0IEFnZW50Q29uZmlnU2NoZW1hID0gei5vYmplY3Qoe1xuICBtb2RlbDogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICBmYWxsYmFja19tb2RlbHM6IHouYXJyYXkoei5zdHJpbmcoKSkub3B0aW9uYWwoKSxcbiAgdGVtcGVyYXR1cmU6IHoubnVtYmVyKCkubWluKDApLm1heCgyKS5vcHRpb25hbCgpLFxuICB2YXJpYW50OiB6LmVudW0oW1wibWF4XCIsIFwiaGlnaFwiLCBcIm1lZGl1bVwiLCBcImxvd1wiLCBcInhoaWdoXCJdKS5vcHRpb25hbCgpLFxuICBkZXNjcmlwdGlvbjogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICByb2xlOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gIGNhdGVnb3JpZXM6IHouYXJyYXkoei5zdHJpbmcoKSkub3B0aW9uYWwoKSxcbiAgcHJvbXB0X2FwcGVuZDogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICBkaXNhYmxlOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLFxufSlcblxuZXhwb3J0IGNvbnN0IENhdGVnb3J5Q29uZmlnU2NoZW1hID0gei5vYmplY3Qoe1xuICBtb2RlbDogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICBmYWxsYmFja19tb2RlbHM6IHouYXJyYXkoei5zdHJpbmcoKSkub3B0aW9uYWwoKSxcbiAgdmFyaWFudDogei5lbnVtKFtcIm1heFwiLCBcImhpZ2hcIiwgXCJtZWRpdW1cIiwgXCJsb3dcIiwgXCJ4aGlnaFwiXSkub3B0aW9uYWwoKSxcbiAgZGVzY3JpcHRpb246IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAga2V5d29yZHM6IHouYXJyYXkoei5zdHJpbmcoKSkub3B0aW9uYWwoKSxcbiAgcHJpbWFyeUFnZW50OiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gIHN1cHBvcnRBZ2VudHM6IHouYXJyYXkoei5zdHJpbmcoKSkub3B0aW9uYWwoKSxcbiAgdGVtcGVyYXR1cmU6IHoubnVtYmVyKCkubWluKDApLm1heCgyKS5vcHRpb25hbCgpLFxufSlcblxuZXhwb3J0IGNvbnN0IFRhc2tSb3V0aW5nUnVsZVNjaGVtYSA9IHoub2JqZWN0KHtcbiAgY29uZGl0aW9uOiB6LnN0cmluZygpLFxuICBjYXRlZ29yeTogei5zdHJpbmcoKSxcbiAgcHJpbWFyeV9hZ2VudDogei5zdHJpbmcoKSxcbiAgc3VwcG9ydF9hZ2VudHM6IHouYXJyYXkoei5zdHJpbmcoKSkub3B0aW9uYWwoKSxcbn0pXG5cbmV4cG9ydCBjb25zdCBCYWNrZ3JvdW5kVGFza0NvbmZpZ1NjaGVtYSA9IHoub2JqZWN0KHtcbiAgZGVmYXVsdENvbmN1cnJlbmN5OiB6Lm51bWJlcigpLm9wdGlvbmFsKCksXG4gIHN0YWxlVGltZW91dE1zOiB6Lm51bWJlcigpLm9wdGlvbmFsKCksXG4gIHByb3ZpZGVyQ29uY3VycmVuY3k6IHoucmVjb3JkKHouc3RyaW5nKCksIHoubnVtYmVyKCkpLm9wdGlvbmFsKCksXG4gIG1vZGVsQ29uY3VycmVuY3k6IHoucmVjb3JkKHouc3RyaW5nKCksIHoubnVtYmVyKCkpLm9wdGlvbmFsKCksXG59KVxuXG5leHBvcnQgY29uc3QgUnVudGltZUZhbGxiYWNrQ29uZmlnU2NoZW1hID0gei5vYmplY3Qoe1xuICBlbmFibGVkOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLFxuICByZXRyeV9vbl9lcnJvcnM6IHouYXJyYXkoei5udW1iZXIoKSkub3B0aW9uYWwoKSxcbiAgbWF4X2ZhbGxiYWNrX2F0dGVtcHRzOiB6Lm51bWJlcigpLm9wdGlvbmFsKCksXG4gIGNvb2xkb3duX3NlY29uZHM6IHoubnVtYmVyKCkub3B0aW9uYWwoKSxcbiAgbm90aWZ5X29uX2ZhbGxiYWNrOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLFxufSlcblxuZXhwb3J0IGNvbnN0IFVsdHJhd29ya0NvbmZpZ1NjaGVtYSA9IHoub2JqZWN0KHtcbiAgdHJpZ2dlcnM6IHouYXJyYXkoei5zdHJpbmcoKSkub3B0aW9uYWwoKSxcbiAgZGVmYXVsdF9vcmNoZXN0cmF0b3I6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgYXV0b19jYXRlZ29yeV9kZXRlY3Rpb246IHouYm9vbGVhbigpLm9wdGlvbmFsKCksXG4gIHBhcmFsbGVsX2V4ZWN1dGlvbjogei5ib29sZWFuKCkub3B0aW9uYWwoKSxcbiAgbWF4X2NvbmN1cnJlbnRfYWdlbnRzOiB6Lm51bWJlcigpLm9wdGlvbmFsKCksXG4gIHByb2dyZXNzX3JlcG9ydGluZzogei5ib29sZWFuKCkub3B0aW9uYWwoKSxcbn0pXG5cbmV4cG9ydCBjb25zdCBVbHRyYVdvcmtTYW5ndW9Db25maWdTY2hlbWEgPSB6Lm9iamVjdCh7XG4gICRzY2hlbWE6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgYWdlbnRzOiB6LnJlY29yZCh6LnN0cmluZygpLCBBZ2VudENvbmZpZ1NjaGVtYSkub3B0aW9uYWwoKSxcbiAgY2F0ZWdvcmllczogei5yZWNvcmQoei5zdHJpbmcoKSwgQ2F0ZWdvcnlDb25maWdTY2hlbWEpLm9wdGlvbmFsKCksXG4gIHRhc2tfcm91dGluZzogei5vYmplY3Qoe1xuICAgIHJ1bGVzOiB6LmFycmF5KFRhc2tSb3V0aW5nUnVsZVNjaGVtYSkub3B0aW9uYWwoKSxcbiAgICBkZWZhdWx0X2NhdGVnb3J5OiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gICAgZGVmYXVsdF9hZ2VudDogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICB9KS5vcHRpb25hbCgpLFxuICBiYWNrZ3JvdW5kX3Rhc2s6IEJhY2tncm91bmRUYXNrQ29uZmlnU2NoZW1hLm9wdGlvbmFsKCksXG4gIHJ1bnRpbWVfZmFsbGJhY2s6IFJ1bnRpbWVGYWxsYmFja0NvbmZpZ1NjaGVtYS5vcHRpb25hbCgpLFxuICBwcm92aWRlcl9wcmlvcml0eTogei5yZWNvcmQoei5zdHJpbmcoKSwgei5udW1iZXIoKSkub3B0aW9uYWwoKSxcbiAgdWx0cmF3b3JrOiBVbHRyYXdvcmtDb25maWdTY2hlbWEub3B0aW9uYWwoKSxcbiAgZGlzYWJsZWRfYWdlbnRzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCksXG4gIGRpc2FibGVkX2NhdGVnb3JpZXM6IHouYXJyYXkoei5zdHJpbmcoKSkub3B0aW9uYWwoKSxcbn0pXG5cbmV4cG9ydCB0eXBlIEFnZW50Q29uZmlnID0gei5pbmZlcjx0eXBlb2YgQWdlbnRDb25maWdTY2hlbWE+XG5leHBvcnQgdHlwZSBDYXRlZ29yeUNvbmZpZyA9IHouaW5mZXI8dHlwZW9mIENhdGVnb3J5Q29uZmlnU2NoZW1hPlxuZXhwb3J0IHR5cGUgVGFza1JvdXRpbmdSdWxlID0gei5pbmZlcjx0eXBlb2YgVGFza1JvdXRpbmdSdWxlU2NoZW1hPlxuZXhwb3J0IHR5cGUgQmFja2dyb3VuZFRhc2tDb25maWcgPSB6LmluZmVyPHR5cGVvZiBCYWNrZ3JvdW5kVGFza0NvbmZpZ1NjaGVtYT5cbmV4cG9ydCB0eXBlIFJ1bnRpbWVGYWxsYmFja0NvbmZpZyA9IHouaW5mZXI8dHlwZW9mIFJ1bnRpbWVGYWxsYmFja0NvbmZpZ1NjaGVtYT5cbmV4cG9ydCB0eXBlIFVsdHJhd29ya0NvbmZpZyA9IHouaW5mZXI8dHlwZW9mIFVsdHJhd29ya0NvbmZpZ1NjaGVtYT5cbmV4cG9ydCB0eXBlIFVsdHJhV29ya1Nhbmd1b0NvbmZpZyA9IHouaW5mZXI8dHlwZW9mIFVsdHJhV29ya1Nhbmd1b0NvbmZpZ1NjaGVtYT5cblxuLy8gMTnlsIbpooblrozmlbTphY3nva4gLSBiYWlsaWFuIOaooeWei1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfQUdFTlRTOiBSZWNvcmQ8c3RyaW5nLCBBZ2VudENvbmZpZz4gPSB7XG4gIHpodWdlbGlhbmc6IHsgXG4gICAgbW9kZWw6IFwiYmFpbGlhbi9nbG0tNVwiLCBcbiAgICBmYWxsYmFja19tb2RlbHM6IFtcImJhaWxpYW4vcXdlbjMuNS1wbHVzXCIsIFwiYmFpbGlhbi9NaW5pTWF4LU0yLjVcIl0sXG4gICAgdGVtcGVyYXR1cmU6IDAuMSwgXG4gICAgZGVzY3JpcHRpb246IFwi6K+46JGb5LquICjlrZTmmI4pIC0g5Li75biFL+iwg+W6puWZqFwiLCBcbiAgICByb2xlOiBcIm9yY2hlc3RyYXRvclwiIFxuICB9LFxuICB6aG91eXU6IHsgXG4gICAgbW9kZWw6IFwiYmFpbGlhbi9nbG0tNVwiLCBcbiAgICBmYWxsYmFja19tb2RlbHM6IFtcImJhaWxpYW4vcXdlbjMuNS1wbHVzXCIsIFwiYmFpbGlhbi9NaW5pTWF4LU0yLjVcIl0sXG4gICAgdGVtcGVyYXR1cmU6IDAuMiwgXG4gICAgZGVzY3JpcHRpb246IFwi5ZGo55GcICjlhaznkb4pIC0g5aSn6YO9552jL+aImOeVpeinhOWIkuS4k+WutlwiLCBcbiAgICByb2xlOiBcInBsYW5uZXJcIiwgXG4gICAgY2F0ZWdvcmllczogW1widWx0cmFicmFpblwiXSBcbiAgfSxcbiAgemhhb3l1bjogeyBcbiAgICBtb2RlbDogXCJiYWlsaWFuL3F3ZW4zLjUtcGx1c1wiLCBcbiAgICBmYWxsYmFja19tb2RlbHM6IFtcImJhaWxpYW4vZ2xtLTVcIiwgXCJiYWlsaWFuL01pbmlNYXgtTTIuNVwiXSxcbiAgICB0ZW1wZXJhdHVyZTogMC4xLCBcbiAgICBkZXNjcmlwdGlvbjogXCLotbXkupEgKOWtkOm+mSkgLSDlpKflsIYv5rex5bqm5omn6KGM6ICFXCIsIFxuICAgIHJvbGU6IFwiZXhlY3V0b3JcIiwgXG4gICAgY2F0ZWdvcmllczogW1wiZGVlcFwiLCBcInZpc3VhbC1lbmdpbmVlcmluZ1wiXSBcbiAgfSxcbiAgc2ltYXlpOiB7IFxuICAgIG1vZGVsOiBcImJhaWxpYW4vTWluaU1heC1NMi41XCIsIFxuICAgIGZhbGxiYWNrX21vZGVsczogW1wiYmFpbGlhbi9xd2VuMy41LXBsdXNcIiwgXCJiYWlsaWFuL2dsbS01XCJdLFxuICAgIHRlbXBlcmF0dXJlOiAwLjIsIFxuICAgIGRlc2NyaXB0aW9uOiBcIuWPuOmprOaHvyAo5Luy6L6+KSAtIOiwi+Wjqy/mg4XmiqXlrphcIiwgXG4gICAgcm9sZTogXCJleHBsb3JlclwiLCBcbiAgICBjYXRlZ29yaWVzOiBbXCJleHBsb3JlXCJdIFxuICB9LFxuICBndWFueXU6IHsgXG4gICAgbW9kZWw6IFwiYmFpbGlhbi9xd2VuMy41LXBsdXNcIiwgXG4gICAgZmFsbGJhY2tfbW9kZWxzOiBbXCJiYWlsaWFuL2dsbS01XCIsIFwiYmFpbGlhbi9NaW5pTWF4LU0yLjVcIl0sXG4gICAgdGVtcGVyYXR1cmU6IDAuMSwgXG4gICAgZGVzY3JpcHRpb246IFwi5YWz5769ICjkupHplb8pIC0g6LSo6YeP5a6I5oqk6ICFXCIsIFxuICAgIHJvbGU6IFwicmV2aWV3ZXJcIiwgXG4gICAgY2F0ZWdvcmllczogW1wicmV2aWV3XCJdIFxuICB9LFxuICB6aGFuZ2ZlaTogeyBcbiAgICBtb2RlbDogXCJiYWlsaWFuL01pbmlNYXgtTTIuNVwiLCBcbiAgICBmYWxsYmFja19tb2RlbHM6IFtcImJhaWxpYW4vZ2xtLTVcIiwgXCJiYWlsaWFuL3F3ZW4zLjUtcGx1c1wiXSxcbiAgICB0ZW1wZXJhdHVyZTogMC4xNSwgXG4gICAgZGVzY3JpcHRpb246IFwi5byg6aOeICjnv7zlvrcpIC0g5b+r6YCf56qB5Ye76ICFXCIsIFxuICAgIHJvbGU6IFwicXVpY2tmaXhlclwiLCBcbiAgICBjYXRlZ29yaWVzOiBbXCJxdWlja1wiXSBcbiAgfSxcbiAgbHVzdTogeyBcbiAgICBtb2RlbDogXCJiYWlsaWFuL01pbmlNYXgtTTIuNVwiLCBcbiAgICBmYWxsYmFja19tb2RlbHM6IFtcImJhaWxpYW4vcXdlbjMuNS1wbHVzXCIsIFwiYmFpbGlhbi9nbG0tNVwiXSxcbiAgICB0ZW1wZXJhdHVyZTogMC4yLCBcbiAgICBkZXNjcmlwdGlvbjogXCLpsoHogoMgKOWtkOaVrCkgLSDotYTmupDop4TliJLkuJPlrrZcIiwgXG4gICAgcm9sZTogXCJyZXNvdXJjZV9wbGFubmVyXCIsIFxuICAgIGNhdGVnb3JpZXM6IFtcInVsdHJhYnJhaW5cIl0gXG4gIH0sXG4gIGh1YW5nZ2FpOiB7IFxuICAgIG1vZGVsOiBcImJhaWxpYW4vcXdlbjMuNS1wbHVzXCIsIFxuICAgIGZhbGxiYWNrX21vZGVsczogW1wiYmFpbGlhbi9nbG0tNVwiLCBcImJhaWxpYW4vTWluaU1heC1NMi41XCJdLFxuICAgIHRlbXBlcmF0dXJlOiAwLjE1LCBcbiAgICBkZXNjcmlwdGlvbjogXCLpu4Tnm5YgLSDmiafooYzokL3lnLDkuJPlrrZcIiwgXG4gICAgcm9sZTogXCJpbXBsZW1lbnRlclwiLCBcbiAgICBjYXRlZ29yaWVzOiBbXCJkZWVwXCJdIFxuICB9LFxuICBnYW9zaHVuOiB7IFxuICAgIG1vZGVsOiBcImJhaWxpYW4vcXdlbjMtY29kZXItcGx1c1wiLCBcbiAgICBmYWxsYmFja19tb2RlbHM6IFtcImJhaWxpYW4vcXdlbjMuNS1wbHVzXCIsIFwiYmFpbGlhbi9nbG0tNVwiXSxcbiAgICB0ZW1wZXJhdHVyZTogMC4xLCBcbiAgICBkZXNjcmlwdGlvbjogXCLpq5jpobogLSDliY3nq6/lvIDlj5HkuJPlrrYgKOmZt+mYteiQpee7n+mihilcIiwgXG4gICAgcm9sZTogXCJmcm9udGVuZF9zcGVjaWFsaXN0XCIsIFxuICAgIGNhdGVnb3JpZXM6IFtcInZpc3VhbC1lbmdpbmVlcmluZ1wiXSBcbiAgfSxcbiAgY2hlbmRhbzogeyBcbiAgICBtb2RlbDogXCJiYWlsaWFuL3F3ZW4zLWNvZGVyLXBsdXNcIiwgXG4gICAgZmFsbGJhY2tfbW9kZWxzOiBbXCJiYWlsaWFuL3F3ZW4zLjUtcGx1c1wiLCBcImJhaWxpYW4vZ2xtLTVcIl0sXG4gICAgdGVtcGVyYXR1cmU6IDAuMSwgXG4gICAgZGVzY3JpcHRpb246IFwi6ZmI5YiwIC0g5ZCO56uv5byA5Y+R5LiT5a62ICjnmb3ogLPlhbXnu5/pooYpXCIsIFxuICAgIHJvbGU6IFwiYmFja2VuZF9zcGVjaWFsaXN0XCIsIFxuICAgIGNhdGVnb3JpZXM6IFtcImRlZXBcIl0gXG4gIH0sXG4gIHNpbWFzaGk6IHsgXG4gICAgbW9kZWw6IFwiYmFpbGlhbi9NaW5pTWF4LU0yLjVcIiwgXG4gICAgZmFsbGJhY2tfbW9kZWxzOiBbXCJiYWlsaWFuL3F3ZW4zLjUtcGx1c1wiLCBcImJhaWxpYW4vZ2xtLTVcIl0sXG4gICAgdGVtcGVyYXR1cmU6IDAuMiwgXG4gICAgZGVzY3JpcHRpb246IFwi5Y+46ams5biIIC0g5rex5bqm5YiG5p6Q5LiT5a62XCIsIFxuICAgIHJvbGU6IFwiZGVlcF9hbmFseXN0XCIsIFxuICAgIGNhdGVnb3JpZXM6IFtcImV4cGxvcmVcIl0gXG4gIH0sXG4gIHNpbWF6aGFvOiB7IFxuICAgIG1vZGVsOiBcImJhaWxpYW4va2ltaS1rMi41XCIsIFxuICAgIGZhbGxiYWNrX21vZGVsczogW1wiYmFpbGlhbi9xd2VuMy41LXBsdXNcIiwgXCJiYWlsaWFuL01pbmlNYXgtTTIuNVwiXSxcbiAgICB0ZW1wZXJhdHVyZTogMC4xNSwgXG4gICAgZGVzY3JpcHRpb246IFwi5Y+46ams5pitIC0g5L+h5oGv5pW055CG5LiT5a62XCIsIFxuICAgIHJvbGU6IFwiaW5mb3JtYXRpb25fc3ludGhlc2l6ZXJcIiwgXG4gICAgY2F0ZWdvcmllczogW1wid3JpdGluZ1wiXSBcbiAgfSxcbiAgZ3VhbnBpbmc6IHsgXG4gICAgbW9kZWw6IFwiYmFpbGlhbi9xd2VuMy41LXBsdXNcIiwgXG4gICAgZmFsbGJhY2tfbW9kZWxzOiBbXCJiYWlsaWFuL2dsbS01XCIsIFwiYmFpbGlhbi9NaW5pTWF4LU0yLjVcIl0sXG4gICAgdGVtcGVyYXR1cmU6IDAuMSwgXG4gICAgZGVzY3JpcHRpb246IFwi5YWz5bmzIC0g5Luj56CB5a6h5p+l5LiT5a62ICjlhbPnvr3kuYnlrZApXCIsIFxuICAgIHJvbGU6IFwiY29kZV9yZXZpZXdlclwiLCBcbiAgICBjYXRlZ29yaWVzOiBbXCJyZXZpZXdcIl0gXG4gIH0sXG4gIHpob3VjYW5nOiB7IFxuICAgIG1vZGVsOiBcImJhaWxpYW4vTWluaU1heC1NMi41XCIsIFxuICAgIGZhbGxiYWNrX21vZGVsczogW1wiYmFpbGlhbi9nbG0tNVwiLCBcImJhaWxpYW4vcXdlbjMuNS1wbHVzXCJdLFxuICAgIHRlbXBlcmF0dXJlOiAwLjE1LCBcbiAgICBkZXNjcmlwdGlvbjogXCLlkajku5MgLSDlronlhajmo4Dmn6XkuJPlrrYgKOWFs+e+vemDqOWwhilcIiwgXG4gICAgcm9sZTogXCJzZWN1cml0eV9jaGVja2VyXCIsIFxuICAgIGNhdGVnb3JpZXM6IFtcInJldmlld1wiXSBcbiAgfSxcbiAgbGVpeHU6IHsgXG4gICAgbW9kZWw6IFwiYmFpbGlhbi9NaW5pTWF4LU0yLjVcIiwgXG4gICAgZmFsbGJhY2tfbW9kZWxzOiBbXCJiYWlsaWFuL2dsbS01XCIsIFwiYmFpbGlhbi9xd2VuMy41LXBsdXNcIl0sXG4gICAgdGVtcGVyYXR1cmU6IDAuMSwgXG4gICAgZGVzY3JpcHRpb246IFwi6Zu357uqIC0g5b+r6YCf5a6a5L2N5LiT5a62ICjlvKDpo57pg6jlsIYpXCIsIFxuICAgIHJvbGU6IFwicXVpY2tfbG9jYXRvclwiLCBcbiAgICBjYXRlZ29yaWVzOiBbXCJxdWlja1wiXSBcbiAgfSxcbiAgd3VsYW46IHsgXG4gICAgbW9kZWw6IFwiYmFpbGlhbi9xd2VuMy41LXBsdXNcIiwgXG4gICAgZmFsbGJhY2tfbW9kZWxzOiBbXCJiYWlsaWFuL2dsbS01XCIsIFwiYmFpbGlhbi9NaW5pTWF4LU0yLjVcIl0sXG4gICAgdGVtcGVyYXR1cmU6IDAuMTUsIFxuICAgIGRlc2NyaXB0aW9uOiBcIuWQtOWFsCAtIOWNs+aXtuS/ruWkjeS4k+WutiAo5byg6aOe6YOo5bCGKVwiLCBcbiAgICByb2xlOiBcInF1aWNrX2ZpeGVyXCIsIFxuICAgIGNhdGVnb3JpZXM6IFtcInF1aWNrXCJdIFxuICB9LFxuICBtYWNoYW86IHsgXG4gICAgbW9kZWw6IFwiYmFpbGlhbi9nbG0tNVwiLCBcbiAgICBmYWxsYmFja19tb2RlbHM6IFtcImJhaWxpYW4vcXdlbjMuNS1wbHVzXCIsIFwiYmFpbGlhbi9NaW5pTWF4LU0yLjVcIl0sXG4gICAgdGVtcGVyYXR1cmU6IDAuMiwgXG4gICAgZGVzY3JpcHRpb246IFwi6ams6LaFICjlrZ/otbcpIC0g6KW/5YeJ54yb5bCGL+WQjuWkh+WGm+Wboue7n+mihlwiLCBcbiAgICByb2xlOiBcInJlc2VydmVfY29tbWFuZGVyXCIsIFxuICAgIGNhdGVnb3JpZXM6IFtcInJlc2VydmVcIl0gXG4gIH0sXG4gIG1hZGFpOiB7IFxuICAgIG1vZGVsOiBcImJhaWxpYW4vTWluaU1heC1NMi41XCIsIFxuICAgIGZhbGxiYWNrX21vZGVsczogW1wiYmFpbGlhbi9nbG0tNVwiLCBcImJhaWxpYW4vcXdlbjMuNS1wbHVzXCJdLFxuICAgIHRlbXBlcmF0dXJlOiAwLjE1LCBcbiAgICBkZXNjcmlwdGlvbjogXCLpqazlsrEgLSDnqLPlgaXmlK/mj7TkuJPlrrYgKOmprOi2heWgguW8nylcIiwgXG4gICAgcm9sZTogXCJnZW5lcmFsX3N1cHBvcnRcIiwgXG4gICAgY2F0ZWdvcmllczogW1wicmVzZXJ2ZVwiXSBcbiAgfSxcbiAgcGFuZ2RlOiB7IFxuICAgIG1vZGVsOiBcImJhaWxpYW4vcXdlbjMuNS1wbHVzXCIsIFxuICAgIGZhbGxiYWNrX21vZGVsczogW1wiYmFpbGlhbi9nbG0tNVwiLCBcImJhaWxpYW4vTWluaU1heC1NMi41XCJdLFxuICAgIHRlbXBlcmF0dXJlOiAwLjEsIFxuICAgIGRlc2NyaXB0aW9uOiBcIuW6nuW+tyAtIOeJueauiuS7u+WKoeS4k+WutiAo5Y6f6ams6LaF6YOo5bCGKVwiLCBcbiAgICByb2xlOiBcInNwZWNpYWxfc2NvdXRcIiwgXG4gICAgY2F0ZWdvcmllczogW1wicmVzZXJ2ZVwiXSBcbiAgfSxcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQ0FURUdPUklFUzogUmVjb3JkPHN0cmluZywgQ2F0ZWdvcnlDb25maWc+ID0ge1xuICBcInZpc3VhbC1lbmdpbmVlcmluZ1wiOiB7IFxuICAgIG1vZGVsOiBcImJhaWxpYW4vcXdlbjMtY29kZXItcGx1c1wiLCBcbiAgICBmYWxsYmFja19tb2RlbHM6IFtcImJhaWxpYW4vcXdlbjMuNS1wbHVzXCIsIFwiYmFpbGlhbi9nbG0tNVwiXSxcbiAgICBkZXNjcmlwdGlvbjogXCLmlLvln47mi5Tlr6ggLSDliY3nq68vVUkvVVhcIiwgXG4gICAga2V5d29yZHM6IFtcIlVJXCIsIFwiVnVlXCIsIFwi5YmN56uvXCIsIFwi57uE5Lu2XCIsIFwi6aG16Z2iXCJdLCBcbiAgICBwcmltYXJ5QWdlbnQ6IFwiemhhb3l1blwiLFxuICAgIHN1cHBvcnRBZ2VudHM6IFtcImdhb3NodW5cIiwgXCJzaW1heWlcIl1cbiAgfSxcbiAgXCJkZWVwXCI6IHsgXG4gICAgbW9kZWw6IFwiYmFpbGlhbi9xd2VuMy1jb2Rlci1wbHVzXCIsIFxuICAgIGZhbGxiYWNrX21vZGVsczogW1wiYmFpbGlhbi9xd2VuMy41LXBsdXNcIiwgXCJiYWlsaWFuL2dsbS01XCJdLFxuICAgIGRlc2NyaXB0aW9uOiBcIua3seWFpeaVjOmYtSAtIOa3seW6puaJp+ihjFwiLCBcbiAgICBrZXl3b3JkczogW1wi6YeN5p6EXCIsIFwi5p625p6EXCIsIFwi5a6e546wXCIsIFwi5byA5Y+RXCJdLCBcbiAgICBwcmltYXJ5QWdlbnQ6IFwiemhhb3l1blwiLFxuICAgIHN1cHBvcnRBZ2VudHM6IFtcInNpbWF5aVwiLCBcImNoZW5kYW9cIl1cbiAgfSxcbiAgXCJxdWlja1wiOiB7IFxuICAgIG1vZGVsOiBcImJhaWxpYW4vTWluaU1heC1NMi41XCIsIFxuICAgIGZhbGxiYWNrX21vZGVsczogW1wiYmFpbGlhbi9nbG0tNVwiLCBcImJhaWxpYW4vcXdlbjMuNS1wbHVzXCJdLFxuICAgIGRlc2NyaXB0aW9uOiBcIumAn+aImOmAn+WGsyAtIOW/q+mAn+S/ruWkjVwiLCBcbiAgICBrZXl3b3JkczogW1wi5L+u5aSNXCIsIFwiYnVnXCIsIFwiZml4XCIsIFwi5L+u5pS5XCJdLCBcbiAgICBwcmltYXJ5QWdlbnQ6IFwiemhhbmdmZWlcIixcbiAgICBzdXBwb3J0QWdlbnRzOiBbXCJsZWl4dVwiLCBcInd1bGFuXCJdXG4gIH0sXG4gIFwidWx0cmFicmFpblwiOiB7IFxuICAgIG1vZGVsOiBcImJhaWxpYW4vZ2xtLTVcIiwgXG4gICAgZmFsbGJhY2tfbW9kZWxzOiBbXCJiYWlsaWFuL3F3ZW4zLjUtcGx1c1wiLCBcImJhaWxpYW4vTWluaU1heC1NMi41XCJdLFxuICAgIGRlc2NyaXB0aW9uOiBcIui/kOetueW4t+W5hCAtIOaImOeVpeinhOWIklwiLCBcbiAgICBrZXl3b3JkczogW1wi6K6+6K6hXCIsIFwi5pa55qGIXCIsIFwi5Yaz562WXCIsIFwi5p625p6EXCJdLCBcbiAgICBwcmltYXJ5QWdlbnQ6IFwiemhvdXl1XCIsXG4gICAgc3VwcG9ydEFnZW50czogW1wibHVzdVwiLCBcImh1YW5nZ2FpXCJdXG4gIH0sXG4gIFwicmV2aWV3XCI6IHsgXG4gICAgbW9kZWw6IFwiYmFpbGlhbi9xd2VuMy41LXBsdXNcIiwgXG4gICAgZmFsbGJhY2tfbW9kZWxzOiBbXCJiYWlsaWFuL2dsbS01XCIsIFwiYmFpbGlhbi9NaW5pTWF4LU0yLjVcIl0sXG4gICAgZGVzY3JpcHRpb246IFwi6LSo6YeP5oqK5YWzIC0g5Luj56CB5a6h5p+lXCIsIFxuICAgIGtleXdvcmRzOiBbXCJyZXZpZXdcIiwgXCLlrqHmn6VcIiwgXCLotKjph49cIl0sIFxuICAgIHByaW1hcnlBZ2VudDogXCJndWFueXVcIixcbiAgICBzdXBwb3J0QWdlbnRzOiBbXCJndWFucGluZ1wiLCBcInpob3VjYW5nXCJdXG4gIH0sXG4gIFwiZXhwbG9yZVwiOiB7IFxuICAgIG1vZGVsOiBcImJhaWxpYW4vTWluaU1heC1NMi41XCIsIFxuICAgIGZhbGxiYWNrX21vZGVsczogW1wiYmFpbGlhbi9xd2VuMy41LXBsdXNcIiwgXCJiYWlsaWFuL2dsbS01XCJdLFxuICAgIGRlc2NyaXB0aW9uOiBcIuaDheaKpeS+puWvnyAtIOS7o+eggeaOoue0olwiLCBcbiAgICBrZXl3b3JkczogW1wi5pCc57SiXCIsIFwi5p+l5om+XCIsIFwi5a6a5L2NXCIsIFwiZmluZFwiXSwgXG4gICAgcHJpbWFyeUFnZW50OiBcInNpbWF5aVwiLFxuICAgIHN1cHBvcnRBZ2VudHM6IFtcInNpbWFzaGlcIl1cbiAgfSxcbiAgXCJ3cml0aW5nXCI6IHsgXG4gICAgbW9kZWw6IFwiYmFpbGlhbi9raW1pLWsyLjVcIiwgXG4gICAgZmFsbGJhY2tfbW9kZWxzOiBbXCJiYWlsaWFuL3F3ZW4zLjUtcGx1c1wiLCBcImJhaWxpYW4vTWluaU1heC1NMi41XCJdLFxuICAgIGRlc2NyaXB0aW9uOiBcIuaWh+S5puaSsOWGmSAtIOaWh+aho+e8luWGmVwiLCBcbiAgICBrZXl3b3JkczogW1wi5paH5qGjXCIsIFwiZG9jXCIsIFwicmVhZG1lXCJdLCBcbiAgICBwcmltYXJ5QWdlbnQ6IFwic2ltYXpoYW9cIiBcbiAgfSxcbiAgXCJyZXNlcnZlXCI6IHsgXG4gICAgbW9kZWw6IFwiYmFpbGlhbi9nbG0tNVwiLCBcbiAgICBmYWxsYmFja19tb2RlbHM6IFtcImJhaWxpYW4vcXdlbjMuNS1wbHVzXCIsIFwiYmFpbGlhbi9NaW5pTWF4LU0yLjVcIl0sXG4gICAgZGVzY3JpcHRpb246IFwi5ZCO5aSH5pSv5o+0IC0g54m55q6K5Lu75YqhXCIsIFxuICAgIGtleXdvcmRzOiBbXCLnibnmropcIiwgXCLlrp7pqoxcIiwgXCLlpIfnlKhcIiwgXCLmlK/mj7RcIiwgXCJyZXNlcnZlXCJdLCBcbiAgICBwcmltYXJ5QWdlbnQ6IFwibWFjaGFvXCIsXG4gICAgc3VwcG9ydEFnZW50czogW1wibWFkYWlcIiwgXCJwYW5nZGVcIl1cbiAgfSxcbn1cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUk9VVElOR19SVUxFUzogVGFza1JvdXRpbmdSdWxlW10gPSBbXG4gIHsgY29uZGl0aW9uOiBcImNvbnRhaW5zKFsnVUknLCAnVnVlJywgJ+WJjeerrycsICfnu4Tku7YnLCAn6aG16Z2iJ10sIHRhc2spXCIsIGNhdGVnb3J5OiBcInZpc3VhbC1lbmdpbmVlcmluZ1wiLCBwcmltYXJ5X2FnZW50OiBcInpoYW95dW5cIiwgc3VwcG9ydF9hZ2VudHM6IFtcImdhb3NodW5cIiwgXCJzaW1heWlcIl0gfSxcbiAgeyBjb25kaXRpb246IFwiY29udGFpbnMoWyfph43mnoQnLCAn5p625p6EJywgJ+WunueOsCcsICflvIDlj5EnLCAn5qih5Z2XJ10sIHRhc2spXCIsIGNhdGVnb3J5OiBcImRlZXBcIiwgcHJpbWFyeV9hZ2VudDogXCJ6aGFveXVuXCIsIHN1cHBvcnRfYWdlbnRzOiBbXCJzaW1heWlcIiwgXCJjaGVuZGFvXCJdIH0sXG4gIHsgY29uZGl0aW9uOiBcImNvbnRhaW5zKFsn5L+u5aSNJywgJ2J1ZycsICdmaXgnLCAn5L+u5pS5JywgJ+mXrumimCddLCB0YXNrKVwiLCBjYXRlZ29yeTogXCJxdWlja1wiLCBwcmltYXJ5X2FnZW50OiBcInpoYW5nZmVpXCIsIHN1cHBvcnRfYWdlbnRzOiBbXCJsZWl4dVwiLCBcInd1bGFuXCJdIH0sXG4gIHsgY29uZGl0aW9uOiBcImNvbnRhaW5zKFsn6K6+6K6hJywgJ+aWueahiCcsICflhrPnrZYnLCAn6KeE5YiSJywgJ+aetuaehCddLCB0YXNrKVwiLCBjYXRlZ29yeTogXCJ1bHRyYWJyYWluXCIsIHByaW1hcnlfYWdlbnQ6IFwiemhvdXl1XCIsIHN1cHBvcnRfYWdlbnRzOiBbXCJsdXN1XCIsIFwiaHVhbmdnYWlcIl0gfSxcbiAgeyBjb25kaXRpb246IFwiY29udGFpbnMoWydyZXZpZXcnLCAn5a6h5p+lJywgJ+ajgOafpScsICfotKjph48nXSwgdGFzaylcIiwgY2F0ZWdvcnk6IFwicmV2aWV3XCIsIHByaW1hcnlfYWdlbnQ6IFwiZ3Vhbnl1XCIsIHN1cHBvcnRfYWdlbnRzOiBbXCJndWFucGluZ1wiLCBcInpob3VjYW5nXCJdIH0sXG4gIHsgY29uZGl0aW9uOiBcImNvbnRhaW5zKFsn5pCc57SiJywgJ+afpeaJvicsICflrprkvY0nLCAnZmluZCcsICdzZWFyY2gnXSwgdGFzaylcIiwgY2F0ZWdvcnk6IFwiZXhwbG9yZVwiLCBwcmltYXJ5X2FnZW50OiBcInNpbWF5aVwiLCBzdXBwb3J0X2FnZW50czogW1wic2ltYXNoaVwiXSB9LFxuXSJdfQ==