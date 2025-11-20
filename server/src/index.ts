import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config/index.js";
import { corsOptions, securityHeaders } from "./middleware/cors.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";
import stockDataRoutes from "./routes/stockData.js";
import holdingsRoutes from "./routes/holdings.js";
import healthRoutes from "./routes/health.js";

const app = express();

/**
 * Correct __dirname for CommonJS output
 * Works with: "module": "CommonJS"
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(securityHeaders);
app.use(corsOptions);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(apiLimiter);

// Static React build path (Render will place dist here)
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

// API routes
app.use("/health", healthRoutes);
app.use("/api", stockDataRoutes);
app.use("/api", holdingsRoutes);

// Fallback for React SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// Global error handler
app.use(errorHandler);

// Start Server
const PORT = config.port || 5000;

app.listen(PORT, () => {
  console.log(`
════════════════════════════════════════════
 Portfolio Dashboard API Server
════════════════════════════════════════════
 Server running on http://localhost:${PORT}
 Environment: ${config.nodeEnv}
 CORS Origin: ${config.corsOrigin}
════════════════════════════════════════════
`);

  console.log("Available endpoints:");
  console.log("  GET    /health");
  console.log("  GET    /api/holdings");
  console.log("  GET    /api/holdings/:id");
  console.log("  POST   /api/holdings");
  console.log("  GET    /api/stock-data");
  console.log("  POST   /api/stock-data/batch");
  console.log("  GET    /api/portfolio");
  console.log("  POST   /api/portfolio/refresh");
});

export default app;
