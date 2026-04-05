# Railway 部署指南

## 快速开始

### 1. 准备工作

确保你已安装:
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Node.js](https://nodejs.org/) 20+

```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录 Railway
railway login
```

### 2. 创建 Railway 项目

```bash
# 在项目根目录初始化 Railway 项目
railway init --name openstock
```

### 3. 添加 MongoDB 服务

在 Railway Dashboard 中:
1. 点击 "New" → "Database" → "Add MongoDB"
2. 或使用 MongoDB Atlas (推荐生产环境)

### 4. 配置环境变量

在 Railway Dashboard → 你的项目 → Variables 中添加:

**必需变量:**
```
NODE_ENV=production
MONGODB_URI=${{MongoDB.MONGO_URL}}  # Railway MongoDB 自动注入
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=<部署后生成的域名>
NEXT_PUBLIC_FINNHUB_API_KEY=<从 https://finnhub.io 获取>
FINNHUB_BASE_URL=https://finnhub.io/api/v1
AI_PROVIDER=gemini
GEMINI_API_KEY=<从 https://ai.google.dev 获取>
```

**可选变量:**
```
NODEMAILER_EMAIL=<Gmail 地址>
NODEMAILER_PASSWORD=<Gmail App Password>
INNGEST_SIGNING_KEY=<从 https://app.inngest.com 获取>
INNGEST_EVENT_KEY=<从 https://app.inngest.com 获取>
```

### 5. 部署

```bash
# 部署到 Railway
railway up

# 查看日志
railway logs

# 查看状态
railway status
```

### 6. 配置域名和认证

部署后:
1. 在 Railway Dashboard → Settings → Domains 查看生成的域名
2. 更新 `BETTER_AUTH_URL` 为实际域名
3. 重新部署: `railway up`

## 外部资源申请清单

| 服务 | 用途 | 申请地址 | 优先级 |
|------|------|----------|--------|
| **Finnhub API** | 股票数据 | https://finnhub.io/dashboard | 必需 |
| **Google AI Studio** | AI 邮件生成 | https://aistudio.google.com/app/apikey | 必需 |
| **Gmail** | SMTP 邮件 | https://myaccount.google.com/apppasswords | 推荐 |
| **Inngest** | 后台任务 | https://app.inngest.com | 推荐 |
| **MongoDB Atlas** | 云端数据库 | https://mongodb.com/atlas | 可选 |
| **Kit** | 邮件营销 | https://kit.com | 可选 |
| **Adanos** | 情感分析 | https://adanos.org | 可选 |

## 验证部署

部署完成后，访问以下地址检查:

1. **健康检查**: `https://your-app.railway.app/api/health`
   - 应返回 `{"status": "healthy", ...}`

2. **首页**: `https://your-app.railway.app/`
   - 应正常显示应用首页

3. **注册/登录**: 测试用户认证功能

4. **股票搜索**: 测试搜索股票功能

## 故障排查

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 构建失败 | Node 版本问题 | 检查 Dockerfile 使用 node:20 |
| 数据库连接失败 | MONGODB_URI 错误 | 检查 Railway MongoDB 连接字符串 |
| 认证失败 | BETTER_AUTH_URL 不匹配 | 确保与部署域名完全一致 |
| 500 错误 | 缺少环境变量 | 检查必需变量是否全部配置 |
| 后台任务不执行 | Inngest 未配置 | 在 Inngest Dashboard 添加 Railway 域名 |

## 费用预估

**免费档配置 (足够个人使用):**
- Railway App: 500 小时/月 (~$0)
- Railway MongoDB: 500MB (~$0) 或使用 MongoDB Atlas 免费档
- Finnhub API: 60 calls/minute (免费)
- Gemini API: 免费档 (足够邮件生成)
- Inngest: 免费档

**月费用: $0**

**生产环境配置:**
- Railway App: $5/月 (1GB RAM, 1vCPU)
- Railway MongoDB: $5/月 或 MongoDB Atlas M10
- 总计: ~$10-15/月

## 更新部署

```bash
# 拉取最新代码后
git pull origin main

# 重新部署
railway up
```
