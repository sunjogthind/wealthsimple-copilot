import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { analyzePortfolio } from '@/lib/analysis/portfolio';
import { detectBiases } from '@/lib/analysis/behaviors';
import { buildPortfolioContext } from '@/lib/agent/context';
import { CommitteeRequest, AgentRole } from '@/types/committee';
import { BehavioralBias } from '@/types/portfolio';
import { checkRateLimit } from '@/lib/utils/rate-limiter';
import { formatCurrency, formatPercent } from '@/lib/utils/format';

const MODEL = 'claude-sonnet-4-6';

// ── Agent system prompts ─────────────────────────────────────────────────────

const PORTFOLIO_SYSTEM = `You are the Portfolio Impact Analyst on a pre-trade review committee for a Canadian retail investor.
Given the investor's current portfolio and a proposed trade, analyze:
- How this changes their concentration (any holding moving above 15% of total portfolio is notable; above 30% is high risk)
- How this changes sector and geography exposure
- Whether this increases or decreases overall diversification
- Net position change in CAD (note if USD/CAD conversion applies)
- Account type suitability (TFSA = tax-free, RRSP = tax-deferred, NON-REG = taxable)

Be specific — use numbers from their actual portfolio. Write 2-3 short paragraphs.
Never give a buy/sell recommendation. You analyze impact only.
Use markdown formatting. Be direct and quantitative.`;

const BEHAVIORAL_SYSTEM = `You are the Behavioral Risk Analyst on a pre-trade review committee for a Canadian retail investor.
You have been given the investor's full trade history AND a list of behavioral patterns already detected from that history.

Your job: determine whether this proposed trade matches any of the investor's known behavioral patterns.

If it does, cite SPECIFIC HISTORICAL EXAMPLES from their data:
- Reference actual trades by date, price, and outcome
- Show the pattern with numbers ("You sold X on [date] after only Y days at a gain — this matches your disposition effect where winners are held an average of Z days")
- Quantify the risk where possible ("The last 2 times you made a similar move, the position went on to gain X% in the following 30 days")

If no biases apply to this specific trade, say so clearly and explain why.
Be direct and evidence-based, not generic. Avoid saying "you might want to consider" — state what the data shows.
Write 2-4 paragraphs. Use markdown. Lead with the most important behavioral risk.`;

const DEVILS_ADVOCATE_SYSTEM = `You are the Devil's Advocate on a pre-trade review committee.
Your ONLY job: make the strongest possible case AGAINST the proposed trade.
Even if you personally think it's a fine trade, argue against it rigorously.

Cover at minimum:
- Timing risk and what could go wrong with market conditions
- What assumptions the trade thesis requires to be true, and how they could fail
- What the investor might be missing or underweighting
- Structural risks (liquidity, currency, sector concentration, macro factors)

Write 3-5 bullet points of hard-hitting, specific concerns.
Be intellectually honest, not alarmist — ground concerns in real risk factors.
Use markdown bullet list format.`;

const TAX_SYSTEM = `You are the Tax Impact Analyst on a pre-trade review committee for a Canadian investor.
Analyze the Canadian tax consequences of this proposed trade.

Always check the account type first:
- TFSA / RRSP / FHSA: State explicitly that there is NO tax event on capital gains. Still note any contribution room implications.
- NON-REG: Calculate the estimated capital gain or loss using the investor's ACB from their trade history.

For NON-REG positions:
- Estimate the capital gain/loss = (current price − ACB) × quantity
- Tax cost: gain × 50% inclusion rate × 45% marginal tax rate (state this assumption)
- Flag the superficial loss rule if they plan to rebuy within 30 days of a loss sale
- Note if timing matters (cross-year deferral, realized losses to offset gains)

If the security is not in their holdings, explain general Canadian tax principles for that trade type.
Always include a disclaimer that this is an estimate and they should consult a tax professional.
Be precise with numbers. Use markdown formatting.`;

