/* ==========================================
   工具函数 - Utils.js
   提供通用的辅助函数和工具方法
   ========================================== */

/**
 * DOM操作工具
 */
const DOM = {
  /**
   * 根据选择器获取元素
   * @param {string} selector - CSS选择器
   * @returns {Element|null}
   */
  get(selector) {
    return document.querySelector(selector);
  },

  /**
   * 根据选择器获取所有匹配元素
   * @param {string} selector - CSS选择器
   * @returns {NodeList}
   */
  getAll(selector) {
    return document.querySelectorAll(selector);
  },

  /**
   * 创建元素
   * @param {string} tag - 标签名
   * @param {Object} options - 元素属性和内容
   * @returns {Element}
   */
  create(tag, options = {}) {
    const element = document.createElement(tag);
    
    // 设置属性
    if (options.className) {
      element.className = options.className;
    }
    if (options.id) {
      element.id = options.id;
    }
    if (options.innerHTML) {
      element.innerHTML = options.innerHTML;
    }
    if (options.textContent) {
      element.textContent = options.textContent;
    }
    
    // 设置其他属性
    Object.keys(options).forEach(key => {
      if (!['className', 'id', 'innerHTML', 'textContent'].includes(key)) {
        element.setAttribute(key, options[key]);
      }
    });
    
    return element;
  },

  /**
   * 添加事件监听器
   * @param {Element} element - 目标元素
   * @param {string} event - 事件类型
   * @param {Function} handler - 事件处理函数
   * @param {Object} options - 事件选项
   */
  on(element, event, handler, options = {}) {
    element.addEventListener(event, handler, options);
  },

  /**
   * 移除事件监听器
   * @param {Element} element - 目标元素
   * @param {string} event - 事件类型
   * @param {Function} handler - 事件处理函数
   */
  off(element, event, handler) {
    element.removeEventListener(event, handler);
  },

  /**
   * 切换类名
   * @param {Element} element - 目标元素
   * @param {string} className - 类名
   */
  toggleClass(element, className) {
    element.classList.toggle(className);
  },

  /**
   * 添加类名
   * @param {Element} element - 目标元素
   * @param {string} className - 类名
   */
  addClass(element, className) {
    element.classList.add(className);
  },

  /**
   * 移除类名
   * @param {Element} element - 目标元素
   * @param {string} className - 类名
   */
  removeClass(element, className) {
    element.classList.remove(className);
  },

  /**
   * 检查是否包含类名
   * @param {Element} element - 目标元素
   * @param {string} className - 类名
   * @returns {boolean}
   */
  hasClass(element, className) {
    return element.classList.contains(className);
  }
};

/**
 * 字符串处理工具
 */
const StringUtils = {
  /**
   * 截断文本
   * @param {string} text - 原始文本
   * @param {number} length - 最大长度
   * @param {string} suffix - 后缀
   * @returns {string}
   */
  truncate(text, length = 50, suffix = '...') {
    if (text.length <= length) return text;
    return text.substring(0, length) + suffix;
  },

  /**
   * 转义HTML字符
   * @param {string} text - 原始文本
   * @returns {string}
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * 格式化文件大小
   * @param {number} bytes - 字节数
   * @returns {string}
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * 生成随机ID
   * @param {number} length - ID长度
   * @returns {string}
   */
  generateId(length = 8) {
    return Math.random().toString(36).substring(2, length + 2);
  }
};

/**
 * 时间处理工具
 */
const TimeUtils = {
  /**
   * 格式化时间
   * @param {Date|string|number} date - 日期
   * @param {string} format - 格式字符串
   * @returns {string}
   */
  format(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  /**
   * 获取相对时间
   * @param {Date|string|number} date - 日期
   * @returns {string}
   */
  getRelativeTime(date) {
    const now = new Date();
    const target = new Date(date);
    const diff = now - target;
    
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;
    const month = 30 * day;
    const year = 365 * day;

    if (diff < minute) return '刚刚';
    if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
    if (diff < day) return `${Math.floor(diff / hour)}小时前`;
    if (diff < week) return `${Math.floor(diff / day)}天前`;
    if (diff < month) return `${Math.floor(diff / week)}周前`;
    if (diff < year) return `${Math.floor(diff / month)}个月前`;
    return `${Math.floor(diff / year)}年前`;
  }
};

/**
 * 本地存储工具
 */
const Storage = {
  /**
   * 设置本地存储
   * @param {string} key - 键名
   * @param {any} value - 值
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('存储数据失败:', error);
    }
  },

  /**
   * 获取本地存储
   * @param {string} key - 键名
   * @param {any} defaultValue - 默认值
   * @returns {any}
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('读取数据失败:', error);
      return defaultValue;
    }
  },

  /**
   * 删除本地存储
   * @param {string} key - 键名
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('删除数据失败:', error);
    }
  },

  /**
   * 清空本地存储
   */
  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('清空数据失败:', error);
    }
  }
};

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function}
 */
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 限制时间（毫秒）
 * @returns {Function}
 */
