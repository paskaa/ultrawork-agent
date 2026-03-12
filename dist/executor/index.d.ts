export interface CategoryModel {
    providerID: string;
    modelID: string;
    variant?: string;
}
type SessionCreateResult = {
    ok: true;
    sessionID: string;
    parentDirectory: string;
} | {
    ok: false;
    error: string;
};
type PromptResult = {
    ok: true;
} | {
    ok: false;
    error: string;
};
type PollResult = {
    ok: true;
} | {
    ok: false;
    error: string;
};
type FetchResult = {
    ok: true;
    sessionID: string;
    textContent: string;
} | {
    ok: false;
    error: string;
};
export declare function parseModelString(model: string): CategoryModel | null;
export declare function createSyncSession(client: any, input: {
    parentSessionID: string;
    agentToUse: string;
    description: string;
    defaultDirectory: string;
}): Promise<SessionCreateResult>;
export declare function sendPromptWithModel(client: any, input: {
    sessionID: string;
    agentToUse: string;
    prompt: string;
    systemContent?: string;
    categoryModel?: CategoryModel;
}): Promise<PromptResult>;
export declare function pollSessionUntilComplete(client: any, sessionID: string, timeoutMs?: number): Promise<PollResult>;
export declare function fetchSessionResult(client: any, sessionID: string): Promise<FetchResult>;
export interface DelegateTaskArgs {
    description: string;
    prompt: string;
    category?: string;
    agent?: string;
}
interface ExecutionContext {
    client: any;
    sessionID: string;
    directory: string;
}
interface AgentConfig {
    description?: string;
    prompt_append?: string;
    model?: string;
}
interface UltraWorkSanguoConfig {
    agents?: Record<string, AgentConfig>;
    categories?: Record<string, {
        description?: string;
        primaryAgent?: string;
        model?: string;
    }>;
    task_routing?: {
        default_agent?: string;
    };
}
export declare function executeSyncTask(args: DelegateTaskArgs, ctx: ExecutionContext, config: UltraWorkSanguoConfig, agentName: string, categoryModel?: CategoryModel): Promise<string>;
export {};
