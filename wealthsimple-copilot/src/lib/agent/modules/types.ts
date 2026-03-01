import { Message, ModuleType } from '@/types/agent';
import { ParsedTrade } from '@/types/trade';
import { PortfolioSummary } from '@/types/portfolio';

export interface ModuleInput {
  message: string;
  conversationHistory: Message[];
  portfolioData?: ParsedTrade[];
  portfolioSummary?: PortfolioSummary;
}

export interface ModuleOutput {
  content: string;
  module: ModuleType;
}
