export interface CategoryModel {
  providerID: string
  modelID: string
  variant?: string
}

type SessionCreateResult = 
  | { ok: true; sessionID: string; parentDirectory: string }
  | { ok: false; error: string }

type PromptResult = 
  | { ok: true }
  | { ok: false; error: string }

type PollResult = 
  | { ok: true }
  | { ok: false; error: string }

type FetchResult = 
  | { ok: true; sessionID: string; textContent: string }
  | { ok: false; error: string }

export function parseModelString(model: string): CategoryModel | null {
  const parts = model.split("/")
  if (parts.length < 2) {
    return null
  }
  return {
    providerID: parts[0],
    modelID: parts.slice(1).join("/"),
  }
}

const QUESTION_DENIED_PERMISSION = [
  { permission: "question", action: "deny" as const, pattern: "*" },
]

export async function createSyncSession(
  client: any,
  input: {
    parentSessionID: string
    agentToUse: string
    description: string
    defaultDirectory: string
    categoryModel?: CategoryModel
  }
): Promise<SessionCreateResult> {
  let parentDirectory = input.defaultDirectory

  try {
    if (client.session.get) {
      const parentSession = await client.session.get({ path: { id: input.parentSessionID } }).catch(() => undefined)
      if (parentSession?.data?.directory) {
        parentDirectory = parentSession.data.directory
      }
    }
  } catch {
    // Ignore errors
  }

  try {
    console.log("[UltraWork-SanGuo] Creating session with parentID:", input.parentSessionID)

    // 参考 oh-my-openagent 的参数结构: body + query
    // 传递模型参数以便在创建会话时指定模型
    const createBody: any = {
      parentID: input.parentSessionID,
      title: `[${input.agentToUse}] ${input.description}`,
      permission: QUESTION_DENIED_PERMISSION,
    }
    
    // 如果提供了模型参数，在创建会话时指定模型
    if (input.categoryModel) {
      createBody.model = {
        providerID: input.categoryModel.providerID,
        modelID: input.categoryModel.modelID,
      }
      console.log("[UltraWork-SanGuo] 创建会话时设置模型:", input.categoryModel.providerID + "/" + input.categoryModel.modelID)
    }
    
    const createResult = await client.session.create({
      body: createBody,
      query: {
        directory: parentDirectory,
      },
    })
    
    console.log("[UltraWork-SanGuo] Session create result:", createResult)

    if (createResult.error) {
      return { ok: false, error: `Failed to create session: ${safeStringify(createResult.error)}` }
    }

    if (!createResult.data?.id) {
      return { ok: false, error: "Failed to create session: no session ID returned" }
    }

    return { ok: true, sessionID: createResult.data.id, parentDirectory }
  } catch (err) {
    console.log("[UltraWork-SanGuo] Session create error:", err)
    return { ok: false, error: `Failed to create session: ${safeStringify(err)}` }
  }
}

const agentNames: Record<string, string> = {
  zhugeliang: "Sisyphus",
  zhouyu: "Prometheus",
  zhaoyun: "Sisyphus",
  simayi: "Explore",
  guanyu: "Sisyphus",
  zhangfei: "Sisyphus",
}

// 安全地将对象转换为字符串
function safeStringify(obj: unknown): string {
  try {
    if (obj === null) return 'null'
    if (obj === undefined) return 'undefined'
    if (typeof obj === 'string') return obj
    if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj)
    if (obj instanceof Error) return obj.message || obj.name || 'Error'
    if (typeof obj === 'object') {
      // 尝试提取常见的错误字段
      const errObj = obj as Record<string, any>
      if (errObj.message && typeof errObj.message === 'string') return errObj.message
      if (errObj.error && typeof errObj.error === 'string') return errObj.error
      if (errObj.detail && typeof errObj.detail === 'string') return errObj.detail
      if (errObj.msg && typeof errObj.msg === 'string') return errObj.msg
      // 最后尝试 JSON.stringify，但捕获循环引用错误
      try {
        return JSON.stringify(obj)
      } catch {
        // 如果 JSON.stringify 失败（循环引用等），返回对象类型
        return Object.prototype.toString.call(obj)
      }
    }
    return String(obj)
  } catch {
    return '[unknown error]'
  }
}

