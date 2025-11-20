import { usePortfolio } from './hooks/usePortfolio';
import { PortfolioHeader } from './components/PortfolioHeader';
import { SectorGroup } from './components/SectorGroup';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';

function App() {
  const {
    sectorSummaries,
    totalInvestment,
    totalPresentValue,
    totalGainLoss,
    totalGainLossPercentage,
    loading,
    error,
    lastUpdated,
    refresh,
  } = usePortfolio();

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PortfolioHeader
          totalInvestment={totalInvestment}
          totalPresentValue={totalPresentValue}
          totalGainLoss={totalGainLoss}
          totalGainLossPercentage={totalGainLossPercentage}
          lastUpdated={lastUpdated}
          onRefresh={refresh}
        />

        <div>
          {sectorSummaries.map((summary) => (
            <SectorGroup key={summary.sector} summary={summary} />
          ))}
        </div>

        {sectorSummaries.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No holdings found. Add some stocks to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
