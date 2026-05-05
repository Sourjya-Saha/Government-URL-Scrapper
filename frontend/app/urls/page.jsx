"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NODE_URL = process.env.NEXT_PUBLIC_NODE_BACKEND_URL || "http://localhost:5000";
const PYTHON_URL = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || "http://localhost:8000";

// ─── Route-Finder Check ──────────────────────────────────────────────────────
function shouldCallRouteFinder(inputUrl) {
  try {
    const url = new URL(inputUrl.startsWith("http") ? inputUrl : `https://${inputUrl}`);
    const hostname = url.hostname.toLowerCase();
    const isGov = hostname.endsWith(".gov.in") || hostname.endsWith(".nic.in");
    if (!isGov) return false;
    const isRoot = url.pathname === "/" || url.pathname === "";
    return isRoot && url.search === "";
  } catch (e) {
    return false;
  }
}

// ─── URL Extractor from file text ───────────────────────────────────────────
function extractUrls(text) {
  const urlRegex = /https?:\/\/[^\s,;"'<>\n\r]+|(?:www\.)?[\w-]+\.(?:gov\.in|nic\.in)[^\s,;"'<>\n\r]*/gi;
  const found = [];
  const seen = new Set();
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    const u = match[0].replace(/[.,;)\]]+$/, "").trim();
    if (u && !seen.has(u)) {
      seen.add(u);
      found.push(u);
    }
  }
  return found;
}

// ─── Read File as Text ───────────────────────────────────────────────────────
async function readFileAsText(file) {
  if (file.type === "application/pdf") {
    // For PDFs use pdf.js via CDN – fall back to error message
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const typedArr = new Uint8Array(e.target.result);
          if (window.pdfjsLib) {
            const pdf = await window.pdfjsLib.getDocument({ data: typedArr }).promise;
            let text = "";
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              text += content.items.map((s) => s.str).join(" ") + "\n";
            }
            resolve(text);
          } else {
            resolve("PDF parsing unavailable. Please use .txt or .doc files.");
          }
        } catch {
          resolve("");
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// ─── Status Badge ────────────────────────────────────────────────────────────
const STATUS = {
  pending:    { label: "Pending",    icon: "schedule",        color: "#c4c7c8", bg: "rgba(196,199,200,0.1)" },
  running:    { label: "Processing", icon: "autorenew",       color: "#4285f4", bg: "rgba(66,133,244,0.1)"  },
  routing:    { label: "Routing",    icon: "alt_route",       color: "#fbbc04", bg: "rgba(251,188,4,0.1)"   },
  ingesting:  { label: "Ingesting",  icon: "cloud_upload",    color: "#d45928", bg: "rgba(212,89,40,0.1)"   },
  done:       { label: "Done",       icon: "check_circle",    color: "#34a853", bg: "rgba(52,168,83,0.1)"   },
  skipped:    { label: "Skipped",    icon: "skip_next",       color: "#fbbc04", bg: "rgba(251,188,4,0.1)"   },
  error:      { label: "Error",      icon: "error_outline",   color: "#ea4335", bg: "rgba(234,67,53,0.1)"   },
  invalid:    { label: "Invalid",    icon: "block",           color: "#888",    bg: "rgba(136,136,136,0.1)" },
};

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span
      className="flex items-center gap-1.5 rounded-full px-3 py-1 font-label-caps text-label-caps whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      <span
        className="material-symbols-outlined text-sm"
        style={{
          fontVariationSettings: "'FILL' 1",
          animation: status === "running" || status === "routing" || status === "ingesting"
            ? "spin 1s linear infinite" : "none",
        }}
      >
        {s.icon}
      </span>
      {s.label}
    </span>
  );
}

