import detectEthereumProvider from '@metamask/detect-provider';

import { providers } from 'ethers-v5';
import { MetamaskConnectParams } from './types';
import { connectProvider, isRequestableProvider } from './rpc';

const ERRORS = {
  // TODO: remove once fixed - consider using something in line with the naming convention
  // eslint-disable-next-line @typescript-eslint/naming-convention
  PROVIDER_NOT_FOUND: 'The Metamask provider was not found',
};

export async function connect({
  chainID,
}: MetamaskConnectParams): Promise<providers.Web3Provider> {
  const provider = (await detectEthereumProvider()) as providers.ExternalProvider;

  if (!isRequestableProvider(provider)) {
    throw new Error(ERRORS.PROVIDER_NOT_FOUND);
  }

  await connectProvider(provider, chainID);

  // NOTE: if we want to listen to Metamask events in the future, we can add a
  // listener here.

  return new providers.Web3Provider(provider);
}
