import { Route, SwapQuoter } from '@uniswap/v3-sdk';
import { TradeType, CurrencyAmount, Token } from '@uniswap/sdk-core';
import { BigNumber, ethers } from 'ethers';
import { ProviderCallError } from 'errors';
import { multicallMultipleCallDataSingContract, MulticallResponse } from './multicall';
import { quoteReturnMapping, toBigNumber } from './utils';
import { Multicall } from '../contracts/types';

const amountIndex = 0;
const gasEstimateIndex = 3;

export type QuoteResult = {
  route: Route<Token, Token>;
  gasEstimate: ethers.BigNumber
  amountIn: ethers.BigNumber;
  amountOut: ethers.BigNumber;
};

export async function getQuotesForRoutes(
  multicallContract: Multicall,
  quoterContractAddress: string,
  routes: Route<Token, Token>[],
  amountSpecified: CurrencyAmount<Token>,
  tradeType: TradeType,
): Promise<QuoteResult[]> {
  const callData = routes.map(
    (route) => SwapQuoter.quoteCallParameters(route, amountSpecified, tradeType, {
      useQuoterV2: true,
    }).calldata,
  );

  let quoteResults: MulticallResponse;
  try {
    quoteResults = await multicallMultipleCallDataSingContract(
      multicallContract,
      callData,
      quoterContractAddress,
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown Error';
    throw new ProviderCallError(`failed multicall: ${message}`);
  }

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

    if (quoteResults.returnData[i].returnData === '0x') {
      // There is no quote result for the swap using this route, so don't include it in results
      // eslint-disable-next-line no-continue
      continue;
    }

    let decodedQuoteResult: ethers.utils.Result | undefined;
    try {
      decodedQuoteResult = ethers.utils.defaultAbiCoder.decode(
        returnTypes,
        quoteResults.returnData[i].returnData,
      );
    } catch {
      // Failed to get the quote for this particular route
      // Other quotes for routes may still succeed, so do nothing
      // and continue processing
    }

    // TODO: ideally this is already a big number as we don't need a CurrencyAmount at this level
    const amountSpecifiedBigNumber = toBigNumber(amountSpecified);

    if (decodedQuoteResult) {
      // The 0th element in each decoded data is going to be the amountOut or amountIn.
      const quoteAmount: unknown = decodedQuoteResult[amountIndex];
      if (!(quoteAmount instanceof BigNumber)) throw new Error('quoteAmount is not a BigNumber');

      decodedQuoteResults.push({
        route: routes[i],
        amountIn: tradeType === TradeType.EXACT_INPUT ? amountSpecifiedBigNumber : quoteAmount,
        amountOut: tradeType === TradeType.EXACT_INPUT ? quoteAmount : amountSpecifiedBigNumber,
        gasEstimate: ethers.BigNumber.from(decodedQuoteResult[gasEstimateIndex]),
      });
    }
  }

  return decodedQuoteResults;
}
