'use client';

import { BarChart3 } from 'lucide-react';
import BiasCard from './BiasCard';
import { BehavioralBias, Insight } from '@/types/portfolio';
import InsightCard from '../dashboard/InsightCard';

interface TradeAnalysisProps {
  biases: BehavioralBias[];
  insights: Insight[];
}

export default function TradeAnalysis({ biases, insights }: TradeAnalysisProps) {
  const portfolioInsights = insights.filter(i => i.type === 'portfolio');

  return (
    <div className="space-y-4">
      {biases.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-ws-green" />
            <h3 className="text-sm font-semibold text-ws-text-muted uppercase tracking-wider">
              Behavioral Biases Detected
            </h3>
            <span className="text-xs bg-ws-card border border-ws-border rounded-full px-2 py-0.5 text-ws-text-muted">
              {biases.length}
            </span>
          </div>
          <div className="space-y-3">
            {biases.map((bias, i) => (
              <BiasCard key={bias.name} bias={bias} index={i} />
            ))}
          </div>
        </div>
      )}

      {portfolioInsights.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-ws-text-muted uppercase tracking-wider mb-3">
            Portfolio Insights
          </h3>
          <div className="space-y-3">
            {portfolioInsights.map((insight, i) => (
              <InsightCard key={i} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {biases.length === 0 && portfolioInsights.length === 0 && (
        <div className="text-center py-8">
          <p className="text-ws-text-muted text-sm">No significant biases detected. Keep it up!</p>
        </div>
      )}
    </div>
  );
}
