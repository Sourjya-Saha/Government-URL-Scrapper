/**
 * Route Finder Service
 * Orchestrates the full pipeline:
 *   1. Fetch homepage HTML
 *   2. Extract + score all links
 *   3. If no strong match → probe fallback routes
 *   4. If still weak → shallow-crawl promising sub-pages
 *   5. Return the single best { route, confidence, meta }
 */

const { fetchHtml, probeUrl } = require("./fetcher");
const { extractLinks, extractPageTitle } = require("./extractor");
const { rankCandidates, scoreToConfidence } = require("./scorer");
const { resolveHref } = require("../utils/urlUtils");
const {
  SCORING,
  FALLBACK_ROUTES,
  SHALLOW_CRAWL_ROUTES,
} = require("../config/scoring");

// Minimum score to accept a homepage-extracted link without fallback
const MIN_ACCEPTABLE_SCORE = SCORING.CONFIDENCE_THRESHOLD_MEDIUM;

// Minimum score to skip shallow crawl
const MIN_SCORE_SKIP_CRAWL = SCORING.CONFIDENCE_THRESHOLD_HIGH;

/**
 * Main entry point.
 * @param {string} inputUrl - Validated, normalized URL string
 * @returns {Promise<{
 *   route: string,
 *   confidence: number,
 *   score: number,
 *   source: string,
 *   pageTitle: string,
 *   allCandidates: Array
 * }>}
 */
async function findBestRoute(inputUrl) {
  const origin = new URL(inputUrl).origin;
  const log = makeLogger(inputUrl);

  // ── Step 1: Fetch & parse homepage ────────────────────────────────────────
  log("Fetching homepage...");
  let homepageHtml, finalUrl, pageTitle;

  try {
    ({ html: homepageHtml, finalUrl } = await fetchHtml(inputUrl));
    pageTitle = extractPageTitle(homepageHtml);
    log(`Page title: "${pageTitle}"`);
  } catch (err) {
    throw enrichError(err, "Failed to fetch homepage");
  }

  // ── Step 2: Extract all links and rank them ────────────────────────────────
  const rawLinks = extractLinks(homepageHtml, finalUrl, origin);
  log(`Extracted ${rawLinks.length} unique internal links from homepage`);

  let ranked = rankCandidates(rawLinks, origin);
  const best = ranked[0];

  // ── Step 3: Accept homepage result if score is strong enough ───────────────
  if (best && best.score >= MIN_SCORE_SKIP_CRAWL) {
    log(`Strong match found on homepage: ${best.url} (score: ${best.score})`);
    return buildResult(best, "homepage", pageTitle, ranked);
  }

  // ── Step 4: Probe static fallback routes ──────────────────────────────────
  log("Score below threshold — probing fallback routes...");
  const fallbackResult = await probeFallbackRoutes(origin, log);

  if (fallbackResult) {
    // If a fallback scores better than homepage best, use it
    if (!best || fallbackResult.score >= best.score) {
      log(`Fallback route won: ${fallbackResult.url} (score: ${fallbackResult.score})`);
      return buildResult(fallbackResult, "fallback-probe", pageTitle, ranked);
    }
  }

  // ── Step 5: Shallow crawl if we still lack confidence ─────────────────────
  if (!best || best.score < MIN_ACCEPTABLE_SCORE) {
    log("Still low confidence — attempting shallow crawl...");
    const crawlResult = await shallowCrawl(origin, rawLinks, finalUrl, log);

    if (crawlResult && crawlResult.score > (best?.score ?? -Infinity)) {
      log(`Shallow crawl found: ${crawlResult.url} (score: ${crawlResult.score})`);
      return buildResult(crawlResult, "shallow-crawl", pageTitle, ranked);
    }
  }

  // ── Step 6: Return homepage best (even if weak) or fallback ───────────────
  const finalBest = best || fallbackResult;
  if (!finalBest || finalBest.score <= 0) {
    throw createServiceError(
      "NO_MATCH",
      "No directory-related route found. The site may not have a standard contact/directory page."
    );
  }

  log(`Returning best available: ${finalBest.url} (score: ${finalBest.score})`);
  return buildResult(finalBest, "homepage", pageTitle, ranked);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Probe known fallback routes (HEAD requests, fast).
 */
async function probeFallbackRoutes(origin, log) {
  const probePromises = FALLBACK_ROUTES.map(async (route) => {
    const url = `${origin}${route}`;
    const exists = await probeUrl(url);
    if (exists) {
      const { score } = require("./scorer").scoreLink(url, route.replace(/[-/]/g, " "), origin);
      log(`  Fallback probe: ${url} → exists (score: ${score})`);
      return { url, text: route, score, confidence: scoreToConfidence(score), reasons: ["fallback-probe"] };
    }
    return null;
  });

  const results = (await Promise.allSettled(probePromises))
    .filter((r) => r.status === "fulfilled" && r.value !== null)
    .map((r) => r.value)
    .sort((a, b) => b.score - a.score);

  return results[0] || null;
}

/**
 * Crawl one level deeper on pages likely to contain sub-links
 * to directory/contact pages.
 */
async function shallowCrawl(origin, existingLinks, baseUrl, log) {
  // Find homepage links that match shallow crawl candidates
  const crawlTargets = existingLinks
    .filter(({ url }) =>
      SHALLOW_CRAWL_ROUTES.some((route) => {
        try {
          return new URL(url).pathname.toLowerCase().includes(route.slice(1));
        } catch {
          return false;
        }
      })
    )
    .slice(0, 3); // Limit to 3 sub-pages to keep it fast

  log(`Shallow crawl targets: ${crawlTargets.map((t) => t.url).join(", ") || "none"}`);

  const allSubLinks = [];

  await Promise.allSettled(
    crawlTargets.map(async ({ url }) => {
      try {
        const { html, finalUrl } = await fetchHtml(url, { timeoutMs: 8000, retries: 1 });
        const subLinks = require("./extractor").extractLinks(html, finalUrl, origin);
        allSubLinks.push(...subLinks);
        log(`  Crawled ${url}: found ${subLinks.length} sub-links`);
      } catch (err) {
        log(`  Crawl failed for ${url}: ${err.message}`);
      }
    })
  );

  if (!allSubLinks.length) return null;

  const ranked = rankCandidates(allSubLinks, origin);
  return ranked[0] || null;
}

/**
 * Standardize the response shape.
 */
function buildResult(candidate, source, pageTitle, allCandidates) {
  return {
    route: candidate.url,
    confidence: candidate.confidence,
    score: candidate.score,
    source,
    pageTitle,
    matchReasons: candidate.reasons || [],
    // Top 5 candidates for debugging (not exposed in final API by default)
    _debug: {
      topCandidates: (allCandidates || []).slice(0, 5).map((c) => ({
        url: c.url,
        score: c.score,
        confidence: c.confidence,
        reasons: c.reasons,
      })),
    },
  };
}

function makeLogger(label) {
  return (msg) => {
    if (process.env.NODE_ENV !== "test") {
      console.log(`[RouteFinderService] [${label}] ${msg}`);
    }
  };
}

function enrichError(err, context) {
  err.context = context;
  return err;
}

function createServiceError(code, message) {
  const err = new Error(message);
  err.serviceError = true;
  err.code = code;
  return err;
}

module.exports = { findBestRoute };