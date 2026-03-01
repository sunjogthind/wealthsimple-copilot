# CLAUDE.md — AI-Assisted Development Guide

## Project: Wealthsimple Copilot

A modular AI financial copilot that lives inside a Wealthsimple-style interface. Built as a submission for Wealthsimple's AI Builders program.

**Deadline: March 2, 2026 11:59pm PT**

---

## What This Is

An AI-native financial agent with a conversational interface and modular capabilities. The user interacts with a single intelligent assistant ("Copilot") that can:

1. **Trading Coach** (MVP — fully functional) — Analyzes trade history, detects behavioral biases, does pre-trade sanity checks
2. **Tax Optimizer** (working stub) — Identifies tax-loss harvesting opportunities from portfolio data
3. **Migration Planner** (UI stub) — Helps users plan asset consolidation from other brokerages
4. **Smart Support** (UI stub) — Context-aware support that understands the user's account

The demo must show #1 fully working and #2 partially working. #3 and #4 should exist in the UI as visible but "coming soon" modules to show extensibility.

---

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514)
- **Deployment**: Digital Ocean App Platform (or Droplet with Docker)
- **State**: React state only (no database needed for MVP)
- **CSV Parsing**: PapaParse

---

## Project Structure

```
wealthsimple-copilot/
├── CLAUDE.md                    # This file
├── README.md                    # Project overview
├── docs/
│   ├── PRD.md                   # Product Requirements Document
│   ├── ARCHITECTURE.md          # Technical architecture
│   ├── SUBMISSION.md            # 500-word submission writeup
│   └── DEMO_SCRIPT.md           # Video demo script
├── prompts/
│   ├── router.md                # Agent router system prompt
│   ├── trading-coach.md         # Trading coach module prompt
│   ├── tax-optimizer.md         # Tax optimizer module prompt
│   └── shared-context.md        # Shared context injected into all modules
├── config/
│   └── mock-trades.csv          # Mock Wealthsimple trade data for demos
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout (Wealthsimple-inspired dark theme)
│   │   ├── page.tsx             # Landing / upload page
│   │   ├── globals.css          # Global styles
│   │   └── api/
│   │       ├── chat/
│   │       │   └── route.ts     # Main agent endpoint (router + module dispatch)
│   │       └── analyze/
│   │           └── route.ts     # CSV analysis endpoint
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx    # Main chat UI
│   │   │   ├── ChatMessage.tsx      # Individual message bubble
│   │   │   ├── ChatInput.tsx        # Input bar with file upload
│   │   │   └── ModuleIndicator.tsx  # Shows which module is active
│   │   ├── dashboard/
│   │   │   ├── CopilotDashboard.tsx # Main dashboard layout
│   │   │   ├── ModuleCards.tsx      # Module selection cards
│   │   │   ├── PortfolioSummary.tsx # Quick portfolio stats
│   │   │   └── InsightCard.tsx      # Individual insight display
│   │   ├── trading/
│   │   │   ├── TradeAnalysis.tsx    # Trading coach results
│   │   │   ├── BiasCard.tsx         # Behavioral bias display
│   │   │   └── PreTradeCheck.tsx    # Pre-trade check UI
│   │   ├── tax/
│   │   │   ├── TaxSummary.tsx       # Tax analysis results
│   │   │   └── HarvestCard.tsx      # Tax-loss harvesting opportunity
│   │   ├── upload/
│   │   │   └── CSVUpload.tsx        # File upload component
│   │   └── layout/
│   │       ├── Sidebar.tsx          # Module navigation
│   │       ├── Header.tsx           # Top bar
│   │       └── WealthsimpleLogo.tsx # Styled logo placeholder
│   ├── lib/
│   │   ├── agent/
│   │   │   ├── router.ts           # Intent classification + module dispatch
│   │   │   ├── modules/
│   │   │   │   ├── trading-coach.ts # Trading coach logic
│   │   │   │   ├── tax-optimizer.ts # Tax optimizer logic
│   │   │   │   └── types.ts        # Shared module types
│   │   │   └── context.ts          # Builds context from user data
│   │   ├── parsers/
│   │   │   └── csv-parser.ts       # Wealthsimple CSV parser
│   │   ├── analysis/
│   │   │   ├── portfolio.ts        # Portfolio calculations (P&L, allocation)
│   │   │   ├── behaviors.ts        # Behavioral pattern detection helpers
│   │   │   └── tax.ts              # Tax-related calculations (ACB, gains/losses)
│   │   └── utils/
│   │       ├── format.ts           # Currency, percentage formatting
│   │       └── constants.ts        # Canadian tax rates, thresholds
│   └── types/
│       ├── trade.ts                # Trade data types
│       ├── portfolio.ts            # Portfolio types
│       └── agent.ts                # Agent/module types
├── public/
│   └── ...                         # Static assets
├── Dockerfile                      # Docker config for deployment
├── docker-compose.yml              # Local dev with Docker
├── .env.example                    # Environment variables template
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── postcss.config.js
```

---

