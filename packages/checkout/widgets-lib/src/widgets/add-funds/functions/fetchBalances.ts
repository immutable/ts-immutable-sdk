import { Web3Provider } from '@ethersproject/providers';
import { Squid } from '@0xsquid/sdk';
import { CosmosBalance, TokenBalance } from '@0xsquid/sdk/dist/types';
import { Chain } from '../types';

export const fetchBalances = async (squid: Squid, chains: Chain[], provider: Web3Provider)
: Promise<TokenBalance[]> => {
  const chainIds = chains.map((chain) => chain.id);
  const address = await provider?.getSigner().getAddress();

  const promises: Promise<{
    cosmosBalances?: CosmosBalance[];
    evmBalances?: TokenBalance[];
  }>[] = [];

  for (const chainId of chainIds) {
    const balancePromise = squid.getAllBalances({ chainIds: [chainId], evmAddress: address });
    promises.push(balancePromise);
  }

  const balances = await Promise.all(promises);
  return balances
    .flatMap((balance) => balance.evmBalances ?? [])
    .filter((balance) => balance.balance !== '0');
};
