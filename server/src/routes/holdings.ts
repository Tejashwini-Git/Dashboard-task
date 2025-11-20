/**
 * Holdings routes
 * Mock data - in production, this would connect to a real database
 */
import { Router, Request, Response, NextFunction } from 'express';
import { Holding, EnrichedHolding, SectorSummary, PortfolioResponse } from '../types/index.js';
import { stockDataService } from '../services/stockDataService.js';
import { cacheManager } from '../utils/cache.js';
import { config } from '../config/index.js';

const router = Router();

/**
 * Mock holdings database - in production, use a real database
 */
const mockHoldings: Holding[] = [
  {
    id: '1',
    stock_name: 'Infosys Limited',
    stock_symbol: 'INFY',
    exchange: 'NSE',
    sector: 'Information Technology',
    purchase_price: 1200,
    quantity: 10,
    created_at: '2024-01-15',
  },
  {
    id: '2',
    stock_name: 'Tata Consultancy Services',
    stock_symbol: 'TCS',
    exchange: 'NSE',
    sector: 'Information Technology',
    purchase_price: 3500,
    quantity: 5,
    created_at: '2024-02-20',
  },
  {
    id: '3',
    stock_name: 'Reliance Industries',
    stock_symbol: 'RELIANCE',
    exchange: 'NSE',
    sector: 'Energy',
    purchase_price: 2500,
    quantity: 8,
    created_at: '2024-03-10',
  },
  {
    id: '4',
    stock_name: 'HDFC Bank',
    stock_symbol: 'HDFCBANK',
    exchange: 'NSE',
    sector: 'Banking',
    purchase_price: 1600,
    quantity: 15,
    created_at: '2024-04-05',
  },
  {
    id: '5',
    stock_name: 'Hindustan Unilever',
    stock_symbol: 'HINDUNILVR',
    exchange: 'NSE',
    sector: 'FMCG',
    purchase_price: 2200,
    quantity: 6,
    created_at: '2024-05-12',
  },
];

/**
 * GET /api/holdings
 * Fetch all holdings with optional caching
 */
router.get('/holdings', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Check cache first
    const cached = cacheManager.get<Holding[]>('holdings');
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
        timestamp: Date.now(),
      });
    }

    // In production, fetch from database
    // For now, use mock data
    const holdings = mockHoldings;

    // Cache the result
    cacheManager.set('holdings', holdings, config.cache.holdingsTtl);

    res.json({
      success: true,
      data: holdings,
      cached: false,
      timestamp: Date.now(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/holdings/:id
 * Fetch a single holding by ID
 */
router.get('/holdings/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const holding = mockHoldings.find(h => h.id === id);

    if (!holding) {
      return res.status(404).json({
        success: false,
        error: 'Holding not found',
      });
    }

    res.json({
      success: true,
      data: holding,
      timestamp: Date.now(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/holdings
 * Add a new holding
 */
router.post('/holdings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { stock_name, stock_symbol, exchange, sector, purchase_price, quantity } = req.body;

    // Validation
    if (!stock_name || !stock_symbol || !exchange || !sector || !purchase_price || !quantity) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    const newHolding: Holding = {
      id: Date.now().toString(),
      stock_name,
      stock_symbol,
      exchange,
      sector,
      purchase_price: Number(purchase_price),
      quantity: Number(quantity),
      created_at: new Date().toISOString(),
    };

    mockHoldings.push(newHolding);

    // Clear cache
    cacheManager.delete('holdings');

    res.status(201).json({
      success: true,
      data: newHolding,
      timestamp: Date.now(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/portfolio
 * Get complete portfolio with calculations and stock data
 */
router.get('/portfolio', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Check cache first
    const cached = cacheManager.get<PortfolioResponse>('portfolio');
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
        timestamp: Date.now(),
      });
    }

    // Get holdings
    const holdings = mockHoldings;

    // Get stock data for all symbols
    const symbols = holdings.map(h => h.stock_symbol);
    const stockDataList = await stockDataService.getStockData(symbols);

    // Create a map for quick lookup
    const stockDataMap = new Map(stockDataList.map(item => [item.symbol, item]));

    // Enrich holdings with stock data and calculations
    const enrichedHoldings: EnrichedHolding[] = holdings.map(holding => {
      const investment = holding.purchase_price * holding.quantity;
      const stockData = stockDataMap.get(holding.stock_symbol);
      const cmp = stockData?.cmp ?? null;
      const presentValue = cmp ? cmp * holding.quantity : null;
      const gainLoss = presentValue ? presentValue - investment : null;
      const gainLossPercentage = gainLoss && investment > 0 ? (gainLoss / investment) * 100 : null;

      return {
        id: holding.id,
        stockName: holding.stock_name,
        stockSymbol: holding.stock_symbol,
        exchange: holding.exchange,
        sector: holding.sector,
        purchasePrice: holding.purchase_price,
        quantity: holding.quantity,
        investment,
        portfolioPercentage: 0,
        cmp,
        presentValue,
        gainLoss,
        gainLossPercentage,
        peRatio: stockData?.peRatio ?? null,
        latestEarnings: stockData?.latestEarnings ?? null,
      };
    });

    // Calculate portfolio metrics
    const totalInvestment = enrichedHoldings.reduce((sum, h) => sum + h.investment, 0);

    enrichedHoldings.forEach(holding => {
      holding.portfolioPercentage = totalInvestment > 0 ? (holding.investment / totalInvestment) * 100 : 0;
    });

    // Group by sector
    const sectorMap = new Map<string, EnrichedHolding[]>();
    enrichedHoldings.forEach(holding => {
      if (!sectorMap.has(holding.sector)) {
        sectorMap.set(holding.sector, []);
      }
      sectorMap.get(holding.sector)!.push(holding);
    });

    // Create sector summaries
    const sectorSummaries: SectorSummary[] = Array.from(sectorMap.entries()).map(([sector, holdings]) => {
      const totalInvestment = holdings.reduce((sum, h) => sum + h.investment, 0);
      const totalPresentValue = holdings.reduce((sum, h) => sum + (h.presentValue || 0), 0);
      const gainLoss = totalPresentValue - totalInvestment;
      const gainLossPercentage = totalInvestment > 0 ? (gainLoss / totalInvestment) * 100 : 0;

      return {
        sector,
        totalInvestment,
        totalPresentValue,
        gainLoss,
        gainLossPercentage,
        holdings,
      };
    });

    // Calculate total portfolio metrics
    const totalPresentValue = enrichedHoldings.reduce((sum, h) => sum + (h.presentValue || 0), 0);
    const totalGainLoss = totalPresentValue - totalInvestment;
    const totalGainLossPercentage = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;

    const response: PortfolioResponse = {
      holdings: enrichedHoldings,
      sectorSummaries,
      totalInvestment,
      totalPresentValue,
      totalGainLoss,
      totalGainLossPercentage,
      lastUpdated: Date.now(),
    };

    // Cache the result
    cacheManager.set('portfolio', response, config.cache.stockDataTtl);

    res.json({
      success: true,
      data: response,
      cached: false,
      timestamp: Date.now(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/portfolio/refresh
 * Force refresh portfolio data (clears cache)
 */
router.post('/portfolio/refresh', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Clear relevant caches
    cacheManager.delete('portfolio');
    cacheManager.delete('holdings');

    // Immediately fetch fresh data
    const response = await fetch('http://localhost:' + process.env.PORT + '/api/portfolio', {
      method: 'GET',
    });

    const data = await response.json();

    res.json({
      success: true,
      data: data.data,
      message: 'Portfolio refreshed',
      timestamp: Date.now(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
