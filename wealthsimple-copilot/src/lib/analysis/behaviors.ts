import { ClosedPosition, Holding, ParsedTrade } from '@/types/trade';
import { BehavioralBias } from '@/types/portfolio';
import {
  CONCENTRATION_SINGLE_THRESHOLD,
  OVERTRADING_MIN_HOLD_DAYS,
  LOSS_AVERSION_DRAWDOWN_THRESHOLD,
} from '@/lib/utils/constants';
import { formatCurrency, formatPercent } from '@/lib/utils/format';

export function detectBiases(
  trades: ParsedTrade[],
  holdings: Holding[],
  closedPositions: ClosedPosition[],
  totalValue: number
): BehavioralBias[] {
  const biases: BehavioralBias[] = [];

  // 1. Disposition Effect
  const dispositionBias = detectDispositionEffect(closedPositions);
  if (dispositionBias) biases.push(dispositionBias);

  // 2. Overconcentration
  const concentrationBias = detectOverconcentration(holdings, totalValue);
  if (concentrationBias) biases.push(concentrationBias);

  // 3. Overtrading
  const overtradingBias = detectOvertrading(closedPositions);
  if (overtradingBias) biases.push(overtradingBias);

  // 4. Loss Aversion (holding losers)
  const lossAversionBias = detectLossAversion(holdings);
  if (lossAversionBias) biases.push(lossAversionBias);

  // 5. FOMO / Chasing
  const fomoBias = detectFOMO(trades, closedPositions);
  if (fomoBias) biases.push(fomoBias);

  // 6. Home Bias
  const homeBias = detectHomeBias(holdings, totalValue);
  if (homeBias) biases.push(homeBias);

  // 7. Repeat Offender (same stock bought/sold multiple times)
  const repeatBias = detectRepeatTrading(trades);
  if (repeatBias) biases.push(repeatBias);

  return biases;
}

function detectDispositionEffect(closedPositions: ClosedPosition[]): BehavioralBias | null {
  if (closedPositions.length < 3) return null;

  const winners = closedPositions.filter(p => p.gain > 0);
  const losers = closedPositions.filter(p => p.gain < 0);

  if (winners.length === 0 || losers.length === 0) return null;

  const avgWinnerHold = winners.reduce((sum, p) => sum + p.holdDays, 0) / winners.length;
  const avgLoserHold = losers.reduce((sum, p) => sum + p.holdDays, 0) / losers.length;

  if (avgLoserHold > avgWinnerHold * 1.5 && losers.length >= 2) {
    return {
      name: 'Disposition Effect',
      severity: avgLoserHold > avgWinnerHold * 2 ? 'high' : 'medium',
      description: 'You tend to sell winners quickly while holding onto losers longer.',
      evidence: `Average hold time for winning trades: ${Math.round(avgWinnerHold)} days. Average hold time for losing trades: ${Math.round(avgLoserHold)} days. You held losers ${Math.round((avgLoserHold / avgWinnerHold) * 10) / 10}x longer than winners.`,
      suggestion: 'Consider setting pre-defined exit criteria for both profits and losses before entering a trade. This removes emotion from the sell decision.',
    };
  }

  return null;
}

function detectOverconcentration(holdings: Holding[], totalValue: number): BehavioralBias | null {
  if (totalValue === 0 || holdings.length === 0) return null;

  const concentrated = holdings.filter(h => h.currentValue / totalValue > CONCENTRATION_SINGLE_THRESHOLD);

  if (concentrated.length > 0) {
    const topConcentrated = concentrated.sort((a, b) => b.currentValue - a.currentValue)[0];
    const pct = (topConcentrated.currentValue / totalValue) * 100;

    return {
      name: 'Overconcentration',
      severity: pct > 30 ? 'high' : 'medium',
      description: `Single position exceeding ${CONCENTRATION_SINGLE_THRESHOLD * 100}% of your portfolio.`,
      evidence: `${topConcentrated.symbol} represents ${pct.toFixed(1)}% of your portfolio (${formatCurrency(topConcentrated.currentValue)}). ${concentrated.length > 1 ? `${concentrated.length} positions exceed the ${CONCENTRATION_SINGLE_THRESHOLD * 100}% threshold.` : ''}`,
      suggestion: 'Consider whether this level of concentration aligns with your risk tolerance. Diversification across positions can reduce idiosyncratic risk.',
    };
  }

  return null;
}

function detectOvertrading(closedPositions: ClosedPosition[]): BehavioralBias | null {
  const shortTermTrades = closedPositions.filter(p => p.holdDays < OVERTRADING_MIN_HOLD_DAYS);

  if (shortTermTrades.length >= 3) {
    const pctShortTerm = (shortTermTrades.length / closedPositions.length) * 100;
    const totalLossFromShort = shortTermTrades.reduce((sum, p) => sum + p.gain, 0);

    return {
      name: 'Overtrading',
      severity: pctShortTerm > 50 ? 'high' : 'medium',
      description: 'Frequent short-term trades that may be eroding returns through fees and poor timing.',
      evidence: `${shortTermTrades.length} of ${closedPositions.length} closed positions (${pctShortTerm.toFixed(0)}%) were held less than ${OVERTRADING_MIN_HOLD_DAYS} days. Net P&L from these quick trades: ${formatCurrency(totalLossFromShort)}.`,
      suggestion: 'Before each trade, ask yourself: "What has changed since I bought this?" Rapid buying and selling often indicates reactive rather than strategic decision-making.',
    };
  }

  return null;
}

