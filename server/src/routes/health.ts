/**
 * Health check routes
 */
import { Router, Request, Response } from 'express';
import { cacheManager } from '../utils/cache.js';

const router = Router();

/**
 * GET /health
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response) => {
  const stats = cacheManager.getStats();

  res.json({
    status: 'ok',
    timestamp: Date.now(),
    cache: stats,
  });
});

/**
 * GET /cache-stats
 * Get cache statistics
 */
router.get('/cache-stats', (_req: Request, res: Response) => {
  const stats = cacheManager.getStats();

  res.json({
    success: true,
    data: stats,
    timestamp: Date.now(),
  });
});

export default router;
