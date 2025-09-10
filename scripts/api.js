/* ==========================================
   API接口管理 - API.js
   处理与第三方AI服务的通信
   ========================================== */

/**
 * AI服务提供商配置
 */
const AI_PROVIDERS = {
  openai: {
    name: 'OpenAI GPT',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }),
    formatRequest: (messages, model, options = {}) => ({
      model: model || 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: options.maxTokens || 2000,
      temperature: options.temperature || 0.7,
      stream: options.stream || false
    }),
    parseResponse: (response) => {
      if (response.choices && response.choices[0]) {
        return {
          content: response.choices[0].message.content,
          role: response.choices[0].message.role,
          usage: response.usage
        };
      }
      throw new Error('无效的响应格式');
    }
  },

  deepseek: {
    name: 'DeepSeek',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    models: ['deepseek-chat', 'deepseek-coder'],
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }),
    formatRequest: (messages, model, options = {}) => ({
      model: model || 'deepseek-chat',
      messages: messages,
      max_tokens: options.maxTokens || 2000,
      temperature: options.temperature || 0.7,
      stream: options.stream || false
    }),
    parseResponse: (response) => {
      if (response.choices && response.choices[0]) {
        return {
          content: response.choices[0].message.content,
          role: response.choices[0].message.role,
          usage: response.usage
        };
      }
      throw new Error('无效的响应格式');
    }
  },

  claude: {
    name: 'Anthropic Claude',
    endpoint: 'https://api.anthropic.com/v1/messages',
    models: ['claude-3-sonnet-20240229', 'claude-3-opus-20240229'],
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    }),
    formatRequest: (messages, model, options = {}) => ({
      model: model || 'claude-3-sonnet-20240229',
      messages: messages,
      max_tokens: options.maxTokens || 2000,
      temperature: options.temperature || 0.7
    }),
    parseResponse: (response) => {
      if (response.content && response.content[0]) {
        return {
          content: response.content[0].text,
          role: response.role,
          usage: response.usage
        };
      }
      throw new Error('无效的响应格式');
    }
  },

  free: {
    name: '🎁 免费体验（由DeepSeek提供支持）',
    endpoint: '/api/chat', // 将替换为实际的Vercel部署地址
    models: ['deepseek-chat'],
    headers: () => ({
      'Content-Type': 'application/json',
      // 免费服务不需要Authorization头，由代理服务处理
    }),
    formatRequest: (messages, model, options = {}) => ({
      model: model || 'deepseek-chat',
      messages: messages,
      max_tokens: options.maxTokens || 2000,
      temperature: options.temperature || 0.7
    }),
    parseResponse: (response) => {
      if (response.choices && response.choices[0]) {
        return {
          content: response.choices[0].message.content,
          role: response.choices[0].message.role,
          usage: response.usage,
          remainingCount: response.usage?.remainingCount,
          totalFreeCount: response.usage?.totalFreeCount,
          dailyUsed: response.usage?.dailyUsed
        };
      }
      throw new Error('无效的响应格式');
    }
  },

  custom: {
    name: '自定义API',
    endpoint: '',
    models: ['custom-model'],
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }),
    formatRequest: (messages, model, options = {}) => ({
      model: model || 'custom-model',
      messages: messages,
      max_tokens: options.maxTokens || 2000,
      temperature: options.temperature || 0.7
    }),
    parseResponse: (response) => {
      // 自定义解析逻辑，用户可以根据需要修改
      if (response.choices && response.choices[0]) {
        return {
          content: response.choices[0].message.content,
          role: response.choices[0].message.role,
          usage: response.usage
        };
      }
      throw new Error('无效的响应格式');
    }
  }
};

/**
 * API管理类
 */
class APIManager {
  constructor() {
    // 默认使用免费服务，让用户无需配置即可体验
    this.currentProvider = Storage.get('apiProvider', 'free');
    this.apiKey = Storage.get('apiKey', '');
    this.model = Storage.get('apiModel', '');
    this.requestTimeout = 30000; // 30秒超时
    
    // 免费服务使用统计
    this.freeUsage = {
      remainingCount: null,
      totalFreeCount: null,
      dailyUsed: null,
      lastUpdate: null,
    };
  }