const SYNTHESIS_SYSTEM = `You are the Chair of a pre-trade review committee. You have received analysis from 4 specialists:
a Portfolio Impact Analyst, a Behavioral Risk Analyst, a Devil's Advocate, and a Tax Impact Analyst.

Synthesize their findings into a final brief using EXACTLY this structure:

**SIGNAL:** Start with exactly one of: 🟢 PROCEED / 🟡 CAUTION / 🔴 HIGH RISK
Choose based on the weight of concerns across all 4 analysts. Use 🔴 if behavioral biases AND portfolio concentration are both flagged. Use 🟡 for moderate concerns. Use 🟢 only if all analysts are relatively neutral.

**PRIMARY CONCERN:** One sentence — the single most important thing this investor must weigh before deciding.

**SYNTHESIS:** 2-3 sentences integrating the key findings across all 4 analyst perspectives.

**WHAT THIS AI CANNOT KNOW:**
- [Bullet 1: their personal investment thesis for this trade]
- [Bullet 2: their liquidity needs and cash flow situation]
- [Bullet 3: their risk tolerance and portfolio timeline]

**THE DECISION IS YOURS:** One closing sentence affirming that the execution decision belongs entirely to the human investor, and that this analysis is a tool for reflection — not a directive.`;

// ── Helper: build context strings ────────────────────────────────────────────

function buildBiasContext(biases: BehavioralBias[]): string {
  if (biases.length === 0) return 'No behavioral biases detected in this investor\'s trade history.';

  let ctx = `## Detected Behavioral Biases\n\n`;
  for (const bias of biases) {
    ctx += `### ${bias.name} (${bias.severity} severity)\n`;
    ctx += `${bias.description}\n\n`;
    ctx += `**Evidence:** ${bias.evidence}\n\n`;
    ctx += `**Suggestion:** ${bias.suggestion}\n\n`;
  }
  return ctx;
}

function buildTradeHistoryContext(trades: ReturnType<typeof analyzePortfolio>): string {
  let ctx = `## Trade History Summary\n\n`;
  ctx += `- Total trades: ${trades.tradeCount}\n`;
  ctx += `- Date range: ${trades.firstTradeDate} to ${trades.lastTradeDate}\n`;
  ctx += `- Closed positions: ${trades.closedPositions.length}\n`;
  ctx += `- Win rate: ${trades.winRate}%\n`;
  ctx += `- Average hold time: ${trades.avgHoldDays} days\n\n`;

  if (trades.closedPositions.length > 0) {
    ctx += `## All Closed Positions\n`;
    for (const p of trades.closedPositions) {
      const pnlLabel = p.gain >= 0 ? 'WINNER' : 'LOSER';
      ctx += `- ${p.symbol} (${p.accountType}): Bought ${p.buyDate} @ ${formatCurrency(p.buyPrice)}, Sold ${p.sellDate} @ ${formatCurrency(p.sellPrice)} — P&L ${formatCurrency(p.gain)} (${formatPercent(p.gainPct)}), held ${p.holdDays} days [${pnlLabel}]\n`;
    }
    ctx += '\n';
  }

  return ctx;
}

// ── Streaming helper ─────────────────────────────────────────────────────────

