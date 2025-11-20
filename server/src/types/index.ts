/**
 * Type definitions
 */
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

export interface EnrichedHolding {
  id: string;
  stockName: string;
  stockSymbol: string;
  exchange: string;
  sector: string;
  purchasePrice: number;
  quantity: number;
  investment: number;
  portfolioPercentage: number;
  cmp: number | null;
  presentValue: number | null;
  gainLoss: number | null;
  gainLossPercentage: number | null;
  peRatio: number | null;
  latestEarnings: string | null;
}

export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  holdings: EnrichedHolding[];
}

export interface PortfolioResponse {
  holdings: EnrichedHolding[];
  sectorSummaries: SectorSummary[];
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  lastUpdated: number;
}
