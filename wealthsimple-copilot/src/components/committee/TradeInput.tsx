'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Loader2, Users } from 'lucide-react';

interface TradeInputProps {
  onSubmit: (tradeDescription: string) => void;
  isRunning: boolean;
  hasPortfolioData: boolean;
}

const PLACEHOLDER_EXAMPLES = [
  'I\'m thinking about selling my LSPD.TO position',
  'Should I add to my QQQ in my RRSP?',
  'I want to sell my SHOP.TO and buy NVDA',
  'I\'m considering selling my BITF.TO for a tax loss',
];

export default function TradeInput({ onSubmit, isRunning, hasPortfolioData }: TradeInputProps) {
  const [value, setValue] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cycle placeholder examples
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_EXAMPLES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isRunning) return;
    onSubmit(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-ws-green-light text-ws-green text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <Users className="w-3.5 h-3.5" />
          Pre-Trade Committee
        </div>
        <h2 className="text-2xl font-serif text-ws-text mb-2">
          What trade are you considering?
        </h2>
        <p className="text-ws-text-secondary text-sm leading-relaxed max-w-md mx-auto">
          Describe your trade in plain English. Four specialized AI agents will analyze it in parallel —
          behavioral risk, portfolio impact, tax consequences, and a devil&apos;s advocate.
        </p>
      </div>

      {/* Input area */}
      <div className="bg-white border border-ws-border rounded-2xl shadow-ws overflow-hidden">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={PLACEHOLDER_EXAMPLES[placeholderIndex]}
          disabled={isRunning}
          rows={4}
          className="w-full px-5 py-4 text-ws-text text-base resize-none border-none outline-none bg-transparent placeholder:text-ws-text-muted disabled:opacity-60"
        />

        <div className="flex items-center justify-between px-5 py-3 border-t border-ws-border bg-ws-bg">
          <p className="text-xs text-ws-text-muted">
            {hasPortfolioData ? (
              <span className="text-ws-green font-medium">Portfolio loaded — analysis will be personalized</span>
            ) : (
              <span>No portfolio data — upload a CSV or try demo mode for personalized analysis</span>
            )}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-ws-text-muted hidden sm:block">⌘↵ to run</span>
            <button
              onClick={handleSubmit}
              disabled={!value.trim() || isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-ws-green text-white text-sm font-semibold rounded-lg hover:bg-ws-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Run Committee
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Example prompts */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {PLACEHOLDER_EXAMPLES.map((example, i) => (
          <button
            key={i}
            onClick={() => {
              setValue(example);
              textareaRef.current?.focus();
            }}
            disabled={isRunning}
            className="text-xs text-ws-text-secondary bg-white border border-ws-border hover:border-ws-green hover:text-ws-green px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
