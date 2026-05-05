/**
 * Server Entry Point
 * Starts the HTTP server and handles graceful shutdown.
 */

require("dotenv").config(); // Load .env if present

const { createApp } = require("./src/app");

const PORT = parseInt(process.env.PORT || "3000");
const HOST = process.env.HOST || "0.0.0.0";

const app = createApp();

const server = app.listen(PORT, HOST, () => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Gov Route Finder API  v1.0.0");
  console.log(`  Listening on http://${HOST}:${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("  Endpoint: GET /find-route?url=https://xyz.gov.in");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});

// ── Graceful shutdown ──────────────────────────────────────────────────────
function shutdown(signal) {
  console.log(`\n[Server] ${signal} received — shutting down gracefully...`);
  server.close(() => {
    console.log("[Server] All connections closed. Exiting.");
    process.exit(0);
  });

  // Force exit after 10s if connections hang
  setTimeout(() => {
    console.error("[Server] Forced exit after timeout.");
    process.exit(1);
  }, 10_000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("uncaughtException", (err) => {
  console.error("[Server] Uncaught exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("[Server] Unhandled promise rejection:", reason);
  process.exit(1);
});