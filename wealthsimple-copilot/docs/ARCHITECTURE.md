# Technical Architecture: Wealthsimple Copilot

## System Overview

```
┌──────────────────────────────────────────────────────┐
│                    Client (Browser)                    │
│                                                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  CSV Upload  │  │   Chat UI    │  │  Dashboard   │ │
│  │  + Parser    │  │  (Streaming) │  │  + Cards     │ │
│  └──────┬──────┘  └──────┬───────┘  └──────────────┘ │
│         │                │                             │
│         ▼                ▼                             │
│  ┌─────────────────────────────────────┐              │
│  │     React State (Portfolio Data,    │              │
│  │     Conversation History, Module)   │              │
│  └─────────────────┬───────────────────┘              │
└─────────────────────┼──────────────────────────────────┘
                      │ HTTP POST (streaming)
                      ▼
┌──────────────────────────────────────────────────────┐
│                  Next.js API Routes                   │
│                                                        │
│  ┌──────────────────────────────────────────────┐     │
│  │              Agent Router                      │     │
│  │  - Classifies intent from user message         │     │
│  │  - Selects appropriate module                  │     │
│  │  - Injects relevant context                    │     │
│  └──────────┬──────────┬──────────┬─────────────┘     │
│             │          │          │                     │
│             ▼          ▼          ▼                     │
│  ┌──────────────┐ ┌─────────┐ ┌──────────┐           │
│  │Trading Coach │ │  Tax    │ │ General  │           │
│  │   Module     │ │Optimizer│ │  Chat    │           │
│  └──────┬───────┘ └────┬────┘ └────┬─────┘           │
│         │              │           │                   │
│         └──────────────┴───────────┘                   │
│                        │                               │
│                        ▼                               │
│              ┌──────────────────┐                      │
│              │  Claude API      │                      │
│              │  (Anthropic)     │                      │
│              └──────────────────┘                      │
└──────────────────────────────────────────────────────┘
```

## Agent Router Pattern

The router is the brain of the system. It decides which module handles each user message.

```typescript
// Simplified router logic
async function routeMessage(message: string, context: AgentContext): Promise<ModuleResponse> {

  // Step 1: Classify intent
  // This can be done with a fast LLM call or keyword matching for speed
  const intent = await classifyIntent(message, context);

  // Step 2: Select module
  switch (intent.module) {
    case 'trading-coach':
      return tradingCoachModule.handle(message, context);
    case 'tax-optimizer':
      return taxOptimizerModule.handle(message, context);
    case 'general':
      return generalChatModule.handle(message, context);
    default:
      return generalChatModule.handle(message, context);
  }
}
```

### Intent Classification Strategy

For MVP speed, use a **hybrid approach**:
1. **Keyword matching first** (fast, no API call): If message contains "tax", "harvest", "capital gains" → tax module. If "buy", "sell", "trade", "portfolio", "bias" → trading coach.
2. **LLM fallback** for ambiguous messages: Quick classification call to Claude.

This avoids burning an API call on every message just for routing.

## Data Flow

### CSV Upload Flow

```
User selects CSV file
        │
        ▼
Client-side: PapaParse reads CSV
        │
        ▼
Client-side: Validate + normalize columns
  Expected columns from WS export:
  - Date, Transaction Type, Symbol, Quantity,
  - Price, Amount, Currency, Account Type
        │
        ▼
Client-side: Store parsed trades in React state
        │
        ▼
Send to /api/analyze for initial analysis
        │
        ▼
Server: Build portfolio snapshot from trades
  - Calculate current holdings (buys - sells)
  - Calculate ACB per holding
  - Calculate realized gains/losses
  - Calculate unrealized gains/losses (use last trade price as proxy)
  - Compute sector/geography allocation
        │
        ▼
Server: Send to Claude with trading-coach prompt
        │
        ▼
Stream response back to client
```

### Conversational Flow

```
User types message
        │
        ▼
Client sends: { message, conversationHistory, portfolioData, activeModule }
        │
        ▼
Server: Router classifies intent
        │
        ▼
Server: Selected module builds prompt:
  - System prompt (module-specific)
  - Shared context (portfolio summary, key metrics)
  - Conversation history
  - Current user message
        │
        ▼
Server: Call Claude API with streaming
        │
        ▼
Server: Stream response chunks via SSE
        │
        ▼
Client: Render streaming text + parse structured blocks
```

