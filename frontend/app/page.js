"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import Link from "next/link";
// --- Tech Stack SVG Icons ---
const NextjsIcon = () => (
  <svg viewBox="0 0 128 128" width="32" height="32" fill="currentColor">
    <path d="M64 0C28.7 0 0 28.7 0 64s28.7 64 64 64c11.2 0 21.7-2.9 30.8-7.9L48.4 55.3v36.6H36.7V40.4h13.5l50.8 73.9C116.7 101.3 128 83.9 128 64c0-35.3-28.7-64-64-64zm22.1 84.6l-7.5-10.3V40.4h7.5v44.2z" />
  </svg>
);

const PythonIcon = () => (
  <svg viewBox="0 0 128 128" width="32" height="32">
    <linearGradient id="py1" x1="70.252" y1="1237.476" x2="170.659" y2="1151.089" gradientTransform="matrix(.563 0 0 -.568 -29.215 707.817)" gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor="#5A9FD4" />
      <stop offset="1" stopColor="#306998" />
    </linearGradient>
    <linearGradient id="py2" x1="209.474" y1="1098.811" x2="173.62" y2="1149.537" gradientTransform="matrix(.563 0 0 -.568 -29.215 707.817)" gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor="#FFD43B" />
      <stop offset="1" stopColor="#FFE873" />
    </linearGradient>
    <path fill="url(#py1)" d="M63.391 1.988c-4.222.02-8.252.379-11.8 1.007-10.45 1.846-12.346 5.71-12.346 12.837v9.411h24.693v3.137H29.977c-7.176 0-13.46 4.313-15.426 12.521-2.268 9.405-2.368 15.275 0 25.096 1.755 7.311 5.947 12.519 13.124 12.519h8.491V67.234c0-8.151 7.051-15.34 15.426-15.34h24.665c6.866 0 12.346-5.654 12.346-12.548V15.833c0-6.693-5.646-11.72-12.346-12.837-4.244-.706-8.645-1.027-12.866-1.008zM50.037 9.557c2.55 0 4.634 2.117 4.634 4.721 0 2.593-2.083 4.69-4.634 4.69-2.56 0-4.633-2.097-4.633-4.69-.001-2.604 2.073-4.721 4.633-4.721z" />
    <path fill="url(#py2)" d="M91.682 28.38v10.966c0 8.5-7.208 15.655-15.426 15.655H51.591c-6.756 0-12.346 5.783-12.346 12.549v23.515c0 6.691 5.818 10.628 12.346 12.547 7.816 2.297 15.312 2.713 24.665 0 6.216-1.801 12.346-5.423 12.346-12.547v-9.412H63.938v-3.138h37.012c7.176 0 9.852-5.005 12.348-12.519 2.578-7.735 2.467-15.174 0-25.096-1.774-7.145-5.161-12.521-12.348-12.521h-9.268zM77.809 87.927c2.561 0 4.634 2.097 4.634 4.692 0 2.602-2.074 4.719-4.634 4.719-2.55 0-4.633-2.117-4.633-4.719 0-2.595 2.083-4.692 4.633-4.692z" />
  </svg>
);

const SupabaseIcon = () => (
  <svg viewBox="0 0 109 113" width="30" height="30" fill="none">
    <path d="M63.708 110.284c-2.86 3.601-8.658 1.628-8.727-2.97l-1.007-67.251h45.22c8.19 0 12.758 9.46 7.665 15.874L63.708 110.284z" fill="url(#sb1)" />
    <path d="M63.708 110.284c-2.86 3.601-8.658 1.628-8.727-2.97l-1.007-67.251h45.22c8.19 0 12.758 9.46 7.665 15.874L63.708 110.284z" fill="url(#sb2)" fillOpacity=".2" />
    <path d="M45.317 2.071c2.86-3.601 8.657-1.628 8.726 2.97l.442 67.251H9.83c-8.19 0-12.759-9.46-7.665-15.875L45.317 2.071z" fill="#3ECF8E" />
    <defs>
      <linearGradient id="sb1" x1="53.974" y1="54.974" x2="94.163" y2="71.829" gradientUnits="userSpaceOnUse">
        <stop stopColor="#249361" />
        <stop offset="1" stopColor="#3ECF8E" />
      </linearGradient>
      <linearGradient id="sb2" x1="36.156" y1="30.578" x2="54.125" y2="63.625" gradientUnits="userSpaceOnUse">
        <stop />
        <stop offset="1" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);


