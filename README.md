<div align="center">

# 📈 StockSense AI

### *Multi-Tool Conversational Market Intelligence Agent*

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-stocksenseai.onrender.com-00d084?style=for-the-badge)](https://stocksenseai-stock-analysis-agent.onrender.com)
[![Gemini](https://img.shields.io/badge/Gemini-2.0%20Flash%20Lite-4285F4?style=for-the-badge&logo=google)](https://aistudio.google.com)
[![Track](https://img.shields.io/badge/Track-Agents%20for%20Business-FF6B35?style=for-the-badge)](https://www.kaggle.com/competitions/vibecoding-agents-capstone-project)
[![Deploy](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?style=for-the-badge)](https://render.com)

<br/>

> **Ask any stock question in plain English. Get a data-backed BUY / HOLD / SELL recommendation in seconds.**
>
> *"Should I buy Apple?"* → Agent resolves ticker → fetches live prices → crawls real-time news → synthesizes recommendation

<br/>

⚠️ *Educational capstone project · Not financial advice · Always DYOR*

---

</div>

## 🎯 What Is This?

StockSenseAI is a **fully agentic** stock analysis system — not a chatbot. Built for the **Google × Kaggle 5-Day AI Agents Intensive Vibe Coding Course Capstone 2026**, it demonstrates how Gemini can act as an **orchestrator**, sequentially invoking external tools, synthesizing heterogeneous data, and dynamically updating its reasoning across a multi-turn session.

One query. Four tools. One verdict.

---

## 🤖 The 4-Step Agent Pipeline

```
╔══════════════════════════════════════════════════════════════╗
║                    USER NATURAL LANGUAGE QUERY               ║
║         "Should I buy Apple?" / "Analyze Nvidia"             ║
╚═══════════════════════════╦══════════════════════════════════╝
                            ▼
          ┌─────────────────────────────────┐
          │  🔍 TOOL 1 — Ticker Resolution  │
          │  "Apple" → AAPL                 │
          │  "Jensen Huang's company" → NVDA│
          └─────────────────┬───────────────┘
                            ▼
          ┌─────────────────────────────────┐
          │  📊 TOOL 2 — Price Aggregation  │
          │  Yahoo Finance → 30D history    │
          │  Current price + % change       │
          └─────────────────┬───────────────┘
                            ▼
          ┌─────────────────────────────────┐
          │  📰 TOOL 3 — Search Grounding   │
          │  Live news via Gemini Search    │
          │  5 headlines + sentiment scoring│
          └─────────────────┬───────────────┘
                            ▼
          ┌─────────────────────────────────┐
          │  🧠 TOOL 4 — Deep Synthesis     │
          │  BUY / HOLD / SELL              │
          │  Confidence score + reasoning   │
          └─────────────────┬───────────────┘
                            ▼
╔══════════════════════════════════════════════════════════════╗
║           STRUCTURED RESULT + LIVE AGENT TRACE LOG          ║
╚══════════════════════════════════════════════════════════════╝
```

Every tool call is logged live in the **Agent Trace Log** panel — making agentic reasoning fully transparent and auditable.

---

## ✅ Course Concepts Demonstrated

| # | Concept | Day | How It's Implemented |
|---|---------|-----|---------------------|
| 1 | **Function Calling / Tool Use** | Day 2 | 4 tools with scoped input/output contracts, invoked sequentially |
| 2 | **Google Search Grounding** | Day 2 | Gemini native `googleSearch` tool for real-time news |
| 3 | **Multi-Turn Memory & Sessions** | Day 3 | Conversation history array persisted across backend requests |
| 4 | **Responsible AI & Evaluation** | Day 4 | Disclaimer banners, volatility badges, confidence warnings, consensus tracker |
| 5 | **Production Deployment** | Day 5 | Full-stack on Render with exponential backoff + graceful error handling |

---

## 🌟 Key Demo — Emergent Dynamic Reasoning (The IREN Case)

The most compelling demonstration of StockSenseAI's true agentic behaviour:

```
Round 1:  User asks "Analyze IREN"
          → Tool 3 crawls news (mixed signals)
          → Agent returns: HOLD ⚡ Confidence: 6/10

Round 2:  User follows up: "Analyze again"
          → Tool 3 re-crawls news (finds new bearish reports + short interest spike)
          → Agent UPDATES to: SELL 🔴 Confidence: 7/10

Why? New evidence. Not a bug — this is the agent reasoning.
```

The agent didn't contradict itself. It synthesized *new information on top of existing context* — like an analyst revising their position after a breaking news alert. This is what separates a multi-tool AI agent from a static one-shot classifier.

---

## 🛡️ Responsible AI Features

- 🚨 **Persistent disclaimer banner** — "Not financial advice" on every page
- 📊 **Consensus Stability Indicator** — tracks if recommendation changes within session
- ⚠️ **Volatility badges** — flags stocks with >15% 30D price swings
- 📉 **Low confidence warnings** — alerts when score drops below 6/10
- ℹ️ **"How It Works" modal** — full pipeline explanation for end users

---

## 🏗️ Tech Stack

```
Frontend    →  React · Tailwind CSS · Recharts · Lucide React
Backend     →  Node.js · Express · ESBuild (TypeScript → CJS)
AI Core     →  @google/genai SDK · Gemini 2.0 Flash Lite
Grounding   →  Gemini native Google Search tool
Market Data →  Yahoo Finance public API (/v8/finance/chart/)
Deployment  →  Render (full-stack)
```

---

## 🔗 Links
| | |
|---|---|
| 🌐 **Live App** | https://stocksenseai-stock-analysis-agent.onrender.com |
| 📓 **Kaggle Writeup** | https://www.kaggle.com/competitions/vibecoding-agents-capstone-project |
| 🎓 **Course** | Google × Kaggle 5-Day AI Agents Intensive Vibe Coding Course 2026 |
---

<div align="center">

Built with 🤖 by [@Zalanupi](https://github.com/Zalanupi)

*Google × Kaggle AI Agents Intensive — Capstone Project 2026*

</div>
