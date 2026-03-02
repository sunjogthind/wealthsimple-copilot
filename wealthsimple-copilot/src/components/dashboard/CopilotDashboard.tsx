'use client';

import { useState, useCallback } from 'react';
import Header from '../layout/Header';
import CSVUpload from '../upload/CSVUpload';
import PortfolioSummary from './PortfolioSummary';
import CommitteeView from '../committee/CommitteeView';
import { ParsedTrade } from '@/types/trade';
import { analyzePortfolio } from '@/lib/analysis/portfolio';
import { detectBiases } from '@/lib/analysis/behaviors';
import { PortfolioSummary as PortfolioSummaryType, BehavioralBias } from '@/types/portfolio';
import { AlertTriangle, Sparkles } from 'lucide-react';
import CoinLogo from '../ui/CoinLogo';

type AppView = 'landing' | 'app';

function SeverityBadge({ severity }: { severity: BehavioralBias['severity'] }) {
  const colors = {
    high: 'bg-ws-red-light text-ws-red',
    medium: 'bg-ws-yellow-light text-ws-yellow',
    low: 'bg-ws-bg-alt text-ws-text-muted',
  };
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${colors[severity]}`}>
      {severity}
    </span>
  );
}

export default function CopilotDashboard() {
  const [view, setView] = useState<AppView>('landing');
  const [portfolioData, setPortfolioData] = useState<ParsedTrade[] | null>(null);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummaryType | null>(null);
  const [biases, setBiases] = useState<BehavioralBias[]>([]);
  const [showUpload, setShowUpload] = useState(false);

  const handleDataUpload = useCallback((trades: ParsedTrade[]) => {
    setPortfolioData(trades);
    const summary = analyzePortfolio(trades);
    setPortfolioSummary(summary);
    const detectedBiases = detectBiases(
      trades,
      summary.holdings,
      summary.closedPositions,
      summary.totalValue
    );
    setBiases(detectedBiases);
    setShowUpload(false);
    setView('app');
  }, []);

  const handleHomeClick = useCallback(() => {
    setView('landing');
    setShowUpload(false);
  }, []);

  // ── Landing ────────────────────────────────────────────────────────────────
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-ws-bg flex flex-col">
        <Header
          hasData={!!portfolioData}
          onUploadClick={() => {
            setView('app');
            setShowUpload(true);
          }}
          onHomeClick={handleHomeClick}
        />

        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="max-w-3xl w-full text-center mb-12">
            <div className="flex items-center justify-center mx-auto mb-6">
              <CoinLogo size={120} />
            </div>

            <h1 className="text-4xl font-serif text-ws-text mb-4 tracking-tight">
              Your Pre-Trade Committee
            </h1>
            <p className="text-lg text-ws-text-secondary max-w-xl mx-auto leading-relaxed">
              Most AI financial tools answer questions. This one does something different — it stands
              between you and your next bad trade.
            </p>

            <div className="flex items-center justify-center gap-6 mt-8 mb-12 flex-wrap">
              {[
                'Portfolio Impact',
                'Behavioral Risk',
                "Devil's Advocate",
                'Tax Consequences',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-ws-green" />
                  <span className="text-sm text-ws-text-secondary">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <CSVUpload onUploadComplete={handleDataUpload} />
        </main>
      </div>
    );
  }

  // ── App (upload modal) ─────────────────────────────────────────────────────
  if (showUpload) {
    return (
      <div className="h-screen flex flex-col bg-ws-bg overflow-hidden">
        <Header
          hasData={!!portfolioData}
          onUploadClick={() => setShowUpload(false)}
          onHomeClick={handleHomeClick}
        />
        <main className="flex-1 flex items-center justify-center p-8">
          <CSVUpload onUploadComplete={handleDataUpload} />
        </main>
      </div>
    );
  }

  // ── App (main: sidebar + committee) ───────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-ws-bg overflow-hidden">
      <Header
        hasData={!!portfolioData}
        onUploadClick={() => setShowUpload(true)}
        onHomeClick={handleHomeClick}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-72 flex-shrink-0 border-r border-ws-border bg-white overflow-y-auto p-4 space-y-4">
          {portfolioSummary ? (
            <>
              <PortfolioSummary summary={portfolioSummary} />

              {/* Detected biases */}
              {biases.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-ws-text-muted uppercase tracking-wider">
                    Detected Biases
                  </h3>
                  {biases.map((bias) => (
                    <div
                      key={bias.name}
                      className="bg-ws-bg border border-ws-border rounded-xl p-3 shadow-ws"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-ws-yellow flex-shrink-0" />
                          <span className="text-xs font-semibold text-ws-text truncate">
                            {bias.name}
                          </span>
                        </div>
                        <SeverityBadge severity={bias.severity} />
                      </div>
                      <p className="text-xs text-ws-text-secondary leading-relaxed line-clamp-2">
                        {bias.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <p className="text-sm text-ws-text-muted">No portfolio data loaded.</p>
              <button
                onClick={() => setShowUpload(true)}
                className="mt-3 text-sm text-ws-green hover:underline"
              >
                Upload CSV or try demo →
              </button>
            </div>
          )}
        </aside>

        {/* Main: Committee */}
        <main className="flex-1 flex flex-col overflow-hidden bg-ws-bg">
          <CommitteeView portfolioData={portfolioData} />
        </main>
      </div>
    </div>
  );
}
