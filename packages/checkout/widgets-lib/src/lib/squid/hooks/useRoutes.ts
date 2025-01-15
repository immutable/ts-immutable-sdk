import { TokenBalance } from '@0xsquid/sdk/dist/types';
import { RouteResponse, ActionType } from '@0xsquid/squid-types';
import { Squid } from '@0xsquid/sdk';
import { utils } from 'ethers';
import { useRef } from 'react';
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
import { findToken } from '../functions/findToken';
import { isRouteToAmountGreaterThanToAmount } from '../functions/isRouteToAmountGreaterThanToAmount';
import { useRouteCalculation } from './useRouteCalculation';
import { RouteError } from '../RouteError';

export const useRoutes = () => {
  const latestRequestIdRef = useRef<number>(0);

  const {
    providersState: {
      toProvider,
    },
  } = useProvidersContext();

  const { calculateFromAmount, calculateFromAmountFromRoute, convertToFormattedFromAmount } = useRouteCalculation();

  const getFromAmountData = (
    tokens: Token[],
    balance: TokenBalance,
    toAmount: string,
    toChainId: string,
    toTokenAddress: string,
    additionalBuffer: number = 0,
  ): FromAmountData | undefined => {
    const fromToken = findToken(
      tokens,
      balance.address,
      balance.chainId.toString(),
    );
    const toToken = findToken(tokens, toTokenAddress, toChainId);

    if (!fromToken || !toToken) {
      return undefined;
    }

    return {
      fromToken,
      fromAmount: calculateFromAmount(
        fromToken,
        toToken,
        toAmount,
        additionalBuffer,
      ),
      toToken,
      toAmount,
      balance,
      additionalBuffer,
    };
  };

  const getSufficientFromAmounts = (
    tokens: Token[],
    balances: TokenBalance[],
    toChainId: string,
    toTokenAddress: string,
    toAmount: string,
  ): FromAmountData[] => {
    const filteredBalances = balances.filter(
      (balance) => !(
        balance.address.toLowerCase() === toTokenAddress.toLowerCase()
          && balance.chainId === toChainId
      ),
    );

    const fromAmountDataArray: FromAmountData[] = filteredBalances
      .map((balance) => getFromAmountData(tokens, balance, toAmount, toChainId, toTokenAddress))
      .filter((value) => value !== undefined);

    return fromAmountDataArray.filter((data: FromAmountData) => {
      const formattedBalance = utils.formatUnits(
        data.balance.balance,
        data.balance.decimals,
      );
      return (
        parseFloat(formattedBalance.toString()) > parseFloat(data.fromAmount)
      );
    });
  };

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
        (sum, gasCost) => sum + parseFloat(utils.formatUnits(gasCost.amount, gasCost.token.decimals)),
        0,
      );

    const getTotalFees = (
      route: RouteResponseData,
      chainId: string | number,
    ) => (route.route?.route.estimate.feeCosts || [])
      .filter((fee) => fee.token.chainId === chainId.toString())
      .reduce(
        (sum, fee) => sum + parseFloat(utils.formatUnits(fee.amount, fee.token.decimals)),
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
        utils.formatUnits(userGasBalance.balance, userGasBalance.decimals),
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

  const hasSufficientBalance = (
    balances: TokenBalance[],
    toTokenAddress: string,
    toChainId: string,
    toAmount: string,
  ): boolean => {
    const matchingTokens = balances.filter(
      (balance) => balance.address.toLowerCase() === toTokenAddress.toLowerCase()
        && balance.chainId.toString() === toChainId.toString(),
    );

    if (matchingTokens.length > 0) {
      return matchingTokens.some((balance) => {
        const tokenAmount = parseFloat(utils.formatUnits(balance.balance, balance.decimals));
        return tokenAmount >= parseFloat(toAmount);
      });
    }

    return false;
  };

  return {
    fetchRoutes,
    getFromAmountData,
    getRoute,
    hasSufficientBalance,
  };
};
