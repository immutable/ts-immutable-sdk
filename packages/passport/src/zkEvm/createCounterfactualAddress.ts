import { ExternalProvider, Web3Provider } from '@ethersproject/providers';
import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { UserWithEtherKey } from '../types';
import AuthManager from '../authManager';

export type CreateCounterfactualAddressInput = {
  authManager: AuthManager;
  magicProvider: ExternalProvider,
  multiRollupApiClients: MultiRollupApiClients,
};

const MESSAGE_TO_SIGN = 'Only sign this message from Immutable Passport';

export async function createCounterfactualAddress({
  authManager,
  magicProvider,
  multiRollupApiClients,
}: CreateCounterfactualAddressInput): Promise<UserWithEtherKey> {
  const web3Provider = new Web3Provider(
    magicProvider,
  );
  const ethSigner = web3Provider.getSigner();

  const ethereumAddress = await ethSigner.getAddress();
  const ethereumSignature = await ethSigner.signMessage(MESSAGE_TO_SIGN);

  const createAddressResponse = await multiRollupApiClients.passportApi.createCounterfactualAddress({
    createCounterfactualAddressRequest: {
      ethereumAddress,
      ethereumSignature,
    },
  });

  if (createAddressResponse.status !== 201) {
    throw new Error(`Failed to create counterfactual address: ${createAddressResponse.statusText}`);
  }

  const user = await authManager.loginSilent();
  if (!user || !user.etherKey) {
    throw new Error('Failed to refresh user details');
  }

  return user as UserWithEtherKey;
}
