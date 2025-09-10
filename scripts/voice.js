/* ==========================================
   语音处理 - Voice.js
   处理语音输入和语音合成功能
   ========================================== */

/**
 * 语音管理类
 */
class VoiceManager {
  constructor() {
    this.recognition = null;
    this.synthesis = null;
    this.isRecording = false;
    this.isSupported = this.checkSupport();
    
    // 首先初始化语音设置
    this.settings = {
      language: Storage.get('voiceLanguage', 'zh-CN'),
      autoSpeak: Storage.get('voiceAutoSpeak', false),
      voiceRate: Storage.get('voiceRate', 1),
      voicePitch: Storage.get('voicePitch', 1),
      voiceVolume: Storage.get('voiceVolume', 1)
    };
    
    // 然后初始化语音识别
    this.initSpeechRecognition();
    
    // 初始化语音合成
    this.initSpeechSynthesis();
  }

  /**
   * 检查浏览器支持
   * @returns {Object}
   */
  checkSupport() {
    return {
      recognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
      synthesis: 'speechSynthesis' in window,
      getUserMedia: 'getUserMedia' in navigator.mediaDevices
    };
  }

  /**
   * 初始化语音识别
   */
  initSpeechRecognition() {
    if (!this.isSupported.recognition) {
      console.warn('当前浏览器不支持语音识别');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    // 配置语音识别
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.settings.language;

    // 设置事件监听器
    this.setupRecognitionEvents();
  }

  /**
   * 设置语音识别事件
   */
  setupRecognitionEvents() {
    if (!this.recognition) return;

    // 开始录音
    this.recognition.onstart = () => {
      this.isRecording = true;
      this.onRecordingStart();
    };

    // 录音结束
    this.recognition.onend = () => {
      this.isRecording = false;
      this.onRecordingEnd();
    };

    // 识别结果
    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      this.onRecognitionResult(finalTranscript, interimTranscript);
    };

    // 错误处理
    this.recognition.onerror = (event) => {
      this.isRecording = false;
      this.onRecognitionError(event.error);
    };

    // 无语音输入
    this.recognition.onspeechend = () => {
      this.recognition.stop();
    };
  }

  /**
   * 初始化语音合成
   */
  initSpeechSynthesis() {
    if (!this.isSupported.synthesis) {
      console.warn('当前浏览器不支持语音合成');
      return;
    }

    this.synthesis = window.speechSynthesis;
  }

  /**
   * 开始语音录制
   */
  startRecording() {
    if (!this.isSupported.recognition) {
      Notification.error('您的浏览器不支持语音识别功能');
      return false;
    }

    if (this.isRecording) {
      this.stopRecording();
      return false;
    }

    try {
      this.recognition.lang = this.settings.language;
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('启动语音识别失败:', error);
      Notification.error('启动语音识别失败，请稍后重试');
      return false;
    }
  }

