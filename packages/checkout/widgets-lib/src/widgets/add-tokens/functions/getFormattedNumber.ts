import { formatUnits } from 'ethers';
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

  if (Number.isNaN(amount)) {
    return '-.--';
  }

  if (amount > 0 && amount < 1) {
    return tokenValueFormat(value, maxDecimals).replace(/\.?0+$/, '');
  }

  return tokenValueFormat(amount, maxDecimals);
};

/**
 * Converts a crypto amount to a formatted string
 */
export function getFormattedNumber(
  value?: string | number,
  decimals?: number,
  maxDecimals = 5,
): string {
  const amount = String(value);
  let formattedValue = '';

  try {
    if (Number.isNaN(amount) || !decimals) {
      throw new Error('Invalid amount or decimals');
    }

    formattedValue = formatUnits(BigInt(amount), decimals).toString();
  } catch {
    return '-.--';
  }

  return getFormattedAmounts(formattedValue, maxDecimals);
}
