# 🚀 快速部署指南

## 立即获取 DeepSeek API 密钥

### 1. 访问 DeepSeek 平台
打开浏览器访问：[https://platform.deepseek.com](https://platform.deepseek.com)

### 2. 注册/登录账号
- 使用邮箱或手机号注册
- 完成邮箱验证

### 3. 获取 API 密钥
1. 登录后进入控制台
2. 点击左侧菜单 "API Keys"
3. 点击 "Create API Key"
4. 复制生成的密钥（格式类似：`sk-xxxxxxxxxxxxxxxx`）

### 4. 在 Vercel 中设置环境变量
1. 回到 Vercel 项目设置页面
2. Settings → Environment Variables
3. 添加新变量：
   - **Name**: `DEEPSEEK_API_KEY`
   - **Value**: 刚才复制的 API 密钥
   - **Environments**: 选择 Production 和 Preview

### 5. 重新部署
设置完环境变量后，Vercel 会自动重新部署。

## 🎯 验证部署成功

部署完成后：
1. 访问你的 Vercel 应用地址
2. 尝试发送一条消息测试 AI 对话
3. 检查右下角是否显示剩余免费次数

## 🔗 重要链接

- **你的应用地址**: 在 Vercel 项目页面的 "Visit" 按钮
- **DeepSeek 控制台**: [https://platform.deepseek.com](https://platform.deepseek.com)
- **Vercel 项目设置**: 你当前打开的页面

---
*如果遇到问题，检查 Vercel 的 "Functions" 标签页查看错误日志*
