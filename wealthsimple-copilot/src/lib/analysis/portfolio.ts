import { ParsedTrade, Holding, ClosedPosition } from '@/types/trade';
import { PortfolioSummary, AccountBreakdown, TopHolding } from '@/types/portfolio';
import { daysBetween } from '@/lib/utils/format';
import { USD_TO_CAD_APPROX } from '@/lib/utils/constants';

interface PositionTracker {
  symbol: string;
  quantity: number;
  totalCost: number;
  accountType: string;
  currency: string;
  lastPrice: number;
  buys: { date: string; quantity: number; price: number }[];
}

export function analyzePortfolio(trades: ParsedTrade[]): PortfolioSummary {
  const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date));

  const positions: Map<string, PositionTracker> = new Map();
  const closedPositions: ClosedPosition[] = [];
  let totalDividends = 0;

  for (const trade of sorted) {
    const key = `${trade.symbol}:${trade.accountType}`;
    const cadMultiplier = trade.currency === 'USD' ? USD_TO_CAD_APPROX : 1;

    if (trade.transactionType === 'dividend') {
      totalDividends += trade.amount * cadMultiplier;
      continue;
    }

    if (trade.transactionType === 'buy') {
      const existing = positions.get(key);
      if (existing) {
        existing.totalCost += trade.quantity * trade.price * cadMultiplier;
        existing.quantity += trade.quantity;
        existing.lastPrice = trade.price * cadMultiplier;
        existing.buys.push({ date: trade.date, quantity: trade.quantity, price: trade.price * cadMultiplier });
      } else {
        positions.set(key, {
          symbol: trade.symbol,
          quantity: trade.quantity,
          totalCost: trade.quantity * trade.price * cadMultiplier,
          accountType: trade.accountType,
          currency: trade.currency,
          lastPrice: trade.price * cadMultiplier,
          buys: [{ date: trade.date, quantity: trade.quantity, price: trade.price * cadMultiplier }],
        });
      }
    }

    if (trade.transactionType === 'sell') {
      const existing = positions.get(key);
      if (existing && existing.quantity > 0) {
        const avgCost = existing.totalCost / existing.quantity;
        const sellPrice = trade.price * cadMultiplier;
        const gain = (sellPrice - avgCost) * trade.quantity;
        const gainPct = ((sellPrice - avgCost) / avgCost) * 100;

        // Find the earliest buy for hold time calculation
        const earliestBuy = existing.buys[0];
        const holdDays = earliestBuy ? daysBetween(earliestBuy.date, trade.date) : 0;

        closedPositions.push({
          symbol: trade.symbol,
          buyDate: earliestBuy?.date || '',
          sellDate: trade.date,
          quantity: trade.quantity,
          buyPrice: avgCost,
          sellPrice: sellPrice,
          gain,
          gainPct,
          holdDays,
          accountType: trade.accountType as any,
        });

        // Reduce position
        const costReduction = avgCost * trade.quantity;
        existing.totalCost -= costReduction;
        existing.quantity -= trade.quantity;
        existing.lastPrice = sellPrice;

        // Remove fulfilled buys
        let remaining = trade.quantity;
        while (remaining > 0 && existing.buys.length > 0) {
          const buy = existing.buys[0];
          if (buy.quantity <= remaining) {
            remaining -= buy.quantity;
            existing.buys.shift();
          } else {
            buy.quantity -= remaining;
            remaining = 0;
          }
        }

        if (existing.quantity <= 0) {
          positions.delete(key);
        }
      }
    }
  }

  // Build holdings from remaining positions
  const holdings: Holding[] = [];
  positions.forEach((pos) => {
    if (pos.quantity > 0) {
      const avgCost = pos.totalCost / pos.quantity;
      const currentValue = pos.quantity * pos.lastPrice;
      const unrealizedGain = currentValue - pos.totalCost;
      const unrealizedGainPct = (unrealizedGain / pos.totalCost) * 100;

      holdings.push({
        symbol: pos.symbol,
        quantity: pos.quantity,
        acb: pos.totalCost,
        averageCost: avgCost,
        currentPrice: pos.lastPrice,
        currentValue,
        unrealizedGain,
        unrealizedGainPct,
        accountType: pos.accountType as any,
        currency: pos.currency as any,
      });
    }
  });

  // Calculate summary stats
  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const realizedGains = closedPositions.filter(p => p.gain > 0).reduce((sum, p) => sum + p.gain, 0);
  const realizedLosses = closedPositions.filter(p => p.gain < 0).reduce((sum, p) => sum + p.gain, 0);
  const winCount = closedPositions.filter(p => p.gain > 0).length;
  const winRate = closedPositions.length > 0 ? (winCount / closedPositions.length) * 100 : 0;
  const avgHoldDays = closedPositions.length > 0
    ? closedPositions.reduce((sum, p) => sum + p.holdDays, 0) / closedPositions.length
    : 0;

  // Account breakdown
  const accountMap = new Map<string, number>();
  holdings.forEach(h => {
    const current = accountMap.get(h.accountType) || 0;
    accountMap.set(h.accountType, current + h.currentValue);
  });
  const accountBreakdown: AccountBreakdown[] = Array.from(accountMap.entries()).map(([type, value]) => ({
    type: type as any,
    value,
    pct: totalValue > 0 ? Math.round((value / totalValue) * 100) : 0,
  }));

  // Top holdings
  const topHoldings: TopHolding[] = holdings
    .sort((a, b) => b.currentValue - a.currentValue)
    .slice(0, 10)
    .map(h => ({
      symbol: h.symbol,
      pct: totalValue > 0 ? Math.round((h.currentValue / totalValue) * 1000) / 10 : 0,
      value: h.currentValue,
    }));

  return {
    totalValue,
    holdingCount: holdings.length,
    tradeCount: trades.length,
    firstTradeDate: sorted[0]?.date || '',
    lastTradeDate: sorted[sorted.length - 1]?.date || '',
    realizedGains,
    realizedLosses,
    netRealizedPL: realizedGains + realizedLosses,
    winRate: Math.round(winRate * 10) / 10,
    avgHoldDays: Math.round(avgHoldDays),
    totalDividends,
    accountBreakdown,
    topHoldings,
    holdings,
    closedPositions,
  };
}
