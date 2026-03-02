'use client';

import PortfolioSummary from './PortfolioSummary';
import TradeAnalysis from '../trading/TradeAnalysis';
import { PortfolioSummary as PortfolioSummaryType, BehavioralBias, Insight } from '@/types/portfolio';

interface TradingDashboardProps {
  summary: PortfolioSummaryType;
  biases: BehavioralBias[];
  insights: Insight[];
}

export default function TradingDashboard({ summary, biases, insights }: TradingDashboardProps) {
  return (
    <div className="dashboard-panel">
      <PortfolioSummary summary={summary} />

      {biases.length > 0 && (
        <div className="mt-6">
          <TradeAnalysis biases={biases} insights={insights} />
        </div>
      )}
    </div>
  );
}
