'use client';

import { TrendingUp, Calculator, ArrowRightLeft, HelpCircle, Bot } from 'lucide-react';
import { ModuleType } from '@/types/agent';

interface ModuleIndicatorProps {
  module: ModuleType | null;
}

const MODULE_INFO: Record<string, { name: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  'trading-coach': { name: 'Trading Coach', icon: TrendingUp, color: 'text-ws-green', bg: 'bg-ws-green-light' },
  'tax-optimizer': { name: 'Tax Optimizer', icon: Calculator, color: 'text-ws-yellow', bg: 'bg-ws-yellow-light' },
  'migration-planner': { name: 'Migration Planner', icon: ArrowRightLeft, color: 'text-ws-text-secondary', bg: 'bg-ws-bg-alt' },
  'smart-support': { name: 'Smart Support', icon: HelpCircle, color: 'text-ws-text-secondary', bg: 'bg-ws-bg-alt' },
  'general': { name: 'Copilot', icon: Bot, color: 'text-ws-green', bg: 'bg-ws-green-light' },
};

export default function ModuleIndicator({ module }: ModuleIndicatorProps) {
  if (!module) return null;

  const info = MODULE_INFO[module] || MODULE_INFO['general'];
  const Icon = info.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${info.bg} text-xs`}>
      <Icon className={`w-3 h-3 ${info.color}`} />
      <span className={info.color}>{info.name}</span>
      <div className={`w-1.5 h-1.5 rounded-full bg-current ${info.color} animate-pulse`} />
    </div>
  );
}
