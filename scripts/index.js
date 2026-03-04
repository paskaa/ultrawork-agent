/**
 * UltraWork - 入口文件
 * 多智能体调度系统主入口
 */

const fs = require('fs');
const path = require('path');

// 加载配置
const configPath = path.join(__dirname, '..', 'config.json');
const modelsPath = path.join(__dirname, '..', 'models.json');

let config = {};
let modelsConfig = {};

try {
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
  if (fs.existsSync(modelsPath)) {
    modelsConfig = JSON.parse(fs.readFileSync(modelsPath, 'utf-8'));
  }
} catch (e) {
  console.error('[UltraWork] 配置加载失败:', e.message);
}

// 导入组件
const IntentGate = require('./intent-gate');
const Dispatcher = require('./dispatcher');
const RalphLoop = require('./ralph-loop');
const TaskQueue = require('./task-queue');
const ModelRouter = require('./model-router');
const TmuxManager = require('./tmux-manager');
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

  /**
   * 执行任务
   */
  async execute(request, options = {}) {
    const { loop = false, noTmux = false } = options;

    console.log('═'.repeat(50));
    console.log('  UltraWork 多智能体调度系统');
    console.log('═'.repeat(50));
    console.log(`请求: ${request}`);
    console.log(`模式: ${loop ? '循环执行' : '单次执行'}`);
    console.log('─'.repeat(50));

    // 初始化状态报告器
    StatusReporter.setTask(request);

    // 启动 tmux 状态面板
    if (!noTmux) {
      TmuxManager.startStatusPanel(request).then(started => {
        if (started) {
          console.log('[UltraWork] 状态面板已启动');
        }
      });
    }

    let result;

    if (loop) {
      result = await RalphLoop.execute(request, options.context);
    } else {
      result = await Dispatcher.process(request, options.context);
    }

    // 标记完成
    StatusReporter.complete(result.summary || '任务完成');

    console.log('─'.repeat(50));
    console.log('执行完成');
    console.log('═'.repeat(50));

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
  const args = process.argv.slice(2).join(' ');

  if (!args) {
    console.log(`
UltraWork 多智能体调度系统

用法:
  node index.js <请求内容>

示例:
  node index.js "实现用户登录功能"
  node index.js "ultrawork 修复登录 bug"
  node index.js "ulw-loop 重构订单模块"
`);
    process.exit(0);
  }

  const parsed = UltraWork.parseTrigger(args);

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