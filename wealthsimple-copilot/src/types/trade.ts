export type TransactionType = 'buy' | 'sell' | 'dividend';
export type AccountType = 'NON-REG' | 'TFSA' | 'RRSP' | 'FHSA';
export type Currency = 'CAD' | 'USD';

export interface RawTrade {
  Date: string;
  'Transaction Type': string;
  Symbol: string;
  Quantity: string;
  Price: string;
  Amount: string;
  Currency: string;
  'Account Type': string;
}

export interface ParsedTrade {
  date: string;
  transactionType: TransactionType;
  symbol: string;
  quantity: number;
  price: number;
  amount: number;
  currency: Currency;
  accountType: AccountType;
}

export interface Holding {
  symbol: string;
  quantity: number;
  acb: number;
  averageCost: number;
  currentPrice: number;
  currentValue: number;
  unrealizedGain: number;
  unrealizedGainPct: number;
  accountType: AccountType;
  currency: Currency;
}

export interface ClosedPosition {
  symbol: string;
  buyDate: string;
  sellDate: string;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
  gain: number;
  gainPct: number;
  holdDays: number;
  accountType: AccountType;
}
