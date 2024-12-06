import { TokenBalance } from '@0xsquid/sdk/dist/types';
import { RouteResponse, ActionType } from '@0xsquid/squid-types';
import { Squid } from '@0xsquid/sdk';
import { useContext, useRef } from 'react';
import { formatUnits, parseUnits } from 'ethers';
import { delay } from '../../../widgets/add-tokens/functions/delay';
import { sortRoutesByFastestTime } from '../functions/sortRoutesByFastestTime';
import { AddTokensActions, AddTokensContext } from '../../../widgets/add-tokens/context/AddTokensContext';
import { retry } from '../../retry';
import { useAnalytics, UserJourney } from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { useProvidersContext } from '../../../context/providers-context/ProvidersContext';
import { isPassportProvider } from '../../provider';
import {
  AmountData, RouteData, RouteResponseData, Token,
} from '../types';

const BASE_SLIPPAGE = 0.02;

export const useRoutes = () => {
  const latestRequestIdRef = useRef<number>(0);

  const { addTokensState: { id }, addTokensDispatch } = useContext(AddTokensContext);

  const {
    providersState: {
      toProvider,
    },
  } = useProvidersContext();

  const { track } = useAnalytics();

  const setRoutes = (routes: RouteData[]) => {
    addTokensDispatch({
      payload: {
        type: AddTokensActions.SET_ROUTES,
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
    const toAmountNumber = parseFloat(toAmount);
    // Calculate the USD value of the toAmount
    const toAmountInUsd = toAmountNumber * toToken.usdPrice;
    // Calculate the amount of fromToken needed to match this USD value
    const baseFromAmount = toAmountInUsd / fromToken.usdPrice;
    // Add a buffer for price fluctuations and fees
    const fromAmountWithBuffer = baseFromAmount * (1 + BASE_SLIPPAGE + additionalBuffer);

    return fromAmountWithBuffer.toString();
  };

  const calculateFromAmountFromRoute = (
    exchangeRate: string,
    toAmount: string,
  ) => {
    const fromAmount = parseFloat(toAmount) / parseFloat(exchangeRate);
    const fromAmountWithBuffer = fromAmount * (1 + BASE_SLIPPAGE);
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
      const formattedBalance = formatUnits(
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
    const formattedFromAmount = parseUnits(parsedFromAmount, decimals);
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
      receiveGasOnDestination: !isPassportProvider(toProvider),
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
    if (!routeResponse?.route?.estimate?.toAmount || !routeResponse?.route?.estimate?.toToken?.decimals) {
      throw new Error('Invalid route response or token decimals');
    }

    const toAmountInBaseUnits = parseUnits(toAmount, routeResponse?.route.estimate.toToken.decimals);
    const routeToAmountInBaseUnits = BigInt(routeResponse.route.estimate.toAmount);
    return routeToAmountInBaseUnits > toAmountInBaseUnits;
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

      track({
        userJourney: UserJourney.ADD_TOKENS,
        screen: 'Routes',
        action: 'Failed',
        extras: {
          contextId: id,
          fromToken: fromToken.symbol,
          toToken: toToken.symbol,
          fromChain: fromToken.chainId,
          toChain: toToken.chainId,
          initialRoute: {
            fromAmount,
            toAmount,
            exchangeRate: routeResponse.route.estimate.exchangeRate,
            routeFromAmount: routeResponse.route.estimate.fromAmount,
            routeToAmount: routeResponse.route.estimate.toAmount,
          },
          newRoute: {
            fromAmount: newFromAmount,
            toAmount,
            exchangeRate: newRoute.route.estimate.exchangeRate,
            routeFromAmount: newRoute.route.estimate.fromAmount,
            routeToAmount: newRoute.route.estimate.toAmount,
          },
        },
      });
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
    isSwapAllowed = true,
  ): Promise<RouteData[]> => {
    const currentRequestId = ++latestRequestIdRef.current;

    let amountDataArray = getSufficientFromAmounts(
      tokens,
      balances,
      toChanId,
      toTokenAddress,
      toAmount,
    );

    if (!isSwapAllowed) {
      amountDataArray = amountDataArray.filter(
        (amountData) => amountData.balance.chainId !== toChanId,
      );
    }

    let allRoutes: RouteData[] = [];
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

    if (!isSwapAllowed) {
      allRoutes = allRoutes.filter(
        (routeData) => !routeData.route.route.estimate.actions.find(
          (action) => action.type === ActionType.SWAP,
        ),
      );
    }

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
