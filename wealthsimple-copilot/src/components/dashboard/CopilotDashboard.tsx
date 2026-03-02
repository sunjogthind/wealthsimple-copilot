'use client';

import { useState, useCallback } from 'react';
import Header from '../layout/Header';
import Sidebar from '../layout/Sidebar';
import ChatInterface from '../chat/ChatInterface';
import CSVUpload from '../upload/CSVUpload';
import ModuleCards from './ModuleCards';
import TradingDashboard from './TradingDashboard';
import TaxDashboard from './TaxDashboard';
import { ModuleType, AnalyzeResponse } from '@/types/agent';
import { ParsedTrade } from '@/types/trade';
import { Sparkles } from 'lucide-react';
import CoinLogo from '../ui/CoinLogo';

type AppView = 'landing' | 'chat';

export default function CopilotDashboard() {
  const [view, setView] = useState<AppView>('landing');
  const [portfolioData, setPortfolioData] = useState<ParsedTrade[] | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleType | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResponse | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const handleDataUpload = useCallback(async (trades: ParsedTrade[]) => {
    setPortfolioData(trades);
    setShowUpload(false);

    // Run initial analysis
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trades }),
      });

      if (response.ok) {
        const result: AnalyzeResponse = await response.json();
        setAnalysisResult(result);
      }
    } catch (error) {
      console.error('Analysis error:', error);
    }

    setView('chat');
    if (!activeModule) {
      setActiveModule('trading-coach');
    }
  }, [activeModule]);

  const [pendingStarterMessage, setPendingStarterMessage] = useState<string | null>(null);

  const MODULE_STARTERS: Record<string, string> = {
    'trading-coach': 'Analyze my trading patterns and behavioral biases',
    'tax-optimizer': 'Scan my portfolio for tax-loss harvesting opportunities',
  };

  const handleModuleClick = useCallback((module: ModuleType) => {
    if (view === 'landing') {
      setView('chat');
    }
    setShowUpload(false);
    setActiveModule(module);
  }, [view]);

  const handleModuleChange = useCallback((module: ModuleType) => {
    setActiveModule(module);
  }, []);

  const handleHomeClick = useCallback(() => {
    setView('landing');
    setActiveModule(null);
    setShowUpload(false);
  }, []);

  // Landing view
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-ws-bg flex flex-col">
        <Header hasData={!!portfolioData} onUploadClick={() => setShowUpload(true)} onHomeClick={handleHomeClick} />

        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="max-w-3xl w-full text-center mb-12">
            <div className="flex items-center justify-center mx-auto mb-6">
              <CoinLogo size={120} />
            </div>

            <h1 className="text-4xl font-serif text-ws-text mb-4 tracking-tight">
              Your Financial Copilot
            </h1>
            <p className="text-lg text-ws-text-secondary max-w-xl mx-auto leading-relaxed">
              Upload your Wealthsimple trade history and get personalized insights about your trading behavior, 
              portfolio risks, and tax optimization opportunities.
            </p>

            <div className="flex items-center justify-center gap-6 mt-8 mb-12">
              {[
                'Behavioral Bias Detection',
                'Pre-Trade Sanity Checks',
                'Tax-Loss Harvesting',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-ws-green" />
                  <span className="text-sm text-ws-text-secondary">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <CSVUpload onUploadComplete={handleDataUpload} />

          <div className="mt-16 max-w-3xl w-full">
            <h2 className="text-sm font-semibold text-ws-text-muted uppercase tracking-wider mb-6 text-center">
              Available Modules
            </h2>
            <ModuleCards onModuleSelect={handleModuleClick} hasData={!!portfolioData} />
          </div>
        </main>
      </div>
    );
  }

  // Chat view (main app)
  return (
    <div className="h-screen flex flex-col bg-ws-bg overflow-hidden">
      <Header
        hasData={!!portfolioData}
        onUploadClick={() => setShowUpload(!showUpload)}
        onHomeClick={handleHomeClick}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeModule={activeModule}
          onModuleClick={handleModuleClick}
          hasData={!!portfolioData}
        />

        <main className="flex-1 flex overflow-hidden">
          {/* Chat area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-ws-bg">
            {showUpload ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <CSVUpload onUploadComplete={handleDataUpload} />
              </div>
            ) : (
              <ChatInterface
                portfolioData={portfolioData}
                activeModule={activeModule}
                onModuleChange={handleModuleChange}
                onDataUpload={handleDataUpload}
                pendingStarterMessage={pendingStarterMessage}
                onStarterMessageSent={() => setPendingStarterMessage(null)}
              />
            )}
          </div>

          {/* Right panel — module-specific dashboard */}
          {analysisResult && !showUpload && (
            <aside className="w-80 border-l border-ws-border bg-white overflow-y-auto p-4">
              {activeModule === 'trading-coach' && (
                <TradingDashboard
                  summary={analysisResult.summary}
                  biases={analysisResult.biases}
                  insights={analysisResult.insights}
                />
              )}
              
              {activeModule === 'tax-optimizer' && analysisResult.taxSummary && analysisResult.taxOpportunities && (
                <TaxDashboard
                  taxSummary={analysisResult.taxSummary}
                  harvestCandidates={analysisResult.taxOpportunities}
                />
              )}
              
              {!activeModule && (
                <TradingDashboard
                  summary={analysisResult.summary}
                  biases={analysisResult.biases}
                  insights={analysisResult.insights}
                />
              )}
            </aside>
          )}
        </main>
      </div>
    </div>
  );
}
