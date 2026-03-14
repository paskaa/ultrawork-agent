/**
 * 模型解析器 - 将内部模型key解析为实际的provider/modelId
 *
 * 使用方式:
 * 1. 武将配置中使用内部key: "gmodel", "q35model", "kmodel", "mmodel"
 * 2. 通过resolveModel()解析为实际模型ID: "bailian/glm-5", "AstronCodingPlan/astron-code-latest"
 * 3. 通过getFallbackModels()获取fallback链
 */
export interface ModelMapping {
    name: string;
    provider: string;
    modelId: string;
    fullId: string;
    description: string;
    costMultiplier: number;
    capabilities: string[];
    fallbackChain: string[];
}
export interface ModelMappingConfig {
    version: string;
    modelMapping: Record<string, ModelMapping>;
    agentModelAssignments: Record<string, string>;
    categoryModelAssignments: Record<string, string>;
    providerConfigs: Record<string, {
        name: string;
        baseURL: string;
        apiKeyEnv: string;
    }>;
}
export type InternalModelKey = 'gmodel' | 'q35model' | 'kmodel' | 'mmodel';
/**
 * 加载模型映射配置
 */
export declare function loadModelMapping(): ModelMappingConfig;
/**
 * 解析内部模型key为实际模型ID
 * @param internalKey 内部模型key: "gmodel", "q35model", "kmodel", "mmodel"
 * @returns 实际模型ID: "bailian/glm-5", "AstronCodingPlan/astron-code-latest"
 */
export declare function resolveModel(internalKey: string): string;
/**
 * 获取模型的fallback链
 * @param internalKey 内部模型key
 * @returns fallback模型ID数组
 */
export declare function getFallbackModels(internalKey: string): string[];
/**
 * 获取武将分配的模型
 * @param agentName 武将名称
 * @returns 实际模型ID
 */
export declare function getAgentModel(agentName: string): string;
/**
 * 获取类别分配的模型
 * @param category 类别名称
 * @returns 实际模型ID
 */
export declare function getCategoryModel(category: string): string;
/**
 * 获取武将的fallback模型链
 * @param agentName 武将名称
 * @returns fallback模型ID数组
 */
export declare function getAgentFallbackModels(agentName: string): string[];
/**
 * 获取所有支持的内部模型key
 */
export declare function getInternalModelKeys(): string[];
/**
 * 获取模型信息
 * @param internalKey 内部模型key
 */
export declare function getModelInfo(internalKey: string): ModelMapping | null;
/**
 * 获取供应商配置
 * @param provider 供应商名称
 */
export declare function getProviderConfig(provider: string): {
    name: string;
    baseURL: string;
    apiKeyEnv: string;
};
/**
 * 批量解析模型配置
 * 将使用内部key的配置转换为实际模型ID
 */
export declare function resolveAgentConfig(agentConfig: {
    model?: string;
    fallback_models?: string[];
    [key: string]: any;
}): {
    model: string;
    fallback_models: string[];
    [key: string]: any;
};
declare const _default: {
    loadModelMapping: typeof loadModelMapping;
    resolveModel: typeof resolveModel;
    getFallbackModels: typeof getFallbackModels;
    getAgentModel: typeof getAgentModel;
    getCategoryModel: typeof getCategoryModel;
    getAgentFallbackModels: typeof getAgentFallbackModels;
    getInternalModelKeys: typeof getInternalModelKeys;
    getModelInfo: typeof getModelInfo;
    getProviderConfig: typeof getProviderConfig;
    resolveAgentConfig: typeof resolveAgentConfig;
};
export default _default;
