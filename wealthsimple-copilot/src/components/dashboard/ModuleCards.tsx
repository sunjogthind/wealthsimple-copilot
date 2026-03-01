'use client';

import { TrendingUp, Calculator, ArrowRightLeft, HelpCircle, Lock, ChevronRight } from 'lucide-react';
import { ModuleType } from '@/types/agent';
import { MODULE_CONFIGS } from '@/lib/utils/constants';

interface ModuleCardsProps {
  onModuleSelect: (module: ModuleType) => void;
  hasData: boolean;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingUp,
  Calculator,
  ArrowRightLeft,
  HelpCircle,
};

export default function ModuleCards({ onModuleSelect, hasData }: ModuleCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {MODULE_CONFIGS.map((module) => {
        const Icon = ICON_MAP[module.icon] || HelpCircle;
        const isComingSoon = module.status === 'coming-soon';

        return (
          <button
            key={module.id}
            onClick={() => !isComingSoon && onModuleSelect(module.id)}
            disabled={isComingSoon}
            className={`group relative text-left rounded-2xl border p-5 transition-all duration-200 ${
              isComingSoon
                ? 'border-ws-border bg-ws-bg-alt cursor-not-allowed opacity-60'
                : 'border-ws-border bg-white hover:shadow-ws-md hover:border-ws-green/30 cursor-pointer'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isComingSoon ? 'bg-ws-border' : 'bg-ws-green-light'
              }`}>
                <Icon className={`w-5 h-5 ${isComingSoon ? 'text-ws-text-muted' : 'text-ws-green'}`} />
              </div>
              {isComingSoon ? (
                <span className="flex items-center gap-1 text-[10px] text-ws-text-muted uppercase tracking-wide bg-ws-border px-2 py-1 rounded-full">
                  <Lock className="w-2.5 h-2.5" />
                  Coming Soon
                </span>
              ) : (
                <ChevronRight className="w-4 h-4 text-ws-text-muted group-hover:text-ws-green transition-colors" />
              )}
            </div>

            <h3 className={`font-semibold mb-1 ${isComingSoon ? 'text-ws-text-muted' : 'text-ws-text'}`}>
              {module.name}
            </h3>
            <p className="text-xs text-ws-text-secondary leading-relaxed">
              {module.description}
            </p>

            {!isComingSoon && module.id === 'trading-coach' && (
              <div className="mt-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-ws-green" />
                <span className="text-[10px] text-ws-green uppercase tracking-wide font-medium">
                  {hasData ? 'Ready' : 'Upload CSV to start'}
                </span>
              </div>
            )}

            {!isComingSoon && module.id === 'tax-optimizer' && (
              <div className="mt-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-ws-yellow" />
                <span className="text-[10px] text-ws-yellow uppercase tracking-wide font-medium">
                  {hasData ? 'Ready' : 'Upload CSV to start'}
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
