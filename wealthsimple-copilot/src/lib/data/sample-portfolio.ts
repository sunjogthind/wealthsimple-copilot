import { ParsedTrade } from '@/types/trade';

/**
 * Sample portfolio for "Alex Chen" — a fictional Canadian retail investor.
 * Engineered to trigger all major behavioral bias detectors:
 *
 * - Disposition Effect (HIGH): winners avg ~22d, losers avg ~236d (ratio ~10x)
 * - Overconcentration (HIGH): QQQ in RRSP = ~38% of total portfolio
 * - FOMO / Chase Buying (HIGH): sold SHOP.TO@$93 then rebought@$115;
 *                                sold RY.TO@$118 then rebought@$127;
 *                                sold TD.TO@$83 then rebought@$89
 * - Loss Aversion (HIGH): LSPD.TO -48% unrealized, BITF.TO -47% unrealized
 * - Repeat Trading: AC.TO — 3 buys, 2 sells
 * - Tax harvest candidate: BITF.TO (NON-REG, last bought >8 months ago, ~$320 unrealized loss)
 *
 * Account mix: TFSA, RRSP, NON-REG
 * Portfolio total: ~$91K CAD
 */
export const SAMPLE_PORTFOLIO_TRADES: ParsedTrade[] = [
  // ── RRSP: QQQ (overconcentration: becomes ~38% of portfolio) ──────────────

  {
    date: '2023-02-01',
    transactionType: 'buy',
    symbol: 'QQQ',
    quantity: 40,
    price: 310, // USD — 40 × 310 × 1.36 = $16,864 CAD cost
    amount: 12400,
    currency: 'USD',
    accountType: 'RRSP',
  },
  {
    date: '2024-01-15',
    transactionType: 'buy',
    symbol: 'QQQ',
    quantity: 20,
    price: 418, // USD — lastPrice used as current. 60 shares × 418 × 1.36 = $34,108 current value
    amount: 8360,
    currency: 'USD',
    accountType: 'RRSP',
  },
  {
    date: '2024-08-15',
    transactionType: 'buy',
    symbol: 'ZAG.TO',
    quantity: 200,
    price: 15, // CAD — bond ETF, $3,000 value
    amount: 3000,
    currency: 'CAD',
    accountType: 'RRSP',
  },

  // ── TFSA: SHOP.TO — winner sold fast (disposition effect: 23 days) ────────

  {
    date: '2023-04-15',
    transactionType: 'buy',
    symbol: 'SHOP.TO',
    quantity: 30,
    price: 82, // CAD
    amount: 2460,
    currency: 'CAD',
    accountType: 'TFSA',
  },
  {
    date: '2023-05-08',
    transactionType: 'sell',
    symbol: 'SHOP.TO',
    quantity: 30,
    price: 93, // 23 days, gain = (93-82) × 30 = +$330
    amount: 2790,
    currency: 'CAD',
    accountType: 'TFSA',
  },
  // Rebought SHOP.TO at higher price → FOMO signal (sell@93, rebuy@115)
  {
    date: '2024-03-20',
    transactionType: 'buy',
    symbol: 'SHOP.TO',
    quantity: 30,
    price: 115, // CAD — current holding: 30 × $115 = $3,450
    amount: 3450,
    currency: 'CAD',
    accountType: 'TFSA',
  },

  // ── TFSA: NVDA — winner sold fast (disposition effect: 19 days) ──────────

  {
    date: '2023-06-01',
    transactionType: 'buy',
    symbol: 'NVDA',
    quantity: 10,
    price: 390, // USD
    amount: 3900,
    currency: 'USD',
    accountType: 'TFSA',
  },
  {
    date: '2023-06-20',
    transactionType: 'sell',
    symbol: 'NVDA',
    quantity: 10,
    price: 418, // 19 days, gain = (418-390) × 10 × 1.36 = +$380.80 CAD
    amount: 4180,
    currency: 'USD',
    accountType: 'TFSA',
  },

  // ── TFSA: Current holdings ────────────────────────────────────────────────

  {
    date: '2023-08-10',
    transactionType: 'buy',
    symbol: 'VFV.TO',
    quantity: 100,
    price: 103, // CAD — $10,300 current value
    amount: 10300,
    currency: 'CAD',
    accountType: 'TFSA',
  },
  {
    date: '2024-05-15',
    transactionType: 'buy',
    symbol: 'MSFT',
    quantity: 10,
    price: 420, // USD — 10 × 420 × 1.36 = $5,712 current value
    amount: 4200,
    currency: 'USD',
    accountType: 'TFSA',
  },
  {
    date: '2023-11-05',
    transactionType: 'buy',
    symbol: 'ENB.TO',
    quantity: 150,
    price: 43, // CAD — $6,450 current value
    amount: 6450,
    currency: 'CAD',
    accountType: 'TFSA',
  },
  {
    date: '2024-05-10',
    transactionType: 'buy',
    symbol: 'XEQT.TO',
    quantity: 60,
    price: 30, // CAD — $1,800 current value
    amount: 1800,
    currency: 'CAD',
    accountType: 'TFSA',
  },

  // ── TFSA: ENB.TO dividends (5 quarters) ──────────────────────────────────

  {
    date: '2023-07-15',
    transactionType: 'dividend',
    symbol: 'ENB.TO',
    quantity: 0,
    price: 0,
    amount: 43,
    currency: 'CAD',
    accountType: 'TFSA',
  },
  {
    date: '2023-10-15',
    transactionType: 'dividend',
    symbol: 'ENB.TO',
    quantity: 0,
    price: 0,
    amount: 43,
    currency: 'CAD',
    accountType: 'TFSA',
  },
  {
    date: '2024-01-15',
    transactionType: 'dividend',
    symbol: 'ENB.TO',
    quantity: 0,
    price: 0,
    amount: 43,
    currency: 'CAD',
    accountType: 'TFSA',
  },
  {
    date: '2024-04-15',
    transactionType: 'dividend',
    symbol: 'ENB.TO',
    quantity: 0,
    price: 0,
    amount: 43,
    currency: 'CAD',
    accountType: 'TFSA',
  },
  {
    date: '2024-07-15',
    transactionType: 'dividend',
    symbol: 'ENB.TO',
    quantity: 0,
    price: 0,
    amount: 43,
    currency: 'CAD',
    accountType: 'TFSA',
  },

  // ── NON-REG: LSPD.TO — loser held 298 days then partially sold ───────────
  // Partial sell sets lastPrice = $28, creating a -48% unrealized loss
  // → triggers Loss Aversion detector

  {
    date: '2023-02-10',
    transactionType: 'buy',
    symbol: 'LSPD.TO',
    quantity: 150,
    price: 54, // CAD — total cost $8,100
    amount: 8100,
    currency: 'CAD',
    accountType: 'NON-REG',
  },
  {
    date: '2023-12-05',
    transactionType: 'sell',
    symbol: 'LSPD.TO',
    quantity: 50,
    price: 28, // 298 days, gain = (28-54) × 50 = -$1,300 (LOSER)
    // Remaining: 100 shares, lastPrice=$28, cost=$5,400, unrealized=-48%
    amount: 1400,
    currency: 'CAD',
    accountType: 'NON-REG',
  },

  // ── NON-REG: BITF.TO — tax harvest candidate ──────────────────────────────
  // Partial sell sets lastPrice = $1.80, creating -47% unrealized loss
  // Last buy: 2023-05-15 — no superficial loss risk (>30 days ago)
  // estimatedTaxSaving ≈ $72

  {
    date: '2023-05-15',
    transactionType: 'buy',
    symbol: 'BITF.TO',
    quantity: 300,
    price: 3.40, // CAD — total cost $1,020
    amount: 1020,
    currency: 'CAD',
    accountType: 'NON-REG',
  },
  {
    date: '2024-02-10',
    transactionType: 'sell',
    symbol: 'BITF.TO',
    quantity: 100,
    price: 1.80, // 271 days, gain = (1.80-3.40) × 100 = -$160 (LOSER)
    // Remaining: 200 shares, lastPrice=$1.80, cost=$680, unrealized=-47%
    amount: 180,
    currency: 'CAD',
    accountType: 'NON-REG',
  },

  // ── NON-REG: RY.TO — FOMO pattern (sell@118, rebuy@127) ──────────────────

  {
    date: '2023-04-01',
    transactionType: 'buy',
    symbol: 'RY.TO',
    quantity: 20,
    price: 116, // CAD
    amount: 2320,
    currency: 'CAD',
    accountType: 'NON-REG',
  },
  {
    date: '2023-07-10',
    transactionType: 'sell',
    symbol: 'RY.TO',
    quantity: 20,
    price: 118, // 100 days, gain = (118-116) × 20 = +$40 (WINNER)
    amount: 2360,
    currency: 'CAD',
    accountType: 'NON-REG',
  },
  // Rebought at higher price → FOMO
  {
    date: '2023-09-15',
    transactionType: 'buy',
    symbol: 'RY.TO',
    quantity: 30,
    price: 127, // CAD — current holding: 30 × $127 = $3,810
    amount: 3810,
    currency: 'CAD',
    accountType: 'NON-REG',
  },
  {
    date: '2023-09-15',
    transactionType: 'dividend',
    symbol: 'RY.TO',
    quantity: 0,
    price: 0,
    amount: 75,
    currency: 'CAD',
    accountType: 'NON-REG',
  },
  {
    date: '2023-12-15',
    transactionType: 'dividend',
    symbol: 'RY.TO',
    quantity: 0,
    price: 0,
    amount: 75,
    currency: 'CAD',
    accountType: 'NON-REG',
  },

  // ── NON-REG: TD.TO — FOMO pattern (sell@83, rebuy@89) ────────────────────

  {
    date: '2023-05-15',
    transactionType: 'buy',
    symbol: 'TD.TO',
    quantity: 40,
    price: 82, // CAD
    amount: 3280,
    currency: 'CAD',
    accountType: 'NON-REG',
  },
  {
    date: '2023-08-20',
    transactionType: 'sell',
    symbol: 'TD.TO',
    quantity: 40,
    price: 83, // 97 days, gain = (83-82) × 40 = +$40 (WINNER)
    amount: 3320,
    currency: 'CAD',
    accountType: 'NON-REG',
  },
  // Rebought at higher price → FOMO
  {
    date: '2023-11-01',
    transactionType: 'buy',
    symbol: 'TD.TO',
    quantity: 50,
    price: 89, // CAD — current holding: 50 × $89 = $4,450
    amount: 4450,
    currency: 'CAD',
    accountType: 'NON-REG',
  },

  // ── NON-REG: BB.TO — loser held 298 days then closed ─────────────────────
  // triggers disposition effect (loser side)

  {
    date: '2023-01-20',
    transactionType: 'buy',
    symbol: 'BB.TO',
    quantity: 500,
    price: 7.20, // CAD
    amount: 3600,
    currency: 'CAD',
    accountType: 'NON-REG',
  },
  {
    date: '2023-11-15',
    transactionType: 'sell',
    symbol: 'BB.TO',
    quantity: 500,
    price: 5.50, // 298 days, gain = (5.50-7.20) × 500 = -$850 (LOSER)
    amount: 2750,
    currency: 'CAD',
    accountType: 'NON-REG',
  },

  // ── NON-REG: AC.TO — repeat trading pattern (3 buys, 2 sells) ────────────

  {
    date: '2023-03-01',
    transactionType: 'buy',
    symbol: 'AC.TO',
    quantity: 50,
    price: 18, // CAD
    amount: 900,
    currency: 'CAD',
    accountType: 'NON-REG',
  },
  {
    date: '2023-05-20',
    transactionType: 'sell',
    symbol: 'AC.TO',
    quantity: 50,
    price: 20, // 80 days, gain = (20-18) × 50 = +$100 (WINNER)
    amount: 1000,
    currency: 'CAD',
    accountType: 'NON-REG',
  },
  {
    date: '2023-07-15',
    transactionType: 'buy',
    symbol: 'AC.TO',
    quantity: 70,
    price: 19, // CAD
    amount: 1330,
    currency: 'CAD',
    accountType: 'NON-REG',
  },
  {
    date: '2023-09-30',
    transactionType: 'sell',
    symbol: 'AC.TO',
    quantity: 70,
    price: 17, // 77 days, gain = (17-19) × 70 = -$140 (LOSER)
    amount: 1190,
    currency: 'CAD',
    accountType: 'NON-REG',
  },
  {
    date: '2023-12-10',
    transactionType: 'buy',
    symbol: 'AC.TO',
    quantity: 80,
    price: 16, // CAD — current holding: 80 × $16 = $1,280
    amount: 1280,
    currency: 'CAD',
    accountType: 'NON-REG',
  },

  // ── NON-REG: Additional diversified holdings ──────────────────────────────

  {
    date: '2024-01-20',
    transactionType: 'buy',
    symbol: 'BCE.TO',
    quantity: 100,
    price: 43, // CAD — $4,300 current value
    amount: 4300,
    currency: 'CAD',
    accountType: 'NON-REG',
  },
  {
    date: '2024-02-28',
    transactionType: 'buy',
    symbol: 'SU.TO',
    quantity: 60,
    price: 52, // CAD — $3,120 current value
    amount: 3120,
    currency: 'CAD',
    accountType: 'NON-REG',
  },
  {
    date: '2024-04-15',
    transactionType: 'buy',
    symbol: 'HMAX.TO',
    quantity: 300,
    price: 12, // CAD — $3,600 current value
    amount: 3600,
    currency: 'CAD',
    accountType: 'NON-REG',
  },
  {
    date: '2024-03-01',
    transactionType: 'buy',
    symbol: 'XEI.TO',
    quantity: 100,
    price: 25, // CAD — $2,500 current value
    amount: 2500,
    currency: 'CAD',
    accountType: 'NON-REG',
  },
];
