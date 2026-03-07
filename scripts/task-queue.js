/**
 * TaskQueue - 任务队列
 * 管理任务队列和状态
 */

const fs = require('fs');
const path = require('path');

const TaskQueue = {
  config: null,
  queue: [],
  completed: [],
  failed: [],

  /**
   * 初始化
   */
  init(config) {
    this.config = config;
    this.queue = [];
    this.completed = [];
    this.failed = [];
  },

  /**
   * 添加任务
   * @param {object} task - 任务对象
   * @returns {string} - 任务 ID
   */
  add(task) {
    const taskId = this._generateId();
    const taskItem = {
      id: taskId,
      ...task,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.queue.push(taskItem);
    this._persist();
    return taskId;
  },

  /**
   * 批量添加任务
   * @param {array} tasks - 任务数组
   * @returns {array} - 任务 ID 数组
   */
  addBatch(tasks) {
    return tasks.map(task => this.add(task));
  },

  /**
   * 获取下一个待处理任务
   * @returns {object|null} - 任务对象或 null
   */
  getNext() {
    const task = this.queue.find(t => t.status === 'pending');
    if (task) {
      task.status = 'in_progress';
      task.startedAt = new Date().toISOString();
      this._persist();
    }
    return task || null;
  },

  /**
   * 获取所有待处理任务
   * @returns {array} - 任务数组
   */
  getPending() {
    return this.queue.filter(t => t.status === 'pending');
  },

  /**
   * 标记任务完成
   * @param {string} taskId - 任务 ID
   * @param {object} result - 执行结果
   */
  complete(taskId, result = {}) {
    const index = this.queue.findIndex(t => t.id === taskId);
    if (index !== -1) {
      const task = this.queue.splice(index, 1)[0];
      task.status = 'completed';
      task.result = result;
      task.completedAt = new Date().toISOString();
      task.updatedAt = new Date().toISOString();
      this.completed.push(task);
      this._persist();
    }
  },

  /**
   * 标记任务失败
   * @param {string} taskId - 任务 ID
   * @param {string} error - 错误信息
   */
  fail(taskId, error) {
    const index = this.queue.findIndex(t => t.id === taskId);
    if (index !== -1) {
      const task = this.queue.splice(index, 1)[0];
      task.status = 'failed';
      task.error = error;
      task.failedAt = new Date().toISOString();
      task.updatedAt = new Date().toISOString();
      this.failed.push(task);
      this._persist();
    }
  },

  /**
   * 重试失败的任务
   * @param {string} taskId - 任务 ID
   */
  retry(taskId) {
    const index = this.failed.findIndex(t => t.id === taskId);
    if (index !== -1) {
      const task = this.failed.splice(index, 1)[0];
      task.status = 'pending';
      task.retryCount = (task.retryCount || 0) + 1;
      task.updatedAt = new Date().toISOString();
      delete task.error;
      delete task.failedAt;
      this.queue.push(task);
      this._persist();
    }
  },

  /**
   * 取消任务
   * @param {string} taskId - 任务 ID
   */
  cancel(taskId) {
    const index = this.queue.findIndex(t => t.id === taskId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      this._persist();
    }
  },

  /**
   * 获取队列状态
   * @returns {object} - 状态统计
   */
  getStatus() {
    return {
      pending: this.queue.filter(t => t.status === 'pending').length,
      inProgress: this.queue.filter(t => t.status === 'in_progress').length,
      completed: this.completed.length,
      failed: this.failed.length,
      total: this.queue.length + this.completed.length + this.failed.length
    };
  },

  /**
   * 清空队列
   */
  clear() {
    this.queue = [];
    this.completed = [];
    this.failed = [];
    this._persist();
  },

  /**
   * 生成任务 ID
   */
  _generateId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * 持久化到文件
   */
  _persist() {
    if (!this.config?.logging?.enabled) return;

    try {
      const logDir = path.dirname(this.config.logging.file);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const data = {
        queue: this.queue,
        completed: this.completed,
        failed: this.failed,
        updatedAt: new Date().toISOString()
      };

      fs.writeFileSync(
        this.config.logging.file.replace('.log', '-queue.json'),
        JSON.stringify(data, null, 2)
      );
    } catch (e) {
      console.error('[TaskQueue] 持久化失败:', e.message);
    }
  },

  /**
   * 从文件恢复
   */
  restore() {
    if (!this.config?.logging?.enabled) return;

    try {
      const filePath = this.config.logging.file.replace('.log', '-queue.json');
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        this.queue = data.queue || [];
        this.completed = data.completed || [];
        this.failed = data.failed || [];
        console.log('[TaskQueue] 恢复完成:', this.getStatus());
      }
    } catch (e) {
      console.error('[TaskQueue] 恢复失败:', e.message);
    }
  }
};

module.exports = TaskQueue;