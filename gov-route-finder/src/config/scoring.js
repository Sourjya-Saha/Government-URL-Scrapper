/**
 * Global Scoring Configuration
 * Optimized for gov.in domains to distinguish between live directories 
 * and placeholder/skeletal pages.
 */

const SCORING = {
  URL_KEYWORD_MATCH: 3,
  ANCHOR_TEXT_MATCH: 2,
  NEGATIVE_KEYWORD_PENALTY: -6, // Aggressive penalty to kill noise
  URL_BREVITY_BONUS: 1,
  URL_DEPTH_PENALTY: 0.5,
  
  // New: Strong preference for the "Connect" architecture found in Source 2
  ARCHITECTURE_BOOST: 12, 
  
  CONFIDENCE_THRESHOLD_HIGH: 10,
  CONFIDENCE_THRESHOLD_MEDIUM: 5,
  CONFIDENCE_THRESHOLD_LOW: 1,
};

const POSITIVE_KEYWORDS = [
  "directory", "contact", "email", "telephone", "phone", "whos-who", "connect",
  "officials", "officers", "staff", "employees", "personnel", "administration",
  "department", "ministry", "secretariat", "nodal", "tahsildar", "commissioner"
];

const STRONG_URL_PATTERNS = [
  // 🏆 TIER 1: THE "GOLD STANDARD" (Dynamic Directory Architecture)
  { pattern: /\/connect\/directory/i, bonus: 15, label: "active-directory-path" },
  { pattern: /\/connect-directory/i, bonus: 12, label: "connect-shortcut" },
  { pattern: /\/telephone[-_]directory/i, bonus: 5, label: "direct-phone-list" },
  
  // 🥈 TIER 2: HIGH CONFIDENCE (Structural/Role based)
  { pattern: /\/whos?-who/i, bonus: 8, label: "leadership-list" },
  { pattern: /directory[-_]officers/i, bonus: 8, label: "officer-list" },
  { pattern: /directory[-_]of[-_]employees/i, bonus: 8, label: "employee-list" },
  { pattern: /nodal[-_]officers/i, bonus: 7, label: "focal-points" },
  
  // 🥉 TIER 3: GENERAL SIGNALS (May be skeletal)
  { pattern: /\/contact-us/i, bonus: 4, label: "generic-contact" },
  { pattern: /\/about-us\/email-directory/i, bonus: 3, label: "potential-skeletal-path" },
  { pattern: /\/directory/i, bonus: 5, label: "generic-directory" }
];

const NEGATIVE_KEYWORDS = [
  // HR/News Noise - These often contain "officer" but aren't directories[cite: 1]
  "seniority-list", "transfer", "recruitment", "result", "interview", "waiting-list",
  "selection-list", "promotion", "appointment", "circular", "notice", "tender",
  "press-release", "photo-gallery", "video", "archive", "training", "orientation",
  "login", "signin", "sitemap", "feedback", ".pdf", ".xlsx", ".apk"
];

const FALLBACK_ROUTES = [
  // Always probe the active architecture first[cite: 2]
  "/connect/directory",
  "/connect/telephone-directory",
  "/connect-directory",
  
  // Then structural paths[cite: 1]
  "/whos-who",
  "/about-us/whos-who",
  "/directory-officers",
  "/directory-of-employees",
  "/nodal-officers",
  
  // Generic fallbacks[cite: 1]
  "/contact-us",
  "/about-us/email-directory",
  "/directory"
];

const SHALLOW_CRAWL_ROUTES = [
  "/connect",    // Critical: Connect paths usually host the real data[cite: 2]
  "/about-us", 
  "/contact", 
  "/directory",
  "/administration"
];

module.exports = {
  SCORING,
  POSITIVE_KEYWORDS,
  STRONG_URL_PATTERNS,
  NEGATIVE_KEYWORDS,
  FALLBACK_ROUTES,
  SHALLOW_CRAWL_ROUTES,
};