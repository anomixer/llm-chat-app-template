'''/**
 * LLM Chat App Frontend (v3 - Stable Rewrite)
 *
 * This version is a complete rewrite to ensure stability and includes all
 * previously discussed features.
 */
document.addEventListener('DOMContentLoaded', () => {

  // ===== 1. DOM Element Retrieval =====
  const chatMessages = document.getElementById("chat-messages");
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");
  const typingIndicator = document.getElementById("typing-indicator");
  const themeToggle = document.getElementById("theme-toggle");
  const langToggle = document.getElementById("lang-toggle");
  const clearChatButton = document.getElementById("clear-chat-button");
  const saveChatButton = document.getElementById("save-chat-button");
  const body = document.getElementById("body");

  // ===== 2. State Management =====
  let chatHistory = [];
  let isProcessing = false;

  // ===== 3. Localization & Constants =====
  const LANGS = [
    { code: 'en', label: 'English' },
    { code: 'zh-TW', label: '繁體中文' },
    { code: 'zh-CN', label: '简体中文' },
    { code: 'ja', label: '日本語' },
    { code: 'ko', label: '한국어' },
  ];
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

  // ===== 4. Helper Functions =====
  const getLang = () => localStorage.getItem('lang') || 'en';
  const setLang = (lang) => localStorage.setItem('lang', lang);
  const getThemeIsDark = () => body.classList.contains("dark");
  const formatTimestamp = (ts) => `(${ts.getHours().toString().padStart(2, '0')}:${ts.getMinutes().toString().padStart(2, '0')}:${ts.getSeconds().toString().padStart(2, '0')})`;

  function detectBrowserLang() {
    const navLang = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
    if (navLang.startsWith('zh-TW') || navLang === 'zh-Hant') return 'zh-TW';
    if (navLang.startsWith('zh-CN') || navLang === 'zh-Hans') return 'zh-CN';
    if (navLang.startsWith('ja')) return 'ja';
    if (navLang.startsWith('ko')) return 'ko';
    return 'en';
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

  // ===== 5. UI Update Functions =====
  function setTheme(isDark) {
    body.classList.toggle("dark", isDark);
    themeToggle.textContent = (isDark ? "☀️ " : "🌙 ") + I18N['theme-toggle'][getLang()];
  }

  function updateUIForLanguage() {
    const lang = getLang();
    // Set text for all elements with a data-i18n key
    document.querySelectorAll('[data-i18n-key]').forEach(el => {
        const key = el.getAttribute('data-i18n-key');
        if (el.placeholder !== undefined) {
            el.placeholder = I18N[key][lang];
        } else {
            el.textContent = I18N[key][lang];
        }
    });
    // Handle complex buttons separately to include icons
    langToggle.textContent = '🌐 ' + I18N['lang-toggle'][lang];
    clearChatButton.textContent = I18N['clear-chat-button'][lang];
    saveChatButton.textContent = I18N['save-chat-button'][lang];
    // Re-apply theme to update theme button text
    setTheme(getThemeIsDark());
  }

  // ===== 6. Core Chat Functions =====
  function addMessageToChat(role, content, options = {}) {
    const { isWelcome = false, timestamp = new Date() } = options;
    
    const messageEl = document.createElement("div");
    messageEl.className = `message ${role}-message`;

    const labelKey = role === 'assistant' ? 'ai-label' : 'user-label';
    const labelText = I18N[labelKey][getLang()];
    
    let fullLabel;
    if (isWelcome) {
        // Welcome message has no timestamp
        fullLabel = labelText + ':';
        messageEl.setAttribute('data-welcome', '1');
    } else {
        fullLabel = `${labelText} ${formatTimestamp(timestamp)}:`;
    }

    messageEl.innerHTML = `<div class="msg-label">${fullLabel}</div><div class="msg-content"></div>`;
    messageEl.querySelector('.msg-content').innerHTML = window.marked.parse(content);

    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageEl;
  }

  function renderWelcomeMessage() {
    chatMessages.innerHTML = '';
    addMessageToChat('assistant', I18N['welcome'][getLang()], { isWelcome: true });
  }

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

    const assistantMessageEl = addMessageToChat("assistant", "", { timestamp: new Date() });
    assistantMessageEl.querySelector('.msg-content').innerHTML = '<span class="thinking-dot">.</span><span class="thinking-dot">.</span><span class="thinking-dot">.</span>';
    assistantMessageEl.querySelector('.msg-label').textContent = I18N['ai-label'][getLang()] + ':';


    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [
          { role: 'system', content: SYSTEM_PROMPT[getLang()] },
          ...chatHistory
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
        const lines = chunk.split("
");

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
                  assistantMessageEl.querySelector('.msg-content').innerHTML = ''; // Clear thinking dots
                }
                responseText += data.response;
                assistantMessageEl.querySelector(".msg-content").innerHTML = window.marked.parse(responseText);
                chatMessages.scrollTop = chatMessages.scrollHeight;
              }
            } catch (e) {
              // Ignore lines that are not valid JSON
            }
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

  // ===== 7. Event Listeners =====
  function setupEventListeners() {
    sendButton.addEventListener("click", sendMessage);
    userInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    userInput.addEventListener("input", function () {
      this.style.height = "auto";
      this.style.height = this.scrollHeight + "px";
    });

    themeToggle.addEventListener("click", () => {
      const isDark = !getThemeIsDark();
      localStorage.setItem("theme", isDark ? "dark" : "light");
      setTheme(isDark);
    });

    langToggle.addEventListener('click', () => {
      const currentLang = getLang();
      const currentIndex = LANGS.findIndex(l => l.code === currentLang);
      const nextLang = LANGS[(currentIndex + 1) % LANGS.length].code;
      setLang(nextLang);
      updateUIForLanguage();
      // If only welcome message is present, re-render it in new language
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
        return `${label} ${time}:
${msg.content}`;
      }).join('

');

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
  }

  // ===== 8. Initialization =====
  function init() {
    // Assign i18n keys to elements that need text updates
    document.getElementById('header-title').setAttribute('data-i18n-key', 'header-title');
    document.getElementById('header-desc').setAttribute('data-i18n-key', 'header-desc');
    document.getElementById('typing-text').setAttribute('data-i18n-key', 'typing-text');
    document.getElementById('user-input').setAttribute('data-i18n-key', 'user-input');
    document.getElementById('send-button').setAttribute('data-i18n-key', 'send-button');
    document.getElementById('footer-text').setAttribute('data-i18n-key', 'footer-text');

    // Set initial language
    const savedLang = getLang();
    if (!LANGS.some(l => l.code === savedLang)) {
      setLang(detectBrowserLang());
    }

    // Set initial theme (default to dark)
    const savedTheme = localStorage.getItem("theme");
    setTheme(savedTheme === 'light' ? false : true);
    
    setupEventListeners();
    updateUIForLanguage();
    renderWelcomeMessage();
    userInput.focus();
  }

  init();
});
''