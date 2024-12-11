import { Squid } from '@0xsquid/sdk';
import { ChainType } from '@0xsquid/squid-types';
import { Chain } from '../types';

type SquidChain = {
  chainId: string;
  networkName: string;
  chainIconURI: string;
  chainType: string;
  nativeCurrency: SquidNativeCurrency;
};

export type SquidNativeCurrency = {
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
};

export const fetchChains = (squid: Squid): Chain[] => {
  const { chains } = squid;
  return chains
    .filter((chain: SquidChain) => chain.chainType === ChainType.EVM)
    .map((chain: SquidChain) => ({
      id: chain.chainId.toString(),
      name: chain.networkName,
      iconUrl: chain.chainIconURI,
      type: chain.chainType,
      nativeCurrency: {
        name: chain.nativeCurrency.name,
        symbol: chain.nativeCurrency.symbol,
        decimals: chain.nativeCurrency.decimals,
        iconUrl: chain.nativeCurrency.icon,
      },
    }));
};
