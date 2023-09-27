import { BigNumber, utils } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { CheckoutConfiguration, getL2ChainId } from '../../../config';
import {
  ChainId,
  FundingRouteType,
  GetBalanceResult,
  RoutingOptionsAvailable,
  TokenInfo,
} from '../../../types';
import {
  BalanceERC20Requirement,
  BalanceNativeRequirement,
} from '../../balanceCheck/types';
import {
  DexQuoteCache,
  FundingRouteStep,
  TokenBalanceResult,
} from '../types';
import { getOrSetQuotesFromCache } from '../swap/dexQuoteCache';
import { bridgeRoute } from '../bridge/bridgeRoute';
import { swapRoute } from '../swap/swapRoute';
import { getTokenBalances } from './getTokenBalances';
import { constructBridgeRequirements } from './constructBridgeRequirements';
import { CrossChainTokenMapping } from '../indexer/fetchL1Representation';
import { fetchCrossChainMapping } from './fetchCrossChainAddressMapping';

export const abortBridgeAndSwap = (
  bridgeableTokens: string[],
  swappableTokens: string[],
  l1balances: GetBalanceResult[],
  l2balances: GetBalanceResult[],
  availableRoutingOptions: RoutingOptionsAvailable,
  requiredTokenAddress: string | undefined,
) => {
  if (bridgeableTokens.length === 0) return true;
  if (swappableTokens.length === 0) return true;
  if (l1balances.length === 0) return true;
  if (l2balances.length === 0) return true;
  if (!availableRoutingOptions.bridge) return true;
  if (!availableRoutingOptions.swap) return true;
  if (requiredTokenAddress === undefined) return true;
  if (requiredTokenAddress === '') return true;
  return false;
};

export const filterSwappableTokensByBridgeableAddresses = (
  requiredTokenAddress: string,
  bridgeableTokens: string[],
  crossChainTokenMapping: CrossChainTokenMapping[],
): string[] => {
  const filteredSwappableTokens: string[] = [];

  for (const addresses of crossChainTokenMapping) {
    if (addresses.l1address === '') continue;
    if (addresses.l2token.l2address === '') continue;
    if (!bridgeableTokens.includes(addresses.l1address)) continue;
    if (addresses.l2token.l2address !== requiredTokenAddress) continue;

    filteredSwappableTokens.push(addresses.l2token.l2address);
  }

  return filteredSwappableTokens;
};

// Modifies a users balance to include the amount as if the user successfully bridged
// This is so the swap route can check against the balance once the user has performed a bridge
const modifyTokenBalancesWithBridgedAmount = (
  config: CheckoutConfiguration,
  tokenBalances: Map<ChainId, TokenBalanceResult>,
  l2balances: GetBalanceResult[],
  bridgedTokens: {
    amount: BigNumber, // The amount that was bridged
    token: TokenInfo
  }[],
): Map<ChainId, TokenBalanceResult> => {
  let modifiedTokenBalances: Map<ChainId, TokenBalanceResult> = new Map();
  modifiedTokenBalances = { ...tokenBalances };

  // Construct a map of balances to the L2 token address to make
  // it easier to adjust the balances for the tokens that can be bridged
  const balanceMap = new Map<string, GetBalanceResult>();
  for (const balance of l2balances) {
    if (!balance.token.address) continue;
    balanceMap.set(balance.token.address, balance);
  }

  // Go through each of the tokens that can be bridged
  // and adjust the balances to fake the bridge
  for (const bridgedToken of bridgedTokens) {
    const { amount, token } = bridgedToken;
    if (!token.address) continue;

    let l2balance = BigNumber.from(0);
    // Find the current balance of this token
    const currentBalance = balanceMap.get(token.address);
    if (currentBalance) l2balance = currentBalance.balance;

    const newBalance = l2balance.add(amount);

    balanceMap.set(token.address, {
      balance: newBalance,
      formattedBalance: utils.formatUnits(
        newBalance,
        token.decimals,
      ),
      token,
    });
  }

  const updatedBalances = Array.from(balanceMap.values());
  modifiedTokenBalances.set(
    getL2ChainId(config),
    {
      success: true,
      balances: updatedBalances,
    },
  );

  return modifiedTokenBalances;
};

