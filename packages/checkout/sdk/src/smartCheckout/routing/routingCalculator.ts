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
} from './types';
import { getAllTokenBalances } from './tokenBalances';
import { bridgeRoute, fetchL1Representation } from './bridge/bridgeRoute';
import { CheckoutConfiguration, getL2ChainId } from '../../config';
import { createReadOnlyProviders } from '../../readOnlyProviders/readOnlyProvider';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import { swapRoute } from './swap/swapRoute';
import { allowListCheck } from '../allowList';
import { onRampRoute } from './onRamp';
import { RoutingTokensAllowList } from '../allowList/types';

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
  if (!availableRoutingOptions.bridge || !availableRoutingOptions.swap) return undefined;

  console.log('insufficientRequirement', insufficientRequirement);
  console.log('dexQuoteCache', dexQuoteCache);
  console.log('ownerAddress', ownerAddress);
  console.log('tokenBalances', tokenBalances);

  const swapTokenAllowList = tokenAllowList?.swap ?? [];
  const swappableL2Addresses: string[] = swapTokenAllowList.map((token) => token.address as string);
  const l1AddressPromises = swappableL2Addresses.map((token) => fetchL1Representation(config, token));
  const swappableL1Addresses = await Promise.all(l1AddressPromises);

  // Get the bridgable L2 tokens based on the swappable L2 tokens
  const bridgableL1Tokens: TokenInfo[] = tokenAllowList?.bridge ?? [];
  const bridgableL1Addresses = bridgableL1Tokens
    .filter((token) => token.address && swappableL1Addresses.includes(token.address))
    .map((token) => token.address as string);

  console.log('Swappable L2 Tokens', swappableL2Addresses);
  console.log('Bridgable L1 Tokens', bridgableL1Addresses);

  // Dex parts

  // Swap parts

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

  return response;
};
