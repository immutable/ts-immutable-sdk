import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { ExternalProvider } from '@ethersproject/providers';
import AuthManager from '../../authManager';
import MagicAdapter from '../../magicAdapter';
import { PassportConfiguration } from '../../config';
import { createCounterfactualAddress } from '../createCounterfactualAddress';
import { UserZkEvm } from '../../types';

type EthRequestAccountsInput = {
  authManager: AuthManager;
  config: PassportConfiguration;
  magicAdapter: MagicAdapter;
  multiRollupApiClients: MultiRollupApiClients;
};

type EthRequestAccountsOutput = {
  user: UserZkEvm;
  magicProvider: ExternalProvider;
  result: string[];
};

export const ethRequestAccounts = async ({
  authManager,
  config,
  magicAdapter,
  multiRollupApiClients,
}: EthRequestAccountsInput): Promise<EthRequestAccountsOutput> => {
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
      result: [userZkevm.zkEvm.ethAddress],
      magicProvider,
    };
  }

  return {
    user: user as UserZkEvm,
    result: [user.zkEvm.ethAddress],
    magicProvider,
  };
};
