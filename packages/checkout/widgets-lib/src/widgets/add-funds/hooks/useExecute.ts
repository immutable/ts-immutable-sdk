import { Web3Provider } from '@ethersproject/providers';
import { RouteResponse } from '@0xsquid/squid-types';
import { Squid } from '@0xsquid/sdk';
import { ethers } from 'ethers';
import { isSquidNativeToken } from '../functions/isSquidNativeToken';

export const useExecute = () => {
  const convertToNetworkChangeableProvider = async (
    provider: Web3Provider,
  ): Promise<Web3Provider> => new ethers.providers.Web3Provider(
    provider.provider,
    'any',
  );

  const checkProviderChain = async (
    provider: Web3Provider,
    chainId: string,
  ): Promise<void> => {
    if (!provider.provider.request) {
      throw Error('provider does not have request method');
    }
    try {
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
    } catch (e) {
      throw Error('Error checking provider');
    }
  };

  const approve = async (
    provider: Web3Provider,
    routeResponse: RouteResponse,
  ): Promise<void> => {
    try {
      if (!isSquidNativeToken(routeResponse?.route?.params.fromToken)) {
        const fromToken = routeResponse?.route.params.fromToken;
        const erc20Abi = [
          'function approve(address spender, uint256 amount) public returns (bool)',
        ];
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(fromToken, erc20Abi, signer);

        const transactionRequestTarget = routeResponse?.route?.transactionRequest?.target;
        const fromAmount = routeResponse?.route.params.fromAmount;
        const tx = await tokenContract.approve(transactionRequestTarget, fromAmount);
        await tx.wait();
      }
    } catch (e) {
      throw Error('Error approving tokens');
    }
  };

  const execute = async (
    squid: Squid,
    provider: Web3Provider,
    routeResponse: RouteResponse,
  ): Promise<ethers.providers.TransactionReceipt> => {
    if (!provider.provider.request) {
      throw Error('provider does not have request method');
    }
    try {
      const tx = (await squid.executeRoute({
        signer: provider.getSigner(),
        route: routeResponse.route,
      })) as unknown as ethers.providers.TransactionResponse;
      return tx.wait();
    } catch (e) {
      throw Error('Error executing route');
    }
  };

  return {
    convertToNetworkChangeableProvider, checkProviderChain, approve, execute,
  };
};
