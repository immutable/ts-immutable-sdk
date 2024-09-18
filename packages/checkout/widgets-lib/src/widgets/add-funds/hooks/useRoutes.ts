/* eslint-disable no-console */
import { TokenBalance } from '@0xsquid/sdk/dist/types';
import { RouteResponse, Token } from '@0xsquid/squid-types';
import { Squid } from '@0xsquid/sdk';
import { utils } from 'ethers';
import { useState } from 'react';

const delay = (ms: number) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

export type AmountData = {
  fromAmount: string;
  fromToken: Token;
  toToken: Token;
  toAmount: string;
  balance: TokenBalance;
};

export type RouteData = {
  amountData: AmountData;
  route: RouteResponse;
};

export const useRoutes = () => {
  const [routes, setRoutes] = useState<RouteData[]>([]);

  const getFromAmounts = (
    squid: Squid,
    balances: TokenBalance[],
    toChanId: string,
    toTokenAddress: string,
    toAmount: string,
  ): Promise<AmountData | undefined>[] => {
    const filteredBalances = balances.filter(
      (balance) => balance.address !== toTokenAddress,
    );

    return filteredBalances.map(
      (balance: TokenBalance): Promise<AmountData | undefined> => {
        const fromTokenData = squid?.getTokenData(
          balance.address,
          balance.chainId.toString(),
        );
        const toTokenData = squid?.getTokenData(toTokenAddress, toChanId);

        if (!fromTokenData || !toTokenData) {
          console.log('tokenData not found', fromTokenData, toTokenData);
          return Promise.resolve(undefined);
        }

        return squid
          .getFromAmount({
            fromToken: fromTokenData,
            toToken: toTokenData,
            toAmount,
          })
          .then((fromAmount: string) => ({
            fromAmount,
            fromToken: fromTokenData,
            toToken: toTokenData,
            toAmount,
            balance,
          }))
          .catch((error) => {
            console.log('error', error);
            return Promise.resolve(undefined);
          });
      },
    );
  };

  const getRoute = async (
    squid: Squid,
    fromToken: Token,
    toToken: Token,
    toAmount: string,
    toAddress: string,
    quoteOnly = true,
  ): Promise<RouteResponse> => {
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

    return squid.getRoute({
      fromChain: fromToken.chainId,
      fromToken: fromToken.address,
      fromAmount: formattedFromAmount.toString(),
      toChain: toToken.chainId,
      toToken: toToken.address,
      toAddress,
      quoteOnly,
      enableBoost: true,
    });
  };

  const getRoutes = async (
    squid: Squid,
    balances: TokenBalance[],
    toChanId: string,
    toTokenAddress: string,
    toAmount: string,
  ) => {
    const getAmountData = await Promise.all(
      getFromAmounts(squid, balances, toChanId, toTokenAddress, toAmount),
    );
    const filteredAmountData = getAmountData.filter(
      (amountData) => amountData !== undefined,
    ) as AmountData[];

    delay(2000);

    const getRoutePromises = filteredAmountData.map((data: AmountData): Promise<RouteData | undefined> => getRoute(
      squid,
      data.fromToken,
      data.toToken,
      data.toAmount,
      toTokenAddress,
    ).then((route) => ({
      amountData: data,
      route,
    })).catch((error) => {
      console.log('error', error);
      return Promise.resolve(undefined);
    }));

    const getRouteData = await Promise.all(getRoutePromises);
    const routesData = getRouteData.filter((routeData) => routeData !== undefined) as RouteData[];
    setRoutes(routesData);
    return routesData;
  };

  return { routes, getRoutes, getRoute };
};
