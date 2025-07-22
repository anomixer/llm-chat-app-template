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
const themeToggle = document.getElementById("theme-toggle");
const langToggle = document.getElementById("lang-toggle");
const clearChatButton = document.getElementById("clear-chat-button"); // Added
const saveChatButton = document.getElementById("save-chat-button"); // Added
const body = document.getElementById("body");

// Chat state
let chatHistory = [];
let isProcessing = false;

// Helper to format timestamp
const formatTimestamp = (ts) => `(${ts.getHours().toString().padStart(2, '0')}:${ts.getMinutes().toString().padStart(2, '0')}:${ts.getSeconds().toString().padStart(2, '0')})`;

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
  const userTimestamp = new Date(); // Get timestamp for user message
  addMessageToChat("user", message, { timestamp: userTimestamp }); // Pass timestamp

  // Clear input
  userInput.value = "";
  userInput.style.height = "auto";

  // Show typing indicator
  typingIndicator.classList.add("visible");

  // Add message to history
  chatHistory.push({ role: "user", content: message, timestamp: userTimestamp }); // Store timestamp

  try {
    // Create new assistant response element (placeholder initially)
    const assistantMessageEl = addMessageToChat("assistant", "...", { isPlaceholder: true }); // Use placeholder option

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // 傳送 system prompt
    const lang = getLang();
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT[lang] || SYSTEM_PROMPT['en'] },
      ...chatHistory.map(m => ({ role: m.role, content: m.content })) // Only send role and content to API
    ];
    // Send request to API
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
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
    let firstChunk = true;
    let assistantTimestamp; // To store the timestamp when the first chunk arrives

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
        if (!line.startsWith("data:")) continue; // Skip non-data lines
        try {
          const jsonData = JSON.parse(line.substring(5));
          if (jsonData.response) {
            if (firstChunk) {
              firstChunk = false;
              assistantTimestamp = new Date(); // Get timestamp on first chunk
              const labelText = I18N['ai-label'][getLang()];
              assistantMessageEl.querySelector('.msg-label').textContent = `${labelText} ${formatTimestamp(assistantTimestamp)}:`; // Update label with timestamp
              assistantMessageEl.querySelector(".msg-content").innerHTML = ''; // Clear placeholder
            }
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
    if (responseText) {
      chatHistory.push({ role: "assistant", content: responseText, timestamp: assistantTimestamp }); // Store timestamp
    } else {
      // If AI sent no actual text, update the placeholder to indicate no response
      assistantMessageEl.querySelector(".msg-content").innerHTML = I18N['error'][getLang()]; 
      assistantMessageEl.classList.add('error-message');
      chatHistory.push({ role: "assistant", content: I18N['error'][getLang()], timestamp: assistantTimestamp || new Date() });
    }
  } catch (error) {
    console.error("Error:", error);
    showErrorToast(I18N['error'][getLang()]);
    if (assistantMessageEl) {
      assistantMessageEl.querySelector(".msg-content").innerHTML = I18N['error'][getLang()];
      assistantMessageEl.classList.add('error-message');
      chatHistory.push({ role: "assistant", content: I18N['error'][getLang()], timestamp: new Date() });
    }
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
 * @param {string} role - 'user' or 'assistant'
 * @param {string} content - The message content
 * @param {object} options - Optional parameters
 * @param {boolean} [options.isWelcome=false] - If it's the initial welcome message
 * @param {boolean} [options.isPlaceholder=false] - If it's a placeholder for AI response
 * @param {Date} [options.timestamp=new Date()] - The timestamp for the message
 * @returns {HTMLElement} The created message element
 */
function addMessageToChat(role, content, options = {}) {
  const { isWelcome = false, isPlaceholder = false, timestamp = new Date() } = options;
  const messageEl = document.createElement("div");
  messageEl.className = `message ${role}-message`;
  if (isWelcome) messageEl.setAttribute('data-welcome', '1');

  const label = role === "user" ? I18N['user-label'][getLang()] : I18N['ai-label'][getLang()];
  let fullLabel;
  if (isWelcome) {
    fullLabel = `${label} ${formatTimestamp(timestamp)}:`; // Welcome message gets timestamp
  } else if (isPlaceholder) {
    fullLabel = label + ':'; // Placeholder has no timestamp initially
  } else {
    fullLabel = `${label} ${formatTimestamp(timestamp)}:`;
  }

  messageEl.innerHTML = `<div class='msg-label'>${fullLabel}</div><div class='msg-content'>${window.marked.parse(content)}</div>`;
  chatMessages.appendChild(messageEl);

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return messageEl;
}

// 主題切換功能
const themeToggle = document.getElementById("theme-toggle");
const body = document.getElementById("body");

function setTheme(isDark) {
  if (isDark) {
    body.classList.add("dark");
    themeToggle.textContent = "🌙 " + I18N['theme-toggle'][getLang()]; // Changed to moon for dark
  } else {
    body.classList.remove("dark");
    themeToggle.textContent = "☀️ " + I18N['theme-toggle'][getLang()]; // Changed to sun for light
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
  'clear-chat-button': { 'en': 'Clear Chat', 'zh-TW': '清除對話', 'zh-CN': '清除对话', 'ja': 'チャットをクリア', 'ko': '채팅 지우기' }, // Added
  'save-chat-button': { 'en': 'Save Chat', 'zh-TW': '儲存對話', 'zh-CN': '保存对话', 'ja': 'チャットを保存', 'ko': '채팅 저장' }, // Added
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
    'ko': '메시지를入力してください...'
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
    'ko': '안녕하세요！Cloudflare Workers AI 기반 챗봇입니다. 무엇을 도와드릴까요?'
  },
  'user-label': {
    'en': 'User',
    'zh-TW': '使用者',
    'zh-CN': '用户',
    'ja': 'ユーザー',
    'ko': '사용자'
  },
  'ai-label': {
    'en': 'AI',
    'zh-TW': 'AI',
    'zh-CN': 'AI',
    'ja': 'AI',
    'ko': 'AI'
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
  const isDark = getThemeIsDark(); // Get current theme state

  for (const id in I18N) {
    // Skip welcome, user-label, ai-label, error as they are handled dynamically or not direct textContent
    if (['welcome', 'user-label', 'ai-label', 'error'].includes(id)) continue;

    const el = document.getElementById(id);
    if (el) {
      if (id === 'user-input') {
        el.placeholder = I18N[id][lang];
      } else if (id === 'lang-toggle') {
        el.textContent = LANG_ICONS[lang] + ' ' + I18N[id][lang];
      } else if (id === 'theme-toggle') { 
        el.textContent = (isDark ? "🌙 " : "☀️ ") + I18N[id][lang]; 
      } else {
        el.textContent = I18N[id][lang];
      }
    }
  }
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

// Clear Chat Button Event Listener
clearChatButton.addEventListener("click", () => {
  chatHistory = [];
  chatMessages.innerHTML = ''; // Clear messages from UI
  renderWelcome();
});

// Save Chat Button Event Listener
saveChatButton.addEventListener("click", () => {
  if (chatHistory.length === 0) return;
  const lang = getLang();
  const chatText = chatHistory.map(msg => {
    const labelKey = msg.role === 'assistant' ? 'ai-label' : 'user-label';
    const label = I18N[labelKey][lang];
    const time = msg.timestamp ? formatTimestamp(new Date(msg.timestamp)) : ''; // Use timestamp from history
    return `${label} ${time}:\n${msg.content}`;
  }).join('\n\n');

  const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'chat-history.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// ===== 歡迎訊息動態插入 =====
function renderWelcome() {
  // 若已存在歡迎訊息則只更新內容，不重複插入
  let firstMsg = chatMessages.querySelector('.assistant-message[data-welcome]');
  if (!firstMsg) {
    addMessageToChat('assistant', I18N['welcome'][getLang()], { isWelcome: true, timestamp: new Date() }); // Added timestamp
  } else {
    // 更新語言時只改內容
    firstMsg.querySelector('.msg-content').innerHTML = window.marked.parse(I18N['welcome'][getLang()]);
    // Update label with current timestamp
    const labelText = I18N['ai-label'][getLang()];
    firstMsg.querySelector('.msg-label').textContent = `${labelText} ${formatTimestamp(new Date())}:`;
  }
}

// ===== 初始化語言與 UI =====
// This part is already handled by the init() function at the bottom

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

// ===== 多語 system prompt =====
const SYSTEM_PROMPT = {
  'en': 'You are a helpful, friendly assistant. Provide concise and accurate responses.',
  'zh-TW': '你是一個樂於助人且友善的助理，請用簡潔且準確的方式回覆。',
  'zh-CN': '你是一个乐于助人且友善的助手，请用简洁且准确的方式回复。',
  'ja': 'あなたは親切でフレンドリーなアシスタントです。簡潔かつ正確に回答してください。',
  'ko': '당신은 친절하고 도움이 되는 어시스턴트입니다. 간결하고 정확하게 답변해 주세요。',
};

// ===== 自動偵測瀏覽器語言 =====
function detectBrowserLang() {
  const navLang = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
  if (navLang.startsWith('zh-TW') || navLang === 'zh-Hant') return 'zh-TW';
  if (navLang.startsWith('zh-CN') || navLang === 'zh-Hans') return 'zh-CN';
  if (navLang.startsWith('ja')) return 'ja';
  if (navLang.startsWith('ko')) return 'ko';
  if (navLang.startsWith('en')) return 'en';
  return 'en';
}

// Initialization function
function init() {
  if (!localStorage.getItem('lang')) {
    setLang(detectBrowserLang());
  }
  // Set initial theme (default to dark if not saved)
  const savedTheme = localStorage.getItem("theme");
  setTheme(savedTheme === 'light' ? false : true); 

  updateI18nUI();
  renderWelcome();
  userInput.focus();
}

// Run initialization
init();