import { ethers } from 'ethers';
import { Token } from '@uniswap/sdk-core';
import { Pool, Route } from '@uniswap/v3-sdk';
import { NoRoutesAvailableError } from 'errors';
import { ERC20 } from 'types';
import { erc20ToUniswapToken, poolEquals, uniswapTokenToERC20 } from './utils';
import { getQuotesForRoutes } from './getQuotesForRoutes';
import { fetchValidPools } from './poolUtils/fetchValidPools';
import { ERC20Pair } from './poolUtils/generateERC20Pairs';
import { Multicall__factory } from '../contracts/types';
import { TradeRequest } from './tradeRequest/base';
import { Quote } from './quote/base';

export type RoutingContracts = {
  multicallAddress: string;
  factoryAddress: string;
  quoterAddress: string;
};

export class Router {
  public provider: ethers.providers.JsonRpcProvider;

  public routingTokens: ERC20[];

  public routingContracts: RoutingContracts;

  constructor(provider: ethers.providers.JsonRpcProvider, routingTokens: ERC20[], routingContracts: RoutingContracts) {
    this.provider = provider;
    this.routingTokens = routingTokens;
    this.routingContracts = routingContracts;
  }

  public async findOptimalRoute(tradeRequest: TradeRequest, maxHops: number = 2): Promise<Quote> {
    const multicallContract = Multicall__factory.connect(this.routingContracts.multicallAddress, this.provider);
    const erc20Pair: ERC20Pair = [tradeRequest.tokenIn, tradeRequest.tokenOut];

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
      tradeRequest.tokenIn,
      tradeRequest.tokenOut,
      pools,
      maxHops,
      [],
      [],
      tradeRequest.tokenOut,
    );

    const noValidRoute = routes.length === 0;
    if (noValidRoute) {
      throw new NoRoutesAvailableError();
    }

    const quotes = await getQuotesForRoutes(
      multicallContract,
      this.routingContracts.quoterAddress,
      routes,
      tradeRequest,
    );
    if (quotes.length === 0) {
      throw new NoRoutesAvailableError();
    }

    return tradeRequest.getBestQuote(quotes);
  }
}

export const generateAllAcyclicPaths = (
  tokenIn: ERC20, // the currency we start with
  tokenOut: ERC20, // the currency we want to end up with
  pools: Pool[], // list of all available pools
  maxHops: number, // the maximum number of pools that can be traversed
  currentRoute: Pool[] = [], // list of pools already traversed
  routes: Route<Token, Token>[] = [], // list of all routes found so far
  startTokenIn: ERC20 = tokenIn, // the currency we started with
): Route<Token, Token>[] => {
  const currencyIn = erc20ToUniswapToken(tokenIn);
  const currencyOut = erc20ToUniswapToken(tokenOut);
  const startCurrencyIn = erc20ToUniswapToken(startTokenIn);

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
      routes.push(new Route([...currentRoute, pool], startCurrencyIn, currencyOut));
    } else if (maxHops > 1) {
      // otherwise, if we haven't exceeded the maximum number of pools that can be traversed,
      // recursively call this function with the output token as the new starting currency
      generateAllAcyclicPaths(
        uniswapTokenToERC20(outputToken),
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
