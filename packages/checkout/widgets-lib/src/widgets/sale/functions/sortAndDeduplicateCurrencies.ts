import { SaleWidgetCurrency, SaleWidgetCurrencyType } from '../types';

export const sortAndDeduplicateCurrencies = (
  currencies: SaleWidgetCurrency[],
): SaleWidgetCurrency[] => {
  const settlementCurrencies = new Map<string, SaleWidgetCurrency>();
  const swappableCurrencies = new Map<string, SaleWidgetCurrency>();

  let baseCurrency: SaleWidgetCurrency | undefined;

  for (const currency of currencies) {
    const currencyNameKey = currency.name.toLowerCase();
    if (
      currency.base
      && currency.currencyType === SaleWidgetCurrencyType.SETTLEMENT
    ) {
      if (!baseCurrency) {
        baseCurrency = currency;
      }
    }

    if (baseCurrency?.name !== currency.name) {
      if (currency.currencyType === SaleWidgetCurrencyType.SETTLEMENT) {
        settlementCurrencies.set(currencyNameKey, currency);
      } else if (currency.currencyType === SaleWidgetCurrencyType.SWAPPABLE) {
        if (!settlementCurrencies.has(currencyNameKey)) {
          swappableCurrencies.set(currencyNameKey, currency);
        }
      }
    }
  }

  const sortedAndUniqueCurrencies = [
    ...(baseCurrency ? [baseCurrency] : []),
    ...settlementCurrencies.values(),
    ...swappableCurrencies.values(),
  ];

  return sortedAndUniqueCurrencies;
};
