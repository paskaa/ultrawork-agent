export interface CategoryModel {
    providerID: string;
    modelID: string;
    variant?: "max" | "high" | "medium" | "low";
}
export interface DelegateTaskArgs {
    description: string;
    prompt: string;
    category?: string;
    agent?: string;
    run_in_background?: boolean;
    session_id?: string;
    load_skills?: string[];
}
export interface TaskResult {
    ok: boolean;
    sessionID?: string;
    textContent?: string;
    error?: string;
}
export interface ExecutorContext {
    client: unknown;
    directory: string;
    userCategories: Record<string, unknown>;
    agentOverrides: Record<string, unknown>;
}
export interface ParentContext {
    sessionID: string;
    agent?: string;
    model?: {
        providerID: string;
        modelID: string;
    };
}
export type SessionCreateResult = {
    ok: true;
    sessionID: string;
    parentDirectory: string;
} | {
    ok: false;
    error: string;
};
