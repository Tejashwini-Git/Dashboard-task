import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { memo, useState } from 'react';

interface PortfolioHeaderProps {
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  lastUpdated: Date | null;
  onRefresh: () => void;
}

function PortfolioHeaderComponent({
  totalInvestment,
  totalPresentValue,
  totalGainLoss,
  totalGainLossPercentage,
  lastUpdated,
  onRefresh,
}: PortfolioHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isPositive = totalGainLoss >= 0;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Portfolio Dashboard</h1>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isRefreshing
              ? 'bg-blue-400 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Investment</p>
          <p className="text-2xl font-bold text-gray-900">
            ₹{totalInvestment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Present Value</p>
          <p className="text-2xl font-bold text-gray-900">
            ₹{totalPresentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className={`rounded-lg p-4 ${isPositive ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className="text-sm text-gray-600 mb-1">Total Gain/Loss</p>
          <div className="flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="text-green-600" size={20} />
            ) : (
              <TrendingDown className="text-red-600" size={20} />
            )}
            <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              ₹{Math.abs(totalGainLoss).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className={`rounded-lg p-4 ${isPositive ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className="text-sm text-gray-600 mb-1">Return (%)</p>
          <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{totalGainLossPercentage.toFixed(2)}%
          </p>
        </div>
      </div>

      {lastUpdated && (
        <p className="text-sm text-gray-500 mt-4">
          Last updated: {lastUpdated.toLocaleTimeString()} on {lastUpdated.toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

export const PortfolioHeader = memo(PortfolioHeaderComponent);
