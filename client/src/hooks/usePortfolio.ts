import { useState, useEffect, useCallback } from 'react';
import { apiClient, Holding, StockMarketData, PortfolioData } from '../lib/api';
import { EnrichedHolding, SectorSummary } from '../types/portfolio';

const REFRESH_INTERVAL = 15000;
const INITIAL_LOAD_TIMEOUT = 3000;

// Helper function to calculate sector summaries from holdings
function calculateSectorSummaries(holdings: any[]): SectorSummary[] {
  const sectorMap = new Map<string, SectorSummary>();

  holdings.forEach((holding) => {
    const sector = holding.sector || 'Uncategorized';
    const investment = holding.investment || 0;
    const presentValue = holding.presentValue || 0;
    const gainLoss = (presentValue || 0) - (investment || 0);
    const gainLossPercentage = investment > 0 ? (gainLoss / investment) * 100 : 0;

    if (!sectorMap.has(sector)) {
      sectorMap.set(sector, {
        sector,
        totalInvestment: 0,
        totalPresentValue: 0,
        gainLoss: 0,
        gainLossPercentage: 0,
        holdings: [],
      });
    }

    const summary = sectorMap.get(sector)!;
    summary.totalInvestment += investment;
    summary.totalPresentValue += presentValue;
    summary.gainLoss += gainLoss;
    summary.holdings.push(holding);
  });

  // Recalculate percentages for each sector
  sectorMap.forEach((summary) => {
    if (summary.totalInvestment > 0) {
      summary.gainLossPercentage = (summary.gainLoss / summary.totalInvestment) * 100;
    }
  });

  return Array.from(sectorMap.values());
}

export function usePortfolio() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadPortfolio = useCallback(async () => {
    try {
      const data = await apiClient.fetchPortfolio();
      setPortfolioData(data);
      setHoldings(data.holdings);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load portfolio';
      setError(errorMsg);
      console.error('Portfolio fetch error:', err);
    }
  }, []);

  const refreshPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.refreshPortfolio();
      // Ensure data has required structure with sector summaries
      const enrichedData = {
        ...data,
        sectorSummaries: data.sectorSummaries || calculateSectorSummaries(data.holdings),
      };
      setPortfolioData(enrichedData);
      setHoldings(enrichedData.holdings);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to refresh portfolio';
      console.error('Portfolio refresh error:', err);
      // Don't set global error for refresh - just log it
      // Keep showing the current data instead of showing error screen
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        await loadPortfolio();
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    // Set up periodic refresh interval
    const interval = setInterval(() => {
      loadPortfolio();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [loadPortfolio]);

  // Use data from portfolio endpoint if available, otherwise compute
  const enrichedHoldings = portfolioData?.holdings ?? [];
  const sectorSummaries = portfolioData?.sectorSummaries ?? [];
  const totalInvestment = portfolioData?.totalInvestment ?? 0;
  const totalPresentValue = portfolioData?.totalPresentValue ?? 0;
  const totalGainLoss = portfolioData?.totalGainLoss ?? 0;
  const totalGainLossPercentage = portfolioData?.totalGainLossPercentage ?? 0;

  return {
    holdings: enrichedHoldings,
    sectorSummaries,
    totalInvestment,
    totalPresentValue,
    totalGainLoss,
    totalGainLossPercentage,
    loading,
    error,
    lastUpdated,
    refresh: refreshPortfolio,
  };
}
