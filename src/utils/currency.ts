export const CURRENCIES = {
  RM: { symbol: 'RM', name: 'Malaysian Ringgit', rate: 1 },
  USD: { symbol: '$', name: 'US Dollar', rate: 0.21 },
  EUR: { symbol: '€', name: 'Euro', rate: 0.19 },
  GBP: { symbol: '£', name: 'British Pound', rate: 0.17 },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', rate: 0.29 },
  JPY: { symbol: '¥', name: 'Japanese Yen', rate: 31.5 },
  CNY: { symbol: '¥', name: 'Chinese Yuan', rate: 1.52 },
  THB: { symbol: '฿', name: 'Thai Baht', rate: 7.6 },
  IDR: { symbol: 'Rp', name: 'Indonesian Rupiah', rate: 3200 },
};

export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) return amount;
  
  const fromRate = CURRENCIES[fromCurrency as keyof typeof CURRENCIES]?.rate || 1;
  const toRate = CURRENCIES[toCurrency as keyof typeof CURRENCIES]?.rate || 1;
  
  // Convert to RM first, then to target currency
  const rmAmount = amount / fromRate;
  return rmAmount * toRate;
};

export const formatCurrency = (amount: number, currency: string): string => {
  const currencyInfo = CURRENCIES[currency as keyof typeof CURRENCIES];
  if (!currencyInfo) return `${amount.toFixed(2)}`;
  
  return `${currencyInfo.symbol} ${amount.toFixed(2)}`;
};