import { ParsedTrade } from './trade';
import { PortfolioSummary, BehavioralBias, TaxHarvestCandidate, TaxSummaryData, Insight } from './portfolio';

export type ModuleType = 'trading-coach' | 'tax-optimizer' | 'migration-planner' | 'smart-support' | 'general';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  module?: ModuleType;
  insights?: Insight[];
  biases?: BehavioralBias[];
  harvestCandidates?: TaxHarvestCandidate[];
  preTradeSignal?: 'green' | 'yellow' | 'red';
}

export interface RouterResponse {
  module: ModuleType;
  confidence: number;
}

export interface ChatRequest {
  message: string;
  conversationHistory: Message[];
  portfolioData?: ParsedTrade[];
  activeModule?: ModuleType;
}

export interface AnalyzeRequest {
  trades: ParsedTrade[];
}

export interface AnalyzeResponse {
  summary: PortfolioSummary;
  insights: Insight[];
  biases: BehavioralBias[];
  taxOpportunities?: TaxHarvestCandidate[];
  taxSummary?: TaxSummaryData;
}

export interface ModuleConfig {
  id: ModuleType;
  name: string;
  description: string;
  icon: string;
  status: 'active' | 'coming-soon';
  color: string;
}
