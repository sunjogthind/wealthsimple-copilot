# Product Requirements Document: Wealthsimple Copilot

## Vision

Wealthsimple Copilot is an AI-native financial agent that transforms Wealthsimple from a collection of separate financial tools into a unified intelligent platform. Instead of siloed products (trading app, tax software, support chatbot), the Copilot provides a single conversational interface that understands your complete financial picture and helps you make better decisions — while keeping you firmly in control.

**Core Design Principle:** The Copilot analyzes, recommends, and explains. It never acts. Every decision that touches money, triggers tax consequences, or involves regulatory obligations requires explicit human confirmation.

---

## Problem Statement

Wealthsimple serves 3M+ Canadians with $100B+ in assets across investing, saving, spending, crypto, and tax products. Yet:

1. **No cross-product intelligence.** Your trading app doesn't talk to your tax software. A user might realize a capital gain in March and miss a harvesting opportunity in November because the tools are disconnected.
2. **Support is surface-level.** Willow (WS's AI assistant) can't access account data for security reasons, so it functions as a smarter FAQ rather than a true assistant.
3. **Self-directed investors are flying blind.** WS gives you the tools to trade but not the insight into whether you're trading well. There's no behavioral feedback loop.
4. **Onboarding from other platforms is painful.** Consolidating assets onto WS requires manual research into tax implications, equivalent holdings, and transfer logistics.

None of these problems exist because Wealthsimple is bad. They exist because the products were built before modern AI made a unified intelligent layer possible.

---

## Modules

### Module 1: Trading Coach (MVP — Fully Functional)

**What it does:**
- Ingests trade history via CSV upload
- Performs behavioral analysis: identifies cognitive biases (disposition effect, overconcentration, recency bias, loss aversion)
- Calculates portfolio metrics: allocation, win rate, average hold time, P&L distribution
- Provides pre-trade checks: user describes a proposed trade, Copilot evaluates it against their patterns and portfolio

**User stories:**
- "Upload my trades and tell me what patterns you see"
- "I want to buy 100 shares of SHOP — is that a good idea given my portfolio?"
- "What's my biggest behavioral blind spot?"
- "How does my performance compare to holding a broad index ETF?"

**AI responsibility:** Pattern recognition, behavioral analysis, risk flagging
**Human responsibility:** All buy/sell decisions

### Module 2: Tax Optimizer (Working Stub)

**What it does:**
- Scans portfolio for unrealized losses that could be harvested
- Calculates estimated tax savings from harvesting
- Flags superficial loss rule (30-day Canadian wash sale rule)
- Shows year-to-date realized gains/losses

**User stories:**
- "Do I have any tax-loss harvesting opportunities?"
- "How much have I realized in capital gains this year?"
- "What's the superficial loss rule and does it affect me?"

**AI responsibility:** Identifying opportunities, calculating estimates, explaining rules
**Human responsibility:** Whether to act on any recommendation. AI cannot see full financial picture (other brokerages, spouse's accounts, corporate holdings).

### Module 3: Migration Planner (UI Stub)

**What it would do (not built for MVP):**
- User describes portfolio at another institution
- AI maps holdings to WS equivalents
- Models tax impact of transfer-in-kind vs. liquidate-and-rebuy
- Generates step-by-step migration plan

**Shown in UI as:** A module card with "Coming Soon" badge and a brief description.

### Module 4: Smart Support (UI Stub)

**What it would do (not built for MVP):**
- Context-aware support that understands your account
- Intelligent triage and escalation
- Proactive issue detection

**Shown in UI as:** A module card with "Coming Soon" badge and a brief description.

---

## User Flow (MVP)

```
Landing Page
    │
    ├── Upload CSV ──────────────────┐
    │                                 │
    ▼                                 ▼
Dashboard                     CSV Parsed + Validated
    │                                 │
    ├── Module Cards                  │
    │   ├── Trading Coach ◄───────────┘
    │   ├── Tax Optimizer
    │   ├── Migration Planner (soon)
    │   └── Smart Support (soon)
    │
    ▼
Chat Interface + Results Panel
    │
    ├── Behavioral Analysis Cards
    ├── Portfolio Summary
    ├── Pre-Trade Check
    └── Tax Harvesting Opportunities
```

---

## Non-Functional Requirements

- **Response time:** Streaming responses should start within 2 seconds
- **CSV support:** Handle up to 5,000 trades (typical active WS user)
- **Mobile responsive:** Must look good on mobile (Wealthsimple is mobile-first)
- **Accessibility:** Proper contrast ratios, keyboard navigation for chat
- **Security:** API key server-side only, no PII stored, no trade data persisted

---

## Success Criteria for Demo

1. Panel watches a CSV upload → sees immediate, intelligent behavioral analysis
2. Panel sees a conversational follow-up ("what about buying SHOP?") handled contextually
3. Panel sees the modular architecture and understands this extends to tax, migration, support
4. Panel clearly sees where AI stops and human decides
5. Panel thinks: "This is what Willow should evolve into"
