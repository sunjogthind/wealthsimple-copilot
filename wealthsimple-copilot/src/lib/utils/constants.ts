import { ModuleConfig } from '@/types/agent';

export const CAPITAL_GAINS_INCLUSION_RATE = 0.5;
export const CAPITAL_GAINS_INCLUSION_RATE_HIGH = 0.667;
export const CAPITAL_GAINS_HIGH_THRESHOLD = 250000;
export const DEFAULT_MARGINAL_TAX_RATE = 0.45;
export const EFFECTIVE_CAPITAL_GAINS_RATE = DEFAULT_MARGINAL_TAX_RATE * CAPITAL_GAINS_INCLUSION_RATE;
export const SUPERFICIAL_LOSS_WINDOW_DAYS = 30;
export const USD_TO_CAD_APPROX = 1.36;

export const CONCENTRATION_SINGLE_THRESHOLD = 0.15;
export const CONCENTRATION_SECTOR_THRESHOLD = 0.40;
export const OVERTRADING_MIN_HOLD_DAYS = 5;
export const LOSS_AVERSION_DRAWDOWN_THRESHOLD = 0.30;

export const MODULE_CONFIGS: ModuleConfig[] = [
  {
    id: 'trading-coach',
    name: 'Trading Coach',
    description: 'Analyze your trading behavior, detect biases, and get pre-trade sanity checks',
    icon: 'TrendingUp',
    status: 'active',
    color: 'ws-green',
  },
  {
    id: 'tax-optimizer',
    name: 'Tax Optimizer',
    description: 'Identify tax-loss harvesting opportunities and understand your tax position',
    icon: 'Calculator',
    status: 'active',
    color: 'ws-yellow',
  },
  {
    id: 'migration-planner',
    name: 'Migration Planner',
    description: 'Plan asset consolidation from other brokerages to Wealthsimple',
    icon: 'ArrowRightLeft',
    status: 'coming-soon',
    color: 'ws-text-secondary',
  },
  {
    id: 'smart-support',
    name: 'Smart Support',
    description: 'Context-aware support that understands your account and history',
    icon: 'HelpCircle',
    status: 'coming-soon',
    color: 'ws-text-secondary',
  },
];
