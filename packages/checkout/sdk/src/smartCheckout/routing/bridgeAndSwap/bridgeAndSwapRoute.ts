import { formatUnits, JsonRpcProvider } from 'ethers';
import { CheckoutConfiguration, getL2ChainId } from '../../../config';
import {
  AvailableRoutingOptions,
  BridgeFundingStep,
  ChainId,
  GetBalanceResult,
  SwapFundingStep,
  TokenInfo,
} from '../../../types';
import {
  BalanceCheckResult,
  BalanceERC20Requirement,
  BalanceNativeRequirement,
} from '../../balanceCheck/types';
import {
  TokenBalanceResult,
} from '../types';
import { BridgeRequirement, bridgeRoute } from '../bridge/bridgeRoute';
import { swapRoute } from '../swap/swapRoute';
import { getBalancesByChain } from './getBalancesByChain';
import { constructBridgeRequirements } from './constructBridgeRequirements';
import { fetchL1ToL2Mappings } from './fetchL1ToL2Mappings';
import { INDEXER_ETH_ROOT_CONTRACT_ADDRESS, L1ToL2TokenAddressMapping } from '../indexer/fetchL1Representation';
import { getDexQuotes } from './getDexQuotes';
import { isMatchingAddress } from '../../../utils/utils';

export const abortBridgeAndSwap = (
  bridgeableTokens: string[],
  swappableTokens: TokenInfo[],
  l1balances: GetBalanceResult[],
  l2balances: GetBalanceResult[],
  availableRoutingOptions: AvailableRoutingOptions,
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
  swappableTokens: TokenInfo[],
  l1tol2Addresses: L1ToL2TokenAddressMapping[],
): TokenInfo[] => {
  const filteredSwappableTokens: TokenInfo[] = [];

  for (const addresses of l1tol2Addresses) {
    // TODO: Check for ETH (native) L1 in bridgeableTokens first
    if (!bridgeableTokens.includes(addresses.l1address)) continue;
    // Filter out the token that is required from the swappable tokens list
    if (isMatchingAddress(addresses.l2address, requiredTokenAddress)) continue;

    const tokenInfo = swappableTokens.find(
      (token) => isMatchingAddress(token.address, addresses.l2address),
    );
    if (!tokenInfo) continue;
    filteredSwappableTokens.push(tokenInfo);
  }

  return filteredSwappableTokens;
};

