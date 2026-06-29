import React, { useState, useEffect, useRef } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Sparkles, 
  ArrowUp, 
  ChevronDown, 
  ChevronUp, 
  Moon, 
  Sun, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Code, 
  CornerDownRight, 
  Terminal,
  Loader,
  ArrowRight,
  Info,
  X
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from "recharts";

// Helper to render basic markdown bold text and highlight key recommendation words
const renderMarkdown = (text: string) => {
  if (!text) return "";
  const regex = /(\*\*.*?\*\*|"[Bb]uy"|"[Hh]old"|"[Ss]ell"|"[bB][uU][yY]"|"[hH][oO][lL][dD]"|"[sS][eE][lL][lL]"|\b(?:BUY|HOLD|SELL)\b)/g;
  const parts = text.split(regex);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const clean = part.slice(2, -2);
      return (
        <strong key={index} className="font-extrabold text-[#00d084]">
          {clean}
        </strong>
      );
    }
    if (part.startsWith('"') && part.endsWith('"')) {
      const clean = part.slice(1, -1);
      if (["buy", "hold", "sell"].includes(clean.toLowerCase())) {
        return (
          <span key={index}>
            "
            <strong className="font-extrabold text-[#00d084]">
              {clean}
            </strong>
            "
          </span>
        );
      }
    }
    if (["BUY", "HOLD", "SELL"].includes(part)) {
      return (
        <strong key={index} className="font-extrabold text-[#00d084]">
          {part}
        </strong>
      );
    }
    return part;
  });
};

interface HistoryItem {
  date: string;
  close: number;
}

interface PriceData {
  ticker: string;
  current_price: number;
  percent_change: number;
  history: HistoryItem[];
  api_success?: boolean;
  error?: string;
}

interface NewsItem {
  headline: string;
  source: string;
  sentiment: "positive" | "negative" | "neutral" | string;
}

interface AnalysisResult {
  ticker: string;
  recommendation: "BUY" | "HOLD" | "SELL";
  confidence: number;
  summary: string;
  positives: string[];
  risks: string[];
  price_data: PriceData;
  news: NewsItem[];
}

