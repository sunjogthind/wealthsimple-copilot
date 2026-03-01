import { Holding, ClosedPosition, AccountType } from './trade';

export interface PortfolioSummary {
  totalValue: number;
  holdingCount: number;
  tradeCount: number;
  firstTradeDate: string;
  lastTradeDate: string;
  realizedGains: number;
  realizedLosses: number;
  netRealizedPL: number;
  winRate: number;
  avgHoldDays: number;
  totalDividends: number;
  accountBreakdown: AccountBreakdown[];
  topHoldings: TopHolding[];
  holdings: Holding[];
  closedPositions: ClosedPosition[];
}

export interface AccountBreakdown {
  type: AccountType;
  value: number;
  pct: number;
}

export interface TopHolding {
  symbol: string;
  pct: number;
  value: number;
}

export interface BehavioralBias {
  name: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  evidence: string;
  suggestion: string;
}

export interface TaxHarvestCandidate {
  symbol: string;
  unrealizedLoss: number;
  estimatedTaxSaving: number;
  accountType: string;
  superficialLossRisk: boolean;
  superficialLossDetail: string;
  notes: string;
}

export interface TaxSummaryData {
  realizedGainsYTD: number;
  realizedLossesYTD: number;
  netTaxableGains: number;
  estimatedTaxOwing: number;
  potentialHarvestSavings: number;
  taxOwingAfterHarvest: number;
}

export interface Insight {
  type: 'bias' | 'portfolio' | 'tax';
  severity: 'low' | 'medium' | 'high';
  name: string;
  description: string;
  evidence: string;
  suggestion: string;
}
