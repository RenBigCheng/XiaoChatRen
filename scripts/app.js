/* ==========================================
   主应用 - App.js
   应用程序入口，整合所有功能模块
   ========================================== */

/**
 * 主应用类
 */
class App {
  constructor() {
    this.isInitialized = false;
    this.device = detectDevice();
    this.settings = this.loadSettings();
    
    // 绑定上下文
    this.init = this.init.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
  }

  /**
   * 初始化应用
   */
  async init() {
    try {
      console.log('🚀 AI助手应用启动中...');
      
      // 检查浏览器兼容性
      this.checkCompatibility();
      
      // 初始化主题
      this.initTheme();
      
      // 初始化国际化系统
      this.initI18n();
      
      // 设置全局事件监听器
      this.setupGlobalEventListeners();
      
      // 初始化设置面板
      this.initSettingsPanel();
      
      // 初始化通知系统
      this.initNotificationSystem();
      
      // 初始化侧边栏
      this.initSidebar();
      
      // 初始化3D全息投影机器人
      this.initHologramRobots();
      
      // 初始化角色同步管理器（在聊天管理器之前）
      this.initRoleSyncManager();
      
      // 初始化聊天管理器（在角色同步管理器之后）
      this.initChatManager();
      
      // 检查API配置
      this.checkApiConfiguration();
      
      // 应用启动完成
      this.isInitialized = true;
      console.log('✅ AI助手应用启动成功');
      
      // 显示欢迎提示
      setTimeout(() => {
        if (!Storage.get('hasSeenWelcome', false)) {
          this.showWelcomeTooltip();
          Storage.set('hasSeenWelcome', true);
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ 应用启动失败:', error);
      Notification.error('应用启动失败，请刷新页面重试');
    }
  }

  /**
   * 检查浏览器兼容性
   */
  checkCompatibility() {
    const requiredFeatures = [
      'fetch',
      'localStorage',
      'Promise',
      'addEventListener'
    ];

    const missingFeatures = requiredFeatures.filter(feature => {
      return !(feature in window) && !(feature in window.prototype);
    });

    if (missingFeatures.length > 0) {
      const message = `您的浏览器不支持以下功能：${missingFeatures.join(', ')}。请升级到现代浏览器。`;
      alert(message);
      throw new Error('浏览器兼容性检查失败');
    }

    // 检查关键API支持（安全检查）
    try {
      if (typeof voiceManager !== 'undefined' && voiceManager && voiceManager.isSupported) {
        if (!voiceManager.isSupported.recognition) {
          console.warn('⚠️ 当前浏览器不支持语音识别');
        }

        if (!voiceManager.isSupported.synthesis) {
          console.warn('⚠️ 当前浏览器不支持语音合成');
        }
      } else {
        console.warn('⚠️ 语音管理器未初始化');
      }
    } catch (error) {
      console.warn('⚠️ 语音管理器检查失败:', error.message);
    }
  }

  /**
   * 初始化主题
   */
  initTheme() {
    // 初始化主题色管理器
    ThemeColorManager.init();
    
    const savedTheme = Storage.get('theme', 'auto');
    this.applyTheme(savedTheme);
    
    // 监听主题色变化事件
    document.addEventListener('themeColorChange', (event) => {
      console.log('🎨 主题色变化事件:', event.detail);
    });
    
    // 监听系统主题变化
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (Storage.get('theme') === 'auto') {
          this.applyTheme('auto');
        }
      });
    }
  }

