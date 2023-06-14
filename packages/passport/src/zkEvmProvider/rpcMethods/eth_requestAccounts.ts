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
        chainId: parseInt(config.zkEvmChainId, 10),
      },
    );
  }

  if (magicProvider && magicProvider.request) {
    result = await magicProvider.request({ method: 'eth_requestAccounts' });
    // TODO: ID-786 Retrieve counterfactual address from JWT & return here. & not Magic key
    // TODO: ID-786 The Magic Key should not be returned as we do not want to confuse consumers.
  }

  return {
    result,
    user,
    magicProvider,
  };
};
