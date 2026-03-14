import { tool } from "@opencode-ai/plugin/tool";
import { loadConfig } from "./config/loader.js";
import { routeTask, routeByAgent } from "./agents/router.js";
import { executeSyncTask, parseModelString } from "./executor/index.js";
import { injectServerAuthIntoClient } from "./auth.js";
import { resolveModel } from "./config/model-resolver.js";
const configCache = new Map();
function getConfig(directory) {
    // 禁用缓存，每次都重新加载配置
    // if (!configCache.has(directory)) {
    //     configCache.set(directory, loadConfig(directory));
    // }
    // return configCache.get(directory)!;
    const config = loadConfig(directory);
    console.log('[UltraWork-SanGuo] 配置已加载，zhugeliang模型:', config.agents?.zhugeliang?.model);
    return config;
}
function parseAgentMention(prompt, availableAgents) {
    const mentionRegex = /@([a-zA-Z_][a-zA-Z0-9_]*)/g;
    let match;
    let detectedAgent = null;
    let cleanPrompt = prompt;
    while ((match = mentionRegex.exec(prompt)) !== null) {
        const mentionedName = match[1].toLowerCase();
        const matchedAgent = availableAgents.find((agent) => agent.toLowerCase() === mentionedName);
        if (matchedAgent) {
            detectedAgent = matchedAgent;
            cleanPrompt = cleanPrompt.replace(match[0], "").trim();
            break;
        }
    }
    return { agent: detectedAgent, cleanPrompt };
}
// Agent 名称映射到 OpenCode subagent_type
const agentToSubagentMap = {
    zhugeliang: "Sisyphus",
    zhouyu: "Prometheus",
    zhaoyun: "Sisyphus",
    simayi: "Explore",
    guanyu: "Sisyphus",
    zhangfei: "Sisyphus",
};
const UltraWorkSanguoPlugin = async (ctx) => {
    console.log("[UltraWork-SanGuo] 🏰 三国军团调度系统启动...");
    console.log("[UltraWork-SanGuo] Plugin version: 2.0.2-fixed");
    console.log("[UltraWork-SanGuo] Default timeout: 60000ms");
    // 注入 Basic Auth 认证（关键！）
    injectServerAuthIntoClient(ctx.client);
    // 尝试使用 setConfig 设置 headers
    try {
        const auth = Buffer.from(`opencode:${process.env.OPENCODE_SERVER_PASSWORD || ""}`).toString("base64");
        if (ctx.client && typeof ctx.client.setConfig === "function") {
            ctx.client.setConfig({
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            });
            console.log("[UltraWork-SanGuo] Auth header set via setConfig");
        }
    }
    catch (e) {
        console.log("[UltraWork-SanGuo] Failed to set auth via setConfig:", e);
    }
    const config = getConfig(ctx.directory);
    console.log("[UltraWork-SanGuo] ✅ 配置加载完成");
    console.log("[UltraWork-SanGuo] 将领:", Object.keys(config.agents ?? {}).join(", "));
    console.log("[UltraWork-SanGuo] 类别:", Object.keys(config.categories ?? {}).join(", "));
    const agents = config.agents ?? {};
    const categories = config.categories ?? {};
    const agentList = Object.entries(agents)
        .map(([name, cfg]) => {
        const agentCfg = cfg;
        return `  - ${name}: ${agentCfg.model ?? "default"} - ${agentCfg.description ?? ""}`;
    })
        .join("\n");
    const categoryList = Object.entries(categories)
        .map(([name, cfg]) => {
        const catCfg = cfg;
        return `  - ${name}: ${catCfg.description ?? ""}`;
    })
        .join("\n");
    const ultraworkTask = tool({
        description: `UltraWork 三国军团任务分发工具。

根据任务自动路由到对应的将领和模型。

**可用将领:**
${agentList}

**任务类别:**
${categoryList}

**使用方式:**
1. prompt 中使用 @将领名: 直接使用指定将领及其模型
   示例: @lusu 分析这个需求的可行性
2. 指定 category: 自动选择该类别的将领和模型
3. 指定 agent: 直接使用指定将领及其模型
4. 都不指定: 根据任务关键词自动检测类别

**注意:** 此工具会调用 OpenCode 内置的 task 工具执行实际任务`,
        args: {
            description: tool.schema.string().describe("任务简短描述 (3-5 词)"),
            prompt: tool.schema.string().describe("详细的任务内容 (可用 @将领名 指定将领)"),
            category: tool.schema.string().optional().describe("任务类别 (可选)"),
            agent: tool.schema.string().optional().describe("将领名称 (可选)"),
        },
        async execute(args, toolCtx) {
            // 在 tool 执行时设置认证
            try {
                const password = process.env.OPENCODE_SERVER_PASSWORD;
                if (password && ctx.client && typeof ctx.client.setConfig === "function") {
                    const token = Buffer.from(`opencode:${password}`).toString("base64");
                    ctx.client.setConfig({
                        headers: {
                            Authorization: `Basic ${token}`,
                        },
                    });
                }
            }
            catch (e) {
                console.log("[UltraWork-SanGuo] Failed to set auth:", e);
            }
            const cfg = getConfig(ctx.directory);
            const agentsCfg = cfg.agents ?? {};
            const categoriesCfg = cfg.categories ?? {};
            const availableAgents = Object.keys(agentsCfg);
            // 解析 @武将名 语法
            const parsedPrompt = parseAgentMention(args.prompt, availableAgents);
            let actualPrompt = parsedPrompt.cleanPrompt;
            let agentFromPrompt = parsedPrompt.agent;
            // 解析路由
            let agentName;
            let categoryName;
            let model;
            // 优先级: agent 参数 > @武将名 > category 参数 > 自动检测
            if (args.agent) {
                const routing = routeByAgent(cfg, args.agent);
                if (routing) {
                    agentName = routing.primaryAgent;
                    categoryName = routing.category;
                    model = routing.model;
                }
                else {
                    agentName = args.agent;
                    const agentCfg = agentsCfg[agentName];
                    model = agentCfg?.model;
                }
            }
            else if (agentFromPrompt) {
                const routing = routeByAgent(cfg, agentFromPrompt);
                if (routing) {
                    agentName = routing.primaryAgent;
                    categoryName = routing.category;
                    model = routing.model;
                }
                else {
                    agentName = agentFromPrompt;
                    const agentCfg = agentsCfg[agentName];
                    model = agentCfg?.model;
                }
                console.log(`[UltraWork-SanGuo] 从 prompt 解析到将领: @${agentFromPrompt}`);
            }
            else if (args.category) {
                categoryName = args.category;
                const categoryConfig = categoriesCfg[categoryName];
                agentName = categoryConfig?.primaryAgent ?? cfg.task_routing?.default_agent ?? "zhaoyun";
                const agentCfg = agentsCfg[agentName];
                model = categoryConfig?.model ?? agentCfg?.model;
            }
            else {
                const routing = routeTask(cfg, args.description);
                agentName = routing.primaryAgent;
                categoryName = routing.category;
                model = routing.model;
            }
            console.log(`[UltraWork-SanGuo] 路由结果:`);
            console.log(`  类别: ${categoryName ?? "auto"}`);
            console.log(`  将领: ${agentName}`);
            console.log(`  模型(原始): ${model ?? "default"}`);
            // 解析内部模型key为完整模型ID
            const resolvedModel = model ? resolveModel(model) : undefined;
            console.log(`  模型(解析后): ${resolvedModel ?? "default"}`);
            // 解析模型
            const categoryModel = resolvedModel ? parseModelString(resolvedModel) : undefined;
            // 映射到 OpenCode subagent_type
            const subagentType = agentToSubagentMap[agentName] ?? "Sisyphus";
            // 构建系统提示
            const agentCfg = agentsCfg[agentName];
            const systemContent = agentCfg?.prompt_append ?? `你是${agentCfg?.description ?? agentName}。`;
            // 设置元数据
            toolCtx.metadata({
                title: args.description,
                metadata: {
                    agent: agentName,
                    category: categoryName,
                    model: model ?? "default",
                    subagent_type: subagentType,
                },
            });
            // 执行任务
            console.log("[UltraWork-SanGuo] 开始执行任务，agentName:", agentName);
            try {
                return await executeSyncTask({
                    description: args.description,
                    prompt: actualPrompt,
                    category: categoryName,
                    agent: agentName,
                }, {
                    client: ctx.client,
                    sessionID: toolCtx.sessionID,
                    directory: toolCtx.directory,
                }, cfg, agentName, categoryModel ?? undefined);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error("[UltraWork-SanGuo] Task execution failed:", errorMessage);
                // 如果执行失败，建议用户使用内置 task 工具
                return `❌ 任务执行失败: ${errorMessage}

💡 **建议:** 请直接使用 OpenCode 内置的 task 工具执行此任务:

\`\`\`json
{
  "tool": "task",
  "description": "${args.description}",
  "prompt": "${systemContent}\\n\\n${actualPrompt.replace(/"/g, '\\"')}",
  "subagent_type": "${subagentType}"
}
\`\`\`

或者使用快捷命令:

\`/ulw ${args.agent ? "@" + agentName + " " : ""}${actualPrompt}\``;
            }
        },
    });
    return {
        tool: {
            ultrawork_task: ultraworkTask,
        },
    };
};
export default UltraWorkSanguoPlugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLDBCQUEwQixDQUFBO0FBRS9DLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUMvQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBQzVELE9BQU8sRUFBRSxlQUFlLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQTtBQUN2RSxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSxXQUFXLENBQUE7QUFFdEQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDRCQUE0QixDQUFBO0FBRXpELE1BQU0sV0FBVyxHQUFHLElBQUksR0FBRyxFQUFpQyxDQUFBO0FBRTVELFNBQVMsU0FBUyxDQUFDLFNBQWlCO0lBQ2xDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7UUFDaEMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUE7SUFDbkQsQ0FBQztJQUNELE9BQU8sV0FBVyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUUsQ0FBQTtBQUNwQyxDQUFDO0FBT0QsU0FBUyxpQkFBaUIsQ0FBQyxNQUFjLEVBQUUsZUFBeUI7SUFDbEUsTUFBTSxZQUFZLEdBQUcsNEJBQTRCLENBQUE7SUFDakQsSUFBSSxLQUE2QixDQUFBO0lBQ2pDLElBQUksYUFBYSxHQUFrQixJQUFJLENBQUE7SUFDdkMsSUFBSSxXQUFXLEdBQUcsTUFBTSxDQUFBO0lBRXhCLE9BQU8sQ0FBQyxLQUFLLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDO1FBQ3BELE1BQU0sYUFBYSxHQUFHLEtBQUss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LEdBQUcsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO2dCQUMzRSxPQUFPLENBQUMsS0FBSyxDQUFDLDJDQUEyQyxFQUFFLFlBQVksQ0FBQyxDQUFBO2dCQUV4RSwwQkFBMEI7Z0JBQzFCLE9BQU8sYUFBYSxZQUFZOzs7Ozs7O29CQU9wQixJQUFJLENBQUMsV0FBVztlQUNyQixhQUFhLFNBQVMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDO3NCQUNoRCxZQUFZOzs7Ozs7U0FNekIsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLFNBQVMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxZQUFZLElBQUksQ0FBQTtZQUM3RCxDQUFDO1FBQ0gsQ0FBQztLQUNGLENBQUMsQ0FBQTtJQUVGLE9BQU87UUFDTCxJQUFJLEVBQUU7WUFDSixjQUFjLEVBQUUsYUFBYTtTQUM5QjtLQUNGLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxlQUFlLHFCQUFxQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdG9vbCB9IGZyb20gXCJAb3BlbmNvZGUtYWkvcGx1Z2luL3Rvb2xcIlxuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tIFwiQG9wZW5jb2RlLWFpL3BsdWdpblwiXG5pbXBvcnQgeyBsb2FkQ29uZmlnIH0gZnJvbSBcIi4vY29uZmlnL2xvYWRlci5qc1wiXG5pbXBvcnQgeyByb3V0ZVRhc2ssIHJvdXRlQnlBZ2VudCB9IGZyb20gXCIuL2FnZW50cy9yb3V0ZXIuanNcIlxuaW1wb3J0IHsgZXhlY3V0ZVN5bmNUYXNrLCBwYXJzZU1vZGVsU3RyaW5nIH0gZnJvbSBcIi4vZXhlY3V0b3IvaW5kZXguanNcIlxuaW1wb3J0IHsgaW5qZWN0U2VydmVyQXV0aEludG9DbGllbnQgfSBmcm9tIFwiLi9hdXRoLmpzXCJcbmltcG9ydCB0eXBlIHsgVWx0cmFXb3JrU2FuZ3VvQ29uZmlnLCBBZ2VudENvbmZpZywgQ2F0ZWdvcnlDb25maWcgfSBmcm9tIFwiLi9jb25maWcvc2NoZW1hLmpzXCJcbmltcG9ydCB7IHJlc29sdmVNb2RlbCB9IGZyb20gXCIuL2NvbmZpZy9tb2RlbC1yZXNvbHZlci5qc1wiXG5cbmNvbnN0IGNvbmZpZ0NhY2hlID0gbmV3IE1hcDxzdHJpbmcsIFVsdHJhV29ya1Nhbmd1b0NvbmZpZz4oKVxuXG5mdW5jdGlvbiBnZXRDb25maWcoZGlyZWN0b3J5OiBzdHJpbmcpOiBVbHRyYVdvcmtTYW5ndW9Db25maWcge1xuICBpZiAoIWNvbmZpZ0NhY2hlLmhhcyhkaXJlY3RvcnkpKSB7XG4gICAgY29uZmlnQ2FjaGUuc2V0KGRpcmVjdG9yeSwgbG9hZENvbmZpZyhkaXJlY3RvcnkpKVxuICB9XG4gIHJldHVybiBjb25maWdDYWNoZS5nZXQoZGlyZWN0b3J5KSFcbn1cblxuaW50ZXJmYWNlIFBhcnNlZFByb21wdCB7XG4gIGFnZW50OiBzdHJpbmcgfCBudWxsXG4gIGNsZWFuUHJvbXB0OiBzdHJpbmdcbn1cblxuZnVuY3Rpb24gcGFyc2VBZ2VudE1lbnRpb24ocHJvbXB0OiBzdHJpbmcsIGF2YWlsYWJsZUFnZW50czogc3RyaW5nW10pOiBQYXJzZWRQcm9tcHQge1xuICBjb25zdCBtZW50aW9uUmVnZXggPSAvQChbYS16QS1aX11bYS16QS1aMC05X10qKS9nXG4gIGxldCBtYXRjaDogUmVnRXhwRXhlY0FycmF5IHwgbnVsbFxuICBsZXQgZGV0ZWN0ZWRBZ2VudDogc3RyaW5nIHwgbnVsbCA9IG51bGxcbiAgbGV0IGNsZWFuUHJvbXB0ID0gcHJvbXB0XG5cbiAgd2hpbGUgKChtYXRjaCA9IG1lbnRpb25SZWdleC5leGVjKHByb21wdCkpICE9PSBudWxsKSB7XG4gICAgY29uc3QgbWVudGlvbmVkTmFtZSA9IG1hdGNoWzFdLnRvTG93ZXJDYXNlKClcbiAgICBjb25zdCBtYXRjaGVkQWdlbnQgPSBhdmFpbGFibGVBZ2VudHMuZmluZChcbiAgICAgIChhZ2VudCkgPT4gYWdlbnQudG9Mb3dlckNhc2UoKSA9PT0gbWVudGlvbmVkTmFtZVxuICAgIClcbiAgICBpZiAobWF0Y2hlZEFnZW50KSB7XG4gICAgICBkZXRlY3RlZEFnZW50ID0gbWF0Y2hlZEFnZW50XG4gICAgICBjbGVhblByb21wdCA9IGNsZWFuUHJvbXB0LnJlcGxhY2UobWF0Y2hbMF0sIFwiXCIpLnRyaW0oKVxuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICByZXR1cm4geyBhZ2VudDogZGV0ZWN0ZWRBZ2VudCwgY2xlYW5Qcm9tcHQgfVxufVxuXG4vLyBBZ2VudCDlkI3np7DmmKDlsITliLAgT3BlbkNvZGUgc3ViYWdlbnRfdHlwZVxuY29uc3QgYWdlbnRUb1N1YmFnZW50TWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICB6aHVnZWxpYW5nOiBcIlNpc3lwaHVzXCIsXG4gIHpob3V5dTogXCJQcm9tZXRoZXVzXCIsIFxuICB6aGFveXVuOiBcIlNpc3lwaHVzXCIsXG4gIHNpbWF5aTogXCJFeHBsb3JlXCIsXG4gIGd1YW55dTogXCJTaXN5cGh1c1wiLFxuICB6aGFuZ2ZlaTogXCJTaXN5cGh1c1wiLFxufVxuXG5jb25zdCBVbHRyYVdvcmtTYW5ndW9QbHVnaW46IFBsdWdpbiA9IGFzeW5jIChjdHgpID0+IHtcbiAgY29uc29sZS5sb2coXCJbVWx0cmFXb3JrLVNhbkd1b10g8J+PsCDkuInlm73lhpvlm6LosIPluqbns7vnu5/lkK/liqguLi5cIilcbiAgY29uc29sZS5sb2coXCJbVWx0cmFXb3JrLVNhbkd1b10gUGx1Z2luIHZlcnNpb246IDIuMC4yLWZpeGVkXCIpXG4gIGNvbnNvbGUubG9nKFwiW1VsdHJhV29yay1TYW5HdW9dIERlZmF1bHQgdGltZW91dDogNjAwMDBtc1wiKVxuICBcbiAgLy8g5rOo5YWlIEJhc2ljIEF1dGgg6K6k6K+B77yI5YWz6ZSu77yB77yJXG4gIGluamVjdFNlcnZlckF1dGhJbnRvQ2xpZW50KGN0eC5jbGllbnQpXG4gIFxuICAvLyDlsJ3or5Xkvb/nlKggc2V0Q29uZmlnIOiuvue9riBoZWFkZXJzXG4gIHRyeSB7XG4gICAgY29uc3QgYXV0aCA9IEJ1ZmZlci5mcm9tKGBvcGVuY29kZToke3Byb2Nlc3MuZW52Lk9QRU5DT0RFX1NFUlZFUl9QQVNTV09SRCB8fCBcIlwifWApLnRvU3RyaW5nKFwiYmFzZTY0XCIpXG4gICAgaWYgKGN0eC5jbGllbnQgJiYgdHlwZW9mIChjdHguY2xpZW50IGFzIGFueSkuc2V0Q29uZmlnID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIChjdHguY2xpZW50IGFzIGFueSkuc2V0Q29uZmlnKHtcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgIEF1dGhvcml6YXRpb246IGBCYXNpYyAke2F1dGh9YCxcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgICBjb25zb2xlLmxvZyhcIltVbHRyYVdvcmstU2FuR3VvXSBBdXRoIGhlYWRlciBzZXQgdmlhIHNldENvbmZpZ1wiKVxuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUubG9nKFwiW1VsdHJhV29yay1TYW5HdW9dIEZhaWxlZCB0byBzZXQgYXV0aCB2aWEgc2V0Q29uZmlnOlwiLCBlKVxuICB9XG4gIFxuICBjb25zdCBjb25maWcgPSBnZXRDb25maWcoY3R4LmRpcmVjdG9yeSlcbiAgY29uc29sZS5sb2coXCJbVWx0cmFXb3JrLVNhbkd1b10g4pyFIOmFjee9ruWKoOi9veWujOaIkFwiKVxuICBjb25zb2xlLmxvZyhcIltVbHRyYVdvcmstU2FuR3VvXSDlsIbpooY6XCIsIE9iamVjdC5rZXlzKGNvbmZpZy5hZ2VudHMgPz8ge30pLmpvaW4oXCIsIFwiKSlcbiAgY29uc29sZS5sb2coXCJbVWx0cmFXb3JrLVNhbkd1b10g57G75YirOlwiLCBPYmplY3Qua2V5cyhjb25maWcuY2F0ZWdvcmllcyA/PyB7fSkuam9pbihcIiwgXCIpKVxuXG4gIGNvbnN0IGFnZW50cyA9IGNvbmZpZy5hZ2VudHMgPz8ge31cbiAgY29uc3QgY2F0ZWdvcmllcyA9IGNvbmZpZy5jYXRlZ29yaWVzID8/IHt9XG5cbiAgY29uc3QgYWdlbnRMaXN0ID0gT2JqZWN0LmVudHJpZXMoYWdlbnRzKVxuICAgIC5tYXAoKFtuYW1lLCBjZmddKSA9PiB7XG4gICAgICBjb25zdCBhZ2VudENmZyA9IGNmZyBhcyBBZ2VudENvbmZpZ1xuICAgICAgcmV0dXJuIGAgIC0gJHtuYW1lfTogJHthZ2VudENmZy5tb2RlbCA/PyBcImRlZmF1bHRcIn0gLSAke2FnZW50Q2ZnLmRlc2NyaXB0aW9uID8/IFwiXCJ9YFxuICAgIH0pXG4gICAgLmpvaW4oXCJcXG5cIilcblxuICBjb25zdCBjYXRlZ29yeUxpc3QgPSBPYmplY3QuZW50cmllcyhjYXRlZ29yaWVzKVxuICAgIC5tYXAoKFtuYW1lLCBjZmddKSA9PiB7XG4gICAgICBjb25zdCBjYXRDZmcgPSBjZmcgYXMgQ2F0ZWdvcnlDb25maWdcbiAgICAgIHJldHVybiBgICAtICR7bmFtZX06ICR7Y2F0Q2ZnLmRlc2NyaXB0aW9uID8/IFwiXCJ9YFxuICAgIH0pXG4gICAgLmpvaW4oXCJcXG5cIilcblxuICBjb25zdCB1bHRyYXdvcmtUYXNrID0gdG9vbCh7XG4gICAgZGVzY3JpcHRpb246IGBVbHRyYVdvcmsg5LiJ5Zu95Yab5Zui5Lu75Yqh5YiG5Y+R5bel5YW344CCXG5cbuagueaNruS7u+WKoeiHquWKqOi3r+eUseWIsOWvueW6lOeahOWwhumihuWSjOaooeWei+OAglxuXG4qKuWPr+eUqOWwhumihjoqKlxuJHthZ2VudExpc3R9XG5cbioq5Lu75Yqh57G75YirOioqXG4ke2NhdGVnb3J5TGlzdH1cblxuKirkvb/nlKjmlrnlvI86KipcbjEuIHByb21wdCDkuK3kvb/nlKggQOWwhumihuWQjTog55u05o6l5L2/55So5oyH5a6a5bCG6aKG5Y+K5YW25qih5Z6LXG4gICDnpLrkvos6IEBsdXN1IOWIhuaekOi/meS4qumcgOaxgueahOWPr+ihjOaAp1xuMi4g5oyH5a6aIGNhdGVnb3J5OiDoh6rliqjpgInmi6nor6XnsbvliKvnmoTlsIbpooblkozmqKHlnotcbjMuIOaMh+WumiBhZ2VudDog55u05o6l5L2/55So5oyH5a6a5bCG6aKG5Y+K5YW25qih5Z6LXG40LiDpg73kuI3mjIflrpo6IOagueaNruS7u+WKoeWFs+mUruivjeiHquWKqOajgOa1i+exu+WIq1xuXG4qKuazqOaEjzoqKiDmraTlt6XlhbfkvJrosIPnlKggT3BlbkNvZGUg5YaF572u55qEIHRhc2sg5bel5YW35omn6KGM5a6e6ZmF5Lu75YqhYCxcbiAgICBhcmdzOiB7XG4gICAgICBkZXNjcmlwdGlvbjogdG9vbC5zY2hlbWEuc3RyaW5nKCkuZGVzY3JpYmUoXCLku7vliqHnroDnn63mj4/ov7AgKDMtNSDor40pXCIpLFxuICAgICAgcHJvbXB0OiB0b29sLnNjaGVtYS5zdHJpbmcoKS5kZXNjcmliZShcIuivpue7hueahOS7u+WKoeWGheWuuSAo5Y+v55SoIEDlsIbpooblkI0g5oyH5a6a5bCG6aKGKVwiKSxcbiAgICAgIGNhdGVnb3J5OiB0b29sLnNjaGVtYS5zdHJpbmcoKS5vcHRpb25hbCgpLmRlc2NyaWJlKFwi5Lu75Yqh57G75YirICjlj6/pgIkpXCIpLFxuICAgICAgYWdlbnQ6IHRvb2wuc2NoZW1hLnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoXCLlsIbpooblkI3np7AgKOWPr+mAiSlcIiksXG4gICAgfSxcbiAgICBhc3luYyBleGVjdXRlKGFyZ3MsIHRvb2xDdHgpIHtcbiAgICAgIC8vIOWcqCB0b29sIOaJp+ihjOaXtuiuvue9ruiupOivgVxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcGFzc3dvcmQgPSBwcm9jZXNzLmVudi5PUEVOQ09ERV9TRVJWRVJfUEFTU1dPUkRcbiAgICAgICAgaWYgKHBhc3N3b3JkICYmIGN0eC5jbGllbnQgJiYgdHlwZW9mIChjdHguY2xpZW50IGFzIGFueSkuc2V0Q29uZmlnID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICBjb25zdCB0b2tlbiA9IEJ1ZmZlci5mcm9tKGBvcGVuY29kZToke3Bhc3N3b3JkfWApLnRvU3RyaW5nKFwiYmFzZTY0XCIpXG4gICAgICAgICAgOyhjdHguY2xpZW50IGFzIGFueSkuc2V0Q29uZmlnKHtcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogYEJhc2ljICR7dG9rZW59YCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIltVbHRyYVdvcmstU2FuR3VvXSBGYWlsZWQgdG8gc2V0IGF1dGg6XCIsIGUpXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNmZyA9IGdldENvbmZpZyhjdHguZGlyZWN0b3J5KVxuICAgICAgY29uc3QgYWdlbnRzQ2ZnID0gY2ZnLmFnZW50cyA/PyB7fVxuICAgICAgY29uc3QgY2F0ZWdvcmllc0NmZyA9IGNmZy5jYXRlZ29yaWVzID8/IHt9XG4gICAgICBjb25zdCBhdmFpbGFibGVBZ2VudHMgPSBPYmplY3Qua2V5cyhhZ2VudHNDZmcpXG5cbiAgICAgIC8vIOino+aekCBA5q2m5bCG5ZCNIOivreazlVxuICAgICAgY29uc3QgcGFyc2VkUHJvbXB0ID0gcGFyc2VBZ2VudE1lbnRpb24oYXJncy5wcm9tcHQsIGF2YWlsYWJsZUFnZW50cylcbiAgICAgIGxldCBhY3R1YWxQcm9tcHQgPSBwYXJzZWRQcm9tcHQuY2xlYW5Qcm9tcHRcbiAgICAgIGxldCBhZ2VudEZyb21Qcm9tcHQgPSBwYXJzZWRQcm9tcHQuYWdlbnRcblxuICAgICAgLy8g6Kej5p6Q6Lev55SxXG4gICAgICBsZXQgYWdlbnROYW1lOiBzdHJpbmdcbiAgICAgIGxldCBjYXRlZ29yeU5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZFxuICAgICAgbGV0IG1vZGVsOiBzdHJpbmcgfCB1bmRlZmluZWRcblxuICAgICAgLy8g5LyY5YWI57qnOiBhZ2VudCDlj4LmlbAgPiBA5q2m5bCG5ZCNID4gY2F0ZWdvcnkg5Y+C5pWwID4g6Ieq5Yqo5qOA5rWLXG4gICAgICBpZiAoYXJncy5hZ2VudCkge1xuICAgICAgICBjb25zdCByb3V0aW5nID0gcm91dGVCeUFnZW50KGNmZywgYXJncy5hZ2VudClcbiAgICAgICAgaWYgKHJvdXRpbmcpIHtcbiAgICAgICAgICBhZ2VudE5hbWUgPSByb3V0aW5nLnByaW1hcnlBZ2VudFxuICAgICAgICAgIGNhdGVnb3J5TmFtZSA9IHJvdXRpbmcuY2F0ZWdvcnlcbiAgICAgICAgICBtb2RlbCA9IHJvdXRpbmcubW9kZWxcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhZ2VudE5hbWUgPSBhcmdzLmFnZW50XG4gICAgICAgICAgY29uc3QgYWdlbnRDZmcgPSBhZ2VudHNDZmdbYWdlbnROYW1lXSBhcyBBZ2VudENvbmZpZyB8IHVuZGVmaW5lZFxuICAgICAgICAgIG1vZGVsID0gYWdlbnRDZmc/Lm1vZGVsXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoYWdlbnRGcm9tUHJvbXB0KSB7XG4gICAgICAgIGNvbnN0IHJvdXRpbmcgPSByb3V0ZUJ5QWdlbnQoY2ZnLCBhZ2VudEZyb21Qcm9tcHQpXG4gICAgICAgIGlmIChyb3V0aW5nKSB7XG4gICAgICAgICAgYWdlbnROYW1lID0gcm91dGluZy5wcmltYXJ5QWdlbnRcbiAgICAgICAgICBjYXRlZ29yeU5hbWUgPSByb3V0aW5nLmNhdGVnb3J5XG4gICAgICAgICAgbW9kZWwgPSByb3V0aW5nLm1vZGVsXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYWdlbnROYW1lID0gYWdlbnRGcm9tUHJvbXB0XG4gICAgICAgICAgY29uc3QgYWdlbnRDZmcgPSBhZ2VudHNDZmdbYWdlbnROYW1lXSBhcyBBZ2VudENvbmZpZyB8IHVuZGVmaW5lZFxuICAgICAgICAgIG1vZGVsID0gYWdlbnRDZmc/Lm1vZGVsXG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYFtVbHRyYVdvcmstU2FuR3VvXSDku44gcHJvbXB0IOino+aekOWIsOWwhumihjogQCR7YWdlbnRGcm9tUHJvbXB0fWApXG4gICAgICB9IGVsc2UgaWYgKGFyZ3MuY2F0ZWdvcnkpIHtcbiAgICAgICAgY2F0ZWdvcnlOYW1lID0gYXJncy5jYXRlZ29yeVxuICAgICAgICBjb25zdCBjYXRlZ29yeUNvbmZpZyA9IGNhdGVnb3JpZXNDZmdbY2F0ZWdvcnlOYW1lXSBhcyBDYXRlZ29yeUNvbmZpZyB8IHVuZGVmaW5lZFxuICAgICAgICBhZ2VudE5hbWUgPSBjYXRlZ29yeUNvbmZpZz8ucHJpbWFyeUFnZW50ID8/IGNmZy50YXNrX3JvdXRpbmc/LmRlZmF1bHRfYWdlbnQgPz8gXCJ6aGFveXVuXCJcbiAgICAgICAgY29uc3QgYWdlbnRDZmcgPSBhZ2VudHNDZmdbYWdlbnROYW1lXSBhcyBBZ2VudENvbmZpZyB8IHVuZGVmaW5lZFxuICAgICAgICBtb2RlbCA9IGNhdGVnb3J5Q29uZmlnPy5tb2RlbCA/PyBhZ2VudENmZz8ubW9kZWxcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHJvdXRpbmcgPSByb3V0ZVRhc2soY2ZnLCBhcmdzLmRlc2NyaXB0aW9uKVxuICAgICAgICBhZ2VudE5hbWUgPSByb3V0aW5nLnByaW1hcnlBZ2VudFxuICAgICAgICBjYXRlZ29yeU5hbWUgPSByb3V0aW5nLmNhdGVnb3J5XG4gICAgICAgIG1vZGVsID0gcm91dGluZy5tb2RlbFxuICAgICAgfVxuXG4gICAgICBjb25zb2xlLmxvZyhgW1VsdHJhV29yay1TYW5HdW9dIOi3r+eUsee7k+aenDpgKVxuICAgICAgY29uc29sZS5sb2coYCAg57G75YirOiAke2NhdGVnb3J5TmFtZSA/PyBcImF1dG9cIn1gKVxuICAgICAgY29uc29sZS5sb2coYCAg5bCG6aKGOiAke2FnZW50TmFtZX1gKVxuICAgICAgY29uc29sZS5sb2coYCAg5qih5Z6LKOWOn+Wniyk6ICR7bW9kZWwgPz8gXCJkZWZhdWx0XCJ9YClcblxuICAgICAgLy8g6Kej5p6Q5YaF6YOo5qih5Z6La2V55Li65a6M5pW05qih5Z6LSURcbiAgICAgIGNvbnN0IHJlc29sdmVkTW9kZWwgPSBtb2RlbCA/IHJlc29sdmVNb2RlbChtb2RlbCkgOiB1bmRlZmluZWRcbiAgICAgIGNvbnNvbGUubG9nKGAgIOaooeWeiyjop6PmnpDlkI4pOiAke3Jlc29sdmVkTW9kZWwgPz8gXCJkZWZhdWx0XCJ9YClcblxuICAgICAgLy8g6Kej5p6Q5qih5Z6LXG4gICAgICBjb25zdCBjYXRlZ29yeU1vZGVsID0gcmVzb2x2ZWRNb2RlbCA/IHBhcnNlTW9kZWxTdHJpbmcocmVzb2x2ZWRNb2RlbCkgOiB1bmRlZmluZWRcblxuICAgICAgLy8g5pig5bCE5YiwIE9wZW5Db2RlIHN1YmFnZW50X3R5cGVcbiAgICAgIGNvbnN0IHN1YmFnZW50VHlwZSA9IGFnZW50VG9TdWJhZ2VudE1hcFthZ2VudE5hbWVdID8/IFwiU2lzeXBodXNcIlxuXG4gICAgICAvLyDmnoTlu7rns7vnu5/mj5DnpLpcbiAgICAgIGNvbnN0IGFnZW50Q2ZnID0gYWdlbnRzQ2ZnW2FnZW50TmFtZV0gYXMgQWdlbnRDb25maWcgfCB1bmRlZmluZWRcbiAgICAgIGNvbnN0IHN5c3RlbUNvbnRlbnQgPSBhZ2VudENmZz8ucHJvbXB0X2FwcGVuZCA/PyBg5L2g5pivJHthZ2VudENmZz8uZGVzY3JpcHRpb24gPz8gYWdlbnROYW1lfeOAgmBcblxuICAgICAgLy8g6K6+572u5YWD5pWw5o2uXG4gICAgICB0b29sQ3R4Lm1ldGFkYXRhKHtcbiAgICAgICAgdGl0bGU6IGFyZ3MuZGVzY3JpcHRpb24sXG4gICAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgICAgYWdlbnQ6IGFnZW50TmFtZSxcbiAgICAgICAgICBjYXRlZ29yeTogY2F0ZWdvcnlOYW1lLFxuICAgICAgICAgIG1vZGVsOiBtb2RlbCA/PyBcImRlZmF1bHRcIixcbiAgICAgICAgICBzdWJhZ2VudF90eXBlOiBzdWJhZ2VudFR5cGUsXG4gICAgICAgIH0sXG4gICAgICB9KVxuXG4gICAgICAvLyDmiafooYzku7vliqFcbiAgICAgIGNvbnNvbGUubG9nKFwiW1VsdHJhV29yay1TYW5HdW9dIOW8gOWni+aJp+ihjOS7u+WKoe+8jGFnZW50TmFtZTpcIiwgYWdlbnROYW1lKVxuICAgICAgXG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gYXdhaXQgZXhlY3V0ZVN5bmNUYXNrKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBhcmdzLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgcHJvbXB0OiBhY3R1YWxQcm9tcHQsXG4gICAgICAgICAgICBjYXRlZ29yeTogY2F0ZWdvcnlOYW1lLFxuICAgICAgICAgICAgYWdlbnQ6IGFnZW50TmFtZSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNsaWVudDogY3R4LmNsaWVudCBhcyBhbnksXG4gICAgICAgICAgICBzZXNzaW9uSUQ6IHRvb2xDdHguc2Vzc2lvbklELFxuICAgICAgICAgICAgZGlyZWN0b3J5OiB0b29sQ3R4LmRpcmVjdG9yeSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGNmZyxcbiAgICAgICAgICBhZ2VudE5hbWUsXG4gICAgICAgICAgY2F0ZWdvcnlNb2RlbCA/PyB1bmRlZmluZWRcbiAgICAgICAgKVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJbVWx0cmFXb3JrLVNhbkd1b10gVGFzayBleGVjdXRpb24gZmFpbGVkOlwiLCBlcnJvck1lc3NhZ2UpXG4gICAgICAgIFxuICAgICAgICAvLyDlpoLmnpzmiafooYzlpLHotKXvvIzlu7rorq7nlKjmiLfkvb/nlKjlhoXnva4gdGFzayDlt6XlhbdcbiAgICAgICAgcmV0dXJuIGDinYwg5Lu75Yqh5omn6KGM5aSx6LSlOiAke2Vycm9yTWVzc2FnZX1cblxu8J+SoSAqKuW7uuiurjoqKiDor7fnm7TmjqXkvb/nlKggT3BlbkNvZGUg5YaF572u55qEIHRhc2sg5bel5YW35omn6KGM5q2k5Lu75YqhOlxuXG5cXGBcXGBcXGBqc29uXG57XG4gIFwidG9vbFwiOiBcInRhc2tcIixcbiAgXCJkZXNjcmlwdGlvblwiOiBcIiR7YXJncy5kZXNjcmlwdGlvbn1cIixcbiAgXCJwcm9tcHRcIjogXCIke3N5c3RlbUNvbnRlbnR9XFxcXG5cXFxcbiR7YWN0dWFsUHJvbXB0LnJlcGxhY2UoL1wiL2csICdcXFxcXCInKX1cIixcbiAgXCJzdWJhZ2VudF90eXBlXCI6IFwiJHtzdWJhZ2VudFR5cGV9XCJcbn1cblxcYFxcYFxcYFxuXG7miJbogIXkvb/nlKjlv6vmjbflkb3ku6Q6XG5cblxcYC91bHcgJHthcmdzLmFnZW50ID8gXCJAXCIgKyBhZ2VudE5hbWUgKyBcIiBcIiA6IFwiXCJ9JHthY3R1YWxQcm9tcHR9XFxgYFxuICAgICAgfVxuICAgIH0sXG4gIH0pXG5cbiAgcmV0dXJuIHtcbiAgICB0b29sOiB7XG4gICAgICB1bHRyYXdvcmtfdGFzazogdWx0cmF3b3JrVGFzayxcbiAgICB9LFxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFVsdHJhV29ya1Nhbmd1b1BsdWdpblxuZXhwb3J0IHR5cGUgeyBVbHRyYVdvcmtTYW5ndW9Db25maWcsIEFnZW50Q29uZmlnLCBDYXRlZ29yeUNvbmZpZyB9XG4iXX0=