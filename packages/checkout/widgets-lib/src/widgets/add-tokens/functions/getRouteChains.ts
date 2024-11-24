import { RouteResponse } from '@0xsquid/squid-types';
import { Chain } from '../types';

/**
 * Find a chain by its id
 * @param chainId - The id of the chain to find
 * @param chains - The chains to search through
 * @returns The chain with the matching id, or undefined if no chain is found
 */
function findChainById(
  chainId: string | undefined,
  chains: Chain[] | null,
): Chain | undefined {
  return chains?.find((chain) => chain.id === chainId);
}

/**
 * Get the chains from the route
 * @param chains - The chains to search through
 * @param route - The route to get the chains from
 * @returns The chains from the route
 */
export const getRouteChains = (
  chains: Chain[] | null,
  route: RouteResponse | undefined,
): {
  fromChain: Chain | undefined;
  toChain: Chain | undefined;
} => ({
  fromChain: findChainById(route?.route.estimate.fromToken.chainId, chains),
  toChain: findChainById(route?.route.estimate.toToken.chainId, chains),
});
