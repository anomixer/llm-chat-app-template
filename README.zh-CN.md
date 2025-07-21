# LLM 聊天应用模板

一个简单、可即刻部署的聊天应用模板，基于 Cloudflare Workers AI。该模板为构建支持流式响应的 AI 聊天应用提供了干净的起点。

[![部署到 Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/llm-chat-app-template)

<!-- dash-content-start -->

### 演示

本模板演示如何使用 Cloudflare Workers AI 构建支持流式响应的 AI 聊天界面。主要特性：

- 使用 Server-Sent Events (SSE) 实时流式 AI 响应
- 模型和系统提示可轻松自定义
- 支持 AI Gateway 集成
- 干净、响应式 UI，适配移动与桌面

### 特性

- 💬 简单且响应式的聊天界面
- ⚡ 支持 SSE 流式响应
- 🧠 由 Cloudflare Workers AI LLMs 驱动
- 🛠️ 使用 TypeScript 与 Cloudflare Workers 开发
- 📱 移动端友好设计
- 🔄 客户端维护聊天记录
<!-- dash-content-end -->

### 快速开始

#### 前置条件

- [Node.js](https://nodejs.org/)（v18 或更高）
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- 拥有 Workers AI 权限的 Cloudflare 账号

#### 安装

1. 克隆本仓库：

   ```bash
   git clone https://github.com/cloudflare/templates.git
   cd templates/llm-chat-app
   ```

2. 安装依赖：

   ```bash
   npm install
   ```

3. 生成 Worker 类型定义：
   ```bash
   npm run cf-typegen
   ```

#### 开发

启动本地开发服务器：

```bash
npm run dev
```

服务器将在 http://localhost:8787 启动。

注意：即使在本地开发时，使用 Workers AI 也会连接到你的 Cloudflare 账号并产生费用。

#### 部署

部署到 Cloudflare Workers：

```bash
npm run deploy
```

### 项目结构

```
/
├── public/             # 静态资源
│   ├── index.html      # 聊天 UI HTML
│   └── chat.js         # 前端脚本
├── src/
│   ├── index.ts        # Worker 入口
│   └── types.ts        # TypeScript 类型定义
├── test/               # 测试文件
├── wrangler.jsonc      # Cloudflare Worker 配置
├── tsconfig.json       # TypeScript 配置
└── README.md           # 本文档
```

### 工作原理

#### 后端

后端基于 Cloudflare Workers 构建，并通过 Workers AI 平台生成响应。主要组件如下：

1. **API 端点**（`/api/chat`）：接受 POST 请求并流式响应
2. **流式**：使用 SSE 实时流式 AI 响应
3. **Workers AI 绑定**：连接 Cloudflare AI 服务

#### 前端

前端为简单的 HTML/CSS/JavaScript 应用：

1. 呈现聊天界面
2. 发送用户消息到 API
3. 实时处理流式响应
4. 客户端维护聊天记录

### 个性化

#### 更换模型

如需更换 AI 模型，请修改 `src/index.ts` 的 `MODEL_ID` 常量。可用模型请参考 [Cloudflare Workers AI 文档](https://developers.cloudflare.com/workers-ai/models/)。

#### 使用 AI Gateway

本模板已包含 AI Gateway 集成注释，可提供流量管控、缓存、分析等功能。

启用方式：

1. 在 Cloudflare 控制台创建 AI Gateway
2. 取消注释 `src/index.ts` 内的 gateway 配置
3. 将 `YOUR_GATEWAY_ID` 替换为实际 Gateway ID
4. 其他选项可按需调整

详见 [AI Gateway 文档](https://developers.cloudflare.com/ai-gateway/)。

#### 修改系统提示

可在 `src/index.ts` 修改 `SYSTEM_PROMPT` 常量。

#### 样式调整

UI 样式写在 `public/index.html` 的 `<style>` 区块。可直接调整 CSS 变量。

### 相关资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare Workers AI 文档](https://developers.cloudflare.com/workers-ai/)
- [Workers AI 模型](https://developers.cloudflare.com/workers-ai/models/) 