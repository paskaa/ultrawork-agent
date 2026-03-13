/**
 * 测试所有武将 Agent 模型调用
 */

const OpenAI = require('openai')
const fs = require('fs')
const path = require('path')

// 读取 opencode.json 获取所有 agent 配置
const configPath = path.join(process.env.USERPROFILE, '.config', 'opencode', 'opencode.json')
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))

// Provider 配置
const PROVIDERS = {
  bailian: {
    apiKey: 'sk-sp-29b98baad96a41b4acb371e0600309a9',
    baseURL: 'https://coding.dashscope.aliyuncs.com/v1'
  },
  AstronCodingPlan: {
    apiKey: '3f372558e346d0e0b4ba9a22631b126d:ZWVhYWIyMTBiMTU4ZGNjZTMxZjFmNGVl',
    baseURL: 'https://maas-coding-api.cn-huabei-1.xf-yun.com/v2'
  },
  minimax: {
    apiKey: 'sk-cp-xMc4JxzLEnINyOaGqVmUJYOMmsepLgNLVFw6GbcOxl-sb3-VYzaErvW1O_Sg6y4h8jEgEgscLuQqCjH7ZvWJhFlukEXAIoRr9niEDOKqLqlCSHoCMAS9bhI',
    baseURL: 'https://api.minimaxi.com/v1'
  }
}

// 测试单个模型
async function testModel(provider, modelId) {
  const providerConfig = PROVIDERS[provider]
  if (!providerConfig) {
    return { success: false, error: `Unknown provider: ${provider}` }
  }

  const client = new OpenAI({
    apiKey: providerConfig.apiKey,
    baseURL: providerConfig.baseURL
  })

  try {
    const startTime = Date.now()
    const response = await client.chat.completions.create({
      model: modelId,
      messages: [{ role: 'user', content: 'Hi' }],
      max_tokens: 5,
      timeout: 30000 // 30秒超时
    })
    const elapsed = Date.now() - startTime
    
    return { 
      success: true, 
      elapsed,
      content: response.choices[0]?.message?.content?.substring(0, 30)
    }
  } catch (error) {
    return { 
      success: false, 
      error: `${error.status || error.code}: ${error.message?.substring(0, 60)}`
    }
  }
}

async function main() {
  console.log('🦸 测试所有武将 Agent 模型调用\n')
  console.log('='.repeat(60))

  const agents = config.agent
  const results = {}
  const modelTests = {}

  // 收集所有需要测试的模型
  for (const [agentName, agentConfig] of Object.entries(agents)) {
    const model = agentConfig.model
    if (!modelTests[model]) {
      modelTests[model] = []
    }
    modelTests[model].push(agentName)
  }

  console.log(`📋 发现 ${Object.keys(modelTests).length} 个不同模型\n`)

  // 测试每个模型
  for (const [fullModelId, agentList] of Object.entries(modelTests)) {
    const [provider, modelId] = fullModelId.split('/')
    
    process.stdout.write(`🧪 ${fullModelId}... `)
    const result = await testModel(provider, modelId)
    results[fullModelId] = result
    
    if (result.success) {
      console.log(`✅ ${result.elapsed}ms - ${result.content}`)
    } else {
      console.log(`❌ ${result.error}`)
    }
    
    // 显示使用此模型的武将
    console.log(`   └─ 武将: ${agentList.join(', ')}`)
    console.log()
    
    await new Promise(r => setTimeout(r, 1000))
  }

  // 统计
  console.log('='.repeat(60))
  const success = Object.values(results).filter(r => r.success).length
  const fail = Object.values(results).filter(r => !r.success).length
  
  console.log(`\n📊 统计: 成功 ${success}/${Object.keys(results).length}, 失败 ${fail}`)
  
  if (fail > 0) {
    console.log('\n❌ 失败的模型:')
    for (const [model, result] of Object.entries(results)) {
      if (!result.success) {
        console.log(`   ${model}: ${result.error}`)
      }
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('🎉 所有武将 Agent 模型测试完成!')
}

main().catch(console.error)