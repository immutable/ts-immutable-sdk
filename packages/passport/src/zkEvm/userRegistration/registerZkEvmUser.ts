import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { ExternalProvider } from '@ethersproject/providers';
import { createCounterfactualAddress } from './createCounterfactualAddress';
import { UserZkEvm } from '../../types';
import AuthManager from '../../authManager';
import { PassportConfiguration } from '../../config';
import MagicAdapter from '../../magicAdapter';

type RegisterZkEvmUserInput = {
  authManager: AuthManager;
  config: PassportConfiguration;
  magicAdapter: MagicAdapter;
  multiRollupApiClients: MultiRollupApiClients;
};

type RegisterZkEvmUserOutput = {
  user: UserZkEvm;
  magicProvider: ExternalProvider;
};

export const registerZkEvmUser = async ({
  authManager,
  config,
  magicAdapter,
  multiRollupApiClients,
}: RegisterZkEvmUserInput): Promise<RegisterZkEvmUserOutput> => {
  const user = await authManager.getUser() || await authManager.login();
  if (!user.idToken) {
    throw new Error('User is missing idToken');
  }

  const magicProvider = await magicAdapter.login(
    user.idToken,
    config.network,
  );

  if (!user.zkEvm) {
    // Generate counterfactual address and retrieve updated Auth0 user
    const userZkevm = await createCounterfactualAddress({
      authManager,
      magicProvider,
      multiRollupApiClients,
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
