import { SaleWidgetCurrency, SaleWidgetCurrencyType } from '../types';

export const sortAndDeduplicateCurrencies = (
  currencies: SaleWidgetCurrency[],
): SaleWidgetCurrency[] => {
  const currenciesMap = new Map<string, SaleWidgetCurrency>();

  let baseCurrency: SaleWidgetCurrency | undefined;

  for (const currency of currencies) {
    const currencyNameKey = currency.name.toLowerCase();
    if (
      currency.base && currency.currencyType === SaleWidgetCurrencyType.SETTLEMENT
    ) {
      if (!baseCurrency) {
        baseCurrency = currency;
      }
    } else {
      const existingCurrency = currenciesMap.get(currencyNameKey);
      if (
        !existingCurrency || (existingCurrency.currencyType === SaleWidgetCurrencyType.SWAPPABLE
          && currency.currencyType === SaleWidgetCurrencyType.SETTLEMENT)
      ) {
        currenciesMap.set(currencyNameKey, currency);
      }
    }
  }

  if (baseCurrency) {
    const baseCurrencyKey = baseCurrency.name.toLowerCase();
    if (currenciesMap.has(baseCurrencyKey)) {
      currenciesMap.delete(baseCurrencyKey);
    }
  }

  const sortedAndUniqueCurrencies = baseCurrency
    ? [baseCurrency, ...currenciesMap.values()]
    : [...currenciesMap.values()];

  return sortedAndUniqueCurrencies;
};
