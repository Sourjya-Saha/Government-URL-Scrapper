"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PYTHON_URL = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || "http://localhost:8000";

// ─── Nav (same as landing) ──────────────────────────────────────────────────
function TopNavBar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      style={{
        backgroundColor: scrolled ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
        borderColor: scrolled ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)",
        transition: "background-color 0.3s, border-color 0.3s",
      }}
      className="fixed top-8 left-1/2 -translate-x-1/2 w-[95%] max-w-[1440px] rounded-full border backdrop-blur-[20px] z-50 flex justify-between items-center px-8 py-3"
    >
      <div className="font-headline-md text-headline-md italic text-primary tracking-tight">
        GOV.io
      </div>
      <div className="hidden md:flex gap-6 items-center">
        <a className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary hover:opacity-80 transition-all duration-300" href="/">About</a>
        <a className="font-label-caps text-label-caps text-primary border-b border-white pb-1" href="/dashboard">Dashboard</a>
        <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary hover:opacity-80 transition-all duration-300" href="/urls">URLs</a>
        <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary hover:opacity-80 transition-all duration-300" href="/">Chat.io</a>
      </div>
      <button className="bg-primary text-on-primary rounded-full px-6 py-2 font-label-caps text-label-caps hover:opacity-80 transition-opacity">
        Get Started
      </button>
    </nav>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, accent = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="liquid-glass rounded-[2rem] p-8 flex flex-col gap-3"
      style={accent ? { boxShadow: "inset 0 0 0 1px rgba(212,89,40,0.4)" } : {}}
    >
      <span className="material-symbols-outlined text-3xl" style={{ color: accent ? "#d45928" : "#e5e2e1", fontVariationSettings: "'FILL' 1" }}>
        {icon}
      </span>
      <span className="font-headline-lg text-headline-lg italic text-primary leading-none">
        {value ?? <span className="opacity-30 animate-pulse">—</span>}
      </span>
      <span className="font-label-caps text-label-caps text-on-surface-variant">{label}</span>
    </motion.div>
  );
}

// ─── Search Bar ─────────────────────────────────────────────────────────────
function SearchBar({ onSearch }) {
  const [q, setQ] = useState("");
  const [mode, setMode] = useState("semantic");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (q.trim()) onSearch(q.trim(), mode);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-center">
      <div className="liquid-glass rounded-full flex items-center gap-3 px-6 py-3 flex-1">
        <span className="material-symbols-outlined text-xl text-on-surface-variant">search</span>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search contacts, departments, designations..."
          className="bg-transparent outline-none font-body-md text-body-md text-primary placeholder:text-on-surface-variant flex-1"
        />
      </div>
      <div className="liquid-glass rounded-full flex overflow-hidden">
        {["semantic", "keyword"].map(m => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className="px-4 py-3 font-label-caps text-label-caps transition-all duration-200"
            style={{
              background: mode === m ? "rgba(255,255,255,0.15)" : "transparent",
              color: mode === m ? "#ffffff" : "#c4c7c8",
            }}
          >
            {m.toUpperCase()}
          </button>
        ))}
      </div>
      <button
        type="submit"
        className="bg-primary text-on-primary rounded-full px-6 py-3 font-label-caps text-label-caps hover:opacity-80 transition-opacity whitespace-nowrap"
      >
        Search
      </button>
    </form>
  );
}

// ─── Record Row ─────────────────────────────────────────────────────────────
function RecordRow({ record, index }) {
  const initials = (record.name || "??").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const colors = ["#d45928", "#4285f4", "#34a853", "#fbbc04", "#ea4335", "#8ab4f8"];
  const color = colors[index % colors.length];

  return (
    <motion.tr
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="border-b border-white/5 hover:bg-white/5 transition-colors duration-150 group"
    >
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: `${color}22`, color }}>
            {initials}
          </div>
          <span className="font-body-md text-body-md text-primary font-medium">{record.name || "—"}</span>
        </div>
      </td>
      <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{record.designation || "—"}</td>
      <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{record.department || "—"}</td>
      <td className="py-4 px-6">
        {record.email ? (
          <a href={`mailto:${record.email}`} className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200 flex items-center gap-1">
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
            {record.email}
          </a>
        ) : <span className="text-on-surface-variant opacity-40">—</span>}
      </td>
      <td className="py-4 px-6 font-body-md text-body-md text-on-surface-variant">{record.phone || "—"}</td>
      <td className="py-4 px-6">
        {record.source_url ? (
          <a href={record.source_url} target="_blank" rel="noopener noreferrer"
            className="liquid-glass rounded-full px-3 py-1 font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors duration-200 text-[10px] truncate max-w-[180px] inline-block"
          >
            {new URL(record.source_url).hostname.replace("www.", "")}
          </a>
        ) : <span className="text-on-surface-variant opacity-40">—</span>}
      </td>
    </motion.tr>
  );
}

