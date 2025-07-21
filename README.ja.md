# LLM チャットアプリケーション テンプレート

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

- 💬 シンプルでレスポンシブなチャット UI
- ⚡ SSE によるストリーミング応答
- 🧠 Cloudflare Workers AI LLMs 搭載
- 🛠️ TypeScript と Cloudflare Workers で構築
- 📱 モバイルフレンドリー
- 🔄 クライアント側でチャット履歴を保持
<!-- dash-content-end -->

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
2. **ストリーミング**：SSE で AI 応答をリアルタイム配信
3. **Workers AI バインディング**：Cloudflare AI サービスと連携

#### フロントエンド

フロントエンドはシンプルな HTML/CSS/JavaScript アプリ：

1. チャット UI を表示
2. ユーザーのメッセージを API へ送信
3. ストリーミング応答をリアルタイム処理
4. クライアント側でチャット履歴を保持

### カスタマイズ

#### モデルの変更

AI モデルを変更する場合は、`src/index.ts` の `MODEL_ID` 定数を編集してください。利用可能なモデルは [Cloudflare Workers AI ドキュメント](https://developers.cloudflare.com/workers-ai/models/) を参照。

#### AI Gateway の利用

本テンプレートには AI Gateway 連携用のコメントコードが含まれています。レート制限、キャッシュ、分析などが可能です。

有効化手順：

1. Cloudflare ダッシュボードで AI Gateway を作成
2. `src/index.ts` の gateway 設定をアンコメント
3. `YOUR_GATEWAY_ID` を実際の ID に置換
4. 必要に応じて他のオプションも設定

詳細は [AI Gateway ドキュメント](https://developers.cloudflare.com/ai-gateway/) を参照。

#### システムプロンプトの変更

`src/index.ts` の `SYSTEM_PROMPT` 定数を編集してください。

#### スタイル調整

UI スタイルは `public/index.html` の `<style>` セクションに記述されています。CSS 変数を編集してカラースキームを変更できます。

### リソース

- [Cloudflare Workers ドキュメント](https://developers.cloudflare.com/workers/)
- [Cloudflare Workers AI ドキュメント](https://developers.cloudflare.com/workers-ai/)
- [Workers AI モデル](https://developers.cloudflare.com/workers-ai/models/) 

---

本プロジェクトは [Cursor](https://github.com/cursor/cursor) AI の支援で改善されています 