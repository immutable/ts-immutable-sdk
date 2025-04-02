import { providers } from 'ethers-v5';

export const WALLET_ACTION = {
  // TODO: remove once fixed - consider using an enum
  // eslint-disable-next-line @typescript-eslint/naming-convention
  SWITCH_CHAIN: 'wallet_switchEthereumChain',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  CONNECT: 'eth_requestAccounts',
};

type RequestableProvider = providers.ExternalProvider & {
  request: NonNullable<providers.ExternalProvider['request']>;
};

export function isRequestableProvider(
  provider: providers.ExternalProvider,
): provider is RequestableProvider {
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
