'use client';

import { AlertTriangle, TrendingDown, TrendingUp, Info } from 'lucide-react';
import { Insight } from '@/types/portfolio';

interface InsightCardProps {
  insight: Insight;
}

export default function InsightCard({ insight }: InsightCardProps) {
  const severityConfig = {
    low: {
      border: 'border-ws-green/20',
      bg: 'bg-ws-green-light',
      icon: Info,
      iconColor: 'text-ws-green',
      badge: 'bg-ws-green-light text-ws-green',
    },
    medium: {
      border: 'border-ws-yellow/20',
      bg: 'bg-ws-yellow-light',
      icon: AlertTriangle,
      iconColor: 'text-ws-yellow',
      badge: 'bg-ws-yellow-light text-ws-yellow',
    },
    high: {
      border: 'border-ws-red/20',
      bg: 'bg-ws-red-light',
      icon: AlertTriangle,
      iconColor: 'text-ws-red',
      badge: 'bg-ws-red-light text-ws-red',
    },
  };

  const config = severityConfig[insight.severity];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-4 animate-fade-in`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${config.iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-ws-text">{insight.name}</h4>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide ${config.badge}`}>
              {insight.severity}
            </span>
          </div>
          <p className="text-xs text-ws-text-secondary mb-2">{insight.description}</p>
          <div className="bg-white/60 rounded-lg p-2.5 mb-2">
            <p className="text-xs text-ws-text-secondary leading-relaxed">
              <span className="text-ws-text-muted font-medium">Evidence: </span>
              {insight.evidence}
            </p>
          </div>
          <p className="text-xs text-ws-green/80">
            <span className="font-medium">Suggestion: </span>
            {insight.suggestion}
          </p>
        </div>
      </div>
    </div>
  );
}
