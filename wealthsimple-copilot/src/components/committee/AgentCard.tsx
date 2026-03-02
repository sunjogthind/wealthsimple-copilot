'use client';

import { BarChart2, Brain, Scale, Receipt, Sparkles, CheckCircle2, Loader2, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AgentRole } from '@/types/committee';

interface AgentCardProps {
  agent: AgentRole;
  status: 'pending' | 'running' | 'complete' | 'error';
  content: string;
  className?: string;
}

const AGENT_META: Record<AgentRole, { label: string; icon: React.ElementType; color: string }> = {
  portfolio: {
    label: 'Portfolio Impact',
    icon: BarChart2,
    color: 'text-blue-600',
  },
  behavioral: {
    label: 'Behavioral Risk',
    icon: Brain,
    color: 'text-purple-600',
  },
  'devils-advocate': {
    label: "Devil's Advocate",
    icon: Scale,
    color: 'text-ws-red',
  },
  tax: {
    label: 'Tax Impact',
    icon: Receipt,
    color: 'text-ws-yellow',
  },
  synthesis: {
    label: 'Committee Synthesis',
    icon: Sparkles,
    color: 'text-ws-green',
  },
};

function StatusDot({ status }: { status: AgentCardProps['status'] }) {
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-ws-text-muted">
        <Clock className="w-3 h-3" />
        Awaiting...
      </span>
    );
  }
  if (status === 'running') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-ws-green">
        <Loader2 className="w-3 h-3 animate-spin" />
        Analyzing...
      </span>
    );
  }
  if (status === 'complete') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-ws-green">
        <CheckCircle2 className="w-3 h-3" />
        Complete
      </span>
    );
  }
  return (
    <span className="text-xs text-ws-red">Error</span>
  );
}

export default function AgentCard({ agent, status, content, className = '' }: AgentCardProps) {
  const meta = AGENT_META[agent];
  const Icon = meta.icon;
  const isSynthesis = agent === 'synthesis';

  const borderStyle =
    status === 'complete' && isSynthesis
      ? 'border-ws-green border-l-4'
      : status === 'running'
      ? 'border-ws-green/30'
      : status === 'complete'
      ? 'border-ws-border border-l-4 border-l-ws-green/40'
      : 'border-ws-border';

  const bgStyle =
    status === 'pending'
      ? 'bg-ws-bg-alt'
      : 'bg-white';

  return (
    <div
      className={`rounded-xl border shadow-ws transition-all duration-300 ${borderStyle} ${bgStyle} ${isSynthesis ? 'shadow-ws-md' : ''} ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ws-border">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${meta.color}`} />
          <span className="text-sm font-semibold text-ws-text">{meta.label}</span>
        </div>
        <StatusDot status={status} />
      </div>

      {/* Content */}
      <div className={`px-4 py-3 ${isSynthesis ? 'min-h-[80px]' : 'min-h-[120px]'}`}>
        {status === 'pending' ? (
          <p className="text-sm text-ws-text-muted italic">
            Waiting for analysis to begin...
          </p>
        ) : content ? (
          <div className="text-sm chat-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            {status === 'running' && (
              <span className="inline-block w-0.5 h-4 bg-ws-green animate-pulse ml-0.5 align-text-bottom" />
            )}
          </div>
        ) : status === 'running' ? (
          <div className="flex items-center gap-2 text-sm text-ws-text-muted">
            <Loader2 className="w-4 h-4 animate-spin text-ws-green" />
            <span>Thinking...</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
