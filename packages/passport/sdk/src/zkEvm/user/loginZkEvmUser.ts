import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { ExternalProvider } from '@ethersproject/providers';
import { registerZkEvmUser } from './registerZkEvmUser';
import { UserZkEvm } from '../../types';
import AuthManager from '../../authManager';
import { PassportConfiguration } from '../../config';
import MagicAdapter from '../../magicAdapter';
import BackgroundTask from '../../network/backgroundTask';

type LoginZkEvmUserInput = {
  authManager: AuthManager;
  config: PassportConfiguration;
  magicAdapter: MagicAdapter;
  multiRollupApiClients: MultiRollupApiClients;
};

type LoginZkEvmUserOutput = {
  user: UserZkEvm;
  magicProvider: BackgroundTask<ExternalProvider>;
};

export const loginZkEvmUser = async ({
  authManager,
  magicAdapter,
  multiRollupApiClients,
}: LoginZkEvmUserInput): Promise<LoginZkEvmUserOutput> => {
  const user = await authManager.getUser() || await authManager.getUserDeviceFlow() || await authManager.login();
  if (!user.idToken) {
    throw new Error('User is missing idToken');
  }

  magicAdapter.login(user.idToken);

  if (!user.zkEvm) {
    // Generate counterfactual address and retrieve updated Auth0 user
    const userZkevm = await registerZkEvmUser({
      authManager,
      config,
      magicProvider,
      multiRollupApiClients,
      accessToken: user.accessToken,
    });

    return {
      user: userZkevm,
      magicProvider,
    };
  }

  return {
    user: user as UserZkEvm,
    magicProvider,
  };
};
