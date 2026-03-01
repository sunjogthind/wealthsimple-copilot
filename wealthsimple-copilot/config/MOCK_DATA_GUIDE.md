# Mock Data: Embedded Biases & Expected AI Detections

This document describes the intentional patterns in `config/mock-trades.csv` that the Trading Coach should detect. Use this to verify the AI analysis is working correctly.

## Bias 1: Disposition Effect (HIGH severity)
**Pattern:** Sells winners quickly, holds losers much longer.
- NVDA: Bought Feb 10 at $128.50, sold Feb 14 at $135.20 (4 days, +5.2%) — quick profit-take
- AAPL: Bought Jun 2 at $195.40, sold Jun 10 at $202.10 (8 days, +3.4%) — quick profit-take
- AMZN: Bought Sep 1, sold Sep 5 (4 days, +3.3%) — quick profit-take
- PLTR: Bought Sep 10, sold Sep 15 (5 days, +7.3%) — quick profit-take
- **BUT** AC.TO: Bought Mar 20 at $18.50, STILL HELD and bought MORE on Nov 5 at $15.20 (down ~18%, averaging down)
- BB.TO: Bought May 15 at $4.20, held until Sep 25, sold at $3.40 (132 days, -19%)
- LSPD.TO: Bought Jul 20 at $22.80, sold Nov 1 at $18.40 (104 days, -19%)

**Average hold time for winners: ~5 days. Average hold time for losers: ~100+ days.**

## Bias 2: Overconcentration — Canadian Financials (MEDIUM severity)
**Pattern:** Heavy allocation to Big 5 Canadian bank stocks.
- RY.TO: $11,624
- TD.TO: $8,210 (TFSA)
- BNS.TO: $8,268
- BMO.TO: $11,556
- CM.TO: $4,606 (sold later)
Canadian financials represent a very large portion of the portfolio.

## Bias 3: FOMO / Chasing (MEDIUM severity)
**Pattern:** Buys back NVDA at higher price immediately after selling for profit, then rides it down.
- NVDA: Sold at $135.20, bought back at $140.10 (higher!), eventually sold at $122.80 (loss)
- TSLA: Sold at $260.30, bought back at $270.50 (higher!), sold at $255.10 (loss). Then bought AGAIN at $280.00 and still holding.
- SHOP.TO: Sold at $112.80, bought back at $115.40, sold at $98.50 (loss), bought again at $96.20, then bought more at $88.50. Repeated chasing.

## Bias 4: Speculative/Volatile Names (LOW severity)
**Pattern:** Allocation to highly speculative stocks.
- BITF.TO (Bitcoin mining): Bought at $2.10, sold at $1.85 (loss), bought back at $1.70
- MARA (crypto mining): Bought at $22.40, sold at $18.30 (loss)
- BB.TO (meme stock): Bought at $4.20, sold at $3.40 (loss)
All speculative positions lost money.

## Bias 5: Overtrading (LOW-MEDIUM severity)
**Pattern:** 53 transactions in ~10 months for what appears to be a retail investor.
Many short-term round-trips (buy and sell within days/weeks).

## Tax Harvesting Opportunities (for Tax Optimizer module)

In NON-REG accounts, current unrealized losses as of ~Nov 2025:
- SHOP.TO: 110 shares, ACB ~$99/share, likely underwater
- AC.TO: 300 shares, ACB ~$17.50/share, currently ~$15.20 (unrealized loss ~$690)
- BITF.TO: 1200 shares at $1.70, volatile
- TSLA: 30 shares at $280.00, could be underwater depending on market

**Superficial loss rule trigger:**
- SHOP.TO: Multiple buy-sell-rebuy cycles. If recommending a harvest, must check 30-day window.
- BITF.TO: Sold Jul 5, rebought Jul 10 (only 5 days!) — superficial loss already triggered on that trade.

## Expected Portfolio Summary (approximate)

- Total trades: 53
- Win rate (closed): ~45-50%
- Heavy CAD bias (~70% Canadian stocks)
- Average winning hold: ~5 days
- Average losing hold: ~100 days
- Significant dividend income from bank stocks
