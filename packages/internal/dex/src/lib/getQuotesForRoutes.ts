import { Route, SwapQuoter } from '@uniswap/v3-sdk';
import { Currency, TradeType, CurrencyAmount } from '@uniswap/sdk-core';
import JSBI from 'jsbi';
import { QUOTER_ADDRESS_CREATE2 } from '../constants';
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
  routes: Route<Currency, Currency>[],
  amountSpecified: CurrencyAmount<Currency>,
  tradeType: TradeType
): Promise<QuoteResult[]> {
  // With all valid routes, get the best quotes
  const callData = routes.map(
    (route) =>
      SwapQuoter.quoteCallParameters(route, amountSpecified, tradeType, {
        useQuoterV2: true,
      }).calldata
  );

  const quoteResults = await multicallMultipleCallDataSingContract(
    multicallContract,
    callData,
    QUOTER_ADDRESS_CREATE2,
    { gasRequired: DEFAULT_GAS_QUOTE }
  );

  let decodedQuoteResults: QuoteResult[] = [];
  for (let i in quoteResults.returnData) {
    const functionSig = callData[i].substring(0, 10);
    const returnTypes = quoteReturnMapping[functionSig];
    if (!returnTypes) {
      throw new Error('No quoting function signature found');
    }

    try {
      if (quoteResults.returnData[i].returnData === '0x') {
        // There is no quote result for the swap using this route, so don't include it in results
        continue;
      }

      const decodedQuoteResult = ethers.utils.defaultAbiCoder.decode(
        returnTypes,
        quoteResults.returnData[i].returnData
      );
      const quoteResult = {
        route: routes[i],
        quoteAmount: decodedQuoteResult[amountIndex], // The 0th element in each decoded data is going to be the amountOut or amountIn.
      };
      decodedQuoteResults.push(quoteResult);
    } catch {
      console.warn(
        `Quote failed with reason ${quoteResults.returnData[i].returnData}`
      );
    }
  }

  return decodedQuoteResults;
}
