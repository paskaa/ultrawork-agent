/**
 * 测试 AstronCodingPlan 和 minimax 的 OpenAI 兼容格式
 */

const OpenAI = require('openai')

const TEST_PROMPT = '用一句话介绍你自己。'

// AstronCodingPlan 端点测试
const ASTRON_ENDPOINTS = [
  {
    name: 'AstronCodingPlan 原端点 /v2',
    baseURL: 'https://maas-coding-api.cn-huabei-1.xf-yun.com/v2',
    model: 'astron-code-latest',
    apiKey: '3f372558e346d0e0b4ba9a22631b126d:ZWVhYWIyMTBiMTU4ZGNjZTMxZjFmNGVl'
  },
  {
    name: 'AstronCodingPlan OpenAI 兼容 /v1',
    baseURL: 'https://maas-coding-api.cn-huabei-1.xf-yun.com/v1',
    model: 'astron-code-latest',
    apiKey: '3f372558e346d0e0b4ba9a22631b126d:ZWVhYWIyMTBiMTU4ZGNjZTMxZjFmNGVl'
  }
]

// minimax 端点测试
const MINIMAX_ENDPOINTS = [
  {
    name: 'minimax 原端点 /v1',
    baseURL: 'https://api.minimaxi.com/v1',
    model: 'MiniMax-M2.5-highspeed',
    apiKey: 'sk-cp-xMc4JxzLEnINyOaGqVmUJYOMmsepLgNLVFw6GbcOxl-sb3-VYzaErvW1O_Sg6y4h8jEgEgscLuQqCjH7ZvWJhFlukEXAIoRr9niEDOKqLqlCSHoCMAS9bhI'
  },
  {
    name: 'minimax OpenAI 兼容 /v1 (同上)',
    baseURL: 'https://api.minimaxi.com/v1',
    model: 'MiniMax-M2.5',
    apiKey: 'sk-cp-xMc4JxzLEnINyOaGqVmUJYOMmsepLgNLVFw6GbcOxl-sb3-VYzaErvW1O_Sg6y4h8jEgEgscLuQqCjH7ZvWJhFlukEXAIoRr9niEDOKqLqlCSHoCMAS9bhI'
  },
  {
    name: 'minimax Anthropic 兼容 /anthropic/v1',
    baseURL: 'https://api.minimaxi.com/anthropic/v1',
    model: 'MiniMax-M2.5-highspeed',
    apiKey: 'sk-cp-xMc4JxzLEnINyOaGqVmUJYOMmsepLgNLVFw6GbcOxl-sb3-VYzaErvW1O_Sg6y4h8jEgEgscLuQqCjH7ZvWJhFlukEXAIoRr9niEDOKqLqlCSHoCMAS9bhI'
  }
]

async function testEndpoint(config) {
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL
  })

  const startTime = Date.now()
  let firstTokenTime = null
  let totalTokens = 0

  try {
    const stream = await client.chat.completions.create({
      model: config.model,
      messages: [{ role: 'user', content: TEST_PROMPT }],
      max_tokens: 100,
      stream: true
    })

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || ''
      if (delta) {
        if (!firstTokenTime) firstTokenTime = Date.now() - startTime
        totalTokens++
      }
    }

    const totalTime = Date.now() - startTime
    const tokensPerSecond = totalTokens > 0 ? (totalTokens / (totalTime / 1000)).toFixed(2) : 0
    
    return { 
      success: true, 
      firstTokenTime, 
      totalTokens, 
      tokensPerSecond: parseFloat(tokensPerSecond),
      totalTime
    }
  } catch (error) {
    return { 
      success: false, 
      error: `${error.status || error.code}: ${error.message?.substring(0, 80)}`
    }
  }
}

async function main() {
  console.log('🔍 AstronCodingPlan & minimax OpenAI 兼容格式测试\n')
  console.log('='.repeat(60))

  // 测试 AstronCodingPlan
  console.log('\n📦 AstronCodingPlan 端点测试:')
  console.log('-'.repeat(40))
  
  for (const config of ASTRON_ENDPOINTS) {
    process.stdout.write(`  🧪 ${config.name}... `)
    const result = await testEndpoint(config)
    
    if (result.success) {
      console.log(`✅ TTFT:${result.firstTokenTime}ms | ${result.tokensPerSecond} tok/s`)
    } else {
      console.log(`❌ ${result.error}`)
    }
    await new Promise(r => setTimeout(r, 1500))
  }

  // 测试 minimax
  console.log('\n📦 minimax 端点测试:')
  console.log('-'.repeat(40))
  
  for (const config of MINIMAX_ENDPOINTS) {
    process.stdout.write(`  🧪 ${config.name}... `)
    const result = await testEndpoint(config)
    
    if (result.success) {
      console.log(`✅ TTFT:${result.firstTokenTime}ms | ${result.tokensPerSecond} tok/s`)
    } else {
      console.log(`❌ ${result.error}`)
    }
    await new Promise(r => setTimeout(r, 1500))
  }

  console.log('\n' + '='.repeat(60))
}

main().catch(console.error)