import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { ExternalProvider, JsonRpcProvider } from '@ethersproject/providers';
import { registerZkEvmUser } from './registerZkEvmUser';
import { UserZkEvm } from '../../types';
import AuthManager from '../../authManager';
import { PassportConfiguration } from '../../config';
import MagicAdapter from '../../magicAdapter';

type LoginZkEvmUserInput = {
  authManager: AuthManager;
  config: PassportConfiguration;
  magicAdapter: MagicAdapter;
  multiRollupApiClients: MultiRollupApiClients;
  jsonRpcProvider: JsonRpcProvider;
};

type LoginZkEvmUserOutput = {
  user: UserZkEvm;
  magicProvider: ExternalProvider;
};

export const loginZkEvmUser = async ({
  authManager,
  config,
  magicAdapter,
  multiRollupApiClients,
  jsonRpcProvider,
}: LoginZkEvmUserInput): Promise<LoginZkEvmUserOutput> => {
  let user = null;
  try {
    user = await authManager.getUser();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('loginZkEvmUser failed with error:', err);
  }
  if (!user) {
    user = await authManager.getUserDeviceFlow() || await authManager.login();
  }
  if (!user.idToken) {
    throw new Error('User is missing idToken');
  }

  const magicProvider = await magicAdapter.login(
    user.idToken,
  );

  if (!user.zkEvm) {
    // Generate counterfactual address and retrieve updated Auth0 user
    const userZkevm = await registerZkEvmUser({
      authManager,
      config,
      magicProvider,
      multiRollupApiClients,
      accessToken: user.accessToken,
      jsonRpcProvider,
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
