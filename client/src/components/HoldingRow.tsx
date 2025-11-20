import { EnrichedHolding } from '../types/portfolio';
import { Loader2 } from 'lucide-react';
import { memo } from 'react';

interface HoldingRowProps {
  holding: EnrichedHolding;
}

function HoldingRowComponent({ holding }: HoldingRowProps) {
  const isPositive = (holding.gainLoss ?? 0) >= 0;

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <div>
          <p className="font-medium text-gray-900">{holding.stockName}</p>
          <p className="text-sm text-gray-500">{holding.stockSymbol}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-right text-gray-700">
        ₹{holding.purchasePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
      <td className="px-4 py-3 text-right text-gray-700">
        {holding.quantity}
      </td>
      <td className="px-4 py-3 text-right font-medium text-gray-900">
        ₹{holding.investment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
      </td>
      <td className="px-4 py-3 text-right text-gray-700">
        {holding.portfolioPercentage.toFixed(2)}%
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {holding.exchange}
        </span>
      </td>
      <td className="px-4 py-3 text-right font-medium text-gray-900">
        {holding.cmp !== null ? (
          `₹${holding.cmp.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        ) : (
          <Loader2 className="inline animate-spin text-gray-400" size={16} />
        )}
      </td>
      <td className="px-4 py-3 text-right font-medium text-gray-900">
        {holding.presentValue !== null ? (
          `₹${holding.presentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
        ) : (
          <Loader2 className="inline animate-spin text-gray-400" size={16} />
        )}
      </td>
      <td className="px-4 py-3 text-right">
        {holding.gainLoss !== null ? (
          <div>
            <p className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}₹{Math.abs(holding.gainLoss).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
            {holding.gainLossPercentage !== null && (
              <p className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                ({isPositive ? '+' : ''}{holding.gainLossPercentage.toFixed(2)}%)
              </p>
            )}
          </div>
        ) : (
          <Loader2 className="inline animate-spin text-gray-400" size={16} />
        )}
      </td>
      <td className="px-4 py-3 text-right text-gray-700">
        {holding.peRatio !== null ? holding.peRatio.toFixed(2) : '-'}
      </td>
      <td className="px-4 py-3 text-gray-700">
        {holding.latestEarnings || '-'}
      </td>
    </tr>
  );
}

export const HoldingRow = memo(HoldingRowComponent);
