import { Route, SwapQuoter } from '@uniswap/v3-sdk';
import { Currency, TradeType, CurrencyAmount } from '@uniswap/sdk-core';
import JSBI from 'jsbi';
import { ethers } from 'ethers';
import { multicallMultipleCallDataSingContract } from './multicall';
import { quoteReturnMapping } from './utils';
import { Multicall } from '../contracts/types';

export const DEFAULT_GAS_QUOTE = 2_000_000;
const amountIndex = 0;

export type QuoteResult = {
  route: Route<Currency, Currency>;
  quoteAmount: JSBI;
};

export async function getQuotesForRoutes(
  multicallContract: Multicall,
  quoterContractAddress: string,
  routes: Route<Currency, Currency>[],
  amountSpecified: CurrencyAmount<Currency>,
  tradeType: TradeType,
): Promise<QuoteResult[]> {
  // With all valid routes, get the best quotes
  const callData = routes.map(
    (route) => SwapQuoter.quoteCallParameters(route, amountSpecified, tradeType, {
      useQuoterV2: true,
    }).calldata,
  );

  const quoteResults = await multicallMultipleCallDataSingContract(
    multicallContract,
    callData,
    quoterContractAddress,
    { gasRequired: DEFAULT_GAS_QUOTE },
  );

  const decodedQuoteResults: QuoteResult[] = [];
  // TODO: for..in loops iterate over the entire prototype chain,
  // Use Object.{keys,values,entries}, and iterate over the resulting array.
  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const i in quoteResults.returnData) {
    const functionSig = callData[i].substring(0, 10);
    const returnTypes = quoteReturnMapping[functionSig];
    if (!returnTypes) {
      throw new Error('No quoting function signature found');
    }

    try {
      if (quoteResults.returnData[i].returnData === '0x') {
        // There is no quote result for the swap using this route, so don't include it in results
        // eslint-disable-next-line no-continue
        continue;
      }

      const decodedQuoteResult = ethers.utils.defaultAbiCoder.decode(
        returnTypes,
        quoteResults.returnData[i].returnData,
      );
      const quoteResult = {
        route: routes[i],
        // The 0th element in each decoded data is going to be the amountOut or amountIn.
        quoteAmount: decodedQuoteResult[amountIndex],
      };
      decodedQuoteResults.push(quoteResult);
    } catch {
      // TODO: Should there be a log statement here?
      // eslint-disable-next-line no-console
      console.warn(
        `Quote failed with reason ${quoteResults.returnData[i].returnData}`,
      );
    }
  }

  return decodedQuoteResults;
}
