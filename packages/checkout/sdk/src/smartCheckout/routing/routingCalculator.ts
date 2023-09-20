import { BigNumber } from 'ethers';
import {
  ChainId,
  FundingRouteType,
  RoutingOptionsAvailable,
  TokenInfo,
} from '../../types';
import {
  BalanceCheckResult,
  BalanceRequirement,
} from '../balanceCheck/types';
import {
  DexQuoteCache,
  DexQuotes,
  FundingRouteStep,
  RouteCalculatorType,
  RoutingCalculatorResult,
  TokenBalanceResult,
} from './types';
import { getAllTokenBalances } from './tokenBalances';
import { bridgeRoute } from './bridge/bridgeRoute';
import { CheckoutConfiguration, getL2ChainId } from '../../config';
import { createReadOnlyProviders } from '../../readOnlyProviders/readOnlyProvider';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import { swapRoute } from './swap/swapRoute';
import { allowListCheck } from '../allowList';

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

export const getSwapFundingStep = async (
  config: CheckoutConfiguration,
  availableRoutingOptions: RoutingOptionsAvailable,
  insufficientRequirement: BalanceRequirement | undefined,
  dexQuoteCache: DexQuoteCache,
  ownerAddress: string,
  tokenBalances: Map<ChainId, TokenBalanceResult>,
  swapTokenAllowList: TokenInfo[] | undefined,
): Promise<FundingRouteStep | undefined> => {
  if (!availableRoutingOptions.swap) return undefined;
  if (insufficientRequirement === undefined) return undefined;
  if (swapTokenAllowList === undefined) return undefined;

  const tokenBalanceResult = tokenBalances.get(getL2ChainId(config));
  if (!tokenBalanceResult) return undefined;
  if (tokenBalanceResult.error !== undefined || !tokenBalanceResult.success) return undefined;

  if (swapTokenAllowList.length === 0) return undefined;
  const swappableTokens: string[] = swapTokenAllowList
    .filter((token) => token.address).map((token) => token.address as string);

  if (swappableTokens.length === 0) return undefined;

  const swapFundingStep = await swapRoute(
    config,
    availableRoutingOptions,
    dexQuoteCache,
    ownerAddress,
    insufficientRequirement,
    tokenBalances,
    swappableTokens,
  );

  return swapFundingStep;
};

export const routingCalculator = async (
  config: CheckoutConfiguration,
  ownerAddress: string,
  balanceRequirements: BalanceCheckResult,
  availableRoutingOptions: RoutingOptionsAvailable,
): Promise<RoutingCalculatorResult> => {
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

  const swapFundingStep = await getSwapFundingStep(
    config,
    availableRoutingOptions,
    insufficientRequirement,
    dexQuoteCache,
    ownerAddress,
    tokenBalances,
    allowList.swap,
  );

  // Check on-ramp routes

  // Check swap routes
  // > Could bridge first
  // > Could on-ramp first
  // > Could double swap

  if (bridgeFundingStep && swapFundingStep) {
    return {
      availableOptions: [],
      response: {
        type: RouteCalculatorType.ROUTES_FOUND,
        message: 'Routes found',
      },
      fundingRoutes: [
        {
          priority: 1,
          steps: [bridgeFundingStep],
        },
        {
          priority: 2,
          steps: [swapFundingStep],
        },
      ],
    };
  }

  if (bridgeFundingStep) {
    return {
      availableOptions: [],
      response: {
        type: RouteCalculatorType.ROUTES_FOUND,
        message: 'Routes found',
      },
      fundingRoutes: [{
        priority: 1,
        steps: [bridgeFundingStep],
      }],
    };
  }

  if (swapFundingStep) {
    return {
      availableOptions: [],
      response: {
        type: RouteCalculatorType.ROUTES_FOUND,
        message: 'Routes found',
      },
      fundingRoutes: [
        {
          priority: 1,
          steps: [swapFundingStep],
        },
      ],
    };
  }

  return {
    availableOptions: [],
    response: {
      type: RouteCalculatorType.NO_ROUTES,
      message: 'Routes not found',
    },
    fundingRoutes: [],
  };
};
