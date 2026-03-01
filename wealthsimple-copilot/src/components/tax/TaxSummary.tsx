'use client';

import { Calculator, TrendingDown, TrendingUp, Scissors } from 'lucide-react';
import { TaxSummaryData, TaxHarvestCandidate } from '@/types/portfolio';
import { formatCurrency } from '@/lib/utils/format';
import HarvestCard from './HarvestCard';

interface TaxSummaryProps {
  taxSummary: TaxSummaryData;
  harvestCandidates: TaxHarvestCandidate[];
}

export default function TaxSummary({ taxSummary, harvestCandidates }: TaxSummaryProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Calculator className="w-4 h-4 text-ws-yellow" />
        <h3 className="text-sm font-semibold text-ws-text-muted uppercase tracking-wider">
          Tax Position (YTD Estimates)
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-ws-border rounded-xl p-3 shadow-ws">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-ws-green" />
            <span className="text-[11px] text-ws-text-muted">Realized Gains</span>
          </div>
          <p className="text-lg font-semibold text-ws-green">{formatCurrency(taxSummary.realizedGainsYTD)}</p>
        </div>

        <div className="bg-white border border-ws-border rounded-xl p-3 shadow-ws">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-3.5 h-3.5 text-ws-red" />
            <span className="text-[11px] text-ws-text-muted">Realized Losses</span>
          </div>
          <p className="text-lg font-semibold text-ws-red">{formatCurrency(taxSummary.realizedLossesYTD)}</p>
        </div>

        <div className="bg-white border border-ws-border rounded-xl p-3 shadow-ws">
          <div className="flex items-center gap-2 mb-1">
            <Calculator className="w-3.5 h-3.5 text-ws-yellow" />
            <span className="text-[11px] text-ws-text-muted">Est. Tax Owing</span>
          </div>
          <p className="text-lg font-semibold text-ws-yellow">{formatCurrency(taxSummary.estimatedTaxOwing)}</p>
        </div>

        <div className="bg-white border border-ws-border rounded-xl p-3 shadow-ws">
          <div className="flex items-center gap-2 mb-1">
            <Scissors className="w-3.5 h-3.5 text-ws-green" />
            <span className="text-[11px] text-ws-text-muted">Potential Savings</span>
          </div>
          <p className="text-lg font-semibold text-ws-green">{formatCurrency(taxSummary.potentialHarvestSavings)}</p>
        </div>
      </div>

      {harvestCandidates.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-ws-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
            <Scissors className="w-3.5 h-3.5 text-ws-yellow" />
            Harvesting Opportunities
            <span className="text-xs bg-ws-card border border-ws-border rounded-full px-2 py-0.5">
              {harvestCandidates.length}
            </span>
          </h4>
          <div className="space-y-3">
            {harvestCandidates.map((candidate) => (
              <HarvestCard key={candidate.symbol} candidate={candidate} />
            ))}
          </div>
        </div>
      )}

      <div className="bg-ws-yellow-light border border-ws-yellow/20 rounded-xl p-3">
        <p className="text-[10px] text-ws-text-secondary leading-relaxed">
          <span className="text-ws-yellow font-semibold">Important:</span> These are estimates based on a ~45% combined marginal tax rate and 50% capital gains inclusion rate. 
          Your actual tax situation depends on your total income, province, and other factors not visible here. 
          Only non-registered accounts are analyzed. TFSA/RRSP trades have no tax implications.
          Always verify with a qualified tax professional.
        </p>
      </div>
    </div>
  );
}
