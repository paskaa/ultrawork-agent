import type { CategoryModel, DelegateTaskArgs, SessionCreateResult, TaskResult } from "./types.js"
import type { UltraWorkSanguoConfig, AgentConfig, CategoryConfig } from "../config/schema.js"

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

export async function createSyncSession(
  client: {
    session: {
      get?: (args: { path: { id: string } }) => Promise<{ data?: { directory?: string } }>
      create: (args: { body: Record<string, unknown>; query?: Record<string, unknown> }) => Promise<{ data: { id: string }; error?: unknown }>
    }
  },
  input: { parentSessionID: string; agentToUse: string; description: string; defaultDirectory: string }
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
    const createResult = await client.session.create({
      body: {
        parentID: input.parentSessionID,
        title: `[${input.agentToUse}] ${input.description}`,
      },
      query: {
        directory: parentDirectory,
      },
    })

    if (createResult.error) {
      return { ok: false, error: `Failed to create session: ${createResult.error}` }
    }

    return { ok: true, sessionID: createResult.data.id, parentDirectory }
  } catch (err) {
    return { ok: false, error: `Failed to create session: ${err}` }
  }
}

export async function sendPromptWithModel(
  client: {
    prompt: {
      create: (args: {
        path: { id: string }
        body: {
          agent?: string
          system?: string
          parts: Array<{ type: string; text: string }>
          model?: { providerID: string; modelID: string }
          variant?: string
          tools?: Record<string, boolean>
        }
      }) => Promise<{ error?: unknown }>
    }
  },
  input: {
    sessionID: string
    agentToUse: string
    prompt: string
    systemContent?: string
    categoryModel?: CategoryModel
  }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const agentNames: Record<string, string> = {
    zhugeliang: "Sisyphus",
    zhouyu: "Prometheus",
    zhaoyun: "Sisyphus",
    simayi: "Explore",
    guanyu: "Sisyphus",
    zhangfei: "Sisyphus",
  }

  const effectiveAgent = agentNames[input.agentToUse] ?? "Sisyphus"

  try {
    const result = await client.prompt.create({
      path: { id: input.sessionID },
      body: {
        agent: effectiveAgent,
        system: input.systemContent,
        parts: [{ type: "text", text: input.prompt }],
        ...(input.categoryModel
          ? { model: { providerID: input.categoryModel.providerID, modelID: input.categoryModel.modelID } }
          : {}),
        ...(input.categoryModel?.variant ? { variant: input.categoryModel.variant } : {}),
        tools: { task: false },
      },
    })

    if (result.error) {
      return { ok: false, error: String(result.error) }
    }

    return { ok: true }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}

export async function pollSessionUntilComplete(
  client: {
    session: {
      get: (args: { path: { id: string } }) => Promise<{
        data?: {
          status?: string
          busy?: boolean
        }
      }>
    }
  },
  sessionID: string,
  timeoutMs: number = 180000
): Promise<{ ok: true } | { ok: false; error: string }> {
  const startTime = Date.now()
  const pollInterval = 2000

  while (Date.now() - startTime < timeoutMs) {
    try {
      const result = await client.session.get({ path: { id: sessionID } })
      
      if (result.data?.status === "completed" || result.data?.busy === false) {
        return { ok: true }
      }

      await new Promise((r) => setTimeout(r, pollInterval))
    } catch (err) {
      return { ok: false, error: String(err) }
    }
  }

  return { ok: false, error: `Timeout after ${timeoutMs}ms` }
}

export async function fetchSessionResult(
  client: {
    message: {
      list: (args: { path: { id: string }; query?: { limit?: number } }) => Promise<{
        data?: Array<{ role: string; content?: Array<{ type: string; text?: string }> }>
      }>
    }
  },
  sessionID: string
): Promise<TaskResult> {
  try {
    const result = await client.message.list({
      path: { id: sessionID },
      query: { limit: 10 },
    })

    if (!result.data) {
      return { ok: false, error: "No messages found" }
    }

    const assistantMessages = result.data.filter((m) => m.role === "assistant")
    
    if (assistantMessages.length === 0) {
      return { ok: false, error: "No assistant response found" }
    }

    const lastMessage = assistantMessages[assistantMessages.length - 1]
    const textParts = (lastMessage.content ?? [])
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("\n")

    return {
      ok: true,
      sessionID,
      textContent: textParts || "(No text output)",
    }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}

interface ExecutionContext {
  client: {
    session: {
      get: (args: { path: { id: string } }) => Promise<{ data?: { directory?: string; status?: string; busy?: boolean } }>
      create: (args: { body: Record<string, unknown>; query?: Record<string, unknown> }) => Promise<{ data: { id: string }; error?: unknown }>
    }
    prompt: {
      create: (args: {
        path: { id: string }
        body: {
          agent?: string
          system?: string
          parts: Array<{ type: string; text: string }>
          model?: { providerID: string; modelID: string }
          variant?: string
          tools?: Record<string, boolean>
        }
      }) => Promise<{ error?: unknown }>
    }
    message: {
      list: (args: { path: { id: string }; query?: { limit?: number } }) => Promise<{
        data?: Array<{ role: string; content?: Array<{ type: string; text?: string }> }>
      }>
    }
  }
  sessionID: string
  directory: string
}

export async function executeSyncTask(
  args: DelegateTaskArgs,
  ctx: ExecutionContext,
  config: UltraWorkSanguoConfig,
  agentName: string,
  categoryModel?: CategoryModel
): Promise<string> {
  console.log(`[UltraWork-SanGuo] 创建会话，将领: ${agentName}, 模型: ${categoryModel ? `${categoryModel.providerID}/${categoryModel.modelID}` : "default"}`)

  // 1. 创建子会话
  const sessionResult = await createSyncSession(ctx.client, {
    parentSessionID: ctx.sessionID,
    agentToUse: agentName,
    description: args.description,
    defaultDirectory: ctx.directory,
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
  const promptResult = await sendPromptWithModel(ctx.client, {
    sessionID: childSessionID,
    agentToUse: agentName,
    prompt: args.prompt,
    systemContent,
    categoryModel,
  })

  if (!promptResult.ok) {
    return `❌ 发送提示失败: ${promptResult.error}`
  }

  console.log(`[UltraWork-SanGuo] 提示已发送，等待响应...`)

  // 4. 轮询等待完成
  const pollResult = await pollSessionUntilComplete(ctx.client, childSessionID)

  if (!pollResult.ok) {
    return `❌ 执行超时: ${pollResult.error}`
  }

  // 5. 获取结果
  const result = await fetchSessionResult(ctx.client, childSessionID)

  if (!result.ok) {
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