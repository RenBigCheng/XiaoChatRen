/* ==========================================
   聊天功能 - Chat.js
   处理聊天界面和消息管理
   ========================================== */

/**
 * 聊天管理类
 */
class ChatManager {
  constructor() {
    this.messages = [];
    this.currentChatId = null;
    this.chatHistory = Storage.get('chatHistory', {});
    this.currentRole = Storage.get('currentRole', 'assistant');
    this.isProcessing = false;
    
    // 角色配置
    this.roles = {
      assistant: {
        name: '智能助手',
        systemPrompt: '你是一个友善、专业的AI助手，能够帮助用户解答问题、处理任务。请用简洁明了的语言回答用户的问题。',
        avatar: '🤖',
        color: '#007AFF'
      },
      teacher: {
        name: 'AI教师',
        systemPrompt: '你是一位经验丰富的教师，擅长解释复杂概念，引导学生思考。请用教育者的角度，耐心详细地回答问题，并在适当时候提出启发性问题。',
        avatar: '👨‍🏫',
        color: '#34C759'
      },
      doctor: {
        name: 'AI医生',
        systemPrompt: '你是一位专业的医疗顾问，能够提供健康建议和医疗知识。但请注意，你的建议仅供参考，不能替代专业医疗诊断。',
        avatar: '👨‍⚕️',
        color: '#FF3B30'
      },
      leader: {
        name: 'AI领导',
        systemPrompt: '你是一位有经验的管理者和领导者，能够提供战略建议、团队管理和决策支持。请用领导者的视角分析问题并提供建议。',
        avatar: '👔',
        color: '#AF52DE'
      }
    };

    this.initializeChat();
  }

  /**
   * 初始化聊天
   */
  initializeChat() {
    this.loadChatHistory();
    this.setupEventListeners();
    this.showWelcomeScreen();
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 发送按钮
    const sendBtn = DOM.get('#sendBtn');
    if (sendBtn) {
      DOM.on(sendBtn, 'click', () => this.handleSendMessage());
    }

    // 输入框事件
    const messageInput = DOM.get('#messageInput');
    if (messageInput) {
      DOM.on(messageInput, 'input', () => this.handleInputChange());
      DOM.on(messageInput, 'keydown', (e) => this.handleKeyDown(e));
    }

    // 角色下拉菜单
    this.initRoleDropdown();

    // 新对话按钮
    const newChatBtn = DOM.get('#newChatBtn');
    if (newChatBtn) {
      DOM.on(newChatBtn, 'click', () => this.startNewChat());
    }

    // 语音按钮
    const voiceBtn = DOM.get('#voiceBtn');
    if (voiceBtn) {
      DOM.on(voiceBtn, 'click', () => this.handleVoiceInput());
    }

    // 功能菜单按钮
    const functionMenuBtn = DOM.get('#functionMenuBtn');
    if (functionMenuBtn) {
      DOM.on(functionMenuBtn, 'click', (e) => {
        e.stopPropagation();
        this.toggleFunctionMenu();
      });
    }

    // 功能选项按钮
    const functionOptions = DOM.getAll('.function-option');
    functionOptions.forEach(btn => {
      DOM.on(btn, 'click', () => {
        this.handleFunctionAction(btn.dataset.action);
        this.closeFunctionMenu();
      });
    });

    // 点击外部关闭功能菜单
    DOM.on(document, 'click', (e) => {
      const functionMenu = DOM.get('#functionDropdownMenu');
      const functionMenuBtn = DOM.get('#functionMenuBtn');
      if (functionMenu && !functionMenu.contains(e.target) && !functionMenuBtn.contains(e.target)) {
        this.closeFunctionMenu();
      }
    });

    // 文件上传按钮
    const attachBtn = DOM.get('#attachBtn');
    if (attachBtn) {
      DOM.on(attachBtn, 'click', () => this.handleFileUpload());
    }

    // 拖拽上传功能
    this.setupDragAndDrop();
  }

  /**
   * 显示欢迎界面
   */
  showWelcomeScreen() {
    const welcomeScreen = DOM.get('#welcomeScreen');
    const chatMessages = DOM.get('#chatMessages');
    
    if (this.messages.length === 0) {
      if (welcomeScreen) DOM.removeClass(welcomeScreen, 'hidden');
      if (chatMessages) DOM.addClass(chatMessages, 'hidden');
      
      // 添加拖拽提示
      setTimeout(() => {
        this.createDragHint();
      }, 500);
    } else {
      if (welcomeScreen) DOM.addClass(welcomeScreen, 'hidden');
      if (chatMessages) DOM.removeClass(chatMessages, 'hidden');
      this.renderMessages();
    }
  }

  /**
   * 处理发送消息
   */
  async handleSendMessage() {
    const messageInput = DOM.get('#messageInput');
    if (!messageInput) return;

    const content = messageInput.value.trim();
    if (!content || this.isProcessing) return;

    try {
      // 添加用户消息
      this.addMessage('user', content);
      
      // 清空输入框
      messageInput.value = '';
      this.updateCharCounter();
      this.updateSendButton();

      // 隐藏欢迎界面
      this.hideWelcomeScreen();

      // 显示加载状态
      this.showTypingIndicator();

      // 准备消息历史
      const messageHistory = this.prepareMessageHistory();

      // 发送API请求
      this.isProcessing = true;
      const response = await apiManager.sendChatRequest(messageHistory);
      
      // 添加AI回复
      this.addMessage('assistant', response.content);
      
      // 自动播放语音（如果启用）
      if (voiceManager.settings.autoSpeak) {
        voiceManager.speak(response.content);
      }

      // 保存对话
      this.saveCurrentChat();

    } catch (error) {
      console.error('发送消息失败:', error);
      this.addMessage('system', `抱歉，发送消息时出现错误：${error.message}`);
      Notification.error('发送失败：' + error.message);
    } finally {
      this.hideTypingIndicator();
      this.isProcessing = false;
    }
  }

