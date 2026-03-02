'use client';

import { useState, useRef, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import { ParsedTrade } from '@/types/trade';
import { AgentRole } from '@/types/committee';
import AgentCard from './AgentCard';
import TradeInput from './TradeInput';

type CommitteeState = 'idle' | 'running' | 'complete';
type AgentStatus = 'pending' | 'running' | 'complete' | 'error';

interface CommitteeViewProps {
  portfolioData: ParsedTrade[] | null;
}

const PANEL_AGENTS: AgentRole[] = ['portfolio', 'behavioral', 'devils-advocate', 'tax'];

export default function CommitteeView({ portfolioData }: CommitteeViewProps) {
  const [state, setState] = useState<CommitteeState>('idle');
  const [tradeDescription, setTradeDescription] = useState('');
  const [agentStatuses, setAgentStatuses] = useState<Record<AgentRole, AgentStatus>>({
    portfolio: 'pending',
    behavioral: 'pending',
    'devils-advocate': 'pending',
    tax: 'pending',
    synthesis: 'pending',
  });
  const [agentOutputs, setAgentOutputs] = useState<Record<AgentRole, string>>({
    portfolio: '',
    behavioral: '',
    'devils-advocate': '',
    tax: '',
    synthesis: '',
  });

  // Abort controllers so we can cancel inflight requests on reset
  const abortRefs = useRef<AbortController[]>([]);

  const setAgentStatus = (agent: AgentRole, status: AgentStatus) => {
    setAgentStatuses((prev) => ({ ...prev, [agent]: status }));
  };

  const appendAgentOutput = useCallback((agent: AgentRole, chunk: string) => {
    setAgentOutputs((prev) => ({ ...prev, [agent]: prev[agent] + chunk }));
  }, []);

  const setAgentOutput = useCallback((agent: AgentRole, content: string) => {
    setAgentOutputs((prev) => ({ ...prev, [agent]: content }));
  }, []);

  async function streamAgent(
    agent: AgentRole,
    trade: string,
    controller: AbortController,
    extraOutputs?: Record<string, string>
  ): Promise<string> {
    const body: Record<string, unknown> = {
      tradeDescription: trade,
      portfolioData: portfolioData ?? [],
      agent,
    };
    if (extraOutputs) body.agentOutputs = extraOutputs;

    setAgentStatus(agent, 'running');

    const response = await fetch('/api/committee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Unknown error' }));
      setAgentStatus(agent, 'error');
      setAgentOutput(agent, `Error: ${err.error ?? 'Request failed'}`);
      return '';
    }

    const reader = response.body?.getReader();
    if (!reader) {
      setAgentStatus(agent, 'error');
      return '';
    }

    const decoder = new TextDecoder();
    let fullContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        appendAgentOutput(agent, chunk);
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setAgentStatus(agent, 'error');
        return fullContent;
      }
    }

    setAgentStatus(agent, 'complete');
    return fullContent;
  }

  const runCommittee = useCallback(async (trade: string) => {
    // Cancel any previous streams
    abortRefs.current.forEach((c) => c.abort());
    abortRefs.current = [];

    setTradeDescription(trade);
    setState('running');

    // Reset outputs and statuses
    setAgentStatuses({
      portfolio: 'pending',
      behavioral: 'pending',
      'devils-advocate': 'pending',
      tax: 'pending',
      synthesis: 'pending',
    });
    setAgentOutputs({
      portfolio: '',
      behavioral: '',
      'devils-advocate': '',
      tax: '',
      synthesis: '',
    });

    // Create abort controllers for all 5 agents
    const controllers = Array.from({ length: 5 }, () => new AbortController());
    abortRefs.current = controllers;

    // Run 4 panel agents in parallel
    const [portfolioOut, behavioralOut, devilsOut, taxOut] = await Promise.all([
      streamAgent('portfolio', trade, controllers[0]),
      streamAgent('behavioral', trade, controllers[1]),
      streamAgent('devils-advocate', trade, controllers[2]),
      streamAgent('tax', trade, controllers[3]),
    ]);

    // Run synthesis with all 4 outputs
    await streamAgent('synthesis', trade, controllers[4], {
      portfolio: portfolioOut,
      behavioral: behavioralOut,
      'devils-advocate': devilsOut,
      tax: taxOut,
    });

    setState('complete');
  }, [portfolioData, appendAgentOutput, setAgentOutput]); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => {
    abortRefs.current.forEach((c) => c.abort());
    abortRefs.current = [];
    setState('idle');
    setTradeDescription('');
    setAgentStatuses({
      portfolio: 'pending',
      behavioral: 'pending',
      'devils-advocate': 'pending',
      tax: 'pending',
      synthesis: 'pending',
    });
    setAgentOutputs({
      portfolio: '',
      behavioral: '',
      'devils-advocate': '',
      tax: '',
      synthesis: '',
    });
  };

  if (state === 'idle') {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <TradeInput
          onSubmit={runCommittee}
          isRunning={false}
          hasPortfolioData={!!portfolioData}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Trade being analyzed */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-ws-text-muted uppercase tracking-wider mb-1">
              Analyzing trade
            </p>
            <p className="text-ws-text font-medium text-lg leading-snug">
              &ldquo;{tradeDescription}&rdquo;
            </p>
          </div>
          {state === 'complete' && (
            <button
              onClick={reset}
              className="flex-shrink-0 flex items-center gap-2 text-sm text-ws-text-secondary hover:text-ws-green transition-colors border border-ws-border hover:border-ws-green rounded-lg px-3 py-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              New Analysis
            </button>
          )}
        </div>
      </div>

      {/* 2×2 agent grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {PANEL_AGENTS.map((agent) => (
          <AgentCard
            key={agent}
            agent={agent}
            status={agentStatuses[agent]}
            content={agentOutputs[agent]}
          />
        ))}
      </div>

      {/* Synthesis — full width */}
      <AgentCard
        agent="synthesis"
        status={agentStatuses['synthesis']}
        content={agentOutputs['synthesis']}
        className="w-full"
      />

      {/* Bottom CTA when complete */}
      {state === 'complete' && (
        <div className="mt-6 text-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-ws-green text-white text-sm font-semibold rounded-lg hover:bg-ws-green/90 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Analyze Another Trade
          </button>
        </div>
      )}
    </div>
  );
}
