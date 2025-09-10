/**
 * AI聊天代理服务 - Vercel云函数
 * 提供免费的AI对话服务，隐藏API密钥，控制使用限制
 */

const crypto = require('crypto');

// 配置常量
const CONFIG = {
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY, // 您的DeepSeek API密钥
  DEEPSEEK_ENDPOINT: 'https://api.deepseek.com/v1/chat/completions',
  FREE_LIMIT: 20, // 每日免费次数
  RATE_LIMIT: 10, // 每小时限制次数
  MAX_TOKENS: 4000, // 最大token限制
  ALLOWED_ORIGINS: [
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'https://your-domain.com', // 替换为您的实际域名
  ],
};

// 内存存储（简化版，生产环境建议使用外部存储）
const userUsage = new Map();

/**
 * 生成用户指纹
 * 基于IP、User-Agent、语言等信息生成唯一标识
 */
function generateUserFingerprint(req) {
  const ip = req.headers['x-forwarded-for'] || 
             req.headers['x-real-ip'] || 
             '127.0.0.1';
  const userAgent = req.headers['user-agent'] || '';
  const acceptLanguage = req.headers['accept-language'] || '';
  
  return crypto
    .createHash('sha256')
    .update(`${ip}-${userAgent}-${acceptLanguage}`)
    .digest('hex')
    .substring(0, 16);
}

/**
 * 获取用户使用记录
 */
function getUserUsage(userFingerprint) {
  const today = new Date().toDateString();
  const userKey = `${userFingerprint}-${today}`;
  
  if (!userUsage.has(userKey)) {
    userUsage.set(userKey, {
      dailyCount: 0,
      hourlyCount: {},
      createdAt: Date.now(),
    });
  }
  
  return userUsage.get(userKey);
}

/**
 * 更新用户使用记录
 */
function updateUserUsage(userFingerprint) {
  const today = new Date().toDateString();
  const hour = new Date().getHours();
  const userKey = `${userFingerprint}-${today}`;
  
  const usage = getUserUsage(userFingerprint);
  usage.dailyCount += 1;
  usage.hourlyCount[hour] = (usage.hourlyCount[hour] || 0) + 1;
  
  userUsage.set(userKey, usage);
  return usage;
}

/**
 * 检查用户限制
 */
function checkUserLimits(userFingerprint) {
  const usage = getUserUsage(userFingerprint);
  const hour = new Date().getHours();
  const hourlyCount = usage.hourlyCount[hour] || 0;

  return {
    dailyExceeded: usage.dailyCount >= CONFIG.FREE_LIMIT,
    hourlyExceeded: hourlyCount >= CONFIG.RATE_LIMIT,
    remainingDaily: Math.max(0, CONFIG.FREE_LIMIT - usage.dailyCount),
    remainingHourly: Math.max(0, CONFIG.RATE_LIMIT - hourlyCount),
    dailyCount: usage.dailyCount,
  };
}

/**
 * 验证请求来源
 */
function validateOrigin(req) {
  const origin = req.headers.origin || req.headers.referer;
  
  // 开发环境允许所有localhost请求
  if (!origin) return true;
  
  return CONFIG.ALLOWED_ORIGINS.some(allowedOrigin => 
    origin.startsWith(allowedOrigin)
  );
}

/**
 * 内容安全检查
 */
function validateContent(messages) {
  // 检查消息数量
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('消息格式无效');
  }
  
  if (messages.length > 20) {
    throw new Error('消息历史过长');
  }
  
  // 检查消息内容长度
  const totalLength = messages.reduce((sum, msg) => 
    sum + (msg.content || '').length, 0
  );
  
  if (totalLength > 10000) {
    throw new Error('消息内容过长');
  }
  
  return true;
}

/**
 * 清理过期数据
 */
function cleanupExpiredData() {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  for (const [key, value] of userUsage.entries()) {
    if (now - value.createdAt > oneDayMs) {
      userUsage.delete(key);
    }
  }
}

