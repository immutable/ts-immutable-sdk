import { tokenSymbolNameOverrides } from 'lib/utils';
import { OrderQuotePricing } from '../types';

export const getPricingBySymbol = (
  symbol: string,
  prices: Record<string, OrderQuotePricing> | undefined,
  conversions: Map<string, number>,
): OrderQuotePricing | undefined => {
  if (!prices) {
    return undefined;
  }

  const lowerSymbol = symbol.toLowerCase();
  const lowerSymbolOverride = tokenSymbolNameOverrides[lowerSymbol]?.toLowerCase();

  // try to find pricing from config
  const pricing = Object.values(prices).find(
    (p) => [lowerSymbol, lowerSymbolOverride].includes(p.currency.toLowerCase()),
  );

  if (pricing) {
    return pricing;
  }

  // try to compute pricing from USDC conversion
  const conversion = conversions.get(lowerSymbol) || conversions.get(lowerSymbolOverride);
  if (conversion && prices.USDC) {
    return {
      currency: symbol,
      type: prices.USDC.type,
      amount: prices.USDC.amount * conversion,
    };
  }

  return undefined;
};
