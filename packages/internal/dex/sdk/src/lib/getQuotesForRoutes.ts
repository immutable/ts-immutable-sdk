/* eslint-disable max-len */
import { Route, SwapQuoter } from '@uniswap/v3-sdk';
import * as Uniswap from '@uniswap/sdk-core';
import { BigNumber, ethers } from 'ethers';
import { ProviderCallError } from 'errors';
import { CurrencyAmount, Token } from 'types/amount';
import { multicallMultipleCallDataSingContract, MulticallResponse } from './multicall';
import { quoteReturnMapping, toCurrencyAmount } from './utils';
import { Multicall } from '../contracts/types';

const amountIndex = 0;
const gasEstimateIndex = 3;

export type QuoteResult = {
  route: Route<Uniswap.Token, Uniswap.Token>;
  gasEstimate: ethers.BigNumber
  amountIn: CurrencyAmount<Token>;
  amountOut: CurrencyAmount<Token>;
  tradeType: Uniswap.TradeType;
};

export async function getQuotesForRoutes(
  multicallContract: Multicall,
  quoterContractAddress: string,
  routes: Route<Uniswap.Token, Uniswap.Token>[],
  amountSpecified: CurrencyAmount<Token>,
  tradeType: Uniswap.TradeType,
): Promise<QuoteResult[]> {
  const callData = routes.map(
    (route) => SwapQuoter.quoteCallParameters(route, toCurrencyAmount(amountSpecified), tradeType, {
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

    try {
      const decodedQuoteResult = ethers.utils.defaultAbiCoder.decode(
        returnTypes,
        quoteResults.returnData[i].returnData,
      );

      if (decodedQuoteResult) {
        // The 0th element in each decoded data is going to be the amountOut or amountIn.
        const quoteAmount = decodedQuoteResult[amountIndex];
        if (!(quoteAmount instanceof BigNumber)) throw new Error('Expected BigNumber');

        const tokenIn = new Token(routes[i].chainId, routes[i].input.address, routes[i].input.decimals, routes[i].input.symbol, routes[i].input.name);
        const tokenOut = new Token(routes[i].chainId, routes[i].output.address, routes[i].output.decimals, routes[i].output.symbol, routes[i].output.name);

        decodedQuoteResults.push({
          route: routes[i],
          amountIn: tradeType === Uniswap.TradeType.EXACT_INPUT ? amountSpecified : new CurrencyAmount(tokenIn, quoteAmount),
          amountOut: tradeType === Uniswap.TradeType.EXACT_INPUT ? new CurrencyAmount(tokenOut, quoteAmount) : amountSpecified,
          gasEstimate: ethers.BigNumber.from(decodedQuoteResult[gasEstimateIndex]),
          tradeType,
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
