import type { UltraWorkSanguoConfig, AgentConfig, CategoryConfig } from "./schema.js";
export declare function parseJsonc<T>(content: string): T;
export declare function deepMerge<T extends Record<string, unknown>>(base: T, override: Partial<T>): T;
export declare function loadConfig(directory: string): UltraWorkSanguoConfig;
export declare function getAgentConfig(config: UltraWorkSanguoConfig, agentName: string): AgentConfig | undefined;
export declare function getCategoryConfig(config: UltraWorkSanguoConfig, categoryName: string): CategoryConfig | undefined;
export declare function getModelForAgent(config: UltraWorkSanguoConfig, agentName: string): string | undefined;