## Design System

The UI should feel like it belongs inside Wealthsimple's app. Reference their design:

- **Dark theme primary**: `#0a0a0a` background, `#171717` cards
- **Accent**: `#00d959` (Wealthsimple green) for positive values, CTAs
- **Red**: `#ff3b30` for losses, warnings
- **Text**: `#ffffff` primary, `#a1a1aa` secondary
- **Font**: Inter or system sans-serif
- **Border radius**: Rounded (`rounded-xl` for cards, `rounded-full` for pills)
- **Spacing**: Generous whitespace, clean minimalist layout
- **Chat bubbles**: User messages right-aligned (dark), Copilot messages left-aligned (slightly lighter bg)

The overall vibe: premium, calm, trustworthy. NOT a typical chatbot. Think of it as Bloomberg Terminal meets a thoughtful AI assistant.

---

## Critical Build Rules

1. **Never mock the AI responses.** The LLM must actually analyze the data. Hardcoded responses will fail the evaluation.
2. **The chat must be conversational.** Not just "upload → results." The user should be able to ask follow-up questions.
3. **Module extensibility must be visible.** The sidebar/UI should show all 4 modules even if only 1-2 work.
4. **Human boundary must be explicit in the UI.** When the copilot makes a recommendation, there should be a clear "This is a recommendation — you decide" framing. Never say "you should buy/sell X."
5. **Canadian context.** Use CAD ($), Canadian tax rules (TFSA, RRSP, superficial loss rule), Canadian tickers (TSX).
6. **Error handling matters.** If the CSV is malformed or the API fails, show a helpful message, don't crash.

---

## Environment Variables

```
ANTHROPIC_API_KEY=your-key-here
NEXT_PUBLIC_APP_NAME=Wealthsimple Copilot
```

---

## Key Workflows to Implement

### Flow 1: First-Time Upload + Trading Coach Analysis
1. User lands on dashboard, sees module cards
2. Clicks "Trading Coach" or uploads CSV directly
3. CSV is parsed client-side, validated, structured
4. Structured trade data sent to `/api/analyze`
5. API builds context, calls Claude with trading-coach prompt
6. Response streamed back to chat interface
7. Results also rendered as visual cards (bias cards, portfolio allocation chart)

### Flow 2: Pre-Trade Check (Conversational)
1. After analysis, user types: "I'm thinking of buying 50 shares of SHOP"
2. Router classifies as trading-coach intent
3. Trading coach module receives the message + existing portfolio context
4. Claude reasons about concentration risk, recent patterns, behavioral flags
5. Returns a structured assessment with green/yellow/red signal

### Flow 3: Tax-Loss Harvesting Quick Scan
1. User clicks "Tax Optimizer" module (or asks "are there any tax harvesting opportunities?")
2. Router dispatches to tax-optimizer module
3. Module analyzes unrealized gains/losses from the portfolio data
4. Returns harvesting candidates with estimated savings
5. Flags superficial loss rule where applicable

---

## API Route Design

### POST /api/chat
Main conversational endpoint. Handles all user messages.

```typescript
Request: {
  message: string;
  conversationHistory: Message[];
  portfolioData?: ParsedTrade[];  // Attached after CSV upload
  activeModule?: string;           // Hint for router
}

Response: ReadableStream (SSE) {
  type: 'text' | 'insight' | 'bias' | 'harvest' | 'module_switch';
  content: string | StructuredInsight;
}
```

### POST /api/analyze
Initial CSV analysis endpoint. Returns structured portfolio analysis.

```typescript
Request: {
  trades: ParsedTrade[];
}

Response: {
  summary: PortfolioSummary;
  insights: Insight[];
  biases: BehavioralBias[];
  taxOpportunities?: TaxHarvestCandidate[];
}
```

---

## Deployment (Digital Ocean)

### Option A: App Platform (Recommended — simplest)
1. Push to GitHub
2. Connect repo to DO App Platform
3. Set environment variables
4. Auto-deploys on push

### Option B: Droplet + Docker
1. Create a $12/mo droplet (2GB RAM)
2. Install Docker
3. `docker-compose up -d`
4. Point domain to droplet IP

Dockerfile and docker-compose.yml are provided in the repo.

---

## Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Docker build
docker build -t ws-copilot .

# Docker run
docker run -p 3000:3000 --env-file .env ws-copilot
```

---

## What "Done" Looks Like

- [ ] Landing page with Wealthsimple-inspired design
- [ ] CSV upload working with validation
- [ ] Chat interface with streaming responses
- [ ] Trading Coach: full behavioral analysis with bias cards
- [ ] Trading Coach: pre-trade check conversational flow
- [ ] Tax Optimizer: basic harvesting scan (at minimum, shows candidates)
- [ ] Module navigation sidebar showing all 4 modules
- [ ] "Coming soon" state for Migration Planner and Smart Support
- [ ] Human-boundary messaging visible in the UI
- [ ] Deployed and accessible via URL
- [ ] Demo video recorded
- [ ] 500-word writeup complete
