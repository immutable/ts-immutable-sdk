import { ExternalProvider, Web3Provider } from '@ethersproject/providers';
import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { signRaw } from '@imtbl/toolkit';
import { UserZkEvm } from '../types';
import AuthManager from '../authManager';
import { JsonRpcError, RpcErrorCode } from './JsonRpcError';

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
}: CreateCounterfactualAddressInput): Promise<UserZkEvm> {
  const web3Provider = new Web3Provider(
    magicProvider,
  );
  const ethSigner = web3Provider.getSigner();

  const ethereumAddress = await ethSigner.getAddress();
  const ethereumSignature = await signRaw(MESSAGE_TO_SIGN, ethSigner);

  try {
    await multiRollupApiClients.passportApi.createCounterfactualAddress({
      createCounterfactualAddressRequest: {
        ethereumAddress,
        ethereumSignature,
      },
    });
  } catch (error) {
    throw new JsonRpcError(RpcErrorCode.INTERNAL_ERROR, `Failed to create counterfactual address: ${error}`);
  }

  const user = await authManager.loginSilent();
  if (!user?.zkEvm) {
    throw new JsonRpcError(RpcErrorCode.INTERNAL_ERROR, 'Failed to refresh user details');
  }

  return user as UserZkEvm;
}
