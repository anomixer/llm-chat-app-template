/**
 * LLM Chat App Frontend - Enhanced Streaming Version
 * 
 * 功能：
 * - JSON Lines 事件流處理（原始方式）
 * - 流式生成中斷
 * - Token 計数和生成速度顯示
 * - 智能緩衝減少 DOM 更新
 * - 改進的錯誤處理
 */

// ===== DOM 元素 =====
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const typingIndicator = document.getElementById("typing-indicator");
const body = document.getElementById("body");
const themeToggle = document.getElementById("theme-toggle");

// ===== 狀態變數 =====
let chatHistory = [];
let isProcessing = false;
let abortController = null;
let currentTokenCount = 0;
let generationStartTime = null;

// ===== 文本區域自動調整高度 =====
userInput.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
});

// ===== Enter 鍵發送訊息 =====
userInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// ===== 發送按鈕 =====
sendButton.addEventListener("click", sendMessage);

/**
 * 發送訊息到 API 並處理流式回應
 */
async function sendMessage() {
  const message = userInput.value.trim();

  if (message === "" || isProcessing) return;

  isProcessing = true;
  userInput.disabled = true;
  sendButton.disabled = true;

  // 添加使用者訊息到聊天
  addMessageToChat("user", message);

  // 清空輸入框
  userInput.value = "";
  userInput.style.height = "auto";

  // 顯示輸入狀態
  typingIndicator.classList.add("visible");
  showStopButton();

  // 添加到歷史記錄
  chatHistory.push({ role: "user", content: message });

  try {
    // 建立 AI 回應元素
    const assistantMessageEl = document.createElement("div");
    assistantMessageEl.className = "message assistant-message";
    assistantMessageEl.innerHTML = `
      <div class='msg-label'>${I18N["ai-label"][getLang()]}</div>
      <div class='msg-content'></div>
      <div class='msg-meta'>
        <span class='token-info'>
          <span class='token-count'>0</span> tokens | 
          <span class='generation-speed'>0.0</span> tokens/s
        </span>
      </div>
    `;
    chatMessages.appendChild(assistantMessageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // 準備請求
    const lang = getLang();
    const messages = [
      {
        role: "system",
        content: SYSTEM_PROMPT[lang] || SYSTEM_PROMPT["en"],
      },
      ...chatHistory,
    ];

    // 建立 AbortController 用於中斷
    abortController = new AbortController();
    generationStartTime = Date.now();
    currentTokenCount = 0;

    // 發送請求到 API
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`API 錯誤: ${response.status}`);
    }

    // 處理流式回應
    let fullText = "";
    let lastUpdateTime = Date.now();
    const updateInterval = 50; // 每 50ms 更新一次 UI

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        // 最後更新
        updateMessageDisplay(assistantMessageEl, fullText, currentTokenCount);
        break;
      }

      // 解碼流數據
      buffer += decoder.decode(value, { stream: true });

      // 按行分割（JSON Lines 格式）
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // 保留未完成的行

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          // 直接認訇上 JSON
          const data = JSON.parse(line);

          if (data.response) {
            // 接收文本內容
            fullText += data.response;
            currentTokenCount++;

            // 智能緩衝：每 50ms 更新一次 UI
            const now = Date.now();
            if (now - lastUpdateTime >= updateInterval) {
              const elapsedSeconds = (now - generationStartTime) / 1000;
              const speed = currentTokenCount / (elapsedSeconds || 1);
              updateMessageDisplay(
                assistantMessageEl,
                fullText,
                currentTokenCount,
                speed,
              );
              chatMessages.scrollTop = chatMessages.scrollHeight;
              lastUpdateTime = now;
            }
          }
        } catch (e) {
          // 非 JSON 行則略過，可能是空行或其他格式
          console.debug("Non-JSON line received:", line);
        }
      }
    }

    // 保存完整回應到歷史
    chatHistory.push({ role: "assistant", content: fullText });
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("使用者中止了生成");
      showInfoToast("已停止生成");
    } else {
      console.error("錯誤:", error);
      showErrorToast(I18N["error"][getLang()]);
    }
  } finally {
    // 清理狀態
    typingIndicator.classList.remove("visible");
    hideStopButton();
    isProcessing = false;
    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.focus();
    abortController = null;
    generationStartTime = null;
  }
}

/**
 * 更新訊息顯示
 */
function updateMessageDisplay(
  element,
  text,
  tokenCount,
  tokensPerSecond = 0,
) {
  const content = element.querySelector(".msg-content");
  const tokenElement = element.querySelector(".token-count");
  const speedElement = element.querySelector(".generation-speed");

  // 使用 marked 渲染 Markdown
  content.innerHTML = window.marked.parse(text);

  // 更新 token 計數
  if (tokenCount > 0) {
    tokenElement.textContent = tokenCount;
  }

  // 更新生成速度
  if (tokensPerSecond > 0) {
    speedElement.textContent = tokensPerSecond.toFixed(1);
  }
}

