import { ethers } from 'ethers';

export const WALLET_ACTION = {
  SWITCH_CHAIN: 'wallet_switchEthereumChain',
  CONNECT: 'eth_requestAccounts',
};

type ExternalProvider = ethers.providers.ExternalProvider;
type RequestableProvider = ExternalProvider & {
  request: NonNullable<ethers.providers.ExternalProvider['request']>;
};

export function isRequestableProvider(provider: ExternalProvider): provider is RequestableProvider {
  return !!provider?.request;
}

export async function connectProvider(
  provider: RequestableProvider,
  chainID: number | undefined,
) {
  await provider.request({ method: WALLET_ACTION.CONNECT });

  if (chainID) {
    await provider.request({
      method: WALLET_ACTION.SWITCH_CHAIN,
      params: [{ chainId: `0x${chainID.toString(16)}` }],
    });
  }
}
