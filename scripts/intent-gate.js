/**
 * IntentGate - 意图门
 * 在执行任务前分析用户的真实意图
 */

const IntentGate = {
  /**
   * 分析用户意图
   * @param {string} request - 用户请求
   * @param {object} context - 上下文信息
   * @returns {object} - 意图分析结果
   */
  analyze(request, context = {}) {
    const result = {
      originalRequest: request,
      interpretedIntent: '',
      category: null,
      confidence: 0,
      ambiguities: [],
      questions: [],
      executionPlan: null
    };

    // 1. 解析字面请求
    result.interpretedIntent = this._parseLiteral(request);

    // 2. 识别任务类别
    result.category = this._identifyCategory(request);

    // 3. 检测歧义
    result.ambiguities = this._detectAmbiguities(request);

    // 4. 生成澄清问题
    if (result.ambiguities.length > 0) {
      result.questions = this._generateQuestions(result.ambiguities);
    }

    // 5. 计算置信度
    result.confidence = this._calculateConfidence(result);

    // 6. 生成执行计划
    if (result.confidence >= 0.7) {
      result.executionPlan = this._generatePlan(result);
    }

    return result;
  },

  /**
   * 解析字面意思
   */
  _parseLiteral(request) {
    // 提取关键动词和名词
    const verbs = ['实现', '修复', '修改', '添加', '删除', '更新', '重构', '设计', '开发', '优化'];
    const foundVerb = verbs.find(v => request.includes(v)) || '处理';

    return `用户希望${foundVerb}相关功能`;
  },

  /**
   * 识别任务类别
   */
  _identifyCategory(request) {
    const categories = {
      'visual-engineering': { keywords: ['UI', '界面', '样式', 'CSS', 'Vue', '组件', '前端', '页面', '交互', '布局', 'element'], weight: 1 },
      'deep': { keywords: ['重构', '实现', '开发', '复杂', '功能', '模块', '系统', '集成'], weight: 1 },
      'quick': { keywords: ['修复', 'bug', '修改', '更新', '改', 'typo', '错', '问题', 'fix'], weight: 1 },
      'ultrabrain': { keywords: ['设计', '方案', '决策', '架构', '规划', '思考', '分析', '策略', '评估'], weight: 2 } // 更高权重
    };

    let maxScore = 0;
    let bestCategory = 'deep'; // 默认

    // 特殊规则：设计 + 架构 = ultrabrain
    if (request.includes('设计') && request.includes('架构')) {
      return {
        name: 'ultrabrain',
        score: 10,
        description: '复杂逻辑、架构决策',
        isSpecial: true
      };
    }

    for (const [category, config] of Object.entries(categories)) {
      let score = 0;
      for (const keyword of config.keywords) {
        if (request.toLowerCase().includes(keyword.toLowerCase())) {
          score += config.weight;
        }
      }
      if (score > maxScore) {
        maxScore = score;
        bestCategory = category;
      }
    }

    return {
      name: bestCategory,
      score: maxScore,
      description: this._getCategoryDescription(bestCategory)
    };
  },

  /**
   * 获取类别描述
   */
  _getCategoryDescription(category) {
    const descriptions = {
      'visual-engineering': '前端、UI/UX、设计相关工作',
      'deep': '深度自主调研与执行',
      'quick': '单文件修改、小修复',
      'ultrabrain': '复杂逻辑、架构决策'
    };
    return descriptions[category] || '';
  },

  /**
   * 检测歧义
   */
  _detectAmbiguities(request) {
    const ambiguities = [];

    // 检测模糊词汇
    const vagueWords = ['优化', '改进', '完善', '调整'];
    for (const word of vagueWords) {
      if (request.includes(word) && !this._hasSpecificTarget(request, word)) {
        ambiguities.push({
          type: 'vague',
          word: word,
          message: `"${word}"是一个模糊词汇，需要更具体的说明`
        });
      }
    }

    // 检测缺失信息
    if (request.includes('实现') && !this._hasSpecificFeature(request)) {
      ambiguities.push({
        type: 'missing',
        word: '功能细节',
        message: '缺少具体的功能描述'
      });
    }

    return ambiguities;
  },

  /**
   * 检查是否有具体目标
   */
  _hasSpecificTarget(request, word) {
    // 检查是否有具体的优化目标
    const targets = ['性能', '速度', '内存', '体验', '加载'];
    return targets.some(t => request.includes(t));
  },

  /**
   * 检查是否有具体功能描述
   */
  _hasSpecificFeature(request) {
    // 检查是否有具体的功能词汇
    const features = ['登录', '注册', '查询', '导出', '导入', '删除', '编辑', '新增'];
    return features.some(f => request.includes(f));
  },

  /**
   * 生成澄清问题
   */
  _generateQuestions(ambiguities) {
    return ambiguities.map(a => {
      switch (a.type) {
        case 'vague':
          return `您希望${a.word}的具体方面是什么？`;
        case 'missing':
          return `能否详细说明需要实现哪些具体功能？`;
        default:
          return `请提供更多关于"${a.word}"的信息`;
      }
    });
  },

  /**
   * 计算置信度
   */
  _calculateConfidence(result) {
    let confidence = 0.5; // 基础置信度

    // 类别匹配度影响
    confidence += result.category.score * 0.1;

    // 歧义数量影响
    confidence -= result.ambiguities.length * 0.15;

    // 限制范围
    return Math.max(0, Math.min(1, confidence));
  },

  /**
   * 生成执行计划
   */
  _generatePlan(result) {
    return {
      category: result.category.name,
      steps: this._getExecutionSteps(result.category.name),
      estimatedComplexity: this._estimateComplexity(result)
    };
  },

  /**
   * 获取执行步骤
   */
  _getExecutionSteps(category) {
    const steps = {
      'visual-engineering': [
        '分析 UI/UX 需求',
        '搜索现有组件和模式',
        '实现页面/组件',
        '样式调整和优化',
        '功能验证'
      ],
      'deep': [
        '探索现有代码结构',
        '分析需求和约束',
        '设计实现方案',
        '实现核心功能',
        '集成测试'
      ],
      'quick': [
        '定位问题',
        '分析根因',
        '实施修复',
        '验证结果'
      ],
      'ultrabrain': [
        '需求澄清和访谈',
        '现状分析',
        '方案设计',
        '详细规划',
        '风险评估'
      ]
    };
    return steps[category] || steps['deep'];
  },

  /**
   * 估算复杂度
   */
  _estimateComplexity(result) {
    const wordCount = result.originalRequest.length;
    if (wordCount < 20) return 'low';
    if (wordCount < 50) return 'medium';
    return 'high';
  }
};

module.exports = IntentGate;