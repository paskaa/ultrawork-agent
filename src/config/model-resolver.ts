/**
 * 模型解析器 - 将内部模型key解析为实际的provider/modelId
 * 
 * 使用方式:
 * 1. 武将配置中使用内部key: "gmodel", "q35model", "kmodel", "mmodel"
 * 2. 通过resolveModel()解析为实际模型ID: "bailian/glm-5", "AstronCodingPlan/astron-code-latest"
 * 3. 通过getFallbackModels()获取fallback链
 */

import * as fs from 'fs'
import * as path from 'path'

// 模型映射类型定义
export interface ModelMapping {
  name: string
  provider: string
  modelId: string
  fullId: string
  description: string
  costMultiplier: number
  capabilities: string[]
  fallbackChain: string[]
}

export interface ModelMappingConfig {
  version: string
  modelMapping: Record<string, ModelMapping>
  agentModelAssignments: Record<string, string>
  categoryModelAssignments: Record<string, string>
  providerConfigs: Record<string, {
    name: string
    baseURL: string
    apiKeyEnv: string
  }>
}

// 内部模型key类型
export type InternalModelKey = 'gmodel' | 'q35model' | 'kmodel' | 'mmodel'

// 缓存配置
let cachedConfig: ModelMappingConfig | null = null

/**
 * 加载模型映射配置
 */
export function loadModelMapping(): ModelMappingConfig {
  if (cachedConfig) {
    return cachedConfig
  }

  const configPath = path.join(__dirname, '..', '..', 'config', 'model-mapping.json')
  
  if (!fs.existsSync(configPath)) {
    throw new Error(`Model mapping config not found: ${configPath}`)
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  cachedConfig = config
  return config
}

/**
 * 解析内部模型key为实际模型ID
 * @param internalKey 内部模型key: "gmodel", "q35model", "kmodel", "mmodel"
 * @returns 实际模型ID: "bailian/glm-5", "AstronCodingPlan/astron-code-latest"
 */
export function resolveModel(internalKey: string): string {
  const config = loadModelMapping()
  const mapping = config.modelMapping[internalKey]
  
  if (!mapping) {
    // 如果已经是完整模型ID，直接返回
    if (internalKey.includes('/')) {
      return internalKey
    }
    throw new Error(`Unknown model key: ${internalKey}`)
  }
  
  return mapping.fullId
}

/**
 * 获取模型的fallback链
 * @param internalKey 内部模型key
 * @returns fallback模型ID数组
 */
export function getFallbackModels(internalKey: string): string[] {
  const config = loadModelMapping()
  const mapping = config.modelMapping[internalKey]
  
  if (!mapping) {
    return []
  }
  
  return mapping.fallbackChain.map(key => resolveModel(key))
}

/**
 * 获取武将分配的模型
 * @param agentName 武将名称
 * @returns 实际模型ID
 */
export function getAgentModel(agentName: string): string {
  const config = loadModelMapping()
  const internalKey = config.agentModelAssignments[agentName]
  
  if (!internalKey) {
    // 默认使用q35model
    return resolveModel('q35model')
  }
  
  return resolveModel(internalKey)
}

/**
 * 获取类别分配的模型
 * @param category 类别名称
 * @returns 实际模型ID
 */
export function getCategoryModel(category: string): string {
  const config = loadModelMapping()
  const internalKey = config.categoryModelAssignments[category]
  
  if (!internalKey) {
    // 默认使用q35model
    return resolveModel('q35model')
  }
  
  return resolveModel(internalKey)
}

/**
 * 获取武将的fallback模型链
 * @param agentName 武将名称
 * @returns fallback模型ID数组
 */
export function getAgentFallbackModels(agentName: string): string[] {
  const config = loadModelMapping()
  const internalKey = config.agentModelAssignments[agentName]
  
  if (!internalKey) {
    return []
  }
  
  return getFallbackModels(internalKey)
}

/**
 * 获取所有支持的内部模型key
 */
export function getInternalModelKeys(): string[] {
  const config = loadModelMapping()
  return Object.keys(config.modelMapping)
}

/**
 * 获取模型信息
 * @param internalKey 内部模型key
 */
export function getModelInfo(internalKey: string): ModelMapping | null {
  const config = loadModelMapping()
  return config.modelMapping[internalKey] || null
}

/**
 * 获取供应商配置
 * @param provider 供应商名称
 */
export function getProviderConfig(provider: string) {
  const config = loadModelMapping()
  return config.providerConfigs[provider] || null
}

/**
 * 批量解析模型配置
 * 将使用内部key的配置转换为实际模型ID
 */
export function resolveAgentConfig(agentConfig: {
  model?: string
  fallback_models?: string[]
  [key: string]: any
}): {
  model: string
  fallback_models: string[]
  [key: string]: any
} {
  const resolved = { ...agentConfig }
  
  if (agentConfig.model) {
    resolved.model = resolveModel(agentConfig.model)
  }
  
  if (agentConfig.fallback_models) {
    resolved.fallback_models = agentConfig.fallback_models.map(key => resolveModel(key))
  }
  
  return resolved
}

// 导出默认对象
export default {
  loadModelMapping,
  resolveModel,
  getFallbackModels,
  getAgentModel,
  getCategoryModel,
  getAgentFallbackModels,
  getInternalModelKeys,
  getModelInfo,
  getProviderConfig,
  resolveAgentConfig
}