  /**
   * 设置API提供商
   * @param {string} provider - 提供商名称
   */
  setProvider(provider) {
    if (AI_PROVIDERS[provider]) {
      this.currentProvider = provider;
      Storage.set('apiProvider', provider);
    } else {
      throw new Error(`不支持的AI提供商: ${provider}`);
    }
  }

  /**
   * 设置API密钥
   * @param {string} key - API密钥
   */
  setApiKey(key) {
    this.apiKey = key;
    Storage.set('apiKey', key);
  }

  /**
   * 设置模型
   * @param {string} model - 模型名称
   */
  setModel(model) {
    this.model = model;
    Storage.set('apiModel', model);
  }

  /**
   * 获取当前提供商配置
   * @returns {Object}
   */
  getCurrentProvider() {
    return AI_PROVIDERS[this.currentProvider];
  }

  /**
   * 验证API配置
   * @returns {boolean}
   */
  validateConfig() {
    // 免费服务不需要API密钥验证
    if (this.currentProvider === 'free') {
      return true;
    }
    
    if (!this.apiKey) {
      throw new Error('请先配置API密钥或使用免费体验服务');
    }
    
    const provider = this.getCurrentProvider();
    if (!provider) {
      throw new Error('无效的AI提供商配置');
    }

    if (this.currentProvider === 'custom' && !provider.endpoint) {
      throw new Error('请配置自定义API端点');
    }

    return true;
  }