  /**
   * 应用主题
   * @param {string} theme - 主题名称 (light/dark/auto)
   */
  applyTheme(theme) {
    const root = document.documentElement;
    
    if (theme === 'auto') {
      // 跟随系统主题
      const prefersDark = window.matchMedia && 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
    
    // 更新主题色
    ThemeColorManager.updateThemeColor(theme);
    
    Storage.set('theme', theme);
    
    console.log(`🌙 主题已切换到: ${theme}`);
  }

  /**
   * 初始化国际化系统
   */
  initI18n() {
    if (typeof i18n !== 'undefined') {
      i18n.init();
      console.log('🌐 国际化系统已初始化');
    } else {
      console.warn('⚠️ 国际化系统未加载');
    }
  }

  /**
   * 设置全局事件监听器
   */
  setupGlobalEventListeners() {
    // 窗口大小变化
    DOM.on(window, 'resize', debounce(this.handleResize, 250));
    
    // 页面可见性变化
    DOM.on(document, 'visibilitychange', this.handleVisibilityChange);
    
    // 键盘快捷键
    DOM.on(document, 'keydown', (e) => this.handleGlobalKeydown(e));
    
    // 点击外部关闭面板
    DOM.on(document, 'click', (e) => this.handleDocumentClick(e));
    
    // 阻止默认的拖拽行为
    DOM.on(document, 'dragover', (e) => e.preventDefault());
    DOM.on(document, 'drop', (e) => e.preventDefault());
    
    // 错误处理
    window.addEventListener('error', (e) => this.handleGlobalError(e));
    window.addEventListener('unhandledrejection', (e) => this.handleUnhandledRejection(e));
  }

  /**
   * 初始化设置面板
   */
  initSettingsPanel() {
    const settingsBtn = DOM.get('#settingsBtn');
    const settingsPanel = DOM.get('#settingsPanel');
    const closeSettingsBtn = DOM.get('#closeSettingsBtn');

    // 打开设置面板
    if (settingsBtn) {
      DOM.on(settingsBtn, 'click', () => {
        console.log('🔧 设置按钮被点击');
        this.openSettingsPanel();
      });
    } else {
      console.error('❌ 未找到设置按钮元素 #settingsBtn');
    }

    // 关闭设置面板
    if (closeSettingsBtn) {
      DOM.on(closeSettingsBtn, 'click', () => {
        console.log('❌ 关闭设置按钮被点击');
        this.closeSettingsPanel();
      });
    } else {
      console.error('❌ 未找到关闭设置按钮元素 #closeSettingsBtn');
    }

    // 设置项事件监听
    this.setupSettingsEventListeners();
  }

  /**
   * 设置设置面板事件监听器
   */
  setupSettingsEventListeners() {
    // API提供商选择
    const apiProvider = DOM.get('#apiProvider');
    if (apiProvider) {
      DOM.on(apiProvider, 'change', (e) => {
        if (typeof apiManager !== 'undefined') {
          const newProvider = e.target.value;
          apiManager.setProvider(newProvider);
          this.updateApiSettings();
          this.updateFreeUsageVisibility(newProvider);
        }
      });
    }

    // API密钥输入
    const apiKey = DOM.get('#apiKey');
    if (apiKey) {
      DOM.on(apiKey, 'change', (e) => {
        if (typeof apiManager !== 'undefined') {
          apiManager.setApiKey(e.target.value);
        }
      });
    }

    // 语言设置
    const language = DOM.get('#language');
    if (language) {
      DOM.on(language, 'change', (e) => {
        this.changeLanguage(e.target.value);
      });
    }

    // 主题设置
    const theme = DOM.get('#theme');
    if (theme) {
      DOM.on(theme, 'change', (e) => {
        this.applyTheme(e.target.value);
      });
    }

    // 加载当前设置
    this.loadSettingsValues();
  }

  /**
   * 加载设置值到界面
   */
  loadSettingsValues() {
    const apiProvider = DOM.get('#apiProvider');
    const apiKey = DOM.get('#apiKey');
    const language = DOM.get('#language');
    const theme = DOM.get('#theme');

    if (apiProvider && typeof apiManager !== 'undefined') {
      apiProvider.value = apiManager.currentProvider || 'openai';
    }
    if (apiKey && typeof apiManager !== 'undefined') {
      apiKey.value = apiManager.apiKey || '';
    }
    if (language) language.value = Storage.get('language', 'zh-CN');
    if (theme) theme.value = Storage.get('theme', 'auto');
  }

  /**
   * 初始化通知系统
   */
  initNotificationSystem() {
    const notification = DOM.get('#notification');
    const closeBtn = notification?.querySelector('.notification-close');
    
    if (closeBtn) {
      DOM.on(closeBtn, 'click', () => {
        DOM.removeClass(notification, 'show');
      });
    }
  }

  /**
   * 初始化侧边栏
   */
  initSidebar() {
    // 汉堡菜单按钮点击事件
    const toggleBtn = DOM.get('#sidebarToggleBtn');
    if (toggleBtn) {
      DOM.on(toggleBtn, 'click', () => {
        console.log('🍔 汉堡菜单按钮被点击');
        this.toggleSidebar();
      });
    } else {
      console.error('❌ 未找到汉堡菜单按钮元素 #sidebarToggleBtn');
    }

    // 添加键盘快捷键支持
    this.initSidebarKeyboardShortcuts();
    
    // 检查初始状态
    this.updateSidebarButtonState();
  }

  /**
   * 初始化3D全息投影机器人
   */
  initHologramRobots() {
    console.log('🤖 正在初始化3D全息投影机器人...');
    
    try {
      // 检查HologramRobot是否可用
      if (typeof createHologramRobot !== 'function') {
        console.warn('⚠️ HologramRobot脚本未加载');
        return;
      }

      // 主要的AI助手机器人
      const mainRobot = createHologramRobot('mainRobot');

      // 存储机器人实例以便后续管理
      this.hologramRobots = {
        main: mainRobot
      };

      console.log('✅ 3D全息投影机器人初始化完成');
      
    } catch (error) {
      console.error('❌ 3D全息投影机器人初始化失败:', error);
    }
  }

  /**
   * 初始化角色同步管理器
   */
  initRoleSyncManager() {
    console.log('🔄 正在初始化角色同步管理器...');
    
    try {
      // 检查角色同步管理器是否可用
      if (typeof initializeRoleSync === 'function') {
        this.roleSyncManager = initializeRoleSync();
        console.log('✅ 角色同步管理器初始化完成');
      } else {
        console.warn('⚠️ 角色同步管理器脚本未加载');
      }
    } catch (error) {
      console.error('❌ 角色同步管理器初始化失败:', error);
    }
  }

  /**
   * 初始化聊天管理器
   */
  initChatManager() {
    console.log('💬 正在初始化聊天管理器...');
    
    try {
      // 检查聊天管理器是否可用
      if (typeof ChatManager === 'function') {
        this.chatManager = new ChatManager();
        window.chatManager = this.chatManager;
        console.log('✅ 聊天管理器初始化完成');
      } else {
        console.warn('⚠️ 聊天管理器脚本未加载');
      }
    } catch (error) {
      console.error('❌ 聊天管理器初始化失败:', error);
    }
  }

  /**
   * 处理窗口大小变化
   */
  handleResize() {
    // 更新设备检测
    this.device = detectDevice();
    
    // 移动端适配
    if (this.device.isMobile) {
      this.closeSidebar();
    }
  }

  /**
   * 处理页面可见性变化
   */
  handleVisibilityChange() {
    if (document.hidden) {
      // 页面隐藏时停止语音（安全检查）
      if (typeof voiceManager !== 'undefined') {
        voiceManager.stopSpeaking();
        voiceManager.stopRecording();
      }
    }
  }

  /**
   * 处理全局键盘事件
   * @param {KeyboardEvent} event 
   */
  handleGlobalKeydown(event) {
    // Ctrl/Cmd + K: 聚焦输入框
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      const messageInput = DOM.get('#messageInput');
      if (messageInput) messageInput.focus();
    }

    // Escape: 关闭面板
    if (event.key === 'Escape') {
      this.closeAllPanels();
    }

    // Ctrl/Cmd + Enter: 发送消息
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      const sendBtn = DOM.get('#sendBtn');
      if (sendBtn && !sendBtn.disabled) {
        sendBtn.click();
      }
    }
  }

  /**
   * 处理文档点击事件
   * @param {MouseEvent} event 
   */
  handleDocumentClick(event) {
    const settingsPanel = DOM.get('#settingsPanel');
    
    // 点击设置面板外部时关闭
    if (settingsPanel && DOM.hasClass(settingsPanel, 'open')) {
      if (!settingsPanel.contains(event.target) && 
          !DOM.get('#settingsBtn').contains(event.target)) {
        this.closeSettingsPanel();
      }
    }
  }

  /**
   * 处理全局错误
   * @param {ErrorEvent} event 
   */
  handleGlobalError(event) {
    console.error('全局错误:', event.error);
    
    // 不在生产环境显示技术错误
    if (location.hostname === 'localhost') {
      Notification.error(`发生错误: ${event.error?.message || '未知错误'}`);
    }
  }

  /**
   * 处理未捕获的Promise拒绝
   * @param {PromiseRejectionEvent} event 
   */
  handleUnhandledRejection(event) {
    console.error('未处理的Promise拒绝:', event.reason);
    
    if (location.hostname === 'localhost') {
      Notification.error(`Promise错误: ${event.reason?.message || '未知错误'}`);
    }
  }

  /**
   * 打开设置面板
   */
  openSettingsPanel() {
    console.log('🔧 正在打开设置面板');
    const settingsPanel = DOM.get('#settingsPanel');
    if (settingsPanel) {
      DOM.addClass(settingsPanel, 'open');
      console.log('✅ 设置面板已打开');
    } else {
      console.error('❌ 未找到设置面板元素 #settingsPanel');
    }
  }

  /**
   * 关闭设置面板
   */
  closeSettingsPanel() {
    const settingsPanel = DOM.get('#settingsPanel');
    if (settingsPanel) {
      DOM.removeClass(settingsPanel, 'open');
    }
  }

  /**
   * 关闭所有面板
   */
  closeAllPanels() {
    this.closeSettingsPanel();
    this.closeSidebar();
  }

  /**
   * 切换侧边栏
   */
  toggleSidebar() {
    console.log('📚 正在切换侧边栏');
    const sidebar = DOM.get('#sidebar');
    if (!sidebar) {
      console.error('❌ 未找到侧边栏元素 #sidebar');
      return;
    }

    // 桌面端使用collapsed类，移动端使用open类
    if (this.device.isMobile) {
      DOM.toggleClass(sidebar, 'open');
      const isOpen = DOM.hasClass(sidebar, 'open');
      console.log(`✅ 移动端侧边栏已${isOpen ? '打开' : '关闭'}`);
    } else {
      DOM.toggleClass(sidebar, 'collapsed');
      const isCollapsed = DOM.hasClass(sidebar, 'collapsed');
      console.log(`✅ 桌面端侧边栏已${isCollapsed ? '收起' : '展开'}`);
    }
    
    // 更新按钮状态
    this.updateSidebarButtonState();
  }

  /**
   * 关闭侧边栏
   */
  closeSidebar() {
    const sidebar = DOM.get('#sidebar');
    if (sidebar) {
      if (this.device.isMobile) {
        DOM.removeClass(sidebar, 'open');
      } else {
        DOM.addClass(sidebar, 'collapsed');
      }
      this.updateSidebarButtonState();
    }
  }

  /**
   * 更新侧边栏按钮状态
   */
  updateSidebarButtonState() {
    const toggleBtn = DOM.get('#sidebarToggleBtn');
    const sidebar = DOM.get('#sidebar');
    
    if (!toggleBtn || !sidebar) return;
    
    let isHidden = false;
    
    if (this.device.isMobile) {
      isHidden = !DOM.hasClass(sidebar, 'open');
    } else {
      isHidden = DOM.hasClass(sidebar, 'collapsed');
    }
    
    // 更新按钮的active状态
    if (isHidden) {
      DOM.removeClass(toggleBtn, 'active');
    } else {
      DOM.addClass(toggleBtn, 'active');
    }
  }

  /**
   * 初始化侧边栏键盘快捷键
   */
  initSidebarKeyboardShortcuts() {
    DOM.on(document, 'keydown', (e) => {
      // Ctrl/Cmd + B: 切换侧边栏
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        this.toggleSidebar();
      }
    });
    
    console.log('⌨️ 侧边栏键盘快捷键已初始化 (Ctrl+B: 切换侧边栏)');
  }

  /**
   * 检查API配置
   */
  checkApiConfiguration() {
    if (typeof apiManager !== 'undefined') {
      // 如果使用免费服务，显示欢迎信息
      if (apiManager.currentProvider === 'free') {
        setTimeout(() => {
          Notification.success('🎁 您正在使用免费体验服务，每日可进行20次对话');
        }, 2000);
      } else if (!apiManager.apiKey) {
        setTimeout(() => {
          Notification.warning('请先在设置中配置API密钥或使用免费体验服务');
        }, 2000);
      }
      
      // 监听免费使用次数更新事件
      document.addEventListener('freeUsageUpdate', (event) => {
        this.handleFreeUsageUpdate(event.detail);
      });
    }
  }

  /**
   * 处理免费使用次数更新
   * @param {Object} usageData - 使用数据
   */
  handleFreeUsageUpdate(usageData) {
    const { remainingCount, totalFreeCount } = usageData;
    
    // 显示剩余次数提醒
    if (remainingCount <= 5 && remainingCount > 0) {
      Notification.warning(`⚠️ 今日免费次数仅剩${remainingCount}次，建议配置API密钥以获得更好体验`);
    } else if (remainingCount === 0) {
      Notification.error('今日免费次数已用完，请配置API密钥或明天再试');
    }
  }

  /**
   * 更新API设置界面
   */
  updateApiSettings() {
    if (typeof apiManager !== 'undefined') {
      const models = apiManager.getAvailableModels();
      // 这里可以更新模型选择下拉框等
      
      // 更新免费使用次数显示
      if (apiManager.currentProvider === 'free') {
        apiManager.updateFreeUsageUI();
      }
    }
  }

  /**
   * 更新免费使用次数显示的可见性
   * @param {string} provider - API提供商
   */
  updateFreeUsageVisibility(provider) {
    const freeUsageDisplay = DOM.get('#freeUsageDisplay');
    if (freeUsageDisplay) {
      if (provider === 'free') {
        DOM.removeClass(freeUsageDisplay, 'hidden');
        // 如果有使用统计数据，立即更新显示
        if (typeof apiManager !== 'undefined') {
          apiManager.updateFreeUsageUI();
        }
      } else {
        DOM.addClass(freeUsageDisplay, 'hidden');
      }
    }
  }

  /**
   * 更改语言
   * @param {string} lang - 语言代码
   */
  changeLanguage(lang) {
    console.log(`🌐 正在切换语言到: ${lang}`);
    
    // 使用i18n系统切换语言
    if (typeof i18n !== 'undefined') {
      i18n.setLanguage(lang);
    } else {
      console.warn('⚠️ i18n系统未初始化');
      Storage.set('language', lang);
    }
    
    // 更新语音管理器语言
    if (typeof voiceManager !== 'undefined') {
      voiceManager.setLanguage(lang);
    }
    
    // 显示成功通知
    const message = typeof i18n !== 'undefined' ? 
      i18n.t('notification.language_updated') : '语言设置已更新';
    Notification.success(message);
    
    console.log(`✅ 语言已切换到: ${lang}`);
  }

  /**
   * 显示欢迎提示
   */
  showWelcomeTooltip() {
    const tips = [
      '💡 提示：点击语音按钮可以进行语音对话',
      '🎭 提示：可以切换不同的AI角色获得专业建议',
      '⚡ 提示：使用快捷键 Ctrl+K 快速聚焦输入框',
      '🛠️ 提示：记得在设置中配置您的API密钥'
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setTimeout(() => Notification.show(randomTip, 'info', 5000), 1500);
  }

  /**
   * 加载应用设置
   * @returns {Object}
   */
  loadSettings() {
    return {
      theme: Storage.get('theme', 'auto'),
      language: Storage.get('language', 'zh-CN'),
      autoSpeak: Storage.get('voiceAutoSpeak', false),
      apiProvider: Storage.get('apiProvider', 'openai')
    };
  }

  /**
   * 保存应用设置
   */
  saveSettings() {
    Storage.set('appSettings', this.settings);
  }

  /**
   * 重置应用
   */
  reset() {
    if (confirm('确定要重置所有设置和数据吗？此操作不可撤销。')) {
      Storage.clear();
      location.reload();
    }
  }

  /**
   * 获取应用信息
   * @returns {Object}
   */
  getAppInfo() {
    return {
      name: 'AI智能助手',
      version: '1.0.0',
      author: 'AI助手团队',
      description: '现代化的AI聊天助手，支持多角色对话、语音交互、文本处理等功能',
      features: [
        'AI智能对话',
        '多角色切换',
        '语音输入输出',
        '文本润色翻译',
        '对话历史管理',
        '多主题支持',
        '响应式设计'
      ],
      compatibility: this.device,
      support: typeof voiceManager !== 'undefined' ? voiceManager.isSupported : null
    };
  }
}

