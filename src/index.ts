import { tool } from "@opencode-ai/plugin/tool"
import type { Plugin } from "@opencode-ai/plugin"
import { loadConfig } from "./config/loader.js"
import { routeTask, routeByAgent } from "./agents/router.js"
import { executeSyncTask, parseModelString } from "./executor/index.js"
import type { UltraWorkSanguoConfig, AgentConfig, CategoryConfig } from "./config/schema.js"

const configCache = new Map<string, UltraWorkSanguoConfig>()

function getConfig(directory: string): UltraWorkSanguoConfig {
  if (!configCache.has(directory)) {
    configCache.set(directory, loadConfig(directory))
  }
  return configCache.get(directory)!
}

interface ParsedPrompt {
  agent: string | null
  cleanPrompt: string
}

function parseAgentMention(prompt: string, availableAgents: string[]): ParsedPrompt {
  const mentionRegex = /@([a-zA-Z_][a-zA-Z0-9_]*)/g
  let match: RegExpExecArray | null
  let detectedAgent: string | null = null
  let cleanPrompt = prompt

  while ((match = mentionRegex.exec(prompt)) !== null) {
    const mentionedName = match[1].toLowerCase()
    const matchedAgent = availableAgents.find(
      (agent) => agent.toLowerCase() === mentionedName
    )
    if (matchedAgent) {
      detectedAgent = matchedAgent
      cleanPrompt = cleanPrompt.replace(match[0], "").trim()
      break
    }
  }

  return { agent: detectedAgent, cleanPrompt }
}

const UltraWorkSanguoPlugin: Plugin = async (ctx) => {
  console.log("[UltraWork-SanGuo] 🏰 三国军团调度系统启动...")
  const config = getConfig(ctx.directory)
  console.log("[UltraWork-SanGuo] ✅ 配置加载完成")
  console.log("[UltraWork-SanGuo] 将领:", Object.keys(config.agents ?? {}).join(", "))
  console.log("[UltraWork-SanGuo] 类别:", Object.keys(config.categories ?? {}).join(", "))

  const agents = config.agents ?? {}
  const categories = config.categories ?? {}

  const agentList = Object.entries(agents)
    .map(([name, cfg]) => {
      const agentCfg = cfg as AgentConfig
      return `  - ${name}: ${agentCfg.model ?? "default"} - ${agentCfg.description ?? ""}`
    })
    .join("\n")

  const categoryList = Object.entries(categories)
    .map(([name, cfg]) => {
      const catCfg = cfg as CategoryConfig
      return `  - ${name}: ${catCfg.description ?? ""}`
    })
    .join("\n")

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
4. 都不指定: 根据任务关键词自动检测类别`,
    args: {
      description: tool.schema.string().describe("任务简短描述 (3-5 词)"),
      prompt: tool.schema.string().describe("详细的任务内容 (可用 @将领名 指定将领)"),
      category: tool.schema.string().optional().describe("任务类别 (可选)"),
      agent: tool.schema.string().optional().describe("将领名称 (可选)"),
    },
    async execute(args, toolCtx) {
      const cfg = getConfig(ctx.directory)
      const agentsCfg = cfg.agents ?? {}
      const categoriesCfg = cfg.categories ?? {}
      const availableAgents = Object.keys(agentsCfg)

      // 解析 @武将名 语法
      const parsedPrompt = parseAgentMention(args.prompt, availableAgents)
      let actualPrompt = parsedPrompt.cleanPrompt
      let agentFromPrompt = parsedPrompt.agent

      // 解析路由
      let agentName: string
      let categoryName: string | undefined
      let model: string | undefined

      // 优先级: agent 参数 > @武将名 > category 参数 > 自动检测
      if (args.agent) {
        const routing = routeByAgent(cfg, args.agent)
        if (routing) {
          agentName = routing.primaryAgent
          categoryName = routing.category
          model = routing.model
        } else {
          agentName = args.agent
          const agentCfg = agentsCfg[agentName] as AgentConfig | undefined
          model = agentCfg?.model
        }
      } else if (agentFromPrompt) {
        // 从 prompt 中解析到 @武将名
        const routing = routeByAgent(cfg, agentFromPrompt)
        if (routing) {
          agentName = routing.primaryAgent
          categoryName = routing.category
          model = routing.model
        } else {
          agentName = agentFromPrompt
          const agentCfg = agentsCfg[agentName] as AgentConfig | undefined
          model = agentCfg?.model
        }
        console.log(`[UltraWork-SanGuo] 从 prompt 解析到将领: @${agentFromPrompt}`)
      } else if (args.category) {
        categoryName = args.category
        const categoryConfig = categoriesCfg[categoryName] as CategoryConfig | undefined
        agentName = categoryConfig?.primaryAgent ?? cfg.task_routing?.default_agent ?? "zhaoyun"
        const agentCfg = agentsCfg[agentName] as AgentConfig | undefined
        model = categoryConfig?.model ?? agentCfg?.model
      } else {
        const routing = routeTask(cfg, args.description)
        agentName = routing.primaryAgent
        categoryName = routing.category
        model = routing.model
      }

      console.log(`[UltraWork-SanGuo] 路由结果:`)
      console.log(`  类别: ${categoryName ?? "auto"}`)
      console.log(`  将领: ${agentName}`)
      console.log(`  模型: ${model ?? "default"}`)

      // 解析模型
      const categoryModel = model ? parseModelString(model) : undefined

      // 设置元数据
      toolCtx.metadata({
        title: args.description,
        metadata: {
          agent: agentName,
          category: categoryName,
          model: categoryModel ? `${categoryModel.providerID}/${categoryModel.modelID}` : "default",
        },
      })

      // 执行任务
      return executeSyncTask(
        {
          description: args.description,
          prompt: actualPrompt,
          category: categoryName,
          agent: agentName,
        },
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          client: ctx.client as any,
          sessionID: toolCtx.sessionID,
          directory: toolCtx.directory,
        },
        cfg,
        agentName,
        categoryModel ?? undefined
      )
    },
  })

  return {
    tool: {
      ultrawork_task: ultraworkTask,
    },
  }
}

export default UltraWorkSanguoPlugin
export type { UltraWorkSanguoConfig, AgentConfig, CategoryConfig }