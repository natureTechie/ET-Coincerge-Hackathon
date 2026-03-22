# ET Concierge — Agentic AI Platform
### Prototype - · Economic Times Ecosystem

---

## Project Structure

```
et-concierge/
│
├── index.html                  ← Single entry point (open this in browser)
│
├── css/
│   ├── base.css                ← CSS variables, reset, shared utilities
│   ├── nav.css                 ← Top navigation bar
│   ├── home.css                ← Hero, agent cards, product logos, tech stack
│   ├── chat.css                ← Live AI chat interface
│   ├── architecture.css        ← System design diagram
│   ├── usecases.css            ← Use case cards grid
│   └── animations.css          ← Keyframes & motion utilities
│
├── js/
│   ├── nav.js                  ← Tab navigation between sections
│   └── chat.js                 ← AI chat engine (Anthropic Claude API)
│
└── assets/
    └── icons/                  ← 43 custom SVG icons
        ├── et-logo.svg
        ├── et-markets.svg      ← ET product logos
        ├── et-money.svg
        ├── et-prime.svg
        ├── et-now.svg
        ├── et-hrworld.svg
        ├── et-events.svg
        ├── agent-*.svg         ← AI agent icons (8 agents)
        ├── ch-*.svg            ← Input channel icons
        ├── gw-*.svg            ← Gateway layer icons
        ├── db-*.svg            ← Data layer icons
        ├── llm-*.svg           ← LLM layer icons
        ├── uc-*.svg            ← Use case icons
        └── send.svg            ← Chat send button icon
```

---

## How to Run

### Option A — Open directly in browser
Just double-click `index.html` — no server required.

### Option B — Local dev server (recommended)
```bash
# Python
python3 -m http.server 8080

# Node.js
npx serve .

# Then open: http://localhost:8080
```

---

## Prototype Sections

| Tab | Description |
|-----|-------------|
| 🏠 Overview | Hero, 8 AI agent cards with live status, ET product logos, full tech stack |
| 💬 Live Demo | Real Claude AI chat, 8 quick queries, multi-agent routing traces |
| 🏗 Architecture | 6-layer system design: Channels → Gateway → Orchestrator → Agents → Data → LLM |
| 📋 Use Cases | 9 detailed use cases across the ET ecosystem |

---

## AI Chat — How It Works

The chat tab calls the Anthropic Claude API directly with a full ET Concierge system prompt.

```
User message
    → chat.js: sendMessage()
    → conversationHistory[] updated
    → fetch POST /v1/messages (Claude Sonnet)
    → detectAgent() classifies intent → shows trace
    → addMessage() renders AI bubble + agent trace
```

Agent routing is simulated client-side via regex on the user message. In production this would be a LangGraph orchestration layer on the backend.

---

## System Architecture (6 Layers)

```
┌─────────────────────────────────────────────────┐
│  INPUT CHANNELS                                 │
│  ET Web · ET Mobile · WhatsApp · ET Now · API   │
└────────────────────┬────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  API GATEWAY & AUTH                             │
│  SSO · Rate Limiter · WebSocket · Redis Session │
└────────────────────┬────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  ORCHESTRATOR (LangGraph)                       │
│  Intent Classification · Routing · Memory       │
└────────────────────┬────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  SPECIALIST AGENTS                              │
│  Markets · News · Finance · Subscription        │
│  Learning · Events · Jobs · Enterprise          │
└────────────────────┬────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  DATA LAYER                                     │
│  Pinecone RAG · NSE/BSE · ET CMS                │
│  ET Money APIs · ET Products DB                 │
└────────────────────┬────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  LLM INFERENCE                                  │
│  Claude (Anthropic) · Embeddings · Guardrails   │
└─────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| LLM | Claude (Anthropic) — claude-sonnet-4 |
| Orchestration | LangGraph (multi-agent graph) |
| Vector Store | Pinecone (RAG for ET content) |
| Backend | Node.js + Express |
| Frontend | Vanilla HTML/CSS/JS (this prototype) |
| Real-time | WebSocket streaming |
| Session Cache | Redis |
| Event Bus | Apache Kafka |
| Database | PostgreSQL |
| Infra | Docker + Kubernetes |
| Market Data | NSE/BSE Live Feed APIs |

---

## Use Cases

1. Intelligent Market Assistant — Live NSE/BSE, watchlists, ET Markets analysis
2. Personalised News Digest — AI-summarised ET articles, topic discovery
3. ET Money Financial Advisor — SIP, mutual funds, ELSS, insurance
4. Financial Literacy Companion — Learning tracks, ET Now videos
5. ET Prime Smart Concierge — Subscription discovery, billing support
6. ET Events & Summits Guide — Agenda personalisation, registration
7. Macro & Policy Intelligence — RBI, Budget, Fed analysis
8. ET HR World Career Advisor — Jobs, salary benchmarks, upskilling
9. B2B & Enterprise Solutions — ET Intelligence, custom research

---

Built for Economic Times Ecosystem · Agentic AI Prototype 







