/* eslint-disable no-console */
import { useContext, useState } from 'react';
import { Token, TokenBalance } from '@0xsquid/sdk/dist/types';
import { utils } from 'ethers';
import { RouteResponse } from '@0xsquid/squid-types';
import { AddFundsContext } from '../context/AddFundsContext';
import { SQUID_BASE_URL } from '../utils/config';

function delay(ms: number) {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}
export type RoutesProps = {};

export type AmountData = {
  fromAmount: string;
  fromToken: Token;
  toToken: Token;
  toAmount: string;
};

export type Chain = {
  id: string;
  type: string;
  name: string;
  iconUrl: string;
};

export type SquidChain = {
  chainId: string;
  chainName: string;
  chainIconURI: string;
  chainType: string;
};

type SquidChains = {
  chains: SquidChain[];
};

export const useRoutes = () => {
  const { addFundsState } = useContext(AddFundsContext);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [routes, setRoutes] = useState<any>(null);

  const getChainsAndTokens = async (): Promise<Chain[]> => {
    const url = `${SQUID_BASE_URL}/chains`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'application/json',
      },
    });

    const data: SquidChains = await response.json();

    const chains = data.chains.map((chain: SquidChain) => ({
      id: chain.chainId.toString(),
      name: chain.chainName,
      iconUrl: chain.chainIconURI,
      type: chain.chainType,
    }));

    console.log('======== CHAINS', chains);
    return chains;
  };

  // FUNCTION: Get token balances for each token on each chain function
  const getTokenBalances = async (
    chainIds: string[],
    address: string,
  ): Promise<TokenBalance[]> => {
    if (!addFundsState.squid) {
      console.log('squid not found');
      return [];
    }

    const balances = await addFundsState.squid?.getAllBalances({
      chainIds,
      evmAddress: address,
    });
    console.log('=== balances', balances);
    return balances?.evmBalances ?? [];
  };

  //   // FUNCTION: Get fromAmoun for each token that has a balance function
  //   const getToAmounts = async () => {
  //   };

  //   // FUNCTION: Compare toAmounts with targetAmount and filter the tokens that is < targetAmount function
  //   const filterTokens = async () => {
  //   };

  //   // FUNCTION: Order the routes by the best price and estimated time function
  //   const orderRoutes = async () => {
  //   };

  // FUNCTION: main function - getRoutes
  const getRoutes = async (
    toTokenAddress: string,
    toAmount: string,
    toChanId: string,
  ) => {
    // 1. Get chains and tokens from squid function
    // 2. Get token balances for each token on each chain function
    // 3. Get fromAmount for each token that has a balance function
    // 4. Compare toAmounts with targetAmount and filter the tokens that is < targetAmount function
    // 5. Call squid's getRoutes function for filtered tokens
    // 6. Order the routes by the best price and estimated time function
    console.log('======== toTokenAddress', toTokenAddress); // native
    console.log('======== toAmount', toAmount);
    console.log('======== toChanId', toChanId);

    if (!addFundsState.squid) {
      return;
    }
    const squidSdk = addFundsState.squid;

    const address = await addFundsState.provider?.getSigner().getAddress();
    if (!address) {
      return;
    }
    console.log('======== address', address);

    const startChainTime = Date.now();
    const chainIds = (await getChainsAndTokens())
      .filter(
        (chain: Chain) => chain.type === 'evm',
      )
      .map((chain: Chain) => chain.id);
    console.log('======== CHAIN IDS', (Date.now() - startChainTime) / 1000, chainIds);

    const startBalanceTime = Date.now();
    const balances = await getTokenBalances(chainIds, address);
    console.log('======== BALANCES', (Date.now() - startBalanceTime) / 1000, balances);

    const filteredBalance = balances.reduce(
      (acc: TokenBalance[], balance: TokenBalance) => {
        if (balance.balance === '0' || balance.address === toTokenAddress) {
          return acc;
        }
        return [...acc, balance];
      },
      [],
    );
    console.log('======== FILTERED BALANCES', filteredBalance);

    const startFromAmountTime = Date.now();
    const calculatedFromAmounts = filteredBalance.map(
      (balance: TokenBalance): Promise<AmountData | undefined> => {
        const fromTokenData = addFundsState.squid?.getTokenData(
          balance.address,
          balance.chainId.toString(),
        );
        const toTokenData = addFundsState.squid?.getTokenData(
          toTokenAddress,
          toChanId,
        );

        if (!fromTokenData || !toTokenData) {
          console.log('tokenData not found');
          return Promise.resolve(undefined);
        }

        return squidSdk
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
          }))
          .catch((error) => {
            console.log('error', error);
            return Promise.resolve(undefined);
          });
      },
    );

    const amountData = await Promise.all(calculatedFromAmounts);
    const filteredAmounts: AmountData[] = amountData.filter(
      (data: AmountData | undefined) => data !== undefined,
    );
    console.log('======== filteredAmounts', (Date.now() - startFromAmountTime) / 1000, filteredAmounts);
    await delay(1000);
    const startRoutesTime = Date.now();
    const routePromises = filteredAmounts.map((data: AmountData) => {
      console.log('======== data', data);
      const parsedFromAmount = parseFloat(data.fromAmount).toFixed(
        data.fromToken.decimals,
      );
      console.log('======== PARSED FROM AMOUNT', parsedFromAmount);

      console.log('======== FROM decimals', data.fromToken.decimals);
      const formattedFromAmount = utils.parseUnits(
        parsedFromAmount,
        data.fromToken.decimals,
      );
      console.log(
        '======== FORMATTED FROM AMOUNT',
        formattedFromAmount.toString(),
      );
      console.log(formattedFromAmount);

      return squidSdk.getRoute({
        fromChain: data.fromToken.chainId,
        fromToken: data.fromToken.address,
        fromAmount: formattedFromAmount.toString(),
        toChain: data.toToken.chainId,
        toToken: data.toToken.address,
        toAddress: address,
        quoteOnly: true,
        enableBoost: true,
      });
    });
    const routesData = await Promise.all(routePromises);
    console.log('======== ROUTES', (Date.now() - startRoutesTime) / 1000, routesData);
    console.log('======== TOTAL', (Date.now() - startChainTime) / 1000);
  };

  const getRoute = async (
    fromToken: Token,
    toToken: Token,
    toAmount: string,
    toAddress:string,
  ):Promise<RouteResponse> => {
    if (!addFundsState.squid) {
      return {} as RouteResponse;
    }
    const squidSdk = addFundsState.squid;

    const fromAmount = await squidSdk
      .getFromAmount({
        fromToken,
        toToken,
        toAmount,
      });

    const parsedFromAmount = parseFloat(fromAmount).toFixed(
      fromToken.decimals,
    );
    const formattedFromAmount = utils.parseUnits(
      parsedFromAmount,
      fromToken.decimals,
    );

    return squidSdk.getRoute({
      fromChain: fromToken.chainId,
      fromToken: fromToken.address,
      fromAmount: formattedFromAmount.toString(),
      toChain: toToken.chainId,
      toToken: toToken.address,
      toAddress,
      quoteOnly: true,
      enableBoost: true,
    });
  };
  return { routes, getRoutes, getRoute };
};