## Key Types

```typescript
// Core trade type (parsed from WS CSV)
interface ParsedTrade {
  date: string;           // ISO date
  type: 'buy' | 'sell' | 'dividend' | 'deposit' | 'withdrawal';
  symbol: string;         // e.g., "SHOP.TO", "VFV.TO", "AAPL"
  quantity: number;
  price: number;
  amount: number;         // total value
  currency: 'CAD' | 'USD';
  accountType: 'TFSA' | 'RRSP' | 'NON-REG' | 'FHSA' | 'RESP';
}

// Portfolio holding (computed from trades)
interface Holding {
  symbol: string;
  quantity: number;
  acb: number;            // Adjusted Cost Base
  currentValue: number;   // Last known price × quantity
  unrealizedGain: number;
  unrealizedGainPct: number;
  accountType: string;
  allocationPct: number;  // % of total portfolio
}

// Behavioral bias detected by AI
interface BehavioralBias {
  name: string;           // e.g., "Disposition Effect"
  severity: 'low' | 'medium' | 'high';
  description: string;
  evidence: string;       // Specific examples from their trades
  suggestion: string;
}

// Tax harvesting candidate
interface HarvestCandidate {
  symbol: string;
  unrealizedLoss: number;
  estimatedTaxSaving: number;
  accountType: string;
  superficialLossRisk: boolean;  // Did they buy this in last 30 days?
  notes: string;
}

// Agent context passed to all modules
interface AgentContext {
  portfolioData: ParsedTrade[];
  holdings: Holding[];
  portfolioSummary: PortfolioSummary;
  conversationHistory: Message[];
  activeModule: string;
}

// Chat message
interface Message {
  role: 'user' | 'assistant';
  content: string;
  module?: string;        // Which module generated this
  structured?: any;       // Structured data (bias cards, harvest candidates, etc.)
  timestamp: string;
}

// Portfolio summary (precomputed, injected into prompts)
interface PortfolioSummary {
  totalValue: number;
  totalRealizedGains: number;
  totalRealizedLosses: number;
  totalDividends: number;
  holdingCount: number;
  topHoldings: { symbol: string; pct: number }[];
  accountBreakdown: { type: string; value: number }[];
  tradeCount: number;
  dateRange: { first: string; last: string };
  winRate: number;        // % of closed positions with positive return
  avgHoldDays: number;
}
```

## Streaming Response Format

The API streams text but can include structured blocks using XML-style markers that the client parses:

```
Here's what I found in your trading history...

<insight type="bias" severity="high">
{
  "name": "Disposition Effect",
  "description": "You tend to sell winners quickly while holding losers for extended periods.",
  "evidence": "You sold SHOP after a 12% gain (held 8 days) but held AC through a 34% decline (held 147 days).",
  "suggestion": "Consider setting target prices for both gains AND losses before entering a trade."
}
</insight>

You also show signs of concentration risk...

<insight type="portfolio" severity="medium">
{
  "name": "Sector Concentration",
  "description": "62% of your portfolio is in Canadian financial stocks.",
  "evidence": "RY.TO (18%), TD.TO (16%), BNS.TO (14%), BMO.TO (8%), CM.TO (6%)",
  "suggestion": "Consider diversifying into other sectors or geographies to reduce correlation risk."
}
</insight>
```

The client parses these blocks and renders them as visual cards inline with the chat text.

## Deployment Architecture (Digital Ocean)

### App Platform (Recommended)

```
GitHub Repo ──push──▶ DO App Platform
                            │
                            ▼
                     ┌──────────────┐
                     │  Next.js App  │
                     │  (Container)  │
                     │  Port 3000    │
                     └──────┬───────┘
                            │
                            ▼
                     Anthropic API
                     (External)
```

- No database needed
- No persistent storage needed
- Single container deployment
- Auto-SSL via App Platform

### Environment:
```
ANTHROPIC_API_KEY=sk-ant-...
NODE_ENV=production
```

## Performance Considerations

1. **CSV parsing is client-side** — no upload latency, no server storage needed
2. **Streaming responses** — user sees output immediately, doesn't wait for full completion
3. **Context window management** — for large portfolios, summarize holdings rather than sending every trade. Keep the prompt under 50K tokens.
4. **Rate limiting** — add a simple in-memory rate limiter on the API route (max 10 requests/min per session) to prevent accidental cost overrun during demo
