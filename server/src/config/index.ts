/**
 * Configuration management
 */
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  api: {
    yahooFinanceTimeout: parseInt(process.env.YAHOO_FINANCE_API_TIMEOUT || '10000', 10),
    googleFinanceTimeout: parseInt(process.env.GOOGLE_FINANCE_API_TIMEOUT || '10000', 10),
  },

  cache: {
    stockDataTtl: parseInt(process.env.STOCK_DATA_CACHE_TTL || '60000', 10),
    holdingsTtl: parseInt(process.env.HOLDINGS_CACHE_TTL || '300000', 10),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
};

export default config;