interface AgentTrace {
  tool: string;
  input: any;
  output: any;
  error?: string | null;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  analysis?: AnalysisResult;
  traces?: AgentTrace[];
}

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Conversations and memory state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [thinkingStep, setThinkingStep] = useState<string>("");
  
  // Current highlighted stock analysis result (displayed in main split dashboard)
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisResult | null>(null);
  const [activeTraces, setActiveTraces] = useState<AgentTrace[]>([]);

  // Disclaimer banner state
  const [showBanner, setShowBanner] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("stocksense_disclaimer_dismissed");
      return saved !== "true";
    }
    return true;
  });

  // Modal open state
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false);

  // Analysis history per ticker to calculate stability/consensus
  const [analysisHistory, setAnalysisHistory] = useState<Record<string, string[]>>({});

  const dismissBanner = () => {
    setShowBanner(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("stocksense_disclaimer_dismissed", "true");
    }
  };
  
  // Accordion lists
  const [positivesOpen, setPositivesOpen] = useState<boolean>(true);
  const [risksOpen, setRisksOpen] = useState<boolean>(true);
  const [tracesOpen, setTracesOpen] = useState<boolean>(false);

  // Chat message container ref for auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages or thinking status
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Sync dark class on body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Handle stock analysis trigger
  const handleQuery = async (queryText: string) => {
    if (!queryText.trim() || isThinking) return;

    const userMsgId = Date.now().toString();
    const newUserMessage: ChatMessage = {
      id: userMsgId,
      role: "user",
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setSearchQuery("");
    setIsThinking(true);
    setThinkingStep("Parsing natural language intent...");

    // Setup progressive simulator messages for visual engagement
    const thinkingTimers: NodeJS.Timeout[] = [];
    const steps = [
      { delay: 1500, text: "Resolving stock company name & ticker symbol..." },
      { delay: 3500, text: "Retrieving official 1-month market price history..." },
      { delay: 5500, text: "Google Search Grounding: Fetching recent news & sentiment..." },
      { delay: 7500, text: "Synthesizing signals & formulating rating recommendation..." }
    ];

    steps.forEach(step => {
      const t = setTimeout(() => {
        setThinkingStep(step.text);
      }, step.delay);
      thinkingTimers.push(t);
    });

    try {
      // Map frontend messages format to backend expectation
      const payloadMessages = updatedMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages })
      });

      thinkingTimers.forEach(clearTimeout);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (${res.status})`);
      }

      const data = await res.json();

      const assistantMsgId = (Date.now() + 1).toString();
      const newAssistantMessage: ChatMessage = {
        id: assistantMsgId,
        role: "assistant",
        content: data.reply || "I have analyzed that stock based on your query.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        analysis: data.analysisResult || undefined,
        traces: data.traces || []
      };

      setMessages(prev => [...prev, newAssistantMessage]);

      if (data.analysisResult) {
        const t = data.analysisResult.ticker.toUpperCase();
        const r = data.analysisResult.recommendation.toUpperCase();
        setAnalysisHistory(prev => {
          const existing = prev[t] || [];
          return {
            ...prev,
            [t]: [...existing, r]
          };
        });

        setActiveAnalysis(data.analysisResult);
        setActiveTraces(data.traces || []);
        // Auto open details
        setPositivesOpen(true);
        setRisksOpen(true);
      }
    } catch (err: any) {
      thinkingTimers.forEach(clearTimeout);
      console.error(err);
      
      const systemErrorId = (Date.now() + 2).toString();
      setMessages(prev => [
        ...prev,
        {
          id: systemErrorId,
          role: "assistant",
          content: `⚠️ Error: ${err.message || "Failed to contact analysis agent. Please check your network and try again."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsThinking(false);
      setThinkingStep("");
    }
  };

  const getRecommendationStyles = (rec?: string) => {
    switch (rec?.toUpperCase()) {
      case "BUY":
        return {
          textColor: "text-[#00d084]",
          bgColor: "bg-[#111827]",
          borderColor: "border-[#00d084]/30",
          glowClass: "shadow-[0_0_20px_rgba(0,208,132,0.05)]",
          badgeClass: "bg-[#00d084] text-[#0a0e1a] shadow-[0_0_15px_rgba(0,208,132,0.4)]"
        };
      case "SELL":
        return {
          textColor: "text-[#ff4757]",
          bgColor: "bg-[#111827]",
          borderColor: "border-[#ff4757]/30",
          glowClass: "shadow-[0_0_20px_rgba(255,71,87,0.05)]",
          badgeClass: "bg-[#ff4757] text-white shadow-[0_0_15px_rgba(255,71,87,0.4)]"
        };
      case "HOLD":
        return {
          textColor: "text-yellow-400",
          bgColor: "bg-[#111827]",
          borderColor: "border-yellow-400/30",
          glowClass: "shadow-[0_0_20px_rgba(250,204,21,0.05)]",
          badgeClass: "bg-yellow-400 text-[#0a0e1a] shadow-[0_0_15px_rgba(250,204,21,0.4)]"
        };
      default:
        return {
          textColor: "text-blue-400",
          bgColor: "bg-[#111827]",
          borderColor: "border-blue-500/30",
          glowClass: "shadow-[0_0_20px_rgba(59,130,246,0.05)]",
          badgeClass: "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]"
        };
    }
  };

  const recStyles = getRecommendationStyles(activeAnalysis?.recommendation);

  // Quick Action Tickers handler
  const handleQuickTicker = (ticker: string, companyName: string) => {
    handleQuery(`Analyze ${companyName} (${ticker})`);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      darkMode 
        ? "bg-[#0a0e1a] text-[#e5e7eb]" 
        : "bg-slate-50 text-slate-900"
    }`}>
      {/* Disclaimer Banner */}
      {showBanner && (
        <div className="bg-[#f59e0b] text-slate-950 px-8 py-2 relative flex items-center justify-center z-[60] font-medium text-[11px] sm:text-xs shadow-sm">
          <div className="max-w-6xl text-center pr-6 leading-normal">
            <span>⚠️ <strong>StockSense AI is for informational and educational purposes only.</strong> This is NOT financial advice. Always do your own research before making investment decisions. Past performance does not guarantee future results.</span>
          </div>
          <button 
            onClick={dismissBanner}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-950/10 rounded-full transition-all cursor-pointer text-slate-950"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navbar */}
      <nav className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${
        darkMode 
          ? "bg-[#111827] border-[#1f2937]" 
          : "bg-white border-slate-200 shadow-sm"
      }`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#00d084] rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(0,208,132,0.3)]">
              <div className="w-4 h-4 bg-[#0a0e1a] rotate-45"></div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-xl font-bold tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                  StockSense <span className="text-[#00d084]">AI</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium">by Hamzah</span>
              </div>
              <span className="text-[9px] block font-mono text-[#00d084] tracking-wider uppercase">AI Agent · Real Data · Smarter Decisions</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              id="theme-toggle"
              className={`p-2.5 rounded-xl transition-all duration-200 border cursor-pointer hover:scale-105 active:scale-95 ${
                darkMode 
                  ? "bg-[#1f2937] border-[#374151] text-[#ffd32a] hover:bg-slate-800" 
                  : "bg-white border-slate-200 text-slate-750 hover:bg-slate-100 shadow-sm"
              }`}
              title="Toggle color theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-6 flex flex-col gap-6">
        
        {/* Search Hero Section */}
        <div className="w-full max-w-2xl mx-auto text-center flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <h1 className={`font-display text-3xl sm:text-4xl font-extrabold tracking-tight ${
              darkMode ? "text-white" : "text-slate-900"
            }`}>
              Conversational Market Intelligence
            </h1>
            <p className={`text-xs sm:text-sm max-w-lg mx-auto ${
              darkMode ? "text-slate-450" : "text-slate-650"
            }`}>
              Ask questions in plain English. Our specialized agent resolves tickers, gathers price history, and crawls live news using real-time data and multi-tool AI reasoning.
            </p>
          </div>

          {/* Large search bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleQuery(searchQuery);
            }}
            className="relative flex items-center group w-full"
          >
            <div className="absolute left-4 text-[#9ca3af]">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask me about any stock... e.g. 'Should I buy Apple?'"
              className={`w-full h-14 pl-12 pr-28 rounded-xl font-sans text-sm sm:text-base border-2 transition-all duration-300 outline-none ${
                darkMode
                  ? "bg-[#111827] border-[#00d084] text-[#e5e7eb] placeholder-[#9ca3af] shadow-[0_0_15px_rgba(0,208,132,0.1)] focus:ring-2 focus:ring-[#00d084]/20"
                  : "bg-white border-[#00d084] text-slate-900 placeholder-slate-400 shadow-[0_0_15px_rgba(0,208,132,0.1)] focus:ring-2 focus:ring-[#00d084]/20"
              }`}
            />
            <button
              type="submit"
              disabled={isThinking || !searchQuery.trim()}
              id="search-submit"
              className="absolute right-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold bg-[#00d084] hover:bg-[#00d084]/90 active:bg-[#00c07a] text-[#0a0e1a] transition-all duration-200 flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(0,208,132,0.2)]"
            >
              Analyze
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick-action pill buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mr-1">Quick Picks:</span>
            <button
              onClick={() => handleQuickTicker("NVDA", "Nvidia")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                activeAnalysis?.ticker === "NVDA"
                  ? "bg-[#1f2937] border border-[#00d084] text-[#00d084] shadow-[0_0_8px_rgba(0,208,132,0.2)]"
                  : darkMode
                    ? "bg-[#1f2937] border border-[#374151] text-[#9ca3af] hover:text-white"
                    : "bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200"
              }`}
            >
              📈 NVDA
            </button>
            <button
              onClick={() => handleQuickTicker("AAPL", "Apple")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                activeAnalysis?.ticker === "AAPL"
                  ? "bg-[#1f2937] border border-[#00d084] text-[#00d084] shadow-[0_0_8px_rgba(0,208,132,0.2)]"
                  : darkMode
                    ? "bg-[#1f2937] border border-[#374151] text-[#9ca3af] hover:text-white"
                    : "bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200"
              }`}
            >
              🍎 AAPL
            </button>
            <button
              onClick={() => handleQuickTicker("TSLA", "Tesla")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                activeAnalysis?.ticker === "TSLA"
                  ? "bg-[#1f2937] border border-[#00d084] text-[#00d084] shadow-[0_0_8px_rgba(0,208,132,0.2)]"
                  : darkMode
                    ? "bg-[#1f2937] border border-[#374151] text-[#9ca3af] hover:text-white"
                    : "bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200"
              }`}
            >
              ⚡ TSLA
            </button>
          </div>
        </div>

        {/* Empty state & Loading state indicator */}
        {!activeAnalysis && !isThinking && (
          <div className={`flex flex-col items-center justify-center py-16 text-center gap-4 border-2 border-dashed rounded-2xl p-8 ${
            darkMode ? "border-[#1f2937] bg-[#111827]/30" : "border-slate-200 bg-slate-50/50"
          }`}>
            <div className="w-12 h-12 rounded-full bg-[#00d084]/10 border border-[#00d084]/30 flex items-center justify-center text-[#00d084] animate-pulse">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="max-w-sm">
              <p className={`font-display font-extrabold text-lg ${darkMode ? "text-white" : "text-slate-900"}`}>
                StockSense Decision Hub
              </p>
              <p className="text-xs text-[#9ca3af] mt-1 leading-relaxed">
                Ask questions about any equity. Our deep integration maps stock tickers, audits live web articles, draws price indicators, and writes automated conviction ratings.
              </p>
            </div>
          </div>
        )}

        {/* Shimmer Skeleton thinking panel */}
        {isThinking && (
          <div className="w-full flex flex-col gap-6">
            <div className={`p-6 rounded-2xl border ${
              darkMode ? "bg-[#111827] border-[#1f2937]" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-dashed dark:border-slate-800 border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#00d084]/10 text-[#00d084] animate-spin">
                    <Loader className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Agent executing sequential workflows...</h3>
                    <p className="text-xs text-[#00d084] font-mono mt-0.5 animate-pulse">{thinkingStep}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#1f2937] border border-[#374151] text-[#00d084] shadow-[0_0_8px_rgba(0,208,132,0.1)]">STATUS: COMPUTING</span>
              </div>

              {/* Skeleton Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
                <div className="lg:col-span-3 flex flex-col gap-4">
                  <div className="h-8 w-2/3 animate-shimmer rounded-lg bg-[#1f2937]" />
                  <div className="h-20 w-full animate-shimmer rounded-xl bg-[#1f2937]" />
                  <div className="h-10 w-full animate-shimmer rounded-lg bg-[#1f2937]" />
                  <div className="h-28 w-full animate-shimmer rounded-xl bg-[#1f2937]" />
                </div>
                <div className="lg:col-span-2">
                  <div className="h-64 w-full animate-shimmer rounded-2xl bg-[#1f2937]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Panels Area (Appears once analysis is populated) */}
        {activeAnalysis && !isThinking && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Left Column: AI Recommendation Card (60%) */}
            <div className={`lg:col-span-3 flex flex-col gap-6 p-6 rounded-2xl border transition-all duration-300 ${
              darkMode 
                ? `${recStyles.bgColor} ${recStyles.borderColor} ${recStyles.glowClass}` 
                : "bg-white border-slate-200 shadow-lg shadow-slate-100"
            }`}>
              
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h2 className={`text-4xl font-black tracking-tighter ${darkMode ? "text-white" : "text-slate-900"}`}>
                      {activeAnalysis.ticker}
                    </h2>
                    <span className="text-[#9ca3af] text-xl font-mono">${activeAnalysis.price_data.current_price?.toFixed(2)}</span>
                    
                    {/* Volatility Warning Badge */}
                    {(() => {
                      const change = activeAnalysis.price_data.percent_change || 0;
                      const absChange = Math.abs(change);
                      if (absChange > 15) {
                        return (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-red-500 flex items-center gap-1">
                            ⚠️ HIGH VOLATILITY
                          </span>
                        );
                      } else if (absChange >= 8) {
                        return (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center gap-1">
                            📈 ELEVATED VOLATILITY
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#9ca3af] font-semibold">
                    Ticker: {activeAnalysis.ticker} • Verified Equity • Market Grounding
                  </p>

                  {/* Consensus & Flip Indicator Row */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {/* Consensus Indicator */}
                    {(() => {
                      const tickerKey = activeAnalysis.ticker.toUpperCase();
                      const history = analysisHistory[tickerKey] || [];
                      if (history.length > 0) {
                        const counts: Record<string, number> = {};
                        history.forEach(rec => {
                          counts[rec] = (counts[rec] || 0) + 1;
                        });
                        let majorityRec = history[history.length - 1];
                        let maxCount = 0;
                        Object.entries(counts).forEach(([rec, count]) => {
                          if (count > maxCount) {
                            maxCount = count;
                            majorityRec = rec;
                          }
                        });
                        return (
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                            darkMode ? "bg-[#111827] border-[#1f2937] text-slate-350" : "bg-slate-100 border-slate-200 text-slate-700"
                          }`}>
                            📊 Consensus: {maxCount}/{history.length} analyses suggest {majorityRec}
                          </span>
                        );
                      }
                      return null;
                    })()}

                    {/* Flip Warning Badge */}
                    {(() => {
                      const tickerKey = activeAnalysis.ticker.toUpperCase();
                      const history = analysisHistory[tickerKey] || [];
                      if (history.length > 1 && history[history.length - 1] !== history[history.length - 2]) {
                        return (
                          <div className="relative group flex items-center">
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center gap-1 cursor-help animate-pulse">
                              ⚡ Updated — new data changed this recommendation
                            </span>
                            {/* Hover tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-slate-950 text-white text-[11px] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 border border-slate-800 z-20 font-normal leading-relaxed text-center">
                              The agent found new information that updated its analysis. This is normal for volatile stocks.
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-950"></div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className={`px-6 py-2 font-black text-2xl rounded-lg scale-110 shadow-md ${recStyles.badgeClass}`}>
                    {activeAnalysis.recommendation}
                  </div>
                  <div className="mt-4 flex flex-col items-end">
                    <span className="text-[10px] uppercase font-bold text-[#9ca3af] mb-1">Confidence Score</span>
                    <div className="w-32 h-2 bg-[#1f2937] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${activeAnalysis.confidence * 10}%`,
                          backgroundColor: activeAnalysis.recommendation === "BUY" ? "#00d084" : activeAnalysis.recommendation === "SELL" ? "#ff4757" : "#ffd32a"
                        }}
                      ></div>
                    </div>
                    <span className="font-mono text-xs mt-1 font-bold" style={{ color: activeAnalysis.recommendation === "BUY" ? "#00d084" : activeAnalysis.recommendation === "SELL" ? "#ff4757" : "#ffd32a" }}>
                      {activeAnalysis.confidence * 10}%
                    </span>
                    {/* Confidence Threshold Warning */}
                    {activeAnalysis.confidence < 6 && (
                      <div className="mt-2 flex items-start gap-1 text-right justify-end max-w-[200px] text-[10px] text-[#f59e0b] leading-tight font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>Low confidence — insufficient data for strong conviction. Consider waiting for clearer signals.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid of details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 mt-4 pt-6 border-t border-[#1f2937]/50">
                
                {/* Catalyst Positives */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs uppercase font-bold text-[#00d084] mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#00d084] rounded-full"></span> Key Positives
                    </h3>
                    <ul className="text-sm text-[#d1d5db] space-y-2">
                      {activeAnalysis.positives.map((item, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="text-[#00d084] font-bold">•</span>
                          <span className={`opacity-80 ${darkMode ? "text-slate-200" : "text-slate-700"}`}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Strategic Risks & Summary Quote */}
                <div className="space-y-4 border-l border-[#1f2937]/40 pl-6">
                  <div>
                    <h3 className="text-xs uppercase font-bold text-[#ff4757] mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#ff4757] rounded-full"></span> Strategic Risks
                    </h3>
                    <ul className="text-sm text-[#d1d5db] space-y-2">
                      {activeAnalysis.risks.map((item, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="text-[#ff4757] font-bold">•</span>
                          <span className={`opacity-80 ${darkMode ? "text-slate-200" : "text-slate-700"}`}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={`p-3 rounded-lg border ${
                    darkMode ? "bg-[#0a0e1a]/50 border-[#1f2937]" : "bg-slate-50 border-slate-200"
                  }`}>
                    <p className="text-xs italic text-[#9ca3af] leading-relaxed">
                      "{renderMarkdown(activeAnalysis.summary)}"
                    </p>
                  </div>
                </div>

              </div>

              {/* Disclaimer footer on card */}
              <div className="text-center text-[10px] text-[#9ca3af] italic mt-4 pt-3 border-t border-[#1f2937]/30">
                AI-generated analysis only · Not financial advice · DYOR
              </div>
            </div>

            {/* Right Column: Recharts Market Visualizer (40%) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className={`p-6 rounded-2xl border flex flex-col justify-between h-full transition-all duration-300 ${
                darkMode ? "bg-[#111827] border-[#1f2937]" : "bg-white border-slate-200 shadow-sm"
              }`}>
                
                {/* Visualizer header */}
                <div className="flex items-center justify-between pb-3 border-b dark:border-[#1f2937] border-slate-100">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4.5 h-4.5 text-[#00d084]" />
                    <span className="font-display font-extrabold text-xs uppercase tracking-wider text-[#9ca3af]">30D Price Performance</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#4b5563] uppercase font-bold">INTERVAL: 1D</span>
                </div>

                {/* API Status Notification (if failed / simulated fallback data used) */}
                {activeAnalysis.price_data.error && (
                  <div className="my-2.5 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] leading-relaxed flex gap-2 items-start">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{activeAnalysis.price_data.error}</span>
                  </div>
                )}

                {/* Recharts Component Container matching design */}
                <div className="flex-1 bg-[#0a0e1a] rounded-lg border border-[#1f2937] p-4 relative overflow-hidden my-4 min-h-[180px]">
                  {activeAnalysis.price_data.history && activeAnalysis.price_data.history.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={activeAnalysis.price_data.history}
                          margin={{ top: 10, right: 5, left: -20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop 
                                offset="0%" 
                                stopColor={activeAnalysis.recommendation === "BUY" ? "#00d084" : activeAnalysis.recommendation === "SELL" ? "#ff4757" : "#ffd32a"} 
                                stopOpacity={0.2}
                              />
                              <stop 
                                offset="100%" 
                                stopColor={activeAnalysis.recommendation === "BUY" ? "#00d084" : activeAnalysis.recommendation === "SELL" ? "#ff4757" : "#ffd32a"} 
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <XAxis 
                            dataKey="date" 
                            stroke="#4b5563" 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(str) => {
                              try {
                                const parts = str.split('-');
                                return `${parts[1]}/${parts[2]}`;
                              } catch {
                                return str;
                              }
                            }}
                            tick={{ fontSize: 9, fontFamily: 'monospace' }}
                          />
                          <YAxis 
                            stroke="#4b5563" 
                            tickLine={false} 
                            axisLine={false} 
                            domain={['auto', 'auto']}
                            tick={{ fontSize: 9, fontFamily: 'monospace' }}
                          />
                          <Tooltip
                            contentStyle={{ 
                              backgroundColor: '#111827', 
                              borderColor: '#1f2937',
                              borderRadius: '8px',
                              color: '#f3f4f6',
                              fontSize: '10px',
                              fontFamily: 'monospace'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="close" 
                            name="Price"
                            stroke={activeAnalysis.recommendation === "BUY" ? "#00d084" : activeAnalysis.recommendation === "SELL" ? "#ff4757" : "#ffd32a"} 
                            strokeWidth={2} 
                            fillOpacity={1} 
                            fill="url(#chartGradient)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                      <div className={`absolute top-2 right-2 font-mono text-[10px] font-bold ${
                        activeAnalysis.price_data.percent_change >= 0 ? "text-[#00d084]" : "text-[#ff4757]"
                      }`}>
                        {activeAnalysis.price_data.percent_change >= 0 ? "+" : ""}
                        {activeAnalysis.price_data.percent_change?.toFixed(2)}%
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-10 text-slate-500 text-xs">Historical stock prices could not be graphed</div>
                  )}
                </div>

                {/* Dynamic 30D Performance Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center border-t border-[#1f2937]/50 pt-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#9ca3af] uppercase font-bold">Current</span>
                    <span className={`text-xs font-mono font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
                      ${activeAnalysis.price_data.current_price?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#9ca3af] uppercase font-bold">30D High</span>
                    <span className="text-xs font-mono font-bold text-[#00d084]">
                      ${(activeAnalysis.price_data.history && activeAnalysis.price_data.history.length > 0) 
                        ? Math.max(...activeAnalysis.price_data.history.map(h => h.close)).toFixed(2)
                        : activeAnalysis.price_data.current_price?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#9ca3af] uppercase font-bold">30D Low</span>
                    <span className="text-xs font-mono font-bold text-[#ff4757]">
                      ${(activeAnalysis.price_data.history && activeAnalysis.price_data.history.length > 0) 
                        ? Math.min(...activeAnalysis.price_data.history.map(h => h.close)).toFixed(2)
                        : activeAnalysis.price_data.current_price?.toFixed(2)}
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* Real-time "🔍 Agent Trace" step-by-step trace logger */}
        {activeTraces && activeTraces.length > 0 && (
          <div className="bg-[#0a0e1a] border border-[#1f2937] rounded-xl flex flex-col">
            <div className="px-4 py-2 bg-[#1f2937] flex items-center justify-between border-b border-[#374151]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                <span className="text-[10px] font-bold uppercase text-[#9ca3af] tracking-widest">🔍 Agent Trace Log</span>
              </div>
              <span className="text-[10px] font-mono text-[#4b5563]">SESSION_ID: AI_9921_X</span>
            </div>
            <div className="p-4 font-mono text-[11px] leading-relaxed overflow-hidden flex flex-col gap-1.5 max-h-[220px] overflow-y-auto">
              {activeTraces.map((trace, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:gap-4 border-b border-[#1f2937]/30 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
                  <span className="text-[#00d084] shrink-0 font-bold font-mono">[STEP_{idx + 1}_TOOL_CALL]</span>
                  <span className="text-white font-mono shrink-0 font-semibold">{trace.tool}({Object.keys(trace.input || {}).join(", ")})</span>
                  <span className="text-blue-400 font-bold italic font-mono flex-1 text-right truncate">
                    → {typeof trace.output === "object" ? JSON.stringify(trace.output).substring(0, 80) + "..." : String(trace.output)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversation Chat Thread (Follow-up area) */}
        {messages.length > 0 && (
          <div className={`rounded-2xl border flex flex-col transition-all duration-300 ${
            darkMode ? "bg-[#111827] border-[#1f2937]" : "bg-white border-slate-200 shadow-sm"
          }`}>
            
            {/* Header */}
            <div className="px-5 py-4 border-b dark:border-[#1f2937] border-slate-100 flex items-center gap-2">
              <MessageSquare className="w-4.5 h-4.5 text-[#00d084]" />
              <h3 className="font-display font-bold text-sm tracking-wide">Interactive Session Thread</h3>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-900/50 px-2 py-0.5 rounded">Multi-turn History</span>
            </div>

            {/* Chat list */}
            <div className="p-5 flex flex-col gap-5 max-h-[450px] overflow-y-auto">
              {messages.map((m) => {
                const isUser = m.role === "user";
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3.5 max-w-[85%] ${
                      isUser ? "self-end flex-row-reverse" : "self-start"
                    }`}
                  >
                    {/* Icon avatar */}
                    <div className={`p-2.5 rounded-2xl shrink-0 border ${
                      isUser 
                        ? "bg-[#00d084] border-[#00d084] text-[#0a0e1a]" 
                        : "bg-[#111827] border-[#1f2937] text-[#00d084]"
                    }`}>
                      {isUser ? (
                        <span className="text-xs font-mono font-black">ME</span>
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                    </div>

                    {/* Chat bubble body */}
                    <div className={`flex flex-col gap-1 p-4 rounded-xl ${
                      isUser
                        ? "bg-[#1f2937] border-[#00d084]/30 border text-[#e5e7eb] rounded-tr-none"
                        : "bg-[#0a0e1a]/80 border border-[#1f2937] text-[#e5e7eb] rounded-tl-none"
                    }`}>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#9ca3af]">
                          {isUser ? "Investor Query" : "StockSense Agent"}
                        </span>
                        <span className="text-[9px] text-[#4b5563] font-mono">{m.timestamp}</span>
                      </div>
                      
                      <p className="text-sm font-light leading-relaxed whitespace-pre-wrap mt-1">
                        {renderMarkdown(m.content)}
                      </p>

                      {/* Local micro stock badge if attached in chat message */}
                      {m.analysis && (
                        <div className="mt-3 pt-3 border-t border-[#1f2937]/50 flex items-center justify-between gap-2">
                          <button
                            onClick={() => {
                              setActiveAnalysis(m.analysis!);
                              setActiveTraces(m.traces || []);
                              setPositivesOpen(true);
                              setRisksOpen(true);
                              window.scrollTo({ top: 350, behavior: 'smooth' });
                            }}
                            className="text-[11px] font-mono px-3 py-1.5 rounded-lg bg-[#00d084]/10 hover:bg-[#00d084]/25 border border-[#00d084]/20 text-[#00d084] flex items-center gap-1 cursor-pointer hover:underline transition-all duration-150"
                          >
                            📈 View Dashboard for {m.analysis.ticker}
                          </button>
                          
                          <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono ${
                            getRecommendationStyles(m.analysis.recommendation).textColor
                          }`}>
                            {m.analysis.recommendation} ({m.analysis.confidence}/10 Conf)
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat follow-up input bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const input = form.elements.namedItem("chatInput") as HTMLInputElement;
                if (input && input.value.trim()) {
                  handleQuery(input.value);
                  input.value = "";
                }
              }}
              className="p-4 border-t dark:border-[#1f2937] border-slate-100 flex gap-2.5 bg-[#0a0e1a]/20"
            >
              <input
                type="text"
                name="chatInput"
                disabled={isThinking}
                placeholder="Ask follow-up questions... e.g., 'Compare with AMD' or 'What about their competition?'"
                className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-sans transition-all duration-300 border outline-none ${
                  darkMode
                    ? "bg-[#1f2937] border-[#1f2937] text-[#e5e7eb] placeholder-slate-500 focus:border-[#00d084]/80 focus:ring-1 focus:ring-[#00d084]/20"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500"
                }`}
              />
              <button
                type="submit"
                disabled={isThinking}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#00d084] hover:bg-[#00d084]/90 text-[#0a0e1a] transition-all duration-200 flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
              >
                Send
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

          </div>
        )}

      </main>

      {/* Footer / Bottom Micro-Nav */}
      <footer className={`py-4 sm:h-12 border-t flex flex-col sm:flex-row items-center justify-between gap-2 px-6 sm:px-8 text-[10px] mt-12 ${
        darkMode ? "bg-[#0a0e1a] border-[#1f2937] text-[#4b5563]" : "bg-slate-100 border-slate-200 text-slate-500"
      }`}>
        <span>Built by Hamzah with Gemini AI · Google x Kaggle 5-Day AI Agents Intensive · Capstone Project 2026</span>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowHowItWorks(true)}
            className="text-[#00d084] cursor-pointer hover:underline font-bold bg-transparent border-none text-[10px]"
          >
            ℹ️ How this works
          </button>
          <span>© 2026 StockSense AI</span>
        </div>
      </footer>

      {/* How It Works Modal */}
      {showHowItWorks && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => setShowHowItWorks(false)}
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"
          ></div>
          
          {/* Modal Content */}
          <div className={`relative max-w-lg w-full rounded-2xl border p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] transition-all duration-300 z-10 ${
            darkMode ? "bg-[#111827] border-[#1f2937] text-slate-200" : "bg-white border-slate-200 text-slate-800"
          }`}>
            <button 
              onClick={() => setShowHowItWorks(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-slate-500/15 cursor-pointer text-slate-400 hover:text-white transition-all border-none bg-transparent"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-[#00d084]/10 text-[#00d084]">
                <Info className="w-5 h-5" />
              </div>
              <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
                How StockSense AI Works
              </h2>
            </div>
            
            <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
              <p>
                StockSense AI uses a <strong className="font-extrabold text-[#00d084]">sequential multi-tool agent</strong> built on <strong>Gemini</strong> to run end-to-end investment research. 
              </p>
              
              <div className="border-t border-[#1f2937]/50 pt-4">
                <h4 className={`font-bold mb-2 uppercase tracking-wider text-[11px] ${darkMode ? "text-white" : "text-slate-900"}`}>
                  The 4-Step Agent Pipeline
                </h4>
                <div className="space-y-3">
                  <div className="flex gap-2.5">
                    <span className="text-[#00d084] font-bold">1.</span>
                    <div>
                      <strong className={darkMode ? "text-white" : "text-slate-900"}>Ticker Resolution</strong>
                      <p className="text-[11px] opacity-75">Resolves fuzzy queries (e.g. "Apple") to clean exchange symbols (e.g. "AAPL") so the agent always pulls correct tickers.</p>
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="text-[#00d084] font-bold">2.</span>
                    <div>
                      <strong className={darkMode ? "text-white" : "text-slate-900"}>Market Price Aggregator</strong>
                      <p className="text-[11px] opacity-75">Pulls historical 30-day performance ranges and the current real-time quote from Yahoo Finance.</p>
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="text-[#00d084] font-bold">3.</span>
                    <div>
                      <strong className={darkMode ? "text-white" : "text-slate-900"}>Google Search Grounding</strong>
                      <p className="text-[11px] opacity-75">Performs live search queries to capture up-to-the-minute headlines, sentiment shifts, and SEC filings.</p>
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="text-[#00d084] font-bold">4.</span>
                    <div>
                      <strong className={darkMode ? "text-white" : "text-slate-900"}>Reasoning Synthesizer</strong>
                      <p className="text-[11px] opacity-75">Synthesizes all the aggregated numbers and articles to formulate an objective recommendation (BUY, HOLD, SELL), confidence score, pros, and risks.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-[#1f2937]/50 pt-4">
                <h4 className={`font-bold mb-1 uppercase tracking-wider text-[11px] ${darkMode ? "text-white" : "text-slate-900"}`}>
                  Why Recommendations Change
                </h4>
                <p className="text-[11px] opacity-75 leading-normal">
                  Our system crawls <strong className="font-extrabold text-[#00d084]">live real-time data</strong>. Shifting intraday prices, new catalyst reports, and changing sentiment will dynamically update the agent's synthesis. This is a normal, healthy part of active market tracking!
                </p>
              </div>
              
              <div className="border-t border-[#1f2937]/50 pt-4 text-[10px] opacity-60 text-center italic leading-tight">
                StockSense AI is a capstone educational research project. This is completely simulated and does not constitute certified investment advice.
              </div>
            </div>
            
            <button 
              onClick={() => setShowHowItWorks(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-[#00d084] hover:bg-[#00d084]/90 text-[#0a0e1a] font-bold text-center cursor-pointer transition-all border-none"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
