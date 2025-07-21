/**
 * LLM Chat App Frontend
 *
 * Handles the chat UI interactions and communication with the backend API.
 */

// DOM elements
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const typingIndicator = document.getElementById("typing-indicator");

// Chat state
let chatHistory = [];
let isProcessing = false;

// Auto-resize textarea as user types
userInput.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
});

// Send message on Enter (without Shift)
userInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Send button click handler
sendButton.addEventListener("click", sendMessage);

/**
 * Sends a message to the chat API and processes the response
 */
async function sendMessage() {
  const message = userInput.value.trim();

  // Don't send empty messages
  if (message === "" || isProcessing) return;

  // Disable input while processing
  isProcessing = true;
  userInput.disabled = true;
  sendButton.disabled = true;

  // Add user message to chat
  addMessageToChat("user", message);

  // Clear input
  userInput.value = "";
  userInput.style.height = "auto";

  // Show typing indicator
  typingIndicator.classList.add("visible");

  // Add message to history
  chatHistory.push({ role: "user", content: message });

  try {
    // Create new assistant response element
    const assistantMessageEl = document.createElement("div");
    assistantMessageEl.className = "message assistant-message";
    assistantMessageEl.innerHTML = `<div class='msg-label'>${I18N['ai-label'][getLang()]}</div><div class='msg-content'></div>`;
    chatMessages.appendChild(assistantMessageEl);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Send request to API
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: chatHistory,
      }),
    });

    // Handle errors
    if (!response.ok) {
      throw new Error("Failed to get response");
    }

    // Process streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let responseText = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // Decode chunk
      const chunk = decoder.decode(value, { stream: true });

      // Process SSE format
      const lines = chunk.split("\n");
      for (const line of lines) {
        try {
          const jsonData = JSON.parse(line);
          if (jsonData.response) {
            // Append new content to existing text
            responseText += jsonData.response;
            assistantMessageEl.querySelector(".msg-content").innerHTML = window.marked.parse(responseText);

            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
          }
        } catch (e) {
          console.error("Error parsing JSON:", e);
        }
      }
    }

    // Add completed response to chat history
    chatHistory.push({ role: "assistant", content: responseText });
  } catch (error) {
    console.error("Error:", error);
    showErrorToast(I18N['error'][getLang()]);
  } finally {
    // Hide typing indicator
    typingIndicator.classList.remove("visible");

    // Re-enable input
    isProcessing = false;
    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.focus();
  }
}

/**
 * Helper function to add message to chat
 */
function addMessageToChat(role, content, isWelcome) {
  const messageEl = document.createElement("div");
  messageEl.className = `message ${role}-message`;
  if (isWelcome) messageEl.setAttribute('data-welcome', '1');
  // 多語 label
  const label = role === "user" ? I18N['user-label'][getLang()] : I18N['ai-label'][getLang()];
  messageEl.innerHTML = `<div class='msg-label'>${label}</div><div class='msg-content'>${window.marked.parse(content)}</div>`;
  if (isWelcome && chatMessages.firstChild) {
    chatMessages.insertBefore(messageEl, chatMessages.firstChild);
  } else {
    chatMessages.appendChild(messageEl);
  }

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 主題切換功能
const themeToggle = document.getElementById("theme-toggle");
const body = document.getElementById("body");

function setTheme(isDark) {
  if (isDark) {
    body.classList.add("dark");
    themeToggle.textContent = "☀️ " + I18N['theme-toggle'][getLang()];
  } else {
    body.classList.remove("dark");
    themeToggle.textContent = "🌙 " + I18N['theme-toggle'][getLang()];
  }
}
function getThemeIsDark() {
  return body.classList.contains("dark");
}

// 讀取 localStorage 或跟隨系統
function getPreferredTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "dark") return true;
  if (saved === "light") return false;
  // 沒有儲存時跟隨系統
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// ===== 多語言支援 =====
const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'zh-CN', label: '简体中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
];
const I18N = {
  'header-title': {
    'en': 'Cloudflare AI Chat',
    'zh-TW': 'Cloudflare AI 聊天室',
    'zh-CN': 'Cloudflare AI 聊天室',
    'ja': 'Cloudflare AI チャット',
    'ko': 'Cloudflare AI 채팅',
  },
  'header-desc': {
    'en': 'Powered by Cloudflare Workers AI',
    'zh-TW': '由 Cloudflare Workers AI 驅動',
    'zh-CN': '由 Cloudflare Workers AI 驱动',
    'ja': 'Cloudflare Workers AI 搭載',
    'ko': 'Cloudflare Workers AI 기반',
  },
  'theme-toggle': {
    'en': 'Theme',
    'zh-TW': '主題',
    'zh-CN': '主题',
    'ja': 'テーマ',
    'ko': '테마',
  },
  'lang-toggle': {
    'en': '🌐 Language',
    'zh-TW': '🌐 語言',
    'zh-CN': '🌐 语言',
    'ja': '🌐 言語',
    'ko': '🌐 언어',
  },
  'typing-text': {
    'en': 'AI is thinking...',
    'zh-TW': 'AI 思考中...',
    'zh-CN': 'AI 思考中...',
    'ja': 'AIが考え中...',
    'ko': 'AI가 생각 중...'
  },
  'user-input': {
    'en': 'Type your message here...',
    'zh-TW': '請輸入訊息...',
    'zh-CN': '请输入信息...',
    'ja': 'メッセージを入力してください...',
    'ko': '메시지를 입력하세요...'
  },
  'send-button': {
    'en': 'Send',
    'zh-TW': '送出',
    'zh-CN': '发送',
    'ja': '送信',
    'ko': '전송'
  },
  'footer-text': {
    'en': 'Cloudflare Workers AI Chat Template © 2025',
    'zh-TW': 'Cloudflare Workers AI 聊天範本 © 2025',
    'zh-CN': 'Cloudflare Workers AI 聊天模板 © 2025',
    'ja': 'Cloudflare Workers AI チャットテンプレート © 2025',
    'ko': 'Cloudflare Workers AI 채팅 템플릿 © 2025'
  },
  'welcome': {
    'en': "Hello! I'm an LLM chat app powered by Cloudflare Workers AI. How can I help you today?",
    'zh-TW': '哈囉！我是由 Cloudflare Workers AI 驅動的聊天機器人，有什麼可以幫您？',
    'zh-CN': '你好！我是由 Cloudflare Workers AI 驱动的聊天机器人，有什么可以帮您？',
    'ja': 'こんにちは！Cloudflare Workers AI 搭載のチャットボットです。ご用件をどうぞ！',
    'ko': '안녕하세요! Cloudflare Workers AI 기반 챗봇입니다. 무엇을 도와드릴까요?'
  },
  'user-label': {
    'en': 'User:',
    'zh-TW': '使用者：',
    'zh-CN': '用户：',
    'ja': 'ユーザー：',
    'ko': '사용자:'
  },
  'ai-label': {
    'en': 'AI:',
    'zh-TW': 'AI：',
    'zh-CN': 'AI：',
    'ja': 'AI：',
    'ko': 'AI:'
  },
  'error': {
    'en': 'Sorry, there was an error processing your request.',
    'zh-TW': '抱歉，處理您的請求時發生錯誤。',
    'zh-CN': '抱歉，处理您的请求时发生错误。',
    'ja': '申し訳ありません。リクエスト処理中にエラーが発生しました。',
    'ko': '죄송합니다. 요청 처리 중 오류가 발생했습니다.'
  }
};

