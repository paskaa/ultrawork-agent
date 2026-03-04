/**
 * Dispatcher - 调度器核心
 * 负责任务分配和执行协调
 */

const IntentGate = require('./intent-gate');
const ModelRouter = require('./model-router');
const TaskQueue = require('./task-queue');
const TerminalUI = require('./terminal-ui');

const Dispatcher = {
  config: null,

  /**
   * 初始化调度器
   * @param {object} config - 配置对象
   */
  init(config) {
    this.config = config;
    TaskQueue.init(config);
  },

  /**
   * 处理用户请求
   * @param {string} request - 用户请求
   * @param {object} context - 上下文
   * @returns {object} - 执行结果
   */
  async process(request, context = {}) {
    // 初始化终端 UI
    TerminalUI.init();
    TerminalUI.setTask(request);

    // 注册将领
    const agents = this.config?.agents || {};
    Object.entries(agents).forEach(([id, agent]) => {
      TerminalUI.registerAgent(id, agent.name, agent.alias);
    });

    console.log(`\n🏰 [诸葛亮] 收到军令: ${request}`);

    // 1. 意图分析
    TerminalUI.agentStart('zhugeliang', '意图分析');
    const intent = IntentGate.analyze(request, context);
    console.log(`\n📊 [诸葛亮] 兵法分析: ${intent.category.name}`);
    TerminalUI.agentProgress('zhugeliang', 50, `兵法: ${intent.category.name}`);
    TerminalUI.agentComplete('zhugeliang');
    TerminalUI.setProgress(20);

    // 2. 检查是否需要澄清
    if (intent.confidence < this.config.intentGate.clarificationThreshold) {
      if (this.config.intentGate.askForClarification) {
        TerminalUI.destroy();
        return {
          status: 'clarification_needed',
          questions: intent.questions,
          intent: intent
        };
      }
    }

    // 3. 选择模型
    const model = ModelRouter.select(intent.category.name, this.config);
    console.log(`\n🎯 [诸葛亮] 选将出征，模型: ${model}`);
    TerminalUI.setProgress(30);

    // 4. 分配任务给专家
    const assignments = this._assignAgents(intent, context);
    console.log(`\n⚔️  [诸葛亮] 调兵遣将: ${assignments.map(a => agents[a.agent]?.name || a.agent).join(', ')}`);
    TerminalUI.setProgress(40);

    // 5. 执行任务
    const results = await this._execute(assignments, model);

    // 6. 汇总结果
    TerminalUI.setProgress(100);
    const finalResult = this._aggregateResults(results, intent);

    // 销毁 UI
    setTimeout(() => TerminalUI.destroy(), 1000);

    return finalResult;
  },

  /**
   * 分配 Agent
   */
  _assignAgents(intent, context) {
    const assignments = [];
    const category = intent.category.name;

    // 根据类别分配主要执行者
    switch (category) {
      case 'visual-engineering':
        assignments.push({
          agent: 'zhaoyun',
          task: '攻城拔寨 - 前端实现'
        });
        assignments.push({
          agent: 'simayi',
          task: '探查现有组件和模式'
        });
        break;

      case 'deep':
        assignments.push({
          agent: 'zhaoyun',
          task: '深入敌阵 - 深度开发'
        });
        assignments.push({
          agent: 'simayi',
          task: '探索代码库'
        });
        break;

      case 'quick':
        assignments.push({
          agent: 'zhangfei',
          task: '速战速决 - 快速修复'
        });
        break;

      case 'ultrabrain':
        assignments.push({
          agent: 'zhouyu',
          task: '运筹帷幄 - 战略规划'
        });
        break;

      case 'review':
        assignments.push({
          agent: 'guanyu',
          task: '质量把关 - 代码审查'
        });
        break;

      default:
        assignments.push({
          agent: 'zhaoyun',
          task: '执行任务'
        });
    }

    return assignments;
  },

  /**
   * 执行任务
   */
  async _execute(assignments, model) {
    const results = [];
    const maxConcurrent = this.config.parallelExecution.maxConcurrentAgents;
    const total = assignments.length;
    let completed = 0;

    // 按优先级分组
    const prioritized = this._groupByPriority(assignments);

    for (const [priority, tasks] of Object.entries(prioritized)) {
      // 同优先级任务并行执行
      const batch = tasks.slice(0, maxConcurrent);
      const batchResults = await Promise.all(
        batch.map(async task => {
          const result = await this._executeAgent(task, model);
          completed++;
          TerminalUI.setProgress(40 + Math.round(completed / total * 50));
          return result;
        })
      );
      results.push(...batchResults);
    }

    return results;
  },

  /**
   * 执行单个 Agent
   */
  async _executeAgent(assignment, model) {
    const agents = this.config?.agents || {};
    const agentConfig = agents[assignment.agent];

    if (agentConfig) {
      TerminalUI.agentStart(assignment.agent, assignment.task);

      // 模拟执行进度
      for (let i = 0; i <= 80; i += 20) {
        await this._delay(100);
        TerminalUI.agentProgress(assignment.agent, i);
      }

      TerminalUI.agentComplete(assignment.agent);

      return {
        agent: assignment.agent,
        name: agentConfig.name,
        alias: agentConfig.alias,
        task: assignment.task,
        model: model,
        status: 'completed',
        result: `${agentConfig.name} 完成了任务: ${assignment.task}`,
        timestamp: new Date().toISOString()
      };
    }

    return {
      agent: assignment.agent,
      task: assignment.task,
      model: model,
      status: 'completed',
      result: `Agent ${assignment.agent} 完成了任务: ${assignment.task}`,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 延迟
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * 按优先级分组
   */
  _groupByPriority(assignments) {
    return assignments.reduce((groups, assignment, index) => {
      const priority = index === 0 ? 1 : 2;
      if (!groups[priority]) {
        groups[priority] = [];
      }
      groups[priority].push(assignment);
      return groups;
    }, {});
  },

  /**
   * 汇总结果
   */
  _aggregateResults(results, intent) {
    return {
      status: 'completed',
      intent: intent.interpretedIntent,
      category: intent.category.name,
      model: results[0]?.model || 'glm-5',
      agentResults: results,
      summary: this._generateSummary(results),
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 生成摘要
   */
  _generateSummary(results) {
    const successful = results.filter(r => r.status === 'completed').length;
    return `${results.length} 位将领出征，${successful} 位凯旋`;
  }
};

module.exports = Dispatcher;