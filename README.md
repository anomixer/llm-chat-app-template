# LLM Chat Application Template

> Other languages: [繁體中文](README.zh-TW.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md)

A simple, ready-to-deploy chat application template powered by Cloudflare Workers AI. This template provides a clean starting point for building AI chat applications with streaming responses.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/llm-chat-app-template)

<!-- dash-content-start -->

### Demo

This template demonstrates how to build an AI-powered chat interface using Cloudflare Workers AI with streaming responses. It features:

- Real-time streaming of AI responses using Server-Sent Events (SSE)
- Easy customization of models and system prompts
- Support for AI Gateway integration
- Clean, responsive UI that works on mobile and desktop

### Features

#### Core Features

- 💬 Simple and responsive chat interface
- ⚡ Server-Sent Events (SSE) for streaming responses
- 🧠 Powered by Cloudflare Workers AI LLMs
- 🛠️ Built with TypeScript and Cloudflare Workers
- 📱 Mobile-friendly design
- 🔄 Maintains chat history on the client

#### Enhanced Features

- 🌏 **Multi-language Support**: Five-language UI & AI prompt (EN, ZH-TW, ZH-CN, JA, KO)
- 🌐 **Smart Language Detection**: Auto-detect browser language for UI and AI
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 📝 **Markdown Support**: Full markdown rendering in chat messages
- 🏷️ **Message Labels**: Clear user/AI message identification
- 🚨 **Toast Notifications**: Non-intrusive error messages
- ⏹️ **Stream Cancellation**: Stop button to abort AI generation mid-stream
- 📊 **Real-time Metrics**: Live token count and generation speed (tokens/s)
- ⚡ **Smart Buffering**: Optimized UI updates (50ms batching) for smooth 60+ FPS performance
- 📄 **Multi-language Documentation**: README files in 5 languages

### Getting Started

#### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- A Cloudflare account with Workers AI access

#### Installation

1. Clone this repository:

   ```bash
   git clone http://github.com/anomixer/llm-chat-app-template
   cd llm-chat-app-template
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Generate Worker type definitions:
   ```bash
   npm run cf-typegen
   ```

#### Development

Start a local development server:

```bash
npm run dev
```

This will start a local server at http://localhost:8787.

Note: Using Workers AI accesses your Cloudflare account even during local development, which will incur usage charges.

#### Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

### Project Structure

```
/
├── public/             # Static assets
│   ├── index.html      # Chat UI HTML
│   └── chat.js         # Chat UI frontend script
├── src/
│   ├── index.ts        # Main Worker entry point
│   └── types.ts        # TypeScript type definitions
├── test/               # Test files
├── wrangler.jsonc      # Cloudflare Worker configuration
├── tsconfig.json       # TypeScript configuration
└── README.md           # This documentation
```

### How It Works

#### Backend

The backend is built with Cloudflare Workers and uses the Workers AI platform to generate responses. The main components are:

1. **API Endpoint** (`/api/chat`): Accepts POST requests with chat messages and streams responses
2. **Streaming**: Uses Server-Sent Events (SSE) for real-time streaming of AI responses with `stream: true` parameter
3. **Workers AI Binding**: Connects to Cloudflare's AI service via the Workers AI binding

#### Frontend

The frontend is a simple HTML/CSS/JavaScript application that:

1. Presents a chat interface with multi-language support
2. Sends user messages to the API
3. Processes streaming SSE responses in real-time
4. Implements smart buffering (50ms) to reduce DOM updates
5. Displays real-time token metrics and generation speed
6. Supports stream cancellation via AbortController
7. Maintains chat history on the client side

### Performance

| Metric | Value |
|--------|-------|
| **UI Update Frequency** | Batched every 50ms (vs. per-token) |
| **DOM Operations** | 99%+ reduction |
| **Frame Rate** | Consistent 60+ FPS |
| **Stream Cancellation** | Instant via AbortController |
| **Memory Efficiency** | Smart buffering prevents memory spikes |

### Customization

#### Changing the Model

To use a different AI model, update the `MODEL_ID` constant in `src/index.ts`. You can find available models in the [Cloudflare Workers AI documentation](https://developers.cloudflare.com/workers-ai/models/).

```typescript
const MODEL_ID = "@hf/google/gemma-7b-it"; // Change this
```

#### Using AI Gateway

The template includes commented code for AI Gateway integration, which provides additional capabilities like rate limiting, caching, and analytics.

To enable AI Gateway:

1. [Create an AI Gateway](https://dash.cloudflare.com/?to=/:account/ai/ai-gateway) in your Cloudflare dashboard
2. Uncomment the gateway configuration in `src/index.ts`
3. Replace `YOUR_GATEWAY_ID` with your actual AI Gateway ID
4. Configure other gateway options as needed:
   - `skipCache`: Set to `true` to bypass gateway caching
   - `cacheTtl`: Set the cache time-to-live in seconds

Learn more about [AI Gateway](https://developers.cloudflare.com/ai-gateway/).

#### Modifying the System Prompt

The system prompt is automatically localized based on user language. Update the `SYSTEM_PROMPT` object in `public/chat.js`:

```javascript
const SYSTEM_PROMPT = {
  en: "You are a helpful, friendly assistant...",
  "zh-TW": "你是一個樂於助人且友善的助理...",
  // Add more languages
};
```

#### Adjusting UI Update Frequency

Modify the buffering interval in `public/chat.js`:

```javascript
const updateInterval = 50; // milliseconds (default: 50ms)
```

Lower values = more frequent updates (higher CPU usage)  
Higher values = fewer updates (smoother but less real-time)

#### Styling

The UI styling is contained in the `<style>` section of `public/index.html`. You can modify the CSS variables at the top to quickly change the color scheme.

### Advanced Features

#### Stream Cancellation

Users can click the stop button (⏹️) during AI generation to cancel the stream. This is implemented using `AbortController`:

```javascript
const abortController = new AbortController();
fetch('/api/chat', { signal: abortController.signal });
// Later: abortController.abort();
```

#### Real-time Metrics

The application displays:
- **Token Count**: Number of tokens generated
- **Generation Speed**: Tokens per second in real-time

These metrics are calculated client-side from the streaming data.

### Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare Workers AI Documentation](https://developers.cloudflare.com/workers-ai/)
- [Workers AI Models](https://developers.cloudflare.com/workers-ai/models/)
- [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

---

This App is improved with the assistance of [Cursor](https://github.com/cursor/cursor)
