import { Route, SwapQuoter } from '@uniswap/v3-sdk';
import { TradeType, Token, Price, Fraction } from '@uniswap/sdk-core';
import { AbiCoder, Result } from 'ethers';
import { CoinAmount, ERC20 } from '../types';
import {
  newAmount, quoteReturnMapping, toCurrencyAmount, uniswapTokenToERC20,
} from './utils';
import { BlockTag } from './multicall';

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
  priceImpact: Fraction;
};

export function parseQuoteResult(
  quoteResult: Result,
  route: Route<Token, Token>,
  amountSpecified: CoinAmount<ERC20>,
  tradeType: TradeType,
) {
  const quoteAmount = quoteResult[amountIndex];
  if (typeof quoteAmount !== 'bigint') throw new Error('Expected BigNumber');

  const { midPrice, input, output } = route;
  const inputToken = uniswapTokenToERC20(input);
  const outputToken = uniswapTokenToERC20(output);

  const amountIn = tradeType === TradeType.EXACT_INPUT ? amountSpecified : newAmount(quoteAmount, inputToken);
  const amountOut = tradeType === TradeType.EXACT_INPUT ? newAmount(quoteAmount, outputToken) : amountSpecified;

  const executionPrice = new Price(
    input,
    output,
    amountIn.value.toString(),
    amountOut.value.toString(),
  );

  const priceImpact = executionPrice.subtract(midPrice.asFraction).divide(midPrice.asFraction).multiply(100);

  // console.log({
  //   midprice: midPrice.toSignificant(10),
  //   executionPrice: executionPrice.toSignificant(10),
  //   priceImpact: priceImpact.toSignificant(10),
  //   route: route.tokenPath.map((token) => token.symbol),
  // });

  return {
    route,
    amountIn,
    amountOut,
    gasEstimate: BigInt(quoteResult[gasEstimateIndex]),
    tradeType,
    priceImpact,
  };
}

export async function getQuotesForRoutes(
  provider: Provider,
  quoterContractAddress: string,
  routes: Route<Token, Token>[],
  amountSpecified: CoinAmount<ERC20>,
  tradeType: TradeType,
  blockTag: BlockTag,
): Promise<QuoteResult[]> {
  const callDatas = routes.map(
    (route) => SwapQuoter.quoteCallParameters(route, toCurrencyAmount(amountSpecified), tradeType, {
      useQuoterV2: true,
    }).calldata,
  );

  const promises = await Promise.allSettled(callDatas.map((data) =>
    provider.send('eth_call', [{ to: quoterContractAddress, data }, blockTag])));

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
      const quoteResult = parseQuoteResult(decodedQuoteResult, routes[i], amountSpecified, tradeType);
      quoteResults.push(quoteResult);
    } catch {
      // Failed to get the quote for this particular route
      // Other quotes for routes may still succeed, so do nothing
      // and continue processing
    }

    return quoteResults;
  }, new Array<QuoteResult>());

  return decodedQuoteResults;
}
