/**
 * API client for backend communication
 * Replaces Supabase client with Express backend endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface Holding {
  id: string;
  stock_name: string;
  stock_symbol: string;
  exchange: string;
  sector: string;
  purchase_price: number;
  quantity: number;
  created_at?: string;
}

export interface StockMarketData {
  symbol: string;
  cmp: number | null;
  peRatio: number | null;
  latestEarnings: string | null;
  lastUpdated: number;
  error?: string;
}

export interface PortfolioData {
  holdings: any[];
  sectorSummaries: any[];
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  lastUpdated: number;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Fetch all holdings
   */
  async fetchHoldings(): Promise<Holding[]> {
    const response = await this.request<any>('/api/holdings');
    return response.data || [];
  }

  /**
   * Fetch stock market data for symbols
   */
  async fetchStockData(symbols: string[]): Promise<StockMarketData[]> {
    if (symbols.length === 0) {
      return [];
    }

    const queryString = symbols.map(s => `symbols=${encodeURIComponent(s)}`).join('&');
    const response = await this.request<any>(`/api/stock-data?${queryString}`);
    return response.data || [];
  }

  /**
   * Fetch complete portfolio data with calculations
   */
  async fetchPortfolio(): Promise<PortfolioData> {
    const response = await this.request<any>('/api/portfolio');
    return response.data;
  }

  /**
   * Refresh portfolio data (clears cache)
   */
  async refreshPortfolio(): Promise<PortfolioData> {
    const response = await this.request<any>('/api/portfolio/refresh', {
      method: 'POST',
    });
    return response.data;
  }

  /**
   * Add a new holding
   */
  async addHolding(holding: Omit<Holding, 'id' | 'created_at'>): Promise<Holding> {
    const response = await this.request<any>('/api/holdings', {
      method: 'POST',
      body: JSON.stringify(holding),
    });
    return response.data;
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<any> {
    const response = await this.request<any>('/api/cache-stats');
    return response.data;
  }
}

export const apiClient = new ApiClient();
