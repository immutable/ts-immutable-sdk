import { TokenBalance } from '@0xsquid/sdk/dist/types';
import { RouteResponse } from '@0xsquid/squid-types';
import { Squid } from '@0xsquid/sdk';
import { utils } from 'ethers';
import { useRef, useState } from 'react';
import { delay } from '../functions/delay';
import { AmountData, RouteData, Token } from '../types';
import { retry } from '../../../lib/retry';

export const useRoutes = () => {
  const [routes, setRoutes] = useState<RouteData[] | undefined>(undefined);
  const latestRequestIdRef = useRef<number>(0); // Track the latest request ID

  const resetRoutes = () => {
    setRoutes(undefined);
  };

  const findToken = (tokens: Token[], address: string, chainId: string)
  : Token | undefined => tokens.find((value) => value.address.toLowerCase() === address.toLowerCase()
    && value.chainId === chainId);

  const calculateFromAmount = (fromToken: Token, toToken: Token, toAmount: string) => {
    const toAmountNumber = Number(toAmount);
    const toAmountInUsd = toAmountNumber * toToken.usdPrice;
    const baseFromAmount = toAmountInUsd / fromToken.usdPrice;
    const fromAmountWithBuffer = baseFromAmount * 1.015;
    return fromAmountWithBuffer.toString();
  };

  const getAmountData = (
    tokens: Token[],
    balance: TokenBalance,
    toAmount: string,
    toChainId: string,
    toTokenAddress: string,
  ): AmountData | undefined => {
    const fromToken = findToken(tokens, balance.address, balance.chainId.toString());
    const toToken = findToken(tokens, toTokenAddress, toChainId);
    if (!fromToken || !toToken) {
      return undefined;
    }
    return {
      fromToken,
      fromAmount: calculateFromAmount(fromToken, toToken, toAmount),
      toToken,
      toAmount,
      balance,
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
      (balance) => !(balance.address.toLowerCase() === toTokenAddress.toLowerCase() && balance.chainId === toChainId),
    );
    const amountDataArray: AmountData[] = filteredBalances.map((balance) => getAmountData(
      tokens,
      balance,
      toAmount,
      toChainId,
      toTokenAddress,
    )).filter((value) => value !== undefined);

    return amountDataArray.filter((data: AmountData) => {
      const formattedBalance = utils.formatUnits(data.balance.balance, data.balance.decimals);
      return parseFloat(formattedBalance.toString()) > parseFloat(data.fromAmount);
    });
  };

  const getRoute = async (
    squid: Squid,
    fromToken: Token,
    toToken: Token,
    toAddress: string,
    fromAmount: string,
    fromAddress?: string,
    quoteOnly = true,
  ): Promise<RouteResponse | undefined> => {
    try {
      const parsedFromAmount = parseFloat(fromAmount).toFixed(fromToken.decimals);
      const formattedFromAmount = utils.parseUnits(
        parsedFromAmount,
        fromToken.decimals,
      );
      return await retry(
        () => squid.getRoute({
          fromChain: fromToken.chainId,
          fromToken: fromToken.address,
          fromAmount: formattedFromAmount.toString(),
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
    } catch (error) {
      return undefined;
    }
  };

  const getRoutes = async (
    squid: Squid,
    amountDataArray: AmountData[],
    toTokenAddress: string,
  ): Promise<RouteData[]> => {
    const routePromises = amountDataArray.map(
      (data) => getRoute(
        squid,
        data.fromToken,
        data.toToken,
        toTokenAddress,
        data.fromAmount,
      ).then((route) => ({
        amountData: data,
        route,
      })),
    );

    const routesData = await Promise.all(routePromises);
    return routesData.filter((route): route is RouteData => route !== undefined);
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

    for (let i = 0; i < amountDataArray.length; i += bulkNumber) {
      const slicedAmountDataArray = amountDataArray.slice(i, i + bulkNumber);

      // eslint-disable-next-line no-await-in-loop
      allRoutes.push(...await getRoutes(squid, slicedAmountDataArray, toTokenAddress));

      // eslint-disable-next-line no-await-in-loop
      await delay(delayMs);
    }

    // Only update routes if the request is the latest one
    if (currentRequestId === latestRequestIdRef.current) {
      setRoutes(allRoutes);
    }
    return allRoutes;
  };

  return {
    routes, fetchRoutesWithRateLimit, getAmountData, getRoute, resetRoutes,
  };
};
