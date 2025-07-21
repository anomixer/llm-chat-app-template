# Project Context & Change Log

## 專案結構（2024-07）

```
llm-chat-app-template/
├── context.md                # 專案歷史與強化紀錄
├── README.md                 # 英文主說明
├── README.zh-TW.md           # 繁體中文說明
├── README.zh-CN.md           # 簡體中文說明
├── README.ja.md              # 日文說明
├── README.ko.md              # 韓文說明
├── wrangler.jsonc            # Cloudflare Worker 設定
├── worker-configuration.d.ts # Worker 型別定義
├── tsconfig.json             # TypeScript 設定
├── package.json              # 專案依賴
├── package-lock.json         # 依賴鎖定
├── public/
│   ├── index.html            # 前端 HTML + CSS
│   └── chat.js               # 前端 JS（UI/多語/主題/markdown/錯誤提示等）
└── src/
    ├── index.ts              # Worker 入口（API, SSE, AI prompt）
    └── types.ts              # 型別定義
```

---

## 專案歷程與強化（完整 context）

- **最初為 Cloudflare 官方 LLM Chat App Template，僅英文、單一主題、無多語/markdown/錯誤提示。**
- 逐步強化如下：
  1. **多語支援**：UI、AI prompt、README 全面支援英文、繁中、簡中、日文、韓文，並可一鍵切換。
  2. **自動偵測瀏覽器語言**：初次載入自動切換 UI 與 AI 語言。
  3. **深色主題切換**：預設 dark mode，支援主題切換按鈕。
  4. **語言切換按鈕 icon**：顯示 EN, TW, CN, JP, KO。
  5. **Markdown 支援**：對話內容可用 markdown 語法，前端用 marked.js 解析。
  6. **User/AI 標籤**：每則訊息上方顯示 User: 或 AI:，多語自動切換。
  7. **錯誤 toast 提示**：API 錯誤只用紅色提示條顯示，不進對話框。
  8. **AI 歡迎訊息**：永遠為第一行，且不進 chatHistory。
  9. **README 多語分檔**：主檔為英文，其他語言分檔，clone 指令改為 anomixer repo。
  10. **README 新增 Enhanced Features/強化功能 小節，並於最下方致謝 Cursor AI。**
  11. **context.md**：完整記錄專案所有重要調整，供未來維護、升級、回顧時參考。

---

## 目標

- 讓專案多語、現代化、易用、易維護，並明確標示 AI 助理協作痕跡。
- 任何人只要看 context.md 就能快速了解本專案的全貌與歷史。

---

> 以後你只要打開 `context.md` 或這份整理，就能喚回所有專案 context，不怕健忘！
如需補充細節、記錄新變更，隨時可以再加進來！ 