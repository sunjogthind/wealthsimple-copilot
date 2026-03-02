import { ParsedTrade } from './trade';

export type AgentRole = 'portfolio' | 'behavioral' | 'devils-advocate' | 'tax' | 'synthesis';

export interface TradeIntent {
  raw: string;
  symbol?: string;
  action?: 'buy' | 'sell';
  quantity?: number;
  accountType?: string;
}

export interface AgentOutput {
  agent: AgentRole;
  status: 'pending' | 'running' | 'complete' | 'error';
  content: string;
}

export interface CommitteeRequest {
  tradeDescription: string;
  portfolioData: ParsedTrade[];
  agent: AgentRole;
  agentOutputs?: Record<string, string>; // for synthesis only
}

export interface PreTradeBrief {
  signal: 'green' | 'yellow' | 'red';
  tradeDescription: string;
  agentOutputs: Record<AgentRole, string>;
  synthesisOutput: string;
}
