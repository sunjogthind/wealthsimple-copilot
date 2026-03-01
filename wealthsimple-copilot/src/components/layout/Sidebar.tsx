'use client';

import { TrendingUp, Calculator, ArrowRightLeft, HelpCircle, Lock } from 'lucide-react';
import { ModuleType } from '@/types/agent';
import { MODULE_CONFIGS } from '@/lib/utils/constants';

interface SidebarProps {
  activeModule: ModuleType | null;
  onModuleClick: (module: ModuleType) => void;
  hasData: boolean;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingUp,
  Calculator,
  ArrowRightLeft,
  HelpCircle,
};

export default function Sidebar({ activeModule, onModuleClick, hasData }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-ws-border bg-white flex flex-col h-full">
      <div className="p-4">
        <h2 className="text-xs font-semibold text-ws-text-muted uppercase tracking-wider mb-3">
          Modules
        </h2>
        <nav className="space-y-1">
          {MODULE_CONFIGS.map((module) => {
            const Icon = ICON_MAP[module.icon] || HelpCircle;
            const isActive = activeModule === module.id;
            const isComingSoon = module.status === 'coming-soon';
            const isDisabled = isComingSoon;

            return (
              <button
                key={module.id}
                onClick={() => !isDisabled && onModuleClick(module.id)}
                disabled={isDisabled}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-ws-green-light text-ws-green border border-ws-green/20'
                    : isDisabled
                    ? 'text-ws-text-muted cursor-not-allowed opacity-50'
                    : 'text-ws-text-secondary hover:text-ws-text hover:bg-ws-bg-alt'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-ws-green' : ''}`} />
                <span className="flex-1 text-left">{module.name}</span>
                {isComingSoon && (
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span className="text-[10px] uppercase tracking-wide">Soon</span>
                  </span>
                )}
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-ws-green pulse-glow" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-ws-border">
        <div className="bg-ws-bg-alt rounded-xl p-3">
          <p className="text-xs text-ws-text-muted leading-relaxed">
            <span className="text-ws-yellow font-medium">Disclaimer:</span> Wealthsimple Copilot provides analysis and education, not financial advice. Always consult a qualified professional before making investment decisions.
          </p>
        </div>
      </div>
    </aside>
  );
}
