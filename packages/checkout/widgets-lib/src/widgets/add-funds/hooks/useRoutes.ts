import { TokenBalance } from '@0xsquid/sdk/dist/types';
import { RouteResponse } from '@0xsquid/squid-types';
import { Squid } from '@0xsquid/sdk';
import { utils } from 'ethers';
import { useContext, useRef } from 'react';
import { delay } from '../functions/delay';
import {
  AmountData, RouteData, RouteResponseData, Token,
} from '../types';
import { sortRoutesByFastestTime } from '../functions/sortRoutesByFastestTime';
import { AddFundsActions, AddFundsContext } from '../context/AddFundsContext';
import { retry } from '../../../lib/retry';
import { getFormattedNumber } from '../functions/getFormattedNumber';

export const useRoutes = () => {
  const latestRequestIdRef = useRef<number>(0);

  const { addFundsDispatch } = useContext(AddFundsContext);

  const setRoutes = (routes: RouteData[]) => {
    addFundsDispatch({
      payload: {
        type: AddFundsActions.SET_ROUTES,
        routes,
      },
    });
  };

  const resetRoutes = () => {
    setRoutes([]);
  };

  const findToken = (
    tokens: Token[],
    address: string,
    chainId: string,
  ): Token | undefined => tokens.find(
    (value) => value.address.toLowerCase() === address.toLowerCase()
        && value.chainId === chainId,
  );

  const calculateFromAmount = (
    fromToken: Token,
    toToken: Token,
    toAmount: string,
    additionalBuffer: number = 0,
  ) => {
    const toAmountNumber = Number(toAmount);
    const toAmountInUsd = toAmountNumber * toToken.usdPrice;
    const baseFromAmount = toAmountInUsd / fromToken.usdPrice;
    const fromAmountWithBuffer = baseFromAmount * (1.02 + additionalBuffer);
    return fromAmountWithBuffer.toString();
  };

  const calculateFromAmountFromRoute = (
    exchangeRate: string,
    toAmount: string,
  ) => {
    const fromAmount = Number(toAmount) / Number(exchangeRate);
    const fromAmountWithBuffer = fromAmount * 1.02;
    return fromAmountWithBuffer.toString();
  };

  const getAmountData = (
    tokens: Token[],
    balance: TokenBalance,
    toAmount: string,
    toChainId: string,
    toTokenAddress: string,
    additionalBuffer: number = 0,
  ): AmountData | undefined => {
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
  ): AmountData[] => {
    const filteredBalances = balances.filter(
      (balance) => !(
        balance.address.toLowerCase() === toTokenAddress.toLowerCase()
          && balance.chainId === toChainId
      ),
    );
    const amountDataArray: AmountData[] = filteredBalances
      .map((balance) => getAmountData(tokens, balance, toAmount, toChainId, toTokenAddress))
      .filter((value) => value !== undefined);

    return amountDataArray.filter((data: AmountData) => {
      const formattedBalance = utils.formatUnits(
        data.balance.balance,
        data.balance.decimals,
      );
      return (
        parseFloat(formattedBalance.toString()) > parseFloat(data.fromAmount)
      );
    });
  };

  const convertToFormattedAmount = (amount: string, decimals: number) => {
    const parsedFromAmount = parseFloat(amount).toFixed(decimals);
    const formattedFromAmount = utils.parseUnits(parsedFromAmount, decimals);
    return formattedFromAmount.toString();
  };

  const getRouteWithRetry = async (
    squid: Squid,
    fromToken: Token,
    toToken: Token,
    toAddress: string,
    fromAmount: string,
    fromAddress?: string,
    quoteOnly = true,
  ): Promise<RouteResponse | undefined> => await retry(
    () => squid.getRoute({
      fromChain: fromToken.chainId,
      fromToken: fromToken.address,
      fromAmount: convertToFormattedAmount(fromAmount, fromToken.decimals),
      toChain: toToken.chainId,
      toToken: toToken.address,
      fromAddress,
      toAddress,
      quoteOnly,
      enableBoost: true,
    }),
    {
      retryIntervalMs: 1000,
      retries: 5,
      nonRetryable: (err: any) => err.response.status !== 429,
    },
  );

  const isRouteToAmountGreaterThanToAmount = (
    routeResponse: RouteResponse,
    toAmount: string,
  ) => {
    const routeToAmount = getFormattedNumber(
      routeResponse?.route.estimate.toAmount,
      routeResponse?.route.estimate.toToken.decimals,
    );
    return Number(routeToAmount) > Number(toAmount);
  };

  const getRoute = async (
    squid: Squid,
    fromToken: Token,
    toToken: Token,
    toAddress: string,
    fromAmount: string,
    toAmount: string,
    fromAddress?: string,
    quoteOnly = true,
  ): Promise<RouteResponseData> => {
    try {
      const routeResponse = await getRouteWithRetry(
        squid,
        fromToken,
        toToken,
        toAddress,
        fromAmount,
        fromAddress,
        quoteOnly,
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
      );
      const newRoute = await getRouteWithRetry(
        squid,
        fromToken,
        toToken,
        toAddress,
        newFromAmount,
        fromAddress,
        quoteOnly,
      );
      if (!newRoute?.route) {
        return {};
      }
      if (isRouteToAmountGreaterThanToAmount(newRoute, toAmount)) {
        return { route: newRoute };
      }
      return {};
    } catch (error) {
      return {};
    }
  };

  const getRoutes = async (
    squid: Squid,
    amountDataArray: AmountData[],
    toTokenAddress: string,
  ): Promise<RouteData[]> => {
    const routePromises = amountDataArray.map((data) => getRoute(
      squid,
      data.fromToken,
      data.toToken,
      toTokenAddress,
      data.fromAmount,
      data.toAmount,
    ).then((route) => ({
      amountData: { ...data, additionalBuffer: route.additionalBuffer },
      route: route.route,
    })));

    const routesData = await Promise.all(routePromises);
    return routesData.filter(
      (route): route is RouteData => route?.route !== undefined,
    );
  };

  const fetchRoutesWithRateLimit = async (
    squid: Squid,
    tokens: Token[],
    balances: TokenBalance[],
    toChanId: string,
    toTokenAddress: string,
    toAmount: string,
    bulkNumber = 5,
    delayMs = 1000,
  ): Promise<RouteData[]> => {
    const currentRequestId = ++latestRequestIdRef.current;

    const amountDataArray = getSufficientFromAmounts(
      tokens,
      balances,
      toChanId,
      toTokenAddress,
      toAmount,
    );

    const allRoutes: RouteData[] = [];
    await Promise.all(
      amountDataArray
        .reduce((acc, _, i) => {
          if (i % bulkNumber === 0) {
            acc.push(amountDataArray.slice(i, i + bulkNumber));
          }
          return acc;
        }, [] as (typeof amountDataArray)[])
        .map(async (slicedAmountDataArray) => {
          allRoutes.push(
            ...(await getRoutes(squid, slicedAmountDataArray, toTokenAddress)),
          );
          await delay(delayMs);
        }),
    );

    const sortedRoutes = sortRoutesByFastestTime(allRoutes);

    // Only update routes if the request is the latest one
    if (currentRequestId === latestRequestIdRef.current) {
      setRoutes(sortedRoutes);
    }

    return sortedRoutes;
  };

  return {
    fetchRoutesWithRateLimit,
    getAmountData,
    getRoute,
    resetRoutes,
  };
};
