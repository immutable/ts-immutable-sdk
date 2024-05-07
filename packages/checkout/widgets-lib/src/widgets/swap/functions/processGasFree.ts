import { Web3Provider } from '@ethersproject/providers';
import { TransactionResponse } from '@imtbl/dex-sdk';
import { BigNumber } from 'ethers';
import { isPassportProvider } from '../../../lib/provider';

/**
 * Adjusts the quote for gas free txn so we don't have to adjust it everywhere
 * @param checkProvider
 * @param currentQuote
 */
export const processGasFree = (checkProvider: Web3Provider, currentQuote: TransactionResponse) => {
  console.log('Processing gas free', checkProvider, currentQuote);
  if (!isPassportProvider(checkProvider)) {
    return currentQuote;
  }

  // Remove the quote gas fees as they are being covered by Relayer
  const adjustedQuote = { ...currentQuote };
  if (adjustedQuote.swap?.gasFeeEstimate) {
    adjustedQuote.swap.gasFeeEstimate.value = BigNumber.from(0);
  }
  if (adjustedQuote.approval?.gasFeeEstimate) {
    adjustedQuote.approval.gasFeeEstimate.value = BigNumber.from(0);
  }

  return adjustedQuote;
};
