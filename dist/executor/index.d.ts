import type { CategoryModel, DelegateTaskArgs, SessionCreateResult, TaskResult } from "./types.js";
import type { UltraWorkSanguoConfig } from "../config/schema.js";
export declare function parseModelString(model: string): CategoryModel | null;
export declare function createSyncSession(client: {
    session: {
        get?: (args: {
            path: {
                id: string;
            };
        }) => Promise<{
            data?: {
                directory?: string;
            };
        }>;
        create: (args: {
            body: Record<string, unknown>;
            query?: Record<string, unknown>;
        }) => Promise<{
            data: {
                id: string;
            };
            error?: unknown;
        }>;
    };
}, input: {
    parentSessionID: string;
    agentToUse: string;
    description: string;
    defaultDirectory: string;
}): Promise<SessionCreateResult>;
export declare function sendPromptWithModel(client: {
    prompt: {
        create: (args: {
            path: {
                id: string;
            };
            body: {
                agent?: string;
                system?: string;
                parts: Array<{
                    type: string;
                    text: string;
                }>;
                model?: {
                    providerID: string;
                    modelID: string;
                };
                variant?: string;
                tools?: Record<string, boolean>;
            };
        }) => Promise<{
            error?: unknown;
        }>;
    };
}, input: {
    sessionID: string;
    agentToUse: string;
    prompt: string;
    systemContent?: string;
    categoryModel?: CategoryModel;
}): Promise<{
    ok: true;
} | {
    ok: false;
    error: string;
}>;
export declare function pollSessionUntilComplete(client: {
    session: {
        get: (args: {
            path: {
                id: string;
            };
        }) => Promise<{
            data?: {
                status?: string;
                busy?: boolean;
            };
        }>;
    };
}, sessionID: string, timeoutMs?: number): Promise<{
    ok: true;
} | {
    ok: false;
    error: string;
}>;
export declare function fetchSessionResult(client: {
    message: {
        list: (args: {
            path: {
                id: string;
            };
            query?: {
                limit?: number;
            };
        }) => Promise<{
            data?: Array<{
                role: string;
                content?: Array<{
                    type: string;
                    text?: string;
                }>;
            }>;
        }>;
    };
}, sessionID: string): Promise<TaskResult>;
interface ExecutionContext {
    client: {
        session: {
            get: (args: {
                path: {
                    id: string;
                };
            }) => Promise<{
                data?: {
                    directory?: string;
                    status?: string;
                    busy?: boolean;
                };
            }>;
            create: (args: {
                body: Record<string, unknown>;
                query?: Record<string, unknown>;
            }) => Promise<{
                data: {
                    id: string;
                };
                error?: unknown;
            }>;
        };
        prompt: {
            create: (args: {
                path: {
                    id: string;
                };
                body: {
                    agent?: string;
                    system?: string;
                    parts: Array<{
                        type: string;
                        text: string;
                    }>;
                    model?: {
                        providerID: string;
                        modelID: string;
                    };
                    variant?: string;
                    tools?: Record<string, boolean>;
                };
            }) => Promise<{
                error?: unknown;
            }>;
        };
        message: {
            list: (args: {
                path: {
                    id: string;
                };
                query?: {
                    limit?: number;
                };
            }) => Promise<{
                data?: Array<{
                    role: string;
                    content?: Array<{
                        type: string;
                        text?: string;
                    }>;
                }>;
            }>;
        };
    };
    sessionID: string;
    directory: string;
}
export declare function executeSyncTask(args: DelegateTaskArgs, ctx: ExecutionContext, config: UltraWorkSanguoConfig, agentName: string, categoryModel?: CategoryModel): Promise<string>;
export {};
