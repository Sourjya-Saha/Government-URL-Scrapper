"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PYTHON_URL = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || "http://localhost:8000";

// ─── Top Nav ─────────────────────────────────────────────────────────────────
function TopNavBar() {
  return (
    <nav
      style={{ backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.15)" }}
      className="fixed top-8 left-1/2 -translate-x-1/2 w-[95%] max-w-[1440px] rounded-full border backdrop-blur-[20px] z-50 flex justify-between items-center px-8 py-3"
    >
      <div className="font-headline-md text-headline-md italic text-primary tracking-tight">GOV.io</div>
      <div className="hidden md:flex gap-6 items-center">
        <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-all duration-300" href="/">About</a>
        <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-all duration-300" href="/dashboard">Dashboard</a>
        <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-all duration-300" href="/urls">URLs</a>
        <a className="font-label-caps text-label-caps text-primary border-b border-white pb-1" href="/">Chat.io</a>
      </div>
      <button className="bg-primary text-on-primary rounded-full px-6 py-2 font-label-caps text-label-caps hover:opacity-80 transition-opacity">
        Get Started
      </button>
    </nav>
  );
}

// ─── Suggested prompts ───────────────────────────────────────────────────────
const SUGGESTIONS = [
  { icon: "person_search",  text: "Who is the Principal Secretary of Public Health in Maharashtra?" },
  { icon: "alternate_email", text: "Find the email of the Commissioner of Health Services Mumbai" },
  { icon: "groups",         text: "List all Deputy Directors in the Department of Fertilizers" },
  { icon: "domain",         text: "Summarise all officials in the Ministry of Finance" },
];

// ─── Typing indicator ────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: "#d45928" }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

// ─── Message Bubble ──────────────────────────────────────────────────────────
function MessageBubble({ msg, index }) {
  const isUser = msg.role === "user";
  const isSystem = msg.role === "system";

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex justify-center my-4"
      >
        <span className="liquid-glass rounded-full px-4 py-2 font-label-caps text-label-caps text-on-surface-variant text-[10px] flex items-center gap-2">
          <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>{msg.icon || "info"}</span>
          {msg.content}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className={`flex gap-4 ${isUser ? "flex-row-reverse" : "flex-row"} items-end mb-6`}
    >
      {/* Avatar */}
      {!isUser && (
        <div
          className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-label-caps text-label-caps text-[11px] mb-1"
          style={{ background: "rgba(212,89,40,0.15)", color: "#d45928", border: "1px solid rgba(212,89,40,0.3)" }}
        >
          AI
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Mode badge */}
        {msg.mode && (
          <span className="font-label-caps text-label-caps text-[10px] text-on-surface-variant px-1">
            {msg.mode === "ask" ? "RAG · Q&A" : "Gemini · Summary"}
          </span>
        )}

        {/* Bubble */}
        <div
          className={`rounded-[1.5rem] px-6 py-4 ${isUser ? "rounded-br-md" : "rounded-bl-md"}`}
          style={isUser
            ? { background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }
            : { background: "linear-gradient(160deg, rgba(212,89,40,0.08) 0%, rgba(66,133,244,0.06) 100%)", border: "1px solid rgba(255,255,255,0.1)" }
          }
        >
          {msg.loading ? (
            <TypingDots />
          ) : (
            <div
              className="font-body-md text-body-md text-primary prose-chat"
              style={{ whiteSpace: "pre-wrap", lineHeight: "1.7" }}
            >
              {msg.content}
            </div>
          )}
        </div>

        {/* Context count */}
        {msg.contextCount !== undefined && (
          <span className="font-label-caps text-label-caps text-[10px] text-on-surface-variant px-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>database</span>
            {msg.contextCount} context records used
          </span>
        )}

        {/* Timestamp */}
        {msg.ts && (
          <span className="font-label-caps text-label-caps text-[10px] text-on-surface-variant px-1">
            {msg.ts}
          </span>
        )}
      </div>

      {isUser && (
        <div
          className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center mb-1"
          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <span className="material-symbols-outlined text-base text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
        </div>
      )}
    </motion.div>
  );
}

// ─── Mode Toggle ─────────────────────────────────────────────────────────────
function ModeToggle({ mode, setMode, disabled }) {
  return (
    <div className="liquid-glass rounded-full flex overflow-hidden shrink-0">
      {[
        { id: "ask",       label: "Ask",      icon: "chat_bubble" },
        { id: "summarise", label: "Summarise", icon: "summarize"   },
      ].map(m => (
        <button
          key={m.id}
          type="button"
          disabled={disabled}
          onClick={() => setMode(m.id)}
          className="flex items-center gap-2 px-4 py-2.5 font-label-caps text-label-caps transition-all duration-200 disabled:opacity-40"
          style={{
            background: mode === m.id ? "rgba(212,89,40,0.2)" : "transparent",
            color: mode === m.id ? "#d45928" : "#c4c7c8",
          }}
        >
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: mode === m.id ? "'FILL' 1" : "'FILL' 0" }}>
            {m.icon}
          </span>
          {m.label}
        </button>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [mode, setMode]           = useState("ask");
  const [nContext, setNContext]   = useState(15);
  const [loading, setLoading]     = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const addMessage = useCallback((msg) => {
    setMessages(prev => [...prev, msg]);
    return msg;
  }, []);

  const updateLastAssistant = useCallback((patch) => {
    setMessages(prev => {
      const updated = [...prev];
      for (let i = updated.length - 1; i >= 0; i--) {
        if (updated[i].role === "assistant") {
          updated[i] = { ...updated[i], ...patch };
          break;
        }
      }
      return updated;
    });
  }, []);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e, overrideInput) => {
    e?.preventDefault();
    const q = (overrideInput ?? input).trim();
    if (!q || loading) return;

    setInput("");
    setLoading(true);

    // Add user message
    addMessage({ role: "user", content: q, ts: now() });

    // Add loading placeholder
    addMessage({ role: "assistant", content: "", loading: true, mode, ts: now() });

    try {
      let answer = "";
      let contextCount;

      if (mode === "ask") {
        const res = await fetch(`${PYTHON_URL}/ask`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q, n_context: nContext }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail?.[0]?.msg || `Server error ${res.status}`);
        }
        const data = await res.json();
        // API may return a string, or an object with an answer field
        if (typeof data === "string") {
          answer = data;
        } else {
          answer = data.answer ?? data.response ?? data.result ?? JSON.stringify(data, null, 2);
          contextCount = data.context_count ?? data.n_context ?? data.retrieved;
        }
      } else {
        // Summarise mode — treat input as a department name
        const res = await fetch(`${PYTHON_URL}/summarise`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ department: q }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail?.[0]?.msg || `Server error ${res.status}`);
        }
        const data = await res.json();
        if (typeof data === "string") {
          answer = data;
        } else {
          answer = data.summary ?? data.answer ?? data.response ?? data.result ?? JSON.stringify(data, null, 2);
        }
      }

      updateLastAssistant({ content: answer, loading: false, contextCount, ts: now() });
    } catch (err) {
      updateLastAssistant({
        content: `❌ ${err.message || "Something went wrong. Please check your backend connection."}`,
        loading: false,
        ts: now(),
      });
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSuggestion = (text) => {
    // Auto-detect summarise from suggestion
    const isSummarise = text.toLowerCase().startsWith("summarise") || text.toLowerCase().startsWith("summarize");
    if (isSummarise) setMode("summarise");
    else setMode("ask");
    handleSubmit(null, isSummarise ? text.replace(/^summaris[e|z]\s+(all officials in the?|the?)\s*/i, "").trim() : text);
  };

  const handleClear = () => {
    setMessages([]);
    setLoading(false);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600&family=Instrument+Serif:ital@0;1&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

        .bg-background { background-color: #141313; }
        .text-primary { color: #ffffff; }
        .hover\\:text-primary:hover { color: #ffffff; }
        .bg-primary { background-color: #ffffff; }
        .text-on-primary { color: #2f3131; }
        .text-on-surface-variant { color: #c4c7c8; }
        .text-on-surface { color: #e5e2e1; }

        .font-headline-md { font-family: 'Instrument Serif', serif; }
        .text-headline-md { font-size: 48px; line-height: 120%; font-weight: 400; }
        .font-label-caps  { font-family: 'Barlow', sans-serif; }
        .text-label-caps  { font-size: 12px; line-height: 100%; letter-spacing: 0.15em; font-weight: 600; }
        .font-body-md     { font-family: 'Barlow', sans-serif; }
        .text-body-md     { font-size: 16px; line-height: 160%; font-weight: 400; }
        .font-body-lg     { font-family: 'Barlow', sans-serif; }
        .text-body-lg     { font-size: 18px; line-height: 160%; letter-spacing: 0.01em; font-weight: 400; }
        .font-display-xl  { font-family: 'Instrument Serif', serif; }
        .text-display-xl  { font-size: 88px; line-height: 110%; letter-spacing: -0.02em; font-weight: 400; }

        .liquid-glass {
          backdrop-filter: blur(20px);
          background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.15);
        }
        .liquid-glass-strong {
          backdrop-filter: blur(40px);
          background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.3), 0 20px 40px rgba(0,0,0,0.5);
        }
        .liquid-glass-input {
          backdrop-filter: blur(40px);
          background: linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.2), 0 -8px 32px rgba(0,0,0,0.3);
        }

        .bg-grid {
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 64px 64px;
        }
        .blob { position: fixed; pointer-events: none; border-radius: 50%; filter: blur(120px); opacity: 0.12; z-index: 0; }

        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .chat-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

        .suggestion-card:hover { background: rgba(255,255,255,0.08) !important; transform: translateY(-2px); }
        .suggestion-card { transition: all 0.2s ease; }

        textarea { resize: none; }
        textarea::-webkit-scrollbar { width: 0px; }
      `}} />

      {/* Ambient blobs */}
    <div className="blob" style={{ width: 500, height: 500, top: -150, left: -150, background: "#d45928" }} />
      <div className="blob" style={{ width: 400, height: 400, bottom: -100, right: -100, background: "#d45928" }} />
      <div className="blob" style={{ width: 300, height: 300, top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "#d45928", opacity: 0.06 }} />
      <div className="bg-grid fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />

      <TopNavBar />

      {/* ── MAIN LAYOUT ── */}
      <div className="flex flex-col flex-1 max-w-[1000px] mx-auto w-full px-4 pt-32 pb-0 relative z-10" style={{ height: "100vh" }}>

        {/* ── EMPTY / HERO STATE ── */}
        <AnimatePresence>
          {isEmpty && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center flex-1 gap-10 pb-8"
            >
              {/* Title */}
              <div className="text-center">
                <p className="font-label-caps text-label-caps text-on-surface-variant mb-4">// Chat.io</p>
                <h1 className="font-display-xl text-display-xl italic text-primary mb-4">
                  Ask <span style={{ color: "#d45928" }}>Gov</span>
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
                  RAG-powered Q&A over India's government directory. Ask about officials, departments, and contacts — or summarise an entire ministry.
                </p>
              </div>

              {/* Suggestion cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                {SUGGESTIONS.map((s, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.08 }}
                    onClick={() => handleSuggestion(s.text)}
                    className="suggestion-card liquid-glass rounded-2xl px-5 py-4 text-left flex items-start gap-3"
                  >
                    <span
                      className="material-symbols-outlined text-xl shrink-0 mt-0.5"
                      style={{ color: "#d45928", fontVariationSettings: "'FILL' 1" }}
                    >
                      {s.icon}
                    </span>
                    <span className="font-body-md text-body-md text-on-surface-variant leading-snug">{s.text}</span>
                  </motion.button>
                ))}
              </div>

              {/* Mode indicator */}
              <div className="flex items-center gap-3">
                <span className="font-label-caps text-label-caps text-on-surface-variant text-[10px]">POWERED BY</span>
                <span className="liquid-glass rounded-full px-3 py-1 font-label-caps text-label-caps text-[10px] flex items-center gap-1.5" style={{ color: "#d45928" }}>
                  <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>database</span>
                  ChromaDB + SQLite
                </span>
                <span className="liquid-glass rounded-full px-3 py-1 font-label-caps text-label-caps text-[10px] flex items-center gap-1.5" style={{ color: "#4285f4" }}>
                  <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  Gemini
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── MESSAGES ── */}
        {!isEmpty && (
          <div className="flex-1 overflow-y-auto chat-scroll px-2 py-6">
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} index={i} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}

        {/* ── INPUT DOCK ── */}
        <div className="sticky bottom-0 pb-6 pt-3" style={{ background: "linear-gradient(0deg, #141313 60%, transparent)" }}>

          {/* Settings panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="liquid-glass rounded-2xl px-6 py-4 mb-3 flex flex-wrap items-center gap-6"
              >
                <div className="flex items-center gap-3">
                  <span className="font-label-caps text-label-caps text-on-surface-variant text-[10px]">CONTEXT RECORDS</span>
                  <input
                    type="range"
                    min={5} max={50} step={5}
                    value={nContext}
                    onChange={e => setNContext(Number(e.target.value))}
                    className="w-28 accent-[#d45928]"
                  />
                  <span className="font-label-caps text-label-caps text-primary w-6 text-center">{nContext}</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant" style={{ fontSize: 12 }}>
                  Higher = more context retrieved from ChromaDB for each answer (slower but more thorough).
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main input box */}
          <form onSubmit={handleSubmit} className="liquid-glass-input rounded-[1.75rem] p-3 flex flex-col gap-3">

            {/* Textarea */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={mode === "ask"
                ? "Ask about a government official, department, or contact…"
                : "Enter a department name to summarise (e.g. Ministry of Finance)…"
              }
              rows={2}
              disabled={loading}
              className="bg-transparent outline-none font-body-md text-body-md text-primary placeholder:text-on-surface-variant w-full px-3 pt-1 disabled:opacity-50"
              style={{ minHeight: 56, maxHeight: 160, overflowY: "auto" }}
            />

            {/* Bottom bar */}
            <div className="flex items-center gap-3 px-1">
              <ModeToggle mode={mode} setMode={setMode} disabled={loading} />

              <div className="flex-1" />

              {/* Settings toggle */}
              <button
                type="button"
                onClick={() => setShowSettings(s => !s)}
                className="liquid-glass rounded-full p-2.5 flex items-center justify-center hover:bg-white/10 transition-colors"
                title="Settings"
              >
                <span className="material-symbols-outlined text-base text-on-surface-variant" style={{ fontVariationSettings: showSettings ? "'FILL' 1" : "'FILL' 0" }}>
                  tune
                </span>
              </button>

              {/* Clear */}
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={loading}
                  className="liquid-glass rounded-full p-2.5 flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-40"
                  title="Clear chat"
                >
                  <span className="material-symbols-outlined text-base text-on-surface-variant">delete_sweep</span>
                </button>
              )}

              {/* Send */}
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="rounded-full px-5 py-2.5 font-label-caps text-label-caps flex items-center gap-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: loading || !input.trim()
                    ? "rgba(255,255,255,0.1)"
                    : "linear-gradient(135deg, #d45928, #c04820)",
                  color: loading || !input.trim() ? "#c4c7c8" : "#ffffff",
                  boxShadow: loading || !input.trim() ? "none" : "0 4px 20px rgba(212,89,40,0.4)",
                }}
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-base" style={{ animation: "spin 1s linear infinite" }}>autorenew</span>
                    Thinking
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {mode === "ask" ? "send" : "summarize"}
                    </span>
                    {mode === "ask" ? "Ask" : "Summarise"}
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="text-center font-label-caps text-label-caps text-on-surface-variant text-[10px] mt-3 opacity-50">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 bg-background/50 backdrop-blur-md px-6 py-8 relative z-10">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-headline-md text-headline-md italic text-primary">GOV.io</div>
          <p className="font-body-md text-body-md text-on-surface-variant">© 2026 GOV.io · All Rights Reserved. Made by Code Nirvana</p>
          <div className="flex gap-6">
            {["Srinjoy Roy", "Sourjya Saha", "Aritra Dhar"].map(name => (
              <a key={name} href="/" className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors duration-300">{name}</a>
            ))}
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
    </div>
  );
}