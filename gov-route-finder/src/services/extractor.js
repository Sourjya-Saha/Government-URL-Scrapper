/**
 * Link Extractor Service
 * Parses raw HTML with Cheerio and extracts all usable anchor links
 * as { url, text } pairs, fully resolved to absolute URLs.
 */

const cheerio = require("cheerio");
const { resolveHref, isSameOrigin, normalizeForDedup } = require("../utils/urlUtils");

/**
 * Extract all navigable anchor links from an HTML document.
 * Filters out external domains, duplicate URLs, and non-navigable hrefs.
 *
 * @param {string} html        - Raw HTML string
 * @param {string} baseUrl     - The page URL used to resolve relative hrefs
 * @param {string} originUrl   - The root domain (for same-origin filtering)
 * @returns {Array<{ url: string, text: string, ariaLabel: string }>}
 */
function extractLinks(html, baseUrl, originUrl) {
  const $ = cheerio.load(html);
  const seen = new Set();
  const links = [];

  $("a[href]").each((_, el) => {
    const rawHref = $(el).attr("href");
    const absoluteUrl = resolveHref(rawHref, baseUrl);

    if (!absoluteUrl) return; // Filtered by resolveHref (mailto, tel, js, etc.)
    if (!isSameOrigin(absoluteUrl, originUrl)) return; // External link

    // Normalize for de-duplication (ignore protocol/trailing-slash differences)
    const dedupKey = normalizeForDedup(absoluteUrl);
    if (seen.has(dedupKey)) return;
    seen.add(dedupKey);

    // Collect visible text + aria-label as scoring signals
    const visibleText = $(el).text().trim();
    const ariaLabel = $(el).attr("aria-label") || "";
    const titleAttr = $(el).attr("title") || "";

    // Combine all text signals into one string for scoring
    const combinedText = [visibleText, ariaLabel, titleAttr].filter(Boolean).join(" ");

    links.push({ url: absoluteUrl, text: combinedText });
  });

  return links;
}

/**
 * Naive extraction of a page title for logging/debug purposes.
 * @param {string} html
 * @returns {string}
 */
function extractPageTitle(html) {
  const $ = cheerio.load(html);
  return $("title").first().text().trim() || "(no title)";
}

module.exports = { extractLinks, extractPageTitle };