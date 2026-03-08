"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tool_1 = require("@opencode-ai/plugin/tool");
const loader_js_1 = require("./config/loader.js");
const router_js_1 = require("./agents/router.js");
const index_js_1 = require("./executor/index.js");
const configCache = new Map();
function getConfig(directory) {
    if (!configCache.has(directory)) {
        configCache.set(directory, (0, loader_js_1.loadConfig)(directory));
    }
    return configCache.get(directory);
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
const UltraWorkSanguoPlugin = async (ctx) => {
    console.log("[UltraWork-SanGuo] 🏰 三国军团调度系统启动...");
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
    const ultraworkTask = (0, tool_1.tool)({
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
4. 都不指定: 根据任务关键词自动检测类别`,
        args: {
            description: tool_1.tool.schema.string().describe("任务简短描述 (3-5 词)"),
            prompt: tool_1.tool.schema.string().describe("详细的任务内容 (可用 @将领名 指定将领)"),
            category: tool_1.tool.schema.string().optional().describe("任务类别 (可选)"),
            agent: tool_1.tool.schema.string().optional().describe("将领名称 (可选)"),
        },
        async execute(args, toolCtx) {
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
                const routing = (0, router_js_1.routeByAgent)(cfg, args.agent);
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
                // 从 prompt 中解析到 @武将名
                const routing = (0, router_js_1.routeByAgent)(cfg, agentFromPrompt);
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
                const routing = (0, router_js_1.routeTask)(cfg, args.description);
                agentName = routing.primaryAgent;
                categoryName = routing.category;
                model = routing.model;
            }
            console.log(`[UltraWork-SanGuo] 路由结果:`);
            console.log(`  类别: ${categoryName ?? "auto"}`);
            console.log(`  将领: ${agentName}`);
            console.log(`  模型: ${model ?? "default"}`);
            // 解析模型
            const categoryModel = model ? (0, index_js_1.parseModelString)(model) : undefined;
            // 设置元数据
            toolCtx.metadata({
                title: args.description,
                metadata: {
                    agent: agentName,
                    category: categoryName,
                    model: categoryModel ? `${categoryModel.providerID}/${categoryModel.modelID}` : "default",
                },
            });
            // 执行任务
            return (0, index_js_1.executeSyncTask)({
                description: args.description,
                prompt: actualPrompt,
                category: categoryName,
                agent: agentName,
            }, {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                client: ctx.client,
                sessionID: toolCtx.sessionID,
                directory: toolCtx.directory,
            }, cfg, agentName, categoryModel ?? undefined);
        },
    });
    return {
        tool: {
            ultrawork_task: ultraworkTask,
        },
    };
};
exports.default = UltraWorkSanguoPlugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtREFBK0M7QUFFL0Msa0RBQStDO0FBQy9DLGtEQUE0RDtBQUM1RCxrREFBdUU7QUFHdkUsTUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLEVBQWlDLENBQUE7QUFFNUQsU0FBUyxTQUFTLENBQUMsU0FBaUI7SUFDbEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztRQUNoQyxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxJQUFBLHNCQUFVLEVBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQTtJQUNuRCxDQUFDO0lBQ0QsT0FBTyxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBRSxDQUFBO0FBQ3BDLENBQUM7QUFPRCxTQUFTLGlCQUFpQixDQUFDLE1BQWMsRUFBRSxlQUF5QjtJQUNsRSxNQUFNLFlBQVksR0FBRyw0QkFBNEIsQ0FBQTtJQUNqRCxJQUFJLEtBQTZCLENBQUE7SUFDakMsSUFBSSxhQUFhLEdBQWtCLElBQUksQ0FBQTtJQUN2QyxJQUFJLFdBQVcsR0FBRyxNQUFNLENBQUE7SUFFeEIsT0FBTyxDQUFDLEtBQUssR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUM7UUFDcEQsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFBO1FBQzVDLE1BQU0sWUFBWSxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQ3ZDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssYUFBYSxDQUNqRCxDQUFBO1FBQ0QsSUFBSSxZQUFZLEVBQUUsQ0FBQztZQUNqQixhQUFhLEdBQUcsWUFBWSxDQUFBO1lBQzVCLFdBQVcsR0FBRyxXQUFXLENBQUMs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QyxDQUFBO0FBRUQsa0JBQWUscUJBQXFCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB0b29sIH0gZnJvbSBcIkBvcGVuY29kZS1haS9wbHVnaW4vdG9vbFwiXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gXCJAb3BlbmNvZGUtYWkvcGx1Z2luXCJcbmltcG9ydCB7IGxvYWRDb25maWcgfSBmcm9tIFwiLi9jb25maWcvbG9hZGVyLmpzXCJcbmltcG9ydCB7IHJvdXRlVGFzaywgcm91dGVCeUFnZW50IH0gZnJvbSBcIi4vYWdlbnRzL3JvdXRlci5qc1wiXG5pbXBvcnQgeyBleGVjdXRlU3luY1Rhc2ssIHBhcnNlTW9kZWxTdHJpbmcgfSBmcm9tIFwiLi9leGVjdXRvci9pbmRleC5qc1wiXG5pbXBvcnQgdHlwZSB7IFVsdHJhV29ya1Nhbmd1b0NvbmZpZywgQWdlbnRDb25maWcsIENhdGVnb3J5Q29uZmlnIH0gZnJvbSBcIi4vY29uZmlnL3NjaGVtYS5qc1wiXG5cbmNvbnN0IGNvbmZpZ0NhY2hlID0gbmV3IE1hcDxzdHJpbmcsIFVsdHJhV29ya1Nhbmd1b0NvbmZpZz4oKVxuXG5mdW5jdGlvbiBnZXRDb25maWcoZGlyZWN0b3J5OiBzdHJpbmcpOiBVbHRyYVdvcmtTYW5ndW9Db25maWcge1xuICBpZiAoIWNvbmZpZ0NhY2hlLmhhcyhkaXJlY3RvcnkpKSB7XG4gICAgY29uZmlnQ2FjaGUuc2V0KGRpcmVjdG9yeSwgbG9hZENvbmZpZyhkaXJlY3RvcnkpKVxuICB9XG4gIHJldHVybiBjb25maWdDYWNoZS5nZXQoZGlyZWN0b3J5KSFcbn1cblxuaW50ZXJmYWNlIFBhcnNlZFByb21wdCB7XG4gIGFnZW50OiBzdHJpbmcgfCBudWxsXG4gIGNsZWFuUHJvbXB0OiBzdHJpbmdcbn1cblxuZnVuY3Rpb24gcGFyc2VBZ2VudE1lbnRpb24ocHJvbXB0OiBzdHJpbmcsIGF2YWlsYWJsZUFnZW50czogc3RyaW5nW10pOiBQYXJzZWRQcm9tcHQge1xuICBjb25zdCBtZW50aW9uUmVnZXggPSAvQChbYS16QS1aX11bYS16QS1aMC05X10qKS9nXG4gIGxldCBtYXRjaDogUmVnRXhwRXhlY0FycmF5IHwgbnVsbFxuICBsZXQgZGV0ZWN0ZWRBZ2VudDogc3RyaW5nIHwgbnVsbCA9IG51bGxcbiAgbGV0IGNsZWFuUHJvbXB0ID0gcHJvbXB0XG5cbiAgd2hpbGUgKChtYXRjaCA9IG1lbnRpb25SZWdleC5leGVjKHByb21wdCkpICE9PSBudWxsKSB7XG4gICAgY29uc3QgbWVudGlvbmVkTmFtZSA9IG1hdGNoWzFdLnRvTG93ZXJDYXNlKClcbiAgICBjb25zdCBtYXRjaGVkQWdlbnQgPSBhdmFpbGFibGVBZ2VudHMuZmluZChcbiAgICAgIChhZ2VudCkgPT4gYWdlbnQudG9Mb3dlckNhc2UoKSA9PT0gbWVudGlvbmVkTmFtZVxuICAgIClcbiAgICBpZiAobWF0Y2hlZEFnZW50KSB7XG4gICAgICBkZXRlY3RlZEFnZW50ID0gbWF0Y2hlZEFnZW50XG4gICAgICBjbGVhblByb21wdCA9IGNsZWFuUHJvbXB0LnJlcGxhY2UobWF0Y2hbMF0sIFwiXCIpLnRyaW0oKVxuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICByZXR1cm4geyBhZ2VudDogZGV0ZWN0ZWRBZ2VudCwgY2xlYW5Qcm9tcHQgfVxufVxuXG5jb25zdCBVbHRyYVdvcmtTYW5ndW9QbHVnaW46IFBsdWdpbiA9IGFzeW5jIChjdHgpID0+IHtcbiAgY29uc29sZS5sb2coXCJbVWx0cmFXb3JrLVNhbkd1b10g8J+PsCDkuInlm73lhpvlm6LosIPluqbns7vnu5/lkK/liqguLi5cIilcbiAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKGN0eC5kaXJlY3RvcnkpXG4gIGNvbnNvbGUubG9nKFwiW1VsdHJhV29yay1TYW5HdW9dIOKchSDphY3nva7liqDovb3lrozmiJBcIilcbiAgY29uc29sZS5sb2coXCJbVWx0cmFXb3JrLVNhbkd1b10g5bCG6aKGOlwiLCBPYmplY3Qua2V5cyhjb25maWcuYWdlbnRzID8/IHt9KS5qb2luKFwiLCBcIikpXG4gIGNvbnNvbGUubG9nKFwiW1VsdHJhV29yay1TYW5HdW9dIOexu+WIqzpcIiwgT2JqZWN0LmtleXMoY29uZmlnLmNhdGVnb3JpZXMgPz8ge30pLmpvaW4oXCIsIFwiKSlcblxuICBjb25zdCBhZ2VudHMgPSBjb25maWcuYWdlbnRzID8/IHt9XG4gIGNvbnN0IGNhdGVnb3JpZXMgPSBjb25maWcuY2F0ZWdvcmllcyA/PyB7fVxuXG4gIGNvbnN0IGFnZW50TGlzdCA9IE9iamVjdC5lbnRyaWVzKGFnZW50cylcbiAgICAubWFwKChbbmFtZSwgY2ZnXSkgPT4ge1xuICAgICAgY29uc3QgYWdlbnRDZmcgPSBjZmcgYXMgQWdlbnRDb25maWdcbiAgICAgIHJldHVybiBgICAtICR7bmFtZX06ICR7YWdlbnRDZmcubW9kZWwgPz8gXCJkZWZhdWx0XCJ9IC0gJHthZ2VudENmZy5kZXNjcmlwdGlvbiA/PyBcIlwifWBcbiAgICB9KVxuICAgIC5qb2luKFwiXFxuXCIpXG5cbiAgY29uc3QgY2F0ZWdvcnlMaXN0ID0gT2JqZWN0LmVudHJpZXMoY2F0ZWdvcmllcylcbiAgICAubWFwKChbbmFtZSwgY2ZnXSkgPT4ge1xuICAgICAgY29uc3QgY2F0Q2ZnID0gY2ZnIGFzIENhdGVnb3J5Q29uZmlnXG4gICAgICByZXR1cm4gYCAgLSAke25hbWV9OiAke2NhdENmZy5kZXNjcmlwdGlvbiA/PyBcIlwifWBcbiAgICB9KVxuICAgIC5qb2luKFwiXFxuXCIpXG5cbiAgY29uc3QgdWx0cmF3b3JrVGFzayA9IHRvb2woe1xuICAgIGRlc2NyaXB0aW9uOiBgVWx0cmFXb3JrIOS4ieWbveWGm+WbouS7u+WKoeWIhuWPkeW3peWFt+OAglxuXG7moLnmja7ku7vliqHoh6rliqjot6/nlLHliLDlr7nlupTnmoTlsIbpooblkozmqKHlnovjgIJcblxuKirlj6/nlKjlsIbpooY6KipcbiR7YWdlbnRMaXN0fVxuXG4qKuS7u+WKoeexu+WIqzoqKlxuJHtjYXRlZ29yeUxpc3R9XG5cbioq5L2/55So5pa55byPOioqXG4xLiBwcm9tcHQg5Lit5L2/55SoIEDlsIbpooblkI06IOebtOaOpeS9v+eUqOaMh+WumuWwhumihuWPiuWFtuaooeWei1xuICAg56S65L6LOiBAbHVzdSDliIbmnpDov5nkuKrpnIDmsYLnmoTlj6/ooYzmgKdcbjIuIOaMh+WumiBjYXRlZ29yeTog6Ieq5Yqo6YCJ5oup6K+l57G75Yir55qE5bCG6aKG5ZKM5qih5Z6LXG4zLiDmjIflrpogYWdlbnQ6IOebtOaOpeS9v+eUqOaMh+WumuWwhumihuWPiuWFtuaooeWei1xuNC4g6YO95LiN5oyH5a6aOiDmoLnmja7ku7vliqHlhbPplK7or43oh6rliqjmo4DmtYvnsbvliKtgLFxuICAgIGFyZ3M6IHtcbiAgICAgIGRlc2NyaXB0aW9uOiB0b29sLnNjaGVtYS5zdHJpbmcoKS5kZXNjcmliZShcIuS7u+WKoeeugOefreaPj+i/sCAoMy01IOivjSlcIiksXG4gICAgICBwcm9tcHQ6IHRvb2wuc2NoZW1hLnN0cmluZygpLmRlc2NyaWJlKFwi6K+m57uG55qE5Lu75Yqh5YaF5a65ICjlj6/nlKggQOWwhumihuWQjSDmjIflrprlsIbpooYpXCIpLFxuICAgICAgY2F0ZWdvcnk6IHRvb2wuc2NoZW1hLnN0cmluZygpLm9wdGlvbmFsKCkuZGVzY3JpYmUoXCLku7vliqHnsbvliKsgKOWPr+mAiSlcIiksXG4gICAgICBhZ2VudDogdG9vbC5zY2hlbWEuc3RyaW5nKCkub3B0aW9uYWwoKS5kZXNjcmliZShcIuWwhumihuWQjeensCAo5Y+v6YCJKVwiKSxcbiAgICB9LFxuICAgIGFzeW5jIGV4ZWN1dGUoYXJncywgdG9vbEN0eCkge1xuICAgICAgY29uc3QgY2ZnID0gZ2V0Q29uZmlnKGN0eC5kaXJlY3RvcnkpXG4gICAgICBjb25zdCBhZ2VudHNDZmcgPSBjZmcuYWdlbnRzID8/IHt9XG4gICAgICBjb25zdCBjYXRlZ29yaWVzQ2ZnID0gY2ZnLmNhdGVnb3JpZXMgPz8ge31cbiAgICAgIGNvbnN0IGF2YWlsYWJsZUFnZW50cyA9IE9iamVjdC5rZXlzKGFnZW50c0NmZylcblxuICAgICAgLy8g6Kej5p6QIEDmrablsIblkI0g6K+t5rOVXG4gICAgICBjb25zdCBwYXJzZWRQcm9tcHQgPSBwYXJzZUFnZW50TWVudGlvbihhcmdzLnByb21wdCwgYXZhaWxhYmxlQWdlbnRzKVxuICAgICAgbGV0IGFjdHVhbFByb21wdCA9IHBhcnNlZFByb21wdC5jbGVhblByb21wdFxuICAgICAgbGV0IGFnZW50RnJvbVByb21wdCA9IHBhcnNlZFByb21wdC5hZ2VudFxuXG4gICAgICAvLyDop6PmnpDot6/nlLFcbiAgICAgIGxldCBhZ2VudE5hbWU6IHN0cmluZ1xuICAgICAgbGV0IGNhdGVnb3J5TmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkXG4gICAgICBsZXQgbW9kZWw6IHN0cmluZyB8IHVuZGVmaW5lZFxuXG4gICAgICAvLyDkvJjlhYjnuqc6IGFnZW50IOWPguaVsCA+IEDmrablsIblkI0gPiBjYXRlZ29yeSDlj4LmlbAgPiDoh6rliqjmo4DmtYtcbiAgICAgIGlmIChhcmdzLmFnZW50KSB7XG4gICAgICAgIGNvbnN0IHJvdXRpbmcgPSByb3V0ZUJ5QWdlbnQoY2ZnLCBhcmdzLmFnZW50KVxuICAgICAgICBpZiAocm91dGluZykge1xuICAgICAgICAgIGFnZW50TmFtZSA9IHJvdXRpbmcucHJpbWFyeUFnZW50XG4gICAgICAgICAgY2F0ZWdvcnlOYW1lID0gcm91dGluZy5jYXRlZ29yeVxuICAgICAgICAgIG1vZGVsID0gcm91dGluZy5tb2RlbFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFnZW50TmFtZSA9IGFyZ3MuYWdlbnRcbiAgICAgICAgICBjb25zdCBhZ2VudENmZyA9IGFnZW50c0NmZ1thZ2VudE5hbWVdIGFzIEFnZW50Q29uZmlnIHwgdW5kZWZpbmVkXG4gICAgICAgICAgbW9kZWwgPSBhZ2VudENmZz8ubW9kZWxcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChhZ2VudEZyb21Qcm9tcHQpIHtcbiAgICAgICAgLy8g5LuOIHByb21wdCDkuK3op6PmnpDliLAgQOatpuWwhuWQjVxuICAgICAgICBjb25zdCByb3V0aW5nID0gcm91dGVCeUFnZW50KGNmZywgYWdlbnRGcm9tUHJvbXB0KVxuICAgICAgICBpZiAocm91dGluZykge1xuICAgICAgICAgIGFnZW50TmFtZSA9IHJvdXRpbmcucHJpbWFyeUFnZW50XG4gICAgICAgICAgY2F0ZWdvcnlOYW1lID0gcm91dGluZy5jYXRlZ29yeVxuICAgICAgICAgIG1vZGVsID0gcm91dGluZy5tb2RlbFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFnZW50TmFtZSA9IGFnZW50RnJvbVByb21wdFxuICAgICAgICAgIGNvbnN0IGFnZW50Q2ZnID0gYWdlbnRzQ2ZnW2FnZW50TmFtZV0gYXMgQWdlbnRDb25maWcgfCB1bmRlZmluZWRcbiAgICAgICAgICBtb2RlbCA9IGFnZW50Q2ZnPy5tb2RlbFxuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbVWx0cmFXb3JrLVNhbkd1b10g5LuOIHByb21wdCDop6PmnpDliLDlsIbpooY6IEAke2FnZW50RnJvbVByb21wdH1gKVxuICAgICAgfSBlbHNlIGlmIChhcmdzLmNhdGVnb3J5KSB7XG4gICAgICAgIGNhdGVnb3J5TmFtZSA9IGFyZ3MuY2F0ZWdvcnlcbiAgICAgICAgY29uc3QgY2F0ZWdvcnlDb25maWcgPSBjYXRlZ29yaWVzQ2ZnW2NhdGVnb3J5TmFtZV0gYXMgQ2F0ZWdvcnlDb25maWcgfCB1bmRlZmluZWRcbiAgICAgICAgYWdlbnROYW1lID0gY2F0ZWdvcnlDb25maWc/LnByaW1hcnlBZ2VudCA/PyBjZmcudGFza19yb3V0aW5nPy5kZWZhdWx0X2FnZW50ID8/IFwiemhhb3l1blwiXG4gICAgICAgIGNvbnN0IGFnZW50Q2ZnID0gYWdlbnRzQ2ZnW2FnZW50TmFtZV0gYXMgQWdlbnRDb25maWcgfCB1bmRlZmluZWRcbiAgICAgICAgbW9kZWwgPSBjYXRlZ29yeUNvbmZpZz8ubW9kZWwgPz8gYWdlbnRDZmc/Lm1vZGVsXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCByb3V0aW5nID0gcm91dGVUYXNrKGNmZywgYXJncy5kZXNjcmlwdGlvbilcbiAgICAgICAgYWdlbnROYW1lID0gcm91dGluZy5wcmltYXJ5QWdlbnRcbiAgICAgICAgY2F0ZWdvcnlOYW1lID0gcm91dGluZy5jYXRlZ29yeVxuICAgICAgICBtb2RlbCA9IHJvdXRpbmcubW9kZWxcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coYFtVbHRyYVdvcmstU2FuR3VvXSDot6/nlLHnu5Pmnpw6YClcbiAgICAgIGNvbnNvbGUubG9nKGAgIOexu+WIqzogJHtjYXRlZ29yeU5hbWUgPz8gXCJhdXRvXCJ9YClcbiAgICAgIGNvbnNvbGUubG9nKGAgIOWwhumihjogJHthZ2VudE5hbWV9YClcbiAgICAgIGNvbnNvbGUubG9nKGAgIOaooeWeizogJHttb2RlbCA/PyBcImRlZmF1bHRcIn1gKVxuXG4gICAgICAvLyDop6PmnpDmqKHlnotcbiAgICAgIGNvbnN0IGNhdGVnb3J5TW9kZWwgPSBtb2RlbCA/IHBhcnNlTW9kZWxTdHJpbmcobW9kZWwpIDogdW5kZWZpbmVkXG5cbiAgICAgIC8vIOiuvue9ruWFg+aVsOaNrlxuICAgICAgdG9vbEN0eC5tZXRhZGF0YSh7XG4gICAgICAgIHRpdGxlOiBhcmdzLmRlc2NyaXB0aW9uLFxuICAgICAgICBtZXRhZGF0YToge1xuICAgICAgICAgIGFnZW50OiBhZ2VudE5hbWUsXG4gICAgICAgICAgY2F0ZWdvcnk6IGNhdGVnb3J5TmFtZSxcbiAgICAgICAgICBtb2RlbDogY2F0ZWdvcnlNb2RlbCA/IGAke2NhdGVnb3J5TW9kZWwucHJvdmlkZXJJRH0vJHtjYXRlZ29yeU1vZGVsLm1vZGVsSUR9YCA6IFwiZGVmYXVsdFwiLFxuICAgICAgICB9LFxuICAgICAgfSlcblxuICAgICAgLy8g5omn6KGM5Lu75YqhXG4gICAgICByZXR1cm4gZXhlY3V0ZVN5bmNUYXNrKFxuICAgICAgICB7XG4gICAgICAgICAgZGVzY3JpcHRpb246IGFyZ3MuZGVzY3JpcHRpb24sXG4gICAgICAgICAgcHJvbXB0OiBhY3R1YWxQcm9tcHQsXG4gICAgICAgICAgY2F0ZWdvcnk6IGNhdGVnb3J5TmFtZSxcbiAgICAgICAgICBhZ2VudDogYWdlbnROYW1lLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAgICAgICBjbGllbnQ6IGN0eC5jbGllbnQgYXMgYW55LFxuICAgICAgICAgIHNlc3Npb25JRDogdG9vbEN0eC5zZXNzaW9uSUQsXG4gICAgICAgICAgZGlyZWN0b3J5OiB0b29sQ3R4LmRpcmVjdG9yeSxcbiAgICAgICAgfSxcbiAgICAgICAgY2ZnLFxuICAgICAgICBhZ2VudE5hbWUsXG4gICAgICAgIGNhdGVnb3J5TW9kZWwgPz8gdW5kZWZpbmVkXG4gICAgICApXG4gICAgfSxcbiAgfSlcblxuICByZXR1cm4ge1xuICAgIHRvb2w6IHtcbiAgICAgIHVsdHJhd29ya190YXNrOiB1bHRyYXdvcmtUYXNrLFxuICAgIH0sXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVWx0cmFXb3JrU2FuZ3VvUGx1Z2luXG5leHBvcnQgdHlwZSB7IFVsdHJhV29ya1Nhbmd1b0NvbmZpZywgQWdlbnRDb25maWcsIENhdGVnb3J5Q29uZmlnIH0iXX0=