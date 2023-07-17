import { ethers } from 'ethers';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { WalletConnectParams } from './types';
import { connectProvider, isRequestableProvider } from './rpc';

const ERRORS = {
  // TODO: remove once fixed - consider using something in line with the naming convention
  // eslint-disable-next-line @typescript-eslint/naming-convention
  PROVIDER_NOT_FOUND: 'The Wallet Connect provider was not found',
};

export async function connect({
  projectId,
  chains,
}: WalletConnectParams): Promise<ethers.providers.Web3Provider> {
  const provider = (await EthereumProvider.init({
    projectId,
    chains,
    optionalChains: [1],
    showQrModal: true,
    qrModalOptions: {
      themeVariables: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '--wcm-background-color': 'black',
      },
    },
  }));

  if (!isRequestableProvider(provider)) {
    throw new Error(ERRORS.PROVIDER_NOT_FOUND);
  }

  try {
    await provider.connect();
  } catch (e) {
    console.error('Error connecting with WalletConnect provider');
  }

  await connectProvider(provider, chains[0]);

  // NOTE: if we want to listen to Metamask events in the future, we can add a
  // listener here.

  return new ethers.providers.Web3Provider(provider);
}