// Modifies a users balance to include the amount as if the user successfully bridged
// This is so the swap route can check against the balance once the user has performed a bridge
const modifyTokenBalancesWithBridgedAmount = (
  config: CheckoutConfiguration,
  tokenBalances: Map<ChainId, TokenBalanceResult>,
  l2balances: GetBalanceResult[],
  bridgedTokens: BridgeRequirement[],
  swappableTokens: TokenInfo[], // used to construct the token info
): Map<ChainId, TokenBalanceResult> => {
  const modifiedTokenBalances: Map<ChainId, TokenBalanceResult> = new Map();
  for (const [chainId, tokenBalance] of tokenBalances) {
    modifiedTokenBalances.set(chainId, {
      success: tokenBalance.success,
      balances: tokenBalance.balances,
    });
  }

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
    const { amount, l2address } = bridgedToken;
    if (l2address === '') continue;

    let l2balance = BigInt(0);
    // Find the current balance of this token
    const currentBalance = balanceMap.get(l2address);
    if (currentBalance) l2balance = currentBalance.balance;

    const newBalance = l2balance + amount;

    const tokenInfo = swappableTokens.find((token) => isMatchingAddress(token.address, l2address)) as TokenInfo;

    balanceMap.set(l2address, {
      balance: newBalance,
      formattedBalance: formatUnits(
        newBalance,
        tokenInfo.decimals,
      ),
      token: tokenInfo,
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

// Reapply the original swap balances after the
// swap route was modified to fake the bridge
export const reapplyOriginalSwapBalances = (
  tokenBalances: Map<ChainId, TokenBalanceResult>,
  swapRoutes: SwapFundingStep[],
): SwapFundingStep[] => {
  const originalSwapSteps: SwapFundingStep[] = [];
  for (const route of swapRoutes) {
    const { chainId, fundingItem } = route;
    const { userBalance } = route.fundingItem;
    const tokenBalance = tokenBalances.get(chainId);
    if (!tokenBalance) continue;

    let originalBalance = BigInt(0);
    let originalFormattedBalance = '0';
    const l2balance = tokenBalance.balances.find(
      (balance) => isMatchingAddress(balance.token.address, fundingItem.token.address),
    );
    if (l2balance) {
      originalBalance = l2balance.balance;
      originalFormattedBalance = l2balance.formattedBalance;
    }

    userBalance.balance = originalBalance;
    userBalance.formattedBalance = originalFormattedBalance;

    originalSwapSteps.push(route);
  }

  return originalSwapSteps;
};

export const constructBridgeAndSwapRoutes = (
  bridgeFundingSteps: (BridgeFundingStep | undefined)[],
  swapFundingSteps: SwapFundingStep[],
  l1tol2Addresses: L1ToL2TokenAddressMapping[],
): BridgeAndSwapRoute[] => {
  const bridgeAndSwapRoutes: BridgeAndSwapRoute[] = [];

  for (const bridgeFundingStep of bridgeFundingSteps) {
    if (!bridgeFundingStep) continue;
    const mapping = l1tol2Addresses.find(
      (addresses) => {
        if (bridgeFundingStep.fundingItem.token.address === undefined) {
          return isMatchingAddress(addresses.l1address, INDEXER_ETH_ROOT_CONTRACT_ADDRESS) && addresses.l2address;
        }
        return (
          isMatchingAddress(
            addresses.l1address,
            bridgeFundingStep.fundingItem.token.address,
          )
          && addresses.l2address
        );
      },
    );
    if (!mapping) continue;

    const swapFundingStep = swapFundingSteps.find(
      (step) => isMatchingAddress(step.fundingItem.token.address, mapping.l2address),
    );
    if (!swapFundingStep) continue;

    bridgeAndSwapRoutes.push({
      bridgeFundingStep,
      swapFundingStep,
    });
  }

  return bridgeAndSwapRoutes;
};

export type BridgeAndSwapRoute = {
  bridgeFundingStep: BridgeFundingStep,
  swapFundingStep: SwapFundingStep,
};
export const bridgeAndSwapRoute = async (
  config: CheckoutConfiguration,
  readOnlyProviders: Map<ChainId, JsonRpcProvider>,
  availableRoutingOptions: AvailableRoutingOptions,
  insufficientRequirement: BalanceNativeRequirement | BalanceERC20Requirement,
  ownerAddress: string,
  tokenBalances: Map<ChainId, TokenBalanceResult>,
  bridgeableTokens: string[],
  swappableTokens: TokenInfo[],
  balanceRequirements: BalanceCheckResult,
): Promise<BridgeAndSwapRoute[]> => {
  const { l1balances, l2balances } = getBalancesByChain(config, tokenBalances);
  const requiredTokenAddress = insufficientRequirement.required.token.address;

  if (abortBridgeAndSwap(
    bridgeableTokens,
    swappableTokens,
    l1balances,
    l2balances,
    availableRoutingOptions,
    requiredTokenAddress,
  )) return [];

  // Fetch L2 to L1 address mapping and based on the L1 address existing then
  // filter the bridgeable and swappable tokens list further to only include
  // tokens that can be both swapped and bridged
  const l1tol2Addresses = await fetchL1ToL2Mappings(config, swappableTokens);
  const filteredSwappableTokens = filterSwappableTokensByBridgeableAddresses(
    requiredTokenAddress as string,
    bridgeableTokens,
    swappableTokens,
    l1tol2Addresses,
  );

  if (filteredSwappableTokens.length === 0) return [];

  // Fetch all the dex quotes from the list of swappable tokens
  const dexQuotes = await getDexQuotes(
    config,
    ownerAddress,
    requiredTokenAddress as string,
    insufficientRequirement,
    filteredSwappableTokens,
  );

  // Construct bridge requirements based on L2 balances, slippage and swap fees
  const bridgeRequirements = constructBridgeRequirements(
    dexQuotes,
    l1balances,
    l2balances,
    l1tol2Addresses,
    balanceRequirements,
  );
  if (bridgeRequirements.length === 0) return [];

  // Create a mapping of bridge routes to L2 addresses
  const bridgePromises = new Map<string, Promise<BridgeFundingStep | undefined>>();
  // Create map of bridgeable tokens to make it easier to get the amount that was bridged when modifying the users balance later
  const bridgeableRequirementsMap = new Map<string, BridgeRequirement>();
  const bridgedTokens: BridgeRequirement[] = [];
  for (const bridgeRequirement of bridgeRequirements) {
    if (!bridgeRequirement.l2address) continue;
    bridgePromises.set(
      bridgeRequirement.l2address,
      bridgeRoute(
        config,
        readOnlyProviders,
        availableRoutingOptions,
        bridgeRequirement,
        tokenBalances,
      ),
    );
    bridgeableRequirementsMap.set(bridgeRequirement.l2address, {
      amount: bridgeRequirement.amount,
      formattedAmount: bridgeRequirement.formattedAmount,
      l2address: bridgeRequirement.l2address,
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

    const bridgedToken = bridgeableRequirementsMap.get(key);
    if (!bridgedToken) return;
    bridgedTokens.push({
      amount: bridgedToken.amount,
      formattedAmount: bridgedToken.formattedAmount,
      l2address: bridgedToken.l2address,
    });
  });

  // Bridge route determined that no tokens could be bridged
  if (swappableTokensAfterBridging.length === 0) return [];
  if (bridgedTokens.length === 0) return []; // No tokens were bridged

  // Modify the users L2 balance to include the amount as if the user successfully bridged
  const modifiedTokenBalances = modifyTokenBalancesWithBridgedAmount(
    config,
    tokenBalances,
    l2balances,
    bridgedTokens,
    swappableTokens,
  );

  // Call the swap route with the faked bridged balances
  const swapRoutes = await swapRoute(
    config,
    availableRoutingOptions,
    ownerAddress,
    insufficientRequirement,
    modifiedTokenBalances,
    swappableTokensAfterBridging,
    balanceRequirements,
  );
  if (!swapRoutes) return [];
  const originalBalanceSwapRoutes = reapplyOriginalSwapBalances(
    tokenBalances,
    swapRoutes,
  );

  return constructBridgeAndSwapRoutes(
    bridgeResults,
    originalBalanceSwapRoutes,
    l1tol2Addresses,
  );
};
