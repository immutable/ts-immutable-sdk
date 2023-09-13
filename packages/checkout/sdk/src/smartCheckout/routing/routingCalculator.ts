import { BigNumber } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { RoutingOptionsAvailable } from '../../types';
import { BalanceCheckResult, BalanceRequirement } from '../balanceCheck/types';
import {
  FundingRouteType,
  RouteCalculatorType,
  RoutingCalculatorResult,
} from './types';
import { getAllTokenBalances } from './tokenBalances';
import { bridgeRoute } from './bridge/bridgeRoute';
import { CheckoutConfiguration } from '../../config';
import { createReadOnlyProviders } from '../../readOnlyProviders/readOnlyProvider';
import { CheckoutError, CheckoutErrorType } from '../../errors';

export const getInsufficientRequirement = (
  balanceRequirements: BalanceCheckResult,
): BalanceRequirement | undefined => {
  let insufficientBalanceCount = 0;
  let insufficientBridgeRequirement;
  for (const balanceRequirement of balanceRequirements.balanceRequirements) {
    if (!balanceRequirement.sufficient) {
      insufficientBalanceCount++;
      insufficientBridgeRequirement = balanceRequirement;
    }
  }
  if (insufficientBalanceCount === 1) return insufficientBridgeRequirement;

  return undefined;
};

export const routingCalculator = async (
  config: CheckoutConfiguration,
  provider: Web3Provider,
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

  // Get allowed tokens?

  // Bridge and swap fee cache
  const feeEstimates = new Map<FundingRouteType, BigNumber>();

  // Ensures only 1 balance requirement is insufficient otherwise one bridge route cannot be recommended
  let bridgeFundingStep;
  const insufficientRequirement = getInsufficientRequirement(balanceRequirements);
  if (availableRoutingOptions.bridge && insufficientRequirement) {
    bridgeFundingStep = await bridgeRoute(
      config,
      provider,
      readOnlyProviders,
      availableRoutingOptions,
      insufficientRequirement, // todo - get the insufficient balance requirement
      tokenBalances,
      feeEstimates,
    );
  }

  // Check on-ramp routes

  // Check swap routes
  // > Could bridge first
  // > Could on-ramp first
  // > Could double swap

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

  return {
    availableOptions: [],
    response: {
      type: RouteCalculatorType.NO_ROUTES,
      message: 'Routes not found',
    },
    fundingRoutes: [],
  };
};
