import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { corsOptions, securityHeaders } from './middleware/cors.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import stockDataRoutes from './routes/stockData.js';
import holdingsRoutes from './routes/holdings.js';
import healthRoutes from './routes/health.js';

const app = express();

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(securityHeaders);
app.use(corsOptions);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(apiLimiter);

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

app.use('/health', healthRoutes);
app.use('/api', stockDataRoutes);
app.use('/api', holdingsRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;
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

  console.log('Available endpoints:');
  console.log('  GET    /health');
  console.log('  GET    /api/holdings');
  console.log('  GET    /api/holdings/:id');
  console.log('  POST   /api/holdings');
  console.log('  GET    /api/stock-data');
  console.log('  POST   /api/stock-data/batch');
  console.log('  GET    /api/portfolio');
  console.log('  POST   /api/portfolio/refresh');
});

export default app;
