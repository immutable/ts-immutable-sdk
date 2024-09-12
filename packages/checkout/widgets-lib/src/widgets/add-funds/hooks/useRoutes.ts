/* eslint-disable no-console */
import { useContext, useState } from 'react';
import { TokenBalance } from '@0xsquid/sdk/dist/types';
import { AddFundsContext } from '../context/AddFundsContext';
import { SQUID_BASE_URL } from '../utils/config';

export type RoutesProps = {
};

export type Chain = {
  id: string;
  name: string;
  iconUrl: string;
};

export type SquidChain = {
  chainId: string
  chainName:string;
  chainIconURI:string;
};

type SquidChains = {
  chains:SquidChain[];
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

    const data :SquidChains = await response.json();

    const chains = data.chains.map((chain: SquidChain) => ({
      id: chain.chainId,
      name: chain.chainName,
      iconUrl: chain.chainIconURI,
    }));

    console.log('======== CHAINS', chains);
    return chains;
  };

  // FUNCTION: Get token balances for each token on each chain function
  const getTokenBalances = async (chainIds:string[], address:string):Promise<TokenBalance[]> => {
    if (!addFundsState.squid) {
      console.log('squid not found');
      return [];
    }

    const balanceTest = await addFundsState.squid?.getAllBalances({
      chainIds: [1, 10],
      evmAddress: '0x61Ed281e487502458f84752eB367697d6BB5778a',
    });
    console.log('=== balances', balanceTest);

    const balances = await addFundsState.squid?.getAllBalances({
      chainIds,
      evmAddress: address,
    });
    console.log('=== balances', balances);
    return balances?.evmBalances ?? [];
  };

  //   // FUNCTION: Get toAmount for each token that has a balance function
  //   const getToAmounts = async () => {
  //   };

  //   // FUNCTION: Compare toAmounts with targetAmount and filter the tokens that is < targetAmount function
  //   const filterTokens = async () => {
  //   };

  //   // FUNCTION: Order the routes by the best price and estimated time function
  //   const orderRoutes = async () => {
  //   };

  // FUNCTION: main function - getRoutes
  const getRoutes = async () => {
    // 1. Get chains and tokens from squid function
    // 2. Get token balances for each token on each chain function
    // 3. Get toAmount for each token that has a balance function
    // 4. Compare toAmounts with targetAmount and filter the tokens that is < targetAmount function
    // 5. Call squid's getRoutes function for filtered tokens
    // 6. Order the routes by the best price and estimated time function

    const address = await addFundsState.provider?.getSigner().getAddress();
    if (!address) {
      return;
    }

    const chainIds = (await getChainsAndTokens()).map((chain: Chain) => chain.id);
    console.log('======== CHAIN IDS', chainIds);
    const balances = await getTokenBalances(chainIds, address);
    console.log('======== address', address);
    console.log('======== BALANCES', balances);
  };

  return { routes, getRoutes };
};
