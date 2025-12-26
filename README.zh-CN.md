# LLM 聊天应用模板

> 其他语言：[English](README.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md)

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

#### 核心功能

- 💬 简单且响应式的聊天界面
- ⚡ 支持 SSE 流式响应
- 🧠 由 Cloudflare Workers AI LLMs 驱动
- 🛠️ 使用 TypeScript 与 Cloudflare Workers 开发
- 📱 移动端友好设计
- 🔄 客户端维护聊天记录

#### 增强功能

- 🌏 **多语言支持**：五国语言界面与 AI prompt（英文、繁中、简中、日文、韩文）
- 🌐 **智能语言检测**：自动检测浏览器语言
- 🌙 **深色模式**：亮色/深色主题切换
- 📝 **Markdown 支持**：完整的 markdown 渲染
- 🏷️ **消息标签**：清晰的用户/AI 消息识别
- 🚨 **Toast 通知**：非侵入式错误消息
- ⏹️ **流式取消**：停止按钮可中止 AI 生成
- 📊 **实时指标**：即时 token 计数与生成速度（tokens/s）
- ⚡ **智能缓冲**：优化的 UI 更新（50ms 批处理）实现 60+ FPS 流畅性能
- 📄 **多语言文档**：5 种语言的 README 文件

### 快速开始

#### 前置条件

- [Node.js](https://nodejs.org/)（v18 或更高）
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- 拥有 Workers AI 权限的 Cloudflare 账号

#### 安装

1. 克隆本仓库：

   ```bash
   git clone http://github.com/anomixer/llm-chat-app-template
   cd llm-chat-app-template
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

后端使用 Cloudflare Workers 构建，通过 Workers AI 平台生成响应。主要组件：

1. **API 端点**（`/api/chat`）：接受 POST 请求并流式响应
2. **流式传输**：使用 SSE 实时流式 AI 响应，带 `stream: true` 参数
3. **Workers AI 绑定**：连接 Cloudflare AI 服务

#### 前端

前端是简单的 HTML/CSS/JavaScript 应用：

1. 呈现多语言支持的聊天界面
2. 向 API 发送用户消息
3. 实时处理 SSE 流式响应
4. 实现智能缓冲（50ms）以减少 DOM 更新
5. 显示实时 token 指标和生成速度
6. 通过 AbortController 支持流式取消
7. 客户端维护聊天记录

### 性能

| 指标 | 数值 |
|--------|-------|
| **UI 更新频率** | 每 50ms 批处理（vs. 每 token） |
| **DOM 操作** | 减少 99%+ |
| **帧率** | 稳定 60+ FPS |
| **流式取消** | 通过 AbortController 即时取消 |
| **内存效率** | 智能缓冲防止内存峰值 |

### 自定义

#### 更改模型

要使用不同的 AI 模型，请更新 `src/index.ts` 中的 `MODEL_ID` 常量。可用模型请参考 [Cloudflare Workers AI 文档](https://developers.cloudflare.com/workers-ai/models/)。

```typescript
const MODEL_ID = "@hf/google/gemma-7b-it"; // 修改这里
```

#### 使用 AI Gateway

模板包含 AI Gateway 集成的注释代码，可提供流量控制、缓存、分析等功能。

启用方法：

1. 在 Cloudflare 控制台创建 AI Gateway
2. 取消注释 `src/index.ts` 中的 gateway 配置
3. 将 `YOUR_GATEWAY_ID` 替换为实际 Gateway ID
4. 根据需要配置其他选项

详见 [AI Gateway 文档](https://developers.cloudflare.com/ai-gateway/)。

#### 修改系统提示

系统提示会根据用户语言自动本地化。更新 `public/chat.js` 中的 `SYSTEM_PROMPT` 对象：

```javascript
const SYSTEM_PROMPT = {
  en: "You are a helpful, friendly assistant...",
  "zh-CN": "你是一个乐于助人且友善的助手...",
  // 添加更多语言
};
```

#### 调整 UI 更新频率

修改 `public/chat.js` 中的缓冲间隔：

```javascript
const updateInterval = 50; // 毫秒（默认：50ms）
```

较低值 = 更频繁更新（较高 CPU 使用率）  
较高值 = 较少更新（更流畅但不太实时）

#### 样式调整

UI 样式包含在 `public/index.html` 的 `<style>` 部分。可以修改顶部的 CSS 变量来快速更改配色方案。

### 高级功能

#### 流式取消

用户可在 AI 生成期间点击停止按钮（⏹️）来取消流。这是通过 `AbortController` 实现的：

```javascript
const abortController = new AbortController();
fetch('/api/chat', { signal: abortController.signal });
// 稍后：abortController.abort();
```

#### 实时指标

应用显示：
- **Token 计数**：已生成的 token 数量
- **生成速度**：实时每秒 token 数

这些指标在客户端从流数据中计算。

### 参考资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare Workers AI 文档](https://developers.cloudflare.com/workers-ai/)
- [Workers AI 模型](https://developers.cloudflare.com/workers-ai/models/)
- [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

---

本项目由 [Cursor](https://github.com/cursor/cursor) AI 协助优化
