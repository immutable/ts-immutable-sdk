import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

import { MetamaskConnectParams } from './types';
import { connectProvider, isRequestableProvider } from './rpc';

const ERRORS = {
  PROVIDER_NOT_FOUND: 'The Metamask provider was not found',
};

export async function connect({
  chainID,
}: MetamaskConnectParams): Promise<ethers.providers.Web3Provider> {
  const provider =
    (await detectEthereumProvider()) as ethers.providers.ExternalProvider;

  if (!isRequestableProvider(provider)) {
    throw new Error(ERRORS.PROVIDER_NOT_FOUND);
  }

  await connectProvider(provider, chainID);

  // NOTE: if we want to listen to Metamask events in the future, we can add a
  // listener here.

  return new ethers.providers.Web3Provider(provider);
}