  /**
   * 处理输入变化
   */
  handleInputChange() {
    this.updateCharCounter();
    this.updateSendButton();
    this.autoResizeTextarea();
  }

  /**
   * 处理键盘事件
   * @param {KeyboardEvent} event 
   */
  handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.handleSendMessage();
    }
  }

  /**
   * 更新字符计数器
   */
  updateCharCounter() {
    const messageInput = DOM.get('#messageInput');
    const charCounter = DOM.get('#charCounter');
    
    if (messageInput && charCounter) {
      const length = messageInput.value.length;
      const maxLength = messageInput.maxLength || 2000;
      charCounter.textContent = `${length}/${maxLength}`;
      
      // 接近限制时改变颜色
      if (length > maxLength * 0.9) {
        DOM.addClass(charCounter, 'warning');
      } else {
        DOM.removeClass(charCounter, 'warning');
      }
    }
  }

  /**
   * 更新发送按钮状态
   */
  updateSendButton() {
    const messageInput = DOM.get('#messageInput');
    const sendBtn = DOM.get('#sendBtn');
    
    if (messageInput && sendBtn) {
      const hasContent = messageInput.value.trim().length > 0;
      sendBtn.disabled = !hasContent || this.isProcessing;
    }
  }

  /**
   * 自动调整输入框高度
   */
  autoResizeTextarea() {
    const messageInput = DOM.get('#messageInput');
    if (!messageInput) return;

    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
  }

  /**
   * 添加消息
   * @param {string} role - 消息角色 (user/assistant/system)
   * @param {string} content - 消息内容
   */
  addMessage(role, content) {
    const message = {
      id: StringUtils.generateId(),
      role,
      content,
      timestamp: new Date().toISOString()
    };

    this.messages.push(message);
    this.renderMessage(message);
    this.scrollToBottom();
  }

  /**
   * 渲染消息
   * @param {Object} message - 消息对象
   */
  renderMessage(message) {
    const chatMessages = DOM.get('#chatMessages');
    if (!chatMessages) return;

    const messageEl = this.createMessageElement(message);
    chatMessages.appendChild(messageEl);
  }

  /**
   * 创建消息元素
   * @param {Object} message - 消息对象
   * @returns {Element}
   */
  createMessageElement(message) {
    const messageDiv = DOM.create('div', {
      className: `message ${message.role}`,
      'data-message-id': message.id
    });

    // 头像
    const avatar = DOM.create('div', {
      className: 'message-avatar',
      innerHTML: this.getMessageAvatar(message.role)
    });

    // 内容
    const content = DOM.create('div', {
      className: 'message-content'
    });

    if (message.role === 'system') {
      content.innerHTML = `<em>${StringUtils.escapeHtml(message.content)}</em>`;
      DOM.addClass(content, 'system-message');
    } else {
      content.innerHTML = this.formatMessageContent(message.content);
    }

    // 时间
    const time = DOM.create('div', {
      className: 'message-time',
      textContent: TimeUtils.format(message.timestamp, 'HH:mm')
    });

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    messageDiv.appendChild(time);

    // 添加动画
    DOM.addClass(messageDiv, 'animate-slideInUp');

    return messageDiv;
  }

  /**
   * 获取消息头像
   * @param {string} role - 消息角色
   * @returns {string}
   */
  getMessageAvatar(role) {
    if (role === 'user') {
      return '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/></svg>';
    } else if (role === 'system') {
      return '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/></svg>';
    } else {
      const roleConfig = this.roles[this.currentRole];
      return roleConfig ? roleConfig.avatar : '🤖';
    }
  }

  /**
   * 格式化消息内容
   * @param {string} content - 原始内容
   * @returns {string}
   */
  formatMessageContent(content) {
    // 转义HTML
    let formatted = StringUtils.escapeHtml(content);
    
    // 处理换行
    formatted = formatted.replace(/\n/g, '<br>');
    
    // 处理代码块
    formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`;
    });
    
    // 处理行内代码
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // 处理粗体
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 处理斜体
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    return formatted;
  }

  /**
   * 滚动到底部
   */
  scrollToBottom() {
    const chatMessages = DOM.get('#chatMessages');
    if (chatMessages) {
      setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 100);
    }
  }

  /**
   * 隐藏欢迎界面
   */
  hideWelcomeScreen() {
    const welcomeScreen = DOM.get('#welcomeScreen');
    const chatMessages = DOM.get('#chatMessages');
    
    if (welcomeScreen) DOM.addClass(welcomeScreen, 'hidden');
    if (chatMessages) DOM.removeClass(chatMessages, 'hidden');
  }

  /**
   * 显示打字指示器
   */
  showTypingIndicator() {
    const indicator = DOM.create('div', {
      className: 'message assistant typing-indicator',
      id: 'typingIndicator'
    });

    const avatar = DOM.create('div', {
      className: 'message-avatar',
      innerHTML: this.getMessageAvatar('assistant')
    });

    const content = DOM.create('div', {
      className: 'message-content typing-dots',
      innerHTML: '<span></span><span></span><span></span>'
    });

    indicator.appendChild(avatar);
    indicator.appendChild(content);

    const chatMessages = DOM.get('#chatMessages');
    if (chatMessages) {
      chatMessages.appendChild(indicator);
      this.scrollToBottom();
    }
  }

  /**
   * 隐藏打字指示器
   */
  hideTypingIndicator() {
    const indicator = DOM.get('#typingIndicator');
    if (indicator) {
      indicator.remove();
    }
  }

  /**
   * 切换角色
   * @param {string} role - 角色名称
   */
  switchRole(role, fromSync = false) {
    if (this.roles[role] && this.currentRole !== role) {
      const oldRole = this.currentRole;
      this.currentRole = role;
      Storage.set('currentRole', role);
      
      // 更新UI
      this.updateRoleButtons();
      
      // 开始新对话
      if (!fromSync) {
        this.startNewChat();
      }
      
      // 显示通知
      if (!fromSync) {
        Notification.success(`已切换到${this.roles[role].name}模式`);
      }
      
      // 通知同步管理器（如果不是来自同步的话）
      if (!fromSync && window.roleSyncManager) {
        window.roleSyncManager.switchRole(role, 'chat');
      }
    }
  }

  /**
   * 初始化角色下拉菜单
   */
  initRoleDropdown() {
    // 如果角色同步管理器已经处理了下拉菜单，就不重复处理
    if (window.roleSyncManager) {
      console.log('✅ 角色下拉菜单由同步管理器处理，聊天管理器跳过');
      // 但是仍然需要更新当前角色显示
      this.updateRoleButtons();
      return;
    }
    
    const dropdown = DOM.get('#roleDropdown');
    const trigger = DOM.get('#roleDropdownTrigger');
    const menu = DOM.get('#roleDropdownMenu');
    const roleOptions = DOM.getAll('.role-option');
    
    if (!dropdown || !trigger || !menu) return;
    
    // 点击触发器切换菜单
    DOM.on(trigger, 'click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleRoleDropdown();
    });
    
    // 点击角色选项
    roleOptions.forEach(option => {
      DOM.on(option, 'click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const role = option.dataset.role;
        if (role && role !== this.currentRole) {
          this.switchRole(role);
        }
        this.closeRoleDropdown();
      });
    });
    
    // 键盘导航
    DOM.on(trigger, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleRoleDropdown();
      } else if (e.key === 'Escape') {
        this.closeRoleDropdown();
      }
    });
    
    // 点击外部关闭菜单
    DOM.on(document, 'click', (e) => {
      if (!dropdown.contains(e.target)) {
        this.closeRoleDropdown();
      }
    });
  }
  
  /**
   * 切换角色下拉菜单
   */
  toggleRoleDropdown() {
    const trigger = DOM.get('#roleDropdownTrigger');
    const menu = DOM.get('#roleDropdownMenu');
    
    if (!trigger || !menu) return;
    
    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
    
    if (isExpanded) {
      this.closeRoleDropdown();
    } else {
      this.openRoleDropdown();
    }
  }
  
  /**
   * 打开角色下拉菜单
   */
  openRoleDropdown() {
    const trigger = DOM.get('#roleDropdownTrigger');
    const menu = DOM.get('#roleDropdownMenu');
    
    if (!trigger || !menu) return;
    
    trigger.setAttribute('aria-expanded', 'true');
    DOM.addClass(menu, 'show');
    
    // 聚焦到当前激活的选项
    const activeOption = DOM.get('.role-option.active');
    if (activeOption) {
      activeOption.focus();
    }
  }
  
  /**
   * 关闭角色下拉菜单
   */
  closeRoleDropdown() {
    const trigger = DOM.get('#roleDropdownTrigger');
    const menu = DOM.get('#roleDropdownMenu');
    
    if (!trigger || !menu) return;
    
    trigger.setAttribute('aria-expanded', 'false');
    DOM.removeClass(menu, 'show');
  }

  /**
   * 更新角色按钮状态
   */
  updateRoleButtons() {
    // 更新下拉菜单中的角色选项状态
    const roleOptions = DOM.getAll('.role-option');
    roleOptions.forEach(option => {
      if (option.dataset.role === this.currentRole) {
        DOM.addClass(option, 'active');
      } else {
        DOM.removeClass(option, 'active');
      }
    });
    
    // 更新触发器显示的当前角色
    this.updateRoleDropdownTrigger();
  }
  
  /**
   * 更新角色下拉触发器显示
   */
  updateRoleDropdownTrigger() {
    const currentRoleIcon = DOM.get('.role-current-icon');
    const currentRoleName = DOM.get('.role-current-name');
    
    if (!currentRoleIcon || !currentRoleName) return;
    
    const roleConfig = this.roles[this.currentRole];
    if (!roleConfig) return;
    
    // 更新图标 - 获取对应角色选项的图标
    const roleOption = DOM.get(`[data-role="${this.currentRole}"]`);
    if (roleOption) {
      const optionIcon = roleOption.querySelector('.role-option-icon svg');
      if (optionIcon) {
        currentRoleIcon.innerHTML = optionIcon.outerHTML;
      }
    }
    
    // 更新名称
    currentRoleName.textContent = roleConfig.name;
  }

  /**
   * 开始新对话
   */
  startNewChat() {
    // 保存当前对话
    if (this.messages.length > 0) {
      this.saveCurrentChat();
    }

    // 重置状态
    this.messages = [];
    this.currentChatId = StringUtils.generateId();
    
    // 清空界面
    const chatMessages = DOM.get('#chatMessages');
    if (chatMessages) {
      chatMessages.innerHTML = '';
    }

    // 显示欢迎界面
    this.showWelcomeScreen();
    
    // 更新历史列表
    this.updateChatHistoryUI();
  }

  /**
   * 处理语音输入
   */
  handleVoiceInput() {
    if (voiceManager.isRecording) {
      voiceManager.stopRecording();
    } else {
      voiceManager.startRecording();
    }
  }

  /**
   * 切换功能菜单显示状态
   */
  toggleFunctionMenu() {
    const functionMenu = DOM.get('#functionDropdownMenu');
    const functionMenuBtn = DOM.get('#functionMenuBtn');
    
    if (!functionMenu || !functionMenuBtn) return;

    const isOpen = DOM.hasClass(functionMenu, 'show');
    
    if (isOpen) {
      this.closeFunctionMenu();
    } else {
      this.openFunctionMenu();
    }
  }

  /**
   * 打开功能菜单
   */
  openFunctionMenu() {
    const functionMenu = DOM.get('#functionDropdownMenu');
    const functionMenuBtn = DOM.get('#functionMenuBtn');
    
    if (!functionMenu || !functionMenuBtn) return;

    DOM.addClass(functionMenu, 'show');
    functionMenuBtn.setAttribute('aria-expanded', 'true');
    
    // 添加动画延迟，提升用户体验
    setTimeout(() => {
      const firstOption = functionMenu.querySelector('.function-option');
      if (firstOption) firstOption.focus();
    }, 100);
  }

  /**
   * 关闭功能菜单
   */
  closeFunctionMenu() {
    const functionMenu = DOM.get('#functionDropdownMenu');
    const functionMenuBtn = DOM.get('#functionMenuBtn');
    
    if (!functionMenu || !functionMenuBtn) return;

    DOM.removeClass(functionMenu, 'show');
    functionMenuBtn.setAttribute('aria-expanded', 'false');
  }

  /**
   * 处理功能操作
   * @param {string} action - 操作类型
   */
  handleFunctionAction(action) {
    const messageInput = DOM.get('#messageInput');
    if (!messageInput) return;

    const selectedText = messageInput.value.trim();
    if (!selectedText) {
      Notification.warning('请先输入要处理的文本');
      return;
    }

    let prompt = '';
    switch (action) {
      case 'translate':
        prompt = `请将以下文本翻译成英文：\n\n${selectedText}`;
        break;
      case 'polish':
        prompt = `请润色以下文本，使其更加流畅和专业：\n\n${selectedText}`;
        break;
      case 'summarize':
        prompt = `请总结以下文本的要点和关键信息：\n\n${selectedText}`;
        break;
      default:
        return;
    }

    // 显示操作反馈
    const actionNames = {
      'translate': '翻译',
      'polish': '润色', 
      'summarize': '总结'
    };
    Notification.success(`正在${actionNames[action]}文本...`);

    messageInput.value = prompt;
    this.handleInputChange();
    
    // 自动发送（可选）
    setTimeout(() => {
      this.sendMessage();
    }, 500);
  }

  /**
   * 准备消息历史
   * @returns {Array}
   */
  prepareMessageHistory() {
    const roleConfig = this.roles[this.currentRole];
    const messages = [
      {
        role: 'system',
        content: roleConfig.systemPrompt
      }
    ];

    // 添加最近的消息历史（限制数量以避免token过多）
    const recentMessages = this.messages.slice(-10);
    messages.push(...recentMessages);

    return apiManager.formatMessageHistory(messages);
  }

  /**
   * 渲染所有消息
   */
  renderMessages() {
    const chatMessages = DOM.get('#chatMessages');
    if (!chatMessages) return;

    chatMessages.innerHTML = '';
    this.messages.forEach(message => {
      this.renderMessage(message);
    });
    
    this.scrollToBottom();
  }

  /**
   * 保存当前对话
   */
  saveCurrentChat() {
    if (!this.currentChatId || this.messages.length === 0) return;

    const chat = {
      id: this.currentChatId,
      title: this.generateChatTitle(),
      messages: [...this.messages],
      role: this.currentRole,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.chatHistory[this.currentChatId] = chat;
    Storage.set('chatHistory', this.chatHistory);
    this.updateChatHistoryUI();
  }

  /**
   * 生成对话标题
   * @returns {string}
   */
  generateChatTitle() {
    const firstUserMessage = this.messages.find(m => m.role === 'user');
    if (firstUserMessage) {
      return StringUtils.truncate(firstUserMessage.content, 30);
    }
    return `${this.roles[this.currentRole].name}对话`;
  }

  /**
   * 加载对话历史
   */
  loadChatHistory() {
    const chatHistory = DOM.get('#chatHistory');
    if (!chatHistory) return;

    const chats = Object.values(this.chatHistory)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    chatHistory.innerHTML = '';
    
    chats.forEach(chat => {
      const item = this.createChatHistoryItem(chat);
      chatHistory.appendChild(item);
    });
  }

  /**
   * 创建对话历史项
   * @param {Object} chat - 对话对象
   * @returns {Element}
   */
  createChatHistoryItem(chat) {
    const item = DOM.create('div', {
      className: 'chat-history-item',
      'data-chat-id': chat.id
    });

    const icon = DOM.create('div', {
      className: 'chat-history-icon',
      innerHTML: this.roles[chat.role]?.avatar || '💬'
    });

    const content = DOM.create('div', {
      className: 'chat-history-content'
    });

    const title = DOM.create('div', {
      className: 'chat-history-title',
      textContent: chat.title
    });

    const preview = DOM.create('div', {
      className: 'chat-history-preview',
      textContent: TimeUtils.getRelativeTime(chat.updatedAt)
    });

    // 悬停操作按钮
    const actions = DOM.create('div', {
      className: 'chat-history-actions'
    });

    const deleteBtn = DOM.create('button', {
      className: 'chat-history-action-btn delete',
      'data-i18n-title': 'chat.delete',
      title: '删除对话',
      'aria-label': '删除对话',
      innerHTML: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <path d="M3 3.5C3 3.22386 3.22386 3 3.5 3H4.5V2.5C4.5 1.67157 5.17157 1 6 1H8C8.82843 1 9.5 1.67157 9.5 2.5V3H10.5C10.7761 3 11 3.22386 11 3.5C11 3.77614 10.7761 4 10.5 4H10V11.5C10 12.3284 9.32843 13 8.5 13H5.5C4.67157 13 4 12.3284 4 11.5V4H3.5C3.22386 4 3 3.77614 3 3.5ZM5.5 3H8.5V2.5C8.5 2.22386 8.27614 2 8 2H6C5.72386 2 5.5 2.22386 5.5 2.5V3ZM5 4V11.5C5 11.7761 5.22386 12 5.5 12H8.5C8.77614 12 9 11.7761 9 11.5V4H5Z"/>
          <path d="M6 5.5C6.27614 5.5 6.5 5.72386 6.5 6V10C6.5 10.2761 6.27614 10.5 6 10.5C5.72386 10.5 5.5 10.2761 5.5 10V6C5.5 5.72386 5.72386 5.5 6 5.5Z"/>
          <path d="M8 5.5C8.27614 5.5 8.5 5.72386 8.5 6V10C8.5 10.2761 8.27614 10.5 8 10.5C7.72386 10.5 7.5 10.2761 7.5 10V6C7.5 5.72386 7.72386 5.5 8 5.5Z"/>
        </svg>
      `
    });

    actions.appendChild(deleteBtn);

    content.appendChild(title);
    content.appendChild(preview);
    item.appendChild(icon);
    item.appendChild(content);
    item.appendChild(actions);

    // 点击加载对话（排除按钮区域）
    DOM.on(item, 'click', (e) => {
      if (!actions.contains(e.target)) {
        this.loadChat(chat.id);
      }
    });

    // 删除按钮事件
    DOM.on(deleteBtn, 'click', (e) => {
      e.stopPropagation();
      this.showDeleteConfirmation(chat);
    });

    // 右键菜单
    DOM.on(item, 'contextmenu', (e) => {
      e.preventDefault();
      this.showContextMenu(e, chat);
    });

    // 阻止右键菜单的默认行为
    DOM.on(item, 'selectstart', (e) => e.preventDefault());

    return item;
  }

  /**
   * 加载指定对话
   * @param {string} chatId - 对话ID
   */
  loadChat(chatId) {
    const chat = this.chatHistory[chatId];
    if (!chat) return;

    // 保存当前对话
    if (this.messages.length > 0) {
      this.saveCurrentChat();
    }

    // 加载对话
    this.currentChatId = chatId;
    this.messages = [...chat.messages];
    this.currentRole = chat.role;

    // 更新UI
    this.updateRoleButtons();
    this.hideWelcomeScreen();
    this.renderMessages();
    this.updateChatHistoryUI();
  }

  /**
   * 更新对话历史UI
   */
  updateChatHistoryUI() {
    this.loadChatHistory();
    
    // 高亮当前对话
    const items = DOM.getAll('.chat-history-item');
    items.forEach(item => {
      if (item.dataset.chatId === this.currentChatId) {
        DOM.addClass(item, 'active');
      } else {
        DOM.removeClass(item, 'active');
      }
    });
  }

  /**
   * 处理文件上传
   */
  handleFileUpload() {
    console.log('📎 文件上传按钮被点击');
    
    // 创建文件输入元素
    const fileInput = DOM.create('input', {
      type: 'file',
      multiple: true,
      accept: '.txt,.md,.doc,.docx,.pdf,.jpg,.jpeg,.png,.gif'
    });
    
    // 设置文件选择事件
    DOM.on(fileInput, 'change', (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        this.processUploadedFiles(files);
      }
    });
    
    // 触发文件选择对话框
    fileInput.click();
  }

  /**
   * 处理上传的文件
   * @param {Array} files - 文件列表
   */
  async processUploadedFiles(files) {
    console.log('📁 处理上传的文件:', files.length, '个文件');
    
    for (const file of files) {
      try {
        // 验证文件
        if (!this.validateFile(file)) {
          continue;
        }
        
        // 显示文件信息
        this.displayFileInfo(file);
        
        // 根据文件类型处理
        await this.handleFileByType(file);
        
      } catch (error) {
        console.error('处理文件失败:', file.name, error);
        Notification.error(`处理文件 ${file.name} 失败: ${error.message}`);
      }
    }
  }

  /**
   * 验证文件
   * @param {File} file - 文件对象
   * @returns {boolean}
   */
  validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'text/plain',
      'text/markdown', 
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png', 
      'image/gif'
    ];
    
    // 检查文件大小
    if (file.size > maxSize) {
      Notification.error(`文件 ${file.name} 太大，请选择小于10MB的文件`);
      return false;
    }
    
    // 检查文件类型
    if (!allowedTypes.includes(file.type) && !this.isAllowedExtension(file.name)) {
      Notification.error(`不支持的文件类型: ${file.name}`);
      return false;
    }
    
    return true;
  }

  /**
   * 检查文件扩展名
   * @param {string} fileName - 文件名
   * @returns {boolean}
   */
  isAllowedExtension(fileName) {
    const allowedExtensions = ['.txt', '.md', '.doc', '.docx', '.pdf', '.jpg', '.jpeg', '.png', '.gif'];
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    return allowedExtensions.includes(extension);
  }

  /**
   * 显示文件信息
   * @param {File} file - 文件对象
   */
  displayFileInfo(file) {
    const fileInfo = `📎 已上传文件: ${file.name} (${StringUtils.formatFileSize(file.size)})`;
    this.addMessage('system', fileInfo);
  }

  /**
   * 根据文件类型处理文件
   * @param {File} file - 文件对象
   */
  async handleFileByType(file) {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    
    if (fileType.startsWith('text/') || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      // 处理文本文件
      await this.handleTextFile(file);
    } else if (fileType.startsWith('image/')) {
      // 处理图片文件
      await this.handleImageFile(file);
    } else if (fileType === 'application/pdf') {
      // 处理PDF文件
      await this.handlePdfFile(file);
    } else {
      // 其他文件类型
      Notification.warning(`文件 ${file.name} 已上传，但暂时无法解析内容`);
    }
  }

  /**
   * 处理文本文件
   * @param {File} file - 文件对象
   */
  async handleTextFile(file) {
    try {
      const text = await this.readFileAsText(file);
      const preview = StringUtils.truncate(text, 200);
      
      const messageInput = DOM.get('#messageInput');
      if (messageInput) {
        const currentValue = messageInput.value;
        const newValue = currentValue ? 
          `${currentValue}\n\n文件内容 (${file.name}):\n${text}` : 
          `文件内容 (${file.name}):\n${text}`;
        messageInput.value = newValue;
        this.handleInputChange();
      }
      
      Notification.success(`文本文件 ${file.name} 内容已添加到输入框`);
    } catch (error) {
      throw new Error(`读取文本文件失败: ${error.message}`);
    }
  }

  /**
   * 处理图片文件
   * @param {File} file - 文件对象
   */
  async handleImageFile(file) {
    try {
      const dataUrl = await this.readFileAsDataURL(file);
      
      // 创建图片预览消息
      const imagePreview = `
        <div class="file-preview image-preview">
          <img src="${dataUrl}" alt="${file.name}" style="max-width: 200px; max-height: 200px; border-radius: 8px;">
          <p>📷 图片: ${file.name}</p>
        </div>
      `;
      
      // 添加到消息输入框
      const messageInput = DOM.get('#messageInput');
      if (messageInput) {
        const currentValue = messageInput.value;
        const newValue = currentValue ? 
          `${currentValue}\n\n[图片: ${file.name}]` : 
          `请帮我分析这张图片: ${file.name}`;
        messageInput.value = newValue;
        this.handleInputChange();
      }
      
      Notification.success(`图片 ${file.name} 已上传，可以要求AI分析图片内容`);
    } catch (error) {
      throw new Error(`处理图片文件失败: ${error.message}`);
    }
  }

  /**
   * 处理PDF文件
   * @param {File} file - 文件对象
   */
  async handlePdfFile(file) {
    // PDF处理需要额外的库，这里先提供基础实现
    Notification.warning(`PDF文件 ${file.name} 已上传，但需要额外功能来解析PDF内容`);
    
    const messageInput = DOM.get('#messageInput');
    if (messageInput) {
      const currentValue = messageInput.value;
      const newValue = currentValue ? 
        `${currentValue}\n\n[PDF文件: ${file.name}]` : 
        `我上传了一个PDF文件: ${file.name}，请问有什么可以帮助您的？`;
      messageInput.value = newValue;
      this.handleInputChange();
    }
  }

  /**
   * 读取文件为文本
   * @param {File} file - 文件对象
   * @returns {Promise<string>}
   */
  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('文件读取失败'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * 读取文件为DataURL
   * @param {File} file - 文件对象
   * @returns {Promise<string>}
   */
  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('文件读取失败'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * 设置拖拽上传功能
   */
  setupDragAndDrop() {
    const chatSection = DOM.get('.chat-section');
    const chatMessages = DOM.get('#chatMessages');
    const welcomeScreen = DOM.get('#welcomeScreen');
    
    if (!chatSection) return;

    // 拖拽计数器，用于处理嵌套元素的拖拽事件
    let dragCounter = 0;

    // 拖拽进入
    DOM.on(chatSection, 'dragenter', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter++;
      
      if (dragCounter === 1) {
        this.showDragOverlay();
      }
    });

    // 拖拽悬停
    DOM.on(chatSection, 'dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // 设置拖拽效果
      e.dataTransfer.dropEffect = 'copy';
    });

    // 拖拽离开
    DOM.on(chatSection, 'dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter--;
      
      if (dragCounter === 0) {
        this.hideDragOverlay();
      }
    });

    // 文件放置
    DOM.on(chatSection, 'drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter = 0;
      
      this.hideDragOverlay();
      
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        console.log('📁 通过拖拽上传文件:', files.length, '个文件');
        this.processUploadedFiles(files);
      }
    });

    console.log('🎯 拖拽上传功能已设置');
  }

  /**
   * 显示拖拽覆盖层
   */
  showDragOverlay() {
    // 检查是否已存在覆盖层
    let overlay = DOM.get('#dragOverlay');
    if (overlay) return;

    // 创建拖拽覆盖层
    overlay = DOM.create('div', {
      id: 'dragOverlay',
      className: 'drag-overlay'
    });

    const content = DOM.create('div', {
      className: 'drag-overlay-content'
    });

    const icon = DOM.create('div', {
      className: 'drag-overlay-icon',
      innerHTML: `
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="uploadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#007AFF" stop-opacity="1" />
              <stop offset="100%" stop-color="#AF52DE" stop-opacity="1" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="28" fill="url(#uploadGradient)" opacity="0.1"/>
          <path d="M32 16V48M20 28L32 16L44 28" stroke="url(#uploadGradient)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <path d="M20 40H44" stroke="url(#uploadGradient)" stroke-width="3" stroke-linecap="round" fill="none"/>
        </svg>
      `
    });

    const title = DOM.create('div', {
      className: 'drag-overlay-title',
      textContent: typeof i18n !== 'undefined' ? i18n.t('drag.title') : '拖拽文件到这里上传'
    });

    const subtitle = DOM.create('div', {
      className: 'drag-overlay-subtitle', 
      textContent: typeof i18n !== 'undefined' ? i18n.t('drag.subtitle') : '支持文本、图片、PDF等多种格式'
    });

    content.appendChild(icon);
    content.appendChild(title);
    content.appendChild(subtitle);
    overlay.appendChild(content);

    // 添加到聊天区域
    const chatSection = DOM.get('.chat-section');
    if (chatSection) {
      chatSection.appendChild(overlay);
      
      // 添加动画效果
      setTimeout(() => {
        DOM.addClass(overlay, 'show');
      }, 10);
    }
  }

  /**
   * 隐藏拖拽覆盖层
   */
  hideDragOverlay() {
    const overlay = DOM.get('#dragOverlay');
    if (!overlay) return;

    DOM.removeClass(overlay, 'show');
    
    // 延迟移除，让动画完成
    setTimeout(() => {
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 300);
  }

  /**
   * 创建拖拽提示区域
   */
  createDragHint() {
    const chatMessages = DOM.get('#chatMessages');
    const welcomeScreen = DOM.get('#welcomeScreen');
    
    // 如果已经有消息，不显示拖拽提示
    if (this.messages.length > 0) return;

    // 在欢迎界面添加拖拽提示
    if (welcomeScreen && !DOM.get('.drag-hint')) {
      const dragHint = DOM.create('div', {
        className: 'drag-hint',
        innerHTML: `
          <div class="drag-hint-content">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor" opacity="0.5">
              <path d="M16 4V28M8 12L16 4L24 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
              <path d="M8 20H24" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>
            </svg>
            <p>${typeof i18n !== 'undefined' ? i18n.t('drag.hint') : '您也可以直接拖拽文件到这里上传'}</p>
          </div>
        `
      });
      
      welcomeScreen.appendChild(dragHint);
    }
  }

  /**
   * 显示右键上下文菜单
   * @param {MouseEvent} event - 鼠标事件
   * @param {Object} chat - 对话对象
   */
  showContextMenu(event, chat) {
    // 移除现有菜单
    this.hideContextMenu();

    const menu = DOM.create('div', {
      className: 'context-menu',
      id: 'contextMenu'
    });

    // 重命名选项
    const renameItem = DOM.create('button', {
      className: 'context-menu-item',
      innerHTML: `
        <svg class="context-menu-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M12.146 1.854a.5.5 0 0 1 .708 0L14 3l-1.5 1.5-2-2L12.146 1.854zM11.5 3L13 4.5l-7.5 7.5H4v-1.5L11.5 3z"/>
        </svg>
        <span class="context-menu-text" data-i18n="chat.rename">重命名对话</span>
      `
    });

    // 分隔线
    const divider = DOM.create('div', {
      className: 'context-menu-divider'
    });

    // 删除选项
    const deleteItem = DOM.create('button', {
      className: 'context-menu-item danger',
      innerHTML: `
        <svg class="context-menu-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
        </svg>
        <span class="context-menu-text" data-i18n="chat.delete">删除对话</span>
      `
    });

    menu.appendChild(renameItem);
    menu.appendChild(divider);
    menu.appendChild(deleteItem);

    // 添加到页面
    document.body.appendChild(menu);

    // 定位菜单
    const rect = menu.getBoundingClientRect();
    const x = Math.min(event.clientX, window.innerWidth - rect.width - 10);
    const y = Math.min(event.clientY, window.innerHeight - rect.height - 10);

    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    // 显示菜单
    setTimeout(() => {
      DOM.addClass(menu, 'show');
    }, 10);

    // 事件监听
    DOM.on(renameItem, 'click', () => {
      this.hideContextMenu();
      this.showRenameDialog(chat);
    });

    DOM.on(deleteItem, 'click', () => {
      this.hideContextMenu();
      this.showDeleteConfirmation(chat);
    });

    // 点击外部关闭菜单
    const closeMenu = (e) => {
      if (!menu.contains(e.target)) {
        this.hideContextMenu();
        DOM.off(document, 'click', closeMenu);
        DOM.off(document, 'contextmenu', closeMenu);
      }
    };

    setTimeout(() => {
      DOM.on(document, 'click', closeMenu);
      DOM.on(document, 'contextmenu', closeMenu);
    }, 100);

    // 键盘支持
    DOM.on(document, 'keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideContextMenu();
      }
    });
  }

  /**
   * 隐藏右键上下文菜单
   */
  hideContextMenu() {
    const menu = DOM.get('#contextMenu');
    if (menu) {
      DOM.removeClass(menu, 'show');
      setTimeout(() => {
        if (menu.parentNode) {
          menu.parentNode.removeChild(menu);
        }
      }, 200);
    }
  }

  /**
   * 显示删除确认对话框
   * @param {Object} chat - 对话对象
   */
  showDeleteConfirmation(chat) {
    // 移除现有对话框
    this.hideDeleteConfirmation();

    const overlay = DOM.create('div', {
      className: 'delete-confirmation-overlay',
      id: 'deleteConfirmationOverlay'
    });

    const modal = DOM.create('div', {
      className: 'delete-confirmation-modal'
    });

    const icon = DOM.create('div', {
      className: 'delete-confirmation-icon',
      innerHTML: `
        <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
          <path d="M8 8C8 7.44772 8.44772 7 9 7H11V6C11 4.34315 12.3431 3 14 3H18C19.6569 3 21 4.34315 21 6V7H23C23.5523 7 24 7.44772 24 8C24 8.55228 23.5523 9 23 9H22V23C22 24.6569 20.6569 26 19 26H13C11.3431 26 10 24.6569 10 23V9H9C8.44772 9 8 8.55228 8 8ZM13 7H19V6C19 5.44772 18.5523 5 18 5H14C13.4477 5 13 5.44772 13 6V7ZM12 9V23C12 23.5523 12.4477 24 13 24H19C19.5523 24 20 23.5523 20 23V9H12Z"/>
          <path d="M14 12C14.5523 12 15 12.4477 15 13V20C15 20.5523 14.5523 21 14 21C13.4477 21 13 20.5523 13 20V13C13 12.4477 13.4477 12 14 12Z"/>
          <path d="M18 12C18.5523 12 19 12.4477 19 13V20C19 20.5523 18.5523 21 18 21C17.4477 21 17 20.5523 17 20V13C17 12.4477 17.4477 12 18 12Z"/>
        </svg>
      `
    });

    const title = DOM.create('h3', {
      className: 'delete-confirmation-title',
      textContent: typeof i18n !== 'undefined' ? i18n.t('chat.delete.title') : '删除对话'
    });

    const message = DOM.create('p', {
      className: 'delete-confirmation-message',
      textContent: typeof i18n !== 'undefined' ? i18n.t('chat.delete.message') : '您确定要删除这个对话吗？此操作无法撤销。'
    });

    const chatTitle = DOM.create('div', {
      className: 'delete-confirmation-chat-title',
      textContent: `"${chat.title}"`
    });

    const actions = DOM.create('div', {
      className: 'delete-confirmation-actions'
    });

    const cancelBtn = DOM.create('button', {
      className: 'delete-confirmation-btn cancel',
      textContent: typeof i18n !== 'undefined' ? i18n.t('common.cancel') : '取消'
    });

    const confirmBtn = DOM.create('button', {
      className: 'delete-confirmation-btn confirm',
      textContent: typeof i18n !== 'undefined' ? i18n.t('common.delete') : '删除'
    });

    actions.appendChild(cancelBtn);
    actions.appendChild(confirmBtn);

    modal.appendChild(icon);
    modal.appendChild(title);
    modal.appendChild(message);
    modal.appendChild(chatTitle);
    modal.appendChild(actions);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // 显示对话框
    setTimeout(() => {
      DOM.addClass(overlay, 'show');
    }, 10);

    // 事件监听
    DOM.on(cancelBtn, 'click', () => {
      this.hideDeleteConfirmation();
    });

    DOM.on(confirmBtn, 'click', () => {
      this.deleteChat(chat.id);
      this.hideDeleteConfirmation();
    });

    DOM.on(overlay, 'click', (e) => {
      if (e.target === overlay) {
        this.hideDeleteConfirmation();
      }
    });

    // 键盘支持
    DOM.on(document, 'keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideDeleteConfirmation();
      } else if (e.key === 'Enter') {
        this.deleteChat(chat.id);
        this.hideDeleteConfirmation();
      }
    });

    // 聚焦到取消按钮
    setTimeout(() => {
      cancelBtn.focus();
    }, 100);
  }

  /**
   * 隐藏删除确认对话框
   */
  hideDeleteConfirmation() {
    const overlay = DOM.get('#deleteConfirmationOverlay');
    if (overlay) {
      DOM.removeClass(overlay, 'show');
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 300);
    }
  }

  /**
   * 删除对话
   * @param {string} chatId - 对话ID
   */
  deleteChat(chatId) {
    const chat = this.chatHistory[chatId];
    if (!chat) return;

    try {
      // 从历史记录中删除
      delete this.chatHistory[chatId];
      Storage.set('chatHistory', this.chatHistory);

      // 如果删除的是当前对话，开始新对话
      if (this.currentChatId === chatId) {
        this.startNewChat();
      } else {
        // 否则只更新历史列表UI
        this.updateChatHistoryUI();
      }

      // 显示成功通知
      Notification.success(
        typeof i18n !== 'undefined' ? 
        i18n.t('chat.delete.success') : 
        `已删除对话："${chat.title}"`
      );

      console.log('✅ 对话删除成功:', chat.title);

    } catch (error) {
      console.error('❌ 删除对话失败:', error);
      Notification.error(
        typeof i18n !== 'undefined' ? 
        i18n.t('chat.delete.error') : 
        '删除对话失败，请重试'
      );
    }
  }

  /**
   * 显示重命名对话框
   * @param {Object} chat - 对话对象
   */
  showRenameDialog(chat) {
    // TODO: 实现重命名对话功能
    console.log('重命名对话:', chat.title);
    Notification.info('重命名功能即将推出');
  }
}

// 导出聊天管理器类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ChatManager };
}