function getLang() {
  return localStorage.getItem('lang') || 'en';
}
function setLang(lang) {
  localStorage.setItem('lang', lang);
}
// ===== 語言 icon 對應表 =====
const LANG_ICONS = {
  'en': 'EN',
  'zh-TW': 'TW',
  'zh-CN': 'CN',
  'ja': 'JP',
  'ko': 'KO',
};
function updateI18nUI() {
  const lang = getLang();
  for (const id in I18N) {
    if (id === 'welcome' || id === 'user-label' || id === 'ai-label' || id === 'error') continue;
    const el = document.getElementById(id);
    if (el) {
      if (id === 'user-input') {
        el.placeholder = I18N[id][lang];
      } else if (id === 'lang-toggle') {
        el.textContent = LANG_ICONS[lang] + ' ' + I18N[id][lang];
      } else {
        el.textContent = I18N[id][lang];
      }
    }
  }
  // 更新主題按鈕圖示
  setTheme(getThemeIsDark());
}

// 語言切換按鈕
const langToggle = document.getElementById('lang-toggle');
langToggle.addEventListener('click', () => {
  const cur = getLang();
  const idx = LANGS.findIndex(l => l.code === cur);
  const next = LANGS[(idx + 1) % LANGS.length].code;
  setLang(next);
  updateI18nUI();
  // 重新渲染歡迎訊息（如果對話為空）
  if (chatMessages.children.length === 0) renderWelcome();
});

// 恢復主題切換按鈕事件
themeToggle.addEventListener("click", () => {
  const isDark = !body.classList.contains("dark");
  setTheme(isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// ===== 歡迎訊息動態插入 =====
function renderWelcome() {
  // 若已存在歡迎訊息則只更新內容，不重複插入
  let firstMsg = chatMessages.querySelector('.assistant-message[data-welcome]');
  if (!firstMsg) {
    addMessageToChat('assistant', I18N['welcome'][getLang()], true);
  } else {
    // 更新語言時只改內容
    firstMsg.querySelector('.msg-content').innerHTML = window.marked.parse(I18N['welcome'][getLang()]);
    firstMsg.querySelector('.msg-label').textContent = I18N['ai-label'][getLang()];
  }
}
// ===== 修改 addMessageToChat 支援多語 label =====
// ... existing code ...
// ===== 修改 sendMessage 內 assistantMessageEl label 多語 =====
// ... existing code ...
// ===== 修改主題切換按鈕多語 =====
function setTheme(isDark) {
  if (isDark) {
    body.classList.add("dark");
    themeToggle.textContent = "☀️ " + I18N['theme-toggle'][getLang()];
  } else {
    body.classList.remove("dark");
    themeToggle.textContent = "🌙 " + I18N['theme-toggle'][getLang()];
  }
}
function getThemeIsDark() {
  return body.classList.contains("dark");
}
// ===== 初始化語言與 UI =====
updateI18nUI();
if (chatMessages.children.length === 0) renderWelcome();
// ... existing code ...
// ===== send button 多語 =====
document.getElementById('send-button').textContent = I18N['send-button'][getLang()];
// ... existing code ...
// ===== textarea 多語 =====
document.getElementById('user-input').placeholder = I18N['user-input'][getLang()];

// 初始化時只呼叫 renderWelcome 一次
if (!chatMessages.querySelector('.assistant-message[data-welcome]')) renderWelcome();

// ===== 錯誤提示條 =====
function showErrorToast(msg) {
  const toast = document.getElementById('error-toast');
  toast.textContent = msg;
  toast.style.display = 'block';
  toast.style.opacity = '1';
  clearTimeout(showErrorToast._timer);
  showErrorToast._timer = setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => { toast.style.display = 'none'; }, 300);
  }, 3000);
}

// ===== theme 預設為 dark =====
setTheme(true);
