import { Squid } from '@0xsquid/sdk';
import { Chain } from '../../widgets/add-tokens/types';

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

  return chains.map((chain: SquidChain) => ({
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
