# LLM 聊天應用程式範本

一個簡單、可立即部署的聊天應用程式範本，基於 Cloudflare Workers AI。這個範本提供了建立支援串流回應的 AI 聊天應用的乾淨起點。

[![部署到 Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/llm-chat-app-template)

<!-- dash-content-start -->

### 示範

本範本展示如何使用 Cloudflare Workers AI 建立支援串流回應的 AI 聊天介面。特色如下：

- 使用 Server-Sent Events (SSE) 即時串流 AI 回應
- 模型與系統提示可輕鬆自訂
- 支援 AI Gateway 整合
- 乾淨、響應式 UI，支援手機與桌機

### 特色

- 💬 簡單且響應式的聊天介面
- ⚡ 支援 SSE 串流回應
- 🧠 由 Cloudflare Workers AI LLMs 驅動
- 🛠️ 使用 TypeScript 與 Cloudflare Workers 開發
- 📱 行動裝置友善設計
- 🔄 客戶端維護聊天紀錄
<!-- dash-content-end -->

### 快速開始

#### 先決條件

- [Node.js](https://nodejs.org/)（v18 或更新）
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- 擁有 Workers AI 權限的 Cloudflare 帳號

#### 安裝

1. 下載本專案：

   ```bash
   git clone https://github.com/cloudflare/templates.git
   cd templates/llm-chat-app
   ```

2. 安裝相依套件：

   ```bash
   npm install
   ```

3. 產生 Worker 型別定義：
   ```bash
   npm run cf-typegen
   ```

#### 開發

啟動本地開發伺服器：

```bash
npm run dev
```

伺服器將於 http://localhost:8787 啟動。

注意：即使在本地開發時，使用 Workers AI 也會連線到你的 Cloudflare 帳號並產生費用。

#### 部署

部署到 Cloudflare Workers：

```bash
npm run deploy
```

### 專案結構

```
/
├── public/             # 靜態資源
│   ├── index.html      # 聊天 UI HTML
│   └── chat.js         # 前端腳本
├── src/
│   ├── index.ts        # Worker 入口
│   └── types.ts        # TypeScript 型別定義
├── test/               # 測試檔案
├── wrangler.jsonc      # Cloudflare Worker 設定
├── tsconfig.json       # TypeScript 設定
└── README.md           # 本文件
```

### 運作原理

#### 後端

後端以 Cloudflare Workers 建構，並透過 Workers AI 平台產生回應。主要組件如下：

1. **API 端點**（`/api/chat`）：接受 POST 請求並串流回應
2. **串流**：使用 SSE 即時串流 AI 回應
3. **Workers AI 綁定**：連接 Cloudflare AI 服務

#### 前端

前端為簡單的 HTML/CSS/JavaScript 應用：

1. 呈現聊天介面
2. 傳送使用者訊息到 API
3. 即時處理串流回應
4. 客戶端維護聊天紀錄

### 客製化

#### 更換模型

如需更換 AI 模型，請修改 `src/index.ts` 的 `MODEL_ID` 常數。可用模型請參考 [Cloudflare Workers AI 文件](https://developers.cloudflare.com/workers-ai/models/)。

#### 使用 AI Gateway

本範本已包含 AI Gateway 整合註解，可提供流量控管、快取、分析等功能。

啟用方式：

1. 於 Cloudflare 後台建立 AI Gateway
2. 取消註解 `src/index.ts` 內的 gateway 設定
3. 將 `YOUR_GATEWAY_ID` 替換為實際 Gateway ID
4. 其他選項可依需求調整

詳見 [AI Gateway 文件](https://developers.cloudflare.com/ai-gateway/)。

#### 修改系統提示

可於 `src/index.ts` 修改 `SYSTEM_PROMPT` 常數。

#### 樣式調整

UI 樣式寫於 `public/index.html` 的 `<style>` 區塊。可直接調整 CSS 變數。

### 相關資源

- [Cloudflare Workers 文件](https://developers.cloudflare.com/workers/)
- [Cloudflare Workers AI 文件](https://developers.cloudflare.com/workers-ai/)
- [Workers AI 模型](https://developers.cloudflare.com/workers-ai/models/) 