export const bridgeAndSwapRoute = async (
  config: CheckoutConfiguration,
  readOnlyProviders: Map<ChainId, JsonRpcProvider>,
  availableRoutingOptions: RoutingOptionsAvailable,
  insufficientRequirement: BalanceNativeRequirement | BalanceERC20Requirement,
  dexQuoteCache: DexQuoteCache,
  ownerAddress: string,
  feeEstimates: Map<FundingRouteType, BigNumber>,
  tokenBalances: Map<ChainId, TokenBalanceResult>,
  bridgeableTokens: string[],
  swappableTokens: string[],
): Promise<FundingRouteStep[] | undefined> => {
  const { l1balances, l2balances } = getTokenBalances(config, tokenBalances);
  const requiredTokenAddress = insufficientRequirement.required.token.address;

  if (abortBridgeAndSwap(
    bridgeableTokens,
    swappableTokens,
    l1balances,
    l2balances,
    availableRoutingOptions,
    requiredTokenAddress,
  )) return undefined;

  // Fetch L2 to L1 address mapping and based on the L1 address existing then
  // filter the bridgeable and swappable tokens list further to only include
  // tokens that can be both swapped and bridged
  const crossChainTokenMapping = await fetchCrossChainMapping(config, swappableTokens);
  const filteredSwappableTokens = filterSwappableTokensByBridgeableAddresses(
    requiredTokenAddress as string,
    bridgeableTokens,
    crossChainTokenMapping,
  );

  // Fetch all the dex quotes from the list of swappable tokens
  const dexQuotes = await getOrSetQuotesFromCache(
    config,
    dexQuoteCache,
    ownerAddress,
    {
      address: (insufficientRequirement.required as any).token.address,
      amount: insufficientRequirement.delta.balance,
    },
    filteredSwappableTokens,
  );

  // Construct bridge requirements based on L2 balances, slippage and swap fees
  const bridgeRequirements = constructBridgeRequirements(
    dexQuotes,
    l1balances,
    l2balances,
    crossChainTokenMapping,
  );
  if (bridgeRequirements.length === 0) return undefined;

  // Create a mapping of bridge routes to L2 addresses
  const bridgePromises = new Map<string, Promise<FundingRouteStep | undefined>>();
  // Create map of bridgeable tokens to make it easier to get the amount that was bridged when modifying the users balance later
  const bridgeableTokenMap = new Map<string, { amount: BigNumber, token: TokenInfo }>();
  const bridgedTokens: {
    amount: BigNumber,
    token: TokenInfo,
  }[] = [];
  for (const bridgeRequirement of bridgeRequirements) {
    if (!bridgeRequirement.token.address) continue;
    bridgePromises.set(
      bridgeRequirement.token.address,
      bridgeRoute(
        config,
        readOnlyProviders,
        ownerAddress,
        availableRoutingOptions,
        bridgeRequirement,
        tokenBalances,
        feeEstimates,
      ),
    );
    bridgeableTokenMap.set(bridgeRequirement.token.address, {
      amount: bridgeRequirement.amountToBridge.amount,
      token: bridgeRequirement.token,
    });
  }

  const bridgeResults = await Promise.all(bridgePromises.values());
  const bridgeKeys = Array.from(bridgePromises.keys());

  // Create an array to store all the tokens that are able to be bridged
  const swappableTokensAfterBridging: string[] = [];

  // Iterate through all the bridge route results
  // If a bridge route result was successful then add this token to the
  // list of tokens that should be checked with the swap route
  bridgeResults.forEach((result, index) => {
    const key = bridgeKeys[index];
    if (result === undefined) return;
    swappableTokensAfterBridging.push(key);

    const bridgedToken = bridgeableTokenMap.get(key);
    if (!bridgedToken) return;
    bridgedTokens.push({
      amount: bridgedToken.amount,
      token: bridgedToken.token,
    });
  });

  // Bridge route determined that no tokens could be bridged
  if (swappableTokensAfterBridging.length === 0) return undefined;
  if (bridgedTokens.length === 0) return undefined; // No tokens were bridged

  // Modify the users L2 balance to include the amount as if the user successfully bridged
  const modifiedTokenBalances = modifyTokenBalancesWithBridgedAmount(
    config,
    tokenBalances,
    l2balances,
    bridgedTokens,
  );

  // Call the swap route with the faked balances
  // WT-1474: Swap currently returns 1 funding route but is going to return an array of all routes
  const swapRoutes = swapRoute(
    config,
    availableRoutingOptions,
    dexQuoteCache,
    ownerAddress,
    insufficientRequirement,
    modifiedTokenBalances,
    swappableTokensAfterBridging,
  );

  if (!swapRoutes) return undefined;

  return undefined;
};
