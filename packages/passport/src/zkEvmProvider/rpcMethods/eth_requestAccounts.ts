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
  const result: string[] = [];
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

  const smartContractWalletAddress = '0x7EEC32793414aAb720a90073607733d9e7B0ecD0'; // TODO: ID-786 this should be a claim in the JWT

  if (magicProvider) {
    result.push(smartContractWalletAddress);
  }

  return {
    result,
    user,
    magicProvider,
  };
};
