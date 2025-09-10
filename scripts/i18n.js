/* ==========================================
   国际化 - i18n.js
   多语言支持系统
   ========================================== */

/**
 * 国际化管理类
 */
class I18nManager {
  constructor() {
    this.currentLanguage = Storage.get('language', 'zh-CN');
    this.translations = {};
    this.loadTranslations();
  }

  /**
   * 加载翻译资源
   */
  loadTranslations() {
    // 中文简体
    this.translations['zh-CN'] = {
      // 通用
      'app.title': 'AI智能助手',
      'app.subtitle': '您的专属AI伙伴',
      
      // 导航栏
      'nav.logo': 'AI助手',
      'nav.toggle_sidebar': '切换侧边栏',
      'nav.settings': '设置',
      
      // 角色
      'role.assistant': '助手',
      'role.assistant.desc': '友善专业的AI助手',
      'role.teacher': '教师', 
      'role.teacher.desc': '专业的教育指导老师',
      'role.doctor': '医生',
      'role.doctor.desc': '专业的医疗健康顾问',
      'role.leader': '领导',
      'role.leader.desc': '经验丰富的管理决策者',
      
      // 欢迎页面
      'welcome.title': '您好！我是您的AI智能助手',
      'welcome.subtitle': '点击我切换角色',
      'welcome.chat': '智能对话',
      'welcome.chat.desc': '支持文字和语音输入，自然流畅的对话体验',
      'welcome.roles': '多种角色',
      'welcome.roles.desc': '教师、医生、领导等专业角色，满足不同需求',
      'welcome.text': '文本处理',
      'welcome.text.desc': '专业的文本润色和多语言翻译服务',
      
      // 输入区域
      'input.placeholder': '输入您的问题，或点击语音按钮开始语音对话...',
      'input.voice': '语音输入',
      'input.attach': '上传文件',
      'input.functions': '文本处理功能',
      'input.send': '发送消息',
      'input.counter': '字符数',
      'input.tip.enter': '发送消息',
      'input.tip.shift_enter': '换行',
      
      // 功能菜单
      'function.translate': '翻译文本',
      'function.translate.desc': '将文本翻译成其他语言',
      'function.polish': '润色文本', 
      'function.polish.desc': '优化文本表达和语言风格',
      'function.summarize': '总结文本',
      'function.summarize.desc': '提取文本要点和关键信息',
      
      // 拖拽上传
      'drag.title': '拖拽文件到这里上传',
      'drag.subtitle': '支持文本、图片、PDF等多种格式',
      'drag.hint': '您也可以直接拖拽文件到这里上传',
      
      // 侧边栏
      'sidebar.history': '对话历史',
      'sidebar.new_chat': '新对话',
      'sidebar.translate': '翻译',
      'sidebar.polish': '润色',
      
      // 对话管理
      'chat.delete': '删除对话',
      'chat.rename': '重命名对话',
      'chat.delete.title': '删除对话',
      'chat.delete.message': '您确定要删除这个对话吗？此操作无法撤销。',
      'chat.delete.success': '对话删除成功',
      'chat.delete.error': '删除对话失败，请重试',
      
      // 通用按钮
      'common.cancel': '取消',
      'common.confirm': '确认',
      'common.delete': '删除',
      'common.save': '保存',
      
      // 设置面板
      'settings.title': '设置',
      'settings.close': '关闭设置',
      'settings.api': 'AI模型配置',
      'settings.api.provider': 'AI提供商',
      'settings.api.key': 'API密钥',
      'settings.api.key.placeholder': '请输入您的API密钥',
      'settings.language': '语言设置',
      'settings.language.interface': '界面语言',
      'settings.theme': '外观设置',
      'settings.theme.mode': '主题模式',
      'settings.theme.auto': '跟随系统',
      'settings.theme.light': '浅色模式',
      'settings.theme.dark': '深色模式',
      
      // 通知消息
      'notification.language_updated': '语言设置已更新',
      'notification.theme_updated': '主题已切换',
      'notification.role_switched': '已切换到{role}模式',
      'notification.api_required': '请先在设置中配置API密钥才能使用AI功能',
      
      // 加载状态
      'loading.thinking': 'AI正在思考中...',
      
      // 错误信息
      'error.startup_failed': '应用启动失败',
      'error.refresh_page': '抱歉，应用无法正常启动。请刷新页面重试。',
      'error.refresh_button': '刷新页面',
      'error.details': '错误详情'
    };

    // 中文繁体
    this.translations['zh-TW'] = {
      'app.title': 'AI智能助手',
      'app.subtitle': '您的專屬AI夥伴',
      'nav.logo': 'AI助手',
      'nav.toggle_sidebar': '切換側邊欄',
      'nav.settings': '設定',
      'role.assistant': '助手',
      'role.assistant.desc': '友善專業的AI助手',
      'role.teacher': '教師',
      'role.teacher.desc': '專業的教育指導老師',
      'role.doctor': '醫生',
      'role.doctor.desc': '專業的醫療健康顧問',
      'role.leader': '領導',
      'role.leader.desc': '經驗豐富的管理決策者',
      'welcome.title': '您好！我是您的AI智能助手',
      'welcome.subtitle': '點擊我切換角色',
      'welcome.chat': '智能對話',
      'welcome.chat.desc': '支持文字和語音輸入，自然流暢的對話體驗',
      'welcome.roles': '多種角色',
      'welcome.roles.desc': '教師、醫生、領導等專業角色，滿足不同需求',
      'welcome.text': '文本處理',
      'welcome.text.desc': '專業的文本潤色和多語言翻譯服務',
      'input.placeholder': '輸入您的問題，或點擊語音按鈕開始語音對話...',
      'input.voice': '語音輸入',
      'input.attach': '上傳文件',
      'input.functions': '文本處理功能',
      'input.send': '發送消息',
      'input.counter': '字符數',
      'input.tip.enter': '發送消息',
      'input.tip.shift_enter': '換行',
      
      // 功能菜單
      'function.translate': '翻譯文本',
      'function.translate.desc': '將文本翻譯成其他語言',
      'function.polish': '潤色文本', 
      'function.polish.desc': '優化文本表達和語言風格',
      'function.summarize': '總結文本',
      'function.summarize.desc': '提取文本要點和關鍵信息',
      
      // 拖拽上傳
      'drag.title': '拖拽文件到這裡上傳',
      'drag.subtitle': '支持文本、圖片、PDF等多種格式',
      'drag.hint': '您也可以直接拖拽文件到這裡上傳',
      'sidebar.history': '對話歷史',
      'sidebar.new_chat': '新對話',
      'sidebar.translate': '翻譯',
      'sidebar.polish': '潤色',
      
      // 對話管理
      'chat.delete': '刪除對話',
      'chat.rename': '重命名對話',
      'chat.delete.title': '刪除對話',
      'chat.delete.message': '您確定要刪除這個對話嗎？此操作無法撤銷。',
      'chat.delete.success': '對話刪除成功',
      'chat.delete.error': '刪除對話失敗，請重試',
      
      // 通用按鈕
      'common.cancel': '取消',
      'common.confirm': '確認',
      'common.delete': '刪除',
      'common.save': '保存',
      'settings.title': '設定',
      'settings.close': '關閉設定',
      'settings.api': 'AI模型配置',
      'settings.api.provider': 'AI提供商',
      'settings.api.key': 'API密鑰',
      'settings.api.key.placeholder': '請輸入您的API密鑰',
      'settings.language': '語言設定',
      'settings.language.interface': '界面語言',
      'settings.theme': '外觀設定',
      'settings.theme.mode': '主題模式',
      'settings.theme.auto': '跟隨系統',
      'settings.theme.light': '淺色模式',
      'settings.theme.dark': '深色模式',
      'notification.language_updated': '語言設定已更新',
      'notification.theme_updated': '主題已切換',
      'notification.role_switched': '已切換到{role}模式',
      'notification.api_required': '請先在設定中配置API密鑰才能使用AI功能',
      'loading.thinking': 'AI正在思考中...',
      'error.startup_failed': '應用啟動失敗',
      'error.refresh_page': '抱歉，應用無法正常啟動。請刷新頁面重試。',
      'error.refresh_button': '刷新頁面',
      'error.details': '錯誤詳情'
    };

    // 英文
    this.translations['en'] = {
      'app.title': 'AI Assistant',
      'app.subtitle': 'Your Personal AI Companion',
      'nav.logo': 'AI Assistant',
      'nav.toggle_sidebar': 'Toggle Sidebar',
      'nav.settings': 'Settings',
      'role.assistant': 'Assistant',
      'role.assistant.desc': 'Friendly and Professional AI Assistant',
      'role.teacher': 'Teacher',
      'role.teacher.desc': 'Professional Educational Instructor',
      'role.doctor': 'Doctor',
      'role.doctor.desc': 'Professional Medical Health Advisor',
      'role.leader': 'Leader',
      'role.leader.desc': 'Experienced Management Decision Maker',
      'welcome.title': 'Hello! I\'m your AI Assistant',
      'welcome.subtitle': 'Click me to switch roles',
      'welcome.chat': 'Smart Chat',
      'welcome.chat.desc': 'Support text and voice input with natural conversation experience',
      'welcome.roles': 'Multiple Roles',
      'welcome.roles.desc': 'Professional roles like teacher, doctor, leader for different needs',
      'welcome.text': 'Text Processing',
      'welcome.text.desc': 'Professional text polishing and multilingual translation services',
      'input.placeholder': 'Enter your question, or click the voice button to start voice conversation...',
      'input.voice': 'Voice Input',
      'input.attach': 'Upload File',
      'input.functions': 'Text Processing Functions',
      'input.send': 'Send Message',
      'input.counter': 'Characters',
      'input.tip.enter': 'Send Message',
      'input.tip.shift_enter': 'New Line',
      
      // Function Menu
      'function.translate': 'Translate Text',
      'function.translate.desc': 'Translate text to other languages',
      'function.polish': 'Polish Text', 
      'function.polish.desc': 'Optimize text expression and language style',
      'function.summarize': 'Summarize Text',
      'function.summarize.desc': 'Extract key points and important information',
      
      // Drag & Drop
      'drag.title': 'Drag files here to upload',
      'drag.subtitle': 'Supports text, images, PDF and other formats',
      'drag.hint': 'You can also drag files directly here to upload',
      'sidebar.history': 'Chat History',
      'sidebar.new_chat': 'New Chat',
      'sidebar.translate': 'Translate',
      'sidebar.polish': 'Polish',
      
      // Chat Management
      'chat.delete': 'Delete Chat',
      'chat.rename': 'Rename Chat',
      'chat.delete.title': 'Delete Chat',
      'chat.delete.message': 'Are you sure you want to delete this chat? This action cannot be undone.',
      'chat.delete.success': 'Chat deleted successfully',
      'chat.delete.error': 'Failed to delete chat, please try again',
      
      // Common Buttons
      'common.cancel': 'Cancel',
      'common.confirm': 'Confirm',
      'common.delete': 'Delete',
      'common.save': 'Save',
      'settings.title': 'Settings',
      'settings.close': 'Close Settings',
      'settings.api': 'AI Model Configuration',
      'settings.api.provider': 'AI Provider',
      'settings.api.key': 'API Key',
      'settings.api.key.placeholder': 'Please enter your API key',
      'settings.language': 'Language Settings',
      'settings.language.interface': 'Interface Language',
      'settings.theme': 'Appearance Settings',
      'settings.theme.mode': 'Theme Mode',
      'settings.theme.auto': 'Follow System',
      'settings.theme.light': 'Light Mode',
      'settings.theme.dark': 'Dark Mode',
      'notification.language_updated': 'Language settings updated',
      'notification.theme_updated': 'Theme switched',
      'notification.role_switched': 'Switched to {role} mode',
      'notification.api_required': 'Please configure API key in settings to use AI features',
      'loading.thinking': 'AI is thinking...',
      'error.startup_failed': 'Application startup failed',
      'error.refresh_page': 'Sorry, the application failed to start. Please refresh the page to try again.',
      'error.refresh_button': 'Refresh Page',
      'error.details': 'Error Details'
    };

    // 日文
    this.translations['ja'] = {
      'app.title': 'AIアシスタント',
      'app.subtitle': 'あなた専用のAIパートナー',
      'nav.logo': 'AIアシスタント',
      'nav.toggle_sidebar': 'サイドバー切替',
      'nav.settings': '設定',
      'role.assistant': 'アシスタント',
      'role.assistant.desc': 'フレンドリーで専門的なAIアシスタント',
      'role.teacher': '教師',
      'role.teacher.desc': '専門的な教育指導者',
      'role.doctor': '医師',
      'role.doctor.desc': '専門的な医療健康アドバイザー',
      'role.leader': 'リーダー',
      'role.leader.desc': '経験豊富な管理意思決定者',
      'welcome.title': 'こんにちは！私はあなたのAIアシスタントです',
      'welcome.subtitle': 'クリックして役割を切り替える',
      'welcome.chat': 'スマート会話',
      'welcome.chat.desc': 'テキストと音声入力をサポートし、自然な会話体験を提供',
      'welcome.roles': '複数の役割',
      'welcome.roles.desc': '教師、医師、リーダーなどの専門的な役割で様々なニーズに対応',
      'welcome.text': 'テキスト処理',
      'welcome.text.desc': '専門的なテキスト校正と多言語翻訳サービス',
      'input.placeholder': '質問を入力するか、音声ボタンをクリックして音声会話を開始してください...',
      'input.voice': '音声入力',
      'input.attach': 'ファイルアップロード',
      'input.functions': 'テキスト処理機能',
      'input.send': 'メッセージ送信',
      'input.counter': '文字数',
      'input.tip.enter': 'メッセージ送信',
      'input.tip.shift_enter': '改行',
      
      // 機能メニュー
      'function.translate': 'テキスト翻訳',
      'function.translate.desc': 'テキストを他の言語に翻訳',
      'function.polish': 'テキスト校正', 
      'function.polish.desc': 'テキストの表現と言語スタイルを最適化',
      'function.summarize': 'テキスト要約',
      'function.summarize.desc': '要点と重要な情報を抽出',
      
      // ドラッグ&ドロップ
      'drag.title': 'ファイルをここにドラッグしてアップロード',
      'drag.subtitle': 'テキスト、画像、PDFなど様々な形式に対応',
      'drag.hint': 'ファイルを直接ここにドラッグしてアップロードすることもできます',
      'sidebar.history': '会話履歴',
      'sidebar.new_chat': '新しい会話',
      'sidebar.translate': '翻訳',
      'sidebar.polish': '校正',
      
      // 会話管理
      'chat.delete': '会話を削除',
      'chat.rename': '会話名を変更',
      'chat.delete.title': '会話を削除',
      'chat.delete.message': 'この会話を削除してもよろしいですか？この操作は元に戻せません。',
      'chat.delete.success': '会話が正常に削除されました',
      'chat.delete.error': '会話の削除に失敗しました。再試行してください',
      
      // 共通ボタン
      'common.cancel': 'キャンセル',
      'common.confirm': '確認',
      'common.delete': '削除',
      'common.save': '保存',
      'settings.title': '設定',
      'settings.close': '設定を閉じる',
      'settings.api': 'AIモデル設定',
      'settings.api.provider': 'AIプロバイダー',
      'settings.api.key': 'APIキー',
      'settings.api.key.placeholder': 'APIキーを入力してください',
      'settings.language': '言語設定',
      'settings.language.interface': 'インターフェース言語',
      'settings.theme': '外観設定',
      'settings.theme.mode': 'テーマモード',
      'settings.theme.auto': 'システムに従う',
      'settings.theme.light': 'ライトモード',
      'settings.theme.dark': 'ダークモード',
      'notification.language_updated': '言語設定が更新されました',
      'notification.theme_updated': 'テーマが切り替わりました',
      'notification.role_switched': '{role}モードに切り替わりました',
      'notification.api_required': 'AI機能を使用するには、設定でAPIキーを設定してください',
      'loading.thinking': 'AIが考えています...',
      'error.startup_failed': 'アプリケーションの起動に失敗しました',
      'error.refresh_page': '申し訳ございませんが、アプリケーションを起動できませんでした。ページを更新して再試行してください。',
      'error.refresh_button': 'ページを更新',
      'error.details': 'エラー詳細'
    };
  }