// ─── Ingest Response Table ────────────────────────────────────────────────────
function IngestTable({ data }) {
  if (!data || typeof data !== "object") {
    return (
      <pre className="bg-black/30 rounded-xl p-4 text-xs text-on-surface overflow-x-auto max-h-40 font-mono">
        {String(data)}
      </pre>
    );
  }

  const sample = Array.isArray(data.sample) ? data.sample : null;
  const meta = {
    url: data.url,
    records_scraped: data.records_scraped,
    vectors_stored: data.vectors_stored,
  };

  const DEPT_COLORS = {
    "Minister": { bg: "rgba(212,89,40,0.15)", color: "#d45928", border: "rgba(212,89,40,0.35)" },
    "Minister's Office": { bg: "rgba(66,133,244,0.12)", color: "#4285f4", border: "rgba(66,133,244,0.3)" },
  };

  function getDeptStyle(dept = "") {
    const key = Object.keys(DEPT_COLORS).find(k => dept.toLowerCase().includes(k.toLowerCase()));
    return key ? DEPT_COLORS[key] : { bg: "rgba(196,199,200,0.1)", color: "#c4c7c8", border: "rgba(196,199,200,0.25)" };
  }

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 12,
    fontFamily: "'Barlow', sans-serif",
  };

  const thStyle = {
    padding: "8px 12px",
    textAlign: "left",
    fontSize: 10,
    letterSpacing: "0.12em",
    fontWeight: 600,
    color: "#c4c7c8",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    whiteSpace: "nowrap",
    background: "rgba(255,255,255,0.03)",
  };

  const tdStyle = {
    padding: "10px 12px",
    color: "#e5e2e1",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    verticalAlign: "middle",
    maxWidth: 180,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Meta pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {meta.url && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 10px", borderRadius: 999, fontSize: 10,
            background: "rgba(66,133,244,0.1)", color: "#4285f4",
            border: "1px solid rgba(66,133,244,0.25)", fontFamily: "'Barlow', sans-serif",
            letterSpacing: "0.05em", fontWeight: 600,
          }}>
            🔗 {meta.url.replace("https://", "")}
          </span>
        )}
        {meta.records_scraped !== undefined && (
          <span style={{
            padding: "3px 10px", borderRadius: 999, fontSize: 10,
            background: "rgba(52,168,83,0.1)", color: "#34a853",
            border: "1px solid rgba(52,168,83,0.25)", fontFamily: "'Barlow', sans-serif",
            letterSpacing: "0.05em", fontWeight: 600,
          }}>
            {meta.records_scraped} scraped
          </span>
        )}
        {meta.vectors_stored !== undefined && (
          <span style={{
            padding: "3px 10px", borderRadius: 999, fontSize: 10,
            background: "rgba(251,188,4,0.1)", color: "#fbbc04",
            border: "1px solid rgba(251,188,4,0.25)", fontFamily: "'Barlow', sans-serif",
            letterSpacing: "0.05em", fontWeight: 600,
          }}>
            {meta.vectors_stored} vectors stored
          </span>
        )}
      </div>

      {/* Sample table */}
      {sample && sample.length > 0 ? (
        <div style={{
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{
            padding: "6px 12px",
            background: "rgba(255,255,255,0.04)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            fontSize: 10,
            letterSpacing: "0.12em",
            fontWeight: 600,
            color: "#c4c7c8",
            fontFamily: "'Barlow', sans-serif",
          }}>
            SAMPLE — {sample.length} of {meta.records_scraped ?? "?"} records
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>DEPT</th>
                  <th style={thStyle}>NAME</th>
                  <th style={thStyle}>DESIGNATION</th>
                  <th style={thStyle}>EMAIL</th>
                  <th style={thStyle}>PHONE</th>
                </tr>
              </thead>
              <tbody>
                {sample.map((rec, i) => {
                  const ds = getDeptStyle(rec.department || "");
                  return (
                    <tr key={rec.id || i} style={{ transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ ...tdStyle, color: "#c4c7c8", fontSize: 10, width: 28 }}>
                        {String(i + 1).padStart(2, "0")}
                      </td>
                      <td style={{ ...tdStyle, maxWidth: 130 }}>
                        <span style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 999,
                          fontSize: 10,
                          fontWeight: 600,
                          letterSpacing: "0.05em",
                          background: ds.bg,
                          color: ds.color,
                          border: `1px solid ${ds.border}`,
                          whiteSpace: "nowrap",
                        }}>
                          {rec.department || "—"}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 500, maxWidth: 160 }} title={rec.name}>
                        {rec.name || "—"}
                      </td>
                      <td style={{ ...tdStyle, color: "#c4c7c8", maxWidth: 170 }} title={rec.designation}>
                        {rec.designation || "—"}
                      </td>
                      <td style={{ ...tdStyle, maxWidth: 200 }}>
                        {rec.email ? (
                          <a href={`mailto:${rec.email}`} style={{
                            color: "#4285f4", fontFamily: "monospace", fontSize: 11,
                            textDecoration: "none",
                          }}
                            onMouseEnter={e => e.target.style.opacity = "0.7"}
                            onMouseLeave={e => e.target.style.opacity = "1"}
                          >
                            {rec.email}
                          </a>
                        ) : "—"}
                      </td>
                      <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: 11, color: "#c4c7c8", maxWidth: 160 }} title={rec.phone}>
                        {rec.phone || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Fallback: key-value table for non-sample responses */
        <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
          <table style={tableStyle}>
            <tbody>
              {Object.entries(data).map(([k, v]) => (
                <tr key={k}>
                  <td style={{ ...tdStyle, color: "#c4c7c8", fontWeight: 600, fontSize: 10, letterSpacing: "0.08em", width: 140 }}>
                    {k.toUpperCase()}
                  </td>
                  <td style={tdStyle}>
                    {typeof v === "object" ? JSON.stringify(v) : String(v)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Result Card ─────────────────────────────────────────────────────────────
function ResultCard({ item, index }) {
  const [expanded, setExpanded] = useState(false);
  const s = STATUS[item.status] || STATUS.pending;
  const hostname = (() => {
    try { return new URL(item.url.startsWith("http") ? item.url : `https://${item.url}`).hostname.replace("www.", ""); }
    catch { return item.url; }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
      className="liquid-glass rounded-[1.75rem] overflow-hidden"
    >
      {/* Header row */}
      <div
        className="flex items-center gap-4 px-6 py-5 cursor-pointer hover:bg-white/5 transition-colors duration-200"
        onClick={() => item.status !== "pending" && setExpanded(e => !e)}
      >
        {/* Index */}
        <span className="font-label-caps text-label-caps text-on-surface-variant w-7 shrink-0 text-center">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Domain pill */}
        <div
          className="liquid-glass-strong rounded-full px-4 py-1.5 font-label-caps text-label-caps shrink-0 max-w-[220px] truncate"
          style={{ color: s.color }}
          title={item.url}
        >
          {hostname}
        </div>

        {/* URL */}
        <span className="font-body-md text-body-md text-on-surface-variant flex-1 truncate hidden md:block" title={item.url}>
          {item.url}
        </span>

        {/* Route indicator */}
        {item.routeUrl && item.routeUrl !== item.url && (
          <span className="liquid-glass rounded-full px-3 py-1 font-label-caps text-label-caps text-[10px] text-on-surface-variant hidden lg:flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">alt_route</span>
            {(() => { try { return new URL(item.routeUrl).pathname.replace(/\/+$/, "") || "/"; } catch { return "—"; } })()}
          </span>
        )}

        {/* Status */}
        <StatusBadge status={item.status} />

        {/* Records count */}
        {item.status === "done" && item.recordsCount !== undefined && (
          <span className="font-label-caps text-label-caps text-[10px] text-on-surface-variant shrink-0">
            {item.recordsCount} rec.
          </span>
        )}

        {/* Expand toggle */}
        {item.status !== "pending" && (
          <span className="material-symbols-outlined text-sm text-on-surface-variant shrink-0" style={{ transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>
            expand_more
          </span>
        )}
      </div>

      {/* Expandable detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/10 px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Input URL */}
              <div className="flex flex-col gap-1">
                <span className="font-label-caps text-label-caps text-on-surface-variant text-[10px]">INPUT URL</span>
                <a href={item.url} target="_blank" rel="noopener noreferrer"
                  className="font-body-md text-body-md text-primary hover:opacity-70 transition-opacity break-all">{item.url}</a>
              </div>

              {/* Route decision */}
              <div className="flex flex-col gap-1">
                <span className="font-label-caps text-label-caps text-on-surface-variant text-[10px]">ROUTE DECISION</span>
                <span className="font-body-md text-body-md text-primary">
                  {item.needsRouteFinder === false ? "Direct ingestion (deep link)" : item.needsRouteFinder === true ? "Route finder invoked" : "—"}
                </span>
              </div>

              {/* Route URL */}
              {item.routeUrl && (
                <div className="flex flex-col gap-1">
                  <span className="font-label-caps text-label-caps text-on-surface-variant text-[10px]">INGESTED URL</span>
                  <a href={item.routeUrl} target="_blank" rel="noopener noreferrer"
                    className="font-body-md text-body-md text-primary hover:opacity-70 transition-opacity break-all">{item.routeUrl}</a>
                </div>
              )}

              {/* Confidence */}
              {item.confidence !== undefined && (
                <div className="flex flex-col gap-1">
                  <span className="font-label-caps text-label-caps text-on-surface-variant text-[10px]">CONFIDENCE</span>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.round(item.confidence * 100)}%`, background: item.confidence > 0.7 ? "#34a853" : item.confidence > 0.4 ? "#fbbc04" : "#ea4335" }} />
                    </div>
                    <span className="font-label-caps text-label-caps text-primary">{Math.round(item.confidence * 100)}%</span>
                  </div>
                </div>
              )}

              {/* Match reasons */}
              {item.matchReasons?.length > 0 && (
                <div className="flex flex-col gap-2 md:col-span-2">
                  <span className="font-label-caps text-label-caps text-on-surface-variant text-[10px]">MATCH SIGNALS</span>
                  <div className="flex flex-wrap gap-2">
                    {item.matchReasons.map((r, i) => (
                      <span key={i} className="liquid-glass rounded-full px-3 py-1 font-label-caps text-label-caps text-[10px] text-on-surface-variant">{r}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Records count */}
              {item.status === "done" && item.recordsCount !== undefined && (
                <div className="flex flex-col gap-1">
                  <span className="font-label-caps text-label-caps text-on-surface-variant text-[10px]">CONTACTS STORED</span>
                  <span className="font-headline-md text-headline-md italic text-primary" style={{ fontSize: 32 }}>{item.recordsCount}</span>
                </div>
              )}

              {/* Ingest response snippet */}
              {item.ingestResponse && (
                <div className="flex flex-col gap-1 md:col-span-2">
                  <span className="font-label-caps text-label-caps text-on-surface-variant text-[10px]">INGEST RESPONSE</span>
                  <pre className="bg-black/30 rounded-xl p-4 text-xs text-on-surface overflow-x-auto max-h-40 font-mono">
                    {typeof item.ingestResponse === "string"
                      ? item.ingestResponse
                      : JSON.stringify(item.ingestResponse, null, 2)}
                  </pre>
                </div>
              )}

              {/* Ingest response snippet */}
{item.ingestResponse && (
  <div className="flex flex-col gap-1 md:col-span-2">
    <span className="font-label-caps text-label-caps text-on-surface-variant text-[10px]">INGEST RESPONSE</span>
    <IngestTable data={item.ingestResponse} />
  </div>
)}

              {/* Error */}
              {item.error && (
                <div className="flex flex-col gap-1 md:col-span-2">
                  <span className="font-label-caps text-label-caps text-[10px]" style={{ color: "#ea4335" }}>ERROR</span>
                  <p className="font-body-md text-body-md" style={{ color: "#ea4335" }}>{item.error}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Top Nav (same as landing/dashboard) ────────────────────────────────────
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
        <a className="font-label-caps text-label-caps text-primary border-b border-white pb-1" href="/urls">URLs</a>
        <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-all duration-300" href="/">Chat.io</a>
      </div>
      <button className="bg-primary text-on-primary rounded-full px-6 py-2 font-label-caps text-label-caps hover:opacity-80 transition-opacity">
        Get Started
      </button>
    </nav>
  );
}

// ─── Progress Bar ────────────────────────────────────────────────────────────
function ProgressBar({ done, total }) {
  const pct = total > 0 ? (done / total) * 100 : 0;
  return (
    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: "linear-gradient(90deg, #d45928, #4285f4)" }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.4 }}
      />
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function URLPage() {
  const [singleUrl, setSingleUrl] = useState("");
  const [items, setItems]         = useState([]);      // { url, status, ... }
  const [running, setRunning]     = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const [dragOver, setDragOver]   = useState(false);
  const [fileName, setFileName]   = useState(null);
  const fileRef = useRef(null);
  const abortRef = useRef(false);

  // ── Update a single item by index ─────────────────────────────────────────
  const updateItem = useCallback((index, patch) => {
    setItems(prev => prev.map((it, i) => i === index ? { ...it, ...patch } : it));
  }, []);

  // ── Process one URL ────────────────────────────────────────────────────────
  const processUrl = useCallback(async (rawUrl, index) => {
    if (abortRef.current) return;

    const needsRouteFinder = shouldCallRouteFinder(rawUrl);

    // Validate: must be gov.in or nic.in
    let normalizedUrl;
    try {
      const u = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
      const h = u.hostname.toLowerCase();
      if (!h.endsWith(".gov.in") && !h.endsWith(".nic.in")) {
        updateItem(index, { status: "invalid", error: "Not a .gov.in or .nic.in domain — skipped.", needsRouteFinder });
        return;
      }
      normalizedUrl = u.href;
    } catch {
      updateItem(index, { status: "invalid", error: "Malformed URL — skipped." });
      return;
    }

    updateItem(index, { status: "running", needsRouteFinder, url: normalizedUrl });

    let ingestUrl = normalizedUrl;
    let confidence, matchReasons, routeUrl;

    // ── Step 1: Route Finder (if root domain) ────────────────────────────────
    if (needsRouteFinder) {
      updateItem(index, { status: "routing" });
      try {
        const res = await fetch(`${NODE_URL}/find-route?url=${encodeURIComponent(normalizedUrl)}`);
        if (!res.ok) throw new Error(`Route finder returned ${res.status}`);
        const data = await res.json();

        if (data.success && data.route) {
          ingestUrl      = data.route;
          confidence     = data.confidence;
          matchReasons   = data.meta?.matchReasons || [];
          routeUrl       = data.route;
        } else {
          // No route found — skip ingestion, mark as skipped
          updateItem(index, {
            status: "skipped",
            error: "Route finder returned no valid route.",
            routeUrl: null,
            confidence: null,
          });
          return;
        }
      } catch (e) {
        updateItem(index, {
          status: "error",
          error: `Route finder failed: ${e.message}`,
        });
        return;
      }
    } else {
      // Deep link — use directly
      routeUrl = normalizedUrl;
    }

    if (abortRef.current) return;

    // ── Step 2: Python Ingest ────────────────────────────────────────────────
    updateItem(index, { status: "ingesting", routeUrl, confidence, matchReasons });
    try {
      const res = await fetch(`${PYTHON_URL}/ingest/url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: ingestUrl, store: true }),
      });

      const raw = await res.text();
      let parsed;
      try { parsed = JSON.parse(raw); } catch { parsed = raw; }

      if (!res.ok) {
        updateItem(index, {
          status: "error",
          error: `Ingest failed (${res.status}): ${typeof parsed === "string" ? parsed : JSON.stringify(parsed)}`,
          ingestResponse: parsed,
          routeUrl, confidence, matchReasons,
        });
        return;
      }

      // Try to extract a record count from the response
      let recordsCount;
      if (typeof parsed === "object" && parsed !== null) {
        recordsCount = parsed.count ?? parsed.records_count ?? parsed.stored ?? parsed.total ?? undefined;
      }

      updateItem(index, {
        status: "done",
        ingestResponse: parsed,
        routeUrl, confidence, matchReasons,
        recordsCount,
      });
    } catch (e) {
      updateItem(index, {
        status: "error",
        error: `Ingest request failed: ${e.message}`,
        routeUrl, confidence, matchReasons,
      });
    }
  }, [updateItem]);

  // ── Run queue sequentially ─────────────────────────────────────────────────
  const runQueue = useCallback(async (urls) => {
    abortRef.current = false;
    setRunning(true);
    setDoneCount(0);

    const initialItems = urls.map(url => ({ url, status: "pending", needsRouteFinder: null }));
    setItems(initialItems);

    for (let i = 0; i < urls.length; i++) {
      if (abortRef.current) break;
      await processUrl(urls[i], i);
      setDoneCount(i + 1);
    }

    setRunning(false);
  }, [processUrl]);

  // ── Submit single URL ──────────────────────────────────────────────────────
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    const u = singleUrl.trim();
    if (!u) return;
    await runQueue([u]);
  };

  // ── Handle file upload ─────────────────────────────────────────────────────
  const handleFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    try {
      const text = await readFileAsText(file);
      const urls = extractUrls(text);
      if (urls.length === 0) {
        alert("No valid URLs found in this file.");
        return;
      }
      await runQueue(urls);
    } catch (e) {
      alert("Failed to read file: " + e.message);
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleStop = () => { abortRef.current = true; };
  const handleClear = () => { setItems([]); setDoneCount(0); setSingleUrl(""); setFileName(null); };

  const doneFinal  = items.filter(i => i.status === "done").length;
  const errCount   = items.filter(i => i.status === "error").length;
  const skipCount  = items.filter(i => i.status === "skipped" || i.status === "invalid").length;

  return (
    <div className="min-h-screen bg-background">
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
        .text-display-xl  { font-size: 96px; line-height: 110%; letter-spacing: -0.02em; font-weight: 400; }

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
        .liquid-glass-drop {
          backdrop-filter: blur(20px);
          background: linear-gradient(180deg, rgba(212,89,40,0.08) 0%, rgba(212,89,40,0.02) 100%);
          box-shadow: inset 0 0 0 2px rgba(212,89,40,0.5);
        }

        .bg-grid {
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 64px 64px;
        }
        .blob { position: fixed; pointer-events: none; border-radius: 50%; filter: blur(100px); opacity: 0.15; }

        @keyframes spin { to { transform: rotate(360deg); } }

        .drop-zone-active { animation: pulse-border 1s ease-in-out infinite; }
        @keyframes pulse-border {
          0%, 100% { box-shadow: inset 0 0 0 2px rgba(212,89,40,0.5); }
          50%       { box-shadow: inset 0 0 0 2px rgba(212,89,40,1), 0 0 30px rgba(212,89,40,0.3); }
        }
      `}} />

      {/* Ambient glows */}
      <div className="blob" style={{ width: 500, height: 500, top: -150, left: -150, background: "#d45928" }} />
      <div className="blob" style={{ width: 400, height: 400, bottom: -100, right: -100, background: "#d45928" }} />
      <div className="bg-grid absolute inset-0 pointer-events-none" />

      <TopNavBar />

      <main className="max-w-[1440px] mx-auto px-6 pt-40 pb-24">

        {/* ── HEADER ── */}
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-16">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-3">// URL Processor</p>
          <h1 className="font-display-xl text-display-xl italic text-primary mb-4">
            Ingest <span style={{ color: "#d45928" }}>URLs</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
            Submit a single government URL or upload a file with multiple URLs. Each is processed sequentially — routed if needed, then ingested.
          </p>
        </motion.div>

        {/* ── INPUT PANEL ── */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

          {/* Single URL */}
          <div className="liquid-glass rounded-[2rem] p-8 flex flex-col gap-5">
            <div className="flex items-center gap-3 mb-1">
              <span className="material-symbols-outlined text-2xl" style={{ color: "#d45928", fontVariationSettings: "'FILL' 1" }}>link</span>
              <h2 className="font-headline-md italic text-primary" style={{ fontSize: 28 }}>Single URL</h2>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant" style={{ marginTop: -8 }}>
              Enter one .gov.in or .nic.in URL to process immediately.
            </p>
            <form onSubmit={handleSingleSubmit} className="flex flex-col gap-3">
              <div className="liquid-glass rounded-2xl flex items-center gap-3 px-5 py-3">
                <span className="material-symbols-outlined text-base text-on-surface-variant">language</span>
                <input
                  value={singleUrl}
                  onChange={e => setSingleUrl(e.target.value)}
                  placeholder="https://example.gov.in"
                  disabled={running}
                  className="bg-transparent outline-none font-body-md text-body-md text-primary placeholder:text-on-surface-variant flex-1 disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={running || !singleUrl.trim()}
                className="bg-primary text-on-primary rounded-full px-6 py-3 font-label-caps text-label-caps hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Process URL
              </button>
            </form>
          </div>

          {/* File Upload */}
          <div
            className={`rounded-[2rem] p-8 flex flex-col gap-5 cursor-pointer transition-all duration-300 ${dragOver ? "liquid-glass-drop drop-zone-active" : "liquid-glass"}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !running && fileRef.current?.click()}
          >
            <div className="flex items-center gap-3 mb-1">
              <span className="material-symbols-outlined text-2xl" style={{ color: "#4285f4", fontVariationSettings: "'FILL' 1" }}>upload_file</span>
              <h2 className="font-headline-md italic text-primary" style={{ fontSize: 28 }}>Bulk Upload</h2>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant" style={{ marginTop: -8 }}>
              Upload a <strong className="text-primary">.txt</strong>, <strong className="text-primary">.doc</strong>, or <strong className="text-primary">.pdf</strong> file containing multiple URLs — one per line or comma-separated.
            </p>

            <div className="flex-1 flex flex-col items-center justify-center py-6 gap-3">
              <span
                className="material-symbols-outlined text-5xl"
                style={{ color: dragOver ? "#d45928" : "#c4c7c8", fontVariationSettings: "'FILL' 0", transition: "color 0.2s" }}
              >
                cloud_upload
              </span>
              <p className="font-label-caps text-label-caps text-on-surface-variant text-center">
                {dragOver ? "DROP TO UPLOAD" : fileName ? fileName : "DRAG & DROP OR CLICK TO BROWSE"}
              </p>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept=".txt,.doc,.docx,.pdf"
              className="hidden"
              disabled={running}
              onChange={handleFileChange}
            />
          </div>
        </motion.div>

        {/* ── PROGRESS + CONTROLS ── */}
        <AnimatePresence>
          {items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="liquid-glass rounded-[1.75rem] px-8 py-6 mb-8 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-label-caps text-label-caps text-on-surface-variant">PROGRESS</span>
                  <span className="font-label-caps text-label-caps text-primary">{doneCount} / {items.length}</span>
                  {running && (
                    <span className="liquid-glass rounded-full px-3 py-1 font-label-caps text-label-caps text-[10px]" style={{ color: "#4285f4" }}>
                      <span className="material-symbols-outlined text-xs" style={{ animation: "spin 1s linear infinite", display: "inline-block", verticalAlign: "middle" }}>autorenew</span>
                      {" "}RUNNING
                    </span>
                  )}
                </div>

                <div className="flex gap-3">
                  {/* Summary pills */}
                  {doneFinal > 0 && (
                    <span className="rounded-full px-3 py-1 font-label-caps text-label-caps text-[10px] flex items-center gap-1" style={{ background: "rgba(52,168,83,0.1)", color: "#34a853" }}>
                      <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      {doneFinal} done
                    </span>
                  )}
                  {errCount > 0 && (
                    <span className="rounded-full px-3 py-1 font-label-caps text-label-caps text-[10px] flex items-center gap-1" style={{ background: "rgba(234,67,53,0.1)", color: "#ea4335" }}>
                      <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>error_outline</span>
                      {errCount} errors
                    </span>
                  )}
                  {skipCount > 0 && (
                    <span className="rounded-full px-3 py-1 font-label-caps text-label-caps text-[10px] flex items-center gap-1" style={{ background: "rgba(251,188,4,0.1)", color: "#fbbc04" }}>
                      <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>skip_next</span>
                      {skipCount} skipped
                    </span>
                  )}

                  {running ? (
                    <button onClick={handleStop} className="liquid-glass rounded-full px-5 py-2 font-label-caps text-label-caps flex items-center gap-2 hover:bg-white/10 transition-colors" style={{ color: "#ea4335" }}>
                      <span className="material-symbols-outlined text-base">stop_circle</span>
                      Stop
                    </button>
                  ) : (
                    <button onClick={handleClear} className="liquid-glass rounded-full px-5 py-2 font-label-caps text-label-caps text-on-surface-variant flex items-center gap-2 hover:bg-white/10 transition-colors">
                      <span className="material-symbols-outlined text-base">delete_sweep</span>
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <ProgressBar done={doneCount} total={items.length} />

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-1">
                {Object.entries(STATUS).map(([key, s]) => (
                  <span key={key} className="flex items-center gap-1.5 font-label-caps text-label-caps text-[10px]" style={{ color: s.color }}>
                    <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                    {s.label}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── RESULT CARDS ── */}
        {items.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <div className="flex items-center justify-between mb-5">
              <p className="font-label-caps text-label-caps text-on-surface-variant">// Results — {items.length} URL{items.length !== 1 ? "s" : ""}</p>
              <p className="font-label-caps text-label-caps text-on-surface-variant text-[10px]">Click a row to expand details</p>
            </div>
            <div className="flex flex-col gap-3">
              {items.map((item, i) => (
                <ResultCard key={`${item.url}-${i}`} item={item} index={i} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── EMPTY STATE ── */}
        {items.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center justify-center py-32 gap-4 text-center"
          >
            <span className="material-symbols-outlined text-6xl text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 0", opacity: 0.3 }}>travel_explore</span>
            <p className="font-body-lg text-body-lg text-on-surface-variant opacity-50 max-w-xs">
              Submit a URL above or upload a file to start processing government directories.
            </p>
          </motion.div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 bg-background/50 backdrop-blur-md px-6 py-8">
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
    </div>
  );
}