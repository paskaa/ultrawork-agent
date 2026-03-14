export function parseModelString(model) {
    const parts = model.split("/");
    if (parts.length < 2) {
        return null;
    }
    return {
        providerID: parts[0],
        modelID: parts.slice(1).join("/"),
    };
}
const QUESTION_DENIED_PERMISSION = [
    { permission: "question", action: "deny", pattern: "*" },
];
export async function createSyncSession(client, input) {
    let parentDirectory = input.defaultDirectory;
    try {
        if (client.session.get) {
            const parentSession = await client.session.get({ path: { id: input.parentSessionID } }).catch(() => undefined);
            if (parentSession?.data?.directory) {
                parentDirectory = parentSession.data.directory;
            }
        }
    }
    catch {
        // Ignore errors
    }
    try {
        console.log("[UltraWork-SanGuo] Creating session with parentID:", input.parentSessionID);
        // 参考 oh-my-openagent 的参数结构: body + query
        // 传递模型参数以便在创建会话时指定模型
        const createBody = {
            parentID: input.parentSessionID,
            title: `[${input.agentToUse}] ${input.description}`,
            permission: QUESTION_DENIED_PERMISSION,
        };
        // 如果提供了模型参数，在创建会话时指定模型
        if (input.categoryModel) {
            createBody.model = {
                providerID: input.categoryModel.providerID,
                modelID: input.categoryModel.modelID,
            };
            console.log("[UltraWork-SanGuo] 创建会话时设置模型:", input.categoryModel.providerID + "/" + input.categoryModel.modelID);
        }
        const createResult = await client.session.create({
            body: createBody,
            query: {
                directory: parentDirectory,
            },
        });
        console.log("[UltraWork-SanGuo] Session create result:", createResult);
        if (createResult.error) {
            return { ok: false, error: `Failed to create session: ${safeStringify(createResult.error)}` };
        }
        if (!createResult.data?.id) {
            return { ok: false, error: "Failed to create session: no session ID returned" };
        }
        return { ok: true, sessionID: createResult.data.id, parentDirectory };
    }
    catch (err) {
        console.log("[UltraWork-SanGuo] Session create error:", err);
        return { ok: false, error: `Failed to create session: ${safeStringify(err)}` };
    }
}
const agentNames = {
    zhugeliang: "Sisyphus",
    zhouyu: "Prometheus",
    zhaoyun: "Sisyphus",
    simayi: "Explore",
    guanyu: "Sisyphus",
    zhangfei: "Sisyphus",
};
// 安全地将对象转换为字符串
function safeStringify(obj) {
    try {
        if (obj === null)
            return 'null';
        if (obj === undefined)
            return 'undefined';
        if (typeof obj === 'string')
            return obj;
        if (typeof obj === 'number' || typeof obj === 'boolean')
            return String(obj);
        if (obj instanceof Error)
            return obj.message || obj.name || 'Error';
        if (typeof obj === 'object') {
            // 尝试提取常见的错误字段
            const errObj = obj;
            if (errObj.message && typeof errObj.message === 'string')
                return errObj.message;
            if (errObj.error && typeof errObj.error === 'string')
                return errObj.error;
            if (errObj.detail && typeof errObj.detail === 'string')
                return errObj.detail;
            if (errObj.msg && typeof errObj.msg === 'string')
                return errObj.msg;
            // 最后尝试 JSON.stringify，但捕获循环引用错误
            try {
                return JSON.stringify(obj);
            }
            catch {
                // 如果 JSON.stringify 失败（循环引用等），返回对象类型
                return Object.prototype.toString.call(obj);
            }
        }
        return String(obj);
    }
    catch {
        return '[unknown error]';
    }
}
export async function sendPromptWithModel(client, input) {
    // 直接使用将领名称，不映射到内置 agent
    // 因为 OpenCode 可能没有 "Sisyphus" 等 agent
    const effectiveAgent = input.agentToUse;
    console.log("[UltraWork-SanGuo] sendPromptWithModel called");
    console.log("[UltraWork-SanGuo] sessionID:", input.sessionID);
    console.log("[UltraWork-SanGuo] agent:", effectiveAgent);
    try {
        // 参考 oh-my-openagent 的参数结构: path + body
        const promptArgs = {
            path: { id: input.sessionID },
            body: {
                agent: effectiveAgent,
                system: input.systemContent,
                parts: [{ type: "text", text: input.prompt }],
                // 不限制 task 工具，让子会话可以继续调用 task
                ...(input.categoryModel
                    ? { model: { providerID: input.categoryModel.providerID, modelID: input.categoryModel.modelID } }
                    : {}),
                ...(input.categoryModel?.variant ? { variant: input.categoryModel.variant } : {}),
            },
        };
        console.log("[UltraWork-SanGuo] promptAsync args:", JSON.stringify(promptArgs, null, 2));
        const result = await client.session.promptAsync(promptArgs);
        // 详细调试日志
        console.log("[UltraWork-SanGuo] promptAsync result:", result);
        if (result) {
            console.log("[UltraWork-SanGuo] result keys:", Object.keys(result));
            console.log("[UltraWork-SanGuo] result.error:", result.error);
            console.log("[UltraWork-SanGuo] result.data:", result.data);
            if (result.response) {
                console.log("[UltraWork-SanGuo] result.response.status:", result.response.status);
            }
        }
        // SDK 返回 { data, error, request, response } 结构
        // 对于 promptAsync，成功时返回 204 void
        // 如果 result 存在且有 error 属性，说明有错误
        if (result && result.error != null) {
            const errorStr = safeStringify(result.error);
            console.log("[UltraWork-SanGuo] Returning error:", errorStr);
            return { ok: false, error: errorStr };
        }
        // 检查是否有 response 但状态码不是 2xx
        if (result && result.response && result.response.status) {
            const status = result.response.status;
            console.log("[UltraWork-SanGuo] Response status:", status);
            if (status >= 200 && status < 300) {
                // 2xx 状态码表示成功
                return { ok: true };
            }
            return { ok: false, error: `HTTP ${status}: ${result.response.statusText || 'Unknown error'}` };
        }
        // 如果 result.data 存在，说明成功（对于 204 响应，data 可能是 undefined）
        if (result && 'data' in result) {
            console.log("[UltraWork-SanGuo] Success (data in result)");
            return { ok: true };
        }
        // 如果都没有错误，假设成功
        console.log("[UltraWork-SanGuo] Success (no error)");
        return { ok: true };
    }
    catch (err) {
        console.log("[UltraWork-SanGuo] Exception:", err);
        return { ok: false, error: safeStringify(err) };
    }
}
// 测试用短超时
const DEFAULT_TIMEOUT_MS = 60000; // 60秒
export async function pollSessionUntilComplete(client, sessionID, timeoutMs = DEFAULT_TIMEOUT_MS) {
    const startTime = Date.now();
    const pollInterval = 2000;
    let pollCount = 0;
    console.log("[UltraWork-SanGuo] 开始轮询会话:", sessionID);
    while (Date.now() - startTime < timeoutMs) {
        pollCount++;
        try {
            // 使用 session.status() 检查会话状态
            const statusResult = await client.session.status();
            console.log("[UltraWork-SanGuo] Poll", pollCount, "status result keys:", statusResult ? Object.keys(statusResult) : "null");
            const sessionStatus = statusResult?.data?.[sessionID];
            console.log("[UltraWork-SanGuo] Poll", pollCount, "session status:", sessionStatus);
            // 如果会话状态是 idle，说明已完成
            if (sessionStatus && sessionStatus.type === "idle") {
                console.log("[UltraWork-SanGuo] 会话已完成 (idle)");
                return { ok: true };
            }
            // 备用：检查 session.get 的状态
            const result = await client.session.get({ path: { id: sessionID } });
            console.log("[UltraWork-SanGuo] Poll", pollCount, "session.get result:", result?.data ? { id: result.data.id, busy: result.data.busy } : "no data");
            if (result.data?.busy === false) {
                console.log("[UltraWork-SanGuo] 会话已完成 (busy=false)");
                return { ok: true };
            }
            // 每10次轮询输出一次进度
            if (pollCount % 10 === 0) {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                console.log(`[UltraWork-SanGuo] 轮询中... ${pollCount}次, ${elapsed}秒`);
            }
            await new Promise((r) => setTimeout(r, pollInterval));
        }
        catch (err) {
            console.log("[UltraWork-SanGuo] Poll error:", safeStringify(err));
            // 继续轮询，不因为单次错误而失败
            await new Promise((r) => setTimeout(r, pollInterval));
        }
    }
    console.log("[UltraWork-SanGuo] 轮询超时");
    return { ok: false, error: `Timeout after ${timeoutMs}ms` };
}
export async function fetchSessionResult(client, sessionID) {
    try {
        console.log("[UltraWork-SanGuo] 获取会话消息:", sessionID);
        const result = await client.session.messages({ path: { id: sessionID } });
        console.log("[UltraWork-SanGuo] messages result:", result?.data ? `${result.data.length} messages` : "no data");
        if (!result.data) {
            return { ok: false, error: "No messages found" };
        }
        // 消息格式: { info: { role: "assistant" | "user", ... }, parts: [...] }
        const messages = result.data;
        // 过滤 assistant 消息，按创建时间排序
        const assistantMessages = messages
            .filter((m) => m.info?.role === "assistant")
            .sort((a, b) => (b.info?.time?.created ?? 0) - (a.info?.time?.created ?? 0));
        console.log("[UltraWork-SanGuo] assistant messages:", assistantMessages.length);
        if (assistantMessages.length === 0) {
            return { ok: false, error: "No assistant response found" };
        }
        // 查找第一个有文本内容的 assistant 消息
        for (const msg of assistantMessages) {
            const textParts = msg.parts?.filter((p) => p.type === "text" || p.type === "reasoning") ?? [];
            const content = textParts.map((p) => p.text ?? "").filter(Boolean).join("\n");
            if (content) {
                console.log("[UltraWork-SanGuo] 找到响应内容，长度:", content.length);
                return {
                    ok: true,
                    sessionID,
                    textContent: content || "(No text output)",
                };
            }
        }
        return { ok: false, error: "No text content in assistant response" };
    }
    catch (err) {
        console.log("[UltraWork-SanGuo] fetchSessionResult error:", safeStringify(err));
        return { ok: false, error: safeStringify(err) };
    }
}
export async function executeSyncTask(args, ctx, config, agentName, categoryModel) {
    console.log(`[UltraWork-SanGuo] 执行任务，将领: ${agentName}, 模型: ${categoryModel ? `${categoryModel.providerID}/${categoryModel.modelID}` : "default"}`);
    // 重新注入认证（确保每次执行时都有认证）
    const { injectServerAuthIntoClient } = await import("../auth.js");
    injectServerAuthIntoClient(ctx.client);
    // 1. 创建子会话（带模型参数）
    const sessionResult = await createSyncSession(ctx.client, {
        parentSessionID: ctx.sessionID,
        agentToUse: agentName,
        description: args.description,
        defaultDirectory: ctx.directory,
        categoryModel,
    });
    if (!sessionResult.ok) {
        return `❌ 创建会话失败: ${sessionResult.error}`;
    }
    const childSessionID = sessionResult.sessionID;
    console.log(`[UltraWork-SanGuo] 会话已创建: ${childSessionID}`);
    // 2. 获取将领的系统提示
    const agents = config.agents ?? {};
    const agentConfig = agents[agentName];
    const systemContent = agentConfig?.prompt_append ?? `你是${agentConfig?.description ?? agentName}。`;
    // 3. 发送提示（带模型参数）
    console.log("[UltraWork-SanGuo] 准备发送提示，sessionID:", childSessionID);
    const promptResult = await sendPromptWithModel(ctx.client, {
        sessionID: childSessionID,
        agentToUse: agentName,
        prompt: args.prompt,
        systemContent,
        categoryModel,
    });
    console.log("[UltraWork-SanGuo] sendPromptWithModel 结果:", JSON.stringify(promptResult));
    if (!promptResult.ok) {
        console.log("[UltraWork-SanGuo] 发送提示失败，错误:", promptResult.error);
        return `❌ 发送提示失败: ${safeStringify(promptResult.error)}

💡 **建议:** 请使用 OpenCode 内置的 task 工具执行此任务:

\`\`\`json
{
  "tool": "task",
  "description": "${args.description}",
  "prompt": "${systemContent}\n\n${args.prompt}",
  "subagent_type": "${agentNames[agentName] ?? "Sisyphus"}"
}
\`\`\``;
    }
    console.log("[UltraWork-SanGuo] 提示发送成功，开始轮询...");
    // 4. 轮询等待完成（显式传递超时参数）
    const pollResult = await pollSessionUntilComplete(ctx.client, childSessionID, 60000);
    console.log("[UltraWork-SanGuo] 轮询结果:", pollResult);
    // 5. 获取结果
    const result = await fetchSessionResult(ctx.client, childSessionID);
    if (!result.ok) {
        // 如果轮询超时且没有结果，返回超时消息
        if (!pollResult.ok) {
            return `❌ 执行超时: ${pollResult.error}\n\n会话可能仍在运行中，稍后可使用 session_id: ${childSessionID} 查看结果`;
        }
        return `❌ 获取结果失败: ${result.error}`;
    }
    console.log(`[UltraWork-SanGuo] 任务完成!`);
    return `✅ 任务完成!

将领: ${agentName}${args.category ? ` (类别: ${args.category})` : ""}
模型: ${categoryModel ? `${categoryModel.providerID}/${categoryModel.modelID}` : "默认"}

---

${result.textContent}

<task_metadata>
session_id: ${childSessionID}
agent: ${agentName}
model: ${categoryModel ? `${categoryModel.providerID}/${categoryModel.modelID}` : "default"}
</task_metadata>`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXhlY3V0b3IvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBc0JBLE1BQU0sVUFBVSxnQkFBZ0IsQ0FBQyxLQUFhO0lBQzVDLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDOUIsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ3JCLE9BQU8sSUFBSSxDQUFBO0lBQ2IsQ0FBQztJQUNELE9BQU87UUFDTCxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNwQixPQUFPLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO0tBQ2xDLENBQUE7QUFDSCxDQUFDO0FBRUQsTUFBTSwwQkFBMEIsR0FBRztJQUNqQyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLE1BQWUsRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFO0NBQ2xFLENBQUE7QUFFRCxNQUFNLENBQUMsS0FBSyxVQUFVLGlCQUFpQixDQUNyQyxNQUFXLEVBQ1gsS0FLQztJQUVELElBQUksZUFBZSxHQUFHLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQTtJQUU1QyxJQUFJLENBQUM7UUFDSCxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDdkIsTUFBTSxhQUFhLEdBQUcsTUFBTSxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQTtZQUM5RyxJQUFJLGFBQWEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUM7Z0JBQ25DLGVBQWUsR0FBRyxh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Q3BDLENBQUM7SUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUE7SUFFdkMsT0FBTzs7TUFFSCxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7TUFDMUQsYUFBYSxDQUFDLENBQUMsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxVQUFVLElBQUksYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJOzs7O0VBSWpGLE1BQU0sQ0FBQyxXQUFXOzs7Y0FHTixjQUFjO1NBQ25CLFNBQVM7U0FDVCxhQUFhLENBQUMsQ0FBQyxDQUFDLEdBQUcsYUFBYSxDQUFDLFVBQVUsSUFBSSxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVM7aUJBQzFFLENBQUE7QUFDakIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBpbnRlcmZhY2UgQ2F0ZWdvcnlNb2RlbCB7XG4gIHByb3ZpZGVySUQ6IHN0cmluZ1xuICBtb2RlbElEOiBzdHJpbmdcbiAgdmFyaWFudD86IHN0cmluZ1xufVxuXG50eXBlIFNlc3Npb25DcmVhdGVSZXN1bHQgPSBcbiAgfCB7IG9rOiB0cnVlOyBzZXNzaW9uSUQ6IHN0cmluZzsgcGFyZW50RGlyZWN0b3J5OiBzdHJpbmcgfVxuICB8IHsgb2s6IGZhbHNlOyBlcnJvcjogc3RyaW5nIH1cblxudHlwZSBQcm9tcHRSZXN1bHQgPSBcbiAgfCB7IG9rOiB0cnVlIH1cbiAgfCB7IG9rOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9XG5cbnR5cGUgUG9sbFJlc3VsdCA9IFxuICB8IHsgb2s6IHRydWUgfVxuICB8IHsgb2s6IGZhbHNlOyBlcnJvcjogc3RyaW5nIH1cblxudHlwZSBGZXRjaFJlc3VsdCA9IFxuICB8IHsgb2s6IHRydWU7IHNlc3Npb25JRDogc3RyaW5nOyB0ZXh0Q29udGVudDogc3RyaW5nIH1cbiAgfCB7IG9rOiBmYWxzZTsgZXJyb3I6IHN0cmluZyB9XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU1vZGVsU3RyaW5nKG1vZGVsOiBzdHJpbmcpOiBDYXRlZ29yeU1vZGVsIHwgbnVsbCB7XG4gIGNvbnN0IHBhcnRzID0gbW9kZWwuc3BsaXQoXCIvXCIpXG4gIGlmIChwYXJ0cy5sZW5ndGggPCAyKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuICByZXR1cm4ge1xuICAgIHByb3ZpZGVySUQ6IHBhcnRzWzBdLFxuICAgIG1vZGVsSUQ6IHBhcnRzLnNsaWNlKDEpLmpvaW4oXCIvXCIpLFxuICB9XG59XG5cbmNvbnN0IFFVRVNUSU9OX0RFTklFRF9QRVJNSVNTSU9OID0gW1xuICB7IHBlcm1pc3Npb246IFwicXVlc3Rpb25cIiwgYWN0aW9uOiBcImRlbnlcIiBhcyBjb25zdCwgcGF0dGVybjogXCIqXCIgfSxcbl1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVN5bmNTZXNzaW9uKFxuICBjbGllbnQ6IGFueSxcbiAgaW5wdXQ6IHtcbiAgICBwYXJlbnRTZXNzaW9uSUQ6IHN0cmluZ1xuICAgIGFnZW50VG9Vc2U6IHN0cmluZ1xuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmdcbiAgICBkZWZhdWx0RGlyZWN0b3J5OiBzdHJpbmdcbiAgfVxuKTogUHJvbWlzZTxTZXNzaW9uQ3JlYXRlUmVzdWx0PiB7XG4gIGxldCBwYXJlbnREaXJlY3RvcnkgPSBpbnB1dC5kZWZhdWx0RGlyZWN0b3J5XG5cbiAgdHJ5IHtcbiAgICBpZiAoY2xpZW50LnNlc3Npb24uZ2V0KSB7XG4gICAgICBjb25zdCBwYXJlbnRTZXNzaW9uID0gYXdhaXQgY2xpZW50LnNlc3Npb24uZ2V0KHsgcGF0aDogeyBpZDogaW5wdXQucGFyZW50U2Vzc2lvbklEIH0gfSkuY2F0Y2goKCkgPT4gdW5kZWZpbmVkKVxuICAgICAgaWYgKHBhcmVudFNlc3Npb24/LmRhdGE/LmRpcmVjdG9yeSkge1xuICAgICAgICBwYXJlbnREaXJlY3RvcnkgPSBwYXJlbnRTZXNzaW9uLmRhdGEuZGlyZWN0b3J5XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICAvLyBJZ25vcmUgZXJyb3JzXG4gIH1cblxuICB0cnkge1xuICAgIGNvbnNvbGUubG9nKFwiW1VsdHJhV29yay1TYW5HdW9dIENyZWF0aW5nIHNlc3Npb24gd2l0aCBwYXJlbnRJRDpcIiwgaW5wdXQucGFyZW50U2Vzc2lvbklEKVxuXG4gICAgLy8g5Y+C6ICDIG9oLW15LW9wZW5hZ2VudCDnmoTlj4LmlbDnu5PmnoQ6IGJvZHkgKyBxdWVyeVxuICAgIGNvbnN0IGNyZWF0ZVJlc3VsdCA9IGF3YWl0IGNsaWVudC5zZXNzaW9uLmNyZWF0ZSh7XG4gICAgICBib2R5OiB7XG4gICAgICAgIHBhcmVudElEOiBpbnB1dC5wYXJlbnRTZXNzaW9uSUQsXG4gICAgICAgIHRpdGxlOiBgWyR7aW5wdXQuYWdlbnRUb1VzZX1dICR7aW5wdXQuZGVzY3JpcHRpb259YCxcbiAgICAgICAgcGVybWlzc2lvbjogUVVFU1RJT05fREVOSUVEX1BFUk1JU1NJT04sXG4gICAgICB9LFxuICAgICAgcXVlcnk6IHtcbiAgICAgICAgZGlyZWN0b3J5OiBwYXJlbnREaXJlY3RvcnksXG4gICAgICB9LFxuICAgIH0pXG4gICAgXG4gICAgY29uc29sZS5sb2coXCJbVWx0cmFXb3JrLVNhbkd1b10gU2Vzc2lvbiBjcmVhdGUgcmVzdWx0OlwiLCBjcmVhdGVSZXN1bHQpXG5cbiAgICBpZiAoY3JlYXRlUmVzdWx0LmVycm9yKSB7XG4gICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIGNyZWF0ZSBzZXNzaW9uOiAke3NhZmVTdHJpbmdpZnkoY3JlYXRlUmVzdWx0LmVycm9yKX1gIH1cbiAgICB9XG5cbiAgICBpZiAoIWNyZWF0ZVJlc3VsdC5kYXRhPy5pZCkge1xuICAgICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogXCJGYWlsZWQgdG8gY3JlYXRlIHNlc3Npb246IG5vIHNlc3Npb24gSUQgcmV0dXJuZWRcIiB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgb2s6IHRydWUsIHNlc3Npb25JRDogY3JlYXRlUmVzdWx0LmRhdGEuaWQsIHBhcmVudERpcmVjdG9yeSB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGNvbnNvbGUubG9nKFwiW1VsdHJhV29yay1TYW5HdW9dIFNlc3Npb24gY3JlYXRlIGVycm9yOlwiLCBlcnIpXG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBjcmVhdGUgc2Vzc2lvbjogJHtzYWZlU3RyaW5naWZ5KGVycil9YCB9XG4gIH1cbn1cblxuY29uc3QgYWdlbnROYW1lczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgemh1Z2VsaWFuZzogXCJTaXN5cGh1c1wiLFxuICB6aG91eXU6IFwiUHJvbWV0aGV1c1wiLFxuICB6aGFveXVuOiBcIlNpc3lwaHVzXCIsXG4gIHNpbWF5aTogXCJFeHBsb3JlXCIsXG4gIGd1YW55dTogXCJTaXN5cGh1c1wiLFxuICB6aGFuZ2ZlaTogXCJTaXN5cGh1c1wiLFxufVxuXG4vLyDlronlhajlnLDlsIblr7nosaHovazmjaLkuLrlrZfnrKbkuLJcbmZ1bmN0aW9uIHNhZmVTdHJpbmdpZnkob2JqOiB1bmtub3duKTogc3RyaW5nIHtcbiAgdHJ5IHtcbiAgICBpZiAob2JqID09PSBudWxsKSByZXR1cm4gJ251bGwnXG4gICAgaWYgKG9iaiA9PT0gdW5kZWZpbmVkKSByZXR1cm4gJ3VuZGVmaW5lZCdcbiAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ3N0cmluZycpIHJldHVybiBvYmpcbiAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ251bWJlcicgfHwgdHlwZW9mIG9iaiA9PT0gJ2Jvb2xlYW4nKSByZXR1cm4gU3RyaW5nKG9iailcbiAgICBpZiAob2JqIGluc3RhbmNlb2YgRXJyb3IpIHJldHVybiBvYmoubWVzc2FnZSB8fCBvYmoubmFtZSB8fCAnRXJyb3InXG4gICAgaWYgKHR5cGVvZiBvYmogPT09ICdvYmplY3QnKSB7XG4gICAgICAvLyDlsJ3or5Xmj5Dlj5bluLjop4HnmoTplJnor6/lrZfmrrVcbiAgICAgIGNvbnN0IGVyck9iaiA9IG9iaiBhcyBSZWNvcmQ8c3RyaW5nLCBhbnk+XG4gICAgICBpZiAoZXJyT2JqLm1lc3NhZ2UgJiYgdHlwZW9mIGVyck9iai5tZXNzYWdlID09PSAnc3RyaW5nJykgcmV0dXJuIGVyck9iai5tZXNzYWdlXG4gICAgICBpZiAoZXJyT2JqLmVycm9yICYmIHR5cGVvZiBlcnJPYmouZXJyb3IgPT09ICdzdHJpbmcnKSByZXR1cm4gZXJyT2JqLmVycm9yXG4gICAgICBpZiAoZXJyT2JqLmRldGFpbCAmJiB0eXBlb2YgZXJyT2JqLmRldGFpbCA9PT0gJ3N0cmluZycpIHJldHVybiBlcnJPYmouZGV0YWlsXG4gICAgICBpZiAoZXJyT2JqLm1zZyAmJiB0eXBlb2YgZXJyT2JqLm1zZyA9PT0gJ3N0cmluZycpIHJldHVybiBlcnJPYmoubXNnXG4gICAgICAvLyDmnIDlkI7lsJ3or5UgSlNPTi5zdHJpbmdpZnnvvIzkvYbmjZXojrflvqrnjq/lvJXnlKjplJnor69cbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvYmopXG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8g5aaC5p6cIEpTT04uc3RyaW5naWZ5IOWksei0pe+8iOW+queOr+W8leeUqOetie+8ie+8jOi/lOWbnuWvueixoeexu+Wei1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iailcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIFN0cmluZyhvYmopXG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiAnW3Vua25vd24gZXJyb3JdJ1xuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZW5kUHJvbXB0V2l0aE1vZGVsKFxuICBjbGllbnQ6IGFueSxcbiAgaW5wdXQ6IHtcbiAgICBzZXNzaW9uSUQ6IHN0cmluZ1xuICAgIGFnZW50VG9Vc2U6IHN0cmluZ1xuICAgIHByb21wdDogc3RyaW5nXG4gICAgc3lzdGVtQ29udGVudD86IHN0cmluZ1xuICAgIGNhdGVnb3J5TW9kZWw/OiBDYXRlZ29yeU1vZGVsXG4gIH1cbik6IFByb21pc2U8UHJvbXB0UmVzdWx0PiB7XG4gIC8vIOebtOaOpeS9v+eUqOWwhumihuWQjeensO+8jOS4jeaYoOWwhOWIsOWGhee9riBhZ2VudFxuICAvLyDlm6DkuLogT3BlbkNvZGUg5Y+v6IO95rKh5pyJIFwiU2lzeXBodXNcIiDnrYkgYWdlbnRcbiAgY29uc3QgZWZmZWN0aXZlQWdlbnQgPSBpbnB1dC5hZ2VudFRvVXNlXG5cbiAgY29uc29sZS5sb2coXCJbVWx0cmFXb3JrLVNhbkd1b10gc2VuZFByb21wdFdpdGhNb2RlbCBjYWxsZWRcIilcbiAgY29uc29sZS5sb2coXCJbVWx0cmFXb3JrLVNhbkd1b10gc2Vzc2lvbklEOlwiLCBpbnB1dC5zZXNzaW9uSUQpXG4gIGNvbnNvbGUubG9nKFwiW1VsdHJhV29yay1TYW5HdW9dIGFnZW50OlwiLCBlZmZlY3RpdmVBZ2VudClcblxuICB0cnkge1xuICAgIC8vIOWPguiAgyBvaC1teS1vcGVuYWdlbnQg55qE5Y+C5pWw57uT5p6EOiBwYXRoICsgYm9keVxuICAgIGNvbnN0IHByb21wdEFyZ3MgPSB7XG4gICAgICBwYXRoOiB7IGlkOiBpbnB1dC5zZXNzaW9uSUQgfSxcbiAgICAgIGJvZHk6IHtcbiAgICAgICAgYWdlbnQ6IGVmZmVjdGl2ZUFnZW50LFxuICAgICAgICBzeXN0ZW06IGlucHV0LnN5c3RlbUNvbnRlbnQsXG4gICAgICAgIHBhcnRzOiBbeyB0eXBlOiBcInRleHRcIiwgdGV4dDogaW5wdXQucHJvbXB0IH1dLFxuICAgICAgICAvLyDkuI3pmZDliLYgdGFzayDlt6XlhbfvvIzorqnlrZDkvJror53lj6/ku6Xnu6fnu63osIPnlKggdGFza1xuICAgICAgICAuLi4oaW5wdXQuY2F0ZWdvcnlNb2RlbFxuICAgICAgICAgID8geyBtb2RlbDogeyBwcm92aWRlcklEOiBpbnB1dC5jYXRlZ29yeU1vZGVsLnByb3ZpZGVySUQsIG1vZGVsSUQ6IGlucHV0LmNhdGVnb3J5TW9kZWwubW9kZWxJRCB9IH1cbiAgICAgICAgICA6IHt9KSxcbiAgICAgICAgLi4uKGlucHV0LmNhdGVnb3J5TW9kZWw/LnZhcmlhbnQgPyB7IHZhcmlhbnQ6IGlucHV0LmNhdGVnb3J5TW9kZWwudmFyaWFudCB9IDoge30pLFxuICAgICAgfSxcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyhcIltVbHRyYVdvcmstU2FuR3VvXSBwcm9tcHRBc3luYyBhcmdzOlwiLCBKU09OLnN0cmluZ2lmeShwcm9tcHRBcmdzLCBudWxsLCAyKSlcblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNsaWVudC5zZXNzaW9uLnByb21wdEFzeW5jKHByb21wdEFyZ3MpXG5cbiAgICAvLyDor6bnu4bosIPor5Xml6Xlv5dcbiAgICBjb25zb2xlLmxvZyhcIltVbHRyYVdvcmstU2FuR3VvXSBwcm9tcHRBc3luYyByZXN1bHQ6XCIsIHJlc3VsdClcbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICBjb25zb2xlLmxvZyhcIltVbHRyYVdvcmstU2FuR3VvXSByZXN1bHQga2V5czpcIiwgT2JqZWN0LmtleXMocmVzdWx0KSlcbiAgICAgIGNvbnNvbGUubG9nKFwiW1VsdHJhV29yay1TYW5HdW9dIHJlc3VsdC5lcnJvcjpcIiwgcmVzdWx0LmVycm9yKVxuICAgICAgY29uc29sZS5sb2coXCJbVWx0cmFXb3JrLVNhbkd1b10gcmVzdWx0LmRhdGE6XCIsIHJlc3VsdC5kYXRhKVxuICAgICAgaWYgKHJlc3VsdC5yZXNwb25zZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIltVbHRyYVdvcmstU2FuR3VvXSByZXN1bHQucmVzcG9uc2Uuc3RhdHVzOlwiLCByZXN1bHQucmVzcG9uc2Uuc3RhdHVzKVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNESyDov5Tlm54geyBkYXRhLCBlcnJvciwgcmVxdWVzdCwgcmVzcG9uc2UgfSDnu5PmnoRcbiAgICAvLyDlr7nkuo4gcHJvbXB0QXN5bmPvvIzmiJDlip/ml7bov5Tlm54gMjA0IHZvaWRcbiAgICBcbiAgICAvLyDlpoLmnpwgcmVzdWx0IOWtmOWcqOS4lOaciSBlcnJvciDlsZ7mgKfvvIzor7TmmI7mnInplJnor69cbiAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5lcnJvciAhPSBudWxsKSB7XG4gICAgICBjb25zdCBlcnJvclN0ciA9IHNhZmVTdHJpbmdpZnkocmVzdWx0LmVycm9yKVxuICAgICAgY29uc29sZS5sb2coXCJbVWx0cmFXb3JrLVNhbkd1b10gUmV0dXJuaW5nIGVycm9yOlwiLCBlcnJvclN0cilcbiAgICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGVycm9yU3RyIH1cbiAgICB9XG5cbiAgICAvLyDmo4Dmn6XmmK/lkKbmnIkgcmVzcG9uc2Ug5L2G54q25oCB56CB5LiN5pivIDJ4eFxuICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LnJlc3BvbnNlICYmIHJlc3VsdC5yZXNwb25zZS5zdGF0dXMpIHtcbiAgICAgIGNvbnN0IHN0YXR1cyA9IHJlc3VsdC5yZXNwb25zZS5zdGF0dXNcbiAgICAgIGNvbnNvbGUubG9nKFwiW1VsdHJhV29yay1TYW5HdW9dIFJlc3BvbnNlIHN0YXR1czpcIiwgc3RhdHVzKVxuICAgICAgaWYgKHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwKSB7XG4gICAgICAgIC8vIDJ4eCDnirbmgIHnoIHooajnpLrmiJDlip9cbiAgICAgICAgcmV0dXJuIHsgb2s6IHRydWUgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogYEhUVFAgJHtzdGF0dXN9OiAke3Jlc3VsdC5yZXNwb25zZS5zdGF0dXNUZXh0IHx8ICdVbmtub3duIGVycm9yJ31gIH1cbiAgICB9XG5cbiAgICAvLyDlpoLmnpwgcmVzdWx0LmRhdGEg5a2Y5Zyo77yM6K+05piO5oiQ5Yqf77yI5a+55LqOIDIwNCDlk43lupTvvIxkYXRhIOWPr+iDveaYryB1bmRlZmluZWTvvIlcbiAgICBpZiAocmVzdWx0ICYmICdkYXRhJyBpbiByZXN1bHQpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiW1VsdHJhV29yay1TYW5HdW9dIFN1Y2Nlc3MgKGRhdGEgaW4gcmVzdWx0KVwiKVxuICAgICAgcmV0dXJuIHsgb2s6IHRydWUgfVxuICAgIH1cblxuICAgIC8vIOWmguaenOmDveayoeaciemUmeivr++8jOWBh+iuvuaIkOWKn1xuICAgIGNvbnNvbGUubG9nKFwiW1VsdHJhV29yay1TYW5HdW9dIFN1Y2Nlc3MgKG5vIGVycm9yKVwiKVxuICAgIHJldHVybiB7IG9rOiB0cnVlIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgY29uc29sZS5sb2coXCJbVWx0cmFXb3JrLVNhbkd1b10gRXhjZXB0aW9uOlwiLCBlcnIpXG4gICAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogc2FmZVN0cmluZ2lmeShlcnIpIH1cbiAgfVxufVxuXG4vLyDmtYvor5XnlKjnn63otoXml7ZcbmNvbnN0IERFRkFVTFRfVElNRU9VVF9NUyA9IDYwMDAwICAvLyA2MOenklxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcG9sbFNlc3Npb25VbnRpbENvbXBsZXRlKFxuICBjbGllbnQ6IGFueSxcbiAgc2Vzc2lvbklEOiBzdHJpbmcsXG4gIHRpbWVvdXRNczogbnVtYmVyID0gREVGQVVMVF9USU1FT1VUX01TXG4pOiBQcm9taXNlPFBvbGxSZXN1bHQ+IHtcbiAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKVxuICBjb25zdCBwb2xsSW50ZXJ2YWwgPSAyMDAwXG4gIGxldCBwb2xsQ291bnQgPSAwXG5cbiAgY29uc29sZS5sb2coXCJbVWx0cmFXb3JrLVNhbkd1b10g5byA5aeL6L2u6K+i5Lya6K+dOlwiLCBzZXNzaW9uSUQpXG5cbiAgd2hpbGUgKERhdGUubm93KCkgLSBzdGFydFRpbWUgPCB0aW1lb3V0TXMpIHtcbiAgICBwb2xsQ291bnQrK1xuICAgIHRyeSB7XG4gICAgICAvLyDkvb/nlKggc2Vzc2lvbi5zdGF0dXMoKSDmo4Dmn6XkvJror53nirbmgIFcbiAgICAgIGNvbnN0IHN0YXR1c1Jlc3VsdCA9IGF3YWl0IGNsaWVudC5zZXNzaW9uLnN0YXR1cygpXG4gICAgICBjb25zb2xlLmxvZyhcIltVbHRyYVdvcmstU2FuR3VvXSBQb2xsXCIsIHBvbGxDb3VudCwgXCJzdGF0dXMgcmVzdWx0IGtleXM6XCIsIHN0YXR1c1Jlc3VsdCA/IE9iamVjdC5rZXlzKHN0YXR1c1Jlc3VsdCkgOiBcIm51bGxcIilcbiAgICAgIFxuICAgICAgY29uc3Qgc2Vzc2lvblN0YXR1cyA9IHN0YXR1c1Jlc3VsdD8uZGF0YT8uW3Nlc3Npb25JRF1cbiAgICAgIGNvbnNvbGUubG9nKFwiW1VsdHJhV29yay1TYW5HdW9dIFBvbGxcIiwgcG9sbENvdW50LCBcInNlc3Npb24gc3RhdHVzOlwiLCBzZXNzaW9uU3RhdHVzKVxuXG4gICAgICAvLyDlpoLmnpzkvJror53nirbmgIHmmK8gaWRsZe+8jOivtOaYjuW3suWujOaIkFxuICAgICAgaWYgKHNlc3Npb25TdGF0dXMgJiYgc2Vzc2lvblN0YXR1cy50eXBlID09PSBcImlkbGVcIikge1xuICAgICAgICBjb25zb2xlLmxvZyhcIltVbHRyYVdvcmstU2FuR3VvXSDkvJror53lt7LlrozmiJAgKGlkbGUpXCIpXG4gICAgICAgIHJldHVybiB7IG9rOiB0cnVlIH1cbiAgICAgIH1cblxuICAgICAgLy8g5aSH55So77ya5qOA5p+lIHNlc3Npb24uZ2V0IOeahOeKtuaAgVxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2xpZW50LnNlc3Npb24uZ2V0KHsgcGF0aDogeyBpZDogc2Vzc2lvbklEIH0gfSlcbiAgICAgIGNvbnNvbGUubG9nKFwiW1VsdHJhV29yay1TYW5HdW9dIFBvbGxcIiwgcG9sbENvdW50LCBcInNlc3Npb24uZ2V0IHJlc3VsdDpcIiwgcmVzdWx0Py5kYXRhID8geyBpZDogcmVzdWx0LmRhdGEuaWQsIGJ1c3k6IHJlc3VsdC5kYXRhLmJ1c3kgfSA6IFwibm8gZGF0YVwiKVxuICAgICAgXG4gICAgICBpZiAocmVzdWx0LmRhdGE/LmJ1c3kgPT09IGZhbHNlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiW1VsdHJhV29yay1TYW5HdW9dIOS8muivneW3suWujOaIkCAoYnVzeT1mYWxzZSlcIilcbiAgICAgICAgcmV0dXJuIHsgb2s6IHRydWUgfVxuICAgICAgfVxuXG4gICAgICAvLyDmr48xMOasoei9ruivoui+k+WHuuS4gOasoei/m+W6plxuICAgICAgaWYgKHBvbGxDb3VudCAlIDEwID09PSAwKSB7XG4gICAgICAgIGNvbnN0IGVsYXBzZWQgPSBNYXRoLmZsb29yKChEYXRlLm5vdygpIC0gc3RhcnRUaW1lKSAvIDEwMDApXG4gICAgICAgIGNvbnNvbGUubG9nKGBbVWx0cmFXb3JrLVNhbkd1b10g6L2u6K+i5LitLi4uICR7cG9sbENvdW50feasoSwgJHtlbGFwc2VkfeenkmApXG4gICAgICB9XG5cbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyKSA9PiBzZXRUaW1lb3V0KHIsIHBvbGxJbnRlcnZhbCkpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIltVbHRyYVdvcmstU2FuR3VvXSBQb2xsIGVycm9yOlwiLCBzYWZlU3RyaW5naWZ5KGVycikpXG4gICAgICAvLyDnu6fnu63ova7or6LvvIzkuI3lm6DkuLrljZXmrKHplJnor6/ogIzlpLHotKVcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyKSA9PiBzZXRUaW1lb3V0KHIsIHBvbGxJbnRlcnZhbCkpXG4gICAgfVxuICB9XG5cbiAgY29uc29sZS5sb2coXCJbVWx0cmFXb3JrLVNhbkd1b10g6L2u6K+i6LaF5pe2XCIpXG4gIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IGBUaW1lb3V0IGFmdGVyICR7dGltZW91dE1zfW1zYCB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaFNlc3Npb25SZXN1bHQoXG4gIGNsaWVudDogYW55LFxuICBzZXNzaW9uSUQ6IHN0cmluZ1xuKTogUHJvbWlzZTxGZXRjaFJlc3VsdD4ge1xuICB0cnkge1xuICAgIGNvbnNvbGUubG9nKFwiW1VsdHJhV29yay1TYW5HdW9dIOiOt+WPluS8muivnea2iOaBrzpcIiwgc2Vzc2lvbklEKVxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNsaWVudC5zZXNzaW9uLm1lc3NhZ2VzKHsgcGF0aDogeyBpZDogc2Vzc2lvbklEIH0gfSlcblxuICAgIGNvbnNvbGUubG9nKFwiW1VsdHJhV29yay1TYW5HdW9dIG1lc3NhZ2VzIHJlc3VsdDpcIiwgcmVzdWx0Py5kYXRhID8gYCR7cmVzdWx0LmRhdGEubGVuZ3RofSBtZXNzYWdlc2AgOiBcIm5vIGRhdGFcIilcblxuICAgIGlmICghcmVzdWx0LmRhdGEpIHtcbiAgICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IFwiTm8gbWVzc2FnZXMgZm91bmRcIiB9XG4gICAgfVxuXG4gICAgLy8g5raI5oGv5qC85byPOiB7IGluZm86IHsgcm9sZTogXCJhc3Npc3RhbnRcIiB8IFwidXNlclwiLCAuLi4gfSwgcGFydHM6IFsuLi5dIH1cbiAgICBjb25zdCBtZXNzYWdlcyA9IHJlc3VsdC5kYXRhIGFzIGFueVtdXG4gICAgXG4gICAgLy8g6L+H5rukIGFzc2lzdGFudCDmtojmga/vvIzmjInliJvlu7rml7bpl7TmjpLluo9cbiAgICBjb25zdCBhc3Npc3RhbnRNZXNzYWdlcyA9IG1lc3NhZ2VzXG4gICAgICAuZmlsdGVyKChtOiBhbnkpID0+IG0uaW5mbz8ucm9sZSA9PT0gXCJhc3Npc3RhbnRcIilcbiAgICAgIC5zb3J0KChhOiBhbnksIGI6IGFueSkgPT4gKGIuaW5mbz8udGltZT8uY3JlYXRlZCA/PyAwKSAtIChhLmluZm8/LnRpbWU/LmNyZWF0ZWQgPz8gMCkpXG4gICAgXG4gICAgY29uc29sZS5sb2coXCJbVWx0cmFXb3JrLVNhbkd1b10gYXNzaXN0YW50IG1lc3NhZ2VzOlwiLCBhc3Npc3RhbnRNZXNzYWdlcy5sZW5ndGgpXG5cbiAgICBpZiAoYXNzaXN0YW50TWVzc2FnZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBcIk5vIGFzc2lzdGFudCByZXNwb25zZSBmb3VuZFwiIH1cbiAgICB9XG5cbiAgICAvLyDmn6Xmib7nrKzkuIDkuKrmnInmlofmnKzlhoXlrrnnmoQgYXNzaXN0YW50IOa2iOaBr1xuICAgIGZvciAoY29uc3QgbXNnIG9mIGFzc2lzdGFudE1lc3NhZ2VzKSB7XG4gICAgICBjb25zdCB0ZXh0UGFydHMgPSBtc2cucGFydHM/LmZpbHRlcigocDogYW55KSA9PiBwLnR5cGUgPT09IFwidGV4dFwiIHx8IHAudHlwZSA9PT0gXCJyZWFzb25pbmdcIikgPz8gW11cbiAgICAgIGNvbnN0IGNvbnRlbnQgPSB0ZXh0UGFydHMubWFwKChwOiBhbnkpID0+IHAudGV4dCA/PyBcIlwiKS5maWx0ZXIoQm9vbGVhbikuam9pbihcIlxcblwiKVxuICAgICAgaWYgKGNvbnRlbnQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJbVWx0cmFXb3JrLVNhbkd1b10g5om+5Yiw5ZON5bqU5YaF5a6577yM6ZW/5bqmOlwiLCBjb250ZW50Lmxlbmd0aClcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBvazogdHJ1ZSxcbiAgICAgICAgICBzZXNzaW9uSUQsXG4gICAgICAgICAgdGV4dENvbnRlbnQ6IGNvbnRlbnQgfHwgXCIoTm8gdGV4dCBvdXRwdXQpXCIsXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiBcIk5vIHRleHQgY29udGVudCBpbiBhc3Npc3RhbnQgcmVzcG9uc2VcIiB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGNvbnNvbGUubG9nKFwiW1VsdHJhV29yay1TYW5HdW9dIGZldGNoU2Vzc2lvblJlc3VsdCBlcnJvcjpcIiwgc2FmZVN0cmluZ2lmeShlcnIpKVxuICAgIHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6IHNhZmVTdHJpbmdpZnkoZXJyKSB9XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBEZWxlZ2F0ZVRhc2tBcmdzIHtcbiAgZGVzY3JpcHRpb246IHN0cmluZ1xuICBwcm9tcHQ6IHN0cmluZ1xuICBjYXRlZ29yeT86IHN0cmluZ1xuICBhZ2VudD86IHN0cmluZ1xufVxuXG5pbnRlcmZhY2UgRXhlY3V0aW9uQ29udGV4dCB7XG4gIGNsaWVudDogYW55XG4gIHNlc3Npb25JRDogc3RyaW5nXG4gIGRpcmVjdG9yeTogc3RyaW5nXG59XG5cbmludGVyZmFjZSBBZ2VudENvbmZpZyB7XG4gIGRlc2NyaXB0aW9uPzogc3RyaW5nXG4gIHByb21wdF9hcHBlbmQ/OiBzdHJpbmdcbiAgbW9kZWw/OiBzdHJpbmdcbn1cblxuaW50ZXJmYWNlIFVsdHJhV29ya1Nhbmd1b0NvbmZpZyB7XG4gIGFnZW50cz86IFJlY29yZDxzdHJpbmcsIEFnZW50Q29uZmlnPlxuICBjYXRlZ29yaWVzPzogUmVjb3JkPHN0cmluZywgeyBkZXNjcmlwdGlvbj86IHN0cmluZzsgcHJpbWFyeUFnZW50Pzogc3RyaW5nOyBtb2RlbD86IHN0cmluZyB9PlxuICB0YXNrX3JvdXRpbmc/OiB7IGRlZmF1bHRfYWdlbnQ/OiBzdHJpbmcgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZVN5bmNUYXNrKFxuICBhcmdzOiBEZWxlZ2F0ZVRhc2tBcmdzLFxuICBjdHg6IEV4ZWN1dGlvbkNvbnRleHQsXG4gIGNvbmZpZzogVWx0cmFXb3JrU2FuZ3VvQ29uZmlnLFxuICBhZ2VudE5hbWU6IHN0cmluZyxcbiAgY2F0ZWdvcnlNb2RlbD86IENhdGVnb3J5TW9kZWxcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnNvbGUubG9nKGBbVWx0cmFXb3JrLVNhbkd1b10g5omn6KGM5Lu75Yqh77yM5bCG6aKGOiAke2FnZW50TmFtZX0sIOaooeWeizogJHtjYXRlZ29yeU1vZGVsID8gYCR7Y2F0ZWdvcnlNb2RlbC5wcm92aWRlcklEfS8ke2NhdGVnb3J5TW9kZWwubW9kZWxJRH1gIDogXCJkZWZhdWx0XCJ9YClcbiAgXG4gIC8vIOmHjeaWsOazqOWFpeiupOivge+8iOehruS/neavj+asoeaJp+ihjOaXtumDveacieiupOivge+8iVxuICBjb25zdCB7IGluamVjdFNlcnZlckF1dGhJbnRvQ2xpZW50IH0gPSBhd2FpdCBpbXBvcnQoXCIuLi9hdXRoLmpzXCIpXG4gIGluamVjdFNlcnZlckF1dGhJbnRvQ2xpZW50KGN0eC5jbGllbnQpXG5cbiAgLy8gMS4g5Yib5bu65a2Q5Lya6K+dXG4gIGNvbnN0IHNlc3Npb25SZXN1bHQgPSBhd2FpdCBjcmVhdGVTeW5jU2Vzc2lvbihjdHguY2xpZW50LCB7XG4gICAgcGFyZW50U2Vzc2lvbklEOiBjdHguc2Vzc2lvbklELFxuICAgIGFnZW50VG9Vc2U6IGFnZW50TmFtZSxcbiAgICBkZXNjcmlwdGlvbjogYXJncy5kZXNjcmlwdGlvbixcbiAgICBkZWZhdWx0RGlyZWN0b3J5OiBjdHguZGlyZWN0b3J5LFxuICB9KVxuXG4gIGlmICghc2Vzc2lvblJlc3VsdC5vaykge1xuICAgIHJldHVybiBg4p2MIOWIm+W7uuS8muivneWksei0pTogJHtzZXNzaW9uUmVzdWx0LmVycm9yfWBcbiAgfVxuXG4gIGNvbnN0IGNoaWxkU2Vzc2lvbklEID0gc2Vzc2lvblJlc3VsdC5zZXNzaW9uSURcbiAgY29uc29sZS5sb2coYFtVbHRyYVdvcmstU2FuR3VvXSDkvJror53lt7LliJvlu7o6ICR7Y2hpbGRTZXNzaW9uSUR9YClcblxuICAvLyAyLiDojrflj5blsIbpoobnmoTns7vnu5/mj5DnpLpcbiAgY29uc3QgYWdlbnRzID0gY29uZmlnLmFnZW50cyA/PyB7fVxuICBjb25zdCBhZ2VudENvbmZpZyA9IGFnZW50c1thZ2VudE5hbWVdIGFzIEFnZW50Q29uZmlnIHwgdW5kZWZpbmVkXG4gIGNvbnN0IHN5c3RlbUNvbnRlbnQgPSBhZ2VudENvbmZpZz8ucHJvbXB0X2FwcGVuZCA/PyBg5L2g5pivJHthZ2VudENvbmZpZz8uZGVzY3JpcHRpb24gPz8gYWdlbnROYW1lfeOAgmBcblxuICAvLyAzLiDlj5HpgIHmj5DnpLrvvIjluKbmqKHlnovlj4LmlbDvvIlcbiAgY29uc29sZS5sb2coXCJbVWx0cmFXb3JrLVNhbkd1b10g5YeG5aSH5Y+R6YCB5o+Q56S677yMc2Vzc2lvbklEOlwiLCBjaGlsZFNlc3Npb25JRClcbiAgY29uc3QgcHJvbXB0UmVzdWx0ID0gYXdhaXQgc2VuZFByb21wdFdpdGhNb2RlbChjdHguY2xpZW50LCB7XG4gICAgc2Vzc2lvbklEOiBjaGlsZFNlc3Npb25JRCxcbiAgICBhZ2VudFRvVXNlOiBhZ2VudE5hbWUsXG4gICAgcHJvbXB0OiBhcmdzLnByb21wdCxcbiAgICBzeXN0ZW1Db250ZW50LFxuICAgIGNhdGVnb3J5TW9kZWwsXG4gIH0pXG4gIGNvbnNvbGUubG9nKFwiW1VsdHJhV29yay1TYW5HdW9dIHNlbmRQcm9tcHRXaXRoTW9kZWwg57uT5p6cOlwiLCBKU09OLnN0cmluZ2lmeShwcm9tcHRSZXN1bHQpKVxuXG4gIGlmICghcHJvbXB0UmVzdWx0Lm9rKSB7XG4gICAgY29uc29sZS5sb2coXCJbVWx0cmFXb3JrLVNhbkd1b10g5Y+R6YCB5o+Q56S65aSx6LSl77yM6ZSZ6K+vOlwiLCBwcm9tcHRSZXN1bHQuZXJyb3IpXG4gICAgcmV0dXJuIGDinYwg5Y+R6YCB5o+Q56S65aSx6LSlOiAke3NhZmVTdHJpbmdpZnkocHJvbXB0UmVzdWx0LmVycm9yKX1cblxu8J+SoSAqKuW7uuiurjoqKiDor7fkvb/nlKggT3BlbkNvZGUg5YaF572u55qEIHRhc2sg5bel5YW35omn6KGM5q2k5Lu75YqhOlxuXG5cXGBcXGBcXGBqc29uXG57XG4gIFwidG9vbFwiOiBcInRhc2tcIixcbiAgXCJkZXNjcmlwdGlvblwiOiBcIiR7YXJncy5kZXNjcmlwdGlvbn1cIixcbiAgXCJwcm9tcHRcIjogXCIke3N5c3RlbUNvbnRlbnR9XFxuXFxuJHthcmdzLnByb21wdH1cIixcbiAgXCJzdWJhZ2VudF90eXBlXCI6IFwiJHthZ2VudE5hbWVzW2FnZW50TmFtZV0gPz8gXCJTaXN5cGh1c1wifVwiXG59XG5cXGBcXGBcXGBgXG4gIH1cblxuICBjb25zb2xlLmxvZyhcIltVbHRyYVdvcmstU2FuR3VvXSDmj5DnpLrlj5HpgIHmiJDlip/vvIzlvIDlp4vova7or6IuLi5cIilcblxuICAvLyA0LiDova7or6LnrYnlvoXlrozmiJDvvIjmmL7lvI/kvKDpgJLotoXml7blj4LmlbDvvIlcbiAgY29uc3QgcG9sbFJlc3VsdCA9IGF3YWl0IHBvbGxTZXNzaW9uVW50aWxDb21wbGV0ZShjdHguY2xpZW50LCBjaGlsZFNlc3Npb25JRCwgNjAwMDApXG4gIGNvbnNvbGUubG9nKFwiW1VsdHJhV29yay1TYW5HdW9dIOi9ruivoue7k+aenDpcIiwgcG9sbFJlc3VsdClcbiAgXG4gIC8vIDUuIOiOt+WPlue7k+aenFxuICBjb25zdCByZXN1bHQgPSBhd2FpdCBmZXRjaFNlc3Npb25SZXN1bHQoY3R4LmNsaWVudCwgY2hpbGRTZXNzaW9uSUQpXG5cbiAgaWYgKCFyZXN1bHQub2spIHtcbiAgICAvLyDlpoLmnpzova7or6LotoXml7bkuJTmsqHmnInnu5PmnpzvvIzov5Tlm57otoXml7bmtojmga9cbiAgICBpZiAoIXBvbGxSZXN1bHQub2spIHtcbiAgICAgIHJldHVybiBg4p2MIOaJp+ihjOi2heaXtjogJHtwb2xsUmVzdWx0LmVycm9yfVxcblxcbuS8muivneWPr+iDveS7jeWcqOi/kOihjOS4re+8jOeojeWQjuWPr+S9v+eUqCBzZXNzaW9uX2lkOiAke2NoaWxkU2Vzc2lvbklEfSDmn6XnnIvnu5PmnpxgXG4gICAgfVxuICAgIHJldHVybiBg4p2MIOiOt+WPlue7k+aenOWksei0pTogJHtyZXN1bHQuZXJyb3J9YFxuICB9XG5cbiAgY29uc29sZS5sb2coYFtVbHRyYVdvcmstU2FuR3VvXSDku7vliqHlrozmiJAhYClcblxuICByZXR1cm4gYOKchSDku7vliqHlrozmiJAhXG5cbuWwhumihjogJHthZ2VudE5hbWV9JHthcmdzLmNhdGVnb3J5ID8gYCAo57G75YirOiAke2FyZ3MuY2F0ZWdvcnl9KWAgOiBcIlwifVxu5qih5Z6LOiAke2NhdGVnb3J5TW9kZWwgPyBgJHtjYXRlZ29yeU1vZGVsLnByb3ZpZGVySUR9LyR7Y2F0ZWdvcnlNb2RlbC5tb2RlbElEfWAgOiBcIum7mOiupFwifVxuXG4tLS1cblxuJHtyZXN1bHQudGV4dENvbnRlbnR9XG5cbjx0YXNrX21ldGFkYXRhPlxuc2Vzc2lvbl9pZDogJHtjaGlsZFNlc3Npb25JRH1cbmFnZW50OiAke2FnZW50TmFtZX1cbm1vZGVsOiAke2NhdGVnb3J5TW9kZWwgPyBgJHtjYXRlZ29yeU1vZGVsLnByb3ZpZGVySUR9LyR7Y2F0ZWdvcnlNb2RlbC5tb2RlbElEfWAgOiBcImRlZmF1bHRcIn1cbjwvdGFza19tZXRhZGF0YT5gXG59XG4iXX0=