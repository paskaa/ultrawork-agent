const http = require('http');

// 测试实时日志推送
async function testRealTimeLogs() {
  console.log('🧪 测试实时日志功能\n');
  
  // 1. 开始任务
  console.log('1️⃣ 发送任务开始请求...');
  await sendRequest('POST', '/api/task/start', { title: '测试实时日志任务' });
  await sleep(500);
  
  // 2. 诸葛亮开始分析
  console.log('2️⃣ 诸葛亮开始分析...');
  await sendRequest('POST', '/api/agents/zhugeliang/status', { 
    status: 'running', 
    task: '意图分析',
    progress: 50 
  });
  await sendRequest('POST', '/api/agents/zhugeliang/log', { 
    message: '🎯 接收任务: 测试实时日志任务', 
    type: 'action' 
  });
  await sleep(500);
  
  // 3. 赵云开始执行
  console.log('3️⃣ 赵云开始执行...');
  await sendRequest('POST', '/api/agents/zhaoyun/status', { 
    status: 'running', 
    task: '前端开发',
    progress: 30 
  });
  await sendRequest('POST', '/api/agents/zhaoyun/log', { 
    message: '⚔️ 开始编写代码...', 
    type: 'action' 
  });
  await sleep(500);
  
  // 4. 司马懿搜索代码
  console.log('4️⃣ 司马懿搜索代码...');
  await sendRequest('POST', '/api/agents/simayi/status', { 
    status: 'running', 
    task: '代码搜索',
    progress: 60 
  });
  await sendRequest('POST', '/api/agents/simayi/log', { 
    message: '🔍 找到3个相关文件', 
    type: 'action' 
  });
  await sendRequest('POST', '/api/agents/simayi/log', { 
    message: '💭 分析代码结构...', 
    type: 'thinking' 
  });
  await sleep(500);
  
  // 5. 更新进度
  console.log('5️⃣ 更新任务进度...');
  await sendRequest('POST', '/api/task/progress', { progress: 50 });
  await sleep(500);
  
  // 6. 关羽审查
  console.log('6️⃣ 关羽进行代码审查...');
  await sendRequest('POST', '/api/agents/guanyu/status', { 
    status: 'running', 
    task: '代码审查',
    progress: 80 
  });
  await sendRequest('POST', '/api/agents/guanyu/log', { 
    message: '🛡️ 代码审查通过', 
    type: 'action' 
  });
  await sleep(500);
  
  // 7. 完成任务
  console.log('7️⃣ 完成任务...');
  await sendRequest('POST', '/api/task/complete', { status: 'completed' });
  
  console.log('\n✅ 测试完成！');
  console.log('🌐 请刷新浏览器面板查看实时更新');
}

function sendRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3459,
      path,
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`  ✓ ${method} ${path}`);
        resolve(body);
      });
    });
    
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

testRealTimeLogs().catch(console.error);
