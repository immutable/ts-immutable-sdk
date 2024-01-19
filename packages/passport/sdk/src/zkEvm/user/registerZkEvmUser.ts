import { ExternalProvider, JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { signRaw } from '@imtbl/toolkit';
import { getEip155ChainId } from 'zkEvm/walletHelpers';
import { UserZkEvm } from '../../types';
import AuthManager from '../../authManager';
import { JsonRpcError, RpcErrorCode } from '../JsonRpcError';

export type RegisterZkEvmUserInput = {
  authManager: AuthManager;
  magicProvider: ExternalProvider,
  multiRollupApiClients: MultiRollupApiClients,
  accessToken: string;
  jsonRpcProvider: JsonRpcProvider;
};

const MESSAGE_TO_SIGN = 'Only sign this message from Immutable Passport';

export async function registerZkEvmUser({
  authManager,
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
  const eipChainId = getEip155ChainId(chainId);

  try {
    const chainList = (await multiRollupApiClients.chainsApi.listChains()).data.result;
    const chainName = chainList.find((chain) => chain.id === eipChainId)?.name;
    if (!chainName) {
      throw new JsonRpcError(RpcErrorCode.INTERNAL_ERROR, `Chain name does not exist on for chain id ${chainId}`);
    }
    await multiRollupApiClients.passportApi.createCounterfactualAddressV2({
      chainName,
      createCounterfactualAddressRequest: {
        ethereum_address: ethereumAddress,
        ethereum_signature: ethereumSignature,
      },
    }, { headers });
  } catch (error) {
    throw new JsonRpcError(RpcErrorCode.INTERNAL_ERROR, `Failed to create counterfactual address: ${error}`);
  }

  const user = await authManager.forceUserRefresh();
  if (!user?.zkEvm) {
    throw new JsonRpcError(RpcErrorCode.INTERNAL_ERROR, 'Failed to refresh user details');
  }

  return user as UserZkEvm;
}
