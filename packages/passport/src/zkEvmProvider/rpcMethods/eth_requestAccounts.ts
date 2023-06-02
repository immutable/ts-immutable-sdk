import { ExternalProvider } from '@ethersproject/providers';
import AuthManager from '../../authManager';
import MagicAdapter from '../../magicAdapter';
import { PassportConfiguration } from '../../config';

type EthRequestAccountsInput = {
  authManager: AuthManager;
  config: PassportConfiguration;
  magicAdapter: MagicAdapter;
};

export const ethRequestAccounts = async ({
  authManager,
  config,
  magicAdapter,
}: EthRequestAccountsInput) => {
  const user = await authManager.getUser() || await authManager.login();
  let result = [];
  let magicProvider: ExternalProvider | undefined;

  if (user && user.idToken) {
    magicProvider = await magicAdapter.login(
      user.idToken,
      {
        rpcUrl: config.zkEvmRpcUrl,
        chainId: config.zkEvmChainId,
      },
    );
  }

  if (magicProvider && magicProvider.request) {
    const response = await magicProvider.request({ method: 'eth_requestAccounts' });
    // TODO: result should return counterfactual address & not Magic key
    // TODO: Retrieve CFA from JWT, or call backend to generate CFA & store in Auth0
    result = response.result;
  }

  return {
    result,
    user,
    magicProvider,
  };
};
