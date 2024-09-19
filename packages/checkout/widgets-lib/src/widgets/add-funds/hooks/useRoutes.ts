import { TokenBalance } from '@0xsquid/sdk/dist/types';
import { RouteResponse, Token } from '@0xsquid/squid-types';
import { Squid } from '@0xsquid/sdk';
import { utils } from 'ethers';
import { useState } from 'react';
import { delay } from '../functions/delay';
import { AmountData, RouteData } from '../types';

export const useRoutes = () => {
  const [routes, setRoutes] = useState<RouteData[]>([]);

  const getFromAmount = async (
    squid: Squid,
    balance: TokenBalance,
    toAmount: string,
    toChainId: string,
    toTokenAddress: string,
  ): Promise<AmountData | undefined> => {
    const fromTokenData = squid?.getTokenData(
      balance.address,
      balance.chainId.toString(),
    );
    const toTokenData = squid?.getTokenData(toTokenAddress, toChainId);

    if (!fromTokenData || !toTokenData) {
      return undefined;
    }

    try {
      const fromAmount = await squid.getFromAmount({
        fromToken: fromTokenData,
        toToken: toTokenData,
        toAmount,
      });

      return {
        fromAmount,
        fromToken: fromTokenData,
        toToken: toTokenData,
        toAmount,
        balance,
      };
    } catch (error) {
      return undefined;
    }
  };

  const getSufficientFromAmounts = async (
    squid: Squid,
    balances: TokenBalance[],
    toChainId: string,
    toTokenAddress: string,
    toAmount: string,
    bulkNumber: number,
    delayMs: number,
  ): Promise<AmountData[]> => {
    const filteredBalances = balances.filter(
      (balance) => !(balance.address === toTokenAddress && balance.chainId === toChainId),
    );

    const result :AmountData[] = [];

    for (let i = 0; i < filteredBalances.length; i += bulkNumber) {
      const promises = filteredBalances.slice(i, i + bulkNumber).map(
        (balance) => getFromAmount(
          squid,
          balance,
          toAmount,
          toChainId,
          toTokenAddress,
        ),
      );

      // eslint-disable-next-line no-await-in-loop
      const amountsData = await Promise.all(promises);

      const filteredAmountsData = amountsData.filter(
        (amountData): amountData is AmountData => amountData !== undefined,
      );

      if (filteredAmountsData.length > 0) {
        result.push(...filteredAmountsData);
      }

      // eslint-disable-next-line no-await-in-loop
      await delay(delayMs);
    }

    const filteredAmountData = result.filter(
      (data: AmountData) => {
        const formattedBalance = utils.formatUnits(data.balance.balance, data.balance.decimals);
        return parseFloat(formattedBalance.toString()) > parseFloat(data.fromAmount);
      },
    );
    return filteredAmountData;
  };

  const getRoute = async (
    squid: Squid,
    fromToken: Token,
    toToken: Token,
    toAmount: string,
    toAddress: string,
    quoteOnly = true,
  ): Promise<RouteResponse | undefined> => {
    try {
      const fromAmount = await squid.getFromAmount({
        fromToken,
        toToken,
        toAmount,
      });

      const parsedFromAmount = parseFloat(fromAmount).toFixed(fromToken.decimals);
      const formattedFromAmount = utils.parseUnits(
        parsedFromAmount,
        fromToken.decimals,
      );

      const route = await squid.getRoute({
        fromChain: fromToken.chainId,
        fromToken: fromToken.address,
        fromAmount: formattedFromAmount.toString(),
        toChain: toToken.chainId,
        toToken: toToken.address,
        toAddress,
        quoteOnly,
        enableBoost: true,
      });

      return route;
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
        data.toAmount,
        toTokenAddress,
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
    balances: TokenBalance[],
    toChanId: string,
    toTokenAddress: string,
    toAmount: string,
    bulkNumber = 5,
    delayMs = 1000,
  ):Promise<RouteData[]> => {
    const amountDataArray = await getSufficientFromAmounts(
      squid,
      balances,
      toChanId,
      toTokenAddress,
      toAmount,
      10,
      1000,
    );

    const allRoutes: RouteData[] = [];

    for (let i = 0; i < amountDataArray.length; i += bulkNumber) {
      const slicedAmountDataArray = amountDataArray.slice(i, i + bulkNumber);

      // eslint-disable-next-line no-await-in-loop
      allRoutes.push(...await getRoutes(squid, slicedAmountDataArray, toTokenAddress));

      // eslint-disable-next-line no-await-in-loop
      await delay(delayMs);
    }

    setRoutes(allRoutes);
    return allRoutes;
  };

  return { routes, fetchRoutesWithRateLimit };
};
