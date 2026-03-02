# Architecture — Wealthsimple Copilot Pre-Trade Committee

## Overview

Four specialized AI agents analyze a proposed trade in parallel. A fifth synthesis agent reads all four outputs and produces a structured Pre-Trade Brief. The human reviews the brief and makes the final call.

```
User describes trade (natural language)
           │
           ▼
  ┌─────────────────┐
  │  /api/committee │  ← NextRequest, agent field selects which agent runs
  └─────────────────┘
           │
     ┌─────┴──────────────────────────────────┐
     │             Parallel (4 fetch calls)   │
     ▼             ▼             ▼            ▼
Portfolio     Behavioral    Devil's       Tax Impact
Impact        Risk          Advocate      Analyst
Agent         Agent         Agent         Agent
     │             │             │            │
     └─────────────┴─────────────┴────────────┘
                         │
                         ▼
               Synthesis Agent
               (reads all 4 outputs)
                         │
                         ▼
              Pre-Trade Brief
        🟢 PROCEED / 🟡 CAUTION / 🔴 HIGH RISK
```

## Why separate agents (not one LLM call)?

A single LLM asked to "analyze this trade from all angles" anchors early in its response and produces blended, averaged output. Specialized agents with adversarial roles produce sharper thinking:

- **Portfolio Agent** cannot soften a concern because it's focused only on math — it doesn't know what the behavioral agent will say
- **Devil's Advocate** is explicitly instructed to argue against the trade regardless of merit — this role cannot exist in a single balanced response
- **Behavioral Agent** has the full detected bias list injected into context; a monolithic agent would underweight this vs. general analysis
- **Synthesis Agent** reads fully-formed arguments, not fragments — it synthesizes competing views rather than generating them from scratch

## Data flow

```
CSV upload (ParsedTrade[])
       │
       ▼ analyzePortfolio()
  PortfolioSummary
  (holdings, closedPositions, totalValue, ...)
       │
       ├──▶ detectBiases() → BehavioralBias[]  (→ Behavioral Agent context)
       ├──▶ buildPortfolioContext()            (→ all agents)
       └──▶ raw ParsedTrade[]                 (→ Tax Agent for ACB lookups)
```

## Parallel streaming

`CommitteeView.tsx` makes 4 concurrent fetch calls, each returning a `ReadableStream`. Each stream updates its own React state slice as chunks arrive, producing the "4 cards streaming simultaneously" effect.

```typescript
// CommitteeView.tsx — simplified
const [portfolioOut, behavioralOut, devilsOut, taxOut] = await Promise.all([
  streamAgent('portfolio', trade, controllers[0]),
  streamAgent('behavioral', trade, controllers[1]),
  streamAgent('devils-advocate', trade, controllers[2]),
  streamAgent('tax', trade, controllers[3]),
]);
// Only then run synthesis with all 4 outputs
await streamAgent('synthesis', trade, controllers[4], { portfolioOut, ... });
```

Each `streamAgent` call reads from `response.body.getReader()` and appends to `agentOutputs[agent]` state on each chunk.

## Behavioral personalization

The behavioral agent is the most novel component. Its user message includes:

1. **Full portfolio context** (holdings, closed positions, account breakdown)
2. **Pre-computed bias analysis** from `detectBiases()` with specific evidence strings — e.g., "You sold SHOP.TO after 23 days at a gain on 2023-05-08 — this fits your disposition effect pattern"
3. **Complete closed position history** with dates, prices, hold days, and P&L

This means when a user describes "I'm thinking about selling LSPD.TO", the behavioral agent can say: *"This matches your Loss Aversion pattern — LSPD.TO is currently at -48% and you've held it for 298 days. The last time you held a similar loser through a drawdown (BB.TO, 298 days, -23%), you eventually sold at a loss anyway."*

The AI cites specific trades from the user's actual data, not generic advice.

## Sample portfolio design

`src/lib/data/sample-portfolio.ts` contains 40 engineered trades for "Alex Chen" designed to trigger every behavioral detector:

| Detector | Trigger mechanism |
|----------|------------------|
| Disposition Effect (HIGH) | Winners avg 22 days (SHOP.TO, NVDA), losers avg 236 days (LSPD.TO, BB.TO, BITF.TO) |
| Overconcentration (HIGH) | QQQ in RRSP = ~38% of total portfolio |
| FOMO / Chase | Sold SHOP.TO@$93→rebought@$115; RY.TO@$118→$127; TD.TO@$83→$89 |
| Loss Aversion (HIGH) | LSPD.TO -48% unrealized, BITF.TO -47% unrealized (both still held) |
| Repeat Trading | AC.TO: 3 buys, 2 sells |
| Tax harvest | BITF.TO: $320 unrealized loss, NON-REG, last bought >30 days ago |

## Security

- **No data stored server-side.** Portfolio CSV data exists only in browser memory and is sent per-request to the API. Nothing is persisted.
- **No auth required** (demo tool). Rate limiting (20 req/min/IP) prevents abuse.
- **All analysis is in-memory** per request. The Next.js API route computes portfolio analysis on each call.

## Rate limiting

`src/lib/utils/rate-limiter.ts` implements a sliding window rate limiter (20 req/min per IP) using an in-memory Map. This works for single-instance deployments. For production multi-instance, replace with a Redis-backed store (e.g., `@upstash/ratelimit`).

## Human decision boundary

The synthesis agent always ends with explicit statements of what the AI cannot know:
- The investor's personal investment thesis
- Liquidity needs and cash flow situation
- Full financial picture beyond the uploaded CSV
- Risk tolerance and time horizon

Trade execution always remains with the human. The committee is a deliberation tool, not a directive.