/**
 * 应用程序入口
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 创建应用实例
    window.app = new App();
    
    // 初始化应用
    await app.init();
    
    // 开发环境下暴露调试接口
    if (location.hostname === 'localhost') {
      window.debug = {
        app,
        chatManager,
        apiManager,
        voiceManager,
        DOM,
        Storage,
        Notification,
        Loading,
        ThemeColorManager
      };
      console.log('🔧 调试接口已暴露到 window.debug');
      console.log('💡 可以使用 debug.ThemeColorManager 来测试主题色功能');
    }
    
  } catch (error) {
    console.error('应用启动失败:', error);
    
    // 显示错误页面或回退界面
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        text-align: center;
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <h1 style="color: #ff3b30; margin-bottom: 16px;">应用启动失败</h1>
        <p style="color: #8e8e93; margin-bottom: 24px;">
          抱歉，应用无法正常启动。请刷新页面重试。
        </p>
        <button onclick="location.reload()" style="
          background: #007aff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
        ">
          刷新页面
        </button>
        <details style="margin-top: 24px; text-align: left;">
          <summary style="cursor: pointer; color: #8e8e93;">错误详情</summary>
          <pre style="
            background: #f5f5f7;
            padding: 12px;
            border-radius: 4px;
            margin-top: 8px;
            font-size: 12px;
            overflow: auto;
          ">${error.stack || error.message}</pre>
        </details>
      </div>
    `;
  }
});

// 导出主应用类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { App };
}
