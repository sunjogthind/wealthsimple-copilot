# Wealthsimple Copilot — Pre-Trade Committee

> *Most AI financial tools answer questions. This one does something different: it stands between you and your next bad trade.*

## What it does

When you describe a trade you're considering, four specialized AI agents work in parallel — each taking real cognitive responsibility for a specific dimension of the decision. A fifth synthesis agent reads all four and produces a structured **Pre-Trade Brief**.

This gives a retail investor the equivalent of a four-person research team on every trade decision. Zero cost.

```
"I'm thinking about selling my LSPD.TO position"
                      │
         ┌────────────┼────────────┐
         ▼            ▼            ▼            ▼
   Portfolio     Behavioral    Devil's       Tax Impact
    Impact         Risk        Advocate       Analyst
   [streaming]  [streaming]  [streaming]   [streaming]
         │            │            │            │
         └────────────┴────────────┴────────────┘
                           │
                           ▼
                  Committee Synthesis
                🔴 HIGH RISK — LSPD.TO
         Primary concern: Loss Aversion pattern
         You've held this position 298 days at -48%.
         This AI cannot know your investment thesis...
                  THE DECISION IS YOURS.
```

## Try it

**No CSV required** — click "Try with sample portfolio" on the home screen to load Alex Chen's fictional 40-trade portfolio. It's engineered to trigger real behavioral biases so you can see the committee in action.

Then describe any trade:
- `"I'm thinking about selling my LSPD.TO position"`
- `"Should I add to my QQQ in my RRSP?"`
- `"I want to sell SHOP.TO and buy NVDA"`

## How it works

### The four agents

| Agent | Role | What it analyzes |
|-------|------|-----------------|
| **Portfolio Impact** | Quantitative | Concentration changes, sector exposure, diversification, CAD net position |
| **Behavioral Risk** | Personalized | Whether this trade matches your *specific* bias patterns, with evidence from your actual trade history |
| **Devil's Advocate** | Adversarial | The strongest possible case against the trade — timing risk, failed assumptions, what you might be missing |
| **Tax Impact** | Tax-aware | Canadian tax consequences: capital gains, ACB, TFSA/RRSP implications, superficial loss risk |

### Why parallel and specialized?

A single AI asked to "analyze from all angles" produces blended, averaged output. It cannot simultaneously be a rigorous devil's advocate *and* a constructive portfolio analyst. Separate agents with adversarial roles produce sharper thinking. See [Architecture](docs/ARCHITECTURE.md) for details.

### The synthesis

The synthesis agent reads all four outputs and produces:

1. **Signal** — 🟢 PROCEED / 🟡 CAUTION / 🔴 HIGH RISK based on the weight of concerns
2. **Primary Concern** — the single most important thing to weigh
3. **Synthesis** — 2-3 sentences integrating all four perspectives
4. **What this AI cannot know** — explicit list of context only you have
5. **The decision is yours** — affirming human authority

## Human-AI boundaries

**Where the AI takes responsibility:**
- Analyzing your actual trade history for behavioral patterns (with specific dates, prices, and hold times)
- Computing portfolio concentration and account type implications
- Arguing rigorously against the trade (devil's advocate role)
- Calculating Canadian tax consequences from your ACB

**Where the AI stops:**
- Your investment thesis for this trade
- Your liquidity needs and cash flow situation
- Your full financial picture beyond the uploaded CSV
- Your risk tolerance, time horizon, and personal conviction

**The one decision that remains human: trade execution.**

The committee is a deliberation tool. It cannot know whether you've done additional research, have a strong thesis, or have personal financial context that changes the calculus. All execution decisions belong to you.

## Tech stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 14 (App Router) | Streaming API routes, React server components |
| AI | Anthropic `claude-sonnet-4-6` | Best reasoning quality for financial analysis |
| Streaming | `@anthropic-ai/sdk` messages.stream | Parallel agent streaming, visible progress |
| Portfolio analysis | Pure TypeScript | No external API, runs on every request |
| Styling | Tailwind CSS | Wealthsimple design system tokens |
| CSV parsing | PapaParse | Handles malformed CSVs gracefully |

## Quick start

```bash
git clone <repo>
cd wealthsimple-copilot
npm install
cp .env.local.example .env.local  # Add your ANTHROPIC_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

You only need an [Anthropic API key](https://console.anthropic.com) — set `ANTHROPIC_API_KEY` in `.env.local`.

## Using your own Wealthsimple data

1. In Wealthsimple, go to **Account → Download → Trade History (CSV)**
2. Upload the CSV on the home screen
3. Your data stays in your browser — nothing is sent to any server except the Anthropic API on each analysis request

## Project structure

```
src/
├── app/
│   └── api/
│       └── committee/route.ts   ← 5-agent endpoint, all streaming
├── components/
│   ├── committee/
│   │   ├── CommitteeView.tsx    ← parallel streaming orchestration
│   │   ├── AgentCard.tsx        ← per-agent result card
│   │   └── TradeInput.tsx       ← trade description input
│   ├── dashboard/
│   │   └── CopilotDashboard.tsx ← sidebar + committee layout
│   └── upload/
│       └── CSVUpload.tsx        ← file upload + demo mode
├── lib/
│   ├── analysis/
│   │   ├── portfolio.ts         ← portfolio math (pure TS, unchanged)
│   │   ├── behaviors.ts         ← bias detection (pure TS, unchanged)
│   │   └── tax.ts               ← tax calculations (pure TS, unchanged)
│   ├── data/
│   │   └── sample-portfolio.ts  ← Alex Chen's 40-trade demo portfolio
│   └── utils/
│       └── rate-limiter.ts      ← in-memory sliding window rate limiter
└── types/
    ├── committee.ts             ← agent role types
    └── trade.ts                 ← portfolio types
```

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for:
- Why agents are specialized and parallel (not monolithic)
- How the behavioral agent uses your actual trade data for personalized evidence
- The streaming pattern (4 parallel fetch → sequential synthesis)
- Security: no server-side data storage
- Rate limiting design

---

Built for the Wealthsimple AI Builders Competition · March 2026
