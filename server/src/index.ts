/**
 * Main Express server
 */
import express from 'express';
import { config } from './config/index.js';
import { corsOptions, securityHeaders } from './middleware/cors.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import stockDataRoutes from './routes/stockData.js';
import holdingsRoutes from './routes/holdings.js';
import healthRoutes from './routes/health.js';

const app = express();

// Middleware
app.use(securityHeaders);
app.use(corsOptions);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(apiLimiter);

// Routes
app.use('/health', healthRoutes);
app.use('/api', stockDataRoutes);
app.use('/api', holdingsRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  Portfolio Dashboard API Server       ║
╠════════════════════════════════════════╣
║  Server running on http://localhost:${PORT}  ║
║  Environment: ${config.nodeEnv.padEnd(27)}║
║  CORS Origin: ${config.corsOrigin.padEnd(26)}║
╚════════════════════════════════════════╝
  `);

  console.log('Available endpoints:');
  console.log('  GET    /health                    - Health check');
  console.log('  GET    /api/holdings              - Get all holdings');
  console.log('  GET    /api/holdings/:id          - Get single holding');
  console.log('  POST   /api/holdings              - Add new holding');
  console.log('  GET    /api/stock-data            - Get stock data');
  console.log('  POST   /api/stock-data/batch      - Batch fetch stock data');
  console.log('  GET    /api/portfolio             - Get complete portfolio');
  console.log('  POST   /api/portfolio/refresh     - Refresh portfolio data');
});

export default app;
