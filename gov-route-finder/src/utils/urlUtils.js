/**
 * URL Validation Utilities
 * Enforces domain restrictions, filters junk link types,
 * and normalizes URLs for consistent comparison.
 */

const ALLOWED_TLDS = [".gov.in", ".nic.in"];

/**
 * Validate that a given URL belongs to an allowed Indian government domain.
 * @param {string} rawUrl - URL string from the request
 * @returns {{ valid: boolean, url: URL|null, error: string|null }}
 */
function validateGovUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { valid: false, url: null, error: "URL parameter is required." };
  }

  let parsed;
  try {
    // Auto-prepend https:// if scheme is missing
    const normalized = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
    parsed = new URL(normalized);
  } catch {
    return { valid: false, url: null, error: `Malformed URL: "${rawUrl}"` };
  }

  const hostname = parsed.hostname.toLowerCase();
  const isAllowed = ALLOWED_TLDS.some((tld) => hostname.endsWith(tld));

  if (!isAllowed) {
    return {
      valid: false,
      url: null,
      error: `Only .gov.in and .nic.in domains are supported. Got: "${hostname}"`,
    };
  }

  return { valid: true, url: parsed, error: null };
}

/**
 * Convert a potentially relative href into an absolute URL
 * anchored to the given base origin.
 *
 * Returns null for non-navigable hrefs (mailto, tel, javascript, #).
 *
 * @param {string} href  - Raw href from <a> tag
 * @param {string} base  - Base URL string (e.g. "https://xyz.gov.in")
 * @returns {string|null}
 */
function resolveHref(href, base) {
  if (!href || typeof href !== "string") return null;

  const trimmed = href.trim();

  // Filter out non-navigable schemes
  if (
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:") ||
    trimmed.startsWith("javascript:") ||
    trimmed === "#" ||
    trimmed.startsWith("#")
  ) {
    return null;
  }

  try {
    const resolved = new URL(trimmed, base);
    // Strip hash fragments — we care about pages, not anchors
    resolved.hash = "";
    return resolved.href;
  } catch {
    return null;
  }
}

/**
 * Check whether a resolved absolute URL belongs to the same
 * origin as the base (prevents following external links).
 *
 * @param {string} absoluteUrl
 * @param {string} baseOrigin  - e.g. "https://xyz.gov.in"
 * @returns {boolean}
 */
function isSameOrigin(absoluteUrl, baseOrigin) {
  try {
    const urlHost = new URL(absoluteUrl).hostname.toLowerCase();
    const baseHost = new URL(baseOrigin).hostname.toLowerCase();
    // Allow exact match or subdomain match
    return urlHost === baseHost || urlHost.endsWith(`.${baseHost}`);
  } catch {
    return false;
  }
}

/**
 * Strip protocol and trailing slashes for de-duplication comparisons.
 * @param {string} url
 * @returns {string}
 */
function normalizeForDedup(url) {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .toLowerCase();
}

module.exports = { validateGovUrl, resolveHref, isSameOrigin, normalizeForDedup };