function detectLossAversion(holdings: Holding[]): BehavioralBias | null {
  const bigLosers = holdings.filter(h => h.unrealizedGainPct < -(LOSS_AVERSION_DRAWDOWN_THRESHOLD * 100));

  if (bigLosers.length > 0) {
    const worstLoser = bigLosers.sort((a, b) => a.unrealizedGainPct - b.unrealizedGainPct)[0];

    return {
      name: 'Loss Aversion',
      severity: bigLosers.length > 1 ? 'high' : 'medium',
      description: 'Holding positions through significant drawdowns, possibly hoping they\'ll recover.',
      evidence: `${bigLosers.length} position(s) with 30%+ unrealized losses. Worst: ${worstLoser.symbol} at ${formatPercent(worstLoser.unrealizedGainPct)} (unrealized loss of ${formatCurrency(worstLoser.unrealizedGain)}).`,
      suggestion: 'Ask yourself: "If I didn\'t own this stock, would I buy it today at this price?" If the answer is no, the original purchase price shouldn\'t anchor your decision.',
    };
  }

  return null;
}

function detectFOMO(trades: ParsedTrade[], closedPositions: ClosedPosition[]): BehavioralBias | null {
  // Detect pattern: buy, price drops, sell at loss quickly, then buy again at higher price
  const quickLosses = closedPositions.filter(p => p.gain < 0 && p.holdDays < 14);

  // Detect buying after a recent sale at loss then buying back higher
  const symbolTrades = new Map<string, ParsedTrade[]>();
  trades.forEach(t => {
    const existing = symbolTrades.get(t.symbol) || [];
    existing.push(t);
    symbolTrades.set(t.symbol, existing);
  });

  let rebuyHigherCount = 0;
  const rebuySymbols: string[] = [];
  symbolTrades.forEach((symbolTradeList, symbol) => {
    const sells = symbolTradeList.filter(t => t.transactionType === 'sell');
    const buys = symbolTradeList.filter(t => t.transactionType === 'buy');

    for (const sell of sells) {
      const rebuy = buys.find(b =>
        b.date > sell.date &&
        b.price > sell.price
      );
      if (rebuy) {
        rebuyHigherCount++;
        if (!rebuySymbols.includes(symbol)) rebuySymbols.push(symbol);
      }
    }
  });

  if (rebuyHigherCount >= 2) {
    return {
      name: 'FOMO / Chase Buying',
      severity: rebuyHigherCount >= 3 ? 'high' : 'medium',
      description: 'Pattern of selling a stock and then buying it back at a higher price.',
      evidence: `Found ${rebuyHigherCount} instances of selling then rebuying at a higher price across ${rebuySymbols.length} stock(s): ${rebuySymbols.join(', ')}. This "sell low, buy high" pattern suggests emotional decision-making.`,
      suggestion: 'Before rebuying a stock you\'ve sold, wait at least 48 hours and write down your thesis. If it\'s driven by "I missed the move," that\'s a red flag.',
    };
  }

  return null;
}

function detectHomeBias(holdings: Holding[], totalValue: number): BehavioralBias | null {
  if (totalValue === 0 || holdings.length === 0) return null;

  const canadianValue = holdings
    .filter(h => h.symbol.endsWith('.TO') || h.symbol.endsWith('.V'))
    .reduce((sum, h) => sum + h.currentValue, 0);

  const canadianPct = (canadianValue / totalValue) * 100;

  if (canadianPct > 80 && holdings.length >= 3) {
    return {
      name: 'Home Bias',
      severity: canadianPct > 90 ? 'medium' : 'low',
      description: 'Your portfolio is heavily weighted towards Canadian-listed stocks.',
      evidence: `${canadianPct.toFixed(0)}% of your portfolio is in Canadian-listed securities. Canada represents only ~3% of global market capitalization.`,
      suggestion: 'Consider whether some US or international ETF exposure might improve diversification. Products like VFV.TO (S&P 500) or XAW.TO (All-World ex-Canada) can provide global exposure while still trading on the TSX.',
    };
  }

  return null;
}

function detectRepeatTrading(trades: ParsedTrade[]): BehavioralBias | null {
  const symbolCounts = new Map<string, { buys: number; sells: number }>();

  trades.forEach(t => {
    if (t.transactionType === 'dividend') return;
    const counts = symbolCounts.get(t.symbol) || { buys: 0, sells: 0 };
    if (t.transactionType === 'buy') counts.buys++;
    if (t.transactionType === 'sell') counts.sells++;
    symbolCounts.set(t.symbol, counts);
  });

  const repeatOffenders = Array.from(symbolCounts.entries())
    .filter(([_, counts]) => counts.buys >= 3 && counts.sells >= 2)
    .map(([symbol, counts]) => ({ symbol, ...counts }));

  if (repeatOffenders.length >= 1) {
    const top = repeatOffenders[0];
    return {
      name: 'Repeat Trading Pattern',
      severity: repeatOffenders.length >= 2 ? 'medium' : 'low',
      description: 'Repeatedly buying and selling the same stocks, suggesting indecision or emotional attachment.',
      evidence: `${top.symbol}: ${top.buys} buys and ${top.sells} sells. ${repeatOffenders.length > 1 ? `${repeatOffenders.length} stocks show this pattern: ${repeatOffenders.map(r => r.symbol).join(', ')}.` : ''}`,
      suggestion: 'Multiple round-trips in the same stock often indicate an emotional relationship with the position. Consider building a clear investment thesis before entering, and define your exit criteria upfront.',
    };
  }

  return null;
}
