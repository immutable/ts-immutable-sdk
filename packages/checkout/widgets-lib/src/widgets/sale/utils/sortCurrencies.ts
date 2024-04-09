import { SaleWidgetCurrency } from '../types';

export const sortCurrencies = (
  currencies: SaleWidgetCurrency[],
): SaleWidgetCurrency[] => currencies.sort((a, b) => {
  // Settlement with 'base' = true comes first
  if (a.currencyType === 'settlement' && b.currencyType === 'settlement') {
    if (a.base === true && !b.base) {
      return -1;
    }
    if (!a.base && b.base === true) {
      return 1;
    }
    return 0;
  }
  // Settlement currencies come before swappable currencies
  if (a.currencyType === 'settlement' && b.currencyType === 'swappable') {
    return -1;
  }
  if (a.currencyType === 'swappable' && b.currencyType === 'settlement') {
    return 1;
  }
  return 0;
});
