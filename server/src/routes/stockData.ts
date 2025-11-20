/**
 * Stock data routes
 */
import { Router, Request, Response, NextFunction } from 'express';
import { stockDataService } from '../services/stockDataService.js';

const router = Router();

router.use((req, res, next) => {
  req.user = { id: "public-user", role: "admin" };
  next();
});

/**
 * GET /api/stock-data?symbols=INFY,TCS,RELIANCE
 * Fetch stock data with caching
 */
router.get('/stock-data', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { symbols } = req.query;

    if (!symbols || typeof symbols !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'symbols query parameter is required',
      });
    }

    const symbolArray = symbols.split(',').map(s => s.trim().toUpperCase());

    if (symbolArray.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one symbol is required',
      });
    }

    if (symbolArray.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 50 symbols allowed per request',
      });
    }

    const stockData = await stockDataService.getStockData(symbolArray);

    res.json({
      success: true,
      data: stockData,
      timestamp: Date.now(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/stock-data/batch
 * Batch fetch stock data (alternative endpoint)
 */
router.post('/stock-data/batch', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { symbols } = req.body;

    if (!Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'symbols array is required and must not be empty',
      });
    }

    if (symbols.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 50 symbols allowed per request',
      });
    }

    const stockData = await stockDataService.getStockData(symbols);

    res.json({
      success: true,
      data: stockData,
      timestamp: Date.now(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
