import type { UltraWorkSanguoConfig, CategoryConfig, AgentConfig } from "../config/schema.js"

export interface RoutingResult {
  category: string
  primaryAgent: string
  supportAgents: string[]
  model: string
  fallbackModels: string[]
}

export function detectCategory(config: UltraWorkSanguoConfig, taskDescription: string): string {
  const categories = config.categories ?? {}
  let bestMatch = config.task_routing?.default_category ?? "deep"
  let maxMatches = 0

  for (const [categoryName, categoryConfig] of Object.entries(categories)) {
    const cfg = categoryConfig as CategoryConfig
    const keywords = cfg.keywords ?? []
    const matches = keywords.filter((keyword: string) =>
      taskDescription.toLowerCase().includes(keyword.toLowerCase())
    ).length

    if (matches > maxMatches) {
      maxMatches = matches
      bestMatch = categoryName
    }
  }

  return bestMatch
}

export function routeTask(config: UltraWorkSanguoConfig, taskDescription: string): RoutingResult {
  const category = detectCategory(config, taskDescription)
  const categories = config.categories ?? {}
  const categoryConfig = categories[category] as CategoryConfig | undefined

  if (!categoryConfig) {
    const defaultAgent = config.task_routing?.default_agent ?? "zhaoyun"
    const agents = config.agents ?? {}
    const agentConfig = agents[defaultAgent] as AgentConfig | undefined
    return {
      category,
      primaryAgent: defaultAgent,
      supportAgents: [],
      model: agentConfig?.model ?? "zai-coding-plan/glm-5",
      fallbackModels: agentConfig?.fallback_models ?? [],
    }
  }

  const primaryAgent = categoryConfig.primaryAgent ?? config.task_routing?.default_agent ?? "zhaoyun"
  const supportAgents = categoryConfig.supportAgents ?? []
  const agents = config.agents ?? {}
  const agentConfig = agents[primaryAgent] as AgentConfig | undefined

  return {
    category,
    primaryAgent,
    supportAgents,
    model: categoryConfig.model ?? agentConfig?.model ?? "zai-coding-plan/glm-5",
    fallbackModels: categoryConfig.fallback_models ?? agentConfig?.fallback_models ?? [],
  }
}

export function routeByAgent(config: UltraWorkSanguoConfig, agentName: string): RoutingResult | null {
  const agents = config.agents ?? {}
  const agentConfig = agents[agentName] as AgentConfig | undefined
  if (!agentConfig) {
    return null
  }

  const categories = agentConfig.categories ?? []
  const category = categories[0] ?? "deep"
  const categoryConfigs = config.categories ?? {}
  const categoryConfig = categoryConfigs[category] as CategoryConfig | undefined

  return {
    category,
    primaryAgent: agentName,
    supportAgents: categoryConfig?.supportAgents ?? [],
    model: agentConfig.model ?? "zai-coding-plan/glm-5",
    fallbackModels: agentConfig.fallback_models ?? [],
  }
}

const AGENT_TITLES: Record<string, string> = {
  zhugeliang: "诸葛亮 (孔明) - 主帅",
  zhouyu: "周瑜 (公瑾) - 大都督",
  zhaoyun: "赵云 (子龙) - 大将",
  simayi: "司马懿 (仲达) - 谋士",
  guanyu: "关羽 (云长) - 质量守护者",
  zhangfei: "张飞 (翼德) - 猛将",
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  orchestrator: "运筹帷幄、调兵遣将，协调整个军团运作。",
  planner: "访谈式需求分析，架构设计，决策支持。",
  executor: "自主深度工作，攻坚克难，擅长编码和重构。",
  explorer: "洞察秋毫，代码搜索，信息收集，模式发现。",
  reviewer: "义薄云天，Code Review，代码质量把关，安全审计。",
  quickfixer: "雷厉风行，速战速决，快速修复 Bug。",
}

export function buildAgentSystemPrompt(
  config: UltraWorkSanguoConfig,
  agentName: string,
  taskContext?: string
): string {
  const agents = config.agents ?? {}
  const agentConfig = agents[agentName] as AgentConfig | undefined
  if (!agentConfig) {
    return ""
  }

  const sections: string[] = []
  const title = AGENT_TITLES[agentName] ?? agentName
  
  sections.push(`# ${title}`)
  
  if (agentConfig.description) {
    sections.push(`\n## 身份\n\n你是${agentConfig.description}。`)
  }

  if (agentConfig.role) {
    const roleDesc = ROLE_DESCRIPTIONS[agentConfig.role] ?? ""
    if (roleDesc) {
      sections.push(`\n## 角色\n\n${roleDesc}`)
    }
  }

  if (agentConfig.prompt_append) {
    sections.push(`\n## 指令\n\n${agentConfig.prompt_append}`)
  }

  if (taskContext) {
    sections.push(`\n## 任务上下文\n\n${taskContext}`)
  }

  sections.push(`\n## 模型信息\n\n当前使用模型: ${agentConfig.model ?? "default"}`)

  return sections.join("\n")
}