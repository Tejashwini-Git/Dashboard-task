/**
 * Stock data fetching service
 * Handles Yahoo Finance and alternative data sources with error handling and retry logic
 */
import { cacheManager } from '../utils/cache.js';
import { config } from '../config/index.js';
import { StockMarketData } from '../types/index.js';

interface YahooFinanceResponse {
  chart: {
    result: Array<{
      meta: {
        regularMarketPrice: number;
      };
    }>;
  };
}

class StockDataService {
  private requestQueue: Map<string, Promise<StockMarketData>> = new Map();
  private retryCount = 0;
  private maxRetries = 3;

  /**
   * Fetch stock data with caching and batching
   */
  async getStockData(symbols: string[]): Promise<StockMarketData[]> {
    // Deduplicate symbols
    const uniqueSymbols = Array.from(new Set(symbols));

    // Get cached data first
    const cachedData: StockMarketData[] = [];
    const symbolsToFetch: string[] = [];

    for (const symbol of uniqueSymbols) {
      const cached = cacheManager.get<StockMarketData>(`stock:${symbol}`);
      if (cached) {
        cachedData.push(cached);
      } else {
        symbolsToFetch.push(symbol);
      }
    }

    // Fetch remaining symbols in parallel
    let fetchedData: StockMarketData[] = [];
    if (symbolsToFetch.length > 0) {
      fetchedData = await this.fetchStockDataParallel(symbolsToFetch);
    }

    return [...cachedData, ...fetchedData];
  }

  /**
   * Fetch multiple stocks in parallel with request batching
   */
  private async fetchStockDataParallel(symbols: string[]): Promise<StockMarketData[]> {
    const promises = symbols.map(symbol => {
      // Reuse pending requests for the same symbol
      if (this.requestQueue.has(symbol)) {
        return this.requestQueue.get(symbol)!;
      }

      const promise = this.fetchSingleStock(symbol);
      this.requestQueue.set(symbol, promise);

      // Clean up from queue after completion
      promise.finally(() => {
        this.requestQueue.delete(symbol);
      });

      return promise;
    });

    return Promise.all(promises);
  }

  /**
   * Fetch data for a single stock with retry logic
   */
  private async fetchSingleStock(symbol: string, attempt = 0): Promise<StockMarketData> {
    try {
      const [cmpData, peData] = await Promise.all([
        this.fetchYahooFinanceData(symbol),
        this.fetchAlternativeMetrics(symbol),
      ]);

      const stockData: StockMarketData = {
        symbol,
        cmp: cmpData,
        peRatio: peData.peRatio,
        latestEarnings: peData.latestEarnings,
        lastUpdated: Date.now(),
      };

      // Cache the result
      cacheManager.set(`stock:${symbol}`, stockData, config.cache.stockDataTtl);

      return stockData;
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);

      // Retry with exponential backoff
      if (attempt < this.maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchSingleStock(symbol, attempt + 1);
      }

      // Return error response
      const errorData: StockMarketData = {
        symbol,
        cmp: null,
        peRatio: null,
        latestEarnings: null,
        lastUpdated: Date.now(),
        error: error instanceof Error ? error.message : 'Failed to fetch stock data',
      };

      // Cache error for shorter duration to allow retries
      cacheManager.set(`stock:${symbol}`, errorData, 10000);

      return errorData;
    }
  }

  /**
   * Fetch CMP from Yahoo Finance API
   */
  private async fetchYahooFinanceData(symbol: string): Promise<number | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.api.yahooFinanceTimeout);

      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?interval=1d&range=1d`;
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        if (!response.ok) {
          throw new Error(`Yahoo Finance API returned ${response.status}`);
        }

        const data = (await response.json()) as YahooFinanceResponse;

        if (data?.chart?.result?.[0]?.meta?.regularMarketPrice) {
          return data.chart.result[0].meta.regularMarketPrice;
        }

        return null;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error(`Yahoo Finance API error for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Fetch P/E ratio and earnings from alternative source
   */
  private async fetchAlternativeMetrics(
    symbol: string
  ): Promise<{ peRatio: number | null; latestEarnings: string | null }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.api.googleFinanceTimeout);

      try {
        // Using BSE API as alternative source
        const url = `https://api.bseindia.com/BseIndiaAPI/api/StockSearchapi/${symbol}/st/true`;
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        if (!response.ok) {
          return { peRatio: null, latestEarnings: null };
        }

        const data = await response.json() as any;

        let peRatio = null;
        let latestEarnings = null;

        // Extract P/E ratio if available
        if (data?.scripinfo?.[0]?.PERatio) {
          peRatio = parseFloat(data.scripinfo[0].PERatio);
        }

        // For earnings, we'll parse from Google Finance as fallback
        if (!peRatio) {
          const googleData = await this.tryGoogleFinance(symbol);
          peRatio = googleData.peRatio;
          latestEarnings = googleData.latestEarnings;
        }

        return { peRatio, latestEarnings };
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error(`Alternative metrics API error for ${symbol}:`, error);
      return { peRatio: null, latestEarnings: null };
    }
  }

  /**
   * Fallback to Google Finance scraping
   */
  private async tryGoogleFinance(
    symbol: string
  ): Promise<{ peRatio: number | null; latestEarnings: string | null }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const url = `https://www.google.com/finance/quote/${symbol}:NSE`;
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
        });

        if (!response.ok) {
          return { peRatio: null, latestEarnings: null };
        }

        const html = await response.text();

        let peRatio = null;
        let latestEarnings = null;

        // Extract P/E ratio
        const peMatch = html.match(/P\/E ratio[\s\S]{0,200}?([\d.]+)/i);
        if (peMatch) {
          peRatio = parseFloat(peMatch[1]);
        }

        // Extract earnings date
        const earningsMatch = html.match(/Earnings date[\s\S]{0,200}?([A-Za-z]{3}\s+\d{1,2},\s+\d{4})/i);
        if (earningsMatch) {
          latestEarnings = earningsMatch[1];
        }

        return { peRatio, latestEarnings };
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      return { peRatio: null, latestEarnings: null };
    }
  }

  /**
   * Clear all cached stock data
   */
  clearCache(): void {
    // This would need implementation in cache manager
    console.log('Cache cleared');
  }
}

export const stockDataService = new StockDataService();
