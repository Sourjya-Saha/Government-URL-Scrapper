/**
 * Express Application Setup
 * Configures middleware stack and mounts routes.
 * Kept separate from server.js so it can be imported in tests.
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const routes = require("./routes");
const { makeRateLimiter } = require("./middleware/validation");

function createApp() {
  const app = express();

  // ── Security headers ───────────────────────────────────────────────────────
  app.use(helmet());

  // ── CORS — tighten in production by specifying allowed origins ─────────────
  app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET"],
  }));

  // ── Request logging ────────────────────────────────────────────────────────
  const logFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
  app.use(morgan(logFormat));

  // ── Body parsing (not strictly needed for GET-only, but good practice) ─────
  app.use(express.json());

  // ── Rate limiting ──────────────────────────────────────────────────────────
  app.use(
    makeRateLimiter({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000"),
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX || "30"),
    })
  );

  // ── Routes ─────────────────────────────────────────────────────────────────
  app.use("/", routes);

  // ── 404 handler ────────────────────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: `Route "${req.path}" does not exist.` },
    });
  });

  // ── Global error handler ───────────────────────────────────────────────────
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error("[App] Unhandled error:", err);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred." },
    });
  });

  return app;
}

module.exports = { createApp };