// ─── Skeleton Loader ────────────────────────────────────────────────────────
function SkeletonRows({ count = 8 }) {
  return Array.from({ length: count }).map((_, i) => (
    <tr key={i} className="border-b border-white/5">
      {[40, 28, 24, 32, 20, 20].map((w, j) => (
        <td key={j} className="py-4 px-6">
          <div className="h-4 rounded-full animate-pulse bg-white/10" style={{ width: `${w + Math.random() * 30}%` }} />
        </td>
      ))}
    </tr>
  ));
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const limit = 50;

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${PYTHON_URL}/stats`);
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error("Stats fetch failed", e);
    }
  }, []);

  const fetchRecords = useCallback(async (pageNum = 0) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${PYTHON_URL}/records?limit=${limit}&offset=${pageNum * limit}`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : (data.items || data.records || []);
      setRecords(arr);
      setTotal(data.total || arr.length);
    } catch (e) {
      setError("Failed to load records. Make sure your Python backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = async (q, mode) => {
    setSearchLoading(true);
    setIsSearchMode(true);
    setSearchQuery(q);
    setError(null);
    try {
      const res = await fetch(`${PYTHON_URL}/search?q=${encodeURIComponent(q)}&mode=${mode}&limit=100`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : (data.results || data.items || []);
      setRecords(arr);
      setTotal(arr.length);
      setPage(0);
    } catch (e) {
      setError("Search failed. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setIsSearchMode(false);
    setSearchQuery("");
    setPage(0);
    fetchRecords(0);
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const res = await fetch(`${PYTHON_URL}/export/csv`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "gov_contacts.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Export failed.");
    } finally {
      setExportLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchRecords(0);
  }, []);

  const handlePage = (dir) => {
    const next = page + dir;
    setPage(next);
    fetchRecords(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600&family=Instrument+Serif:ital@0;1&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .bg-background { background-color: #141313; }
        .text-on-background { color: #e5e2e1; }
        .text-primary { color: #ffffff; }
        .hover\\:text-primary:hover { color: #ffffff; }
        .bg-primary { background-color: #ffffff; }
        .text-on-primary { color: #2f3131; }
        .text-on-surface-variant { color: #c4c7c8; }
        .text-on-surface { color: #e5e2e1; }
        .bg-surface-container-lowest { background-color: #0e0e0e; }

        .font-headline-md { font-family: 'Instrument Serif', serif; }
        .text-headline-md { font-size: 48px; line-height: 120%; font-weight: 400; }
        .font-label-caps { font-family: 'Barlow', sans-serif; }
        .text-label-caps { font-size: 12px; line-height: 100%; letter-spacing: 0.15em; font-weight: 600; }
        .font-body-md { font-family: 'Barlow', sans-serif; }
        .text-body-md { font-size: 16px; line-height: 160%; font-weight: 400; }
        .font-display-xl { font-family: 'Instrument Serif', serif; }
        .text-display-xl { font-size: 96px; line-height: 110%; letter-spacing: -0.02em; font-weight: 400; }
        .font-body-lg { font-family: 'Barlow', sans-serif; }
        .text-body-lg { font-size: 18px; line-height: 160%; letter-spacing: 0.01em; font-weight: 400; }
        .font-headline-lg { font-family: 'Instrument Serif', serif; }
        .text-headline-lg { font-size: 56px; line-height: 120%; font-weight: 400; }

        .liquid-glass {
          backdrop-filter: blur(20px);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.15);
        }
        .liquid-glass-strong {
          backdrop-filter: blur(40px);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3), 0 20px 40px rgba(0, 0, 0, 0.5);
        }
        .liquid-glass-table {
          backdrop-filter: blur(20px);
          background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1);
        }

        /* bg grid */
        .bg-grid {
          background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 64px 64px;
        }

        /* glow blob */
        .blob {
          position: fixed;
          pointer-events: none;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.18;
        }
      `}} />

      {/* Ambient glows */}
      <div className="blob" style={{ width: 600, height: 600, top: -200, left: -200, background: "#d45928" }} />
      <div className="blob" style={{ width: 500, height: 500, bottom: -100, right: -100, background: "#d45928" }} />
      <div className="bg-grid absolute inset-0 pointer-events-none" />

      <TopNavBar />

      <main className="max-w-[1440px] mx-auto px-6 pt-40 pb-24">

        {/* ── PAGE HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-3">// Dashboard</p>
          <h1 className="font-display-xl text-display-xl italic text-primary mb-4">
            Data <span style={{ color: "#d45928" }}>Overview</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
            Scraped government directory contacts, searchable and exportable in real time.
          </p>
        </motion.div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
       

<StatCard label="TOTAL CONTACTS" value={stats?.total_contacts?.toLocaleString()} icon="contacts" accent />
<StatCard label="DEPARTMENTS" value={stats?.unique_departments?.toLocaleString()} icon="corporate_fare" />
<StatCard label="SOURCES SCRAPED" value={stats?.unique_sources?.toLocaleString()} icon="language" />
<StatCard label="VECTORS INDEXED" value={stats?.chroma_vectors?.toLocaleString()} icon="hub" />
        </div>

        {/* ── SEARCH + EXPORT ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <SearchBar onSearch={handleSearch} />

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              {isSearchMode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="liquid-glass rounded-full px-4 py-2 flex items-center gap-2"
                >
                  <span className="font-label-caps text-label-caps text-on-surface-variant">Search: </span>
                  <span className="font-label-caps text-label-caps text-primary">{searchQuery}</span>
                  <button onClick={clearSearch} className="material-symbols-outlined text-sm text-on-surface-variant hover:text-primary ml-1">close</button>
                </motion.div>
              )}
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                {total.toLocaleString()} {isSearchMode ? "results" : "records"}
              </span>
            </div>

            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="liquid-glass rounded-full px-5 py-2.5 font-label-caps text-label-caps text-primary flex items-center gap-2 hover:bg-white/10 transition-colors duration-200 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">download</span>
              {exportLoading ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        </motion.div>

        {/* ── TABLE ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="liquid-glass-table rounded-[2rem] overflow-hidden mb-8"
        >
          {error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <span className="material-symbols-outlined text-5xl" style={{ color: "#d45928" }}>error_outline</span>
              <p className="font-body-lg text-body-lg text-on-surface-variant text-center max-w-md">{error}</p>
              <button onClick={() => fetchRecords(page)} className="bg-primary text-on-primary rounded-full px-6 py-2 font-label-caps text-label-caps hover:opacity-80">
                Retry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    {["Name", "Designation", "Department", "Email", "Phone", "Source"].map(h => (
                      <th key={h} className="py-4 px-6 text-left font-label-caps text-label-caps text-on-surface-variant whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(loading || searchLoading) ? (
                    <SkeletonRows count={8} />
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-24 text-center">
                        <span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-4">search_off</span>
                        <p className="font-body-lg text-body-lg text-on-surface-variant">No records found</p>
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence mode="wait">
                      {records.map((record, i) => (
                        <RecordRow key={record.id || i} record={record} index={i} />
                      ))}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* ── PAGINATION ── */}
        {!isSearchMode && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handlePage(-1)}
              disabled={page === 0 || loading}
              className="liquid-glass rounded-full px-6 py-3 font-label-caps text-label-caps text-primary flex items-center gap-2 hover:bg-white/10 transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Prev
            </button>

            <div className="liquid-glass rounded-full px-6 py-3">
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                Page <span className="text-primary">{page + 1}</span> of <span className="text-primary">{totalPages}</span>
              </span>
            </div>

            <button
              onClick={() => handlePage(1)}
              disabled={page >= totalPages - 1 || loading}
              className="liquid-glass rounded-full px-6 py-3 font-label-caps text-label-caps text-primary flex items-center gap-2 hover:bg-white/10 transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
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