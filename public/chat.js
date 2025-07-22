/**
 * LLM Chat App Frontend (v4 - Cautious Implementation)
 *
 * Re-implementing features carefully on a stable base.
 */

// DOM elements
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const typingIndicator = document.getElementById("typing-indicator");
const themeToggle = document.getElementById("theme-toggle");
const langToggle = document.getElementById("lang-toggle");
const clearChatButton = document.getElementById("clear-chat-button");
const saveChatButton = document.getElementById("save-chat-button");
const body = document.getElementById("body");

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
  if (message === "" || isProcessing) return;

  isProcessing = true;
  userInput.disabled = true;
  sendButton.disabled = true;
  typingIndicator.classList.add("visible");

  const userTimestamp = new Date();
  addMessageToChat("user", message, { timestamp: userTimestamp });
  chatHistory.push({ role: "user", content: message, timestamp: userTimestamp });

  userInput.value = "";
  userInput.style.height = "auto";

  const assistantMessageEl = addMessageToChat("assistant", "", { isPlaceholder: true });

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [
        { role: 'system', content: SYSTEM_PROMPT[getLang()] },
        ...chatHistory.map(m => ({role: m.role, content: m.content})) // Send only role and content
      ]}),
    });

    if (!response.ok) throw new Error(`API error: ${response.statusText}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let responseText = "";
    let firstChunk = true;
    let assistantTimestamp;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data:")) {
          try {
            const data = JSON.parse(line.substring(5));
            if (data.response) {
              if (firstChunk) {
                firstChunk = false;
                assistantTimestamp = new Date();
                const labelText = I18N['ai-label'][getLang()];
                assistantMessageEl.querySelector('.msg-label').textContent = `${labelText} ${formatTimestamp(assistantTimestamp)}:`;
                assistantMessageEl.querySelector('.msg-content').innerHTML = '';
              }
              responseText += data.response;
              assistantMessageEl.querySelector(".msg-content").innerHTML = window.marked.parse(responseText);
              chatMessages.scrollTop = chatMessages.scrollHeight;
            }
          } catch (e) { /* Ignore parsing errors */ }
        }
      }
    }
    if (responseText) {
      chatHistory.push({ role: "assistant", content: responseText, timestamp: assistantTimestamp });
    } else {
       assistantMessageEl.remove();
    }

  } catch (error) {
    console.error("Chat Error:", error);
    showErrorToast(I18N['error'][getLang()]);
    assistantMessageEl.remove();
  } finally {
    isProcessing = false;
    userInput.disabled = false;
    sendButton.disabled = false;
    typingIndicator.classList.remove("visible");
    userInput.focus();
  }
}

/**
 * Helper function to add message to chat
 */
function addMessageToChat(role, content, options = {}) {
  const { isWelcome = false, isPlaceholder = false, timestamp = new Date() } = options;
  
  const messageEl = document.createElement("div");
  messageEl.className = `message ${role}-message`;

  const labelKey = role === 'assistant' ? 'ai-label' : 'user-label';
  const labelText = I18N[labelKey][getLang()];
  
  let fullLabel;
  if (isWelcome) {
      fullLabel = labelText + ':';
      messageEl.setAttribute('data-welcome', '1');
  } else if (isPlaceholder) {
      fullLabel = labelText + ':';
  } else {
      fullLabel = `${labelText} ${formatTimestamp(timestamp)}:`;
  }

  messageEl.innerHTML = `<div class="msg-label">${fullLabel}</div><div class="msg-content">${window.marked.parse(content)}</div>`;
  chatMessages.appendChild(messageEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return messageEl;
}

// ===== UI & Theme Functions =====
function setTheme(isDark) {
  body.classList.toggle("dark", isDark);
  updateI18nUI(); // Re-render UI text for theme button
}

const formatTimestamp = (ts) => `(${ts.getHours().toString().padStart(2, '0')}:${ts.getMinutes().toString().padStart(2, '0')}:${ts.getSeconds().toString().padStart(2, '0')})`;

// ===== Localization =====
const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'zh-CN', label: '简体中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
];
const LANG_ICONS = { 'en': 'EN', 'zh-TW': 'TW', 'zh-CN': 'CN', 'ja': 'JP', 'ko': 'KO' };
const I18N = {
    'header-title': { 'en': 'Cloudflare AI Chat', 'zh-TW': 'Cloudflare AI 聊天室', 'zh-CN': 'Cloudflare AI 聊天室', 'ja': 'Cloudflare AI チャット', 'ko': 'Cloudflare AI 채팅' },
    'header-desc': { 'en': 'Powered by Cloudflare Workers AI', 'zh-TW': '由 Cloudflare Workers AI 驅動', 'zh-CN': '由 Cloudflare Workers AI 驱动', 'ja': 'Cloudflare Workers AI 搭載', 'ko': 'Cloudflare Workers AI 기반' },
    'theme-toggle': { 'en': 'Theme', 'zh-TW': '主題', 'zh-CN': '主题', 'ja': 'テーマ', 'ko': '테마' },
    'lang-toggle': { 'en': 'Language', 'zh-TW': '語言', 'zh-CN': '语言', 'ja': '言語', 'ko': '언어' },
    'clear-chat-button': { 'en': 'Clear', 'zh-TW': '清除', 'zh-CN': '清除', 'ja': 'クリア', 'ko': '지우기' },
    'save-chat-button': { 'en': 'Save', 'zh-TW': '儲存', 'zh-CN': '保存', 'ja': '保存', 'ko': '저장' },
    'typing-text': { 'en': 'AI is thinking...', 'zh-TW': 'AI 思考中...', 'zh-CN': 'AI 思考中...', 'ja': 'AIが考え中...', 'ko': 'AI가 생각 중...' },
    'user-input': { 'en': 'Type your message here...', 'zh-TW': '請輸入訊息...', 'zh-CN': '请输入信息...', 'ja': 'メッセージを入力してください...', 'ko': '메시지를 입력하세요...' },
    'send-button': { 'en': 'Send', 'zh-TW': '送出', 'zh-CN': '发送', 'ja': '送信', 'ko': '전송' },
    'footer-text': { 'en': 'Cloudflare Workers AI Chat Template © 2025', 'zh-TW': 'Cloudflare Workers AI 聊天範本 © 2025', 'zh-CN': 'Cloudflare Workers AI 聊天模板 © 2025', 'ja': 'Cloudflare Workers AI チャットテンプレート © 2025', 'ko': 'Cloudflare Workers AI 채팅 템플릿 © 2025' },
    'welcome': { 'en': "Hello! I'm an LLM chat app powered by Cloudflare Workers AI. How can I help you today?", 'zh-TW': '哈囉！我是由 Cloudflare Workers AI 驅動的聊天機器人，有什麼可以幫您？', 'zh-CN': '你好！我是由 Cloudflare Workers AI 驱动的聊天机器人，有什么可以帮您？', 'ja': 'こんにちは！Cloudflare Workers AI 搭載のチャットボットです。ご用件をどうぞ！', 'ko': '안녕하세요! Cloudflare Workers AI 기반 챗봇입니다. 무엇을 도와드릴까요?' },
    'user-label': { 'en': 'User', 'zh-TW': '使用者', 'zh-CN': '用户', 'ja': 'ユーザー', 'ko': '사용자' },
    'ai-label': { 'en': 'AI', 'zh-TW': 'AI', 'zh-CN': 'AI', 'ja': 'AI', 'ko': 'AI' },
    'error': { 'en': 'Sorry, there was an error processing your request.', 'zh-TW': '抱歉，處理您的請求時發生錯誤。', 'zh-CN': '抱歉，处理您的请求时发生错误。', 'ja': '申し訳ありません。リクエスト処理中にエラーが発生しました。', 'ko': '죄송합니다. 요청 처리 중 오류가 발생했습니다.' }
};
const SYSTEM_PROMPT = {
    'en': 'You are a helpful, friendly assistant. Provide concise and accurate responses.', 'zh-TW': '你是一個樂於助人且友善的助理，請用簡潔且準確的方式回覆。', 'zh-CN': '你是一个乐于助人且友善的助手，请用简洁且准确的方式回复。', 'ja': 'あなたは親切でフレンドリーなアシスタントです。簡潔かつ正確に回答してください。', 'ko': '당신은 친절하고 도움이 되는 어시스턴트입니다. 간결하고 정확하게 답변해 주세요.',
};

function getLang() {
  return localStorage.getItem('lang') || 'en';
}
function setLang(lang) {
  localStorage.setItem('lang', lang);
}

function updateI18nUI() {
  const lang = getLang();
  const isDark = body.classList.contains("dark");
  document.getElementById('header-title').textContent = I18N['header-title'][lang];
  document.getElementById('header-desc').textContent = I18N['header-desc'][lang];
  document.getElementById('typing-text').textContent = I18N['typing-text'][lang];
  userInput.placeholder = I18N['user-input'][lang];
  sendButton.textContent = I18N['send-button'][lang];
  document.getElementById('footer-text').textContent = I18N['footer-text'][lang];
  themeToggle.textContent = (isDark ? "☀️ " : "🌙 ") + I18N['theme-toggle'][lang];
  langToggle.textContent = '🌐 ' + I18N['lang-toggle'][lang];
  clearChatButton.textContent = I18N['clear-chat-button'][lang];
  saveChatButton.textContent = I18N['save-chat-button'][lang];
}

function renderWelcomeMessage() {
    chatMessages.innerHTML = '';
    addMessageToChat('assistant', I18N['welcome'][getLang()], { isWelcome: true });
}

function showErrorToast(msg) {
  const toast = document.getElementById('error-toast');
  toast.textContent = msg;
  toast.style.display = 'block';
  toast.style.opacity = '1';
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => { toast.style.display = 'none'; }, 300);
  }, 3000);
}

// ===== Event Listeners =====
themeToggle.addEventListener("click", () => {
  const isDark = !body.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  setTheme(isDark);
});

langToggle.addEventListener('click', () => {
  const currentLang = getLang();
  const currentIndex = LANGS.findIndex(l => l.code === currentLang);
  const nextLang = LANGS[(currentIndex + 1) % LANGS.length].code;
  setLang(nextLang);
  updateI18nUI();
  if (chatHistory.length === 0) {
      renderWelcomeMessage();
  }
});

clearChatButton.addEventListener("click", () => {
  chatHistory = [];
  renderWelcomeMessage();
});

saveChatButton.addEventListener("click", () => {
  if (chatHistory.length === 0) return;
  const lang = getLang();
  const chatText = chatHistory.map(msg => {
    const labelKey = msg.role === 'assistant' ? 'ai-label' : 'user-label';
    const label = I18N[labelKey][lang];
    const time = formatTimestamp(new Date(msg.timestamp));
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

// ===== Initialization =====
function init() {
  function detectBrowserLang() {
    const navLang = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
    if (navLang.startsWith('zh-TW') || navLang === 'zh-Hant') return 'zh-TW';
    if (navLang.startsWith('zh-CN') || navLang === 'zh-Hans') return 'zh-CN';
    if (navLang.startsWith('ja')) return 'ja';
    if (navLang.startsWith('ko')) return 'ko';
    return 'en';
  }

  const savedLang = getLang();
  if (!LANGS.some(l => l.code === savedLang)) {
    setLang(detectBrowserLang());
  }

  const savedTheme = localStorage.getItem("theme");
  setTheme(savedTheme === 'light' ? false : true); // Default dark
  
  renderWelcomeMessage();
  userInput.focus();
}

init();