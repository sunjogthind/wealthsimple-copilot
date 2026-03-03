'use client';

import { CheckCircle2, Loader2, Clock, Database, Brain, Users, Sparkles } from 'lucide-react';

export type PipelineStep =
  | 'idle'
  | 'analyzing-portfolio'
  | 'detecting-biases'
  | 'agents-running'
  | 'synthesis-running'
  | 'complete';

interface PipelineStripProps {
  currentStep: PipelineStep;
  tradeCount: number;
  biasCount: number;
  agentsComplete: number;
}

interface StepDef {
  id: PipelineStep;
  label: string;
  detail: (props: PipelineStripProps) => string;
  icon: React.ElementType;
}

const STEPS: StepDef[] = [
  {
    id: 'analyzing-portfolio',
    label: 'Portfolio Analysis',
    detail: (p) => `${p.tradeCount} trades processed`,
    icon: Database,
  },
  {
    id: 'detecting-biases',
    label: 'Bias Detection',
    detail: (p) => p.biasCount > 0 ? `${p.biasCount} patterns found` : 'Scanning history...',
    icon: Brain,
  },
  {
    id: 'agents-running',
    label: '4 Agents Deliberating',
    detail: (p) => p.agentsComplete < 4 ? `${p.agentsComplete}/4 complete` : '4/4 complete',
    icon: Users,
  },
  {
    id: 'synthesis-running',
    label: 'Committee Synthesis',
    detail: () => 'Integrating findings',
    icon: Sparkles,
  },
];

function getStepStatus(
  stepId: PipelineStep,
  currentStep: PipelineStep
): 'pending' | 'running' | 'complete' {
  const order: PipelineStep[] = [
    'analyzing-portfolio',
    'detecting-biases',
    'agents-running',
    'synthesis-running',
    'complete',
  ];
  const currentIdx = order.indexOf(currentStep);
  const stepIdx = order.indexOf(stepId);

  if (currentStep === 'complete') return 'complete';
  if (stepIdx < currentIdx) return 'complete';
  if (stepIdx === currentIdx) return 'running';
  return 'pending';
}

export default function PipelineStrip(props: PipelineStripProps) {
  const { currentStep } = props;

  if (currentStep === 'idle') return null;

  return (
    <div className="mb-5 bg-white border border-ws-border rounded-xl px-5 py-3 shadow-ws">
      <div className="flex items-center">
        {STEPS.map((step, i) => {
          const status = getStepStatus(step.id, currentStep);

          return (
            <div key={step.id} className="contents">
              {/* Step block */}
              <div className={`flex items-center gap-2 transition-all duration-300 ${
                status === 'pending' ? 'opacity-40' : 'opacity-100'
              }`}>
                {/* Status icon */}
                <div className="flex-shrink-0">
                  {status === 'complete' ? (
                    <CheckCircle2 className="w-4 h-4 text-ws-green" />
                  ) : status === 'running' ? (
                    <Loader2 className="w-4 h-4 text-ws-green animate-spin" />
                  ) : (
                    <Clock className="w-4 h-4 text-ws-text-muted" />
                  )}
                </div>

                {/* Label + detail */}
                <div className="whitespace-nowrap">
                  <p className={`text-xs font-semibold ${
                    status === 'running' ? 'text-ws-green' :
                    status === 'complete' ? 'text-ws-text' : 'text-ws-text-muted'
                  }`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-ws-text-muted">
                    {status === 'pending' ? 'Waiting...' : step.detail(props)}
                  </p>
                </div>
              </div>

              {/* Connector arrow */}
              {i < STEPS.length - 1 && (
                <div className="flex-1 flex items-center justify-center px-2">
                  <svg width="24" height="8" viewBox="0 0 24 8" className={`transition-colors duration-300 ${
                    getStepStatus(STEPS[i + 1].id, currentStep) !== 'pending'
                      ? 'text-ws-green'
                      : 'text-ws-border'
                  }`}>
                    <line x1="0" y1="4" x2="18" y2="4" stroke="currentColor" strokeWidth="1.5" />
                    <polyline points="16,1 20,4 16,7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
