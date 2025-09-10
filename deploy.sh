#!/bin/bash

# AI-WEB Vercel 部署脚本
# 自动化部署流程，确保配置正确

echo "🚀 开始部署 AI-WEB 到 Vercel..."

# 检查 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装，正在安装..."
    npm install -g vercel
fi

# 登录检查
echo "🔐 检查 Vercel 登录状态..."
if ! vercel whoami &> /dev/null; then
    echo "请先登录 Vercel:"
    vercel login
fi

# 检查环境变量
echo "🔧 检查环境变量配置..."
if ! vercel env ls | grep -q "DEEPSEEK_API_KEY"; then
    echo "⚠️  DEEPSEEK_API_KEY 未配置"
    echo "请输入您的 DeepSeek API 密钥:"
    vercel env add DEEPSEEK_API_KEY
else
    echo "✅ DEEPSEEK_API_KEY 已配置"
fi

# 部署到生产环境
echo "📦 开始部署..."
vercel --prod

# 获取部署URL
DEPLOY_URL=$(vercel ls --scope=$(vercel whoami) | grep -E "ai-.*\.vercel\.app" | head -1 | awk '{print $2}')

if [ ! -z "$DEPLOY_URL" ]; then
    echo "🎉 部署成功！"
    echo "📱 访问地址: https://$DEPLOY_URL"
    echo ""
    echo "📋 后续步骤:"
    echo "1. 访问您的网站测试功能"
    echo "2. 检查免费对话是否正常工作"
    echo "3. 如有问题，查看 Vercel 控制台日志"
    echo ""
    echo "🔍 查看日志命令: vercel logs --follow"
else
    echo "❌ 无法获取部署URL，请手动检查"
fi
