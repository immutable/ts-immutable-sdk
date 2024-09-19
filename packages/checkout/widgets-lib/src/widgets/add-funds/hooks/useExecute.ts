import { Web3Provider } from '@ethersproject/providers';
import { RouteResponse } from '@0xsquid/squid-types';
import { Squid } from '@0xsquid/sdk';
import { TransactionResponses } from '@0xsquid/sdk/dist/types';

export const useExecute = async () => {
  const checkProviderChain = async (provider: Web3Provider, chainId: string) => {
    if (!provider.provider.request) {
      throw Error('provider does not have request method');
    }

    const fromChainHex = `0x${parseInt(chainId, 10).toString(16)}`;
    const providerChainId = await provider.provider.request({
      method: 'eth_chainId',
    });

    if (fromChainHex !== providerChainId) {
      await provider.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [
          {
            chainId: fromChainHex,
          },
        ],
      });
    }
  };

  const approve = async (squid: Squid, provider: Web3Provider, routeResponse: RouteResponse): Promise<boolean> => {
    await checkProviderChain(provider, routeResponse.route.params.fromChain);
    return squid.approveRoute({
      signer: provider.getSigner(),
      route: routeResponse.route,
    });
  };

  const execute = async (
    squid: Squid,
    provider: Web3Provider,
    routeResponse: RouteResponse,
  ): Promise<TransactionResponses> => {
    await checkProviderChain(provider, routeResponse.route.params.fromChain);
    return squid.executeRoute({
      signer: provider.getSigner(),
      route: routeResponse.route,
    });
  };
  return {
    approve, execute,
  };
};
