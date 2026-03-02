'use client';

import { AlertTriangle, TrendingDown, DollarSign } from 'lucide-react';
import { TaxSummaryData, TaxHarvestCandidate } from '@/types/portfolio';
import { formatCurrency } from '@/lib/utils/format';

interface TaxDashboardProps {
  taxSummary: TaxSummaryData;
  harvestCandidates: TaxHarvestCandidate[];
}

export default function TaxDashboard({ taxSummary, harvestCandidates }: TaxDashboardProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="dashboard-panel">
      {/* Tax Year Summary */}
      <div className="bg-white border border-ws-border rounded-xl p-4 shadow-ws">
        <h3 className="text-sm font-semibold text-ws-text mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-ws-green" />
          Tax Year {currentYear} Summary
        </h3>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center py-1.5 border-b border-ws-border/50">
            <span className="text-xs text-ws-text-muted">Realized Capital Gains</span>
            <span className="text-sm font-medium text-green-600">
              {formatCurrency(taxSummary.realizedGainsYTD)}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-1.5 border-b border-ws-border/50">
            <span className="text-xs text-ws-text-muted">Realized Capital Losses</span>
            <span className="text-sm font-medium text-red-600">
              {formatCurrency(taxSummary.realizedLossesYTD)}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-1.5 border-b border-ws-border/50">
            <span className="text-xs text-ws-text-muted">Net Taxable Gains</span>
            <span className="text-sm font-semibold text-ws-text">
              {formatCurrency(taxSummary.netTaxableGains)}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 bg-ws-bg-alt rounded-lg px-2 mt-2">
            <span className="text-xs font-medium text-ws-text">Estimated Tax Owing</span>
            <span className="text-base font-bold text-ws-text">
              {formatCurrency(taxSummary.estimatedTaxOwing)}
            </span>
          </div>
        </div>
        
        <p className="text-[10px] text-ws-text-muted mt-3 leading-relaxed">
          Based on 50% inclusion rate × 45% marginal rate. NON-REG accounts only.
        </p>
      </div>

      {/* Harvesting Opportunities */}
      {harvestCandidates.length > 0 && (
        <div className="mt-6">
          <div className="bg-white border border-ws-border rounded-xl p-4 shadow-ws">
            <h3 className="text-sm font-semibold text-ws-text mb-3 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-orange-500" />
              Tax-Loss Harvesting Opportunities
            </h3>
            
            <div className="space-y-2">
              {harvestCandidates.map((candidate, idx) => (
                <div
                  key={idx}
                  className="border border-ws-border rounded-lg p-3 hover:bg-ws-bg-alt transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-ws-text">
                        {candidate.symbol}
                      </span>
                      {candidate.superficialLossRisk && (
                        <span className="flex items-center gap-1 text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3" />
                          Superficial Loss Risk
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-ws-text-muted">Unrealized Loss</div>
                      <div className="text-sm font-semibold text-red-600">
                        {formatCurrency(candidate.unrealizedLoss)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 bg-green-50 rounded px-2 mb-2">
                    <span className="text-xs text-green-700">Est. Tax Saving</span>
                    <span className="text-sm font-bold text-green-700">
                      {formatCurrency(candidate.estimatedTaxSaving)}
                    </span>
                  </div>
                  
                  {candidate.superficialLossDetail && (
                    <div className="text-[10px] text-orange-700 bg-orange-50 p-2 rounded mb-2 leading-relaxed">
                      {candidate.superficialLossDetail}
                    </div>
                  )}
                  
                  {candidate.notes && (
                    <div className="text-[10px] text-ws-text-muted leading-relaxed">
                      {candidate.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-ws-border">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-ws-text-muted">Total Potential Savings</span>
                <span className="text-base font-bold text-green-600">
                  {formatCurrency(taxSummary.potentialHarvestSavings)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-[10px] text-blue-800 leading-relaxed">
          <strong>Note:</strong> Tax analysis covers non-registered accounts only. TFSA and RRSP accounts are tax-sheltered. 
          Always verify with a tax professional before making decisions.
        </p>
      </div>
    </div>
  );
}
