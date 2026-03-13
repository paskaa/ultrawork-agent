/**
 * bailian 端点调试测试
 */

const OpenAI = require('openai')

const API_KEY = 'sk-sp-29b98baad96a41b4acb371e0600309a9'

// 尝试不同的端点配置
const ENDPOINTS = [
  {
    name: 'DashScope OpenAI 兼容',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-plus'
  },
  {
    name: 'DashScope OpenAI 兼容 (qwen2.5)',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen2.5-72b-instruct'
  },
  {
    name: 'Coding Plan Anthropic',
    baseURL: 'https://coding.dashscope.aliyuncs.com/apps/anthropic/v1',
    model: 'qwen3.5-plus'
  },
  {
    name: 'Coding Plan OpenAI',
    baseURL: 'https://coding.dashscope.aliyuncs.com/apps/v1',
    model: 'qwen3.5-plus'
  },
  {
    name: 'Coding Plan 根路径',
    baseURL: 'https://coding.dashscope.aliyuncs.com/v1',
    model: 'qwen3.5-plus'
  },
  {
    name: 'DashScope 标准 v1',
    baseURL: 'https://dashscope.aliyuncs.com/api/v1',
    model: 'qwen-plus'
  },
  {
    name: 'DashScope 标准 v2',
    baseURL: 'https://dashscope.aliyuncs.com/api/v2',
    model: 'qwen-plus'
  }
]

async function testEndpoint(config) {
  const client = new OpenAI({
    apiKey: API_KEY,
    baseURL: config.baseURL
  })

  try {
    const response = await client.chat.completions.create({
      model: config.model,
      messages: [{ role: 'user', content: 'Hi' }],
      max_tokens: 10
    })
    
    return { 
      success: true, 
      content: response.choices[0]?.message?.content?.substring(0, 50)
    }
  } catch (error) {
    return { 
      success: false, 
      error: `${error.status || error.code}: ${error.message?.substring(0, 80)}` 
    }
  }
}

async function main() {
  console.log('🔍 bailian 端点测试\n')
  console.log('API Key:', API_KEY.substring(0, 10) + '...')
  console.log('='.repeat(60))

  for (const config of ENDPOINTS) {
    process.stdout.write(`\n🧪 ${config.name}...`)
    console.log(`\n   URL: ${config.baseURL}`)
    console.log(`   Model: ${config.model}`)
    
    const result = await testEndpoint(config)
    
    if (result.success) {
      console.log(`   ✅ 成功! 响应: ${result.content}`)
    } else {
      console.log(`   ❌ 失败: ${result.error}`)
    }
    
    await new Promise(r => setTimeout(r, 1000))
  }
  
  console.log('\n' + '='.repeat(60))
}

main().catch(console.error)