  /**
   * 获取翻译文本
   * @param {string} key - 翻译键
   * @param {Object} params - 参数对象
   * @returns {string}
   */
  t(key, params = {}) {
    const translation = this.translations[this.currentLanguage];
    if (!translation || !translation[key]) {
      console.warn(`Translation missing for key: ${key} in language: ${this.currentLanguage}`);
      return key;
    }
    
    let text = translation[key];
    
    // 替换参数
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
    
    return text;
  }

  /**
   * 设置语言
   * @param {string} language - 语言代码
   */
  setLanguage(language) {
    if (!this.translations[language]) {
      console.warn(`Language not supported: ${language}`);
      return;
    }
    
    this.currentLanguage = language;
    Storage.set('language', language);
    this.updateUI();
    
    console.log(`🌐 语言已切换到: ${language}`);
  }

  /**
   * 获取当前语言
   * @returns {string}
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * 获取支持的语言列表
   * @returns {Array}
   */
  getSupportedLanguages() {
    return [
      { code: 'zh-CN', name: '中文简体', nativeName: '中文简体' },
      { code: 'zh-TW', name: '中文繁体', nativeName: '中文繁體' },
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'ja', name: '日本語', nativeName: '日本語' }
    ];
  }

  /**
   * 更新UI界面
   */
  updateUI() {
    // 更新所有带有 data-i18n 属性的元素
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      
      // 根据元素类型更新内容
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        if (element.type === 'text' || element.type === 'password' || element.tagName === 'TEXTAREA') {
          element.placeholder = translation;
        } else {
          element.value = translation;
        }
      } else if (element.tagName === 'OPTION') {
        element.textContent = translation;
      } else {
        element.textContent = translation;
      }
    });

    // 更新所有带有 data-i18n-title 属性的元素的title
    const titleElements = document.querySelectorAll('[data-i18n-title]');
    titleElements.forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      const translation = this.t(key);
      element.title = translation;
      if (element.getAttribute('aria-label')) {
        element.setAttribute('aria-label', translation);
      }
    });

    // 更新页面标题
    document.title = this.t('app.title') + ' - ' + this.t('app.subtitle');

    // 触发语言变化事件
    const event = new CustomEvent('languageChanged', {
      detail: { language: this.currentLanguage }
    });
    document.dispatchEvent(event);
  }

  /**
   * 初始化国际化系统
   */
  init() {
    // 加载保存的语言设置
    const savedLanguage = Storage.get('language', 'zh-CN');
    this.setLanguage(savedLanguage);
    
    // 监听语言变化事件
    document.addEventListener('languageChanged', (event) => {
      console.log('🌐 语言变化事件:', event.detail);
    });
  }
}

// 创建全局实例
const i18n = new I18nManager();

// 全局翻译函数
window.t = (key, params) => i18n.t(key, params);

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { I18nManager, i18n };
}
