/**
 * UltraWork - 入口文件
 * 多智能体调度系统主入口
 */

const fs = require('fs');
const path = require('path');

// 导入环境检测器
const EnvDetector = require('./env-detector');

// 自动检测环境并加载配置
let config = {};
let modelsConfig = {};
let detectedPlatform = null;

function loadConfiguration() {
  // 首先尝试环境检测
  const detection = EnvDetector.detectEnvironment();

  if (detection.platform) {
    detectedPlatform = detection.platform;

    // 尝试加载平台特定配置
    const platformConfigPath = path.join(__dirname, '..', detection.platform.configPath);
    const platformModelsPath = path.join(__dirname, '..', detection.platform.modelsPath);

    try {
      if (fs.existsSync(platformConfigPath)) {
        config = JSON.parse(fs.readFileSync(platformConfigPath, 'utf-8'));
        console.log(`[UltraWork] 已加载 ${detection.platform.name} 配置`);
      }
    } catch (e) {
      console.warn(`[UltraWork] 加载平台配置失败: ${e.message}`);
    }

    try {
      if (fs.existsSync(platformModelsPath)) {
        modelsConfig = JSON.parse(fs.readFileSync(platformModelsPath, 'utf-8'));
      }
    } catch (e) {
      console.warn(`[UltraWork] 加载平台模型配置失败: ${e.message}`);
    }
  }

  // 回退到默认配置
  const configPath = path.join(__dirname, '..', 'config.json');
  const modelsPath = path.join(__dirname, '..', 'models.json');

  try {
    if (Object.keys(config).length === 0 && fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
    if (Object.keys(modelsConfig).length === 0 && fs.existsSync(modelsPath)) {
      modelsConfig = JSON.parse(fs.readFileSync(modelsPath, 'utf-8'));
    }
  } catch (e) {
    console.error('[UltraWork] 配置加载失败:', e.message);
  }
}

// 初始化加载配置
loadConfiguration();

// 导入组件
const IntentGate = require('./intent-gate');
const Dispatcher = require('./dispatcher');
const RalphLoop = require('./ralph-loop');
const TaskQueue = require('./task-queue');
const ModelRouter = require('./model-router');
const PlainStatusBar = require('./plain-status-bar');
const StatusReporter = require('./status-reporter');

// 初始化
ModelRouter.init(modelsConfig);
Dispatcher.init(config);
RalphLoop.init(config);
TaskQueue.init(config);
StatusReporter.init();

/**
 * UltraWork 主对象
 */
const UltraWork = {
  config,
  modelsConfig,
  detectedPlatform,

  /**
   * 获取当前平台信息
   */
  getPlatform() {
    return detectedPlatform;
  },

  /**
   * 检测环境
   */
  detectEnvironment() {
    return EnvDetector.detectEnvironment();
  },

  /**
   * 执行任务
   */
  async execute(request, options = {}) {
    const { loop = false } = options;

    // 初始化状态栏
    PlainStatusBar
      .setTask(request)
      .setProgress(0)
      .setDetail('平台', detectedPlatform?.name || 'Default')
      .addAgent('诸葛亮', '孔明', 'Qwen3.5-Plus', 'IDLE')
      .addAgent('赵云', '子龙', 'Qwen-Coder-Qoder-1.0', 'IDLE')
      .addAgent('周瑜', '公瑾', 'GLM-5', 'IDLE')
      .addAgent('司马懿', '仲达', 'Qwen3.5-Plus', 'IDLE')
      .addAgent('关羽', '云长', 'Qwen-Coder-Qoder-1.0', 'IDLE')
      .addAgent('张飞', '翼德', 'MiniMax-M2.5', 'IDLE')
      .print();

    // 初始化状态报告器
    StatusReporter.setTask(request);

    let result;

    if (loop) {
      result = await RalphLoop.execute(request, options.context);
    } else {
      result = await Dispatcher.process(request, options.context);
    }

    // 标记完成
    StatusReporter.complete(result.summary || '任务完成');
    PlainStatusBar.setProgress(100).addLog('任务完成').print();

    return result;
  },

  /**
   * 分析意图
   */
  analyzeIntent(request) {
    return IntentGate.analyze(request);
  },

  /**
   * 选择模型
   */
  selectModel(category) {
    return ModelRouter.select(category, config);
  },

  /**
   * 获取可用模型
   */
  getAvailableModels() {
    return ModelRouter.getAvailableModels();
  },

  /**
   * 获取队列状态
   */
  getQueueStatus() {
    return TaskQueue.getStatus();
  },

  /**
   * 获取 Agent 定义
   */
  getAgentDefinition(agentName) {
    const agentPath = path.join(__dirname, '..', 'agents', `${agentName}.md`);
    try {
      return fs.readFileSync(agentPath, 'utf-8');
    } catch (e) {
      return null;
    }
  },

  /**
   * 获取类别定义
   */
  getCategoryDefinition(categoryName) {
    const categoryPath = path.join(__dirname, '..', 'categories', `${categoryName}.md`);
    try {
      return fs.readFileSync(categoryPath, 'utf-8');
    } catch (e) {
      return null;
    }
  },

  /**
   * 检查是否触发 UltraWork
   */
  shouldTrigger(input) {
    const triggers = config.triggers || {};
    const keywords = triggers.keywords || [];
    const patterns = triggers.patterns || [];

    for (const keyword of keywords) {
      if (input.toLowerCase().startsWith(keyword.toLowerCase())) {
        return true;
      }
    }

    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(input)) {
        return true;
      }
    }

    return false;
  },

  /**
   * 解析触发命令
   */
  parseTrigger(input) {
    const triggers = config.triggers || {};
    // 按长度降序排序，确保长命令先匹配（ulw-loop 在 ulw 之前）
    const commands = (triggers.commands || []).sort((a, b) => b.length - a.length);

    // 检查是否是命令
    for (const cmd of commands) {
      if (input.startsWith(cmd)) {
        const args = input.slice(cmd.length).trim();
        const isLoop = cmd.includes('loop');
        return {
          isCommand: true,
          command: cmd,
          args: args,
          loop: isLoop
        };
      }
    }

    // 检查关键词触发
    const keywords = triggers.keywords || [];
    for (const keyword of keywords) {
      if (input.toLowerCase().startsWith(keyword.toLowerCase())) {
        const args = input.slice(keyword.length).trim();
        return {
          isCommand: false,
          keyword: keyword,
          args: args,
          loop: false
        };
      }
    }

    return {
      isCommand: false,
      args: input,
      loop: false
    };
  }
};

