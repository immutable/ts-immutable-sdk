import { ExternalProvider, JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { signRaw } from '@imtbl/toolkit';
import { PassportConfiguration } from 'config';
import { CHAIN_NAME_MAP } from 'network/constants';
import { UserZkEvm } from '../../types';
import AuthManager from '../../authManager';
import { JsonRpcError, RpcErrorCode } from '../JsonRpcError';

export type RegisterZkEvmUserInput = {
  authManager: AuthManager;
  config: PassportConfiguration,
  magicProvider: ExternalProvider,
  multiRollupApiClients: MultiRollupApiClients,
  accessToken: string;
  jsonRpcProvider: JsonRpcProvider;
};

const MESSAGE_TO_SIGN = 'Only sign this message from Immutable Passport';

export async function registerZkEvmUser({
  authManager,
  config,
  magicProvider,
  multiRollupApiClients,
  accessToken,
  jsonRpcProvider,
}: RegisterZkEvmUserInput): Promise<UserZkEvm> {
  const web3Provider = new Web3Provider(
    magicProvider,
  );
  const ethSigner = web3Provider.getSigner();

  const ethereumAddress = await ethSigner.getAddress();
  const ethereumSignature = await signRaw(MESSAGE_TO_SIGN, ethSigner);

  const headers = { Authorization: `Bearer ${accessToken}` };

  const { chainId } = await jsonRpcProvider.ready;

  try {
    const chainName = CHAIN_NAME_MAP.get(chainId);
    if (!chainName) {
      throw new JsonRpcError(RpcErrorCode.INTERNAL_ERROR, `Chain name does not exist on for chain id ${chainId}`);
    }
    await multiRollupApiClients.passportApi.createCounterfactualAddress({
      chainName,
      createCounterfactualAddressRequest: {
        ethereum_address: ethereumAddress,
        ethereum_signature: ethereumSignature,
      },
    }, { headers });
  } catch (error) {
    throw new JsonRpcError(RpcErrorCode.INTERNAL_ERROR, `Failed to create counterfactual address: ${error}`);
  }

  let user;
  if (config.crossSdkBridgeEnabled) {
    const credentials = authManager.checkStoredDeviceFlowCredentials();
    if (!credentials || !credentials.refresh_token) {
      throw new JsonRpcError(RpcErrorCode.INTERNAL_ERROR, 'Cross SDK bridge: Failed to refresh user details');
    }
    user = await authManager.refreshToken(credentials.refresh_token);
  } else {
    user = await authManager.loginSilent({ forceRefresh: true });
  }
  if (!user?.zkEvm) {
    throw new JsonRpcError(RpcErrorCode.INTERNAL_ERROR, 'Failed to refresh user details');
  }

  return user as UserZkEvm;
}
