import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState, memo } from 'react';
import { SectorSummary } from '../types/portfolio';
import { HoldingRow } from './HoldingRow';

interface SectorGroupProps {
  summary: SectorSummary;
}

function SectorGroupComponent({ summary }: SectorGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isPositive = summary.gainLoss >= 0;

  return (
    <div className="mb-6">
      <div
        className="bg-gray-100 rounded-t-lg p-4 cursor-pointer hover:bg-gray-200 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            <h2 className="text-xl font-bold text-gray-900">{summary.sector}</h2>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-gray-600">Investment: </span>
              <span className="font-semibold">
                ₹{summary.totalInvestment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Present Value: </span>
              <span className="font-semibold">
                ₹{summary.totalPresentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Gain/Loss: </span>
              <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}₹{Math.abs(summary.gainLoss).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                {' '}({isPositive ? '+' : ''}{summary.gainLossPercentage.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="bg-white rounded-b-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Particulars
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Purchase Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Investment
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Portfolio (%)
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Exchange
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    CMP
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Present Value
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Gain/Loss
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    P/E Ratio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Latest Earnings
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {summary.holdings.map((holding) => (
                  <HoldingRow key={holding.id} holding={holding} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export const SectorGroup = memo(SectorGroupComponent);