// 导出
module.exports = UltraWork;

// CLI 入口
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
UltraWork 多智能体调度系统

用法:
  node index.js <command|请求内容>

命令:
  detect              检测当前运行环境
  platform            显示当前平台信息

示例:
  node index.js detect
  node index.js "实现用户登录功能"
  node index.js "ultrawork 修复登录 bug"
  node index.js "ulw-loop 重构订单模块"
`);
    process.exit(0);
  }

  // 处理特殊命令
  if (args[0] === 'detect') {
    const detection = EnvDetector.detectEnvironment();
    console.log('\n🔍 环境检测结果:');
    console.log('═'.repeat(50));
    console.log(`操作系统: ${detection.environment.os}`);
    console.log(`架构: ${detection.environment.arch}`);
    console.log(`Node 版本: ${detection.environment.nodeVersion}`);
    console.log('\n检测到的平台:');
    detection.detected.forEach((p, i) => {
      const marker = i === 0 ? '✓ [已选择]' : '  ';
      console.log(`${marker} ${p.name}`);
    });
    if (detection.platform) {
      console.log(`\n配置文件: ${detection.platform.configPath}`);
      console.log(`模型配置: ${detection.platform.modelsPath}`);
    }
    process.exit(0);
  }

  if (args[0] === 'platform') {
    console.log('\n📦 当前平台信息:');
    console.log('═'.repeat(50));
    if (detectedPlatform) {
      console.log(`平台: ${detectedPlatform.name}`);
      console.log(`配置: ${detectedPlatform.configPath}`);
      console.log(`模型: ${detectedPlatform.modelsPath}`);
    } else {
      console.log('未检测到特定平台，使用默认配置');
    }
    console.log(`\n默认模型: ${modelsConfig.defaultModel || '未设置'}`);
    process.exit(0);
  }

  const input = args.join(' ');
  const parsed = UltraWork.parseTrigger(input);

  if (parsed.args) {
    UltraWork.execute(parsed.args, { loop: parsed.loop })
      .then(result => {
        console.log('\n结果:');
        console.log(JSON.stringify(result, null, 2));
      })
      .catch(error => {
        console.error('\n执行失败:', error.message);
        process.exit(1);
      });
  }
}