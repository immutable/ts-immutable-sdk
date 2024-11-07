import { Route, SwapQuoter } from '@uniswap/v3-sdk';
import { TradeType, Token } from '@uniswap/sdk-core';
import { CoinAmount, ERC20 } from '../types';
import {
  newAmount, quoteReturnMapping, toCurrencyAmount, uniswapTokenToERC20,
} from './utils';
import { AbiCoder } from 'ethers';

const amountIndex = 0;
const gasEstimateIndex = 3;

export interface Provider {
  send: (method: string, params: any[]) => Promise<string>;
}

export type QuoteResult = {
  route: Route<Token, Token>;
  gasEstimate: bigint
  amountIn: CoinAmount<ERC20>;
  amountOut: CoinAmount<ERC20>;
  tradeType: TradeType;
};

export async function getQuotesForRoutes(
  provider: Provider,
  quoterContractAddress: string,
  routes: Route<Token, Token>[],
  amountSpecified: CoinAmount<ERC20>,
  tradeType: TradeType,
): Promise<QuoteResult[]> {
  const callDatas = routes.map(
    (route) => SwapQuoter.quoteCallParameters(route, toCurrencyAmount(amountSpecified), tradeType, {
      useQuoterV2: true,
    }).calldata,
  );

  const promises = await Promise.allSettled(callDatas.map((data) =>
    provider.send('eth_call', [
      { to: quoterContractAddress, data }, 'latest',
    ])));

  const decodedQuoteResults = promises.reduce((quoteResults, promiseResult, i) => {
    if (promiseResult.status === 'rejected') return quoteResults;

    const functionSig = callDatas[i].substring(0, 10);
    const returnTypes = quoteReturnMapping[functionSig];
    if (!returnTypes) {
      throw new Error('No quoting function signature found');
    }

    if (promiseResult.value === '0x') {
      // There is no quote result for the swap using this route, so don't include it in results
      return quoteResults;
    }

    try {
      const decodedQuoteResult = AbiCoder.defaultAbiCoder().decode(
        returnTypes,
        promiseResult.value,
      );

      if (decodedQuoteResult) {
        // The 0th element in each decoded data is going to be the amountOut or amountIn.
        const quoteAmount = decodedQuoteResult[amountIndex];
        if (typeof quoteAmount !== 'bigint') throw new Error('Expected BigNumber');

        const input = uniswapTokenToERC20(routes[i].input);
        const output = uniswapTokenToERC20(routes[i].output);

        quoteResults.push({
          route: routes[i],
          amountIn: tradeType === TradeType.EXACT_INPUT ? amountSpecified : newAmount(quoteAmount, input),
          amountOut: tradeType === TradeType.EXACT_INPUT ? newAmount(quoteAmount, output) : amountSpecified,
          gasEstimate: BigInt(decodedQuoteResult[gasEstimateIndex]),
          tradeType,
        });
      }
    } catch {
      // Failed to get the quote for this particular route
      // Other quotes for routes may still succeed, so do nothing
      // and continue processing
    }

    return quoteResults;
  }, new Array<QuoteResult>());

  return decodedQuoteResults;
}