export async function sendPromptWithModel(
  client: any,
  input: {
    sessionID: string
    agentToUse: string
    prompt: string
    systemContent?: string
    categoryModel?: CategoryModel
  }
): Promise<PromptResult> {
  // 直接使用将领名称，不映射到内置 agent
  // 因为 OpenCode 可能没有 "Sisyphus" 等 agent
  const effectiveAgent = input.agentToUse

  console.log("[UltraWork-SanGuo] sendPromptWithModel called")
  console.log("[UltraWork-SanGuo] sessionID:", input.sessionID)
  console.log("[UltraWork-SanGuo] agent:", effectiveAgent)

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
    }

    console.log("[UltraWork-SanGuo] promptAsync args:", JSON.stringify(promptArgs, null, 2))

    const result = await client.session.promptAsync(promptArgs)

    // 详细调试日志
    console.log("[UltraWork-SanGuo] promptAsync result:", result)
    if (result) {
      console.log("[UltraWork-SanGuo] result keys:", Object.keys(result))
      console.log("[UltraWork-SanGuo] result.error:", result.error)
      console.log("[UltraWork-SanGuo] result.data:", result.data)
      if (result.response) {
        console.log("[UltraWork-SanGuo] result.response.status:", result.response.status)
      }
    }

    // SDK 返回 { data, error, request, response } 结构
    // 对于 promptAsync，成功时返回 204 void
    
    // 如果 result 存在且有 error 属性，说明有错误
    if (result && result.error != null) {
      const errorStr = safeStringify(result.error)
      console.log("[UltraWork-SanGuo] Returning error:", errorStr)
      return { ok: false, error: errorStr }
    }

    // 检查是否有 response 但状态码不是 2xx
    if (result && result.response && result.response.status) {
      const status = result.response.status
      console.log("[UltraWork-SanGuo] Response status:", status)
      if (status >= 200 && status < 300) {
        // 2xx 状态码表示成功
        return { ok: true }
      }
      return { ok: false, error: `HTTP ${status}: ${result.response.statusText || 'Unknown error'}` }
    }

    // 如果 result.data 存在，说明成功（对于 204 响应，data 可能是 undefined）
    if (result && 'data' in result) {
      console.log("[UltraWork-SanGuo] Success (data in result)")
      return { ok: true }
    }

    // 如果都没有错误，假设成功
    console.log("[UltraWork-SanGuo] Success (no error)")
    return { ok: true }
  } catch (err) {
    console.log("[UltraWork-SanGuo] Exception:", err)
    return { ok: false, error: safeStringify(err) }
  }
}

// 测试用短超时
const DEFAULT_TIMEOUT_MS = 60000  // 60秒

export async function pollSessionUntilComplete(
  client: any,
  sessionID: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<PollResult> {
  const startTime = Date.now()
  const pollInterval = 2000
  let pollCount = 0

  console.log("[UltraWork-SanGuo] 开始轮询会话:", sessionID)

  while (Date.now() - startTime < timeoutMs) {
    pollCount++
    try {
      // 使用 session.status() 检查会话状态
      const statusResult = await client.session.status()
      console.log("[UltraWork-SanGuo] Poll", pollCount, "status result keys:", statusResult ? Object.keys(statusResult) : "null")
      
      const sessionStatus = statusResult?.data?.[sessionID]
      console.log("[UltraWork-SanGuo] Poll", pollCount, "session status:", sessionStatus)

      // 如果会话状态是 idle，说明已完成
      if (sessionStatus && sessionStatus.type === "idle") {
        console.log("[UltraWork-SanGuo] 会话已完成 (idle)")
        return { ok: true }
      }

      // 备用：检查 session.get 的状态
      const result = await client.session.get({ path: { id: sessionID } })
      console.log("[UltraWork-SanGuo] Poll", pollCount, "session.get result:", result?.data ? { id: result.data.id, busy: result.data.busy } : "no data")
      
      if (result.data?.busy === false) {
        console.log("[UltraWork-SanGuo] 会话已完成 (busy=false)")
        return { ok: true }
      }

      // 每10次轮询输出一次进度
      if (pollCount % 10 === 0) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        console.log(`[UltraWork-SanGuo] 轮询中... ${pollCount}次, ${elapsed}秒`)
      }

      await new Promise((r) => setTimeout(r, pollInterval))
    } catch (err) {
      console.log("[UltraWork-SanGuo] Poll error:", safeStringify(err))
      // 继续轮询，不因为单次错误而失败
      await new Promise((r) => setTimeout(r, pollInterval))
    }
  }

  console.log("[UltraWork-SanGuo] 轮询超时")
  return { ok: false, error: `Timeout after ${timeoutMs}ms` }
}

export async function fetchSessionResult(
  client: any,
  sessionID: string
): Promise<FetchResult> {
  try {
    console.log("[UltraWork-SanGuo] 获取会话消息:", sessionID)
    const result = await client.session.messages({ path: { id: sessionID } })

    console.log("[UltraWork-SanGuo] messages result:", result?.data ? `${result.data.length} messages` : "no data")

    if (!result.data) {
      return { ok: false, error: "No messages found" }
    }

    // 消息格式: { info: { role: "assistant" | "user", ... }, parts: [...] }
    const messages = result.data as any[]
    
    // 过滤 assistant 消息，按创建时间排序
    const assistantMessages = messages
      .filter((m: any) => m.info?.role === "assistant")
      .sort((a: any, b: any) => (b.info?.time?.created ?? 0) - (a.info?.time?.created ?? 0))
    
    console.log("[UltraWork-SanGuo] assistant messages:", assistantMessages.length)

    if (assistantMessages.length === 0) {
      return { ok: false, error: "No assistant response found" }
    }

    // 查找第一个有文本内容的 assistant 消息
    for (const msg of assistantMessages) {
      const textParts = msg.parts?.filter((p: any) => p.type === "text" || p.type === "reasoning") ?? []
      const content = textParts.map((p: any) => p.text ?? "").filter(Boolean).join("\n")
      if (content) {
        console.log("[UltraWork-SanGuo] 找到响应内容，长度:", content.length)
        return {
          ok: true,
          sessionID,
          textContent: content || "(No text output)",
        }
      }
    }

    return { ok: false, error: "No text content in assistant response" }
  } catch (err) {
    console.log("[UltraWork-SanGuo] fetchSessionResult error:", safeStringify(err))
    return { ok: false, error: safeStringify(err) }
  }
}