  /**
   * 停止语音录制
   */
  stopRecording() {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
    }
  }

  /**
   * 语音合成（文本转语音）
   * @param {string} text - 要朗读的文本
   * @param {Object} options - 语音选项
   */
  speak(text, options = {}) {
    if (!this.isSupported.synthesis) {
      console.warn('当前浏览器不支持语音合成');
      return;
    }

    // 停止当前播放
    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // 设置语音参数
    utterance.lang = options.language || this.settings.language;
    utterance.rate = options.rate || this.settings.voiceRate;
    utterance.pitch = options.pitch || this.settings.voicePitch;
    utterance.volume = options.volume || this.settings.voiceVolume;

    // 选择语音
    const voices = this.synthesis.getVoices();
    const voice = voices.find(v => 
      v.lang.startsWith(utterance.lang.split('-')[0])
    );
    if (voice) {
      utterance.voice = voice;
    }

    // 事件监听
    utterance.onstart = () => {
      this.onSpeakStart();
    };

    utterance.onend = () => {
      this.onSpeakEnd();
    };

    utterance.onerror = (event) => {
      console.error('语音合成错误:', event.error);
      this.onSpeakError(event.error);
    };

    // 开始播放
    this.synthesis.speak(utterance);
  }

  /**
   * 停止语音播放
   */
  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  /**
   * 获取可用语音列表
   * @returns {Array}
   */
  getAvailableVoices() {
    if (!this.synthesis) return [];
    
    return this.synthesis.getVoices().map(voice => ({
      name: voice.name,
      lang: voice.lang,
      localService: voice.localService,
      default: voice.default
    }));
  }

  /**
   * 设置语言
   * @param {string} language - 语言代码
   */
  setLanguage(language) {
    this.settings.language = language;
    Storage.set('voiceLanguage', language);
    
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  /**
   * 设置自动播放
   * @param {boolean} enabled - 是否启用
   */
  setAutoSpeak(enabled) {
    this.settings.autoSpeak = enabled;
    Storage.set('voiceAutoSpeak', enabled);
  }

  /**
   * 设置语音参数
   * @param {Object} params - 语音参数
   */
  setVoiceSettings(params) {
    if (params.rate !== undefined) {
      this.settings.voiceRate = Math.max(0.1, Math.min(2, params.rate));
      Storage.set('voiceRate', this.settings.voiceRate);
    }
    
    if (params.pitch !== undefined) {
      this.settings.voicePitch = Math.max(0, Math.min(2, params.pitch));
      Storage.set('voicePitch', this.settings.voicePitch);
    }
    
    if (params.volume !== undefined) {
      this.settings.voiceVolume = Math.max(0, Math.min(1, params.volume));
      Storage.set('voiceVolume', this.settings.voiceVolume);
    }
  }

  /**
   * 录音开始回调
   */
  onRecordingStart() {
    const voiceBtn = DOM.get('#voiceBtn');
    if (voiceBtn) {
      DOM.addClass(voiceBtn, 'recording');
      voiceBtn.title = '点击停止录音';
    }
    
    // 显示录音状态
    Notification.show('正在录音...', 'info', 1000);
  }

  /**
   * 录音结束回调
   */
  onRecordingEnd() {
    const voiceBtn = DOM.get('#voiceBtn');
    if (voiceBtn) {
      DOM.removeClass(voiceBtn, 'recording');
      voiceBtn.title = '语音输入';
    }
  }

  /**
   * 识别结果回调
   * @param {string} finalTranscript - 最终识别结果
   * @param {string} interimTranscript - 临时识别结果
   */
  onRecognitionResult(finalTranscript, interimTranscript) {
    const messageInput = DOM.get('#messageInput');
    if (!messageInput) return;

    if (finalTranscript) {
      // 添加最终结果到输入框
      const currentValue = messageInput.value;
      messageInput.value = currentValue + finalTranscript;
      
      // 触发输入事件
      messageInput.dispatchEvent(new Event('input'));
      
      // 自动发送（可选）
      if (this.settings.autoSend && finalTranscript.trim()) {
        setTimeout(() => {
          const sendBtn = DOM.get('#sendBtn');
          if (sendBtn && !sendBtn.disabled) {
            sendBtn.click();
          }
        }, 500);
      }
    } else if (interimTranscript) {
      // 显示临时结果（可选实现）
      this.showInterimResult(interimTranscript);
    }
  }

  /**
   * 识别错误回调
   * @param {string} error - 错误信息
   */
  onRecognitionError(error) {
    const errorMessages = {
      'no-speech': '没有检测到语音输入',
      'audio-capture': '无法访问麦克风',
      'not-allowed': '麦克风访问被拒绝',
      'network': '网络连接错误',
      'service-not-allowed': '语音识别服务不可用'
    };

    const message = errorMessages[error] || `语音识别错误: ${error}`;
    Notification.error(message);
  }

  /**
   * 播放开始回调
   */
  onSpeakStart() {
    // 可以添加播放状态指示
  }

  /**
   * 播放结束回调
   */
  onSpeakEnd() {
    // 播放结束处理
  }

  /**
   * 播放错误回调
   * @param {string} error - 错误信息
   */
  onSpeakError(error) {
    console.error('语音播放错误:', error);
  }

  /**
   * 显示临时识别结果
   * @param {string} text - 临时文本
   */
  showInterimResult(text) {
    // 可以在界面上显示临时识别结果
    // 这里暂时使用控制台输出
    console.log('临时识别结果:', text);
  }

  /**
   * 检查麦克风权限
   * @returns {Promise<boolean>}
   */
  async checkMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('麦克风权限检查失败:', error);
      return false;
    }
  }

  /**
   * 请求麦克风权限
   * @returns {Promise<boolean>}
   */
  async requestMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      Notification.success('麦克风权限获取成功');
      return true;
    } catch (error) {
      console.error('麦克风权限请求失败:', error);
      Notification.error('无法获取麦克风权限，请检查浏览器设置');
      return false;
    }
  }

  /**
   * 获取支持的语言列表
   * @returns {Array}
   */
  getSupportedLanguages() {
    return [
      { code: 'zh-CN', name: '中文(普通话)' },
      { code: 'zh-TW', name: '中文(繁体)' },
      { code: 'en-US', name: 'English (US)' },
      { code: 'en-GB', name: 'English (UK)' },
      { code: 'ja-JP', name: '日本語' },
      { code: 'ko-KR', name: '한국어' },
      { code: 'fr-FR', name: 'Français' },
      { code: 'de-DE', name: 'Deutsch' },
      { code: 'es-ES', name: 'Español' },
      { code: 'it-IT', name: 'Italiano' },
      { code: 'pt-BR', name: 'Português' },
      { code: 'ru-RU', name: 'Русский' }
    ];
  }

  /**
   * 销毁语音管理器
   */
  destroy() {
    if (this.isRecording) {
      this.stopRecording();
    }
    
    this.stopSpeaking();
    
    if (this.recognition) {
      this.recognition = null;
    }
  }
}

// 创建全局语音管理实例
const voiceManager = new VoiceManager();

// 导出语音管理器
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VoiceManager, voiceManager };
}
