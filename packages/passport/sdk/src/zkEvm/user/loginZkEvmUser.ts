import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { ExternalProvider, JsonRpcProvider } from '@ethersproject/providers';
import { registerZkEvmUser } from './registerZkEvmUser';
import { UserZkEvm } from '../../types';
import AuthManager from '../../authManager';
import MagicAdapter from '../../magicAdapter';

type LoginZkEvmUserInput = {
  authManager: AuthManager;
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
  magicAdapter,
  multiRollupApiClients,
  jsonRpcProvider,
}: LoginZkEvmUserInput): Promise<LoginZkEvmUserOutput> => {
  let user = null;
  try {
    user = await authManager.getUser();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('eth_requestAccounts` failed to retrieve a cached user session:', err);
  }

  if (!user) {
    user = await authManager.login();
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