  /**
   * 发送聊天请求
   * @param {Array} messages - 消息数组
   * @param {Object} options - 请求选项
   * @returns {Promise<Object>}
   */
  async sendChatRequest(messages, options = {}) {
    try {
      this.validateConfig();
      
      const provider = this.getCurrentProvider();
      const requestBody = provider.formatRequest(messages, this.model, options);
      
      // 创建请求配置
      const requestConfig = {
        method: 'POST',
        headers: provider.headers(this.apiKey),
        body: JSON.stringify(requestBody)
      };

      // 添加超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);
      requestConfig.signal = controller.signal;

      // 发送请求
      const response = await fetch(provider.endpoint, requestConfig);
      clearTimeout(timeoutId);

      // 检查响应状态
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // 处理免费服务的特殊错误
        if (this.currentProvider === 'free' && response.status === 429) {
          this.handleFreeServiceLimitError(errorData);
        }
        
        throw new Error(this.handleApiError(response.status, errorData));
      }

      // 解析响应
      const data = await response.json();
      const result = provider.parseResponse(data);
      
      // 更新免费服务使用统计
      if (this.currentProvider === 'free' && result.remainingCount !== undefined) {
        this.updateFreeUsageStats(result);
      }
      
      return result;

    } catch (error) {
      console.error('API请求失败:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('请求超时，请检查网络连接');
      }
      
      throw error;
    }
  }

  /**
   * 处理API错误
   * @param {number} status - HTTP状态码
   * @param {Object} errorData - 错误数据
   * @returns {string}
   */
  handleApiError(status, errorData) {
    const errorMessages = {
      400: '请求参数错误',
      401: 'API密钥无效或已过期',
      403: '访问被拒绝，请检查API权限',
      404: 'API端点不存在',
      429: '请求过于频繁，请稍后再试',
      500: 'AI服务内部错误',
      502: 'AI服务暂时不可用',
      503: 'AI服务正在维护中'
    };

    let message = errorMessages[status] || `请求失败 (${status})`;
    
    // 尝试从错误数据中获取更详细的信息
    if (errorData.error && errorData.error.message) {
      message += `: ${errorData.error.message}`;
    } else if (errorData.message) {
      message += `: ${errorData.message}`;
    }

    return message;
  }

  /**
   * 流式聊天请求（用于实时响应）
   * @param {Array} messages - 消息数组
   * @param {Function} onChunk - 接收数据块的回调函数
   * @param {Object} options - 请求选项
   * @returns {Promise}
   */
  async sendStreamChatRequest(messages, onChunk, options = {}) {
    try {
      this.validateConfig();
      
      const provider = this.getCurrentProvider();
      const requestBody = provider.formatRequest(messages, this.model, {
        ...options,
        stream: true
      });

      const response = await fetch(provider.endpoint, {
        method: 'POST',
        headers: provider.headers(this.apiKey),
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(this.handleApiError(response.status, errorData));
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
              const parsed = JSON.parse(data);
              const content = this.extractStreamContent(parsed);
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              // 忽略解析错误的行
            }
          }
        }
      }

    } catch (error) {
      console.error('流式请求失败:', error);
      throw error;
    }
  }

  /**
   * 从流式响应中提取内容
   * @param {Object} data - 响应数据
   * @returns {string|null}
   */
  extractStreamContent(data) {
    if (data.choices && data.choices[0] && data.choices[0].delta) {
      return data.choices[0].delta.content || null;
    }
    return null;
  }

  /**
   * 测试API连接
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      const testMessage = [
        { role: 'user', content: '你好，请回复"连接成功"' }
      ];
      
      const response = await this.sendChatRequest(testMessage, {
        maxTokens: 50,
        temperature: 0
      });
      
      return response.content.includes('连接成功') || response.content.includes('你好');
    } catch (error) {
      console.error('API连接测试失败:', error);
      return false;
    }
  }

  /**
   * 获取可用模型列表
   * @returns {Array}
   */
  getAvailableModels() {
    const provider = this.getCurrentProvider();
    return provider ? provider.models : [];
  }

  /**
   * 处理免费服务限制错误
   * @param {Object} errorData - 错误数据
   */
  handleFreeServiceLimitError(errorData) {
    const { error, message, remainingCount, resetTime } = errorData;
    
    if (error === 'DAILY_LIMIT_EXCEEDED') {
      // 显示升级提示
      this.showUpgradePrompt('daily', errorData);
    } else if (error === 'RATE_LIMIT_EXCEEDED') {
      // 显示频率限制提示
      this.showRateLimitPrompt(resetTime);
    }
  }

  /**
   * 更新免费服务使用统计
   * @param {Object} result - API响应结果
   */
  updateFreeUsageStats(result) {
    this.freeUsage = {
      remainingCount: result.remainingCount,
      totalFreeCount: result.totalFreeCount,
      dailyUsed: result.dailyUsed,
      lastUpdate: Date.now(),
    };
    
    // 触发UI更新事件
    document.dispatchEvent(new CustomEvent('freeUsageUpdate', {
      detail: this.freeUsage
    }));
    
    // 更新UI显示
    this.updateFreeUsageUI();
  }

  /**
   * 更新免费使用次数UI显示
   */
  updateFreeUsageUI() {
    const usageDisplay = DOM.get('#freeUsageDisplay');
    if (usageDisplay && this.freeUsage.remainingCount !== null) {
      const { remainingCount, totalFreeCount } = this.freeUsage;
      
      // 移除之前的警告类
      DOM.removeClass(usageDisplay, 'warning');
      DOM.removeClass(usageDisplay, 'hidden');
      
      usageDisplay.innerHTML = `
        <div class="free-usage-info">
          <div class="usage-icon">🎁</div>
          <div class="usage-details">
            <span class="usage-text">今日免费次数</span>
            <span class="usage-count ${remainingCount <= 5 ? 'low' : ''}">${remainingCount}/${totalFreeCount}</span>
          </div>
        </div>
      `;
      
      // 次数不足时显示警告样式
      if (remainingCount <= 5) {
        DOM.addClass(usageDisplay, 'warning');
      }
    }
  }

  /**
   * 显示升级提示
   * @param {string} type - 提示类型 (daily/hourly)
   * @param {Object} errorData - 错误数据
   */
  showUpgradePrompt(type, errorData = {}) {
    // 移除现有模态框
    this.hideUpgradePrompt();
    
    const modal = this.createUpgradeModal(type, errorData);
    document.body.appendChild(modal);
    
    // 添加显示动画
    setTimeout(() => {
      DOM.addClass(modal, 'show');
    }, 10);
  }

  /**
   * 显示频率限制提示
   * @param {string} resetTime - 重置时间
   */
  showRateLimitPrompt(resetTime) {
    const resetDate = new Date(resetTime);
    const now = new Date();
    const minutesLeft = Math.ceil((resetDate - now) / (1000 * 60));
    
    Notification.warning(`请求过于频繁，请${minutesLeft}分钟后再试，或配置您的API密钥获得更好的体验`);
  }

  /**
   * 创建升级提示模态框
   * @param {string} type - 提示类型
   * @param {Object} errorData - 错误数据
   * @returns {Element}
   */
  createUpgradeModal(type, errorData) {
    const modal = DOM.create('div', {
      className: 'upgrade-modal-overlay',
      id: 'upgradeModal'
    });

    const content = DOM.create('div', {
      className: 'upgrade-modal-content'
    });

    const title = type === 'daily' ? '今日免费次数已用完' : '请求过于频繁';
    const message = type === 'daily' 
      ? '您今天的免费对话次数已经用完了。配置您的API密钥后可以继续无限制使用。'
      : '请求太频繁了，请稍后再试，或配置您的API密钥获得更好的体验。';

    content.innerHTML = `
      <div class="upgrade-modal-header">
        <div class="upgrade-modal-icon">
          ${type === 'daily' ? '🎁' : '⏰'}
        </div>
        <h3 class="upgrade-modal-title">${title}</h3>
        <button class="upgrade-modal-close" aria-label="关闭">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      <div class="upgrade-modal-body">
        <p class="upgrade-modal-message">${message}</p>
        <div class="upgrade-options">
          <div class="upgrade-option primary">
            <div class="upgrade-option-icon">🔑</div>
            <div class="upgrade-option-content">
              <h4>配置API密钥</h4>
              <p>使用您自己的API密钥，享受无限制对话</p>
            </div>
            <button class="upgrade-btn primary" data-action="configure">去配置</button>
          </div>
          <div class="upgrade-option secondary">
            <div class="upgrade-option-icon">⏰</div>
            <div class="upgrade-option-content">
              <h4>明天再试</h4>
              <p>每天都有${errorData.totalFreeCount || 20}次免费对话机会</p>
            </div>
            <button class="upgrade-btn secondary" data-action="close">知道了</button>
          </div>
        </div>
      </div>
    `;

    modal.appendChild(content);

    // 绑定事件
    const closeBtn = modal.querySelector('.upgrade-modal-close');
    const configBtn = modal.querySelector('[data-action="configure"]');
    const laterBtn = modal.querySelector('[data-action="close"]');

    DOM.on(closeBtn, 'click', () => this.hideUpgradePrompt());
    DOM.on(configBtn, 'click', () => {
      this.hideUpgradePrompt();
      this.openSettingsPanel();
    });
    DOM.on(laterBtn, 'click', () => this.hideUpgradePrompt());

    // 点击背景关闭
    DOM.on(modal, 'click', (e) => {
      if (e.target === modal) {
        this.hideUpgradePrompt();
      }
    });

    // ESC键关闭
    DOM.on(document, 'keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideUpgradePrompt();
      }
    });

    return modal;
  }

  /**
   * 隐藏升级提示
   */
  hideUpgradePrompt() {
    const modal = DOM.get('#upgradeModal');
    if (modal) {
      DOM.removeClass(modal, 'show');
      setTimeout(() => {
        if (modal.parentNode) {
          modal.parentNode.removeChild(modal);
        }
      }, 300);
    }
  }

  /**
   * 打开设置面板
   */
  openSettingsPanel() {
    // 触发应用的设置面板打开事件
    if (window.app && typeof window.app.openSettingsPanel === 'function') {
      window.app.openSettingsPanel();
    } else {
      // 备用方案：直接操作DOM
      const settingsPanel = DOM.get('#settingsPanel');
      if (settingsPanel) {
        DOM.addClass(settingsPanel, 'open');
      }
    }
  }

  /**
   * 估算token使用量（简单估算）
   * @param {string} text - 文本内容
   * @returns {number}
   */
  estimateTokens(text) {
    // 简单的token估算，实际使用中可能需要更精确的计算
    return Math.ceil(text.length / 3);
  }

  /**
   * 格式化消息历史
   * @param {Array} messages - 原始消息数组
   * @returns {Array}
   */
  formatMessageHistory(messages) {
    return messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
  }
}

// 创建全局API管理实例
const apiManager = new APIManager();

// 导出API管理器
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { APIManager, apiManager, AI_PROVIDERS };
}
