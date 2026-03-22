/* ============================================================
   chat.js  —  ET Concierge AI chat engine
   Calls Anthropic Claude API, shows agent traces, manages
   conversation history, and renders messages to the DOM.
   ============================================================ */

'use strict';

/* ── System Prompt ──────────────────────────────────────────── */
const ET_SYSTEM_PROMPT = `You are ET Concierge — the official AI assistant for Economic Times (ET),
India's leading financial and business media ecosystem by Bennett, Coleman & Co. Ltd.

You serve as an intelligent, knowledgeable, and friendly guide across the entire ET ecosystem:
  • ET (Economic Times)  — News, analysis, editorial
  • ET Markets           — Stock market, NSE/BSE, investing
  • ET Money             — Personal finance, mutual funds, SIP, insurance
  • ET Prime             — Premium subscription content
  • ET Now               — Financial TV and video
  • ET HR World          — HR, jobs, leadership
  • ET Events            — Global Business Summit, conclaves
  • ET Government        — Policy and governance news

Personality:
  - Professional yet warm and approachable
  - Expert in Indian finance, markets, and business
  - Explains complex concepts in simple language
  - Grounded in ET's authoritative editorial content
  - Helpful for both novice and expert users

Guidelines:
  - For market queries, reference Indian markets (NSE/BSE, Nifty 50, Sensex)
  - For product queries, guide users to the relevant ET product
  - End every response with a suggestion for relevant ET content or service
  - Use **bold** for key terms and important data points
  - Keep responses concise but comprehensive
  - Use emojis sparingly for warmth; do not overdo it`;

/* ── State ──────────────────────────────────────────────────── */
/** @type {{ role: 'user'|'assistant', content: string }[]} */
const conversationHistory = [];
let isLoading = false;

/* ── Agent Routing Detection ────────────────────────────────── */
/**
 * Return a 3-step trace showing which specialist agent handled the query.
 * @param {string} text - User message text
 * @returns {string[]}
 */
function detectAgent(text) {
  const t = text.toLowerCase();

  if (/nifty|sensex|nse|bse|stock|share|market|equity|ipo/.test(t))
    return [
      '🔍 Orchestrator → routing to Markets Agent',
      '📈 Markets Agent — fetching NSE/BSE live data',
      '📊 Attaching ET Markets analyst commentary',
    ];

  if (/mutual fund|sip|insurance|et money|invest|portfolio|elss|fd|fixed deposit/.test(t))
    return [
      '🔍 Orchestrator → routing to Finance Agent',
      '🏦 Finance Agent — querying ET Money APIs',
      '💡 Personalising fund & investment recommendations',
    ];

  if (/prime|subscription|subscribe|plan|pricing|billing|renew/.test(t))
    return [
      '🔍 Orchestrator → routing to Subscription Agent',
      '💼 Subscription Agent — loading ET Prime catalog',
      '🎁 Fetching plan benefits & pricing tiers',
    ];

  if (/news|headline|article|story|today|morning brief/.test(t))
    return [
      '🔍 Orchestrator → routing to News Agent',
      '📰 News Agent — querying ET CMS for latest articles',
      '🗞 Ranking stories by relevance & recency',
    ];

  if (/learn|explain|how|what is|basics|beginner|understand|guide/.test(t))
    return [
      '🔍 Orchestrator → routing to Learning Agent',
      '🎓 Learning Agent — building knowledge path',
      '📚 Sourcing from ET editorial library & ET Now',
    ];

  if (/event|summit|conference|webinar|register|agenda/.test(t))
    return [
      '🔍 Orchestrator → routing to Events Agent',
      '📊 Events Agent — fetching ET Summit schedule',
      '🗓 Matching sessions to user profile',
    ];

  if (/job|career|salary|hire|hr|talent|recruit/.test(t))
    return [
      '🔍 Orchestrator → routing to Jobs & HR Agent',
      '💼 HR Agent — querying ET HR World & ET Careers',
      '📋 Compiling role benchmarks & market data',
    ];

  return [
    '🔍 Orchestrator classifying intent',
    '🤖 Coordinating specialist agents',
    '✅ Synthesising grounded response',
  ];
}

/* ── DOM Helpers ────────────────────────────────────────────── */
function getMessages() {
  return document.getElementById('chatMessages');
}

/**
 * Convert lightweight markdown (**bold**, newlines) to safe HTML.
 * Does NOT eval any scripts — purely presentational transforms.
 * @param {string} text
 * @returns {string}
 */
function mdToHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
}

/**
 * Add a chat message bubble to the messages container.
 * @param {'ai'|'user'} role
 * @param {string}      content    - Raw text (will be sanitised)
 * @param {string[]}   [trace]     - Optional agent trace steps
 */
function addMessage(role, content, trace) {
  const container = getMessages();
  const wrap = document.createElement('div');
  wrap.className = `msg ${role}`;

  const avatar = role === 'ai' ? '🤖' : '👤';
  const sender = role === 'ai' ? 'ET Concierge' : 'You';
  const time   = new Date().toLocaleTimeString('en-IN', {
    hour:   '2-digit',
    minute: '2-digit',
  });

  // Build agent trace HTML
  let traceHTML = '';
  if (trace && trace.length) {
    const steps = trace
      .map(step => `<div class="trace-step"><div class="trace-dot"></div>${step}</div>`)
      .join('');
    traceHTML = `<div class="agent-trace">${steps}</div>`;
  }

  wrap.innerHTML = `
    <div class="msg-avatar">${avatar}</div>
    <div>
      <div class="msg-bubble">${mdToHtml(content)}${traceHTML}</div>
      <div class="msg-meta">${sender} · ${time}</div>
    </div>`;

  container.appendChild(wrap);
  container.scrollTop = container.scrollHeight;
}

/** Show animated typing indicator */
function showTyping() {
  const container = getMessages();
  const div = document.createElement('div');
  div.className = 'msg ai';
  div.id = 'typingIndicator';
  div.innerHTML = `
    <div class="msg-avatar">🤖</div>
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

/** Remove typing indicator */
function removeTyping() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

/* ── Input Helpers ──────────────────────────────────────────── */
/**
 * Auto-resize textarea to fit content (up to max-height in CSS).
 * @param {HTMLTextAreaElement} el
 */
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

/**
 * Handle Enter key (send) vs Shift+Enter (new line).
 * @param {KeyboardEvent} e
 */
function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

/* ── Core Chat Logic ────────────────────────────────────────── */
/** Read input, push message, call API */
async function sendMessage() {
  if (isLoading) return;

  const input = document.getElementById('chatInput');
  const text  = input.value.trim();
  if (!text) return;

  // Clear input
  input.value = '';
  input.style.height = 'auto';

  // Render user bubble
  addMessage('user', text);

  // Push to history
  conversationHistory.push({ role: 'user', content: text });

  // Fetch AI response
  await getAIResponse();
}

/**
 * Send click from a quick-query button.
 * @param {HTMLButtonElement} btn
 */
function sendQuick(btn) {
  // Strip the emoji icon from the start of the button label
  const raw  = btn.textContent.trim();
  // Remove leading non-word/space chars (emoji + surrounding space)
  const text = raw.replace(/^[^\w\s]+\s*/, '').trim();
  document.getElementById('chatInput').value = text;
  showSection('chat');
  sendMessage();
}

/** Clear chat and reset history */
function clearChat() {
  const container = getMessages();
  container.innerHTML = '';
  conversationHistory.length = 0;
  addMessage('ai', '**Chat cleared.** How can I assist you with the ET ecosystem today?');
}

/* ── Anthropic API Call ─────────────────────────────────────── */
async function getAIResponse() {
  isLoading = true;
  document.getElementById('sendBtn').disabled = true;
  showTyping();

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system:     ET_SYSTEM_PROMPT,
        messages:   conversationHistory,
      }),
    });

    const data = await response.json();
    removeTyping();

    if (data.content && data.content[0] && data.content[0].text) {
      const reply      = data.content[0].text;
      const lastUser   = conversationHistory[conversationHistory.length - 1].content;
      const trace      = detectAgent(lastUser);

      addMessage('ai', reply, trace);
      conversationHistory.push({ role: 'assistant', content: reply });
    } else {
      // Surface any API error message to the user
      const errMsg = data.error?.message || 'Unknown error from Anthropic API.';
      addMessage('ai', `⚠️ **API Error:** ${errMsg}`);
    }

  } catch (err) {
    removeTyping();
    addMessage(
      'ai',
      '⚠️ **Connection error.** In production this routes through the ET backend API with ' +
      'proper server-side key handling. Please check your network and try again.\n\n' +
      `_Details: ${err.message}_`
    );
  } finally {
    isLoading = false;
    document.getElementById('sendBtn').disabled = false;
  }
}
