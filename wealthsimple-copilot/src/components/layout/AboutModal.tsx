'use client';

import { X, Users, BarChart2, Brain, Scale, Receipt, Sparkles } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-ws-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-serif text-ws-text">About</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-ws-bg-alt rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-ws-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* What it does */}
          <div>
            <h3 className="text-base font-semibold text-ws-text mb-2">What it does</h3>
            <p className="text-sm text-ws-text-secondary leading-relaxed">
              When you describe a trade you're considering, a visible processing pipeline kicks off: portfolio analysis, 
              behavioral bias detection, then four specialized AI agents deliberate in parallel — each taking real cognitive 
              responsibility for a specific dimension of the decision. A fifth synthesis agent reads all four and produces 
              a structured <strong>Pre-Trade Brief</strong>.
            </p>
          </div>

          {/* The Agents */}
          <div>
            <h3 className="text-base font-semibold text-ws-text mb-3">The Five Agents</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <BarChart2 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ws-text">Portfolio Impact</p>
                  <p className="text-xs text-ws-text-secondary">Concentration changes, sector exposure, diversification, CAD net position</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ws-text">Behavioral Risk</p>
                  <p className="text-xs text-ws-text-secondary">Whether this trade matches your specific bias patterns, with evidence from your actual trade history</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Scale className="w-4 h-4 text-ws-red" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ws-text">Devil's Advocate</p>
                  <p className="text-xs text-ws-text-secondary">The strongest possible case against the trade — timing risk, failed assumptions, what you might be missing</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-yellow-50 flex items-center justify-center flex-shrink-0">
                  <Receipt className="w-4 h-4 text-ws-yellow" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ws-text">Tax Impact</p>
                  <p className="text-xs text-ws-text-secondary">Canadian tax consequences: capital gains, ACB, TFSA/RRSP implications, superficial loss risk</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-ws-green" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ws-text">Committee Synthesis</p>
                  <p className="text-xs text-ws-text-secondary">Integrates all four perspectives into a signal, primary concern, and final brief</p>
                </div>
              </div>
            </div>
          </div>

          {/* Human-AI Boundary */}
          <div className="bg-ws-bg-alt rounded-xl p-4 border border-ws-border">
            <h3 className="text-base font-semibold text-ws-text mb-2">The Decision Stays Human</h3>
            <p className="text-sm text-ws-text-secondary leading-relaxed mb-3">
              The AI analyzes portfolio impact, behavioral risk, tax consequences, and adversarial counter-arguments — 
              but the system is deliberately architected to <strong>never recommend buying or selling</strong>.
            </p>
            <p className="text-sm text-ws-text-secondary leading-relaxed">
              Every agent produces evidence and analysis. The synthesis gives you a signal and a brief. 
              But the execution decision belongs entirely to you. The AI does the deliberation. The human makes the call.
            </p>
          </div>

          {/* How to Use */}
          <div>
            <h3 className="text-base font-semibold text-ws-text mb-2">How to Use</h3>
            <ol className="space-y-2 text-sm text-ws-text-secondary">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-ws-text">1.</span>
                <span><strong>Upload your Wealthsimple trade history CSV</strong> or click "Try with sample portfolio" to use demo data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-ws-text">2.</span>
                <span><strong>Describe a trade</strong> you're considering in plain English</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-ws-text">3.</span>
                <span><strong>Watch the pipeline</strong> analyze your portfolio, detect biases, and launch the four agents</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-ws-text">4.</span>
                <span><strong>Review the synthesis</strong> (auto-expands) and click any agent card to see detailed analysis</span>
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-ws-bg-alt border-t border-ws-border px-6 py-4 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-ws-green text-white text-sm font-semibold rounded-lg hover:bg-ws-green/90 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
