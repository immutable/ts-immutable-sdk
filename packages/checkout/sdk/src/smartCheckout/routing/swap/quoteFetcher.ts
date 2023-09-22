import { BigNumber } from 'ethers';
import { TransactionResponse } from '@imtbl/dex-sdk';
import { CheckoutConfiguration } from '../../../config';
import * as instance from '../../../instance';
import { ChainId } from '../../../types';
import { DexQuote, DexQuotes } from '../types';

export const quoteFetcher = async (
  config: CheckoutConfiguration,
  chainId: ChainId,
  walletAddress: string,
  requiredToken: {
    address: string,
    amount: BigNumber,
  },
  swappableTokens: string[],
): Promise<DexQuotes> => {
  const dexQuotes: DexQuotes = new Map<string, DexQuote>();

  try {
    const exchange = await instance.createExchangeInstance(chainId, config);
    const dexTransactionResponsePromises: Promise<TransactionResponse>[] = [];

    // Create a quote for each swappable token
    for (const swappableToken of swappableTokens) {
      dexTransactionResponsePromises.push(exchange.getUnsignedSwapTxFromAmountOut(
        walletAddress,
        swappableToken,
        requiredToken.address,
        requiredToken.amount,
      ));
    }

    // Resolve all the quotes and link them back to the swappable token
    // The swappable token array is in the same position in the array as the quote in the promise array
    const dexTransactionResponse = await Promise.all(dexTransactionResponsePromises);
    dexTransactionResponse.forEach((response, index) => {
      const swappableToken = swappableTokens[index];
      dexQuotes.set(swappableToken, {
        quote: response.quote,
        approval: response.approval?.gasFeeEstimate,
        swap: response.swap.gasFeeEstimate,
      });
    });

    return dexQuotes;
  } catch (error) {
    console.error('Failed to fetch quotes from the dex', error);
    return dexQuotes;
  }
};
