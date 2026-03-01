import Papa from 'papaparse';
import { RawTrade, ParsedTrade, TransactionType, AccountType, Currency } from '@/types/trade';

const VALID_TRANSACTION_TYPES: TransactionType[] = ['buy', 'sell', 'dividend'];
const VALID_ACCOUNT_TYPES: AccountType[] = ['NON-REG', 'TFSA', 'RRSP', 'FHSA'];
const VALID_CURRENCIES: Currency[] = ['CAD', 'USD'];

const REQUIRED_COLUMNS = [
  'Date',
  'Transaction Type',
  'Symbol',
  'Quantity',
  'Price',
  'Amount',
  'Currency',
  'Account Type',
];

export interface CSVParseResult {
  success: boolean;
  trades: ParsedTrade[];
  errors: string[];
  warnings: string[];
}

export function parseCSV(csvContent: string): CSVParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const trades: ParsedTrade[] = [];

  const result = Papa.parse<RawTrade>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim(),
  });

  if (result.errors.length > 0) {
    const criticalErrors = result.errors.filter(e => e.type === 'FieldMismatch' || e.type === 'Quotes');
    if (criticalErrors.length > 0) {
      errors.push(`CSV parsing errors: ${criticalErrors.map(e => e.message).join('; ')}`);
    }
  }

  const headers = result.meta.fields || [];
  const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
  if (missingColumns.length > 0) {
    errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
    return { success: false, trades: [], errors, warnings };
  }

  for (let i = 0; i < result.data.length; i++) {
    const row = result.data[i];
    const rowNum = i + 2; // Account for header + 0-index

    const date = row.Date?.trim();
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      warnings.push(`Row ${rowNum}: Invalid date "${date}", skipping`);
      continue;
    }

    const transactionType = row['Transaction Type']?.trim().toLowerCase() as TransactionType;
    if (!VALID_TRANSACTION_TYPES.includes(transactionType)) {
      warnings.push(`Row ${rowNum}: Invalid transaction type "${row['Transaction Type']}", skipping`);
      continue;
    }

    const symbol = row.Symbol?.trim();
    if (!symbol) {
      warnings.push(`Row ${rowNum}: Missing symbol, skipping`);
      continue;
    }

    const quantity = parseFloat(row.Quantity);
    const price = parseFloat(row.Price);
    const amount = parseFloat(row.Amount);

    if (isNaN(quantity) || isNaN(price) || isNaN(amount)) {
      warnings.push(`Row ${rowNum}: Invalid numeric values, skipping`);
      continue;
    }

    const currency = row.Currency?.trim().toUpperCase() as Currency;
    if (!VALID_CURRENCIES.includes(currency)) {
      warnings.push(`Row ${rowNum}: Invalid currency "${row.Currency}", defaulting to CAD`);
    }

    const accountType = row['Account Type']?.trim().toUpperCase() as AccountType;
    if (!VALID_ACCOUNT_TYPES.includes(accountType)) {
      warnings.push(`Row ${rowNum}: Invalid account type "${row['Account Type']}", defaulting to NON-REG`);
    }

    trades.push({
      date,
      transactionType,
      symbol,
      quantity,
      price,
      amount,
      currency: VALID_CURRENCIES.includes(currency) ? currency : 'CAD',
      accountType: VALID_ACCOUNT_TYPES.includes(accountType) ? accountType : 'NON-REG',
    });
  }

  if (trades.length === 0) {
    errors.push('No valid trades found in the CSV file');
  }

  return {
    success: errors.length === 0 && trades.length > 0,
    trades,
    errors,
    warnings,
  };
}
