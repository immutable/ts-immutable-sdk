import {
  Percent,
} from '@uniswap/sdk-core';

// slippageToPercent takes the slippage as a percentage (e.g. 0.1) and
// converts it to the Uniswap equivalent type
export const slippageToFraction = (slippage: number): Percent => {
  // If we receive a whole number, we can return slippage/100
  const noDecimals = slippage.toString().split('.').length === 1;
  if (noDecimals) {
    return new Percent(slippage, 100);
  }

  // Divide the slippage number by 100 to get the decimal
  const slippageDecimal = slippage / 100;

  // Split into two parts by the decimal place
  const parts = slippageDecimal.toString().split('.');

  // Get the numerator by adding the two parts together
  const numerator = parts[0] + parts[1];

  // Get the denominator by multiplying decimals^10
  const denominator = 10 ** parts[1].length;

  return new Percent(numerator, denominator);
};
