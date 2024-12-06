import { TokenBalance } from '@0xsquid/sdk/dist/types';
import { RouteResponse, ActionType } from '@0xsquid/squid-types';
import { Squid } from '@0xsquid/sdk';
import { BigNumber, utils } from 'ethers';
import { useContext, useRef } from 'react';
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
import { SQUID_NATIVE_TOKEN } from '../config';

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

    const toAmountInBaseUnits = utils.parseUnits(toAmount, routeResponse?.route.estimate.toToken.decimals);
    const routeToAmountInBaseUnits = BigNumber.from(routeResponse.route.estimate.toAmount);
    return routeToAmountInBaseUnits.gt(toAmountInBaseUnits);
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

  const getRoutesWithFeesValidation = async (
    squid: Squid,
    toTokenAddress: string,
    balances: TokenBalance[],
    fromAmountArray: AmountData[],
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
      (balance: TokenBalance) => balance.address === SQUID_NATIVE_TOKEN.toLowerCase()
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

    const routePromises = fromAmountArray.map(async (data: AmountData) => {
      try {
        const routeResponse = await getRoute(
          squid,
          data.fromToken,
          data.toToken,
          toTokenAddress,
          data.fromAmount,
          data.toAmount,
        );

        console.log('===routeResponse', routeResponse);

        if (!routeResponse?.route) return null;

        const gasCost = getGasCost(routeResponse, data.balance.chainId);
        const feeCost = getTotalFees(routeResponse, data.balance.chainId);
        const userGasBalance = findUserGasBalance(data.balance.chainId);

        console.log('=== userGasBalance', userGasBalance);
        console.log('=== sourceGasCost', gasCost);

        if (!hasSufficientNativeTokenBalance(userGasBalance, data.fromAmount, data.fromToken, gasCost, feeCost)) {
          console.warn('Insufficient native gas balance for transaction on source chain');
          console.log('=== userGasBalance', userGasBalance);
          console.log('=== totalGasCost', gasCost);
          console.log('=== data.fromAmount', data.fromAmount);
          console.log('=== data.balance.chainId', data.balance.chainId);
          return null;
        }

        return {
          amountData: data,
          route: routeResponse.route,
        } as RouteData;
      } catch (error) {
        return null;
      }
    });

    const routesData = (await Promise.all(routePromises)).filter(
      (route): route is RouteData => route !== null,
    );

    console.log('!!!!!!!routesData', routesData);

    return routesData;
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

    let fromAmountDataArray = getSufficientFromAmounts(
      tokens,
      balances,
      toChanId,
      toTokenAddress,
      toAmount,
    );

    if (!isSwapAllowed) {
      fromAmountDataArray = fromAmountDataArray.filter(
        (amountData) => amountData.balance.chainId !== toChanId,
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

    console.log('===allRoutes', allRoutes);
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
