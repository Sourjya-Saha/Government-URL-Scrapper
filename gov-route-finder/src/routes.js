/**
 * Routes
 * Defines all HTTP endpoints for the microservice.
 */

const express = require("express");
const { findBestRoute } = require("./services/routeFinder");
const { validateUrlParam } = require("./middleware/validation");

const router = express.Router();

/**
 * GET /find-route?url=https://xyz.gov.in
 *
 * Returns the most likely directory/contact route for the given gov site.
 *
 * Success response (200):
 * {
 *   "success": true,
 *   "route": "https://xyz.gov.in/whos-who",
 *   "confidence": 0.85,
 *   "meta": {
 *     "source": "homepage",
 *     "pageTitle": "...",
 *     "matchReasons": [...]
 *   }
 * }
 *
 * Error response (4xx/5xx):
 * {
 *   "success": false,
 *   "error": { "code": "...", "message": "..." }
 * }
 */
router.get("/find-route", validateUrlParam, async (req, res) => {
  const urlString = req.govUrlString;
  const showDebug = req.query.debug === "true";

  console.log(`[API] /find-route → ${urlString}`);

  try {
    const result = await findBestRoute(urlString);

    const response = {
      success: true,
      route: result.route,
      confidence: result.confidence,
      meta: {
        source: result.source,
        pageTitle: result.pageTitle,
        matchReasons: result.matchReasons,
        score: result.score,
      },
    };

    // Expose debug info only when explicitly requested
    if (showDebug) {
      response.debug = result._debug;
    }

    return res.json(response);
  } catch (err) {
    console.error(`[API] Error processing ${urlString}:`, err.message);

    // Known typed errors → 4xx
    if (err.serviceError && err.code === "NO_MATCH") {
      return res.status(404).json({
        success: false,
        error: { code: err.code, message: err.message },
      });
    }

    if (err.isFetchError) {
      const status = err.code === "TIMEOUT" ? 504 : 502;
      return res.status(status).json({
        success: false,
        error: {
          code: err.code,
          message: err.message,
          url: err.url,
        },
      });
    }

    // Unexpected error → 500
    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred. Please try again.",
      },
    });
  }
});

/**
 * GET /health
 * Standard health check endpoint for load balancers / uptime monitors.
 */
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "gov-route-finder",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /
 * API info / welcome.
 */
router.get("/", (req, res) => {
  res.json({
    service: "Gov Route Finder API",
    version: "1.0.0",
    description: "Finds the most relevant directory/contact route on Indian government websites",
    endpoints: {
      "GET /find-route": {
        description: "Find the best directory route for a .gov.in or .nic.in URL",
        params: {
          url: "required — e.g. https://example.gov.in",
          debug: "optional — set to 'true' to include top candidate details",
        },
        example: "/find-route?url=https://mca.gov.in",
      },
      "GET /health": "Health check",
    },
  });
});

module.exports = router;