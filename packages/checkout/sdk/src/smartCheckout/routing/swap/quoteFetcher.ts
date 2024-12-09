import { TransactionResponse } from '@imtbl/dex-sdk';
import { CheckoutConfiguration } from '../../../config';
import * as instance from '../../../instance';
import { ChainId } from '../../../types';
import { DexQuote, DexQuotes } from '../types';
import { measureAsyncExecution } from '../../../logger/debugLogger';

export const quoteFetcher = async (
  config: CheckoutConfiguration,
  chainId: ChainId,
  walletAddress: string,
  requiredToken: {
    address: string,
    amount: bigint,
  },
  swappableTokens: string[],
): Promise<DexQuotes> => {
  const dexQuotes: DexQuotes = new Map<string, DexQuote>();
  // Apply a small slippage percent as a buffer to cover price fluctuations between token pairs
  const slippagePercent = 1;

  try {
    const exchange = await instance.createExchangeInstance(chainId, config);
    const dexTransactionResponsePromises: Promise<TransactionResponse>[] = [];
    const fromToken: string[] = [];

    // Create a quote for each swappable token
    for (const swappableToken of swappableTokens) {
      if (swappableToken === requiredToken.address) continue;
      dexTransactionResponsePromises.push(exchange.getUnsignedSwapTxFromAmountOut(
        walletAddress,
        swappableToken,
        requiredToken.address,
        requiredToken.amount,
        slippagePercent,
      ));
      fromToken.push(swappableToken);
    }

    // Resolve all the quotes and link them back to the swappable token
    // The swappable token array is in the same position in the array as the quote in the promise array
    const dexTransactionResponse = await measureAsyncExecution<PromiseSettledResult<TransactionResponse>[]>(
      config,
      'Time to resolve swap quotes from the dex',
      Promise.allSettled(dexTransactionResponsePromises),
    );

    dexTransactionResponse.forEach((response, index) => {
      if (response.status === 'rejected') return; // Ignore any requests to dex that failed to resolve
      const swappableToken = fromToken[index];
      dexQuotes.set(swappableToken, {
        quote: response.value.quote,
        approval: response.value.approval?.gasFeeEstimate ?? null,
        swap: response.value.swap.gasFeeEstimate,
      });
    });

    return dexQuotes;
  } catch {
    return dexQuotes;
  }
};
