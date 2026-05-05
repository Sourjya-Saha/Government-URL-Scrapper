/**
 * HTTP Fetcher Service
 * Wraps Axios with:
 *  - Realistic browser User-Agent (avoids bot blocks)
 *  - Configurable timeout
 *  - Automatic retry on transient failures
 *  - Safe error classification (timeout vs network vs HTTP error)
 */

const axios = require("axios");

// Government sites can be slow — generous but bounded timeout
const DEFAULT_TIMEOUT_MS = 12000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 800;

// Rotate UA to reduce likelihood of bot detection
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
];

let uaIndex = 0;
function nextUserAgent() {
  const ua = USER_AGENTS[uaIndex % USER_AGENTS.length];
  uaIndex++;
  return ua;
}

/**
 * Sleep helper for retry delays.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch the HTML of a URL.
 * Returns { html, finalUrl } on success.
 * Throws a structured FetchError on failure.
 *
 * @param {string} url
 * @param {{ timeoutMs?: number, retries?: number }} options
 * @returns {Promise<{ html: string, finalUrl: string }>}
 */
async function fetchHtml(url, options = {}) {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = options.retries ?? MAX_RETRIES;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get(url, {
        timeout: timeoutMs,
        maxRedirects: 5,
        headers: {
          "User-Agent": nextUserAgent(),
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-IN,en;q=0.9,hi;q=0.8",
          "Accept-Encoding": "gzip, deflate",
          Connection: "keep-alive",
          "Cache-Control": "no-cache",
        },
        // Accept 2xx and 3xx; we follow redirects automatically
        validateStatus: (status) => status < 400,
      });

      const contentType = response.headers["content-type"] || "";
      if (!contentType.includes("html")) {
        throw createFetchError("NON_HTML", `Response is not HTML (content-type: ${contentType})`, url);
      }

      return {
        html: response.data,
        finalUrl: response.request?.res?.responseUrl || url,
      };
    } catch (err) {
      if (err.isFetchError) throw err; // Don't retry our own typed errors

      lastError = err;

      if (attempt < maxRetries) {
        await sleep(RETRY_DELAY_MS * (attempt + 1)); // Exponential-ish backoff
      }
    }
  }

  // Classify the final error
  if (axios.isAxiosError(lastError)) {
    if (lastError.code === "ECONNABORTED" || lastError.code === "ETIMEDOUT") {
      throw createFetchError("TIMEOUT", `Request to "${url}" timed out after ${timeoutMs}ms`, url);
    }
    if (lastError.response) {
      throw createFetchError(
        "HTTP_ERROR",
        `HTTP ${lastError.response.status} from "${url}"`,
        url,
        lastError.response.status
      );
    }
    throw createFetchError("NETWORK_ERROR", `Network error fetching "${url}": ${lastError.message}`, url);
  }

  throw createFetchError("UNKNOWN", lastError?.message || "Unknown fetch error", url);
}

/**
 * Lightweight probe — just checks if a URL returns a 2xx/3xx.
 * Used for fallback route probing. Returns true/false.
 *
 * @param {string} url
 * @returns {Promise<boolean>}
 */
async function probeUrl(url) {
  try {
    const response = await axios.head(url, {
      timeout: 6000,
      maxRedirects: 3,
      headers: { "User-Agent": nextUserAgent() },
      validateStatus: (s) => s < 400,
    });
    return response.status < 400;
  } catch {
    // Some servers reject HEAD — try GET with minimal data
    try {
      await axios.get(url, {
        timeout: 6000,
        maxRedirects: 3,
        headers: { "User-Agent": nextUserAgent(), Range: "bytes=0-0" },
        validateStatus: (s) => s < 400,
      });
      return true;
    } catch {
      return false;
    }
  }
}

function createFetchError(code, message, url, httpStatus = null) {
  const err = new Error(message);
  err.isFetchError = true;
  err.code = code;
  err.url = url;
  err.httpStatus = httpStatus;
  return err;
}

module.exports = { fetchHtml, probeUrl };