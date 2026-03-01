import { ParsedTrade, Holding, ClosedPosition } from '@/types/trade';
import { TaxHarvestCandidate, TaxSummaryData } from '@/types/portfolio';
import {
  EFFECTIVE_CAPITAL_GAINS_RATE,
  SUPERFICIAL_LOSS_WINDOW_DAYS,
} from '@/lib/utils/constants';
import { daysBetween } from '@/lib/utils/format';

export function analyzeTax(
  trades: ParsedTrade[],
  holdings: Holding[],
  closedPositions: ClosedPosition[]
): { taxSummary: TaxSummaryData; harvestCandidates: TaxHarvestCandidate[] } {
  // Only consider NON-REG accounts for tax
  const nonRegClosed = closedPositions.filter(p => p.accountType === 'NON-REG');
  const nonRegHoldings = holdings.filter(h => h.accountType === 'NON-REG');
  const nonRegTrades = trades.filter(t => t.accountType === 'NON-REG');

  // Realized gains/losses YTD
  const currentYear = new Date().getFullYear().toString();
  const ytdClosed = nonRegClosed.filter(p => p.sellDate.startsWith(currentYear));

  const realizedGainsYTD = ytdClosed.filter(p => p.gain > 0).reduce((sum, p) => sum + p.gain, 0);
  const realizedLossesYTD = ytdClosed.filter(p => p.gain < 0).reduce((sum, p) => sum + p.gain, 0);
  const netTaxableGains = Math.max(0, realizedGainsYTD + realizedLossesYTD);
  const estimatedTaxOwing = netTaxableGains * EFFECTIVE_CAPITAL_GAINS_RATE;

  // Find harvest candidates (unrealized losses in non-reg)
  const harvestCandidates: TaxHarvestCandidate[] = [];

  for (const holding of nonRegHoldings) {
    if (holding.unrealizedGain < 0) {
      const unrealizedLoss = holding.unrealizedGain;
      const estimatedTaxSaving = Math.abs(unrealizedLoss) * EFFECTIVE_CAPITAL_GAINS_RATE;

      // Check superficial loss risk
      const recentTrades = nonRegTrades.filter(t =>
        t.symbol === holding.symbol &&
        t.transactionType === 'buy'
      );

      const today = new Date().toISOString().split('T')[0];
      const hasRecentBuy = recentTrades.some(t => {
        const daysSince = daysBetween(t.date, today);
        return daysSince <= SUPERFICIAL_LOSS_WINDOW_DAYS;
      });

      // Also check if there was a recent buy that would make a future sell superficial
      const lastBuy = recentTrades.sort((a, b) => b.date.localeCompare(a.date))[0];
      let superficialLossDetail = '';

      if (hasRecentBuy && lastBuy) {
        const buyDate = new Date(lastBuy.date);
        const safeDate = new Date(buyDate.getTime() + (SUPERFICIAL_LOSS_WINDOW_DAYS + 1) * 24 * 60 * 60 * 1000);
        superficialLossDetail = `You purchased ${holding.symbol} on ${lastBuy.date} — selling now could trigger the superficial loss rule. Consider waiting until ${safeDate.toISOString().split('T')[0]} to sell.`;
      }

      const sectorETFs: Record<string, string> = {
        'SHOP.TO': 'XIT.TO (tech ETF)',
        'LSPD.TO': 'XIT.TO (tech ETF)',
        'AC.TO': 'XIN.TO (industrials ETF)',
        'BITF.TO': 'BTCX.B (Bitcoin ETF)',
        'MARA': 'BTCX.B (Bitcoin ETF)',
        'TSLA': 'ZEV.TO (EV ETF)',
        'BB.TO': 'XIT.TO (tech ETF)',
      };

      const replacement = sectorETFs[holding.symbol];
      const notes = replacement
        ? `Consider replacing with a correlated ETF (e.g., ${replacement}) to maintain sector exposure while harvesting the loss.`
        : 'Consider replacing with a correlated ETF to maintain sector exposure while harvesting the loss.';

      harvestCandidates.push({
        symbol: holding.symbol,
        unrealizedLoss: unrealizedLoss,
        estimatedTaxSaving: Math.round(estimatedTaxSaving * 100) / 100,
        accountType: 'NON-REG',
        superficialLossRisk: hasRecentBuy,
        superficialLossDetail,
        notes,
      });
    }
  }

  // Sort by potential saving (largest first)
  harvestCandidates.sort((a, b) => b.estimatedTaxSaving - a.estimatedTaxSaving);

  const potentialHarvestSavings = harvestCandidates.reduce((sum, c) => sum + c.estimatedTaxSaving, 0);

  const taxSummary: TaxSummaryData = {
    realizedGainsYTD: Math.round(realizedGainsYTD * 100) / 100,
    realizedLossesYTD: Math.round(realizedLossesYTD * 100) / 100,
    netTaxableGains: Math.round(netTaxableGains * 100) / 100,
    estimatedTaxOwing: Math.round(estimatedTaxOwing * 100) / 100,
    potentialHarvestSavings: Math.round(potentialHarvestSavings * 100) / 100,
    taxOwingAfterHarvest: Math.round(Math.max(0, estimatedTaxOwing - potentialHarvestSavings) * 100) / 100,
  };

  return { taxSummary, harvestCandidates };
}
