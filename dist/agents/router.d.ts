import type { UltraWorkSanguoConfig } from "../config/schema.js";
export interface RoutingResult {
    category: string;
    primaryAgent: string;
    supportAgents: string[];
    model: string;
    fallbackModels: string[];
}
export declare function detectCategory(config: UltraWorkSanguoConfig, taskDescription: string): string;
export declare function routeTask(config: UltraWorkSanguoConfig, taskDescription: string): RoutingResult;
export declare function routeByAgent(config: UltraWorkSanguoConfig, agentName: string): RoutingResult | null;
export declare function buildAgentSystemPrompt(config: UltraWorkSanguoConfig, agentName: string, taskContext?: string): string;
