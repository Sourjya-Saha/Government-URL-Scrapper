/**
 * Scoring Engine
 * Assigns a numeric relevance score to each candidate link.
 * Pure functions — no I/O, no side effects.
 */

const {
  SCORING,
  POSITIVE_KEYWORDS,
  STRONG_URL_PATTERNS,
  NEGATIVE_KEYWORDS,
} = require("../config/scoring");

/**
 * Score a single candidate link based on its URL path and anchor text.
 *
 * @param {string} absoluteUrl  - Full resolved URL
 * @param {string} anchorText   - Visible text of the <a> tag
 * @param {string} baseOrigin   - The root URL being analyzed
 * @returns {{ score: number, reasons: string[] }}
 */
function scoreLink(absoluteUrl, anchorText, baseOrigin) {
  const reasons = [];
  let score = 0;

  // Extract just the path + query portion for URL analysis
  let urlPath = "";
  try {
    const parsed = new URL(absoluteUrl);
    urlPath = (parsed.pathname + parsed.search).toLowerCase();
  } catch {
    return { score: -Infinity, reasons: ["invalid URL"] };
  }

  const textLower = (anchorText || "").toLowerCase().trim();

  // ─── Negative keyword check ────────────────────────────────────────────────
  for (const neg of NEGATIVE_KEYWORDS) {
    if (urlPath.includes(neg) || textLower.includes(neg)) {
      score += SCORING.NEGATIVE_KEYWORD_PENALTY;
      reasons.push(`negative:"${neg}" (${SCORING.NEGATIVE_KEYWORD_PENALTY})`);
    }
  }

  // ─── Strong structural URL pattern bonuses ─────────────────────────────────
  for (const { pattern, bonus, label } of STRONG_URL_PATTERNS) {
    if (pattern.test(urlPath)) {
      score += bonus;
      reasons.push(`strong-pattern:"${label}" (+${bonus})`);
      break; // Only award the highest matching pattern bonus
    }
  }

  // ─── Positive keyword in URL ───────────────────────────────────────────────
  for (const kw of POSITIVE_KEYWORDS) {
    if (urlPath.includes(kw)) {
      score += SCORING.URL_KEYWORD_MATCH;
      reasons.push(`url-kw:"${kw}" (+${SCORING.URL_KEYWORD_MATCH})`);
    }
  }

  // ─── Positive keyword in anchor text ──────────────────────────────────────
  for (const kw of POSITIVE_KEYWORDS) {
    if (textLower.includes(kw)) {
      score += SCORING.ANCHOR_TEXT_MATCH;
      reasons.push(`text-kw:"${kw}" (+${SCORING.ANCHOR_TEXT_MATCH})`);
    }
  }

  // ─── URL brevity bonus ─────────────────────────────────────────────────────
  // Shorter paths are usually "main" pages rather than deep sub-pages
  const segments = urlPath.split("/").filter(Boolean);
  if (segments.length <= 2 && score > 0) {
    score += SCORING.URL_BREVITY_BONUS;
    reasons.push(`brevity (+${SCORING.URL_BREVITY_BONUS})`);
  } else if (segments.length > 2) {
    const penalty = (segments.length - 2) * SCORING.URL_DEPTH_PENALTY;
    score -= penalty;
    reasons.push(`depth-penalty (-${penalty.toFixed(1)})`);
  }

  return { score, reasons };
}

/**
 * Convert a raw numeric score into a 0.0–1.0 confidence value.
 * Uses a soft sigmoid-style mapping so scores above ~10 approach 1.0.
 *
 * @param {number} score
 * @returns {number}
 */
function scoreToConfidence(score) {
  if (score <= 0) return 0;
  // Sigmoid: confidence = score / (score + k), k=5 gives good mid-range spread
  const k = 5;
  const raw = score / (score + k);
  return Math.min(1, parseFloat(raw.toFixed(2)));
}

/**
 * Rank an array of { url, text } candidates and return them sorted best-first.
 *
 * @param {Array<{ url: string, text: string }>} candidates
 * @param {string} baseOrigin
 * @returns {Array<{ url: string, text: string, score: number, confidence: number, reasons: string[] }>}
 */
function rankCandidates(candidates, baseOrigin) {
  const seen = new Set();
  const scored = [];

  for (const { url, text } of candidates) {
    // De-duplicate by URL
    if (seen.has(url)) continue;
    seen.add(url);

    const { score, reasons } = scoreLink(url, text, baseOrigin);
    scored.push({ url, text, score, confidence: scoreToConfidence(score), reasons });
  }

  // Sort descending by score, then by URL length ascending (prefer shorter)
  scored.sort((a, b) => b.score - a.score || a.url.length - b.url.length);

  return scored;
}

module.exports = { scoreLink, scoreToConfidence, rankCandidates };