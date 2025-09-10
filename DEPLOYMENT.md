# 🚀 部署指南

本指南将帮助您将AI聊天网站部署到Vercel，实现免费AI对话服务。

## 📋 前提条件

1. **DeepSeek API密钥**: 在 [platform.deepseek.com](https://platform.deepseek.com) 注册并获取API密钥
2. **Vercel账号**: 在 [vercel.com](https://vercel.com) 注册免费账号
3. **GitHub仓库**: 将项目代码推送到GitHub仓库

## 🎯 部署步骤

### 1. 准备项目

```bash
# 1. 克隆或下载项目到本地
git clone <your-repo-url>
cd AI-WEB

# 2. 安装Vercel CLI（如果还没安装）
npm install -g vercel

# 3. 登录Vercel
vercel login
```

### 2. 配置环境变量

在项目根目录创建 `.env.local` 文件：

```bash
# 复制示例文件
cp env.example .env.local

# 编辑文件，填入您的DeepSeek API密钥
DEEPSEEK_API_KEY=your_actual_deepseek_api_key_here
```

### 3. 部署到Vercel

#### 方法一：通过CLI部署

```bash
# 在项目根目录执行
vercel

# 首次部署会询问配置，按提示操作：
# ? Set up and deploy "AI-WEB"? [Y/n] y
# ? Which scope do you want to deploy to? [选择您的账号]
# ? Link to existing project? [N/y] n
# ? What's your project's name? ai-chat-website
# ? In which directory is your code located? ./

# 部署完成后，设置环境变量
vercel env add DEEPSEEK_API_KEY
# 输入您的DeepSeek API密钥

# 重新部署以应用环境变量
vercel --prod
```

#### 方法二：通过GitHub集成

1. 访问 [vercel.com/dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 选择您的GitHub仓库
4. 配置项目：
   - Framework Preset: Other
   - Root Directory: `./`
   - Build Command: (留空)
   - Output Directory: (留空)
5. 添加环境变量：
   - Name: `DEEPSEEK_API_KEY`
   - Value: 您的DeepSeek API密钥
6. 点击 "Deploy"

### 4. 更新前端配置

部署完成后，需要更新前端代码中的API端点地址：

```javascript
// 在 scripts/api.js 中找到免费服务配置
free: {
  name: '🎁 免费体验（由DeepSeek提供支持）',
  endpoint: window.location.origin + '/api/chat', // 自动获取当前域名
  // ... 其他配置
}
```

然后重新部署：

```bash
vercel --prod
```

## 🔧 配置选项

### 环境变量说明

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `DEEPSEEK_API_KEY` | ✅ | - | DeepSeek API密钥 |
| `ALLOWED_ORIGINS` | ❌ | * | 允许的访问域名，多个用逗号分隔 |
| `FREE_DAILY_LIMIT` | ❌ | 20 | 每日免费对话次数 |
| `RATE_LIMIT_PER_HOUR` | ❌ | 10 | 每小时请求限制 |
| `MAX_TOKENS_LIMIT` | ❌ | 4000 | 单次请求最大token数 |

### 自定义域名

1. 在Vercel项目设置中添加自定义域名
2. 更新DNS记录指向Vercel
3. 更新前端代码中的API端点地址

## 📊 监控和管理

### 查看使用统计

```bash
# 查看函数调用统计
vercel logs --follow

# 查看项目信息
vercel ls
```

### 成本控制

1. **设置告警**: 在DeepSeek控制台设置API使用告警
2. **监控日志**: 定期检查Vercel函数日志
3. **限制配置**: 根据需要调整每日免费次数和频率限制

## 🛡️ 安全建议

1. **API密钥安全**:
   - 不要在代码中硬编码API密钥
   - 使用Vercel环境变量存储敏感信息
   - 定期轮换API密钥

2. **访问控制**:
   - 设置CORS白名单
   - 启用Vercel的DDoS保护
   - 监控异常请求

3. **成本控制**:
   - 设置合理的使用限制
   - 监控API使用量
   - 考虑添加用户认证

## 🔄 更新部署

当您更新代码时：

```bash
# 推送到GitHub（如果使用GitHub集成）
git add .
git commit -m "Update features"
git push origin main

# 或者直接通过CLI部署
vercel --prod
```

## 🐛 故障排除

### 常见问题

1. **API密钥错误**:
   ```
   错误: DEEPSEEK_API_KEY 未配置
   解决: 检查环境变量配置
   ```

2. **CORS错误**:
   ```
   错误: 请求来源不被允许
   解决: 更新ALLOWED_ORIGINS环境变量
   ```

3. **函数超时**:
   ```
   错误: Function execution timed out
   解决: 检查API响应时间，考虑增加超时时间
   ```

### 调试方法

```bash
# 查看实时日志
vercel logs --follow

# 本地测试
vercel dev

# 检查环境变量
vercel env ls
```

## 📞 技术支持

如果遇到问题：

1. 查看 [Vercel文档](https://vercel.com/docs)
2. 检查 [DeepSeek API文档](https://platform.deepseek.com/docs)
3. 查看项目的GitHub Issues
4. 联系技术支持

---

🎉 **恭喜！您的AI聊天网站已成功部署！**

用户现在可以直接访问您的网站，无需配置API密钥即可体验AI对话功能。
