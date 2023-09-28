import { BigNumber } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import {
  BalanceCheckResult,
  BalanceRequirement,
} from '../balanceCheck/types';
import {
  ChainId,
  FundingRouteType,
  ItemType,
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
import {
  CheckoutConfiguration,
  getL1ChainId,
  getL2ChainId,
} from '../../config';
import { createReadOnlyProviders } from '../../readOnlyProviders/readOnlyProvider';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import { swapRoute } from './swap/swapRoute';
import { allowListCheck } from '../allowList';
import { RoutingTokensAllowList } from '../allowList/types';
import { BridgeAndSwapRoute, bridgeAndSwapRoute } from './bridgeAndSwap/bridgeAndSwapRoute';
import { BridgeRequirement, bridgeRoute } from './bridge/bridgeRoute';
import { onRampRoute } from './onRamp';
import { INDEXER_ETH_ROOT_CONTRACT_ADDRESS } from './indexer/fetchL1Representation';

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

export const getBridgeFundingStep = async (
  config: CheckoutConfiguration,
  readOnlyProviders: Map<ChainId, JsonRpcProvider>,
  availableRoutingOptions: RoutingOptionsAvailable,
  insufficientRequirement: BalanceRequirement | undefined,
  ownerAddress: string,
  tokenBalances: Map<ChainId, TokenBalanceResult>,
  feeEstimates: Map<FundingRouteType, BigNumber>,
): Promise<FundingRouteStep | undefined> => {
  let bridgeFundingStep;

  if (insufficientRequirement === undefined) return undefined;
  if (insufficientRequirement.type !== ItemType.NATIVE && insufficientRequirement.type !== ItemType.ERC20) {
    return undefined;
  }

  const bridgeRequirement: BridgeRequirement = {
    amount: insufficientRequirement.delta.balance,
    formattedAmount: insufficientRequirement.delta.formattedBalance,
    l2address: insufficientRequirement.required.token.address ?? '',
  };

  if (availableRoutingOptions.bridge && insufficientRequirement) {
    bridgeFundingStep = await bridgeRoute(
      config,
      readOnlyProviders,
      ownerAddress,
      availableRoutingOptions,
      bridgeRequirement,
      tokenBalances,
      feeEstimates,
    );
  }

  return bridgeFundingStep;
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
  balanceRequirements: BalanceCheckResult,
): Promise<BridgeAndSwapRoute[]> => {
  if (!insufficientRequirement) return [];

  const l1balancesResult = tokenBalances.get(getL1ChainId(config));
  const l2balancesResult = tokenBalances.get(getL2ChainId(config));

  // If there are no l1 balance then cannot bridge
  if (!l1balancesResult) return [];
  if (l1balancesResult.error !== undefined || !l1balancesResult.success) return [];
  // If there are no l2 balance then cannot swap
  if (!l2balancesResult) return [];
  if (l2balancesResult.error !== undefined || !l2balancesResult.success) return [];

  // Get a list of all the swappable tokens
  const bridgeTokenAllowList = tokenAllowList?.bridge ?? [];
  const bridgeableL1Addresses: string[] = bridgeTokenAllowList.map((token) => {
    if (token.address === undefined) return INDEXER_ETH_ROOT_CONTRACT_ADDRESS;
    return token.address;
  });
  const swapTokenAllowList = tokenAllowList?.swap ?? [];

  if (insufficientRequirement.type !== ItemType.NATIVE && insufficientRequirement.type !== ItemType.ERC20) {
    return [];
  }

  console.log(bridgeableL1Addresses);

  const routes = await bridgeAndSwapRoute(
    config,
    readOnlyProviders,
    availableRoutingOptions,
    insufficientRequirement,
    dexQuoteCache,
    ownerAddress,
    feeEstimates,
    tokenBalances,
    bridgeableL1Addresses,
    swapTokenAllowList,
    balanceRequirements,
  );

  return routes;
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

  const allowList = await allowListCheck(
    config,
    tokenBalances,
    availableRoutingOptions,
  );

  // Bridge and swap fee cache
  const feeEstimates = new Map<FundingRouteType, BigNumber>();

  // Dex quotes cache
  const dexQuoteCache: DexQuoteCache = new Map<string, DexQuotes>();

  // Ensures only 1 balance requirement is insufficient
  const insufficientRequirement = getInsufficientRequirement(balanceRequirements);

  const routePromises = [];

  routePromises.push(getBridgeFundingStep(
    config,
    readOnlyProviders,
    availableRoutingOptions,
    insufficientRequirement,
    ownerAddress,
    tokenBalances,
    feeEstimates,
  ));

  routePromises.push(getSwapFundingSteps(
    config,
    availableRoutingOptions,
    insufficientRequirement,
    dexQuoteCache,
    ownerAddress,
    tokenBalances,
    allowList.swap,
  ));

  routePromises.push(getOnRampFundingStep(
    config,
    availableRoutingOptions,
    insufficientRequirement,
  ));

  routePromises.push(getBridgeAndSwapFundingSteps(
    config,
    readOnlyProviders,
    availableRoutingOptions,
    insufficientRequirement,
    dexQuoteCache,
    ownerAddress,
    tokenBalances,
    allowList,
    feeEstimates,
    balanceRequirements,
  ));

  const resolved = await Promise.all(routePromises);

  let bridgeFundingStep: FundingRouteStep | undefined;
  let swapFundingSteps: FundingRouteStep[] = [];
  let onRampFundingStep: FundingRouteStep | undefined;
  let bridgeAndSwapFundingSteps: BridgeAndSwapRoute[] = [];
  resolved.forEach((result, index) => {
    if (index === 0) bridgeFundingStep = result as FundingRouteStep | undefined;
    if (index === 1) swapFundingSteps = result as FundingRouteStep[];
    if (index === 2) onRampFundingStep = result as FundingRouteStep | undefined;
    if (index === 3) bridgeAndSwapFundingSteps = result as BridgeAndSwapRoute[];
  });

  const response: RoutingCalculatorResult = {
    response: {
      type: RouteCalculatorType.NO_ROUTES,
      message: 'Routes not found',
    },
    fundingRoutes: [],
  };

  let priority = 0;

  if (bridgeFundingStep
    || swapFundingSteps.length > 0
    || onRampFundingStep
    || bridgeAndSwapFundingSteps.length > 0) {
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
    bridgeAndSwapFundingSteps.forEach((bridgeAndSwapFundingStep) => {
      const bridgeStep = bridgeAndSwapFundingStep.bridgeFundingStep;
      const swapStep = bridgeAndSwapFundingStep.swapFundingStep;
      response.fundingRoutes.push({
        priority,
        steps: [bridgeStep, swapStep],
      });
    });
  }

  // eslint-disable-next-line no-console
  console.log('** response', response);
  return response;
};
