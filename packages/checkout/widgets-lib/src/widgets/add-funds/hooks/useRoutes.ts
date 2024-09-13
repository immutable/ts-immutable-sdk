/* eslint-disable no-console */
import { useContext, useState } from 'react';
import { Token, TokenBalance } from '@0xsquid/sdk/dist/types';
import { AddFundsContext } from '../context/AddFundsContext';
import { SQUID_BASE_URL } from '../utils/config';

export type RoutesProps = {};

export type Chain = {
  id: string;
  name: string;
  iconUrl: string;
};

export type SquidChain = {
  chainId: string;
  chainName: string;
  chainIconURI: string;
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
      id: chain.chainId,
      name: chain.chainName,
      iconUrl: chain.chainIconURI,
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

    const chainIds = (await getChainsAndTokens()).map(
      (chain: Chain) => chain.id,
    );
    console.log('======== CHAIN IDS', chainIds);

    const balances = await getTokenBalances(chainIds, address);
    console.log('======== BALANCES', balances);

    const filteredBalance = balances.reduce(
      (acc: TokenBalance[], balance: TokenBalance) => {
        if (balance.balance === '0') {
          return acc;
        }
        return [...acc, balance];
      },
      [],
    );
    console.log('======== FILTERED BALANCES', filteredBalance);

    const calculatedFromAmounts = filteredBalance.map(
      (balance: TokenBalance): Promise<AmountData | undefined> => {
        const fromTokenData = addFundsState.squid?.getTokenData(
          balance.address,
          balance.chainId.toString(),
        );
        const toTokenData = addFundsState.squid?.getTokenData(
          '0x6de8aCC0D406837030CE4dd28e7c08C5a96a30d2',
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

    Promise.all(calculatedFromAmounts)
      .then((result) => {
        console.log('======== FROM AMOUNTS', result);
      })
      .catch((error) => {
        console.log('error', error);
      });
  };
  return { routes, getRoutes };
};

export type AmountData = {
  fromAmount: string;
  fromToken: Token;
  toToken: Token;
  toAmount: string;
};
