import { NextRequest, NextResponse } from 'next/server';
import { ParsedTrade } from '@/types/trade';
import { analyzePortfolio } from '@/lib/analysis/portfolio';
import { detectBiases } from '@/lib/analysis/behaviors';
import { analyzeTax } from '@/lib/analysis/tax';
import { AnalyzeResponse } from '@/types/agent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const trades: ParsedTrade[] = body.trades;

    if (!trades || !Array.isArray(trades) || trades.length === 0) {
      return NextResponse.json(
        { error: 'No valid trades provided' },
        { status: 400 }
      );
    }

    const summary = analyzePortfolio(trades);
    const biases = detectBiases(trades, summary.holdings, summary.closedPositions, summary.totalValue);
    const { taxSummary, harvestCandidates } = analyzeTax(trades, summary.holdings, summary.closedPositions);

    const insights: { type: 'bias' | 'portfolio' | 'tax'; severity: 'low' | 'medium' | 'high'; name: string; description: string; evidence: string; suggestion: string }[] = biases.map(b => ({
      type: 'bias' as const,
      severity: b.severity,
      name: b.name,
      description: b.description,
      evidence: b.evidence,
      suggestion: b.suggestion,
    }));

    // Add portfolio-level insights
    if (summary.winRate < 50) {
      insights.push({
        type: 'portfolio',
        severity: 'medium',
        name: 'Low Win Rate',
        description: `Your win rate on closed positions is ${summary.winRate}%.`,
        evidence: `Out of ${summary.closedPositions.length} closed positions, only ${Math.round(summary.closedPositions.length * summary.winRate / 100)} were profitable.`,
        suggestion: 'Consider whether your entry timing or position sizing strategy could be improved. A lower win rate can be acceptable if your winners significantly outpace your losers.',
      });
    }

    const response: AnalyzeResponse = {
      summary,
      insights,
      biases,
      taxOpportunities: harvestCandidates,
      taxSummary,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze portfolio. Please check your data and try again.' },
      { status: 500 }
    );
  }
}