/**
 * 主处理函数
 */
export default async function handler(req, res) {
  try {
    // 定期清理过期数据
    if (Math.random() < 0.01) { // 1%的概率执行清理
      cleanupExpiredData();
    }

    // CORS预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Origin');
      res.setHeader('Access-Control-Max-Age', '86400');
      return res.status(200).end();
    }

    // 只允许POST请求
    if (req.method !== 'POST') {
      return res.status(405).json({
        error: 'METHOD_NOT_ALLOWED',
        message: '只支持POST请求'
      });
    }

    // 验证请求来源
    if (!validateOrigin(req)) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: '请求来源不被允许'
      });
    }

    // 检查API密钥配置
    if (!CONFIG.DEEPSEEK_API_KEY) {
      console.error('DEEPSEEK_API_KEY 未配置');
      return res.status(500).json({
        error: 'SERVICE_UNAVAILABLE',
        message: '服务暂时不可用，请稍后重试'
      });
    }

    // 生成用户指纹
    const userFingerprint = generateUserFingerprint(req);
    
    // 检查使用限制
    const limits = checkUserLimits(userFingerprint);
    
    if (limits.dailyExceeded) {
      return res.status(429).json({
        error: 'DAILY_LIMIT_EXCEEDED',
        message: '今日免费次数已用完，请配置您的API密钥或明天再试',
        remainingCount: 0,
        totalFreeCount: CONFIG.FREE_LIMIT,
        resetTime: new Date(Date.now() + 24*60*60*1000).toISOString()
      });
    }

    if (limits.hourlyExceeded) {
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: '请求过于频繁，请稍后再试',
        remainingCount: limits.remainingDaily,
        totalFreeCount: CONFIG.FREE_LIMIT,
        resetTime: new Date(Date.now() + 60*60*1000).toISOString()
      });
    }

    // 解析请求体
    const { messages, model = 'deepseek-chat', max_tokens, temperature, ...otherOptions } = req.body;
    
    // 验证请求内容
    validateContent(messages);
    
    // 构建请求到DeepSeek
    const deepseekRequest = {
      model,
      messages,
      max_tokens: Math.min(max_tokens || 2000, CONFIG.MAX_TOKENS),
      temperature: Math.max(0, Math.min(temperature || 0.7, 1)),
      stream: false, // 暂不支持流式响应
    };

    console.log(`用户 ${userFingerprint} 发起请求，剩余次数: ${limits.remainingDaily}`);

    // 调用DeepSeek API
    const response = await fetch(CONFIG.DEEPSEEK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.DEEPSEEK_API_KEY}`,
        'User-Agent': 'AI-Chat-Proxy/1.0',
      },
      body: JSON.stringify(deepseekRequest),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error(`DeepSeek API错误 ${response.status}:`, errorText);
      
      let errorMessage = '服务暂时不可用，请稍后重试';
      if (response.status === 401) {
        errorMessage = 'API密钥无效';
      } else if (response.status === 429) {
        errorMessage = 'API请求频率过高，请稍后重试';
      } else if (response.status === 400) {
        errorMessage = '请求参数错误';
      }
      
      return res.status(response.status).json({
        error: 'UPSTREAM_ERROR',
        message: errorMessage,
      });
    }

    const data = await response.json();
    
    // 验证响应格式
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('API响应格式无效');
    }

    // 更新用户使用记录
    const updatedUsage = updateUserUsage(userFingerprint);
    const newLimits = checkUserLimits(userFingerprint);

    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Origin');

    // 返回响应，添加使用统计信息
    return res.status(200).json({
      ...data,
      usage: {
        ...data.usage,
        remainingCount: newLimits.remainingDaily,
        totalFreeCount: CONFIG.FREE_LIMIT,
        dailyUsed: newLimits.dailyCount,
      },
    });

  } catch (error) {
    console.error('代理服务错误:', error);
    
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Origin');
    
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: error.message || '服务暂时不可用，请稍后重试',
    });
  }
}
