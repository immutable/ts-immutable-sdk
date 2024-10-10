import { BigNumber, utils } from 'ethers';

import { tokenValueFormat } from '../../../lib/utils';
import { DEFAULT_TOKEN_FORMATTING_DECIMALS } from '../../../lib/constants';

/**
 * Formats a number to a string with a maximum number of decimals
 * removing trailing zeros
 */
export const getFormattedAmounts = (
  amount: string | number,
  maxDecimals = DEFAULT_TOKEN_FORMATTING_DECIMALS,
) => tokenValueFormat(amount, maxDecimals).replace(/\.?0+$/, '');

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
