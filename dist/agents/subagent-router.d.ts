/**
 * Subagent Type Router - OpenCode 内置类型路由器
 * 将 OpenCode 内置 subagent 类型映射到 UltraWork 三国军团武将
 */
/**
 * 获取完整的映射配置（默认 + 自定义）
 */
export declare function getSubagentMappings(configPath: any): any;
/**
 * 检查是否为 OpenCode 内置类型
 */
export declare function isBuiltInSubagentType(type: any): boolean;
/**
 * 根据 subagent_type 路由到武将
 * @param {string} subagentType - OpenCode 内置类型
 * @param {object} config - UltraWork 配置
 * @param {string} configPath - 配置文件路径
 * @returns {object|null} - 路由结果
 */
export declare function routeBySubagentType(subagentType: any, config: any, configPath: any): {
    agent: any;
    category: any;
    description: any;
    primaryAgent: any;
    supportAgents: any;
    model: any;
    fallbackModels: any;
    isBuiltInType: boolean;
    subagentType: any;
} | null;
/**
 * 获取所有支持的 OpenCode 内置类型
 */
export declare function getSupportedSubagentTypes(configPath: any): string[];
/**
 * 获取类型到武将的反向查找表
 */
export declare function getReverseLookup(configPath: any): {};
/**
 * 打印路由映射表（用于调试）
 */
export declare function printRoutingTable(configPath: any): void;
declare const _default: {
    routeBySubagentType: typeof routeBySubagentType;
    isBuiltInSubagentType: typeof isBuiltInSubagentType;
    getSubagentMappings: typeof getSubagentMappings;
    getSupportedSubagentTypes: typeof getSupportedSubagentTypes;
    getReverseLookup: typeof getReverseLookup;
    printRoutingTable: typeof printRoutingTable;
};
export default _default;