/**
 * 添加訊息到聊天窗口
 */
function addMessageToChat(role, content, isWelcome) {
  const messageEl = document.createElement("div");
  messageEl.className = `message ${role}-message`;
  if (isWelcome) messageEl.setAttribute("data-welcome", "1");

  const label =
    role === "user"
      ? I18N["user-label"][getLang()]
      : I18N["ai-label"][getLang()];

  messageEl.innerHTML = `
    <div class='msg-label'>${label}</div>
    <div class='msg-content'>${window.marked.parse(content)}</div>
  `;

  if (isWelcome && chatMessages.firstChild) {
    chatMessages.insertBefore(messageEl, chatMessages.firstChild);
  } else {
    chatMessages.appendChild(messageEl);
  }

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * 顯示停止按鈕
 */
function showStopButton() {
  let stopBtn = document.getElementById("stop-button");
  if (!stopBtn) {
    stopBtn = document.createElement("button");
    stopBtn.id = "stop-button";
    stopBtn.innerHTML = "⏹️ <span>停止</span>";
    stopBtn.className = "stop-button";
    stopBtn.addEventListener("click", () => {
      if (abortController) {
        abortController.abort();
      }
    });
    document.body.appendChild(stopBtn);
  }
  stopBtn.style.display = "block";
}

/**
 * 隱藏停止按鈕
 */
function hideStopButton() {
  const stopBtn = document.getElementById("stop-button");
  if (stopBtn) {
    stopBtn.style.display = "none";
  }
}

/**
 * 顯示錯誤提示
 */
function showErrorToast(msg) {
  showToast(msg, "error");
}

/**
 * 顯示信息提示
 */
function showInfoToast(msg) {
  showToast(msg, "info");
}

/**
 * 通用提示函式
 */
function showToast(msg, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 4px;
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
  `;

  if (type === "error") {
    toast.style.background = "#ff6b6b";
  } else if (type === "info") {
    toast.style.background = "#4a90e2";
  }
  toast.style.color = "white";
  toast.style.fontWeight = "500";

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease-in";
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ===== 主題切換 =====
function setTheme(isDark) {
  if (isDark) {
    body.classList.add("dark");
    themeToggle.textContent = "☀️ " + I18N["theme-toggle"][getLang()];
  } else {
    body.classList.remove("dark");
    themeToggle.textContent = "🌙 " + I18N["theme-toggle"][getLang()];
  }
}

function getThemeIsDark() {
  return body.classList.contains("dark");
}

function getPreferredTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "dark") return true;
  if (saved === "light") return false;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

// ===== 多語言支援 =====
const LANGS = [
  { code: "en", label: "English" },
  { code: "zh-TW", label: "繁體中文" },
  { code: "zh-CN", label: "简体中文" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
];

const I18N = {
  "header-title": {
    en: "Cloudflare AI Chat",
    "zh-TW": "Cloudflare AI 聊天室",
    "zh-CN": "Cloudflare AI 聊天室",
    ja: "Cloudflare AI チャット",
    ko: "Cloudflare AI 채팅",
  },
  "header-desc": {
    en: "Powered by Cloudflare Workers AI",
    "zh-TW": "由 Cloudflare Workers AI 驅動",
    "zh-CN": "由 Cloudflare Workers AI 驱动",
    ja: "Cloudflare Workers AI 搭載",
    ko: "Cloudflare Workers AI 기반",
  },
  "theme-toggle": {
    en: "Theme",
    "zh-TW": "主題",
    "zh-CN": "主题",
    ja: "テーマ",
    ko: "테마",
  },
  "lang-toggle": {
    en: "🌐 Language",
    "zh-TW": "🌐 語言",
    "zh-CN": "🌐 语言",
    ja: "🌐 言語",
    ko: "🌐 언어",
  },
  "send-button": {
    en: "Send",
    "zh-TW": "送出",
    "zh-CN": "发送",
    ja: "送信",
    ko: "전송",
  },
  "user-input": {
    en: "Type your message here...",
    "zh-TW": "請輸入訊息...",
    "zh-CN": "请输入信息...",
    ja: "メッセージを入力してください...",
    ko: "메시지를 입력하세요...",
  },
  "user-label": {
    en: "User:",
    "zh-TW": "使用者：",
    "zh-CN": "用户：",
    ja: "ユーザー：",
    ko: "사용자:",
  },
  "ai-label": {
    en: "AI:",
    "zh-TW": "AI：",
    "zh-CN": "AI：",
    ja: "AI：",
    ko: "AI:",
  },
  welcome: {
    en: "Hello! I'm an LLM chat app powered by Cloudflare Workers AI. How can I help you today?",
    "zh-TW":
      "哈囉！我是由 Cloudflare Workers AI 驅動的聊天機器人，有什麼可以幫您？",
    "zh-CN":
      "你好！我是由 Cloudflare Workers AI 驱动的聊天机器人，有什么可以帮您？",
    ja: "こんにちは！Cloudflare Workers AI 搭載のチャットボットです。ご用件をどうぞ！",
    ko: "안녕하세요！Cloudflare Workers AI 기반 챗봇입니다. 무엇을 도와드릴까요?",
  },
  error: {
    en: "Sorry, there was an error processing your request.",
    "zh-TW": "抱歉，處理您的請求時發生錯誤。",
    "zh-CN": "抱歉，处理您的请求时发生错误。",
    ja: "申し訳ありません。リクエスト処理中にエラーが発生しました。",
    ko: "죄송합니다. 요청 처리 중 오류가 발생했습니다.",
  },
};

const SYSTEM_PROMPT = {
  en: "You are a helpful, friendly assistant. Provide concise and accurate responses.",
  "zh-TW": "你是一個樂於助人且友善的助理，請用簡潔且準確的方式回覆。",
  "zh-CN": "你是一个乐于助人且友善的助手，请用简洁且准确的方式回复。",
  ja: "あなたは親切でフレンドリーなアシスタントです。簡潔かつ正確に回答してください。",
  ko: "당신은 친절하고 도움이 되는 어시스턴트입니다. 간결하고 정확하게 답변해 주세요。",
};

const LANG_ICONS = {
  en: "EN",
  "zh-TW": "TW",
  "zh-CN": "CN",
  ja: "JP",
  ko: "KO",
};

function getLang() {
  return localStorage.getItem("lang") || "en";
}

function setLang(lang) {
  localStorage.setItem("lang", lang);
}

function updateI18nUI() {
  const lang = getLang();
  for (const id in I18N) {
    if (["welcome", "user-label", "ai-label", "error"].includes(id)) continue;
    const el = document.getElementById(id);
    if (el) {
      if (id === "user-input") {
        el.placeholder = I18N[id][lang];
      } else if (id === "lang-toggle") {
        el.textContent = LANG_ICONS[lang] + " " + I18N[id][lang];
      } else {
        el.textContent = I18N[id][lang];
      }
    }
  }
  setTheme(getThemeIsDark());
}

// ===== 語言切換 =====
const langToggle = document.getElementById("lang-toggle");
langToggle.addEventListener("click", () => {
  const cur = getLang();
  const idx = LANGS.findIndex((l) => l.code === cur);
  const next = LANGS[(idx + 1) % LANGS.length].code;
  setLang(next);
  updateI18nUI();
  if (chatMessages.children.length === 0) renderWelcome();
});

// ===== 主題切換 =====
themeToggle.addEventListener("click", () => {
  const isDark = !body.classList.contains("dark");
  setTheme(isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// ===== 歡迎訊息 =====
function renderWelcome() {
  let firstMsg = chatMessages.querySelector('.assistant-message[data-welcome]');
  if (!firstMsg) {
    addMessageToChat("assistant", I18N["welcome"][getLang()], true);
  } else {
    firstMsg.querySelector(".msg-content").innerHTML = window.marked.parse(
      I18N["welcome"][getLang()],
    );
    firstMsg.querySelector(".msg-label").textContent =
      I18N["ai-label"][getLang()];
  }
}

// ===== 初始化 =====
function detectBrowserLang() {
  const navLang =
    (navigator.languages && navigator.languages[0]) ||
    navigator.language ||
    "en";
  if (navLang.startsWith("zh-TW") || navLang === "zh-Hant") return "zh-TW";
  if (navLang.startsWith("zh-CN") || navLang === "zh-Hans") return "zh-CN";
  if (navLang.startsWith("ja")) return "ja";
  if (navLang.startsWith("ko")) return "ko";
  if (navLang.startsWith("en")) return "en";
  return "en";
}

if (!localStorage.getItem("lang")) {
  setLang(detectBrowserLang());
}

updateI18nUI();
setTheme(getPreferredTheme());
if (chatMessages.children.length === 0) renderWelcome();

// ===== CSS 動畫 =====
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }

  .stop-button {
    position: fixed;
    right: 20px;
    bottom: 20px;
    padding: 10px 16px;
    background: #ff6b6b;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
    transition: all 0.2s ease;
    z-index: 1000;
  }

  .stop-button:hover {
    background: #ff5252;
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(255, 107, 107, 0.4);
  }

  .stop-button:active {
    transform: scale(0.98);
  }

  .msg-meta {
    margin-top: 8px;
    font-size: 12px;
    color: #999;
  }

  .token-info {
    display: inline-block;
    padding: 4px 8px;
    background: #f0f0f0;
    border-radius: 3px;
    font-family: monospace;
  }

  .dark .token-info {
    background: #333;
    color: #aaa;
  }

  .toast {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;
document.head.appendChild(style);