function throttle(func, limit = 300) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 异步延迟函数
 * @param {number} ms - 延迟时间（毫秒）
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @returns {Promise<boolean>}
 */
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 备用方法
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (error) {
    console.error('复制失败:', error);
    return false;
  }
}

/**
 * 检测设备类型
 * @returns {Object}
 */
function detectDevice() {
  const userAgent = navigator.userAgent;
  return {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
    isTablet: /iPad|Android(?!.*Mobile)/i.test(userAgent),
    isDesktop: !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
    isIOS: /iPad|iPhone|iPod/.test(userAgent),
    isAndroid: /Android/.test(userAgent),
    isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
    isChrome: /Chrome/.test(userAgent),
    isFirefox: /Firefox/.test(userAgent)
  };
}

/**
 * 验证工具
 */
const Validator = {
  /**
   * 验证邮箱格式
   * @param {string} email - 邮箱地址
   * @returns {boolean}
   */
  isEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * 验证URL格式
   * @param {string} url - URL地址
   * @returns {boolean}
   */
  isUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * 验证是否为空
   * @param {any} value - 要验证的值
   * @returns {boolean}
   */
  isEmpty(value) {
    return value === null || value === undefined || value === '' || 
           (Array.isArray(value) && value.length === 0) ||
           (typeof value === 'object' && Object.keys(value).length === 0);
  }
};

/**
 * 通知工具
 */
const Notification = {
  /**
   * 显示通知
   * @param {string} message - 通知消息
   * @param {string} type - 通知类型 (success, error, warning, info)
   * @param {number} duration - 显示时长（毫秒）
   */
  show(message, type = 'info', duration = 3000) {
    const notification = DOM.get('#notification');
    const messageEl = notification.querySelector('.notification-message');
    
    messageEl.textContent = message;
    notification.className = `notification show ${type}`;
    
    // 自动隐藏
    setTimeout(() => {
      notification.className = 'notification';
    }, duration);
  },

  /**
   * 显示成功通知
   * @param {string} message - 消息内容
   */
  success(message) {
    this.show(message, 'success');
  },

  /**
   * 显示错误通知
   * @param {string} message - 消息内容
   */
  error(message) {
    this.show(message, 'error');
  },

  /**
   * 显示警告通知
   * @param {string} message - 消息内容
   */
  warning(message) {
    this.show(message, 'warning');
  }
};

/**
 * 加载指示器工具
 */
const Loading = {
  /**
   * 显示加载指示器
   * @param {string} text - 加载文本
   */
  show(text = 'AI正在思考中...') {
    const loading = DOM.get('#loadingIndicator');
    const textEl = loading.querySelector('.loading-text');
    textEl.textContent = text;
    DOM.addClass(loading, 'show');
  },

  /**
   * 隐藏加载指示器
   */
  hide() {
    const loading = DOM.get('#loadingIndicator');
    DOM.removeClass(loading, 'show');
  }
};

/**
 * 动态主题色管理器
 */
