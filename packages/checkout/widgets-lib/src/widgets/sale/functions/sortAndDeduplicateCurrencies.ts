import { SaleWidgetCurrency } from '../types';

export const sortAndDeduplicateCurrencies = (
  currencies: SaleWidgetCurrency[],
): SaleWidgetCurrency[] => {
  const currenciesMap = new Map<string, SaleWidgetCurrency>();

  let baseCurrency: SaleWidgetCurrency | undefined;

  for (const currency of currencies) {
    const currencyNameKey = currency.name.toLowerCase();
    if (currency.base && currency.currencyType === 'settlement') {
      baseCurrency = currency;
    } else {
      const existingCurrency = currenciesMap.get(currencyNameKey);
      if (
        !existingCurrency
        || (existingCurrency.currencyType === 'swappable'
          && currency.currencyType === 'settlement')
      ) {
        currenciesMap.set(currencyNameKey, currency);
      }
    }
  }

  const sortedAndUniqueCurrencies = baseCurrency
    ? [baseCurrency, ...currenciesMap.values()]
    : [...currenciesMap.values()];

  return sortedAndUniqueCurrencies;
};
