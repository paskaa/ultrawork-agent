/**
 * 供应商速度测试 - 包含所有模型
 */

const { OpenAI } = require('openai')

const TEST_PROMPT = `用一句话介绍你自己。`

const PROVIDERS = {
  minimax_hs: {
    name: 'MiniMax-M2.5-highspeed',
    apiKey: 'sk-cp-xMc4JxzLEnINyOaGqVmUJYOMmsepLgNLVFw6GbcOxl-sb3-VYzaErvW1O_Sg6y4h8jEgEgscLuQqCjH7ZvWJhFlukEXAIoRr9niEDOKqLqlCSHoCMAS9bhI',
    baseURL: 'https://api.minimaxi.com/v1',
    model: 'MiniMax-M2.5-highspeed'
  },
  minimax_standard: {
    name: 'MiniMax-M2.5 (标准版)',
    apiKey: 'sk-cp-xMc4JxzLEnINyOaGqVmUJYOMmsepLgNLVFw6GbcOxl-sb3-VYzaErvW1O_Sg6y4h8jEgEgscLuQqCjH7ZvWJhFlukEXAIoRr9niEDOKqLqlCSHoCMAS9bhI',
    baseURL: 'https://api.minimaxi.com/v1',
    model: 'MiniMax-M2.5'
  },
  astron: {
    name: '讯飞星辰 (AstronCodingPlan)',
    apiKey: '3f372558e346d0e0b4ba9a22631b126d:ZWVhYWIyMTBiMTU4ZGNjZTMxZjFmNGVl',
    baseURL: 'https://maas-coding-api.cn-huabei-1.xf-yun.com/v2',
    model: 'astron-code-latest'
  }
}

async function testProvider(config) {
  const client = new OpenAI({ apiKey: config.apiKey, baseURL: config.baseURL })
  const startTime = Date.now()
  let firstTokenTime = null, totalTokens = 0

  try {
    const stream = await client.chat.completions.create({
      model: config.model,
      messages: [{ role: 'user', content: TEST_PROMPT }],
      max_tokens: 200,
      temperature: 0.7,
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
    const tokensPerSecond = (totalTokens / (totalTime / 1000)).toFixed(2)
    return { success: true, firstTokenTime, totalTokens, tokensPerSecond: parseFloat(tokensPerSecond) }
  } catch (error) {
    return { success: false, error: error.message.substring(0, 50) }
  }
}

async function main() {
  console.log('🎯 供应商速度对比测试\n')

  const results = {}
  for (const [key, config] of Object.entries(PROVIDERS)) {
    process.stdout.write(`🧪 ${config.name}... `)
    const result = await testProvider(config)
    results[key] = result
    if (result.success) {
      console.log(`✅ TTFT:${result.firstTokenTime}ms | ${result.tokensPerSecond} tok/s`)
    } else {
      console.log(`❌ ${result.error}`)
    }
    await new Promise(r => setTimeout(r, 1500))
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 结果排名')
  console.log('='.repeat(50))
  
  const working = Object.entries(results).filter(([_, r]) => r.success)
    .sort((a, b) => b[1].tokensPerSecond - a[1].tokensPerSecond)
  
  working.forEach(([key, r], i) => {
    console.log(`${i+1}. ${PROVIDERS[key].name}: ${r.tokensPerSecond} tok/s (TTFT:${r.firstTokenTime}ms)`)
  })
  console.log('='.repeat(50))
}

main().catch(console.error)
