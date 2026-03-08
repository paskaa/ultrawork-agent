"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJsonc = parseJsonc;
exports.deepMerge = deepMerge;
exports.loadConfig = loadConfig;
exports.getAgentConfig = getAgentConfig;
exports.getCategoryConfig = getCategoryConfig;
exports.getModelForAgent = getModelForAgent;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const schema_js_1 = require("./schema.js");
function parseJsonc(content) {
    const cleaned = content
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/.*$/gm, "");
    return JSON.parse(cleaned);
}
function deepMerge(base, override) {
    const result = { ...base };
    for (const key of Object.keys(override)) {
        const overrideValue = override[key];
        if (overrideValue !== undefined) {
            if (typeof overrideValue === "object" && overrideValue !== null && !Array.isArray(overrideValue)) {
                result[key] = deepMerge(base[key] || {}, overrideValue);
            }
            else {
                result[key] = overrideValue;
            }
        }
    }
    return result;
}
const defaultConfig = {
    agents: schema_js_1.DEFAULT_AGENTS,
    categories: schema_js_1.DEFAULT_CATEGORIES,
    task_routing: {
        rules: schema_js_1.DEFAULT_ROUTING_RULES,
        default_category: "deep",
        default_agent: "zhaoyun",
    },
    background_task: {
        defaultConcurrency: 5,
        staleTimeoutMs: 180000,
        providerConcurrency: {
            "zai-coding-plan": 5,
            "opencode": 10,
            "kimi-for-coding": 3,
        },
    },
    runtime_fallback: {
        enabled: true,
        retry_on_errors: [400, 429, 503, 529],
        max_fallback_attempts: 3,
        cooldown_seconds: 60,
        notify_on_fallback: true,
    },
    ultrawork: {
        triggers: ["/ulw", "/ultrawork", "ulw", "ultrawork"],
        default_orchestrator: "zhugeliang",
        auto_category_detection: true,
        parallel_execution: true,
        max_concurrent_agents: 5,
        progress_reporting: true,
    },
};
function loadConfig(directory) {
    const configPaths = [
        path.join(directory, ".opencode", "ultrawork-sanguo.jsonc"),
        path.join(directory, ".opencode", "ultrawork-sanguo.json"),
    ];
    let userConfig = {};
    for (const configPath of configPaths) {
        if (fs.existsSync(configPath)) {
            try {
                const content = fs.readFileSync(configPath, "utf-8");
                const rawConfig = parseJsonc(content);
                const result = schema_js_1.UltraWorkSanguoConfigSchema.safeParse(rawConfig);
                if (result.success) {
                    userConfig = result.data;
                    console.log(`[UltraWork] Config loaded from ${configPath}`);
                    break;
                }
                else {
                    console.warn(`[UltraWork] Config validation error in ${configPath}`);
                }
            }
            catch (err) {
                console.warn(`[UltraWork] Error loading config from ${configPath}:`, err);
            }
        }
    }
    return deepMerge(defaultConfig, userConfig);
}
function getAgentConfig(config, agentName) {
    const disabled = config.disabled_agents ?? [];
    if (disabled.includes(agentName)) {
        return undefined;
    }
    return config.agents?.[agentName];
}
function getCategoryConfig(config, categoryName) {
    const disabled = config.disabled_categories ?? [];
    if (disabled.includes(categoryName)) {
        return undefined;
    }
    return config.categories?.[categoryName];
}
function getModelForAgent(config, agentName) {
    const agentConfig = getAgentConfig(config, agentName);
    return agentConfig?.model;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbmZpZy9sb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFLQSxnQ0FLQztBQUVELDhCQWdCQztBQW9DRCxnQ0E0QkM7QUFFRCx3Q0FNQztBQUVELDhDQU1DO0FBRUQsNENBR0M7QUFqSEQsdUNBQXdCO0FBQ3hCLDJDQUE0QjtBQUM1QiwyQ0FBb0g7QUFHcEgsU0FBZ0IsVUFBVSxDQUFJLE9BQWU7SUFDM0MsTUFBTSxPQUFPLEdBQUcsT0FBTztTQUNwQixPQUFPLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxDQUFDO1NBQ2hDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDM0IsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBTSxDQUFBO0FBQ2pDLENBQUM7QUFFRCxTQUFnQixTQUFTLENBQW9DLElBQU8sRUFBRSxRQUFvQjtJQUN4RixNQUFNLE1BQU0sR0FBRyxFQUFFLEdBQUcsSUFBSSxFQUFPLENBQUE7SUFDL0IsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBZ0IsRUFBRSxDQUFDO1FBQ3ZELE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNuQyxJQUFJLGFBQWEsS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUNoQyxJQUFJLE9BQU8sYUFBYSxLQUFLLFFBQVEsSUFBSSxhQUFhLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDO2dCQUNqRyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUNwQixJQUFJLENBQUMsR0FBRyxDQUE2QixJQUFJLEVBQUUsRUFDNUMsYUFBd0MsQ0FDM0IsQ0FBQTtZQUNqQixDQUFDO2lCQUFNLENBQUM7Z0JB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USxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7UUFDakMsT0FBTyxTQUFTLENBQUE7SUFDbEIsQ0FBQztJQUNELE9BQU8sTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQ25DLENBQUM7QUFFRCxTQUFnQixpQkFBaUIsQ0FBQyxNQUE2QixFQUFFLFlBQW9CO0lBQ25GLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxtQkFBbUIsSUFBSSxFQUFFLENBQUE7SUFDakQsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7UUFDcEMsT0FBTyxTQUFTLENBQUE7SUFDbEIsQ0FBQztJQUNELE9BQU8sTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFBO0FBQzFDLENBQUM7QUFFRCxTQUFnQixnQkFBZ0IsQ0FBQyxNQUE2QixFQUFFLFNBQWlCO0lBQy9FLE1BQU0sV0FBVyxHQUFHLGNBQWMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUE7SUFDckQsT0FBTyxXQUFXLEVBQUUsS0FBSyxDQUFBO0FBQzNCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnNcIlxuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiXG5pbXBvcnQgeyBVbHRyYVdvcmtTYW5ndW9Db25maWdTY2hlbWEsIERFRkFVTFRfQUdFTlRTLCBERUZBVUxUX0NBVEVHT1JJRVMsIERFRkFVTFRfUk9VVElOR19SVUxFUyB9IGZyb20gXCIuL3NjaGVtYS5qc1wiXG5pbXBvcnQgdHlwZSB7IFVsdHJhV29ya1Nhbmd1b0NvbmZpZywgQWdlbnRDb25maWcsIENhdGVnb3J5Q29uZmlnIH0gZnJvbSBcIi4vc2NoZW1hLmpzXCJcblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlSnNvbmM8VD4oY29udGVudDogc3RyaW5nKTogVCB7XG4gIGNvbnN0IGNsZWFuZWQgPSBjb250ZW50XG4gICAgLnJlcGxhY2UoL1xcL1xcKltcXHNcXFNdKj9cXCpcXC8vZywgXCJcIilcbiAgICAucmVwbGFjZSgvXFwvXFwvLiokL2dtLCBcIlwiKVxuICByZXR1cm4gSlNPTi5wYXJzZShjbGVhbmVkKSBhcyBUXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWVwTWVyZ2U8VCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHVua25vd24+PihiYXNlOiBULCBvdmVycmlkZTogUGFydGlhbDxUPik6IFQge1xuICBjb25zdCByZXN1bHQgPSB7IC4uLmJhc2UgfSBhcyBUXG4gIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKG92ZXJyaWRlKSBhcyAoa2V5b2YgVClbXSkge1xuICAgIGNvbnN0IG92ZXJyaWRlVmFsdWUgPSBvdmVycmlkZVtrZXldXG4gICAgaWYgKG92ZXJyaWRlVmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHR5cGVvZiBvdmVycmlkZVZhbHVlID09PSBcIm9iamVjdFwiICYmIG92ZXJyaWRlVmFsdWUgIT09IG51bGwgJiYgIUFycmF5LmlzQXJyYXkob3ZlcnJpZGVWYWx1ZSkpIHtcbiAgICAgICAgcmVzdWx0W2tleV0gPSBkZWVwTWVyZ2UoXG4gICAgICAgICAgKGJhc2Vba2V5XSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgfHwge30sXG4gICAgICAgICAgb3ZlcnJpZGVWYWx1ZSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPlxuICAgICAgICApIGFzIFRba2V5b2YgVF1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gb3ZlcnJpZGVWYWx1ZSBhcyBUW2tleW9mIFRdXG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHRcbn1cblxuY29uc3QgZGVmYXVsdENvbmZpZzogVWx0cmFXb3JrU2FuZ3VvQ29uZmlnID0ge1xuICBhZ2VudHM6IERFRkFVTFRfQUdFTlRTLFxuICBjYXRlZ29yaWVzOiBERUZBVUxUX0NBVEVHT1JJRVMsXG4gIHRhc2tfcm91dGluZzoge1xuICAgIHJ1bGVzOiBERUZBVUxUX1JPVVRJTkdfUlVMRVMsXG4gICAgZGVmYXVsdF9jYXRlZ29yeTogXCJkZWVwXCIsXG4gICAgZGVmYXVsdF9hZ2VudDogXCJ6aGFveXVuXCIsXG4gIH0sXG4gIGJhY2tncm91bmRfdGFzazoge1xuICAgIGRlZmF1bHRDb25jdXJyZW5jeTogNSxcbiAgICBzdGFsZVRpbWVvdXRNczogMTgwMDAwLFxuICAgIHByb3ZpZGVyQ29uY3VycmVuY3k6IHtcbiAgICAgIFwiemFpLWNvZGluZy1wbGFuXCI6IDUsXG4gICAgICBcIm9wZW5jb2RlXCI6IDEwLFxuICAgICAgXCJraW1pLWZvci1jb2RpbmdcIjogMyxcbiAgICB9LFxuICB9LFxuICBydW50aW1lX2ZhbGxiYWNrOiB7XG4gICAgZW5hYmxlZDogdHJ1ZSxcbiAgICByZXRyeV9vbl9lcnJvcnM6IFs0MDAsIDQyOSwgNTAzLCA1MjldLFxuICAgIG1heF9mYWxsYmFja19hdHRlbXB0czogMyxcbiAgICBjb29sZG93bl9zZWNvbmRzOiA2MCxcbiAgICBub3RpZnlfb25fZmFsbGJhY2s6IHRydWUsXG4gIH0sXG4gIHVsdHJhd29yazoge1xuICAgIHRyaWdnZXJzOiBbXCIvdWx3XCIsIFwiL3VsdHJhd29ya1wiLCBcInVsd1wiLCBcInVsdHJhd29ya1wiXSxcbiAgICBkZWZhdWx0X29yY2hlc3RyYXRvcjogXCJ6aHVnZWxpYW5nXCIsXG4gICAgYXV0b19jYXRlZ29yeV9kZXRlY3Rpb246IHRydWUsXG4gICAgcGFyYWxsZWxfZXhlY3V0aW9uOiB0cnVlLFxuICAgIG1heF9jb25jdXJyZW50X2FnZW50czogNSxcbiAgICBwcm9ncmVzc19yZXBvcnRpbmc6IHRydWUsXG4gIH0sXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkQ29uZmlnKGRpcmVjdG9yeTogc3RyaW5nKTogVWx0cmFXb3JrU2FuZ3VvQ29uZmlnIHtcbiAgY29uc3QgY29uZmlnUGF0aHMgPSBbXG4gICAgcGF0aC5qb2luKGRpcmVjdG9yeSwgXCIub3BlbmNvZGVcIiwgXCJ1bHRyYXdvcmstc2FuZ3VvLmpzb25jXCIpLFxuICAgIHBhdGguam9pbihkaXJlY3RvcnksIFwiLm9wZW5jb2RlXCIsIFwidWx0cmF3b3JrLXNhbmd1by5qc29uXCIpLFxuICBdXG5cbiAgbGV0IHVzZXJDb25maWc6IFBhcnRpYWw8VWx0cmFXb3JrU2FuZ3VvQ29uZmlnPiA9IHt9XG5cbiAgZm9yIChjb25zdCBjb25maWdQYXRoIG9mIGNvbmZpZ1BhdGhzKSB7XG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoY29uZmlnUGF0aCkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoY29uZmlnUGF0aCwgXCJ1dGYtOFwiKVxuICAgICAgICBjb25zdCByYXdDb25maWcgPSBwYXJzZUpzb25jPFJlY29yZDxzdHJpbmcsIHVua25vd24+Pihjb250ZW50KVxuICAgICAgICBjb25zdCByZXN1bHQgPSBVbHRyYVdvcmtTYW5ndW9Db25maWdTY2hlbWEuc2FmZVBhcnNlKHJhd0NvbmZpZylcbiAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgdXNlckNvbmZpZyA9IHJlc3VsdC5kYXRhIGFzIFBhcnRpYWw8VWx0cmFXb3JrU2FuZ3VvQ29uZmlnPlxuICAgICAgICAgIGNvbnNvbGUubG9nKGBbVWx0cmFXb3JrXSBDb25maWcgbG9hZGVkIGZyb20gJHtjb25maWdQYXRofWApXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oYFtVbHRyYVdvcmtdIENvbmZpZyB2YWxpZGF0aW9uIGVycm9yIGluICR7Y29uZmlnUGF0aH1gKVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBbVWx0cmFXb3JrXSBFcnJvciBsb2FkaW5nIGNvbmZpZyBmcm9tICR7Y29uZmlnUGF0aH06YCwgZXJyKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBkZWVwTWVyZ2UoZGVmYXVsdENvbmZpZywgdXNlckNvbmZpZyBhcyBQYXJ0aWFsPFVsdHJhV29ya1Nhbmd1b0NvbmZpZz4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBZ2VudENvbmZpZyhjb25maWc6IFVsdHJhV29ya1Nhbmd1b0NvbmZpZywgYWdlbnROYW1lOiBzdHJpbmcpOiBBZ2VudENvbmZpZyB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IGRpc2FibGVkID0gY29uZmlnLmRpc2FibGVkX2FnZW50cyA/PyBbXVxuICBpZiAoZGlzYWJsZWQuaW5jbHVkZXMoYWdlbnROYW1lKSkge1xuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuICByZXR1cm4gY29uZmlnLmFnZW50cz8uW2FnZW50TmFtZV1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENhdGVnb3J5Q29uZmlnKGNvbmZpZzogVWx0cmFXb3JrU2FuZ3VvQ29uZmlnLCBjYXRlZ29yeU5hbWU6IHN0cmluZyk6IENhdGVnb3J5Q29uZmlnIHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgZGlzYWJsZWQgPSBjb25maWcuZGlzYWJsZWRfY2F0ZWdvcmllcyA/PyBbXVxuICBpZiAoZGlzYWJsZWQuaW5jbHVkZXMoY2F0ZWdvcnlOYW1lKSkge1xuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuICByZXR1cm4gY29uZmlnLmNhdGVnb3JpZXM/LltjYXRlZ29yeU5hbWVdXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRNb2RlbEZvckFnZW50KGNvbmZpZzogVWx0cmFXb3JrU2FuZ3VvQ29uZmlnLCBhZ2VudE5hbWU6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IGFnZW50Q29uZmlnID0gZ2V0QWdlbnRDb25maWcoY29uZmlnLCBhZ2VudE5hbWUpXG4gIHJldHVybiBhZ2VudENvbmZpZz8ubW9kZWxcbn0iXX0=