StockSenseAI — Multi-Tool Conversational Market Intelligence Agent
⚠️ Disclaimer: StockSenseAI is a capstone educational research project. This does not constitute certified financial advice. Always do your own research before making investment decisions.

🔗 Live Demo: https://stocksenseai-stock-analysis-agent.onrender.com

Built for the Google × Kaggle 5-Day AI Agents: Intensive Vibe Coding Course — Capstone Project 2026

What It Does:
StockSenseAI converts a plain English investor query — "Should I buy Apple?" or "Analyze Nvidia" — into a structured BUY / HOLD / SELL recommendation by autonomously executing a 4-step multi-tool reasoning chain powered by Gemini.

This is not a chatbot. It is a fully agentic system where Gemini acts as an orchestrator, invoking external tools, synthesizing heterogeneous data sources, and dynamically updating its reasoning across a multi-turn conversation session.

Key Feature: Emergent Dynamic Reasoning
During testing with IREN (Iris Energy), the agent demonstrated emergent multi-turn reasoning:

- First query → Agent returns HOLD (mixed signals, 6/10 confidence)
- Follow-up query → Agent re-invokes Tool 3, finds new bearish news → dynamically updates to SELL

The agent did not contradict itself — it synthesized new evidence on top of existing context, exactly like an analyst revising their position after a breaking news alert. This is the core behaviour that distinguishes a multi-tool agent from a static one-shot classifier.

Responsible AI
StockSenseAI implements several responsible AI design patterns:
- Persistent disclaimer banner on all pages
- Consensus Stability Indicator — tracks if recommendation changes across session
- Volatility warning badges for stocks with >15% 30-day price swings
- Confidence threshold warnings for scores below 6/10
- Transparent "How It Works" modal explaining every step of the agent pipeline

Project Links
🌐 Live App: https://stocksenseai-stock-analysis-agent.onrender.com
📓 Kaggle Writeup: https://www.kaggle.com/competitions/vibecoding-agents-capstone-project
🎓 Course: Google × Kaggle 5-Day AI Agents Intensive Vibe Coding Course

Built by Hamzah · Google × Kaggle AI Agents Intensive Capstone 2026
