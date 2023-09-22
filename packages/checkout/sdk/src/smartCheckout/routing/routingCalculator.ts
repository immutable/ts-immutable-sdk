import { BigNumber, utils } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { BalanceCheckResult, BalanceRequirement } from '../balanceCheck/types';
import {
  BalanceDelta,
  ChainId,
  FundingRouteType,
  GetBalanceResult,
  RoutingOptionsAvailable,
  TokenInfo,
} from '../../types';
import {
  DexQuoteCache,
  DexQuotes,
  FundingRouteStep,
  RouteCalculatorType,
  RoutingCalculatorResult,
  TokenBalance,
  TokenBalanceResult,
} from './types';
import { getAllTokenBalances } from './tokenBalances';
import { bridgeRoute, fetchL1Representation } from './bridge/bridgeRoute';
import { CheckoutConfiguration, getL1ChainId, getL2ChainId } from '../../config';
import { createReadOnlyProviders } from '../../readOnlyProviders/readOnlyProvider';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import { swapRoute } from './swap/swapRoute';
import { allowListCheck } from '../allowList';
import { onRampRoute } from './onRamp';
import { RoutingTokensAllowList } from '../allowList/types';
import { getOrSetQuotesFromCache } from './swap/dexQuoteCache';

const hasAvailableRoutingOptions = (availableRoutingOptions: RoutingOptionsAvailable) => (
  availableRoutingOptions.bridge || availableRoutingOptions.swap || availableRoutingOptions.onRamp
);

export const getInsufficientRequirement = (
  balanceRequirements: BalanceCheckResult,
): BalanceRequirement | undefined => {
  let insufficientBalanceCount = 0;
  let insufficientRequirement;
  for (const balanceRequirement of balanceRequirements.balanceRequirements) {
    if (!balanceRequirement.sufficient) {
      insufficientBalanceCount++;
      insufficientRequirement = balanceRequirement;
    }
  }
  if (insufficientBalanceCount === 1) return insufficientRequirement;

  return undefined;
};

export const getSwapFundingSteps = async (
  config: CheckoutConfiguration,
  availableRoutingOptions: RoutingOptionsAvailable,
  insufficientRequirement: BalanceRequirement | undefined,
  dexQuoteCache: DexQuoteCache,
  ownerAddress: string,
  tokenBalances: Map<ChainId, TokenBalanceResult>,
  swapTokenAllowList: TokenInfo[] | undefined,
): Promise<FundingRouteStep[]> => {
  const fundingSteps: FundingRouteStep[] = [];
  if (!availableRoutingOptions.swap) return fundingSteps;
  if (insufficientRequirement === undefined) return fundingSteps;
  if (swapTokenAllowList === undefined) return fundingSteps;

  const tokenBalanceResult = tokenBalances.get(getL2ChainId(config));
  if (!tokenBalanceResult) return fundingSteps;
  if (tokenBalanceResult.error !== undefined || !tokenBalanceResult.success) return fundingSteps;

  if (swapTokenAllowList.length === 0) return fundingSteps;
  const swappableTokens: string[] = swapTokenAllowList
    .filter((token) => token.address).map((token) => token.address as string);

  if (swappableTokens.length === 0) return fundingSteps;

  return await swapRoute(
    config,
    availableRoutingOptions,
    dexQuoteCache,
    ownerAddress,
    insufficientRequirement,
    tokenBalances,
    swappableTokens,
  );
};