const SQLiteIcon = () => (
  <svg viewBox="0 0 128 128" width="30" height="30" fill="none">
    <defs>
      <linearGradient id="sqliteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0f80cc" />
        <stop offset="100%" stopColor="#003b57" />
      </linearGradient>
    </defs>
    {/* The Feather - Official SQLite Logo Style */}
    <path 
      fill="url(#sqliteGradient)" 
      d="M115.3 19.4c-12.1-5.1-34.6-9.1-53.5-2.7-18 6.1-35.4 20.3-43.5 40.5-2 5-3.3 10.3-3.9 15.6-.5 4.5-.4 9.1.5 13.5 1.5 7.1 5.3 13.5 10.5 18.5 1.9 1.8 4 3.4 6.2 4.8 5.7 4.1 12.4 6.1 19.3 5.8 4.7-.2 9.4-1.3 13.7-3.2 4.3-1.9 8.2-4.6 11.4-8 1.1-1.1 2.2-2.3 3.1-3.6 4-5.3 6.6-11.4 7.6-17.9.6-4.5.4-9.1-.5-13.5-1.1-5.4-3.3-10.6-6.4-15.3-2.9-4.3-6.6-8.1-10.8-11.1-4.2-3-8.8-5.3-13.8-6.7 4.8-1.7 9.8-2.5 14.9-2.5 16.5 0 32.4 8.2 43.1 22.4.6.8 1.5.8 2.1.2.6-.6.6-1.5 0-2.1-11.2-14.7-27.7-23.2-45.2-23.2-5.4 0-10.7.8-15.8 2.5 3.3.9 6.5 2.2 9.5 3.9 4.1 2.3 7.7 5.3 10.6 8.9 3.2 3.8 5.6 8.2 7.1 13 .9 2.9 1.4 5.9 1.5 8.9.1 5.4-1 10.7-3.3 15.6-2.1 4.5-5.3 8.5-9.2 11.6-1.3 1-2.7 1.9-4.1 2.7-4.4 2.4-9.3 3.8-14.3 3.9-6.3.1-12.4-1.8-17.6-5.5-2-.4-3.9-2.1-5.6-3.8-4.7-4.5-8-10.3-9.3-16.7-.8-4-.9-8.1-.5-12.2.5-4.8 1.7-9.5 3.5-14.1 7.3-18.4 23.2-31.5 40.1-37.2 18-6.1 39.5-2.2 51 2.9.9.4 2-.1 2.4-1 .3-.9-.2-2-1.1-2.4z"
    />
  </svg>
);

const GeminiIcon = () => (
  <svg viewBox="0 0 28 28" width="32" height="32" fill="none">
    <path d="M14 2C14 2 8 8 8 14C8 20 14 26 14 26C14 26 20 20 20 14C20 8 14 2 14 2Z" fill="url(#gem1)" />
    <path d="M2 14C2 14 8 8 14 8C20 8 26 14 26 14C26 14 20 20 14 20C8 20 2 14 2 14Z" fill="url(#gem2)" />
    <defs>
      <linearGradient id="gem1" x1="14" y1="2" x2="14" y2="26" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4285F4" />
        <stop offset="1" stopColor="#8AB4F8" />
      </linearGradient>
      <linearGradient id="gem2" x1="2" y1="14" x2="26" y2="14" gradientUnits="userSpaceOnUse">
        <stop stopColor="#EA4335" />
        <stop offset="0.5" stopColor="#FBBC04" />
        <stop offset="1" stopColor="#34A853" />
      </linearGradient>
    </defs>
  </svg>
);

