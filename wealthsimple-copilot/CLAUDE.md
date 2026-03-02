# Wealthsimple Copilot — Project Context

## What this is

A Next.js app (App Router) that gives Canadian retail investors a **Pre-Trade Committee** — four specialized AI agents that analyze a proposed trade in parallel, then a fifth synthesis agent produces a structured brief.

## Quick start

```bash
cp .env.local.example .env.local
# Add your ANTHROPIC_API_KEY
npm run dev
```

## Architecture

- **Framework:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **AI:** Anthropic claude-sonnet-4-6 via `@anthropic-ai/sdk`, streaming responses
- **Analysis:** Pure TypeScript functions (no external APIs), all in-memory
- **No database:** All data lives in client state or per-request memory

## Key files

| Path | Purpose |
|------|---------|
| `src/app/api/committee/route.ts` | 5-agent endpoint (all streaming) |
| `src/components/committee/CommitteeView.tsx` | Parallel streaming orchestration |
| `src/components/committee/AgentCard.tsx` | Per-agent result card with markdown |
| `src/lib/data/sample-portfolio.ts` | Engineered demo data (Alex Chen, 40 trades) |
| `src/lib/analysis/portfolio.ts` | Portfolio calculations (pure TS) |
| `src/lib/analysis/behaviors.ts` | Behavioral bias detection (pure TS) |
| `src/lib/analysis/tax.ts` | Tax calculations (pure TS) |
| `src/lib/utils/rate-limiter.ts` | In-memory rate limiter (20 req/min/IP) |

## Coding conventions

- All components use `'use client'` only where needed (streaming requires it)
- Tailwind custom colors: `ws-green`, `ws-bg`, `ws-text`, `ws-border`, `ws-red`, `ws-yellow`
- Streaming pattern: `fetch → response.body.getReader() → TextDecoder` (see CommitteeView.tsx)
- Agent model: `claude-sonnet-4-6` (defined as `MODEL` constant in committee route)
- Currency: CAD default. `USD_TO_CAD_APPROX = 1.36` used for conversion

## Do not modify

- `src/lib/parsers/csv-parser.ts` — CSV parsing
- `src/lib/analysis/portfolio.ts` — Core portfolio math
- `src/lib/analysis/behaviors.ts` — Bias detection logic
- `src/lib/analysis/tax.ts` — Tax calculations

## Environment

```
ANTHROPIC_API_KEY=your-key-here
```