function createStream(client: Anthropic, systemPrompt: string, userMessage: string): ReadableStream {
  const anthropicStream = client.messages.stream({
    model: MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of anthropicStream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

// ── Agent handlers ───────────────────────────────────────────────────────────

function streamPortfolioAgent(
  tradeDescription: string,
  portfolioContext: string
): ReadableStream {
  const client = new Anthropic();
  const userMessage = `${portfolioContext}\n\n## Proposed Trade\n\n${tradeDescription}\n\nAnalyze the portfolio impact of this trade.`;
  return createStream(client, PORTFOLIO_SYSTEM, userMessage);
}

function streamBehavioralAgent(
  tradeDescription: string,
  portfolioContext: string,
  biasContext: string,
  tradeHistoryContext: string
): ReadableStream {
  const client = new Anthropic();
  const userMessage = `${portfolioContext}\n\n${biasContext}\n\n${tradeHistoryContext}\n\n## Proposed Trade\n\n${tradeDescription}\n\nDoes this proposed trade match any of the investor's known behavioral patterns? Reference specific historical trades by date and price.`;
  return createStream(client, BEHAVIORAL_SYSTEM, userMessage);
}

function streamDevilsAgent(
  tradeDescription: string,
  portfolioContext: string
): ReadableStream {
  const client = new Anthropic();
  const userMessage = `${portfolioContext}\n\n## Proposed Trade\n\n${tradeDescription}\n\nMake the strongest possible case against this trade.`;
  return createStream(client, DEVILS_ADVOCATE_SYSTEM, userMessage);
}

function streamTaxAgent(
  tradeDescription: string,
  portfolioContext: string
): ReadableStream {
  const client = new Anthropic();
  const userMessage = `${portfolioContext}\n\n## Proposed Trade\n\n${tradeDescription}\n\nAnalyze the Canadian tax consequences of this trade. Look up the relevant security in the portfolio data above.`;
  return createStream(client, TAX_SYSTEM, userMessage);
}

function streamSynthesisAgent(
  tradeDescription: string,
  agentOutputs: Record<string, string>
): ReadableStream {
  const client = new Anthropic();
  const userMessage = `## Proposed Trade
${tradeDescription}

## Portfolio Impact Analyst
${agentOutputs['portfolio'] ?? 'No analysis available.'}

## Behavioral Risk Analyst
${agentOutputs['behavioral'] ?? 'No analysis available.'}

## Devil's Advocate
${agentOutputs['devils-advocate'] ?? 'No analysis available.'}

## Tax Impact Analyst
${agentOutputs['tax'] ?? 'No analysis available.'}

Synthesize these findings into the final Pre-Trade Brief using the required structure.`;
  return createStream(client, SYNTHESIS_SYSTEM, userMessage);
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateCheck = checkRateLimit(req);
  if (!rateCheck.allowed) {
    const retryAfterSeconds = Math.ceil(rateCheck.retryAfterMs / 1000);
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please wait before running another analysis.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfterSeconds),
        },
      }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your-key-here') {
    return new Response(
      JSON.stringify({ error: 'Anthropic API key is not configured.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body: CommitteeRequest = await req.json();
    const { tradeDescription, portfolioData, agent, agentOutputs } = body;

    if (!tradeDescription || typeof tradeDescription !== 'string') {
      return new Response(JSON.stringify({ error: 'tradeDescription is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!agent || !['portfolio', 'behavioral', 'devils-advocate', 'tax', 'synthesis'].includes(agent)) {
      return new Response(JSON.stringify({ error: 'Invalid agent role' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build portfolio context (shared across all agents except synthesis)
    let portfolioContext = '';
    let biasContext = '';
    let tradeHistoryContext = '';

    if (portfolioData && portfolioData.length > 0) {
      const portfolioSummary = analyzePortfolio(portfolioData);
      portfolioContext = buildPortfolioContext(portfolioSummary);

      if (agent === 'behavioral') {
        const biases = detectBiases(
          portfolioData,
          portfolioSummary.holdings,
          portfolioSummary.closedPositions,
          portfolioSummary.totalValue
        );
        biasContext = buildBiasContext(biases);
        tradeHistoryContext = buildTradeHistoryContext(portfolioSummary);
      }
    } else {
      portfolioContext = 'No portfolio data provided. The investor has not uploaded their trade history.';
    }

    let stream: ReadableStream;

    switch (agent as AgentRole) {
      case 'portfolio':
        stream = streamPortfolioAgent(tradeDescription, portfolioContext);
        break;
      case 'behavioral':
        stream = streamBehavioralAgent(tradeDescription, portfolioContext, biasContext, tradeHistoryContext);
        break;
      case 'devils-advocate':
        stream = streamDevilsAgent(tradeDescription, portfolioContext);
        break;
      case 'tax':
        stream = streamTaxAgent(tradeDescription, portfolioContext);
        break;
      case 'synthesis':
        stream = streamSynthesisAgent(tradeDescription, agentOutputs ?? {});
        break;
      default:
        return new Response(JSON.stringify({ error: 'Unknown agent' }), { status: 400 });
    }

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Agent': agent,
      },
    });
  } catch (error) {
    console.error('Committee error:', error);
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
