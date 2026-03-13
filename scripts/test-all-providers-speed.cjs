/**
 * 全量供应商速度测试 - 测试所有模型
 * 测试: bailian, AstronCodingPlan, minimax
 */

const OpenAI = require('openai')

const TEST_PROMPT = `用一句话介绍你自己。`

// bailian 使用 OpenAI 兼容格式
const BAILIAN_MODELS = {
  'bailian/qwen3.5-plus': {
    name: 'Qwen3.5 Plus',
    apiKey: 'sk-sp-29b98baad96a41b4acb371e0600309a9',
    baseURL: 'https://coding.dashscope.aliyuncs.com/v1',
    model: 'qwen3.5-plus'
  },
  'bailian/qwen3-coder-plus': {
    name: 'Qwen3 Coder Plus',
    apiKey: 'sk-sp-29b98baad96a41b4acb371e0600309a9',
    baseURL: 'https://coding.dashscope.aliyuncs.com/v1',
    model: 'qwen3-coder-plus'
  },
  'bailian/qwen3-coder-next': {
    name: 'Qwen3 Coder Next',
    apiKey: 'sk-sp-29b98baad96a41b4acb371e0600309a9',
    baseURL: 'https://coding.dashscope.aliyuncs.com/v1',
    model: 'qwen3-coder-next'
  },
  'bailian/glm-5': {
    name: 'GLM-5',
    apiKey: 'sk-sp-29b98baad96a41b4acb371e0600309a9',
    baseURL: 'https://coding.dashscope.aliyuncs.com/v1',
    model: 'glm-5'
  },
  'bailian/glm-4.7': {
    name: 'GLM-4.7',
    apiKey: 'sk-sp-29b98baad96a41b4acb371e0600309a9',
    baseURL: 'https://coding.dashscope.aliyuncs.com/v1',
    model: 'glm-4.7'
  },
  'bailian/MiniMax-M2.5': {
    name: 'MiniMax-M2.5 (bailian)',
    apiKey: 'sk-sp-29b98baad96a41b4acb371e0600309a9',
    baseURL: 'https://coding.dashscope.aliyuncs.com/v1',
    model: 'MiniMax-M2.5'
  },
  'bailian/kimi-k2.5': {
    name: 'Kimi-K2.5',
    apiKey: 'sk-sp-29b98baad96a41b4acb371e0600309a9',
    baseURL: 'https://coding.dashscope.aliyuncs.com/v1',
    model: 'kimi-k2.5'
  }
}

// AstronCodingPlan
const ASTRON_MODELS = {
  'AstronCodingPlan/astron-code-latest': {
    name: 'Astron Coding Plan',
    apiKey: '3f372558e346d0e0b4ba9a22631b126d:ZWVhYWIyMTBiMTU4ZGNjZTMxZjFmNGVl',
    baseURL: 'https://maas-coding-api.cn-huabei-1.xf-yun.com/v2',
    model: 'astron-code-latest'
  }
}

// minimax
const MINIMAX_MODELS = {
  'minimax/MiniMax-M2.5-highspeed': {
    name: 'MiniMax-M2.5-highspeed',
    apiKey: 'sk-cp-xMc4JxzLEnINyOaGqVmUJYOMmsepLgNLVFw6GbcOxl-sb3-VYzaErvW1O_Sg6y4h8jEgEgscLuQqCjH7ZvWJhFlukEXAIoRr9niEDOKqLqlCSHoCMAS9bhI',
    baseURL: 'https://api.minimaxi.com/v1',
    model: 'MiniMax-M2.5-highspeed'
  },
  'minimax/MiniMax-M2.5': {
    name: 'MiniMax-M2.5 (标准)',
    apiKey: 'sk-cp-xMc4JxzLEnINyOaGqVmUJYOMmsepLgNLVFw6GbcOxl-sb3-VYzaErvW1O_Sg6y4h8jEgEgscLuQqCjH7ZvWJhFlukEXAIoRr9niEDOKqLqlCSHoCMAS9bhI',
    baseURL: 'https://api.minimaxi.com/v1',
    model: 'MiniMax-M2.5'
  }
}

async function testProvider(key, config) {
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
      error: error.message.substring(0, 100),
      code: error.code || error.status
    }
  }
}

async function testAllModels() {
  console.log('🎯 全量供应商速度对比测试\n')
  console.log('='.repeat(60))
  
  const allModels = {
    'bailian': BAILIAN_MODELS,
    'AstronCodingPlan': ASTRON_MODELS,
    'minimax': MINIMAX_MODELS
  }
  
  const results = {}
  
  for (const [provider, models] of Object.entries(allModels)) {
    console.log(`\n📦 ${provider}:`)
    console.log('-'.repeat(40))
    
    results[provider] = {}
    
    for (const [key, config] of Object.entries(models)) {
      process.stdout.write(`  🧪 ${config.name}... `)
      
      const result = await testProvider(key, config)
      results[provider][key] = result
      
      if (result.success) {
        console.log(`✅ TTFT:${result.firstTokenTime}ms | ${result.tokensPerSecond} tok/s | ${result.totalTime}ms`)
      } else {
        console.log(`❌ ${result.error}`)
      }
      
      // 等待一下避免请求过快
      await new Promise(r => setTimeout(r, 2000))
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 全部结果排名 (按速度)')
  console.log('='.repeat(60))
  
  // 收集所有成功的结果
  const allResults = []
  for (const [provider, models] of Object.entries(results)) {
    for (const [key, r] of Object.entries(models)) {
      if (r.success) {
        allResults.push({
          provider,
          name: provider === 'bailian' ? key.split('/')[1] : key.split('/')[1],
          fullKey: key,
          tokensPerSecond: r.tokensPerSecond,
          ttft: r.firstTokenTime,
          totalTime: r.totalTime
        })
      }
    }
  }
  
  // 按速度排序
  allResults.sort((a, b) => b.tokensPerSecond - a.tokensPerSecond)
  
  allResults.forEach((r, i) => {
    console.log(`${i+1}. [${r.provider}] ${r.name}: ${r.tokensPerSecond} tok/s (TTFT:${r.ttft}ms | 总耗时:${r.totalTime}ms)`)
  })
  
  console.log('='.repeat(60))
  
  // 统计
  const successCount = allResults.length
  const failCount = Object.values(results).reduce((sum, p) => 
    sum + Object.values(p).filter(m => !m.success).length, 0)
  
  console.log(`\n📈 统计: 成功 ${successCount} 个, 失败 ${failCount} 个`)
  
  return results
}

testAllModels().catch(console.error)
