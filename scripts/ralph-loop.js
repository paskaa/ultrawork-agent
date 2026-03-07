/**
 * Ralph Loop - 循环执行
 * 任务未完成时自动继续执行
 */

const Dispatcher = require('./dispatcher');

const RalphLoop = {
  config: null,
  state: {
    iterations: 0,
    completion: 0,
    history: []
  },

  /**
   * 初始化
   */
  init(config) {
    this.config = config.ralphLoop || {
      maxIterations: 10,
      completionThreshold: 100,
      checkInterval: 5000
    };
    this.reset();
  },

  /**
   * 重置状态
   */
  reset() {
    this.state = {
      iterations: 0,
      completion: 0,
      history: []
    };
  },

  /**
   * 执行循环
   * @param {string} request - 用户请求
   * @param {object} context - 上下文
   * @returns {object} - 最终结果
   */
  async execute(request, context = {}) {
    console.log('[Ralph Loop] 开始循环执行');
    this.reset();

    let result = null;

    while (this.state.completion < this.config.completionThreshold &&
           this.state.iterations < this.config.maxIterations) {

      this.state.iterations++;
      console.log(`[Ralph Loop] 第 ${this.state.iterations} 次迭代`);

      // 执行任务
      result = await Dispatcher.process(request, {
        ...context,
        iteration: this.state.iterations,
        previousResults: this.state.history
      });

      // 记录历史
      this.state.history.push({
        iteration: this.state.iterations,
        result: result,
        timestamp: new Date().toISOString()
      });

      // 计算完成度
      this.state.completion = this._calculateCompletion(result);
      console.log(`[Ralph Loop] 完成度: ${this.state.completion}%`);

      // 检查是否需要继续
      if (this.state.completion >= this.config.completionThreshold) {
        console.log('[Ralph Loop] 任务已完成');
        break;
      }

      // 生成下一步任务
      const remainingTasks = this._identifyRemainingTasks(result);
      if (remainingTasks.length === 0) {
        console.log('[Ralph Loop] 没有更多任务，结束循环');
        break;
      }

      // 等待后继续
      await this._wait(this.config.checkInterval);
    }

    return this._generateFinalReport(result);
  },

  /**
   * 计算完成度
   */
  _calculateCompletion(result) {
    if (!result) return 0;

    // 基于结果状态计算
    if (result.status === 'completed') {
      // 检查是否有未完成的事项
      const pendingTasks = this._extractPendingTasks(result);
      if (pendingTasks.length === 0) {
        return 100;
      }
      return Math.max(50, 100 - pendingTasks.length * 10);
    }

    if (result.status === 'clarification_needed') {
      return 10; // 需要用户输入
    }

    if (result.status === 'error') {
      return 0;
    }

    return 50; // 默认
  },

  /**
   * 提取待办任务
   */
  _extractPendingTasks(result) {
    const pending = [];

    // 检查结果中的待办事项
    if (result.agentResults) {
      for (const agentResult of result.agentResults) {
        if (agentResult.pendingItems) {
          pending.push(...agentResult.pendingItems);
        }
      }
    }

    return pending;
  },

  /**
   * 识别剩余任务
   */
  _identifyRemainingTasks(result) {
    const remaining = [];

    // 分析结果，识别未完成的部分
    if (result && result.agentResults) {
      for (const agentResult of result.agentResults) {
        if (agentResult.status !== 'completed') {
          remaining.push({
            agent: agentResult.agent,
            task: agentResult.task
          });
        }
      }
    }

    return remaining;
  },

  /**
   * 等待
   */
  _wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * 生成最终报告
   */
  _generateFinalReport(result) {
    return {
      status: this.state.completion >= this.config.completionThreshold ? 'completed' : 'partial',
      completion: this.state.completion,
      iterations: this.state.iterations,
      finalResult: result,
      history: this.state.history,
      summary: this._generateSummary()
    };
  },

  /**
   * 生成摘要
   */
  _generateSummary() {
    const completed = this.state.completion >= this.config.completionThreshold;
    return {
      message: completed
        ? `任务完成！共经历 ${this.state.iterations} 次迭代`
        : `任务部分完成（${this.state.completion}%），已达到最大迭代次数`,
      iterations: this.state.iterations,
      completion: this.state.completion
    };
  },

  /**
   * 获取状态
   */
  getState() {
    return { ...this.state };
  }
};

module.exports = RalphLoop;