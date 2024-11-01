import { BigNumber, utils } from 'ethers';

import { tokenValueFormat } from '../../../lib/utils';
import { DEFAULT_TOKEN_FORMATTING_DECIMALS } from '../../../lib/constants';

/**
 * Formats a number to a string with a maximum number of decimals
 * removing trailing zeros
 */
export const getFormattedAmounts = (
  value: string | number,
  maxDecimals = DEFAULT_TOKEN_FORMATTING_DECIMALS,
) => {
  const amount = typeof value === 'number' ? value : parseFloat(value);

  if (amount > 0 && amount < 1) {
    return tokenValueFormat(amount, maxDecimals).replace(/\.?0+$/, '');
  }

  return tokenValueFormat(amount, maxDecimals);
};

/**
 * Converts a crypto amount to a formatted string
 */
export function getFormattedNumber(
  value?: string | number,
  decimals?: number,
  maxDecimals = DEFAULT_TOKEN_FORMATTING_DECIMALS,
): string {
  const amount = String(value);
  let formattedValue = '';

  try {
    if (Number.isNaN(amount) || !decimals) {
      throw new Error('Invalid amount or decimals');
    }

    formattedValue = utils
      .formatUnits(BigNumber.from(amount), decimals)
      .toString();
  } catch {
    return '-.--';
  }

  return getFormattedAmounts(formattedValue, maxDecimals);
}

export function getFormattedNumberWithDecimalPlaces(value: string | number, decimals = 2) : string {
  const amount = typeof value === 'number' ? value : parseFloat(value);

  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}
