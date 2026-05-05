/**
 * Validation Middleware
 * Validates and normalizes the `url` query parameter before it
 * reaches the route handler. Attaches a parsed `govUrl` to req
 * on success, or sends a 400 response on failure.
 */

const { validateGovUrl } = require("../utils/urlUtils");

/**
 * Express middleware that validates ?url= query parameter.
 * On success: attaches req.govUrl (URL object) and req.govUrlString.
 * On failure: responds with 400 JSON error.
 */
function validateUrlParam(req, res, next) {
  const rawUrl = req.query.url;

  const { valid, url, error } = validateGovUrl(rawUrl);

  if (!valid) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_URL",
        message: error,
      },
    });
  }

  // Attach to request for downstream handlers
  req.govUrl = url;
  req.govUrlString = url.origin; // Use just the origin (strip path/query)

  next();
}

/**
 * Simple rate-limiting middleware using an in-memory counter.
 * Not a replacement for a real rate limiter (e.g. Redis + express-rate-limit)
 * but sufficient for a single-instance microservice.
 */
function makeRateLimiter({ windowMs = 60_000, maxRequests = 30 } = {}) {
  const requests = new Map(); // ip → { count, resetAt }

  return function rateLimiter(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const entry = requests.get(ip);

    if (!entry || now > entry.resetAt) {
      requests.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: {
          code: "RATE_LIMITED",
          message: `Too many requests. Limit: ${maxRequests} per ${windowMs / 1000}s.`,
        },
      });
    }

    entry.count++;
    next();
  };
}

module.exports = { validateUrlParam, makeRateLimiter };