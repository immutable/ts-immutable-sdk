import { ethers } from 'ethers';
import {
  Currency, CurrencyAmount, TradeType,
} from '@uniswap/sdk-core';
import { Pool, Route } from '@uniswap/v3-sdk';
import JSBI from 'jsbi';
import { NoRoutesAvailableError } from 'errors';
import { TokenInfo } from 'types';
import { poolEquals } from './utils';
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

export type QuoteTradeInfo = {
  route: Route<Currency, Currency>;
  amountIn: ethers.BigNumber;
  tokenIn: Currency;
  amountOut: ethers.BigNumber;
  tokenOut: Currency;
  tradeType: TradeType;
  gasEstimate: ethers.BigNumber
};

export type QuoteResponse = {
  trade: QuoteTradeInfo;
};

export class Router {
  public provider: ethers.providers.JsonRpcProvider;

  public routingTokens: TokenInfo[];

  public routingContracts: RoutingContracts;

  constructor(
    provider: ethers.providers.JsonRpcProvider,
    routingTokens: TokenInfo[],
    routingContracts: RoutingContracts,
  ) {
    this.provider = provider;
    this.routingTokens = routingTokens;
    this.routingContracts = routingContracts;
  }

  public async findOptimalRoute(
    amountSpecified: CurrencyAmount<Currency>,
    otherCurrency: Currency,
    tradeType: TradeType,
    maxHops: number = 2,
  ): Promise<QuoteResponse> {
    const [currencyIn, currencyOut] = this.determineERC20InAndERC20Out(
      tradeType,
      amountSpecified,
      otherCurrency,
    );

    const multicallContract = Multicall__factory.connect(
      this.routingContracts.multicallAddress,
      this.provider,
    );
    const erc20Pair: ERC20Pair = [currencyIn.wrapped, currencyOut.wrapped];

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
      currencyIn,
      currencyOut,
      pools,
      [],
      [],
      currencyIn,
      maxHops,
    );

    const noValidRoute = routes.length === 0;
    if (noValidRoute) {
      throw new NoRoutesAvailableError();
    }

    // Get the best quote from all of the given routes
    const bestQuoteForRoute = await this.getBestQuoteFromRoutes(
      multicallContract,
      routes,
      amountSpecified,
      otherCurrency,
      tradeType,
    );

    const { amountIn } = bestQuoteForRoute;
    const { amountOut } = bestQuoteForRoute;
    const amountInWei = ethers.BigNumber.from(
      amountIn.multiply(amountIn.decimalScale).toExact(),
    );
    const amountOutWei = ethers.BigNumber.from(
      amountOut.multiply(amountOut.decimalScale).toExact(),
    );

