import { BigNumber } from 'ethers';
import {
  Amount,
  Quote,
  TransactionResponse,
} from '@imtbl/dex-sdk';
import { CheckoutConfiguration } from '../../../config';
import * as instance from '../../../instance';
import { ChainId } from '../../../types';
import { CheckoutError, CheckoutErrorType } from '../../../errors';

export type QuoteFetcherResponse = {
  [swappableToken: string]: {
    quote: Quote,
    approval: Amount | null | undefined,
    swap: Amount | null,
  }
};

export const quoteFetcher = async (
  config: CheckoutConfiguration,
  chainId: ChainId,
  walletAddress: string,
  requiredToken: {
    address: string,
    amount: BigNumber,
  },
  swappableTokens: string[],
): Promise<QuoteFetcherResponse> => {
  try {
    const exchange = await instance.createExchangeInstance(chainId, config);

    const dexTransactionResponsePromises: Promise<TransactionResponse>[] = [];
    const quoteFetcherResponse: QuoteFetcherResponse = {};

    // Create a quote for each swappable token
    for (const swappableToken of swappableTokens) {
      dexTransactionResponsePromises.push(exchange.getUnsignedSwapTxFromAmountIn(
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
      quoteFetcherResponse[swappableToken] = {
        quote: response.quote,
        approval: response.approval?.gasFeeEstimate,
        swap: response.swap.gasFeeEstimate,
      };
    });

    return quoteFetcherResponse;
  } catch (err: any) {
    throw new CheckoutError(
      'Error fetching quotes for swappable tokens',
      CheckoutErrorType.FETCH_SWAP_QUOTE_ERROR,
      {
        message: err.message,
      },
    );
  }
};
