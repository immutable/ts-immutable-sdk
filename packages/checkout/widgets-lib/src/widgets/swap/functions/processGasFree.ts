import { TransactionResponse } from '@imtbl/dex-sdk';
import { NamedBrowserProvider } from '@imtbl/checkout-sdk';
import { isGasFree } from '../../../lib/provider';

/**
 * Adjusts the quote for gas free txn so we don't have to adjust it everywhere
 * @param checkProvider
 * @param currentQuote
 */
export const processGasFree = (checkProvider: NamedBrowserProvider, currentQuote: TransactionResponse) => {
  if (!isGasFree(checkProvider)) {
    return currentQuote;
  }

  // Remove the quote gas fees as they are being covered by Relayer
  const adjustedQuote = { ...currentQuote };
  if (adjustedQuote.swap?.gasFeeEstimate) {
    adjustedQuote.swap.gasFeeEstimate.value = BigInt(0);
  }
  if (adjustedQuote.approval?.gasFeeEstimate) {
    adjustedQuote.approval.gasFeeEstimate.value = BigInt(0);
  }

  return adjustedQuote;
};