export interface DelegateTaskArgs {
  description: string
  prompt: string
  category?: string
  agent?: string
}

interface ExecutionContext {
  client: any
  sessionID: string
  directory: string
}

interface AgentConfig {
  description?: string
  prompt_append?: string
  model?: string
}

interface UltraWorkSanguoConfig {
  agents?: Record<string, AgentConfig>
  categories?: Record<string, { description?: string; primaryAgent?: string; model?: string }>
  task_routing?: { default_agent?: string }
}

export async function executeSyncTask(
  args: DelegateTaskArgs,
  ctx: ExecutionContext,
  config: UltraWorkSanguoConfig,
  agentName: string,
  categoryModel?: CategoryModel
): Promise<string> {
  console.log(`[UltraWork-SanGuo] 执行任务，将领: ${agentName}, 模型: ${categoryModel ? `${categoryModel.providerID}/${categoryModel.modelID}` : "default"}`)
  
  // 重新注入认证（确保每次执行时都有认证）
  const { injectServerAuthIntoClient } = await import("../auth.js")
  injectServerAuthIntoClient(ctx.client)

  // 1. 创建子会话（带模型参数）
  const sessionResult = await createSyncSession(ctx.client, {
    parentSessionID: ctx.sessionID,
    agentToUse: agentName,
    description: args.description,
    defaultDirectory: ctx.directory,
    categoryModel,
  })

  if (!sessionResult.ok) {
    return `❌ 创建会话失败: ${sessionResult.error}`
  }

  const childSessionID = sessionResult.sessionID
  console.log(`[UltraWork-SanGuo] 会话已创建: ${childSessionID}`)

  // 2. 获取将领的系统提示
  const agents = config.agents ?? {}
  const agentConfig = agents[agentName] as AgentConfig | undefined
  const systemContent = agentConfig?.prompt_append ?? `你是${agentConfig?.description ?? agentName}。`

  // 3. 发送提示（带模型参数）
  console.log("[UltraWork-SanGuo] 准备发送提示，sessionID:", childSessionID)
  const promptResult = await sendPromptWithModel(ctx.client, {
    sessionID: childSessionID,
    agentToUse: agentName,
    prompt: args.prompt,
    systemContent,
    categoryModel,
  })
  console.log("[UltraWork-SanGuo] sendPromptWithModel 结果:", JSON.stringify(promptResult))

  if (!promptResult.ok) {
    console.log("[UltraWork-SanGuo] 发送提示失败，错误:", promptResult.error)
    return `❌ 发送提示失败: ${safeStringify(promptResult.error)}

💡 **建议:** 请使用 OpenCode 内置的 task 工具执行此任务:

\`\`\`json
{
  "tool": "task",
  "description": "${args.description}",
  "prompt": "${systemContent}\n\n${args.prompt}",
  "subagent_type": "${agentNames[agentName] ?? "Sisyphus"}"
}
\`\`\``
  }

  console.log("[UltraWork-SanGuo] 提示发送成功，开始轮询...")

  // 4. 轮询等待完成（显式传递超时参数）
  const pollResult = await pollSessionUntilComplete(ctx.client, childSessionID, 60000)
  console.log("[UltraWork-SanGuo] 轮询结果:", pollResult)
  
  // 5. 获取结果
  const result = await fetchSessionResult(ctx.client, childSessionID)

  if (!result.ok) {
    // 如果轮询超时且没有结果，返回超时消息
    if (!pollResult.ok) {
      return `❌ 执行超时: ${pollResult.error}\n\n会话可能仍在运行中，稍后可使用 session_id: ${childSessionID} 查看结果`
    }
    return `❌ 获取结果失败: ${result.error}`
  }

  console.log(`[UltraWork-SanGuo] 任务完成!`)

  return `✅ 任务完成!

将领: ${agentName}${args.category ? ` (类别: ${args.category})` : ""}
模型: ${categoryModel ? `${categoryModel.providerID}/${categoryModel.modelID}` : "默认"}

---

${result.textContent}

<task_metadata>
session_id: ${childSessionID}
agent: ${agentName}
model: ${categoryModel ? `${categoryModel.providerID}/${categoryModel.modelID}` : "default"}
</task_metadata>`
}