    return {
      trade: {
        route: bestQuoteForRoute.route,
        amountIn: amountInWei,
        tokenIn: currencyIn,
        amountOut: amountOutWei,
        tokenOut: currencyOut,
        tradeType,
        gasEstimate: bestQuoteForRoute.gasEstimate,
      },
    };
  }

  public async getBestQuoteFromRoutes(
    multicallContract: Multicall,
    routes: Route<Currency, Currency>[],
    amountSpecified: CurrencyAmount<Currency>,
    otherCurrency: Currency,
    tradeType: TradeType,
  ): Promise<
    | {
      route: Route<Currency, Currency>;
      amountIn: CurrencyAmount<Currency>;
      amountOut: CurrencyAmount<Currency>;
      gasEstimate: ethers.BigNumber
    }> {
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
    if (tradeType === TradeType.EXACT_INPUT) {
      const bestQuote = this.bestQuoteForAmountIn(quotes);
      const amountOut = CurrencyAmount.fromRawAmount(
        otherCurrency,
        bestQuote.quoteAmount,
      );
      return {
        route: bestQuote.route,
        amountIn: amountSpecified,
        amountOut,
        gasEstimate: bestQuote.gasEstimate,
      };
    }

    // We want to minimise the amountIn for the EXACT_OUTPUT type
    if (tradeType === TradeType.EXACT_OUTPUT) {
      const bestQuote = this.bestQuoteForAmountOut(quotes);
      const amountIn = CurrencyAmount.fromRawAmount(
        otherCurrency,
        bestQuote.quoteAmount,
      );
      return {
        route: bestQuote.route,
        amountIn,
        amountOut: amountSpecified,
        gasEstimate: bestQuote.gasEstimate,
      };
    }

    throw new Error('Invalid trade type');
  }

  // eslint-disable-next-line class-methods-use-this
  private bestQuoteForAmountIn(quotes: QuoteResult[]): QuoteResult {
    let bestQuote = quotes[0];

    for (let i = 1; i < quotes.length; i++) {
      if (JSBI.greaterThan(quotes[i].quoteAmount, bestQuote.quoteAmount)) bestQuote = quotes[i];
    }

    return bestQuote;
  }

  // eslint-disable-next-line class-methods-use-this
  private bestQuoteForAmountOut(quotes: QuoteResult[]): QuoteResult {
    let bestQuote = quotes[0];

    for (let i = 1; i < quotes.length; i++) {
      if (JSBI.lessThan(quotes[i].quoteAmount, bestQuote.quoteAmount)) bestQuote = quotes[i];
    }

    return bestQuote;
  }

  // eslint-disable-next-line class-methods-use-this
  private determineERC20InAndERC20Out(
    tradeType: TradeType,
    amountSpecified: CurrencyAmount<Currency>,
    otherCurrency: Currency,
  ): [Currency, Currency] {
    // If the trade type is EXACT INPUT then we have specified the amount for the tokenIn
    return tradeType === TradeType.EXACT_INPUT
      ? [amountSpecified?.currency, otherCurrency]
      : [otherCurrency, amountSpecified?.currency];
  }
}

export const generateAllAcyclicPaths = (
  currencyIn: Currency, // the currency we start with
  currencyOut: Currency, // the currency we want to end up with
  pools: Pool[], // list of all available pools
  // TODO: Fix default param should be last
  // eslint-disable-next-line @typescript-eslint/default-param-last
  currentRoute: Pool[] = [], // list of pools already traversed
  // eslint-disable-next-line @typescript-eslint/default-param-last
  routes: Route<Currency, Currency>[] = [], // list of all routes found so far
  // eslint-disable-next-line @typescript-eslint/default-param-last
  startCurrencyIn: Currency = currencyIn, // the currency we started with
  maxHops: number, // the maximum number of pools that can be traversed
): Route<Currency, Currency>[] => {
  const tokenIn = currencyIn.wrapped;

  const tokenOut = currencyOut.wrapped;

  for (const pool of pools) {
    // if the pool doesn't have the tokenIn or if it has already been traversed,
    // skip to the next pool
    const poolHasTokenIn = pool.involvesToken(tokenIn);
    const poolHasCycle = currentRoute.find((pathPool) => poolEquals(pool, pathPool));
    // eslint-disable-next-line no-continue
    if (!poolHasTokenIn || poolHasCycle) continue;

    // get the output token of the pool
    const outputToken = pool.token0.equals(tokenIn) ? pool.token1 : pool.token0;

    // if we have found a route to the target currency, add it to the list of routes
    const routeFound = outputToken.equals(tokenOut);
    if (routeFound) {
      routes.push(
        new Route([...currentRoute, pool], startCurrencyIn, currencyOut),
      );
    } else if (maxHops > 1) {
      // otherwise, if we haven't exceeded the maximum number of pools that can be traversed,
      // recursively call this function with the output token as the new starting currency
      generateAllAcyclicPaths(
        outputToken,
        currencyOut,
        pools,
        [...currentRoute, pool],
        routes,
        startCurrencyIn,
        maxHops - 1,
      );
    }
  }

  return routes;
};