export const getBridgeAndSwapFundingSteps = async (
  config: CheckoutConfiguration,
  readOnlyProviders: Map<ChainId, JsonRpcProvider>,
  availableRoutingOptions: RoutingOptionsAvailable,
  insufficientRequirement: BalanceRequirement | undefined,
  dexQuoteCache: DexQuoteCache,
  ownerAddress: string,
  tokenBalances: Map<ChainId, TokenBalanceResult>,
  tokenAllowList: RoutingTokensAllowList | undefined,
  feeEstimates: Map<FundingRouteType, BigNumber>,
): Promise<FundingRouteStep[] | undefined> => {
  console.log(insufficientRequirement, availableRoutingOptions.bridge, availableRoutingOptions.swap);
  if (!insufficientRequirement) return undefined;
  if (!availableRoutingOptions.bridge || !availableRoutingOptions.swap) return undefined;

  // const l1ChainId = getL1ChainId(config);
  // const l2ChainId = getL2ChainId(config);

  /*
  * Define a list of the bridgeable tokens (L1) based on what is swappable (L2)
  */

  // Get a list of all the swappable tokens
  const swapTokenAllowList = tokenAllowList?.swap ?? [];
  const swappableL2Addresses: string[] = swapTokenAllowList.map((token) => token.address as string);

  // Get a mapping of L1 addresses to L2 addresses for swappable tokens
  const l1tol2addressMappingPromises = swappableL2Addresses.map((token) => fetchL1Representation(config, token));
  const l1tol2addresses = await Promise.all(l1tol2addressMappingPromises);

  console.log('l1tol2addresses', l1tol2addresses);

  // Create an array of swappable tokens that have L1 representations
  const swappableTokens: string[] = [];
  const bridgeableTokens: string[] = [];
  l1tol2addresses.forEach((addresses) => {
    // If there is an L1 address and an L2 address then this token is bridgeable and swappable
    if (addresses.l1address && addresses.l2address) {
      bridgeableTokens.push(addresses.l1address);
      swappableTokens.push(addresses.l2address);
    }
  });

  console.log('bridgeableTokens', bridgeableTokens);
  console.log('swappableTokens', swappableTokens);

  // const insufficientAddress = (insufficientRequirement.required as any).token.address;
  // const balanceDelta = insufficientRequirement.delta.balance.toString();

  // Get quotes for all the swappable tokens
  const dexQuotes = await getOrSetQuotesFromCache(
    config,
    dexQuoteCache,
    ownerAddress,
    {
      address: (insufficientRequirement.required as any).token.address,
      amount: insufficientRequirement.delta.balance,
    },
    swappableTokens,
  );

  console.log('Quotes for all swappable tokens', dexQuotes);
  // logging out 1 quote for testing
  const imx = dexQuotes.get('0x0000000000000000000000000000000000001010');
  if (imx) {
    // The amount of IMX -> Cats, 0.040404 for 1 cats (no fees added yet)
    console.log(utils.formatUnits(imx.quote.amount.value, 18));
  }

  // Firstly, run the bridge route against the amount the user needs to bridge
  // The amount to bridge is the amount quoted to swap minus balance on layer 2
  // The one scenario is if they are bridging IMX this may miss the swap fees, but
  // that will get picked up by the swap route, and we can do an extra check inside
  // the swap route to cater specifically to bridge -> swap by passing through some
  // data about their L1 balance which will only be present if bridging beforehand

  const l1balances = tokenBalances.get(getL1ChainId(config));
  const l2balances = tokenBalances.get(getL2ChainId(config));

  if (!l1balances) return undefined; // If there are no l1 balance then cannot bridge
  if (!l2balances) return undefined; // If there are no l2 balance then cannot swap

  const balanceRequirements: {
    delta: BalanceDelta,
    address: string,
  }[] = [];

  // Figure out how much l1 balance the user requires to bridge over and create a balance requirement
  for (const [tokenAddress, quote] of dexQuotes) {
    // Get the L2 balance for the token address
    const l2balance = l2balances.balances.find((balance) => balance.token.address === tokenAddress);
    if (!l2balance) continue;

    const l1address = l1tol2addresses.find((address) => address.l2address === tokenAddress)?.l1address;
    if (!l1address) continue; // No l1 representation found in l2->l1 mappings from indexer

    const l1balance = l1balances.balances.find((balance) => balance.token.address === l1address);
    if (!l1balance) continue;

    // Subtract any l2 balance from the amount to bridge
    const amountToBridge = quote.quote.amount.value.sub(l2balance.balance);
    if (amountToBridge.lte(0)) {
      // Nothing to bridge (todo: does not factor in not enough imx for gas, we still may need to run this against swap)
      continue;
    }

    balanceRequirements.push({
      delta: {
        balance: amountToBridge,
        formattedBalance: utils.formatUnits(amountToBridge, l1balance.token.decimals),
      },
      address: tokenAddress, // use the l2 address since we are still doing an indexer lookup inside bridge atm
    });
  }

  console.log(balanceRequirements);
  if (balanceRequirements.length === 0) return undefined;

  // todo: this needs to be an array, that calls the bridge route for each balance requirement
  // these balance requirements are constructed from the quotes we get back from the dex
  // if bridge route passes, then run the swap route
  const bridgeFundingStep = await bridgeRoute(
    config,
    readOnlyProviders,
    ownerAddress,
    availableRoutingOptions,
    balanceRequirements[0],
    tokenBalances,
    feeEstimates,
  );

  console.log(bridgeFundingStep);

  // Find the current balance on layer 2 and add the delta, faking the 'bridge' to layer 2
  // before running the swap route against the balances
  const currentBalance = l2balances.balances.find(
    (balance) => balance.token.address === balanceRequirements[0].address,
  );
  if (!currentBalance) return undefined; // when looping balance requirements, just use continue here
  const newBalance: GetBalanceResult = {
    balance: currentBalance.balance.add(balanceRequirements[0].delta.balance),
    formattedBalance: utils.formatUnits(
      currentBalance.balance.add(balanceRequirements[0].delta.balance),
      currentBalance.token.decimals,
    ),
    token: currentBalance.token,
  };

  // Replace currentBalance in the l2balances balances array
  l2balances.balances = l2balances.balances.map((balance) => {
    if (balance.token.address === balanceRequirements[0].address) {
      return newBalance;
    }
    return balance;
  });
  const modifiedTokenBalances: Map<ChainId, TokenBalanceResult> = new Map();
  modifiedTokenBalances.set(getL2ChainId(config), l2balances);

  console.log('l2balances', l2balances);

  // Run the swap funding step each time the bridge funding step returns successfully
  const swapFundingStep = await swapRoute(
    config,
    availableRoutingOptions,
    dexQuoteCache,
    ownerAddress,
    insufficientRequirement,
    modifiedTokenBalances,
    swappableTokens,
  );

  console.log(swapFundingStep);

  // const fundingSteps = [{
  //   type: FundingRouteType.BRIDGE,
  //   chainId: getL1ChainId(config),
  //   asset: {
  //     balance: BigNumber.from('0'),
  //     formattedBalance: '0',
  //     token: {
  //       name: 'test',
  //       symbol: 'test',
  //       address: 'test',
  //       decimals: 18,
  //     },
  //   },
  // }, {
  //   type: FundingRouteType.SWAP,
  //   chainId: getL2ChainId(config),
  //   asset: {
  //     balance: BigNumber.from('0'),
  //     formattedBalance: '0',
  //     token: {
  //       name: 'test',
  //       symbol: 'test',
  //       address: 'test',
  //       decimals: 18,
  //     },
  //   },
  // }];

  return undefined;
};