const FastAPIIcon = () => (
  <svg viewBox="0 0 128 128" width="32" height="32" fill="none">
    <circle cx="64" cy="64" r="64" fill="#009688" />
    <path d="M72.732 26.667L32 69.333h33.6L55.465 101.333l40.731-42.666H62.201z" fill="white" />
  </svg>
);

const techStack = [
  { name: "Next.js", icon: <NextjsIcon /> },
  { name: "Python", icon: <PythonIcon /> },
  { name: "SQLlite", icon: <SQLiteIcon /> },
  { name: "Gemini", icon: <GeminiIcon /> },
  { name: "FastAPI", icon: <FastAPIIcon /> },
];
// ----------------------------

export default function Page() {
  const { scrollY } = useScroll();

  // 1. BACKGROUND ZOOM
  const bgZoom = useTransform(scrollY, [0, 1500], [1.2, 2.8]);

  // 2. HERO PHASE
  const heroScale = useTransform(scrollY, [0, 800], [1, 2]);
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0]);
  const heroBlur = useTransform(
    scrollY,
    [0, 600],
    ["blur(0px)", "blur(20px)"]
  );
  const statsY = useTransform(scrollY, [0, 800], [0, 150]);
  const heroPointer = useTransform(scrollY, (v) =>
    v > 600 ? "none" : "auto"
  );

  // 3. CAPABILITIES PHASE
  const capOpacity = useTransform(scrollY, [700, 1200], [0, 1]);
  const capY = useTransform(scrollY, [700, 1200], [100, 0]);
  const capPointer = useTransform(scrollY, (v) =>
    v < 700 ? "none" : "auto"
  );

  // 4. FOOTER PHASE
  const footerOpacity = useTransform(scrollY, [1200, 1600], [0, 1]);
  const footerPointer = useTransform(scrollY, (v) =>
    v < 1200 ? "none" : "auto"
  );

  // Nav transforms
  const navBg = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255,255,255,0.05)", "rgba(255,255,255,0.15)"]
  );
  const navBorder = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255,255,255,0.15)", "rgba(255,255,255,0.3)"]
  );

  return (
    <div className="relative h-[300vh] bg-background">
      
      {/* 
        INJECTED TAILWIND CONFIG STYLES & MARQUEE ANIMATION
      */}
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
        .text-display-xl { font-size: 120px; line-height: 110%; letter-spacing: -0.02em; font-weight: 400; }
        .font-body-lg { font-family: 'Barlow', sans-serif; }
        .text-body-lg { font-size: 18px; line-height: 160%; letter-spacing: 0.01em; font-weight: 400; }
        .font-headline-lg { font-family: 'Instrument Serif', serif; }
        .text-headline-lg { font-size: 64px; line-height: 120%; font-weight: 400; }

        .max-w-container-max { max-width: 1440px; }
        .px-gutter { padding-left: 24px; padding-right: 24px; }
        .py-section-padding { padding-top: 120px; padding-bottom: 120px; }
        .p-glass-padding { padding: 32px; }

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

        /* --- Custom Left-to-Right Infinite Marquee --- */
        @keyframes marqueeRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee-right {
          display: flex;
          width: max-content;
          animation: marqueeRight 25s linear infinite;
        }
        .animate-marquee-right:hover {
          animation-play-state: paused;
        }
        .marquee-mask {
          -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
          mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
        }
      `}} />

      {/* TopNavBar */}
      <motion.nav
        style={{ backgroundColor: navBg, borderColor: navBorder }}
        className="fixed top-8 left-1/2 -translate-x-1/2 w-[95%] max-w-container-max rounded-full border border-white/15 backdrop-blur-[20px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] shadow-[0_20px_40px_rgba(0,0,0,0.5)] z-50 flex justify-between items-center px-8 py-3 transition-colors duration-300"
      >
        <div className="font-headline-md text-headline-md italic text-primary tracking-tight">
          GOV.io
        </div>
        <div className="hidden md:flex gap-6 items-center">
          <a
            className="font-label-caps text-label-caps text-primary border-b border-white pb-1 hover:text-primary hover:opacity-80 transition-all duration-300 scale-100 active:scale-95"
            href="/"
          >
            About
          </a>
          <a
            className="font-body-md text-body-md text-on-surface-variant hover:text-primary hover:opacity-80 transition-all duration-300 scale-100 active:scale-95"
            href="/dashboard"
          >
            Dashboard
          </a>
          <a
            className="font-body-md text-body-md text-on-surface-variant hover:text-primary hover:opacity-80 transition-all duration-300 scale-100 active:scale-95"
            href="/urls"
          >
            URLs
          </a>
          <a
            className="font-body-md text-body-md text-on-surface-variant hover:text-primary hover:opacity-80 transition-all duration-300 scale-100 active:scale-95"
            href="/"
          >
            Chat.io
          </a>
        </div>
       <Link href="/dashboard">
  <button className="bg-primary text-on-primary rounded-full px-6 py-2 font-label-caps text-label-caps hover:opacity-80 transition-opacity">
    Get Started
  </button>
</Link>
      </motion.nav>

      {/* STICKY VIEWPORT */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center items-center">
        {/* LAYER 1: Background Image */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <motion.img
            style={{ scale: bgZoom }}
            alt="A breathtaking cinematic view of a nebula in deep space."
            className="w-full h-full object-cover object-top opacity-50 origin-center"
            src="/dna.png"
          />
        </div>

        {/* LAYER 2: Hero Content */}
        <motion.div
          style={{
            scale: heroScale,
            opacity: heroOpacity,
            filter: heroBlur,
            pointerEvents: heroPointer,
          }}
          className="absolute inset-0 z-10 w-full h-full max-w-container-max mx-auto flex flex-col items-center justify-between pt-48 pb-12 px-gutter"
        >
          <div className="flex flex-col items-center text-center">
            <div className="liquid-glass rounded-full px-4 py-2 mb-8 flex items-center gap-3">
              <span className="bg-primary text-on-primary font-label-caps text-label-caps px-2 py-1 rounded-full">
                AI Powered
              </span>
              <span className="font-body-md text-body-md text-on-surface">
                Automated Government Directory Discovery
              </span>
            </div>
           <h1 className="font-display-xl text-display-xl italic text-primary mb-6 max-w-4xl">
  Get <span className="text-[#d45928]">gov.in</span> directory data instantly
</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-12 max-w-2xl">
              Find directory data from government sites. Fast, simple, automated
            </p>
            <div className="flex flex-col sm:flex-row gap-6 mb-12">
              <Link href="/dashboard">
              <button className="liquid-glass-strong rounded-full px-8 py-4 font-label-caps text-label-caps text-primary hover:bg-white/10 transition-colors">
                Get Started
              </button>
              </Link>
              <a
                className="flex items-center gap-2 font-label-caps text-label-caps text-primary hover:opacity-80 transition-opacity px-8 py-4"
                href="/"
              >
                <span className="material-symbols-outlined">play_circle</span>
                View Demo
              </a>
            </div>
          </div>

          <motion.div style={{ y: statsY }} className="w-full">
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="liquid-glass rounded-[2.5rem] p-glass-padding flex flex-col items-center justify-center">
                <span className="font-headline-lg text-headline-lg text-primary italic">
                  2.5 Sec
                </span>
                <span className="font-label-caps text-label-caps text-on-surface-variant mt-2">
                  AVERAGE PROCCESING TIME
                </span>
              </div>
              <div className="liquid-glass rounded-[2.5rem] p-glass-padding flex flex-col items-center justify-center">
                <span className="font-headline-lg text-headline-lg text-primary italic">
                  80+
                </span>
                <span className="font-label-caps text-label-caps text-on-surface-variant mt-2">
                  URLs TRAVERSED
                </span>
              </div>
            </div>
            
            {/* Infinite Left-to-Right Marquee for Tech Stack */}
            <div className="w-full overflow-hidden marquee-mask mt-4">
              <div className="animate-marquee-right text-white cursor-default">
                {/* 
                  Render multiple sets to ensure it's wide enough for a seamless loop 
                  (-50% to 0% requires 2 visible sets at all times, rendering 4 is safe) 
                */}
                {[...Array(4)].map((_, i) => (
                  <div key={`tech-set-${i}`} className="flex shrink-0 gap-16 px-8">
                    {techStack.map((tech) => (
                      <div key={`${tech.name}-${i}`} className="flex items-center gap-3 font-headline-md text-headline-md italic">
                        {tech.icon}
                        <span className="whitespace-nowrap">{tech.name}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* LAYER 3: Capabilities Section */}
        <motion.div
          style={{
            opacity: capOpacity,
            y: capY,
            pointerEvents: capPointer,
          }}
          className="absolute inset-0 z-20 w-full h-full max-w-container-max mx-auto flex flex-col justify-center px-gutter pt-24 pb-32"
        >
          <div className="mb-16 text-center md:text-left">
            <p className="font-label-caps text-label-caps text-on-surface-variant mb-4">
              // Capabilities
            </p>
            <h2 className="font-headline-lg text-headline-lg italic text-primary">
              Production evolved
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="liquid-glass rounded-[2.5rem] p-glass-padding flex flex-col">
              <div className="flex justify-between items-start mb-12">
                <span
                  className="material-symbols-outlined text-4xl text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  public
                </span>
                <span className="liquid-glass-strong rounded-full px-3 py-1 font-label-caps text-label-caps text-primary text-[10px]">
                  AI ENGINE
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md italic text-primary mb-4">
                Intelligent Detection
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Automatically detects directory, contact, and official pages from government websites using smart pattern recognition.
              </p>
            </div>
            <div className="liquid-glass rounded-[2.5rem] p-glass-padding flex flex-col">
              <div className="flex justify-between items-start mb-12">
                <span
                  className="material-symbols-outlined text-4xl text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  rocket_launch
                </span>
                <span className="liquid-glass-strong rounded-full px-3 py-1 font-label-caps text-label-caps text-primary text-[10px]">
                  BULK MODE
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md italic text-primary mb-4">
                Batch Processing
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Upload multiple URLs via file or input and process them sequentially with real-time tracking and status updates.
              </p>
            </div>
            <div className="liquid-glass rounded-[2.5rem] p-glass-padding flex flex-col">
              <div className="flex justify-between items-start mb-12">
                <span
                  className="material-symbols-outlined text-4xl text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  lightbulb
                </span>
                <span className="liquid-glass-strong rounded-full px-3 py-1 font-label-caps text-label-caps text-primary text-[10px]">
                  INSIGHTS
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md italic text-primary mb-4">
                Structured Insights
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                View organized results with confidence scores, summaries, and insights for each processed website.
              </p>
            </div>
          </div>
        </motion.div>

        {/* LAYER 4: Footer */}
        <motion.footer
          style={{
            opacity: footerOpacity,
            pointerEvents: footerPointer,
          }}
          className="absolute bottom-0 w-full py-8 border-t border-white/10 bg-background/50 backdrop-blur-md px-gutter z-30"
        >
          <div className="max-w-container-max mx-auto w-full flex flex-col md:flex-row justify-between items-center">
            <div className="text-headline-md font-headline-md italic text-primary mb-4 md:mb-0">
              GOV.io
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant text-center md:text-left mb-4 md:mb-0">
              © 2026 GOV.io . All Rights Reserved. Made by Code Nirvana
            </p>
            <div className="flex gap-6">
              <a
                className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors duration-300 opacity-100 hover:opacity-70"
                href="/"
              >
                Srinjoy Roy
              </a>
              <a
                className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors duration-300 opacity-100 hover:opacity-70"
                href="/"
              >
                Sourjya Saha
              </a>
              <a
                className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors duration-300 opacity-100 hover:opacity-70"
                href="/"
              >
               Aritra Dhar
              </a>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}