const ThemeColorManager = {
  // 主题色配置
  colors: {
    light: {
      primary: '#007AFF',
      secondary: '#5856D6',
      accent: '#AF52DE'
    },
    dark: {
      primary: '#0A84FF',
      secondary: '#5E5CE6',
      accent: '#BF5AF2'
    }
  },

  /**
   * 初始化主题色管理器
   */
  init() {
    this.updateThemeColor();
    this.setupSystemThemeListener();
  },

  /**
   * 更新主题色
   * @param {string} theme - 主题模式 (light/dark/auto)
   */
  updateThemeColor(theme = null) {
    const currentTheme = theme || this.getCurrentTheme();
    const isDark = this.isDarkTheme(currentTheme);
    const colorScheme = isDark ? 'dark' : 'light';
    const themeColor = this.colors[colorScheme].primary;

    // 更新所有主题色相关的meta标签
    this.updateMetaTag('theme-color', themeColor);
    this.updateMetaTag('msapplication-TileColor', themeColor);
    this.updateMetaTag('msapplication-navbutton-color', themeColor);
    
    // 更新Apple相关的meta标签
    this.updateAppleMetaTags(isDark);
    
    // 触发自定义事件，通知其他组件主题色已更新
    this.dispatchThemeColorChangeEvent(themeColor, colorScheme);

    console.log(`🎨 主题色已更新: ${themeColor} (${colorScheme})`);
  },

  /**
   * 获取当前主题
   * @returns {string}
   */
  getCurrentTheme() {
    const savedTheme = Storage.get('theme', 'auto');
    if (savedTheme === 'auto') {
      return this.getSystemTheme();
    }
    return savedTheme;
  },

  /**
   * 获取系统主题
   * @returns {string}
   */
  getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  },

  /**
   * 判断是否为深色主题
   * @param {string} theme - 主题名称
   * @returns {boolean}
   */
  isDarkTheme(theme) {
    if (theme === 'auto') {
      return this.getSystemTheme() === 'dark';
    }
    return theme === 'dark';
  },

  /**
   * 更新meta标签
   * @param {string} name - meta标签的name属性
   * @param {string} content - meta标签的content属性
   */
  updateMetaTag(name, content) {
    let metaTag = document.querySelector(`meta[name="${name}"]`);
    
    if (!metaTag) {
      // 如果meta标签不存在，创建一个新的
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', name);
      document.head.appendChild(metaTag);
    }
    
    metaTag.setAttribute('content', content);
  },

  /**
   * 更新Apple相关的meta标签
   * @param {boolean} isDark - 是否为深色主题
   */
  updateAppleMetaTags(isDark) {
    // iOS状态栏样式
    const statusBarStyle = isDark ? 'black-translucent' : 'default';
    this.updateMetaTag('apple-mobile-web-app-status-bar-style', statusBarStyle);
    
    // 确保PWA相关设置
    this.updateMetaTag('apple-mobile-web-app-capable', 'yes');
    this.updateMetaTag('mobile-web-app-capable', 'yes');
  },

  /**
   * 设置系统主题监听器
   */
  setupSystemThemeListener() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // 使用现代API
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', () => {
          if (Storage.get('theme', 'auto') === 'auto') {
            this.updateThemeColor();
          }
        });
      } else {
        // 兼容旧版浏览器
        mediaQuery.addListener(() => {
          if (Storage.get('theme', 'auto') === 'auto') {
            this.updateThemeColor();
          }
        });
      }
    }
  },

  /**
   * 派发主题色变化事件
   * @param {string} color - 新的主题色
   * @param {string} scheme - 色彩方案 (light/dark)
   */
  dispatchThemeColorChangeEvent(color, scheme) {
    const event = new CustomEvent('themeColorChange', {
      detail: {
        color: color,
        scheme: scheme,
        timestamp: Date.now()
      }
    });
    document.dispatchEvent(event);
  },

  /**
   * 设置自定义主题色
   * @param {Object} colors - 自定义颜色配置
   */
  setCustomColors(colors) {
    this.colors = { ...this.colors, ...colors };
    this.updateThemeColor();
  },

  /**
   * 获取当前主题色
   * @returns {string}
   */
  getCurrentColor() {
    const currentTheme = this.getCurrentTheme();
    const isDark = this.isDarkTheme(currentTheme);
    const colorScheme = isDark ? 'dark' : 'light';
    return this.colors[colorScheme].primary;
  },

  /**
   * 获取主题色调色板
   * @returns {Object}
   */
  getColorPalette() {
    const currentTheme = this.getCurrentTheme();
    const isDark = this.isDarkTheme(currentTheme);
    const colorScheme = isDark ? 'dark' : 'light';
    return this.colors[colorScheme];
  }
};

// 导出所有工具函数（在模块化环境中使用）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DOM,
    StringUtils,
    TimeUtils,
    Storage,
    debounce,
    throttle,
    sleep,
    copyToClipboard,
    detectDevice,
    Validator,
    Notification,
    Loading,
    ThemeColorManager
  };
}
