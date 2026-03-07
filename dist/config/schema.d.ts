import { z } from "zod";
export declare const AgentConfigSchema: z.ZodObject<{
    model: z.ZodOptional<z.ZodString>;
    fallback_models: z.ZodOptional<z.ZodArray<z.ZodString>>;
    temperature: z.ZodOptional<z.ZodNumber>;
    variant: z.ZodOptional<z.ZodEnum<{
        max: "max";
        high: "high";
        medium: "medium";
        low: "low";
        xhigh: "xhigh";
    }>>;
    description: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodString>;
    categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
    prompt_append: z.ZodOptional<z.ZodString>;
    disable: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const CategoryConfigSchema: z.ZodObject<{
    model: z.ZodOptional<z.ZodString>;
    fallback_models: z.ZodOptional<z.ZodArray<z.ZodString>>;
    variant: z.ZodOptional<z.ZodEnum<{
        max: "max";
        high: "high";
        medium: "medium";
        low: "low";
        xhigh: "xhigh";
    }>>;
    description: z.ZodOptional<z.ZodString>;
    keywords: z.ZodOptional<z.ZodArray<z.ZodString>>;
    primaryAgent: z.ZodOptional<z.ZodString>;
    supportAgents: z.ZodOptional<z.ZodArray<z.ZodString>>;
    temperature: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const TaskRoutingRuleSchema: z.ZodObject<{
    condition: z.ZodString;
    category: z.ZodString;
    primary_agent: z.ZodString;
    support_agents: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const BackgroundTaskConfigSchema: z.ZodObject<{
    defaultConcurrency: z.ZodOptional<z.ZodNumber>;
    staleTimeoutMs: z.ZodOptional<z.ZodNumber>;
    providerConcurrency: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    modelConcurrency: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
}, z.core.$strip>;
export declare const RuntimeFallbackConfigSchema: z.ZodObject<{
    enabled: z.ZodOptional<z.ZodBoolean>;
    retry_on_errors: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    max_fallback_attempts: z.ZodOptional<z.ZodNumber>;
    cooldown_seconds: z.ZodOptional<z.ZodNumber>;
    notify_on_fallback: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const UltraworkConfigSchema: z.ZodObject<{
    triggers: z.ZodOptional<z.ZodArray<z.ZodString>>;
    default_orchestrator: z.ZodOptional<z.ZodString>;
    auto_category_detection: z.ZodOptional<z.ZodBoolean>;
    parallel_execution: z.ZodOptional<z.ZodBoolean>;
    max_concurrent_agents: z.ZodOptional<z.ZodNumber>;
    progress_reporting: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const UltraWorkSanguoConfigSchema: z.ZodObject<{
    $schema: z.ZodOptional<z.ZodString>;
    agents: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        model: z.ZodOptional<z.ZodString>;
        fallback_models: z.ZodOptional<z.ZodArray<z.ZodString>>;
        temperature: z.ZodOptional<z.ZodNumber>;
        variant: z.ZodOptional<z.ZodEnum<{
            max: "max";
            high: "high";
            medium: "medium";
            low: "low";
            xhigh: "xhigh";
        }>>;
        description: z.ZodOptional<z.ZodString>;
        role: z.ZodOptional<z.ZodString>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
        prompt_append: z.ZodOptional<z.ZodString>;
        disable: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>>;
    categories: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        model: z.ZodOptional<z.ZodString>;
        fallback_models: z.ZodOptional<z.ZodArray<z.ZodString>>;
        variant: z.ZodOptional<z.ZodEnum<{
            max: "max";
            high: "high";
            medium: "medium";
            low: "low";
            xhigh: "xhigh";
        }>>;
        description: z.ZodOptional<z.ZodString>;
        keywords: z.ZodOptional<z.ZodArray<z.ZodString>>;
        primaryAgent: z.ZodOptional<z.ZodString>;
        supportAgents: z.ZodOptional<z.ZodArray<z.ZodString>>;
        temperature: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>>;
    task_routing: z.ZodOptional<z.ZodObject<{
        rules: z.ZodOptional<z.ZodArray<z.ZodObject<{
            condition: z.ZodString;
            category: z.ZodString;
            primary_agent: z.ZodString;
            support_agents: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>>;
        default_category: z.ZodOptional<z.ZodString>;
        default_agent: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    background_task: z.ZodOptional<z.ZodObject<{
        defaultConcurrency: z.ZodOptional<z.ZodNumber>;
        staleTimeoutMs: z.ZodOptional<z.ZodNumber>;
        providerConcurrency: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        modelConcurrency: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    }, z.core.$strip>>;
    runtime_fallback: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodOptional<z.ZodBoolean>;
        retry_on_errors: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
        max_fallback_attempts: z.ZodOptional<z.ZodNumber>;
        cooldown_seconds: z.ZodOptional<z.ZodNumber>;
        notify_on_fallback: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
    provider_priority: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    ultrawork: z.ZodOptional<z.ZodObject<{
        triggers: z.ZodOptional<z.ZodArray<z.ZodString>>;
        default_orchestrator: z.ZodOptional<z.ZodString>;
        auto_category_detection: z.ZodOptional<z.ZodBoolean>;
        parallel_execution: z.ZodOptional<z.ZodBoolean>;
        max_concurrent_agents: z.ZodOptional<z.ZodNumber>;
        progress_reporting: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
    disabled_agents: z.ZodOptional<z.ZodArray<z.ZodString>>;
    disabled_categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type AgentConfig = z.infer<typeof AgentConfigSchema>;
export type CategoryConfig = z.infer<typeof CategoryConfigSchema>;
export type TaskRoutingRule = z.infer<typeof TaskRoutingRuleSchema>;
export type BackgroundTaskConfig = z.infer<typeof BackgroundTaskConfigSchema>;
export type RuntimeFallbackConfig = z.infer<typeof RuntimeFallbackConfigSchema>;
export type UltraworkConfig = z.infer<typeof UltraworkConfigSchema>;
export type UltraWorkSanguoConfig = z.infer<typeof UltraWorkSanguoConfigSchema>;
export declare const DEFAULT_AGENTS: Record<string, AgentConfig>;
export declare const DEFAULT_CATEGORIES: Record<string, CategoryConfig>;
export declare const DEFAULT_ROUTING_RULES: TaskRoutingRule[];
