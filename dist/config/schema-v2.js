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
// ============================================
// 新的配置系统 - 使用内部模型key
// ============================================
// 内部模型key定义
// gmodel = GLM-5 (bailian) - 战略型
// q35model = Qwen3.5-Plus (bailian) - 代码型  
// kmodel = Astron Coding Plan (AstronCodingPlan) - 文档型
// mmodel = MiniMax-M2.5 (bailian) - 快速型
// mmodel-hs = MiniMax-M2.5-highspeed (minimax) - 主帅专用高速型
// 19将领完整配置 - 使用内部模型key
export const DEFAULT_AGENTS_V2 = {
    zhugeliang: {
        model: "mmodel-hs",
        fallback_models: ["mmodel", "q35model"],
        temperature: 0.1,
        description: "诸葛亮 (孔明) - 主帅/调度器",
        role: "orchestrator"
    },
    zhouyu: {
        model: "gmodel",
        fallback_models: ["q35model", "mmodel"],
        temperature: 0.2,
        description: "周瑜 (公瑾) - 大都督/战略规划专家",
        role: "planner",
        categories: ["ultrabrain"]
    },
    zhaoyun: {
        model: "gmodel",
        fallback_models: ["q35model", "mmodel"],
        temperature: 0.1,
        description: "赵云 (子龙) - 大将/深度执行者",
        role: "executor",
        categories: ["deep", "visual-engineering"]
    },
    simayi: {
        model: "mmodel",
        fallback_models: ["q35model", "gmodel"],
        temperature: 0.2,
        description: "司马懿 (仲达) - 谋士/情报官",
        role: "explorer",
        categories: ["explore"]
    },
    guanyu: {
        model: "gmodel",
        fallback_models: ["q35model", "mmodel"],
        temperature: 0.1,
        description: "关羽 (云长) - 质量守护者",
        role: "reviewer",
        categories: ["review"]
    },
    zhangfei: {
        model: "mmodel",
        fallback_models: ["gmodel", "q35model"],
        temperature: 0.15,
        description: "张飞 (翼德) - 快速突击者",
        role: "quickfixer",
        categories: ["quick"]
    },
    lusu: {
        model: "gmodel",
        fallback_models: ["q35model", "mmodel"],
        temperature: 0.2,
        description: "鲁肃 (子敬) - 资源规划专家",
        role: "resource_planner",
        categories: ["ultrabrain"]
    },
    huanggai: {
        model: "q35model",
        fallback_models: ["gmodel", "mmodel"],
        temperature: 0.15,
        description: "黄盖 - 执行落地专家",
        role: "implementer",
        categories: ["deep"]
    },
    gaoshun: {
        model: "q35model",
        fallback_models: ["gmodel", "mmodel"],
        temperature: 0.1,
        description: "高顺 - 前端开发专家 (陷阵营统领)",
        role: "frontend_specialist",
        categories: ["visual-engineering"]
    },
    chendao: {
        model: "q35model",
        fallback_models: ["gmodel", "mmodel"],
        temperature: 0.1,
        description: "陈到 - 后端开发专家 (白耳兵统领)",
        role: "backend_specialist",
        categories: ["deep"]
    },
    simashi: {
        model: "mmodel",
        fallback_models: ["q35model", "gmodel"],
        temperature: 0.2,
        description: "司马师 - 深度分析专家",
        role: "deep_analyst",
        categories: ["explore"]
    },
    simazhao: {
        model: "kmodel",
        fallback_models: ["gmodel", "q35model"],
        temperature: 0.15,
        description: "司马昭 - 信息整理专家",
        role: "information_synthesizer",
        categories: ["writing"]
    },
    guanping: {
        model: "q35model",
        fallback_models: ["gmodel", "mmodel"],
        temperature: 0.1,
        description: "关平 - 代码审查专家 (关羽义子)",
        role: "code_reviewer",
        categories: ["review"]
    },
    zhoucang: {
        model: "mmodel",
        fallback_models: ["gmodel", "q35model"],
        temperature: 0.15,
        description: "周仓 - 安全检查专家 (关羽部将)",
        role: "security_checker",
        categories: ["review"]
    },
    leixu: {
        model: "mmodel",
        fallback_models: ["gmodel", "q35model"],
        temperature: 0.1,
        description: "雷绪 - 快速定位专家 (张飞部将)",
        role: "quick_locator",
        categories: ["quick"]
    },
    wulan: {
        model: "q35model",
        fallback_models: ["gmodel", "mmodel"],
        temperature: 0.15,
        description: "吴兰 - 即时修复专家 (张飞部将)",
        role: "quick_fixer",
        categories: ["quick"]
    },
    machao: {
        model: "gmodel",
        fallback_models: ["q35model", "mmodel"],
        temperature: 0.2,
        description: "马超 (孟起) - 西凉猛将/后备军团统领",
        role: "reserve_commander",
        categories: ["reserve"]
    },
    madai: {
        model: "mmodel",
        fallback_models: ["gmodel", "q35model"],
        temperature: 0.15,
        description: "马岱 - 稳健支援专家 (马超堂弟)",
        role: "general_support",
        categories: ["reserve"]
    },
    pangde: {
        model: "q35model",
        fallback_models: ["gmodel", "mmodel"],
        temperature: 0.1,
        description: "庞德 - 特殊任务专家 (原马超部将)",
        role: "special_scout",
        categories: ["reserve"]
    },
};
export const DEFAULT_CATEGORIES_V2 = {
    "visual-engineering": {
        model: "gmodel",
        fallback_models: ["q35model", "mmodel"],
        description: "攻城拔寨 - 前端/UI/UX",
        keywords: ["UI", "Vue", "前端", "组件", "页面"],
        primaryAgent: "zhaoyun",
        supportAgents: ["gaoshun", "simayi"]
    },
    "deep": {
        model: "gmodel",
        fallback_models: ["q35model", "mmodel"],
        description: "深入敌阵 - 深度执行",
        keywords: ["重构", "架构", "实现", "开发"],
        primaryAgent: "zhaoyun",
        supportAgents: ["simayi", "chendao"]
    },
    "quick": {
        model: "mmodel",
        fallback_models: ["gmodel", "q35model"],
        description: "速战速决 - 快速修复",
        keywords: ["修复", "bug", "fix", "修改"],
        primaryAgent: "zhangfei",
        supportAgents: ["leixu", "wulan"]
    },
    "ultrabrain": {
        model: "gmodel",
        fallback_models: ["q35model", "mmodel"],
        description: "运筹帷幄 - 战略规划",
        keywords: ["设计", "方案", "决策", "架构"],
        primaryAgent: "zhouyu",
        supportAgents: ["lusu", "huanggai"]
    },
    "review": {
        model: "q35model",
        fallback_models: ["gmodel", "mmodel"],
        description: "质量把关 - 代码审查",
        keywords: ["review", "审查", "质量"],
        primaryAgent: "guanyu",
        supportAgents: ["guanping", "zhoucang"]
    },
    "explore": {
        model: "mmodel",
        fallback_models: ["q35model", "gmodel"],
        description: "情报侦察 - 代码探索",
        keywords: ["搜索", "查找", "定位", "find"],
        primaryAgent: "simayi",
        supportAgents: ["simashi"]
    },
    "writing": {
        model: "kmodel",
        fallback_models: ["gmodel", "q35model"],
        description: "文书撰写 - 文档编写",
        keywords: ["文档", "doc", "readme"],
        primaryAgent: "simazhao"
    },
    "reserve": {
        model: "gmodel",
        fallback_models: ["q35model", "mmodel"],
        description: "后备支援 - 特殊任务",
        keywords: ["特殊", "实验", "备用", "支援", "reserve"],
        primaryAgent: "machao",
        supportAgents: ["madai", "pangde"]
    },
};
export const DEFAULT_ROUTING_RULES_V2 = [
    { condition: "contains(['UI', 'Vue', '前端', '组件', '页面'], task)", category: "visual-engineering", primary_agent: "zhaoyun", support_agents: ["gaoshun", "simayi"] },
    { condition: "contains(['重构', '架构', '实现', '开发', '模块'], task)", category: "deep", primary_agent: "zhaoyun", support_agents: ["simayi", "chendao"] },
    { condition: "contains(['修复', 'bug', 'fix', '修改', '问题'], task)", category: "quick", primary_agent: "zhangfei", support_agents: ["leixu", "wulan"] },
    { condition: "contains(['设计', '方案', '决策', '规划', '架构'], task)", category: "ultrabrain", primary_agent: "zhouyu", support_agents: ["lusu", "huanggai"] },
    { condition: "contains(['review', '审查', '检查', '质量'], task)", category: "review", primary_agent: "guanyu", support_agents: ["guanping", "zhoucang"] },
    { condition: "contains(['搜索', '查找', '定位', 'find', 'search'], task)", category: "explore", primary_agent: "simayi", support_agents: ["simashi"] },
];
// ============================================
// 模型映射表 - 内部key到实际模型的映射
// ============================================
export const MODEL_MAPPING = {
    gmodel: {
        name: "GLM-5",
        provider: "bailian",
        modelId: "glm-5",
        fullId: "bailian/glm-5",
        description: "主力/战略模型 - 主帅、大都督使用"
    },
    q35model: {
        name: "Qwen3.5-Plus",
        provider: "bailian",
        modelId: "qwen3.5-plus",
        fullId: "bailian/qwen3.5-plus",
        description: "代码/开发模型 - 开发武将使用"
    },
    kmodel: {
        name: "Astron Coding Plan",
        provider: "AstronCodingPlan",
        modelId: "astron-code-latest",
        fullId: "AstronCodingPlan/astron-code-latest",
        description: "长文本/文档模型 - 信息整理、文档生成"
    },
    mmodel: {
        name: "MiniMax-M2.5",
        provider: "minimax",
        modelId: "MiniMax-M2.5",
        fullId: "minimax/MiniMax-M2.5",
        description: "快速响应模型 - 探索、监控使用"
    },
    'mmodel-hs': {
        name: "MiniMax-M2.5-highspeed",
        provider: "minimax",
        modelId: "MiniMax-M2.5-highspeed",
        fullId: "minimax/MiniMax-M2.5-highspeed",
        description: "高速响应模型 - 主帅专用"
    }
};
/**
 * 解析内部模型key为实际模型ID
 * @param internalKey 内部模型key: "gmodel", "q35model", "kmodel", "mmodel"
 * @returns 实际模型ID: "bailian/glm-5", "AstronCodingPlan/astron-code-latest"
 */
