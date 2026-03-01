import { PortfolioSummary } from '@/types/portfolio';
import { formatCurrency, formatPercent } from '@/lib/utils/format';

export function buildPortfolioContext(summary: PortfolioSummary): string {
  let context = `## User's Portfolio Context\n\n`;

  context += `**Portfolio Overview:**\n`;
  context += `- Total portfolio value: ${formatCurrency(summary.totalValue)}\n`;
  context += `- Number of holdings: ${summary.holdingCount}\n`;
  context += `- Total trades analyzed: ${summary.tradeCount}\n`;
  context += `- Date range: ${summary.firstTradeDate} to ${summary.lastTradeDate}\n\n`;

  context += `**Account Breakdown:**\n`;
  for (const account of summary.accountBreakdown) {
    context += `- ${account.type}: ${formatCurrency(account.value)} (${account.pct}%)\n`;
  }
  context += '\n';

  context += `**Top Holdings (by allocation):**\n`;
  for (const holding of summary.topHoldings) {
    context += `- ${holding.symbol}: ${holding.pct}% (${formatCurrency(holding.value)})\n`;
  }
  context += '\n';

  context += `**Performance Summary:**\n`;
  context += `- Total realized gains: ${formatCurrency(summary.realizedGains)}\n`;
  context += `- Total realized losses: ${formatCurrency(summary.realizedLosses)}\n`;
  context += `- Net realized P&L: ${formatCurrency(summary.netRealizedPL)}\n`;
  context += `- Win rate (closed positions): ${summary.winRate}%\n`;
  context += `- Average hold time: ${summary.avgHoldDays} days\n`;
  context += `- Total dividends received: ${formatCurrency(summary.totalDividends)}\n\n`;

  context += `**Current Holdings Detail:**\n`;
  for (const h of summary.holdings) {
    context += `- ${h.symbol} (${h.accountType}): ${h.quantity} shares, ACB ${formatCurrency(h.acb)}, Current ~${formatCurrency(h.currentValue)}, Unrealized ${formatPercent(h.unrealizedGainPct)}\n`;
  }
  context += '\n';

  if (summary.closedPositions.length > 0) {
    context += `**Closed Positions (Recent):**\n`;
    const recent = summary.closedPositions.slice(-10);
    for (const p of recent) {
      context += `- ${p.symbol}: Bought ${p.buyDate} at ${formatCurrency(p.buyPrice)}, Sold ${p.sellDate} at ${formatCurrency(p.sellPrice)}, P&L ${formatCurrency(p.gain)} (${formatPercent(p.gainPct)}), held ${p.holdDays} days (${p.accountType})\n`;
    }
  }

  return context;
}
