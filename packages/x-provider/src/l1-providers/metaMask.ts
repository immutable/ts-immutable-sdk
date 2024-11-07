import detectEthereumProvider from '@metamask/detect-provider';

import { MetamaskConnectParams } from './types';
import { connectProvider, isRequestableProvider } from './rpc';
import { BrowserProvider, Eip1193Provider } from 'ethers';

const ERRORS = {
  // TODO: remove once fixed - consider using something in line with the naming convention
  // eslint-disable-next-line @typescript-eslint/naming-convention
  PROVIDER_NOT_FOUND: 'The Metamask provider was not found',
};

export async function connect({
  chainID,
}: MetamaskConnectParams): Promise<BrowserProvider> {
  const provider = (await detectEthereumProvider()) as Eip1193Provider;

  if (!isRequestableProvider(provider)) {
    throw new Error(ERRORS.PROVIDER_NOT_FOUND);
  }

  await connectProvider(provider, chainID);

  // NOTE: if we want to listen to Metamask events in the future, we can add a
  // listener here.

  return new BrowserProvider(provider);
}