export const getOnRampFundingStep = async (
  config: CheckoutConfiguration,
  availableRoutingOptions: RoutingOptionsAvailable,
  insufficientRequirement: BalanceRequirement | undefined,
): Promise<FundingRouteStep | undefined> => {
  if (!availableRoutingOptions.onRamp) return undefined;
  if (insufficientRequirement === undefined) return undefined;

  const onRampFundingStep = await onRampRoute(
    config,
    availableRoutingOptions,
    insufficientRequirement,
  );

  return onRampFundingStep;
};

// todo: change tokenbalance naming
export const constructTokenBalanceArray = (
  chainId: ChainId,
  tokenBalanceResult: Map<ChainId, TokenBalanceResult>,
): TokenBalance[] => {
  const tokenBalances: TokenBalance[] = [];

  const tokenBalance = tokenBalanceResult.get(chainId);
  if (tokenBalance && tokenBalance.success) {
    tokenBalances.push(...tokenBalance.balances);
  }

  return tokenBalances;
};

export const routingCalculator = async (
  config: CheckoutConfiguration,
  ownerAddress: string,
  balanceRequirements: BalanceCheckResult,
  availableRoutingOptions: RoutingOptionsAvailable,
): Promise<RoutingCalculatorResult> => {
  if (!hasAvailableRoutingOptions(availableRoutingOptions)) {
    return {
      response: {
        type: RouteCalculatorType.NO_OPTIONS,
        message: 'No options available',
      },
      fundingRoutes: [],
    };
  }

  let readOnlyProviders;
  try {
    readOnlyProviders = await createReadOnlyProviders(config);
  } catch (err: any) {
    throw new CheckoutError(
      'Error occurred while creating read only providers',
      CheckoutErrorType.PROVIDER_ERROR,
      { message: err.message },
    );
  }

  const tokenBalances = await getAllTokenBalances(
    config,
    readOnlyProviders,
    ownerAddress,
    availableRoutingOptions,
  );

  const allowList = await allowListCheck(
    config,
    tokenBalances,
    availableRoutingOptions,
  );
  console.log('allowList', allowList);

  // Bridge and swap fee cache
  const feeEstimates = new Map<FundingRouteType, BigNumber>();

  // Dex quotes cache
  const dexQuoteCache: DexQuoteCache = new Map<string, DexQuotes>();

  // Ensures only 1 balance requirement is insufficient otherwise one bridge or one swap route cannot be recommended
  const insufficientRequirement = getInsufficientRequirement(balanceRequirements);

  //
  // let bridgeFundingStep;
  // if (availableRoutingOptions.bridge && insufficientRequirement) {
  //   bridgeFundingStep = await bridgeRoute(
  //     config,
  //     readOnlyProviders,
  //     ownerAddress,
  //     availableRoutingOptions,
  //     insufficientRequirement,
  //     tokenBalances,
  //     feeEstimates,
  //   );
  // }

  // const swapFundingSteps = await getSwapFundingSteps(
  //   config,
  //   availableRoutingOptions,
  //   insufficientRequirement,
  //   dexQuoteCache,
  //   ownerAddress,
  //   tokenBalances,
  //   allowList.swap,
  // );
  //
  /*
  * COMMENTING BELOW OUT TO FOCUS ON BRIDGE -> SWAP ROUTE
  */

  // let bridgeFundingStep;
  // if (availableRoutingOptions.bridge && insufficientRequirement) {
  //   bridgeFundingStep = await bridgeRoute(
  //     config,
  //     readOnlyProviders,
  //     ownerAddress,
  //     availableRoutingOptions,
  //     insufficientRequirement,
  //     l1balances,
  //     feeEstimates,
  //   );
  // }

  // const swapFundingStep = await getSwapFundingStep(
  //   config,
  //   availableRoutingOptions,
  //   insufficientRequirement,
  //   dexQuoteCache,
  //   ownerAddress,
  //   tokenBalances,
  //   allowList.swap,
  // );

  // const onRampFundingStep = await getOnRampFundingStep(
  //   config,
  //   availableRoutingOptions,
  //   insufficientRequirement,
  // );

  const bridgeAndSwapFundingSteps = await getBridgeAndSwapFundingSteps(
    config,
    readOnlyProviders,
    availableRoutingOptions,
    insufficientRequirement,
    dexQuoteCache,
    ownerAddress,
    tokenBalances,
    allowList,
    feeEstimates,
  );

  // Check on-ramp routes

  // Check swap routes
  // > Could bridge first
  // > Could on-ramp first
  // > Could double swap

  const response: RoutingCalculatorResult = {
    response: {
      type: RouteCalculatorType.NO_ROUTES,
      message: 'Routes not found',
    },
    fundingRoutes: [],
  };

  let priority = 0;

  //
  // if (bridgeFundingStep || swapFundingSteps.length > 0 || onRampFundingStep) {
  //   response.response.type = RouteCalculatorType.ROUTES_FOUND;
  //   response.response.message = 'Routes found';
  // }

  // if (bridgeFundingStep) {
  //   priority++;
  //   response.fundingRoutes.push({
  //     priority,
  //     steps: [bridgeFundingStep],
  //   });
  // }

  // if (swapFundingSteps.length > 0) {
  //   priority++;
  //   swapFundingSteps.forEach((swapFundingStep) => {
  //     response.fundingRoutes.push({
  //       priority,
  //       steps: [swapFundingStep],
  //     });
  //   });
  // }

  // if (onRampFundingStep) {
  //   priority++;
  //   response.fundingRoutes.push({
  //     priority,
  //     steps: [onRampFundingStep],
  //   });
  // }
  //
  // if (bridgeFundingStep || swapFundingStep || onRampFundingStep) {
  //   response.response.type = RouteCalculatorType.ROUTES_FOUND;
  //   response.response.message = 'Routes found';
  // }

  // if (bridgeFundingStep) {
  //   priority++;
  //   response.fundingRoutes.push({
  //     priority,
  //     steps: [bridgeFundingStep],
  //   });
  // }

  // if (swapFundingStep) {
  //   priority++;
  //   response.fundingRoutes.push({
  //     priority,
  //     steps: [swapFundingStep],
  //   });
  // }

  // if (onRampFundingStep) {
  //   priority++;
  //   response.fundingRoutes.push({
  //     priority,
  //     steps: [onRampFundingStep],
  //   });
  // }

  if (bridgeAndSwapFundingSteps) {
    priority++;
    response.fundingRoutes.push({
      priority,
      steps: bridgeAndSwapFundingSteps,
    });
  }

  console.log('** response', response);
  return response;
};
