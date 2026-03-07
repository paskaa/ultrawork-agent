/**
 * ModelRouter - 模型路由
 * 根据任务类别选择最优模型
 */

const fs = require('fs');
const path = require('path');

const ModelRouter = {
  modelsConfig: null,
  defaultModel: 'glm-5',

  /**
   * 初始化
   * @param {object} modelsConfig - 模型配置
   */
  init(modelsConfig) {
    this.modelsConfig = modelsConfig;
    this.defaultModel = modelsConfig?.defaultModel || 'glm-5';
  },

  /**
   * 选择模型
   * @param {string} category - 任务类别
   * @param {object} config - 配置对象
   * @returns {string} - 选择的模型名称
   */
  select(category, config) {
    // 如果没有配置，使用默认模型
    if (!this.modelsConfig) {
      console.log('[ModelRouter] 未配置模型，使用默认:', this.defaultModel);
      return this.defaultModel;
    }

    // 获取类别映射
    const categoryMapping = this.modelsConfig.categoryMapping?.[category];
    if (!categoryMapping) {
      console.log('[ModelRouter] 未找到类别映射，使用默认:', this.defaultModel);
      return this.defaultModel;
    }

    // 尝试使用首选模型
    const primaryModel = categoryMapping.primary;
    if (this._isModelAvailable(primaryModel)) {
      console.log(`[ModelRouter] 选择首选模型: ${primaryModel}`);
      return primaryModel;
    }

    // 首选不可用，尝试备选
    const fallbackModels = categoryMapping.fallback || [];
    for (const fallback of fallbackModels) {
      if (this._isModelAvailable(fallback)) {
        console.log(`[ModelRouter] 首选不可用，使用备选: ${fallback}`);
        return fallback;
      }
    }

    // 都不可用，使用默认
    console.log(`[ModelRouter] 所有模型不可用，使用默认: ${this.defaultModel}`);
    return this.defaultModel;
  },

  /**
   * 检查模型是否可用
   * @param {string} modelName - 模型名称
   * @returns {boolean}
   */
  _isModelAvailable(modelName) {
    const modelConfig = this.modelsConfig?.models?.[modelName];
    if (!modelConfig) {
      return false;
    }

    // 检查配置中的 available 字段
    if (modelConfig.available === false) {
      return false;
    }

    // 如果需要 API Key，检查环境变量
    if (modelConfig.apiKeyEnv) {
      const apiKey = process.env[modelConfig.apiKeyEnv];
      if (!apiKey) {
        return false;
      }
    }

    return true;
  },

  /**
   * 获取模型信息
   * @param {string} modelName - 模型名称
   * @returns {object|null}
   */
  getModelInfo(modelName) {
    return this.modelsConfig?.models?.[modelName] || null;
  },

  /**
   * 获取所有可用模型
   * @returns {array}
   */
  getAvailableModels() {
    const available = [];
    for (const [name, config] of Object.entries(this.modelsConfig?.models || {})) {
      if (this._isModelAvailable(name)) {
        available.push({
          name,
          displayName: config.displayName,
          strengths: config.strengths,
          cost: config.cost,
          speed: config.speed
        });
      }
    }
    return available;
  },

  /**
   * 根据能力选择模型
   * @param {string} capability - 所需能力
   * @returns {string} - 模型名称
   */
  selectByCapability(capability) {
    let bestModel = this.defaultModel;
    let bestScore = 0;

    for (const [name, config] of Object.entries(this.modelsConfig?.models || {})) {
      if (!this._isModelAvailable(name)) continue;

      const strengthMatch = config.strengths?.includes(capability) ? 2 : 0;
      const weaknessMatch = config.weaknesses?.includes(capability) ? -1 : 0;
      const score = strengthMatch + weaknessMatch;

      if (score > bestScore) {
        bestScore = score;
        bestModel = name;
      }
    }

    return bestModel;
  },

  /**
   * 估算成本
   * @param {string} modelName - 模型名称
   * @param {number} tokens - 预估 token 数
   * @returns {object} - 成本估算
   */
  estimateCost(modelName, tokens) {
    const modelInfo = this.getModelInfo(modelName);
    if (!modelInfo) {
      return { available: false };
    }

    // 简单的成本估算（实际价格需要从配置获取）
    const costPerToken = {
      low: 0.000001,
      medium: 0.000005,
      high: 0.00002
    };

    const rate = costPerToken[modelInfo.cost] || costPerToken.medium;
    const estimatedCost = tokens * rate;

    return {
      available: true,
      model: modelName,
      tokens: tokens,
      estimatedCost: estimatedCost.toFixed(6),
      costLevel: modelInfo.cost
    };
  },

  /**
   * 推荐模型
   * @param {object} requirements - 需求对象
   * @returns {object} - 推荐结果
   */
  recommend(requirements) {
    const { category, priority, maxCost, preferSpeed } = requirements;

    const availableModels = this.getAvailableModels();

    // 过滤成本
    let candidates = availableModels;
    if (maxCost) {
      const costOrder = ['low', 'medium', 'high'];
      const maxCostIndex = costOrder.indexOf(maxCost);
      candidates = candidates.filter(m => costOrder.indexOf(m.cost) <= maxCostIndex);
    }

    // 优先速度
    if (preferSpeed) {
      const speedOrder = ['fast', 'medium', 'slow'];
      candidates.sort((a, b) => speedOrder.indexOf(a.speed) - speedOrder.indexOf(b.speed));
    }

    // 根据类别选择
    const categoryModel = this.select(category, this.modelsConfig);
    const recommended = candidates.find(m => m.name === categoryModel) || candidates[0];

    return {
      recommended: recommended?.name || this.defaultModel,
      reason: this._getRecommendationReason(recommended, requirements),
      alternatives: candidates.filter(m => m.name !== recommended?.name).slice(0, 2)
    };
  },

  /**
   * 获取推荐原因
   */
  _getRecommendationReason(model, requirements) {
    if (!model) {
      return '使用默认模型';
    }

    const reasons = [];
    if (model.strengths?.includes(requirements.category)) {
      reasons.push(`擅长${requirements.category}任务`);
    }
    if (model.speed === 'fast' && requirements.preferSpeed) {
      reasons.push('响应速度快');
    }
    if (model.cost === 'low') {
      reasons.push('成本低');
    }

    return reasons.length > 0 ? reasons.join('，') : '综合最优选择';
  }
};

module.exports = ModelRouter;