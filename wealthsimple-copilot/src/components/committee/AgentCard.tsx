'use client';

import { useState, useEffect } from 'react';
import { BarChart2, Brain, Scale, Receipt, Sparkles, CheckCircle2, Loader2, Clock, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AgentRole } from '@/types/committee';

interface AgentCardProps {
  agent: AgentRole;
  status: 'pending' | 'running' | 'complete' | 'error';
  content: string;
  className?: string;
}

const AGENT_META: Record<AgentRole, { label: string; icon: React.ElementType; color: string; bgAccent: string }> = {
  portfolio: {
    label: 'Portfolio Impact',
    icon: BarChart2,
    color: 'text-blue-600',
    bgAccent: 'bg-blue-50',
  },
  behavioral: {
    label: 'Behavioral Risk',
    icon: Brain,
    color: 'text-purple-600',
    bgAccent: 'bg-purple-50',
  },
  'devils-advocate': {
    label: "Devil's Advocate",
    icon: Scale,
    color: 'text-ws-red',
    bgAccent: 'bg-red-50',
  },
  tax: {
    label: 'Tax Impact',
    icon: Receipt,
    color: 'text-ws-yellow',
    bgAccent: 'bg-yellow-50',
  },
  synthesis: {
    label: 'Committee Synthesis',
    icon: Sparkles,
    color: 'text-ws-green',
    bgAccent: 'bg-emerald-50',
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

function extractSummary(content: string): string {
  const lines = content.split('\n').filter((l) => l.trim().length > 0);
  for (const line of lines) {
    const cleaned = line.replace(/^[#*\->\s]+/, '').trim();
    if (cleaned.length > 20) {
      return cleaned.length > 120 ? cleaned.slice(0, 117) + '...' : cleaned;
    }
  }
  return 'Click to view full analysis';
}

export default function AgentCard({ agent, status, content, className = '' }: AgentCardProps) {
  const meta = AGENT_META[agent];
  const Icon = meta.icon;
  const isSynthesis = agent === 'synthesis';

  // All cards start collapsed. Synthesis auto-opens when complete.
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  // Synthesis: auto-expand once status transitions to 'complete'
  useEffect(() => {
    if (isSynthesis && status === 'complete' && !hasAutoOpened) {
      // Small delay for a clean reveal transition
      const timer = setTimeout(() => {
        setIsExpanded(true);
        setHasAutoOpened(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isSynthesis, status, hasAutoOpened]);

  // Reset when going back to pending (new analysis)
  useEffect(() => {
    if (status === 'pending') {
      setIsExpanded(false);
      setHasAutoOpened(false);
    }
  }, [status]);

  const canToggle = status === 'complete';

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

  const handleToggle = () => {
    if (canToggle) {
      setIsExpanded((prev) => !prev);
    }
  };

  return (
    <div
      className={`rounded-xl border shadow-ws transition-all duration-300 ${borderStyle} ${bgStyle} ${isSynthesis ? 'shadow-ws-md' : ''} ${className}`}
    >
      {/* Header — always visible */}
      <div
        className={`flex items-center justify-between px-4 py-3 ${
          canToggle ? 'cursor-pointer hover:bg-ws-bg-alt/50 transition-colors' : ''
        } ${isExpanded ? 'border-b border-ws-border' : ''}`}
        onClick={handleToggle}
      >
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center ${meta.bgAccent}`}>
            <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
          </div>
          <span className="text-sm font-semibold text-ws-text">{meta.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <StatusDot status={status} />
          {canToggle && (
            <ChevronDown className={`w-4 h-4 text-ws-text-muted transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`} />
          )}
        </div>
      </div>

      {/* Collapsed summary — show a preview when collapsed and complete */}
      {!isExpanded && status === 'complete' && content && (
        <div className="px-4 py-2.5 cursor-pointer" onClick={handleToggle}>
          <p className="text-xs text-ws-text-secondary leading-relaxed">
            {extractSummary(content)}
          </p>
        </div>
      )}

      {/* Full content — only when expanded */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className={`px-4 py-3 ${
          !isSynthesis ? 'max-h-[400px] overflow-y-auto' : ''
        }`}>
          {content ? (
            <div className="text-sm agent-markdown leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
