'use client';

import { useState } from 'react';
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
  const [showComingSoonToast, setShowComingSoonToast] = useState(false);

  const handleModuleClick = (moduleId: ModuleType, isComingSoon: boolean) => {
    if (isComingSoon) {
      setShowComingSoonToast(true);
      setTimeout(() => setShowComingSoonToast(false), 3000);
    } else {
      onModuleClick(moduleId);
    }
  };

  return (
    <aside className="w-64 border-r border-ws-border bg-white flex flex-col h-full relative">
      {/* Coming Soon Toast */}
      {showComingSoonToast && (
        <div className="absolute top-4 left-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-lg z-50 animate-slideDown">
          <p className="text-xs text-blue-800 font-medium">
            Coming soon — this module is under development.
          </p>
        </div>
      )}

      <div className="p-4">
        <h2 className="text-xs font-semibold text-ws-text-muted uppercase tracking-wider mb-3">
          Modules
        </h2>
        <nav className="space-y-1">
          {MODULE_CONFIGS.map((module) => {
            const Icon = ICON_MAP[module.icon] || HelpCircle;
            const isActive = activeModule === module.id;
            const isComingSoon = module.status === 'coming-soon';

            return (
              <button
                key={module.id}
                onClick={() => handleModuleClick(module.id, isComingSoon)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-ws-green-light text-ws-green border border-ws-green/20'
                    : isComingSoon
                    ? 'text-ws-text-muted cursor-pointer opacity-50 hover:opacity-70'
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
