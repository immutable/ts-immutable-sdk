import { TokenBalance } from '@0xsquid/sdk/dist/types';
import { RouteResponse, ActionType } from '@0xsquid/squid-types';
import { Squid } from '@0xsquid/sdk';
import { useRef } from 'react';
import { formatUnits } from 'ethers';
import { delay } from '../../../functions/delay';
import { sortRoutesByFastestTime } from '../functions/sortRoutesByFastestTime';
import { retry } from '../../retry';
import { useProvidersContext } from '../../../context/providers-context/ProvidersContext';
import { isPassportProvider } from '../../provider';
import {
  FromAmountData, RouteData, RouteResponseData, Token,
} from '../types';
import { SquidPostHook } from '../../primary-sales';
import { SQUID_NATIVE_TOKEN } from '../config';
import { isRouteToAmountGreaterThanToAmount } from '../functions/isRouteToAmountGreaterThanToAmount';
import { RouteError } from '../RouteError';
import {
  calculateFromAmountFromRoute,
  convertToFormattedFromAmount,
  getSufficientFromAmounts,
} from '../functions/routeCalculation';

export const useRoutes = () => {
  const latestRequestIdRef = useRef<number>(0);

  const {
    providersState: {
      toProvider,
    },
  } = useProvidersContext();

  const getRouteWithRetry = async (
    squid: Squid,
    fromToken: Token,
    toToken: Token,
    toAddress: string,
    fromAmount: string,
    fromAddress?: string,
    quoteOnly = true,
    postHook?: SquidPostHook,
  ): Promise<RouteResponse | undefined> => retry(
    () => squid.getRoute({
      fromChain: fromToken.chainId,
      fromToken: fromToken.address,
      fromAmount: convertToFormattedFromAmount(fromAmount, fromToken.decimals),
      toChain: toToken.chainId,
      toToken: toToken.address,
      fromAddress,
      toAddress,
      quoteOnly,
      enableBoost: true,
      receiveGasOnDestination: !isPassportProvider(toProvider),
      postHook,
    }),
    {
      retryIntervalMs: 1000,
      retries: 5,
      nonRetryable: (err: any) => err.response?.status !== 429,
    },
  );

  const getRoute = async (
    squid: Squid,
    fromToken: Token,
    toToken: Token,
    toAddress: string,
    fromAmount: string,
    toAmount: string,
    fromAddress?: string,
    quoteOnly = true,
    postHook?: SquidPostHook,
  ): Promise<RouteResponseData> => {
    const routeResponse = await getRouteWithRetry(
      squid,
      fromToken,
      toToken,
      toAddress,
      fromAmount,
      fromAddress,
      quoteOnly,
      postHook,
    );

    if (!routeResponse?.route) {
      return {};
    }

    if (isRouteToAmountGreaterThanToAmount(routeResponse, toAmount)) {
      return { route: routeResponse };
    }

    const newFromAmount = calculateFromAmountFromRoute(
      routeResponse.route.estimate.exchangeRate,
      toAmount,
      routeResponse.route.estimate.toAmountUSD,
    );

    const newRoute = await getRouteWithRetry(
      squid,
      fromToken,
      toToken,
      toAddress,
      newFromAmount,
      fromAddress,
      quoteOnly,
      postHook,
    );

    if (!newRoute?.route) {
      return {};
    }

    if (isRouteToAmountGreaterThanToAmount(newRoute, toAmount)) {
      return { route: newRoute };
    }

    throw new Error('Unable to find a route with sufficient toAmount');
  };

  const getRoutesWithFeesValidation = async (
    squid: Squid,
    toTokenAddress: string,
    balances: TokenBalance[],
    fromAmountArray: FromAmountData[],
    postHook?: SquidPostHook,
  ): Promise<RouteData[]> => {
    const getGasCost = (
      route: RouteResponseData,
      chainId: string | number,
    ) => (route.route?.route.estimate.gasCosts || [])
      .filter((gasCost) => gasCost.token.chainId === chainId.toString())
      .reduce(
        (sum, gasCost) => sum + parseFloat(formatUnits(gasCost.amount, gasCost.token.decimals)),
        0,
      );

    const getTotalFees = (
      route: RouteResponseData,
      chainId: string | number,
    ) => (route.route?.route.estimate.feeCosts || [])
      .filter((fee) => fee.token.chainId === chainId.toString())
      .reduce(
        (sum, fee) => sum + parseFloat(formatUnits(fee.amount, fee.token.decimals)),
        0,
      );

    const findUserGasBalance = (chainId: string | number) => balances.find(
      (balance: TokenBalance) => balance.address.toLowerCase() === SQUID_NATIVE_TOKEN.toLowerCase()
        && balance.chainId.toString() === chainId.toString(),
    );

    const hasSufficientNativeTokenBalance = (
      userGasBalance: TokenBalance | undefined,
      fromAmount: string,
      fromToken: Token,
      totalGasCost: number,
      totalFeeCost: number,
    ) => {
      if (!userGasBalance) return false;

      const userBalance = parseFloat(
        formatUnits(userGasBalance.balance, userGasBalance.decimals),
      );

      // If the fromToken is the native token, validate balance for both fromAmount and gas + fee costs
      // Otherwise, only validate balance for gas + fee costs
      const requiredAmount = fromToken.address.toLowerCase() === SQUID_NATIVE_TOKEN.toLowerCase()
        ? parseFloat(fromAmount) + totalGasCost + totalFeeCost
        : totalGasCost + totalFeeCost;

      return userBalance >= requiredAmount;
    };

    const routePromises = fromAmountArray.map(async (data: FromAmountData) => {
      const routeResponse = await getRoute(
        squid,
        data.fromToken,
        data.toToken,
        toTokenAddress,
        data.fromAmount,
        data.toAmount,
        undefined,
        true,
        postHook,
      );

      if (!routeResponse?.route) return null;

      const gasCost = getGasCost(routeResponse, data.balance.chainId);
      const feeCost = getTotalFees(routeResponse, data.balance.chainId);
      const userGasBalance = findUserGasBalance(data.balance.chainId);

      return {
        amountData: data,
        route: routeResponse.route,
        isInsufficientGas: !hasSufficientNativeTokenBalance(
          userGasBalance,
          data.fromAmount,
          data.fromToken,
          gasCost,
          feeCost,
        ),
      } as RouteData;
    });

    const routesData = (await Promise.allSettled(routePromises))
      .filter(
        (result): result is PromiseFulfilledResult<RouteData | null> => result.status === 'fulfilled',
      )
      .map((result) => result.value)
      .filter((route): route is RouteData => route !== null);

    return routesData;
  };

  const fetchRoutes = async (
    squid: Squid,
    tokens: Token[],
    balances: TokenBalance[],
    toChainId: string,
    toTokenAddress: string,
    toAmount: string,
    bulkNumber = 5,
    delayMs = 1000,
    isSwapAllowed = true,
  ): Promise<RouteData[]> => {
    const currentRequestId = ++latestRequestIdRef.current;

    try {
      let fromAmountDataArray = getSufficientFromAmounts(
        tokens,
        balances,
        toChainId,
        toTokenAddress,
        toAmount,
      );

      if (!isSwapAllowed) {
        fromAmountDataArray = fromAmountDataArray.filter(
          (amountData) => amountData.balance.chainId !== toChainId,
        );
      }

      let allRoutes: RouteData[] = [];
      await Promise.all(
        fromAmountDataArray
          .reduce((acc, _, i) => {
            if (i % bulkNumber === 0) {
              acc.push(fromAmountDataArray.slice(i, i + bulkNumber));
            }
            return acc;
          }, [] as (typeof fromAmountDataArray)[])
          .map(async (slicedFromAmountDataArray) => {
            allRoutes.push(
              ...(await getRoutesWithFeesValidation(
                squid,
                toTokenAddress,
                balances,
                slicedFromAmountDataArray,
              )),
            );
            await delay(delayMs);
          }),
      );

      if (!isSwapAllowed) {
        allRoutes = allRoutes.filter(
          (routeData) => !routeData.route.route.estimate.actions.find(
            (action) => action.type === ActionType.SWAP,
          ),
        );
      }

      const sortedRoutes = sortRoutesByFastestTime(allRoutes);

      // Only return routes if the request is the latest one
      if (currentRequestId === latestRequestIdRef.current) {
        return sortedRoutes;
      }

      return [];
    } catch (error: any) {
      throw new RouteError('Failed to fetch routes', {
        fromToken: tokens.find((token) => token.address === toTokenAddress)?.symbol,
        toToken: tokens.find((token) => token.address === toTokenAddress)?.symbol,
        toChain: toChainId,
        errorStatus: error.response?.status,
        errorMessage: error.response?.data?.message,
        errorStack: error.stack,
      });
    }
  };

  return {
    fetchRoutes,
    getRoute,
  };
};
