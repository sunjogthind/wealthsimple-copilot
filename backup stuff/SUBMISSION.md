# Submission Writeup — Wealthsimple Copilot

**[DRAFT — Refine with your own voice before submitting]**

---

## What the human can now do that they couldn't before

A self-directed investor on Wealthsimple can now have an intelligent, context-aware conversation about their complete financial picture — something that previously required either hiring a financial advisor or manually crunching spreadsheets.

Today, Wealthsimple gives users excellent tools to execute trades, but almost no feedback on whether they're trading *well*. The app shows what you own. It doesn't show you that you've sold your last 8 winners within a week while holding your losers for months — a classic behavioral trap called the disposition effect that silently erodes returns.

Wealthsimple Copilot is a modular AI agent that sits inside the app as a persistent, intelligent layer. Its first module — the Trading Coach — ingests a user's trade history, identifies behavioral biases backed by specific evidence from their own data, and provides pre-trade sanity checks when they're considering a new position. A second module scans for tax-loss harvesting opportunities in non-registered accounts, estimating savings and flagging Canada's superficial loss rule.

The architecture is designed to extend. The same conversational interface and agent router can dispatch to future modules: a migration planner that helps users consolidate assets from other brokerages (directly supporting Wealthsimple's growth from $100B to $1T in AUA), or context-aware support that goes beyond what Willow can do today.

One investor, one interface, complete financial awareness.

## What AI is responsible for

The AI handles the cognitive work that humans are bad at doing consistently: scanning hundreds of trades for patterns, detecting biases that are invisible to the person exhibiting them, computing tax positions across multiple account types, and synthesizing all of this into specific, evidence-backed observations.

It takes on real analytical responsibility. When it tells you "you show a strong disposition effect — you held AC.TO through a 19% decline for 8 months while selling NVDA at a 5% gain after 4 days," that's a genuine insight derived from reasoning over your data. It's not a template. It's not a lookup. The AI is doing the kind of analysis a good portfolio manager would do during a client review — except it's available to every Wealthsimple user, instantly, for free.

## Where AI must stop

**The critical decision that must remain human: any action that moves money or crystallizes a tax event.**

The Copilot never executes trades, never moves funds, and never files tax documents. When it identifies a tax-loss harvesting opportunity, it presents the analysis and says "here's what this could save you — verify with your accountant before acting." When the pre-trade check lights up red, it explains why and asks "what's different this time?" — but the buy button stays in the user's hands.

This isn't just a safety guardrail. It's a design principle. Financial autonomy means the user always decides. AI should expand your ability to make good decisions, not replace the decision itself.

## What would break first at scale

Context window limits. An active trader with 5,000+ trades across multiple accounts generates too much data to fit in a single LLM call. The system would need a summarization layer — pre-computing portfolio metrics and behavioral signatures that compress years of trades into a compact context, with the ability to drill into raw data on demand. The second pressure point is latency: as the analysis grows more sophisticated, streaming responses become essential to keep the experience feeling conversational rather than batch-processed.

---

*Word count: ~497*
