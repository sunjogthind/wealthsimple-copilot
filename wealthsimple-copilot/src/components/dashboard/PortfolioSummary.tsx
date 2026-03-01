'use client';

import { TrendingUp, TrendingDown, BarChart3, Clock, Target, DollarSign } from 'lucide-react';
import { PortfolioSummary as PortfolioSummaryType } from '@/types/portfolio';
import { formatCurrency, formatPercent } from '@/lib/utils/format';

interface PortfolioSummaryProps {
  summary: PortfolioSummaryType;
}

export default function PortfolioSummary({ summary }: PortfolioSummaryProps) {
  const stats = [
    {
      label: 'Portfolio Value',
      value: formatCurrency(summary.totalValue),
      icon: DollarSign,
      color: 'text-ws-green',
    },
    {
      label: 'Net Realized P&L',
      value: formatCurrency(summary.netRealizedPL),
      icon: summary.netRealizedPL >= 0 ? TrendingUp : TrendingDown,
      color: summary.netRealizedPL >= 0 ? 'text-ws-green' : 'text-ws-red',
    },
    {
      label: 'Win Rate',
      value: `${summary.winRate}%`,
      icon: Target,
      color: summary.winRate >= 50 ? 'text-ws-green' : 'text-ws-yellow',
    },
    {
      label: 'Avg Hold Time',
      value: `${summary.avgHoldDays} days`,
      icon: Clock,
      color: 'text-ws-text-secondary',
    },
    {
      label: 'Holdings',
      value: `${summary.holdingCount}`,
      icon: BarChart3,
      color: 'text-ws-text-secondary',
    },
    {
      label: 'Dividends',
      value: formatCurrency(summary.totalDividends),
      icon: DollarSign,
      color: 'text-ws-green',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-ws-text-muted uppercase tracking-wider">
        Portfolio Overview
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white border border-ws-border rounded-xl p-3 shadow-ws hover:shadow-ws-md transition-all min-w-0"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${stat.color}`} />
                <span className="text-[11px] text-ws-text-muted truncate">{stat.label}</span>
              </div>
              <p className={`text-base font-semibold truncate ${stat.color}`} title={stat.value}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Account breakdown */}
      {summary.accountBreakdown.length > 0 && (
        <div className="bg-white border border-ws-border rounded-xl p-4 shadow-ws">
          <h4 className="text-xs font-semibold text-ws-text-muted uppercase tracking-wider mb-3">
            Account Breakdown
          </h4>
          <div className="space-y-2">
            {summary.accountBreakdown.map((account) => (
              <div key={account.type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    account.type === 'TFSA' ? 'bg-ws-green' :
                    account.type === 'RRSP' ? 'bg-blue-400' :
                    account.type === 'FHSA' ? 'bg-purple-400' :
                    'bg-ws-yellow'
                  }`} />
                  <span className="text-sm text-ws-text-secondary">{account.type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-ws-text">{formatCurrency(account.value)}</span>
                  <span className="text-xs text-ws-text-muted w-10 text-right">{account.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top holdings */}
      {summary.topHoldings.length > 0 && (
        <div className="bg-white border border-ws-border rounded-xl p-4 shadow-ws">
          <h4 className="text-xs font-semibold text-ws-text-muted uppercase tracking-wider mb-3">
            Top Holdings
          </h4>
          <div className="space-y-2">
            {summary.topHoldings.slice(0, 5).map((holding) => (
              <div key={holding.symbol} className="flex items-center justify-between">
                <span className="text-sm text-ws-text font-medium">{holding.symbol}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-ws-border rounded-full h-1.5">
                    <div
                      className="bg-ws-green rounded-full h-1.5"
                      style={{ width: `${Math.min(holding.pct, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-ws-text-secondary w-12 text-right">{holding.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
