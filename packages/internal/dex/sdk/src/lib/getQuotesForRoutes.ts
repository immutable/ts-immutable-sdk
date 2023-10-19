import { Route, SwapQuoter } from '@uniswap/v3-sdk';
import { TradeType, Token } from '@uniswap/sdk-core';
import { BigNumber, ethers } from 'ethers';
import { ProviderCallError } from 'errors';
import { CoinAmount, ERC20 } from 'types';
import { multicallMultipleCallDataSingContract, MulticallResponse } from './multicall';
import { newAmount, quoteReturnMapping, toCurrencyAmount, uniswapTokenToERC20 } from './utils';
import { Multicall } from '../contracts/types';
import { TradeRequest } from './tradeRequest/base';

const amountIndex = 0;
const gasEstimateIndex = 3;

export type QuoteResult = {
  route: Route<Token, Token>;
  gasEstimate: ethers.BigNumber;
  amount: CoinAmount<ERC20>;
};

export async function getQuotesForRoutes(
  multicallContract: Multicall,
  quoterContractAddress: string,
  routes: Route<Token, Token>[],
  tradeRequest: TradeRequest,
): Promise<QuoteResult[]> {
  const callData = routes.map(
    (route) =>
      SwapQuoter.quoteCallParameters(route, toCurrencyAmount(tradeRequest.ourQuoteReqAmount), tradeRequest.tradeType, {
        useQuoterV2: true,
      }).calldata,
  );

  let quoteResults: MulticallResponse;
  try {
    quoteResults = await multicallMultipleCallDataSingContract(multicallContract, callData, quoterContractAddress);
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

    try {
      const decodedQuoteResult = ethers.utils.defaultAbiCoder.decode(
        returnTypes,
        quoteResults.returnData[i].returnData,
      );

      if (decodedQuoteResult) {
        // The 0th element in each decoded data is going to be the amountOut or amountIn.
        const quoteAmount = decodedQuoteResult[amountIndex];
        if (!(quoteAmount instanceof BigNumber)) throw new Error('Expected BigNumber');

        const amount = tradeRequest.tradeType === TradeType.EXACT_INPUT
          ? newAmount(quoteAmount, uniswapTokenToERC20(routes[i].output))
          : newAmount(quoteAmount, uniswapTokenToERC20(routes[i].input));

        const gasEstimate = ethers.BigNumber.from(decodedQuoteResult[gasEstimateIndex]);

        decodedQuoteResults.push({
          route: routes[i],
          amount,
          gasEstimate,
        });
      }
    } catch {
      // Failed to get the quote for this particular route
      // Other quotes for routes may still succeed, so do nothing
      // and continue processing
    }
  }

  return decodedQuoteResults;
}
