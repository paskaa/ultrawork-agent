import * as fs from "fs"
import * as path from "path"
import { UltraWorkSanguoConfigSchema, DEFAULT_AGENTS, DEFAULT_CATEGORIES, DEFAULT_ROUTING_RULES } from "./schema.js"
import type { UltraWorkSanguoConfig, AgentConfig, CategoryConfig } from "./schema.js"

export function parseJsonc<T>(content: string): T {
  const cleaned = content
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
  return JSON.parse(cleaned) as T
}

export function deepMerge<T extends Record<string, unknown>>(base: T, override: Partial<T>): T {
  const result = { ...base } as T
  for (const key of Object.keys(override) as (keyof T)[]) {
    const overrideValue = override[key]
    if (overrideValue !== undefined) {
      if (typeof overrideValue === "object" && overrideValue !== null && !Array.isArray(overrideValue)) {
        result[key] = deepMerge(
          (base[key] as Record<string, unknown>) || {},
          overrideValue as Record<string, unknown>
        ) as T[keyof T]
      } else {
        result[key] = overrideValue as T[keyof T]
      }
    }
  }
  return result
}

const defaultConfig: UltraWorkSanguoConfig = {
  agents: DEFAULT_AGENTS,
  categories: DEFAULT_CATEGORIES,
  task_routing: {
    rules: DEFAULT_ROUTING_RULES,
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
}

export function loadConfig(directory: string): UltraWorkSanguoConfig {
  const configPaths = [
    path.join(directory, ".opencode", "ultrawork-sanguo.jsonc"),
    path.join(directory, ".opencode", "ultrawork-sanguo.json"),
  ]

  let userConfig: Partial<UltraWorkSanguoConfig> = {}

  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, "utf-8")
        const rawConfig = parseJsonc<Record<string, unknown>>(content)
        const result = UltraWorkSanguoConfigSchema.safeParse(rawConfig)
        if (result.success) {
          userConfig = result.data as Partial<UltraWorkSanguoConfig>
          console.log(`[UltraWork] Config loaded from ${configPath}`)
          break
        } else {
          console.warn(`[UltraWork] Config validation error in ${configPath}`)
        }
      } catch (err) {
        console.warn(`[UltraWork] Error loading config from ${configPath}:`, err)
      }
    }
  }

  return deepMerge(defaultConfig, userConfig as Partial<UltraWorkSanguoConfig>)
}

export function getAgentConfig(config: UltraWorkSanguoConfig, agentName: string): AgentConfig | undefined {
  const disabled = config.disabled_agents ?? []
  if (disabled.includes(agentName)) {
    return undefined
  }
  return config.agents?.[agentName]
}

export function getCategoryConfig(config: UltraWorkSanguoConfig, categoryName: string): CategoryConfig | undefined {
  const disabled = config.disabled_categories ?? []
  if (disabled.includes(categoryName)) {
    return undefined
  }
  return config.categories?.[categoryName]
}

export function getModelForAgent(config: UltraWorkSanguoConfig, agentName: string): string | undefined {
  const agentConfig = getAgentConfig(config, agentName)
  return agentConfig?.model
}