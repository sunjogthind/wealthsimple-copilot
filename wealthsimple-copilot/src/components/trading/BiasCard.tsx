'use client';

import { AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import { BehavioralBias } from '@/types/portfolio';

interface BiasCardProps {
  bias: BehavioralBias;
  index: number;
}

export default function BiasCard({ bias, index }: BiasCardProps) {
  const severityConfig = {
    low: {
      gradient: 'from-ws-green-light to-transparent',
      border: 'border-ws-green/20',
      icon: Info,
      iconBg: 'bg-ws-green-light',
      iconColor: 'text-ws-green',
      badge: 'bg-ws-green-light text-ws-green border-ws-green/20',
    },
    medium: {
      gradient: 'from-ws-yellow-light to-transparent',
      border: 'border-ws-yellow/20',
      icon: AlertTriangle,
      iconBg: 'bg-ws-yellow-light',
      iconColor: 'text-ws-yellow',
      badge: 'bg-ws-yellow-light text-ws-yellow border-ws-yellow/20',
    },
    high: {
      gradient: 'from-ws-red-light to-transparent',
      border: 'border-ws-red/20',
      icon: ShieldAlert,
      iconBg: 'bg-ws-red-light',
      iconColor: 'text-ws-red',
      badge: 'bg-ws-red-light text-ws-red border-ws-red/20',
    },
  };

  const config = severityConfig[bias.severity];
  const Icon = config.icon;

  return (
    <div
      className={`rounded-xl border ${config.border} bg-gradient-to-br ${config.gradient} p-4 animate-slide-up`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${config.iconColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h4 className="text-sm font-semibold text-ws-text">{bias.name}</h4>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide border ${config.badge}`}>
              {bias.severity}
            </span>
          </div>

          <p className="text-xs text-ws-text-secondary mb-2.5 leading-relaxed">{bias.description}</p>

          <div className="bg-white/60 rounded-lg p-3 mb-2.5">
            <p className="text-xs text-ws-text-secondary leading-relaxed">
              <span className="text-ws-text-muted font-semibold text-[10px] uppercase tracking-wide block mb-1">Evidence</span>
              {bias.evidence}
            </p>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-1 h-1 rounded-full bg-ws-green mt-1.5 flex-shrink-0" />
            <p className="text-xs text-ws-green/80 leading-relaxed">{bias.suggestion}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
