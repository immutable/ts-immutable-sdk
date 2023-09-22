import { BigNumber } from 'ethers';
import { BalanceCheckResult, BalanceRequirement } from '../balanceCheck/types';
import {
  ChainId,
  FundingRouteType,
  RoutingOptionsAvailable,
  TokenInfo,
} from '../../types';
import {
  DexQuoteCache,
  DexQuotes,
  FundingRouteStep,
  RouteCalculatorType,
  RoutingCalculatorResult,
  TokenBalanceResult,
  TokenMaps,
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
  availableRoutingOptions: RoutingOptionsAvailable,
  insufficientRequirement: BalanceRequirement | undefined,
  dexQuoteCache: DexQuoteCache,
  ownerAddress: string,
  tokenBalances: Map<ChainId, TokenBalanceResult>,
  tokenAllowList: RoutingTokensAllowList | undefined,
): Promise<FundingRouteStep[] | undefined> => {
  if (!insufficientRequirement) return undefined;
  if (!availableRoutingOptions.bridge || !availableRoutingOptions.swap) return undefined;

  console.log('getBridgeAndSwapFundingSteps::insufficientRequirement', insufficientRequirement);
  console.log('getBridgeAndSwapFundingSteps::tokenBalances', tokenBalances);

  const l1ChainId = getL1ChainId(config);
  const l2ChainId = getL2ChainId(config);

  // We need to define bridgable tokens (L1) based on what is swappable (L2)
  // use the swappable L2 tokens to define the swappable L1 tokens
  const swapTokenAllowList = tokenAllowList?.swap ?? [];
  const swappableL2Addresses: string[] = swapTokenAllowList.map((token) => token.address as string);
  const l1AddressPromises = swappableL2Addresses.map((token) => fetchL1Representation(config, token));
  const swappableL1Addresses = await Promise.all(l1AddressPromises);
  const swappableTokens: TokenMaps = [];
  swappableL2Addresses.forEach((l2Address, index) => {
    const tokenMap = new Map<ChainId, string>();
    tokenMap.set(l1ChainId, swappableL1Addresses[index]);
    tokenMap.set(l2ChainId, l2Address);
    swappableTokens.push(tokenMap);
  });

  // Based on swappable L1 tokens intersect to get the bridgable L1 tokens
  const bridgableL1Tokens: TokenInfo[] = tokenAllowList?.bridge ?? [];
  const bridgableL1Addresses = bridgableL1Tokens
    .filter((token) => {
      if (!('address' in token)) {
        // Native ETH in L1 bridgable need to map to ETH?
        // TODO: Not sure how native ETH address is mapped back to L1 swappable?
      }
      return token.address && swappableL1Addresses.includes(token.address);
    })
    .map((token) => token.address as string);

  console.log('Swappable token map', swappableTokens);
  console.log('Swappable L2 Tokens', swappableL2Addresses);
  console.log('Swappable L1 Tokens', swappableL1Addresses);
  console.log('Allowed bridge tokens', bridgableL1Tokens);
  console.log('Bridgable L1 Tokens', bridgableL1Addresses);

  // For all bridgable L1 tokens map back to L2 for swap quotes so we can use the swap amount when we bridge
  const l2SwapQuotePromises: Promise<DexQuotes>[] = [];
  // eslint-disable-next-line consistent-return
  bridgableL1Addresses.forEach((l1Address) => {
    const l2Address = swappableTokens.find((token) => token.get(l1ChainId) === l1Address)
      ?.get(l2ChainId);

    const insufficientAddress = (insufficientRequirement.required as any).token.address;
    const otherSwappableTokens = swappableL2Addresses.filter((token) => token !== l2Address);
    const balanceDelta = insufficientRequirement.delta.balance.toString();
    console.log('Get swap quote for', l2Address, 'others swappable', otherSwappableTokens);
    console.log('Dex quote required token', insufficientAddress, 'amount', balanceDelta);
    const swapQuote = getOrSetQuotesFromCache(
      config,
      dexQuoteCache,
      ownerAddress,
      {
        address: (insufficientRequirement.required as any).token.address,
        amount: insufficientRequirement.delta.balance,
      },
      swappableL2Addresses.filter((token) => token !== l2Address),
    );
    l2SwapQuotePromises.push(swapQuote);
  });
  const l2SwapQuotes = await Promise.all(l2SwapQuotePromises);
  console.log('Get quotes for swap', l2SwapQuotes);

  // ?? For each swap quote need to check bridgableL1Address balance to make sure we can bridge that amount

  // using the dexQuoteCache again build funding steps for bridge and swap
  // Run bridgeRoute
  // Run swapRoute

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

  const allowList = await allowListCheck(config, tokenBalances, availableRoutingOptions);
  console.log('allowList', allowList);

  // Bridge and swap fee cache
  const feeEstimates = new Map<FundingRouteType, BigNumber>();

  // Dex quotes cache
  const dexQuoteCache: DexQuoteCache = new Map<string, DexQuotes>();

  // Ensures only 1 balance requirement is insufficient otherwise one bridge or one swap route cannot be recommended
  const insufficientRequirement = getInsufficientRequirement(balanceRequirements);

  let bridgeFundingStep;
  if (availableRoutingOptions.bridge && insufficientRequirement) {
    bridgeFundingStep = await bridgeRoute(
      config,
      readOnlyProviders,
      ownerAddress,
      availableRoutingOptions,
      insufficientRequirement,
      tokenBalances,
      feeEstimates,
    );
  }

  const swapFundingSteps = await getSwapFundingSteps(
    config,
    availableRoutingOptions,
    insufficientRequirement,
    dexQuoteCache,
    ownerAddress,
    tokenBalances,
    allowList.swap,
  );

  const onRampFundingStep = await getOnRampFundingStep(
    config,
    availableRoutingOptions,
    insufficientRequirement,
  );

  console.log('Getting bridge and swap funding steps..');
  const bridgeAndSwapFundingSteps = await getBridgeAndSwapFundingSteps(
    config,
    availableRoutingOptions,
    insufficientRequirement,
    dexQuoteCache,
    ownerAddress,
    tokenBalances,
    allowList,
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

  if (bridgeFundingStep || swapFundingSteps.length > 0 || onRampFundingStep) {
    response.response.type = RouteCalculatorType.ROUTES_FOUND;
    response.response.message = 'Routes found';
  }

  if (bridgeFundingStep) {
    priority++;
    response.fundingRoutes.push({
      priority,
      steps: [bridgeFundingStep],
    });
  }

  if (swapFundingSteps.length > 0) {
    priority++;
    swapFundingSteps.forEach((swapFundingStep) => {
      response.fundingRoutes.push({
        priority,
        steps: [swapFundingStep],
      });
    });
  }

  if (onRampFundingStep) {
    priority++;
    response.fundingRoutes.push({
      priority,
      steps: [onRampFundingStep],
    });
  }

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