export function resolveModel(internalKey) {
    const mapping = MODEL_MAPPING[internalKey];
    if (!mapping) {
        // 如果已经是完整模型ID，直接返回
        if (internalKey.includes('/')) {
            return internalKey;
        }
        throw new Error(`Unknown model key: ${internalKey}`);
    }
    return mapping.fullId;
}
/**
 * 批量解析模型配置
 */
export function resolveAgentConfig(agentConfig) {
    const resolved = { ...agentConfig };
    if (agentConfig.model) {
        resolved.model = resolveModel(agentConfig.model);
    }
    if (agentConfig.fallback_models) {
        resolved.fallback_models = agentConfig.fallback_models.map(key => resolveModel(key));
    }
    return resolved;
}
/**
 * 解析所有武将配置
 */
export function resolveAllAgents() {
    const resolved = {};
    for (const [name, config] of Object.entries(DEFAULT_AGENTS_V2)) {
        resolved[name] = resolveAgentConfig(config);
    }
    return resolved;
}
/**
 * 解析所有类别配置
 */
export function resolveAllCategories() {
    const resolved = {};
    for (const [name, config] of Object.entries(DEFAULT_CATEGORIES_V2)) {
        const resolvedConfig = { ...config };
        if (config.model) {
            resolvedConfig.model = resolveModel(config.model);
        }
        if (config.fallback_models) {
            resolvedConfig.fallback_models = config.fallback_models.map(key => resolveModel(key));
        }
        resolved[name] = resolvedConfig;
    }
    return resolved;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZW1hLXYyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbmZpZy9zY2hlbWEtdjIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLENBQUMsRUFBRSxNQUFNLEtBQUssQ0FBQTtBQUV2QixNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3hDLEtBQUssRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQzVCLGVBQWUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRTtJQUMvQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFO0lBQ2hELE9BQU8sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFO0lBQ3JFLFdBQVcsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ2xDLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQzNCLFVBQVUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRTtJQUMxQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUNwQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBRTtDQUNoQyxDQUFDLENBQUE7QUFFRixNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0lB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QUFFLEdBQUcsTUFBTSxFQUFFLENBQUE7UUFFcEMsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDakIsY0FBYyxDQUFDLEtBQUssR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQ25ELENBQUM7UUFFRCxJQUFJLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUMzQixjQUFjLENBQUMsZUFBZSxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDdkYsQ0FBQztRQUVELFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxjQUFjLENBQUE7SUFDakMsQ0FBQztJQUVELE9BQU8sUUFBUSxDQUFBO0FBQ2pCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB6IH0gZnJvbSBcInpvZFwiXG5cbmV4cG9ydCBjb25zdCBBZ2VudENvbmZpZ1NjaGVtYSA9IHoub2JqZWN0KHtcbiAgbW9kZWw6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgZmFsbGJhY2tfbW9kZWxzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCksXG4gIHRlbXBlcmF0dXJlOiB6Lm51bWJlcigpLm1pbigwKS5tYXgoMikub3B0aW9uYWwoKSxcbiAgdmFyaWFudDogei5lbnVtKFtcIm1heFwiLCBcImhpZ2hcIiwgXCJtZWRpdW1cIiwgXCJsb3dcIiwgXCJ4aGlnaFwiXSkub3B0aW9uYWwoKSxcbiAgZGVzY3JpcHRpb246IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgcm9sZTogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICBjYXRlZ29yaWVzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCksXG4gIHByb21wdF9hcHBlbmQ6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgZGlzYWJsZTogei5ib29sZWFuKCkub3B0aW9uYWwoKSxcbn0pXG5cbmV4cG9ydCBjb25zdCBDYXRlZ29yeUNvbmZpZ1NjaGVtYSA9IHoub2JqZWN0KHtcbiAgbW9kZWw6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgZmFsbGJhY2tfbW9kZWxzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCksXG4gIHZhcmlhbnQ6IHouZW51bShbXCJtYXhcIiwgXCJoaWdoXCIsIFwibWVkaXVtXCIsIFwibG93XCIsIFwieGhpZ2hcIl0pLm9wdGlvbmFsKCksXG4gIGRlc2NyaXB0aW9uOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gIGtleXdvcmRzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCksXG4gIHByaW1hcnlBZ2VudDogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICBzdXBwb3J0QWdlbnRzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCksXG4gIHRlbXBlcmF0dXJlOiB6Lm51bWJlcigpLm1pbigwKS5tYXgoMikub3B0aW9uYWwoKSxcbn0pXG5cbmV4cG9ydCBjb25zdCBUYXNrUm91dGluZ1J1bGVTY2hlbWEgPSB6Lm9iamVjdCh7XG4gIGNvbmRpdGlvbjogei5zdHJpbmcoKSxcbiAgY2F0ZWdvcnk6IHouc3RyaW5nKCksXG4gIHByaW1hcnlfYWdlbnQ6IHouc3RyaW5nKCksXG4gIHN1cHBvcnRfYWdlbnRzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCksXG59KVxuXG5leHBvcnQgY29uc3QgQmFja2dyb3VuZFRhc2tDb25maWdTY2hlbWEgPSB6Lm9iamVjdCh7XG4gIGRlZmF1bHRDb25jdXJyZW5jeTogei5udW1iZXIoKS5vcHRpb25hbCgpLFxuICBzdGFsZVRpbWVvdXRNczogei5udW1iZXIoKS5vcHRpb25hbCgpLFxuICBwcm92aWRlckNvbmN1cnJlbmN5OiB6LnJlY29yZCh6LnN0cmluZygpLCB6Lm51bWJlcigpKS5vcHRpb25hbCgpLFxuICBtb2RlbENvbmN1cnJlbmN5OiB6LnJlY29yZCh6LnN0cmluZygpLCB6Lm51bWJlcigpKS5vcHRpb25hbCgpLFxufSlcblxuZXhwb3J0IGNvbnN0IFJ1bnRpbWVGYWxsYmFja0NvbmZpZ1NjaGVtYSA9IHoub2JqZWN0KHtcbiAgZW5hYmxlZDogei5ib29sZWFuKCkub3B0aW9uYWwoKSxcbiAgcmV0cnlfb25fZXJyb3JzOiB6LmFycmF5KHoubnVtYmVyKCkpLm9wdGlvbmFsKCksXG4gIG1heF9mYWxsYmFja19hdHRlbXB0czogei5udW1iZXIoKS5vcHRpb25hbCgpLFxuICBjb29sZG93bl9zZWNvbmRzOiB6Lm51bWJlcigpLm9wdGlvbmFsKCksXG4gIG5vdGlmeV9vbl9mYWxsYmFjazogei5ib29sZWFuKCkub3B0aW9uYWwoKSxcbn0pXG5cbmV4cG9ydCBjb25zdCBVbHRyYXdvcmtDb25maWdTY2hlbWEgPSB6Lm9iamVjdCh7XG4gIHRyaWdnZXJzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCksXG4gIGRlZmF1bHRfb3JjaGVzdHJhdG9yOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gIGF1dG9fY2F0ZWdvcnlfZGV0ZWN0aW9uOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLFxuICBwYXJhbGxlbF9leGVjdXRpb246IHouYm9vbGVhbigpLm9wdGlvbmFsKCksXG4gIG1heF9jb25jdXJyZW50X2FnZW50czogei5udW1iZXIoKS5vcHRpb25hbCgpLFxuICBwcm9ncmVzc19yZXBvcnRpbmc6IHouYm9vbGVhbigpLm9wdGlvbmFsKCksXG59KVxuXG5leHBvcnQgY29uc3QgVWx0cmFXb3JrU2FuZ3VvQ29uZmlnU2NoZW1hID0gei5vYmplY3Qoe1xuICAkc2NoZW1hOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gIGFnZW50czogei5yZWNvcmQoei5zdHJpbmcoKSwgQWdlbnRDb25maWdTY2hlbWEpLm9wdGlvbmFsKCksXG4gIGNhdGVnb3JpZXM6IHoucmVjb3JkKHouc3RyaW5nKCksIENhdGVnb3J5Q29uZmlnU2NoZW1hKS5vcHRpb25hbCgpLFxuICB0YXNrX3JvdXRpbmc6IHoub2JqZWN0KHtcbiAgICBydWxlczogei5hcnJheShUYXNrUm91dGluZ1J1bGVTY2hlbWEpLm9wdGlvbmFsKCksXG4gICAgZGVmYXVsdF9jYXRlZ29yeTogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICAgIGRlZmF1bHRfYWdlbnQ6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgfSkub3B0aW9uYWwoKSxcbiAgYmFja2dyb3VuZF90YXNrOiBCYWNrZ3JvdW5kVGFza0NvbmZpZ1NjaGVtYS5vcHRpb25hbCgpLFxuICBydW50aW1lX2ZhbGxiYWNrOiBSdW50aW1lRmFsbGJhY2tDb25maWdTY2hlbWEub3B0aW9uYWwoKSxcbiAgcHJvdmlkZXJfcHJpb3JpdHk6IHoucmVjb3JkKHouc3RyaW5nKCksIHoubnVtYmVyKCkpLm9wdGlvbmFsKCksXG4gIHVsdHJhd29yazogVWx0cmF3b3JrQ29uZmlnU2NoZW1hLm9wdGlvbmFsKCksXG4gIGRpc2FibGVkX2FnZW50czogei5hcnJheSh6LnN0cmluZygpKS5vcHRpb25hbCgpLFxuICBkaXNhYmxlZF9jYXRlZ29yaWVzOiB6LmFycmF5KHouc3RyaW5nKCkpLm9wdGlvbmFsKCksXG59KVxuXG5leHBvcnQgdHlwZSBBZ2VudENvbmZpZyA9IHouaW5mZXI8dHlwZW9mIEFnZW50Q29uZmlnU2NoZW1hPlxuZXhwb3J0IHR5cGUgQ2F0ZWdvcnlDb25maWcgPSB6LmluZmVyPHR5cGVvZiBDYXRlZ29yeUNvbmZpZ1NjaGVtYT5cbmV4cG9ydCB0eXBlIFRhc2tSb3V0aW5nUnVsZSA9IHouaW5mZXI8dHlwZW9mIFRhc2tSb3V0aW5nUnVsZVNjaGVtYT5cbmV4cG9ydCB0eXBlIEJhY2tncm91bmRUYXNrQ29uZmlnID0gei5pbmZlcjx0eXBlb2YgQmFja2dyb3VuZFRhc2tDb25maWdTY2hlbWE+XG5leHBvcnQgdHlwZSBSdW50aW1lRmFsbGJhY2tDb25maWcgPSB6LmluZmVyPHR5cGVvZiBSdW50aW1lRmFsbGJhY2tDb25maWdTY2hlbWE+XG5leHBvcnQgdHlwZSBVbHRyYXdvcmtDb25maWcgPSB6LmluZmVyPHR5cGVvZiBVbHRyYXdvcmtDb25maWdTY2hlbWE+XG5leHBvcnQgdHlwZSBVbHRyYVdvcmtTYW5ndW9Db25maWcgPSB6LmluZmVyPHR5cGVvZiBVbHRyYVdvcmtTYW5ndW9Db25maWdTY2hlbWE+XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyDmlrDnmoTphY3nva7ns7vnu58gLSDkvb/nlKjlhoXpg6jmqKHlnotrZXlcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8vIOWGhemDqOaooeWei2tleeWumuS5iVxuLy8gZ21vZGVsID0gR0xNLTUgKGJhaWxpYW4pIC0g5oiY55Wl5Z6LXG4vLyBxMzVtb2RlbCA9IFF3ZW4zLjUtUGx1cyAoYmFpbGlhbikgLSDku6PnoIHlnosgIFxuLy8ga21vZGVsID0gQXN0cm9uIENvZGluZyBQbGFuIChBc3Ryb25Db2RpbmdQbGFuKSAtIOaWh+aho+Wei1xuLy8gbW1vZGVsID0gTWluaU1heC1NMi41IChiYWlsaWFuKSAtIOW/q+mAn+Wei1xuLy8gbW1vZGVsLWhzID0gTWluaU1heC1NMi41LWhpZ2hzcGVlZCAobWluaW1heCkgLSDkuLvluIXkuJPnlKjpq5jpgJ/lnotcblxuLy8gMTnlsIbpooblrozmlbTphY3nva4gLSDkvb/nlKjlhoXpg6jmqKHlnotrZXlcbmV4cG9ydCBjb25zdCBERUZBVUxUX0FHRU5UU19WMjogUmVjb3JkPHN0cmluZywgQWdlbnRDb25maWc+ID0ge1xuICB6aHVnZWxpYW5nOiB7IFxuICAgIG1vZGVsOiBcIm1tb2RlbC1oc1wiLCBcbiAgICBmYWxsYmFja19tb2RlbHM6IFtcIm1tb2RlbFwiLCBcInEzNW1vZGVsXCJdLFxuICAgIHRlbXBlcmF0dXJlOiAwLjEsIFxuICAgIGRlc2NyaXB0aW9uOiBcIuivuOiRm+S6riAo5a2U5piOKSAtIOS4u+W4hS/osIPluqblmahcIiwgXG4gICAgcm9sZTogXCJvcmNoZXN0cmF0b3JcIiBcbiAgfSxcbiAgemhvdXl1OiB7IFxuICAgIG1vZGVsOiBcImdtb2RlbFwiLCBcbiAgICBmYWxsYmFja19tb2RlbHM6IFtcInEzNW1vZGVsXCIsIFwibW1vZGVsXCJdLFxuICAgIHRlbXBlcmF0dXJlOiAwLjIsIFxuICAgIGRlc2NyaXB0aW9uOiBcIuWRqOeRnCAo5YWs55G+KSAtIOWkp+mDveedoy/miJjnlaXop4TliJLkuJPlrrZcIiwgXG4gICAgcm9sZTogXCJwbGFubmVyXCIsIFxuICAgIGNhdGVnb3JpZXM6IFtcInVsdHJhYnJhaW5cIl0gXG4gIH0sXG4gIHpoYW95dW46IHsgXG4gICAgbW9kZWw6IFwiZ21vZGVsXCIsIFxuICAgIGZhbGxiYWNrX21vZGVsczogW1wicTM1bW9kZWxcIiwgXCJtbW9kZWxcIl0sXG4gICAgdGVtcGVyYXR1cmU6IDAuMSwgXG4gICAgZGVzY3JpcHRpb246IFwi6LW15LqRICjlrZDpvpkpIC0g5aSn5bCGL+a3seW6puaJp+ihjOiAhVwiLCBcbiAgICByb2xlOiBcImV4ZWN1dG9yXCIsIFxuICAgIGNhdGVnb3JpZXM6IFtcImRlZXBcIiwgXCJ2aXN1YWwtZW5naW5lZXJpbmdcIl0gXG4gIH0sXG4gIHNpbWF5aTogeyBcbiAgICBtb2RlbDogXCJtbW9kZWxcIiwgXG4gICAgZmFsbGJhY2tfbW9kZWxzOiBbXCJxMzVtb2RlbFwiLCBcImdtb2RlbFwiXSxcbiAgICB0ZW1wZXJhdHVyZTogMC4yLCBcbiAgICBkZXNjcmlwdGlvbjogXCLlj7jpqazmh78gKOS7sui+vikgLSDosIvlo6sv5oOF5oql5a6YXCIsIFxuICAgIHJvbGU6IFwiZXhwbG9yZXJcIiwgXG4gICAgY2F0ZWdvcmllczogW1wiZXhwbG9yZVwiXSBcbiAgfSxcbiAgZ3Vhbnl1OiB7IFxuICAgIG1vZGVsOiBcImdtb2RlbFwiLCBcbiAgICBmYWxsYmFja19tb2RlbHM6IFtcInEzNW1vZGVsXCIsIFwibW1vZGVsXCJdLFxuICAgIHRlbXBlcmF0dXJlOiAwLjEsIFxuICAgIGRlc2NyaXB0aW9uOiBcIuWFs+e+vSAo5LqR6ZW/KSAtIOi0qOmHj+WuiOaKpOiAhVwiLCBcbiAgICByb2xlOiBcInJldmlld2VyXCIsIFxuICAgIGNhdGVnb3JpZXM6IFtcInJldmlld1wiXSBcbiAgfSxcbiAgemhhbmdmZWk6IHsgXG4gICAgbW9kZWw6IFwibW1vZGVsXCIsIFxuICAgIGZhbGxiYWNrX21vZGVsczogW1wiZ21vZGVsXCIsIFwicTM1bW9kZWxcIl0sXG4gICAgdGVtcGVyYXR1cmU6IDAuMTUsIFxuICAgIGRlc2NyaXB0aW9uOiBcIuW8oOmjniAo57+85b63KSAtIOW/q+mAn+eqgeWHu+iAhVwiLCBcbiAgICByb2xlOiBcInF1aWNrZml4ZXJcIiwgXG4gICAgY2F0ZWdvcmllczogW1wicXVpY2tcIl0gXG4gIH0sXG4gIGx1c3U6IHsgXG4gICAgbW9kZWw6IFwiZ21vZGVsXCIsIFxuICAgIGZhbGxiYWNrX21vZGVsczogW1wicTM1bW9kZWxcIiwgXCJtbW9kZWxcIl0sXG4gICAgdGVtcGVyYXR1cmU6IDAuMiwgXG4gICAgZGVzY3JpcHRpb246IFwi6bKB6IKDICjlrZDmlawpIC0g6LWE5rqQ6KeE5YiS5LiT5a62XCIsIFxuICAgIHJvbGU6IFwicmVzb3VyY2VfcGxhbm5lclwiLCBcbiAgICBjYXRlZ29yaWVzOiBbXCJ1bHRyYWJyYWluXCJdIFxuICB9LFxuICBodWFuZ2dhaTogeyBcbiAgICBtb2RlbDogXCJxMzVtb2RlbFwiLCBcbiAgICBmYWxsYmFja19tb2RlbHM6IFtcImdtb2RlbFwiLCBcIm1tb2RlbFwiXSxcbiAgICB0ZW1wZXJhdHVyZTogMC4xNSwgXG4gICAgZGVzY3JpcHRpb246IFwi6buE55uWIC0g5omn6KGM6JC95Zyw5LiT5a62XCIsIFxuICAgIHJvbGU6IFwiaW1wbGVtZW50ZXJcIiwgXG4gICAgY2F0ZWdvcmllczogW1wiZGVlcFwiXSBcbiAgfSxcbiAgZ2Fvc2h1bjogeyBcbiAgICBtb2RlbDogXCJxMzVtb2RlbFwiLCBcbiAgICBmYWxsYmFja19tb2RlbHM6IFtcImdtb2RlbFwiLCBcIm1tb2RlbFwiXSxcbiAgICB0ZW1wZXJhdHVyZTogMC4xLCBcbiAgICBkZXNjcmlwdGlvbjogXCLpq5jpobogLSDliY3nq6/lvIDlj5HkuJPlrrYgKOmZt+mYteiQpee7n+mihilcIiwgXG4gICAgcm9sZTogXCJmcm9udGVuZF9zcGVjaWFsaXN0XCIsIFxuICAgIGNhdGVnb3JpZXM6IFtcInZpc3VhbC1lbmdpbmVlcmluZ1wiXSBcbiAgfSxcbiAgY2hlbmRhbzogeyBcbiAgICBtb2RlbDogXCJxMzVtb2RlbFwiLCBcbiAgICBmYWxsYmFja19tb2RlbHM6IFtcImdtb2RlbFwiLCBcIm1tb2RlbFwiXSxcbiAgICB0ZW1wZXJhdHVyZTogMC4xLCBcbiAgICBkZXNjcmlwdGlvbjogXCLpmYjliLAgLSDlkI7nq6/lvIDlj5HkuJPlrrYgKOeZveiAs+WFtee7n+mihilcIiwgXG4gICAgcm9sZTogXCJiYWNrZW5kX3NwZWNpYWxpc3RcIiwgXG4gICAgY2F0ZWdvcmllczogW1wiZGVlcFwiXSBcbiAgfSxcbiAgc2ltYXNoaTogeyBcbiAgICBtb2RlbDogXCJtbW9kZWxcIiwgXG4gICAgZmFsbGJhY2tfbW9kZWxzOiBbXCJxMzVtb2RlbFwiLCBcImdtb2RlbFwiXSxcbiAgICB0ZW1wZXJhdHVyZTogMC4yLCBcbiAgICBkZXNjcmlwdGlvbjogXCLlj7jpqazluIggLSDmt7HluqbliIbmnpDkuJPlrrZcIiwgXG4gICAgcm9sZTogXCJkZWVwX2FuYWx5c3RcIiwgXG4gICAgY2F0ZWdvcmllczogW1wiZXhwbG9yZVwiXSBcbiAgfSxcbiAgc2ltYXpoYW86IHsgXG4gICAgbW9kZWw6IFwia21vZGVsXCIsIFxuICAgIGZhbGxiYWNrX21vZGVsczogW1wiZ21vZGVsXCIsIFwicTM1bW9kZWxcIl0sXG4gICAgdGVtcGVyYXR1cmU6IDAuMTUsIFxuICAgIGRlc2NyaXB0aW9uOiBcIuWPuOmprOaYrSAtIOS/oeaBr+aVtOeQhuS4k+WutlwiLCBcbiAgICByb2xlOiBcImluZm9ybWF0aW9uX3N5bnRoZXNpemVyXCIsIFxuICAgIGNhdGVnb3JpZXM6IFtcIndyaXRpbmdcIl0gXG4gIH0sXG4gIGd1YW5waW5nOiB7IFxuICAgIG1vZGVsOiBcInEzNW1vZGVsXCIsIFxuICAgIGZhbGxiYWNrX21vZGVsczogW1wiZ21vZGVsXCIsIFwibW1vZGVsXCJdLFxuICAgIHRlbXBlcmF0dXJlOiAwLjEsIFxuICAgIGRlc2NyaXB0aW9uOiBcIuWFs+W5syAtIOS7o+eggeWuoeafpeS4k+WutiAo5YWz57695LmJ5a2QKVwiLCBcbiAgICByb2xlOiBcImNvZGVfcmV2aWV3ZXJcIiwgXG4gICAgY2F0ZWdvcmllczogW1wicmV2aWV3XCJdIFxuICB9LFxuICB6aG91Y2FuZzogeyBcbiAgICBtb2RlbDogXCJtbW9kZWxcIiwgXG4gICAgZmFsbGJhY2tfbW9kZWxzOiBbXCJnbW9kZWxcIiwgXCJxMzVtb2RlbFwiXSxcbiAgICB0ZW1wZXJhdHVyZTogMC4xNSwgXG4gICAgZGVzY3JpcHRpb246IFwi5ZGo5LuTIC0g5a6J5YWo5qOA5p+l5LiT5a62ICjlhbPnvr3pg6jlsIYpXCIsIFxuICAgIHJvbGU6IFwic2VjdXJpdHlfY2hlY2tlclwiLCBcbiAgICBjYXRlZ29yaWVzOiBbXCJyZXZpZXdcIl0gXG4gIH0sXG4gIGxlaXh1OiB7IFxuICAgIG1vZGVsOiBcIm1tb2RlbFwiLCBcbiAgICBmYWxsYmFja19tb2RlbHM6IFtcImdtb2RlbFwiLCBcInEzNW1vZGVsXCJdLFxuICAgIHRlbXBlcmF0dXJlOiAwLjEsIFxuICAgIGRlc2NyaXB0aW9uOiBcIumbt+e7qiAtIOW/q+mAn+WumuS9jeS4k+WutiAo5byg6aOe6YOo5bCGKVwiLCBcbiAgICByb2xlOiBcInF1aWNrX2xvY2F0b3JcIiwgXG4gICAgY2F0ZWdvcmllczogW1wicXVpY2tcIl0gXG4gIH0sXG4gIHd1bGFuOiB7IFxuICAgIG1vZGVsOiBcInEzNW1vZGVsXCIsIFxuICAgIGZhbGxiYWNrX21vZGVsczogW1wiZ21vZGVsXCIsIFwibW1vZGVsXCJdLFxuICAgIHRlbXBlcmF0dXJlOiAwLjE1LCBcbiAgICBkZXNjcmlwdGlvbjogXCLlkLTlhbAgLSDljbPml7bkv67lpI3kuJPlrrYgKOW8oOmjnumDqOWwhilcIiwgXG4gICAgcm9sZTogXCJxdWlja19maXhlclwiLCBcbiAgICBjYXRlZ29yaWVzOiBbXCJxdWlja1wiXSBcbiAgfSxcbiAgbWFjaGFvOiB7IFxuICAgIG1vZGVsOiBcImdtb2RlbFwiLCBcbiAgICBmYWxsYmFja19tb2RlbHM6IFtcInEzNW1vZGVsXCIsIFwibW1vZGVsXCJdLFxuICAgIHRlbXBlcmF0dXJlOiAwLjIsIFxuICAgIGRlc2NyaXB0aW9uOiBcIumprOi2hSAo5a2f6LW3KSAtIOilv+WHieeMm+Wwhi/lkI7lpIflhpvlm6Lnu5/pooZcIiwgXG4gICAgcm9sZTogXCJyZXNlcnZlX2NvbW1hbmRlclwiLCBcbiAgICBjYXRlZ29yaWVzOiBbXCJyZXNlcnZlXCJdIFxuICB9LFxuICBtYWRhaTogeyBcbiAgICBtb2RlbDogXCJtbW9kZWxcIiwgXG4gICAgZmFsbGJhY2tfbW9kZWxzOiBbXCJnbW9kZWxcIiwgXCJxMzVtb2RlbFwiXSxcbiAgICB0ZW1wZXJhdHVyZTogMC4xNSwgXG4gICAgZGVzY3JpcHRpb246IFwi6ams5bKxIC0g56iz5YGl5pSv5o+05LiT5a62ICjpqazotoXloILlvJ8pXCIsIFxuICAgIHJvbGU6IFwiZ2VuZXJhbF9zdXBwb3J0XCIsIFxuICAgIGNhdGVnb3JpZXM6IFtcInJlc2VydmVcIl0gXG4gIH0sXG4gIHBhbmdkZTogeyBcbiAgICBtb2RlbDogXCJxMzVtb2RlbFwiLCBcbiAgICBmYWxsYmFja19tb2RlbHM6IFtcImdtb2RlbFwiLCBcIm1tb2RlbFwiXSxcbiAgICB0ZW1wZXJhdHVyZTogMC4xLCBcbiAgICBkZXNjcmlwdGlvbjogXCLlup7lvrcgLSDnibnmrorku7vliqHkuJPlrrYgKOWOn+mprOi2hemDqOWwhilcIiwgXG4gICAgcm9sZTogXCJzcGVjaWFsX3Njb3V0XCIsIFxuICAgIGNhdGVnb3JpZXM6IFtcInJlc2VydmVcIl0gXG4gIH0sXG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0NBVEVHT1JJRVNfVjI6IFJlY29yZDxzdHJpbmcsIENhdGVnb3J5Q29uZmlnPiA9IHtcbiAgXCJ2aXN1YWwtZW5naW5lZXJpbmdcIjogeyBcbiAgICBtb2RlbDogXCJnbW9kZWxcIiwgXG4gICAgZmFsbGJhY2tfbW9kZWxzOiBbXCJxMzVtb2RlbFwiLCBcIm1tb2RlbFwiXSxcbiAgICBkZXNjcmlwdGlvbjogXCLmlLvln47mi5Tlr6ggLSDliY3nq68vVUkvVVhcIiwgXG4gICAga2V5d29yZHM6IFtcIlVJXCIsIFwiVnVlXCIsIFwi5YmN56uvXCIsIFwi57uE5Lu2XCIsIFwi6aG16Z2iXCJdLCBcbiAgICBwcmltYXJ5QWdlbnQ6IFwiemhhb3l1blwiLFxuICAgIHN1cHBvcnRBZ2VudHM6IFtcImdhb3NodW5cIiwgXCJzaW1heWlcIl1cbiAgfSxcbiAgXCJkZWVwXCI6IHsgXG4gICAgbW9kZWw6IFwiZ21vZGVsXCIsIFxuICAgIGZhbGxiYWNrX21vZGVsczogW1wicTM1bW9kZWxcIiwgXCJtbW9kZWxcIl0sXG4gICAgZGVzY3JpcHRpb246IFwi5rex5YWl5pWM6Zi1IC0g5rex5bqm5omn6KGMXCIsIFxuICAgIGtleXdvcmRzOiBbXCLph43mnoRcIiwgXCLmnrbmnoRcIiwgXCLlrp7njrBcIiwgXCLlvIDlj5FcIl0sIFxuICAgIHByaW1hcnlBZ2VudDogXCJ6aGFveXVuXCIsXG4gICAgc3VwcG9ydEFnZW50czogW1wic2ltYXlpXCIsIFwiY2hlbmRhb1wiXVxuICB9LFxuICBcInF1aWNrXCI6IHsgXG4gICAgbW9kZWw6IFwibW1vZGVsXCIsIFxuICAgIGZhbGxiYWNrX21vZGVsczogW1wiZ21vZGVsXCIsIFwicTM1bW9kZWxcIl0sXG4gICAgZGVzY3JpcHRpb246IFwi6YCf5oiY6YCf5YazIC0g5b+r6YCf5L+u5aSNXCIsIFxuICAgIGtleXdvcmRzOiBbXCLkv67lpI1cIiwgXCJidWdcIiwgXCJmaXhcIiwgXCLkv67mlLlcIl0sIFxuICAgIHByaW1hcnlBZ2VudDogXCJ6aGFuZ2ZlaVwiLFxuICAgIHN1cHBvcnRBZ2VudHM6IFtcImxlaXh1XCIsIFwid3VsYW5cIl1cbiAgfSxcbiAgXCJ1bHRyYWJyYWluXCI6IHsgXG4gICAgbW9kZWw6IFwiZ21vZGVsXCIsIFxuICAgIGZhbGxiYWNrX21vZGVsczogW1wicTM1bW9kZWxcIiwgXCJtbW9kZWxcIl0sXG4gICAgZGVzY3JpcHRpb246IFwi6L+Q56255bi35bmEIC0g5oiY55Wl6KeE5YiSXCIsIFxuICAgIGtleXdvcmRzOiBbXCLorr7orqFcIiwgXCLmlrnmoYhcIiwgXCLlhrPnrZZcIiwgXCLmnrbmnoRcIl0sIFxuICAgIHByaW1hcnlBZ2VudDogXCJ6aG91eXVcIixcbiAgICBzdXBwb3J0QWdlbnRzOiBbXCJsdXN1XCIsIFwiaHVhbmdnYWlcIl1cbiAgfSxcbiAgXCJyZXZpZXdcIjogeyBcbiAgICBtb2RlbDogXCJxMzVtb2RlbFwiLCBcbiAgICBmYWxsYmFja19tb2RlbHM6IFtcImdtb2RlbFwiLCBcIm1tb2RlbFwiXSxcbiAgICBkZXNjcmlwdGlvbjogXCLotKjph4/miorlhbMgLSDku6PnoIHlrqHmn6VcIiwgXG4gICAga2V5d29yZHM6IFtcInJldmlld1wiLCBcIuWuoeafpVwiLCBcIui0qOmHj1wiXSwgXG4gICAgcHJpbWFyeUFnZW50OiBcImd1YW55dVwiLFxuICAgIHN1cHBvcnRBZ2VudHM6IFtcImd1YW5waW5nXCIsIFwiemhvdWNhbmdcIl1cbiAgfSxcbiAgXCJleHBsb3JlXCI6IHsgXG4gICAgbW9kZWw6IFwibW1vZGVsXCIsIFxuICAgIGZhbGxiYWNrX21vZGVsczogW1wicTM1bW9kZWxcIiwgXCJnbW9kZWxcIl0sXG4gICAgZGVzY3JpcHRpb246IFwi5oOF5oql5L6m5a+fIC0g5Luj56CB5o6i57SiXCIsIFxuICAgIGtleXdvcmRzOiBbXCLmkJzntKJcIiwgXCLmn6Xmib5cIiwgXCLlrprkvY1cIiwgXCJmaW5kXCJdLCBcbiAgICBwcmltYXJ5QWdlbnQ6IFwic2ltYXlpXCIsXG4gICAgc3VwcG9ydEFnZW50czogW1wic2ltYXNoaVwiXVxuICB9LFxuICBcIndyaXRpbmdcIjogeyBcbiAgICBtb2RlbDogXCJrbW9kZWxcIiwgXG4gICAgZmFsbGJhY2tfbW9kZWxzOiBbXCJnbW9kZWxcIiwgXCJxMzVtb2RlbFwiXSxcbiAgICBkZXNjcmlwdGlvbjogXCLmlofkuabmkrDlhpkgLSDmlofmoaPnvJblhplcIiwgXG4gICAga2V5d29yZHM6IFtcIuaWh+aho1wiLCBcImRvY1wiLCBcInJlYWRtZVwiXSwgXG4gICAgcHJpbWFyeUFnZW50OiBcInNpbWF6aGFvXCIgXG4gIH0sXG4gIFwicmVzZXJ2ZVwiOiB7IFxuICAgIG1vZGVsOiBcImdtb2RlbFwiLCBcbiAgICBmYWxsYmFja19tb2RlbHM6IFtcInEzNW1vZGVsXCIsIFwibW1vZGVsXCJdLFxuICAgIGRlc2NyaXB0aW9uOiBcIuWQjuWkh+aUr+aPtCAtIOeJueauiuS7u+WKoVwiLCBcbiAgICBrZXl3b3JkczogW1wi54m55q6KXCIsIFwi5a6e6aqMXCIsIFwi5aSH55SoXCIsIFwi5pSv5o+0XCIsIFwicmVzZXJ2ZVwiXSwgXG4gICAgcHJpbWFyeUFnZW50OiBcIm1hY2hhb1wiLFxuICAgIHN1cHBvcnRBZ2VudHM6IFtcIm1hZGFpXCIsIFwicGFuZ2RlXCJdXG4gIH0sXG59XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1JPVVRJTkdfUlVMRVNfVjI6IFRhc2tSb3V0aW5nUnVsZVtdID0gW1xuICB7IGNvbmRpdGlvbjogXCJjb250YWlucyhbJ1VJJywgJ1Z1ZScsICfliY3nq68nLCAn57uE5Lu2JywgJ+mhtemdoiddLCB0YXNrKVwiLCBjYXRlZ29yeTogXCJ2aXN1YWwtZW5naW5lZXJpbmdcIiwgcHJpbWFyeV9hZ2VudDogXCJ6aGFveXVuXCIsIHN1cHBvcnRfYWdlbnRzOiBbXCJnYW9zaHVuXCIsIFwic2ltYXlpXCJdIH0sXG4gIHsgY29uZGl0aW9uOiBcImNvbnRhaW5zKFsn6YeN5p6EJywgJ+aetuaehCcsICflrp7njrAnLCAn5byA5Y+RJywgJ+aooeWdlyddLCB0YXNrKVwiLCBjYXRlZ29yeTogXCJkZWVwXCIsIHByaW1hcnlfYWdlbnQ6IFwiemhhb3l1blwiLCBzdXBwb3J0X2FnZW50czogW1wic2ltYXlpXCIsIFwiY2hlbmRhb1wiXSB9LFxuICB7IGNvbmRpdGlvbjogXCJjb250YWlucyhbJ+S/ruWkjScsICdidWcnLCAnZml4JywgJ+S/ruaUuScsICfpl67popgnXSwgdGFzaylcIiwgY2F0ZWdvcnk6IFwicXVpY2tcIiwgcHJpbWFyeV9hZ2VudDogXCJ6aGFuZ2ZlaVwiLCBzdXBwb3J0X2FnZW50czogW1wibGVpeHVcIiwgXCJ3dWxhblwiXSB9LFxuICB7IGNvbmRpdGlvbjogXCJjb250YWlucyhbJ+iuvuiuoScsICfmlrnmoYgnLCAn5Yaz562WJywgJ+inhOWIkicsICfmnrbmnoQnXSwgdGFzaylcIiwgY2F0ZWdvcnk6IFwidWx0cmFicmFpblwiLCBwcmltYXJ5X2FnZW50OiBcInpob3V5dVwiLCBzdXBwb3J0X2FnZW50czogW1wibHVzdVwiLCBcImh1YW5nZ2FpXCJdIH0sXG4gIHsgY29uZGl0aW9uOiBcImNvbnRhaW5zKFsncmV2aWV3JywgJ+WuoeafpScsICfmo4Dmn6UnLCAn6LSo6YePJ10sIHRhc2spXCIsIGNhdGVnb3J5OiBcInJldmlld1wiLCBwcmltYXJ5X2FnZW50OiBcImd1YW55dVwiLCBzdXBwb3J0X2FnZW50czogW1wiZ3VhbnBpbmdcIiwgXCJ6aG91Y2FuZ1wiXSB9LFxuICB7IGNvbmRpdGlvbjogXCJjb250YWlucyhbJ+aQnOe0oicsICfmn6Xmib4nLCAn5a6a5L2NJywgJ2ZpbmQnLCAnc2VhcmNoJ10sIHRhc2spXCIsIGNhdGVnb3J5OiBcImV4cGxvcmVcIiwgcHJpbWFyeV9hZ2VudDogXCJzaW1heWlcIiwgc3VwcG9ydF9hZ2VudHM6IFtcInNpbWFzaGlcIl0gfSxcbl1cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIOaooeWei+aYoOWwhOihqCAtIOWGhemDqGtleeWIsOWunumZheaooeWei+eahOaYoOWwhFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGNvbnN0IE1PREVMX01BUFBJTkcgPSB7XG4gIGdtb2RlbDoge1xuICAgIG5hbWU6IFwiR0xNLTVcIixcbiAgICBwcm92aWRlcjogXCJiYWlsaWFuXCIsXG4gICAgbW9kZWxJZDogXCJnbG0tNVwiLFxuICAgIGZ1bGxJZDogXCJiYWlsaWFuL2dsbS01XCIsXG4gICAgZGVzY3JpcHRpb246IFwi5Li75YqbL+aImOeVpeaooeWeiyAtIOS4u+W4heOAgeWkp+mDveedo+S9v+eUqFwiXG4gIH0sXG4gIHEzNW1vZGVsOiB7XG4gICAgbmFtZTogXCJRd2VuMy41LVBsdXNcIixcbiAgICBwcm92aWRlcjogXCJiYWlsaWFuXCIsXG4gICAgbW9kZWxJZDogXCJxd2VuMy41LXBsdXNcIixcbiAgICBmdWxsSWQ6IFwiYmFpbGlhbi9xd2VuMy41LXBsdXNcIixcbiAgICBkZXNjcmlwdGlvbjogXCLku6PnoIEv5byA5Y+R5qih5Z6LIC0g5byA5Y+R5q2m5bCG5L2/55SoXCJcbiAgfSxcbiAga21vZGVsOiB7XG4gICAgbmFtZTogXCJBc3Ryb24gQ29kaW5nIFBsYW5cIixcbiAgICBwcm92aWRlcjogXCJBc3Ryb25Db2RpbmdQbGFuXCIsXG4gICAgbW9kZWxJZDogXCJhc3Ryb24tY29kZS1sYXRlc3RcIixcbiAgICBmdWxsSWQ6IFwiQXN0cm9uQ29kaW5nUGxhbi9hc3Ryb24tY29kZS1sYXRlc3RcIixcbiAgICBkZXNjcmlwdGlvbjogXCLplb/mlofmnKwv5paH5qGj5qih5Z6LIC0g5L+h5oGv5pW055CG44CB5paH5qGj55Sf5oiQXCJcbiAgfSxcbiAgbW1vZGVsOiB7XG4gICAgbmFtZTogXCJNaW5pTWF4LU0yLjVcIixcbiAgICBwcm92aWRlcjogXCJtaW5pbWF4XCIsXG4gICAgbW9kZWxJZDogXCJNaW5pTWF4LU0yLjVcIixcbiAgICBmdWxsSWQ6IFwibWluaW1heC9NaW5pTWF4LU0yLjVcIixcbiAgICBkZXNjcmlwdGlvbjogXCLlv6vpgJ/lk43lupTmqKHlnosgLSDmjqLntKLjgIHnm5Hmjqfkvb/nlKhcIlxuICB9LFxuICAnbW1vZGVsLWhzJzoge1xuICAgIG5hbWU6IFwiTWluaU1heC1NMi41LWhpZ2hzcGVlZFwiLFxuICAgIHByb3ZpZGVyOiBcIm1pbmltYXhcIixcbiAgICBtb2RlbElkOiBcIk1pbmlNYXgtTTIuNS1oaWdoc3BlZWRcIixcbiAgICBmdWxsSWQ6IFwibWluaW1heC9NaW5pTWF4LU0yLjUtaGlnaHNwZWVkXCIsXG4gICAgZGVzY3JpcHRpb246IFwi6auY6YCf5ZON5bqU5qih5Z6LIC0g5Li75biF5LiT55SoXCJcbiAgfVxufVxuXG4vKipcbiAqIOino+aekOWGhemDqOaooeWei2tleeS4uuWunumZheaooeWei0lEXG4gKiBAcGFyYW0gaW50ZXJuYWxLZXkg5YaF6YOo5qih5Z6La2V5OiBcImdtb2RlbFwiLCBcInEzNW1vZGVsXCIsIFwia21vZGVsXCIsIFwibW1vZGVsXCJcbiAqIEByZXR1cm5zIOWunumZheaooeWei0lEOiBcImJhaWxpYW4vZ2xtLTVcIiwgXCJBc3Ryb25Db2RpbmdQbGFuL2FzdHJvbi1jb2RlLWxhdGVzdFwiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlTW9kZWwoaW50ZXJuYWxLZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IG1hcHBpbmcgPSBNT0RFTF9NQVBQSU5HW2ludGVybmFsS2V5IGFzIGtleW9mIHR5cGVvZiBNT0RFTF9NQVBQSU5HXVxuICBpZiAoIW1hcHBpbmcpIHtcbiAgICAvLyDlpoLmnpzlt7Lnu4/mmK/lrozmlbTmqKHlnotJRO+8jOebtOaOpei/lOWbnlxuICAgIGlmIChpbnRlcm5hbEtleS5pbmNsdWRlcygnLycpKSB7XG4gICAgICByZXR1cm4gaW50ZXJuYWxLZXlcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIG1vZGVsIGtleTogJHtpbnRlcm5hbEtleX1gKVxuICB9XG4gIHJldHVybiBtYXBwaW5nLmZ1bGxJZFxufVxuXG4vKipcbiAqIOaJuemHj+ino+aekOaooeWei+mFjee9rlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUFnZW50Q29uZmlnKGFnZW50Q29uZmlnOiBBZ2VudENvbmZpZyk6IEFnZW50Q29uZmlnIHtcbiAgY29uc3QgcmVzb2x2ZWQgPSB7IC4uLmFnZW50Q29uZmlnIH1cbiAgXG4gIGlmIChhZ2VudENvbmZpZy5tb2RlbCkge1xuICAgIHJlc29sdmVkLm1vZGVsID0gcmVzb2x2ZU1vZGVsKGFnZW50Q29uZmlnLm1vZGVsKVxuICB9XG4gIFxuICBpZiAoYWdlbnRDb25maWcuZmFsbGJhY2tfbW9kZWxzKSB7XG4gICAgcmVzb2x2ZWQuZmFsbGJhY2tfbW9kZWxzID0gYWdlbnRDb25maWcuZmFsbGJhY2tfbW9kZWxzLm1hcChrZXkgPT4gcmVzb2x2ZU1vZGVsKGtleSkpXG4gIH1cbiAgXG4gIHJldHVybiByZXNvbHZlZFxufVxuXG4vKipcbiAqIOino+aekOaJgOacieatpuWwhumFjee9rlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUFsbEFnZW50cygpOiBSZWNvcmQ8c3RyaW5nLCBBZ2VudENvbmZpZz4ge1xuICBjb25zdCByZXNvbHZlZDogUmVjb3JkPHN0cmluZywgQWdlbnRDb25maWc+ID0ge31cbiAgXG4gIGZvciAoY29uc3QgW25hbWUsIGNvbmZpZ10gb2YgT2JqZWN0LmVudHJpZXMoREVGQVVMVF9BR0VOVFNfVjIpKSB7XG4gICAgcmVzb2x2ZWRbbmFtZV0gPSByZXNvbHZlQWdlbnRDb25maWcoY29uZmlnKVxuICB9XG4gIFxuICByZXR1cm4gcmVzb2x2ZWRcbn1cblxuLyoqXG4gKiDop6PmnpDmiYDmnInnsbvliKvphY3nva5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVBbGxDYXRlZ29yaWVzKCk6IFJlY29yZDxzdHJpbmcsIENhdGVnb3J5Q29uZmlnPiB7XG4gIGNvbnN0IHJlc29sdmVkOiBSZWNvcmQ8c3RyaW5nLCBDYXRlZ29yeUNvbmZpZz4gPSB7fVxuICBcbiAgZm9yIChjb25zdCBbbmFtZSwgY29uZmlnXSBvZiBPYmplY3QuZW50cmllcyhERUZBVUxUX0NBVEVHT1JJRVNfVjIpKSB7XG4gICAgY29uc3QgcmVzb2x2ZWRDb25maWcgPSB7IC4uLmNvbmZpZyB9XG4gICAgXG4gICAgaWYgKGNvbmZpZy5tb2RlbCkge1xuICAgICAgcmVzb2x2ZWRDb25maWcubW9kZWwgPSByZXNvbHZlTW9kZWwoY29uZmlnLm1vZGVsKVxuICAgIH1cbiAgICBcbiAgICBpZiAoY29uZmlnLmZhbGxiYWNrX21vZGVscykge1xuICAgICAgcmVzb2x2ZWRDb25maWcuZmFsbGJhY2tfbW9kZWxzID0gY29uZmlnLmZhbGxiYWNrX21vZGVscy5tYXAoa2V5ID0+IHJlc29sdmVNb2RlbChrZXkpKVxuICAgIH1cbiAgICBcbiAgICByZXNvbHZlZFtuYW1lXSA9IHJlc29sdmVkQ29uZmlnXG4gIH1cbiAgXG4gIHJldHVybiByZXNvbHZlZFxufVxuIl19