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
import { bridgeAndSwapRoute } from './bridgeAndSwap/bridgeAndSwapRoute';
import { BridgeRequirement, bridgeRoute } from './bridge/bridgeRoute';

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
    amountToBridge: {
      amount: insufficientRequirement.delta.balance,
      formattedAmount: insufficientRequirement.delta.formattedBalance,
    },
    token: insufficientRequirement.required.token,
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

export const getSwapFundingStep = async (
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
  if (!insufficientRequirement) return undefined;

  const l1balancesResult = tokenBalances.get(getL1ChainId(config));
  const l2balancesResult = tokenBalances.get(getL2ChainId(config));

  // If there are no l1 balance then cannot bridge
  if (!l1balancesResult) return undefined;
  if (l1balancesResult.error !== undefined || !l1balancesResult.success) return undefined;
  // If there are no l2 balance then cannot swap
  if (!l2balancesResult) return undefined;
  if (l2balancesResult.error !== undefined || !l2balancesResult.success) return undefined;

  // Get a list of all the swappable tokens
  const bridgeTokenAllowList = tokenAllowList?.bridge ?? [];
  const bridgeableL1Addresses: string[] = bridgeTokenAllowList.map((token) => token.address as string);
  const swapTokenAllowList = tokenAllowList?.swap ?? [];
  const swappableL2Addresses: string[] = swapTokenAllowList.map((token) => token.address as string);

  if (insufficientRequirement.type !== ItemType.NATIVE && insufficientRequirement.type !== ItemType.ERC20) {
    return undefined;
  }

  const routes = bridgeAndSwapRoute(
    config,
    readOnlyProviders,
    availableRoutingOptions,
    insufficientRequirement,
    dexQuoteCache,
    ownerAddress,
    feeEstimates,
    tokenBalances,
    // l1balances,
    // l2balances,
    bridgeableL1Addresses,
    swappableL2Addresses,
  );

  console.log(routes);

  return routes;
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

  // const bridgeFundingStep = await getBridgeFundingStep(
  //   config,
  //   readOnlyProviders,
  //   availableRoutingOptions,
  //   insufficientRequirement,
  //   ownerAddress,
  //   tokenBalances,
  //   feeEstimates,
  // );
  // console.log(bridgeFundingStep);

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
