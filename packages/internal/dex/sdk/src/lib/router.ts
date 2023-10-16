import { ethers } from 'ethers';
import * as Uniswap from '@uniswap/sdk-core';
import { Pool, Route } from '@uniswap/v3-sdk';
import { NoRoutesAvailableError } from 'errors';
import { CurrencyAmount, Token } from 'types/amount';
import { poolEquals, tokenInfoToUniswapToken } from './utils';
import { getQuotesForRoutes, QuoteResult } from './getQuotesForRoutes';
import { fetchValidPools } from './poolUtils/fetchValidPools';
import { ERC20Pair } from './poolUtils/generateERC20Pairs';
import { Multicall, Multicall__factory } from '../contracts/types';

export type RoutingContracts = {
  multicallAddress: string;
  factoryAddress: string;
  quoterAddress: string;
  peripheryRouterAddress: string;
  secondaryFeeAddress: string;
};

export class Router {
  public provider: ethers.providers.JsonRpcProvider;

  public routingTokens: Token[];

  public routingContracts: RoutingContracts;

  constructor(
    provider: ethers.providers.JsonRpcProvider,
    routingTokens: Token[],
    routingContracts: RoutingContracts,
  ) {
    this.provider = provider;
    this.routingTokens = routingTokens;
    this.routingContracts = routingContracts;
  }

  public async findOptimalRoute(
    amountSpecified: CurrencyAmount<Token>,
    otherToken: Token,
    tradeType: Uniswap.TradeType,
    maxHops: number = 2,
  ): Promise<QuoteResult> {
    const [tokenIn, tokenOut] = this.determineERC20InAndERC20Out(
      tradeType,
      amountSpecified,
      otherToken,
    );

    const multicallContract = Multicall__factory.connect(
      this.routingContracts.multicallAddress,
      this.provider,
    );
    const erc20Pair: ERC20Pair = [tokenIn, tokenOut];

    // Get all pools and use these to get all possible routes.
    const pools = await fetchValidPools(
      multicallContract,
      erc20Pair,
      this.routingTokens,
      this.routingContracts.factoryAddress,
    );

    const noValidPools = pools.length === 0;
    if (noValidPools) {
      throw new NoRoutesAvailableError();
    }

    // Get all the possible routes from the given pools
    // TODO: Fix used before defined error
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const routes = generateAllAcyclicPaths(
      tokenIn,
      tokenOut,
      pools,
      maxHops,
      [],
      [],
      tokenIn,
    );

    const noValidRoute = routes.length === 0;
    if (noValidRoute) {
      throw new NoRoutesAvailableError();
    }

    // Get the best quote from all of the given routes
    return await this.getBestQuoteFromRoutes(
      multicallContract,
      routes,
      amountSpecified,
      tradeType,
    );
  }

  private async getBestQuoteFromRoutes(
    multicallContract: Multicall,
    routes: Route<Uniswap.Token, Uniswap.Token>[],
    amountSpecified: CurrencyAmount<Token>,
    tradeType: Uniswap.TradeType,
  ): Promise<QuoteResult> {
    const quotes = await getQuotesForRoutes(
      multicallContract,
      this.routingContracts.quoterAddress,
      routes,
      amountSpecified,
      tradeType,
    );
    if (quotes.length === 0) {
      throw new NoRoutesAvailableError();
    }

    // We want to maximise the amountOut for the EXACT_INPUT type
    if (tradeType === Uniswap.TradeType.EXACT_INPUT) {
      return this.bestQuoteForAmountIn(quotes);
    }

    // We want to minimise the amountIn for the EXACT_OUTPUT type
    if (tradeType === Uniswap.TradeType.EXACT_OUTPUT) {
      return this.bestQuoteForAmountOut(quotes);
    }

    throw new Error('Invalid trade type');
  }

  // eslint-disable-next-line class-methods-use-this
  private bestQuoteForAmountIn(quotes: QuoteResult[]): QuoteResult {
    let bestQuote = quotes[0];

    for (let i = 1; i < quotes.length; i++) {
      if (quotes[i].amountOut.value.gt(bestQuote.amountOut.value)) {
        bestQuote = quotes[i];
      }
    }

    return bestQuote;
  }

  // eslint-disable-next-line class-methods-use-this
  private bestQuoteForAmountOut(quotes: QuoteResult[]): QuoteResult {
    let bestQuote = quotes[0];

    for (let i = 1; i < quotes.length; i++) {
      if (quotes[i].amountIn.value.lt(bestQuote.amountIn.value)) {
        bestQuote = quotes[i];
      }
    }

    return bestQuote;
  }

  // eslint-disable-next-line class-methods-use-this
  private determineERC20InAndERC20Out(
    tradeType: Uniswap.TradeType,
    amountSpecified: CurrencyAmount<Token>,
    otherToken: Token,
  ): [Token, Token] {
    // If the trade type is EXACT INPUT then we have specified the amount for the tokenIn
    return tradeType === Uniswap.TradeType.EXACT_INPUT
      ? [amountSpecified.currency, otherToken]
      : [otherToken, amountSpecified.currency];
  }
}

export const generateAllAcyclicPaths = (
  tokenIn: Token, // the currency we start with
  tokenOut: Token, // the currency we want to end up with
  pools: Pool[], // list of all available pools
  maxHops: number, // the maximum number of pools that can be traversed
  currentRoute: Pool[] = [], // list of pools already traversed
  routes: Route<Uniswap.Token, Uniswap.Token>[] = [], // list of all routes found so far
  startTokenIn: Token = tokenIn, // the currency we started with
): Route<Uniswap.Token, Uniswap.Token>[] => {
  const currencyIn = tokenInfoToUniswapToken(tokenIn);
  const currencyOut = tokenInfoToUniswapToken(tokenOut);
  const startCurrencyIn = tokenInfoToUniswapToken(startTokenIn);

  for (const pool of pools) {
    // if the pool doesn't have the tokenIn or if it has already been traversed,
    // skip to the next pool
    const poolHasTokenIn = pool.involvesToken(currencyIn);
    const poolHasCycle = currentRoute.find((pathPool) => poolEquals(pool, pathPool));
    // eslint-disable-next-line no-continue
    if (!poolHasTokenIn || poolHasCycle) continue;

    // get the output token of the pool
    const outputToken = pool.token0.equals(currencyIn) ? pool.token1 : pool.token0;

    // if we have found a route to the target currency, add it to the list of routes
    const routeFound = outputToken.equals(currencyOut);
    if (routeFound) {
      routes.push(
        new Route([...currentRoute, pool], startCurrencyIn, currencyOut),
      );
    } else if (maxHops > 1) {
      // otherwise, if we haven't exceeded the maximum number of pools that can be traversed,
      // recursively call this function with the output token as the new starting currency
      generateAllAcyclicPaths(
        outputToken,
        tokenOut,
        pools,
        maxHops - 1,
        [...currentRoute, pool],
        routes,
        startTokenIn,
      );
    }
  }

  return routes;
};
