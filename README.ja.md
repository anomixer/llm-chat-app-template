# LLM チャットアプリケーション テンプレート

> 他の言語：[English](README.md) | [繁體中文](README.zh-TW.md) | [简体中文](README.zh-CN.md) | [한국어](README.ko.md)

Cloudflare Workers AI を活用した、すぐにデプロイ可能なシンプルなチャットアプリのテンプレートです。ストリーミング応答に対応した AI チャットアプリを構築するためのクリーンな出発点を提供します。

[![Cloudflare へデプロイ](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/llm-chat-app-template)

<!-- dash-content-start -->

### デモ

このテンプレートは、Cloudflare Workers AI を使ったストリーミング応答対応の AI チャットインターフェースの構築方法を示します。主な特徴：

- Server-Sent Events (SSE) による AI 応答のリアルタイムストリーミング
- モデルやシステムプロンプトの簡単カスタマイズ
- AI Gateway 連携対応
- モバイル・デスクトップ両対応のクリーンな UI

### 特徴

#### コア機能

- 💬 シンプルでレスポンシブなチャット UI
- ⚡ SSE によるストリーミング応答
- 🧠 Cloudflare Workers AI LLMs 搭載
- 🛠️ TypeScript と Cloudflare Workers で構築
- 📱 モバイルフレンドリー
- 🔄 クライアント側でチャット履歴を保持

#### 強化機能

- 🌏 **多言語対応**：5言語UIとAIプロンプト（英語・繁体字中国語・簡体字中国語・日本語・韓国語）
- 🌐 **スマート言語検出**：ブラウザ言語自動判別
- 🌙 **ダークモード**：ライト/ダークテーマ切替
- 📝 **Markdown 対応**：完全な markdown レンダリング
- 🏷️ **メッセージラベル**：明確なユーザー/AI識別
- 🚨 **トースト通知**：非侵襲的なエラーメッセージ
- ⏹️ **ストリーム中断**：停止ボタンで AI 生成を中止可能
- 📊 **リアルタイム指標**：トークン数と生成速度（tokens/s）をライブ表示
- ⚡ **スマートバッファリング**：最適化された UI 更新（50ms バッチ）で 60+ FPS の滑らかなパフォーマンス
- 📄 **多言語ドキュメント**：5言語の README ファイル

### はじめに

#### 必要条件

- [Node.js](https://nodejs.org/)（v18 以上）
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- Workers AI アクセス権のある Cloudflare アカウント

#### インストール

1. リポジトリをクローン：

   ```bash
   git clone http://github.com/anomixer/llm-chat-app-template
   cd llm-chat-app-template
   ```

2. 依存関係をインストール：

   ```bash
   npm install
   ```

3. Worker 型定義を生成：
   ```bash
   npm run cf-typegen
   ```

#### 開発

ローカル開発サーバーを起動：

```bash
npm run dev
```

http://localhost:8787 でサーバーが起動します。

※ローカル開発中も Workers AI へのアクセスは Cloudflare アカウントに課金されます。

#### デプロイ

Cloudflare Workers へデプロイ：

```bash
npm run deploy
```

### プロジェクト構成

```
/
├── public/             # 静的アセット
│   ├── index.html      # チャット UI HTML
│   └── chat.js         # フロントエンドスクリプト
├── src/
│   ├── index.ts        # Worker エントリーポイント
│   └── types.ts        # TypeScript 型定義
├── test/               # テストファイル
├── wrangler.jsonc      # Cloudflare Worker 設定
├── tsconfig.json       # TypeScript 設定
└── README.md           # このドキュメント
```

### 仕組み

#### バックエンド

バックエンドは Cloudflare Workers で構築され、Workers AI プラットフォームで応答を生成します。主な構成：

1. **API エンドポイント**（`/api/chat`）：POST リクエストを受け付け、応答をストリーミング
2. **ストリーミング**：SSE で AI 応答をリアルタイム配信、`stream: true` パラメータを使用
3. **Workers AI バインディング**：Cloudflare AI サービスと連携

#### フロントエンド

フロントエンドはシンプルな HTML/CSS/JavaScript アプリ：

1. 多言語対応のチャット UI を表示
2. ユーザーのメッセージを API へ送信
3. SSE ストリーミング応答をリアルタイム処理
4. スマートバッファリング（50ms）を実装し DOM 更新を削減
5. リアルタイムのトークン指標と生成速度を表示
6. AbortController によるストリーム中断対応
7. クライアント側でチャット履歴を保持

### パフォーマンス

| 指標 | 値 |
|------|----|
| **UI 更新頻度** | 50ms ごとにバッチ処理（vs. トークンごと） |
| **DOM 操作** | 99%+ 削減 |
| **フレームレート** | 安定した 60+ FPS |
| **ストリーム中断** | AbortController による即座の中断 |
| **メモリ効率** | スマートバッファリングでメモリスパイク防止 |

### カスタマイズ

#### モデルの変更

AI モデルを変更する場合は、`src/index.ts` の `MODEL_ID` 定数を編集してください。利用可能なモデルは [Cloudflare Workers AI ドキュメント](https://developers.cloudflare.com/workers-ai/models/) を参照。

```typescript
const MODEL_ID = "@hf/google/gemma-7b-it"; // ここを変更
```

#### AI Gateway の利用

本テンプレートには AI Gateway 連携用のコメントコードが含まれています。レート制限、キャッシュ、分析などが可能です。

有効化手順：

1. Cloudflare ダッシュボードで AI Gateway を作成
2. `src/index.ts` の gateway 設定をアンコメント
3. `YOUR_GATEWAY_ID` を実際の ID に置換
4. 必要に応じて他のオプションも設定

詳細は [AI Gateway ドキュメント](https://developers.cloudflare.com/ai-gateway/) を参照。

#### システムプロンプトの変更

システムプロンプトはユーザー言語に応じて自動的にローカライズされます。`public/chat.js` の `SYSTEM_PROMPT` オブジェクトを更新：

```javascript
const SYSTEM_PROMPT = {
  en: "You are a helpful, friendly assistant...",
  ja: "あなたは親切でフレンドリーなアシスタントです...",
  // 他の言語を追加
};
```

#### UI 更新頻度の調整

`public/chat.js` のバッファリング間隔を変更：

```javascript
const updateInterval = 50; // ミリ秒（デフォルト：50ms）
```

低い値 = より頻繁な更新（CPU 使用率高）  
高い値 = 更新回数減（滑らかだが反応遅）

#### スタイル調整

UI スタイルは `public/index.html` の `<style>` セクションに記述されています。CSS 変数を編集してカラースキームを変更できます。

### 高度な機能

#### ストリーム中断

ユーザーは AI 生成中に停止ボタン（⏹️）をクリックしてストリーミングを中断できます。これは `AbortController` で実装されています：

```javascript
const abortController = new AbortController();
fetch('/api/chat', { signal: abortController.signal });
// 後で：abortController.abort();
```

#### リアルタイム指標

アプリケーションには以下が表示されます：
- **トークン数**：生成されたトークンの数
- **生成速度**：リアルタイムの tokens per second

これらの指標はクライアント側でストリーミングデータから計算されます。

### リソース

- [Cloudflare Workers ドキュメント](https://developers.cloudflare.com/workers/)
- [Cloudflare Workers AI ドキュメント](https://developers.cloudflare.com/workers-ai/)
- [Workers AI モデル](https://developers.cloudflare.com/workers-ai/models/)
- [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

---

本プロジェクトは [Cursor](https://github.com/cursor/cursor) AI の支援で改善されています
