'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getLocalCurrency, setLocalCurrency } from '../lib/session';

export const CURRENCIES = [
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  { code: 'NGN', symbol: '₦',   name: 'Nigerian Naira' },
  { code: 'GHS', symbol: '₵',   name: 'Ghanaian Cedi' },
  { code: 'ZAR', symbol: 'R',   name: 'South African Rand' },
  { code: 'ETB', symbol: 'Br',  name: 'Ethiopian Birr' },
  { code: 'USD', symbol: '$',   name: 'US Dollar' },
  { code: 'EUR', symbol: '€',   name: 'Euro' },
  { code: 'GBP', symbol: '£',   name: 'British Pound' },
];

interface CurrencyContextValue {
  currency: string;
  symbol: string;
  setCurrency: (code: string) => void;
  format: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: 'KES',
  symbol: 'KSh',
  setCurrency: () => {},
  format: (n) => `KSh ${n.toLocaleString()}`,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<string>('KES');

  useEffect(() => {
    setCurrencyState(getLocalCurrency());
  }, []);

  const setCurrency = useCallback((code: string) => {
    setLocalCurrency(code);
    setCurrencyState(code);
  }, []);

  const symbol = CURRENCIES.find(c => c.code === currency)?.symbol ?? currency;

  const format = useCallback(
    (amount: number) => `${symbol} ${amount.toLocaleString()}`,
    [symbol]
  );

  return (
    <CurrencyContext.Provider value={{ currency, symbol, setCurrency, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
