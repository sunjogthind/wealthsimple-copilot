'use client';

import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

interface PreTradeCheckProps {
  signal: 'green' | 'yellow' | 'red';
  trade: string;
  assessment: string;
  flags: string[];
}

export default function PreTradeCheck({ signal, trade, assessment, flags }: PreTradeCheckProps) {
  const signalConfig = {
    green: {
      icon: ShieldCheck,
      bg: 'bg-ws-green-light',
      border: 'border-ws-green/30',
      iconColor: 'text-ws-green',
      label: 'No concerns detected',
      labelColor: 'text-ws-green',
    },
    yellow: {
      icon: AlertTriangle,
      bg: 'bg-ws-yellow-light',
      border: 'border-ws-yellow/30',
      iconColor: 'text-ws-yellow',
      label: 'Some flags to consider',
      labelColor: 'text-ws-yellow',
    },
    red: {
      icon: ShieldAlert,
      bg: 'bg-ws-red-light',
      border: 'border-ws-red/30',
      iconColor: 'text-ws-red',
      label: 'Multiple concerns detected',
      labelColor: 'text-ws-red',
    },
  };

  const config = signalConfig[signal];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-4 animate-fade-in`}>
      <div className="flex items-center gap-3 mb-3">
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
        <div>
          <h4 className={`text-sm font-semibold ${config.labelColor}`}>Pre-Trade Check: {config.label}</h4>
          <p className="text-xs text-ws-text-muted mt-0.5">{trade}</p>
        </div>
      </div>

      <p className="text-sm text-ws-text-secondary mb-3">{assessment}</p>

      {flags.length > 0 && (
        <div className="space-y-1.5">
          {flags.map((flag, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${config.iconColor.replace('text-', 'bg-')} mt-1.5 flex-shrink-0`} />
              <span className="text-xs text-ws-text-secondary">{flag}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-ws-border">
        <p className="text-[10px] text-ws-text-muted italic">
          This is an observation based on your historical patterns — not a recommendation. The decision is yours.
        </p>
      </div>
    </div>
  );
}
