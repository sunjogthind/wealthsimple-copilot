'use client';

import { Scissors, AlertTriangle, Clock } from 'lucide-react';
import { TaxHarvestCandidate } from '@/types/portfolio';
import { formatCurrency } from '@/lib/utils/format';

interface HarvestCardProps {
  candidate: TaxHarvestCandidate;
}

export default function HarvestCard({ candidate }: HarvestCardProps) {
  return (
    <div className="rounded-xl border border-ws-yellow/20 bg-ws-yellow-light p-4 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-ws-yellow/10 flex items-center justify-center">
            <Scissors className="w-4 h-4 text-ws-yellow" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-ws-text">{candidate.symbol}</h4>
            <span className="text-[10px] text-ws-text-muted uppercase">{candidate.accountType}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-ws-green">
            Save ~{formatCurrency(candidate.estimatedTaxSaving)}
          </p>
          <p className="text-[10px] text-ws-text-muted">estimated tax saving</p>
        </div>
      </div>

      <div className="bg-white/60 rounded-lg p-3 mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-ws-text-muted">Unrealized Loss</span>
          <span className="text-sm text-ws-red font-medium">{formatCurrency(candidate.unrealizedLoss)}</span>
        </div>
      </div>

      {candidate.superficialLossRisk && (
        <div className="flex items-start gap-2 bg-ws-red-light border border-ws-red/20 rounded-lg p-2.5 mb-3">
          <AlertTriangle className="w-3.5 h-3.5 text-ws-red mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] font-semibold text-ws-red uppercase tracking-wide mb-0.5">
              Superficial Loss Risk
            </p>
            <p className="text-xs text-ws-text-secondary leading-relaxed">
              {candidate.superficialLossDetail}
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-ws-text-secondary leading-relaxed">{candidate.notes}</p>

      <div className="mt-3 pt-3 border-t border-ws-border">
        <p className="text-[10px] text-ws-text-muted italic">
          This is a potential opportunity — not a recommendation. Consult a tax professional before acting.
        </p>
      </div>
    </div>
  );
}
