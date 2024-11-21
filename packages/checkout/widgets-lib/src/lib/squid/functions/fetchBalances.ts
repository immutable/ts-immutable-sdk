import { Squid } from '@0xsquid/sdk';
import { TokenBalance } from '@0xsquid/sdk/dist/types';
import { WrappedBrowserProvider } from '@imtbl/checkout-sdk';
import { Chain } from '../types';

export const fetchBalances = async (
  squid: Squid,
  chains: Chain[],
  provider: WrappedBrowserProvider,
): Promise<TokenBalance[]> => {
  const chainIds = chains.map((chain) => chain.id);
  const address = await (await provider.getSigner()).getAddress();

  const promises: Promise<TokenBalance[]>[] = [];

  for (const chainId of chainIds) {
    const balancePromise = squid.getEvmBalances({
      chains: [chainId],
      userAddress: address,
    });
    promises.push(balancePromise);
  }

  const balances = await Promise.all(promises);
  return balances
    .flatMap((balance) => balance)
    .filter((balance) => balance.balance !== '0');
};
