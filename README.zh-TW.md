# LLM 聊天應用程式範本

> 其他語言：[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md)

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

#### 核心功能

- 💬 簡單且響應式的聊天介面
- ⚡ 支援 SSE 串流回應
- 🧠 由 Cloudflare Workers AI LLMs 驅動
- 🛠️ 使用 TypeScript 與 Cloudflare Workers 開發
- 📱 行動裝置友善設計
- 🔄 客戶端維護聊天紀錄

#### 強化功能

- 🌏 **多語言支援**：五國語言介面與 AI prompt（英文、繁中、簡中、日文、韓文）
- 🌐 **智慧語言偵測**：自動偵測瀏覽器語言
- 🌙 **深色模式**：亮色/深色主題切換
- 📝 **Markdown 支援**：完整的 markdown 渲染
- 🏷️ **訊息標籤**：清楚的使用者/AI 訊息識別
- 🚨 **Toast 提示**：不干擾的錯誤訊息
- ⏹️ **串流取消**：停止按鈕可中止 AI 生成
- 📊 **即時指標**：即時 token 計數與生成速度（tokens/s）
- ⚡ **智能緩衝**：優化的 UI 更新（50ms 批次處理）實現 60+ FPS 流暢效能
- 📄 **多語言文件**：5 種語言的 README 文件

### 快速開始

#### 先決條件

- [Node.js](https://nodejs.org/)（v18 或更新）
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- 擁有 Workers AI 權限的 Cloudflare 帳號

#### 安裝

1. 下載本專案：

   ```bash
   git clone http://github.com/anomixer/llm-chat-app-template
   cd llm-chat-app-template
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
2. **串流**：使用 SSE 即時串流 AI 回應，使用 `stream: true` 參數
3. **Workers AI 綁定**：連接 Cloudflare AI 服務

#### 前端

前端為簡單的 HTML/CSS/JavaScript 應用：

1. 呈現多語言支援的聊天介面
2. 傳送使用者訊息到 API
3. 即時處理 SSE 串流回應
4. 實現智能緩衝（50ms）以減少 DOM 更新
5. 顯示即時 token 指標與生成速度
6. 支援透過 AbortController 取消串流
7. 客戶端維護聊天紀錄

### 效能

| 指標 | 數值 |
|--------|-------|
| **UI 更新頻率** | 每 50ms 批次處理（vs. 每 token） |
| **DOM 操作** | 減少 99%+ |
| **幀率** | 穩定 60+ FPS |
| **串流取消** | 透過 AbortController 即時取消 |
| **記憶體效率** | 智能緩衝防止記憶體尖峰 |

### 客製化

#### 更換模型

如需更換 AI 模型，請修改 `src/index.ts` 的 `MODEL_ID` 常數。可用模型請參考 [Cloudflare Workers AI 文件](https://developers.cloudflare.com/workers-ai/models/)。

```typescript
const MODEL_ID = "@hf/google/gemma-7b-it"; // 修改這裡
```

#### 使用 AI Gateway

本範本已包含 AI Gateway 整合註解，可提供流量控管、快取、分析等功能。

啟用方式：

1. 於 Cloudflare 後台建立 AI Gateway
2. 取消註解 `src/index.ts` 內的 gateway 設定
3. 將 `YOUR_GATEWAY_ID` 替換為實際 Gateway ID
4. 其他選項可依需求調整

詳見 [AI Gateway 文件](https://developers.cloudflare.com/ai-gateway/)。

#### 修改系統提示

系統提示會根據使用者語言自動本地化。更新 `public/chat.js` 中的 `SYSTEM_PROMPT` 物件：

```javascript
const SYSTEM_PROMPT = {
  en: "You are a helpful, friendly assistant...",
  "zh-TW": "你是一個樂於助人且友善的助理...",
  // 新增更多語言
};
```

#### 調整 UI 更新頻率

修改 `public/chat.js` 中的緩衝間隔：

```javascript
const updateInterval = 50; // 毫秒（預設：50ms）
```

較低數值 = 更頻繁更新（較高 CPU 使用率）  
較高數值 = 較少更新（更流暢但較不即時）

#### 樣式調整

UI 樣式寫於 `public/index.html` 的 `<style>` 區塊。可直接調整 CSS 變數。

### 進階功能

#### 串流取消

使用者可在 AI 生成期間點擊停止按鈕（⏹️）來取消串流。這是透過 `AbortController` 實現：

```javascript
const abortController = new AbortController();
fetch('/api/chat', { signal: abortController.signal });
// 稍後：abortController.abort();
```

#### 即時指標

應用程式顯示：
- **Token 計數**：已生成的 token 數量
- **生成速度**：即時每秒 token 數

這些指標在客戶端從串流數據中計算。

### 相關資源

- [Cloudflare Workers 文件](https://developers.cloudflare.com/workers/)
- [Cloudflare Workers AI 文件](https://developers.cloudflare.com/workers-ai/)
- [Workers AI 模型](https://developers.cloudflare.com/workers-ai/models/)
- [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

---

本專案由 [Cursor](https://github.com/cursor/cursor) AI 協助優化
