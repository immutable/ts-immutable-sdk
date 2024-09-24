import { Chain } from '../types';
import { SQUID_API_BASE_URL } from '../utils/config';

type SquidChain = {
  chainId: string;
  chainName: string;
  chainIconURI: string;
  chainType: string;
  nativeCurrency: SquidNativeCurrency;
};

type SquidChains = {
  chains: SquidChain[];
};

export type SquidNativeCurrency = {
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
};

export const fetchChains = async (): Promise<Chain[]> => {
  const url = `${SQUID_API_BASE_URL}/chains`;

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
    nativeCurrency: {
      name: chain.nativeCurrency.name,
      symbol: chain.nativeCurrency.symbol,
      decimals: chain.nativeCurrency.decimals,
      iconUrl: chain.nativeCurrency.icon,
    },
  }));
  return chains;
};
