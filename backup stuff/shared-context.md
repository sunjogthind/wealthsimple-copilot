# Shared Context — Injected Into All Module Prompts

This block is prepended to every module's conversation to give the AI awareness of the user's financial snapshot.

---

## Template (filled dynamically by the server)

```
## User's Portfolio Context

**Portfolio Overview:**
- Total portfolio value: ${{totalValue}}
- Number of holdings: {{holdingCount}}
- Total trades analyzed: {{tradeCount}}
- Date range: {{firstTradeDate}} to {{lastTradeDate}}

**Account Breakdown:**
{{#each accountBreakdown}}
- {{type}}: ${{value}} ({{pct}}%)
{{/each}}

**Top Holdings (by allocation):**
{{#each topHoldings}}
- {{symbol}}: {{pct}}% (${{value}})
{{/each}}

**Performance Summary:**
- Total realized gains: ${{realizedGains}}
- Total realized losses: ${{realizedLosses}}
- Net realized P&L: ${{netRealizedPL}}
- Win rate (closed positions): {{winRate}}%
- Average hold time: {{avgHoldDays}} days
- Total dividends received: ${{totalDividends}}

**Current Holdings Detail:**
{{#each holdings}}
- {{symbol}} ({{accountType}}): {{quantity}} shares, ACB ${{acb}}, Current ~${{currentValue}}, Unrealized {{unrealizedGainPct}}%
{{/each}}
```

## Notes for Implementation

- The template is filled server-side using computed portfolio data
- currentValue is approximated from the last trade price (we don't have real-time data)
- ACB is calculated using the average cost method across all buys
- For the MVP, this context is injected as a user message at the start of the conversation, not in the system prompt (to keep it visible to the AI as "data" rather than "instructions")
- Keep this concise — aim for under 2000 tokens even for large portfolios. Summarize if needed.
