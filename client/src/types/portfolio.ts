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
