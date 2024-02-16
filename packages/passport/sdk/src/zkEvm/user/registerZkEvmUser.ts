import { JsonRpcProvider } from '@ethersproject/providers';
import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { signRaw } from '@imtbl/toolkit';
import { getEip155ChainId } from 'zkEvm/walletHelpers';
import { Signer } from '@ethersproject/abstract-signer';
import { UserZkEvm } from '../../types';
import AuthManager from '../../authManager';
import { JsonRpcError, RpcErrorCode } from '../JsonRpcError';

export type RegisterZkEvmUserInput = {
  authManager: AuthManager;
  ethSigner: Signer,
  multiRollupApiClients: MultiRollupApiClients,
  accessToken: string;
  jsonRpcProvider: JsonRpcProvider;
};

const MESSAGE_TO_SIGN = 'Only sign this message from Immutable Passport';

export async function registerZkEvmUser({
  authManager,
  ethSigner,
  multiRollupApiClients,
  accessToken,
  jsonRpcProvider,
}: RegisterZkEvmUserInput): Promise<UserZkEvm> {
  const [ethereumAddress, ethereumSignature, network, chainListResponse] = await Promise.all([
    ethSigner.getAddress(),
    signRaw(MESSAGE_TO_SIGN, ethSigner),
    jsonRpcProvider.ready,
    multiRollupApiClients.chainsApi.listChains(),
  ]);

  const eipChainId = getEip155ChainId(network.chainId);
  const chainName = chainListResponse.data?.result?.find((chain) => chain.id === eipChainId)?.name;
  if (!chainName) {
    throw new JsonRpcError(
      RpcErrorCode.INTERNAL_ERROR,
      `Chain name does not exist on for chain id ${network.chainId}`,
    );
  }

  try {
    await multiRollupApiClients.passportApi.createCounterfactualAddressV2({
      chainName,
      createCounterfactualAddressRequest: {
        ethereum_address: ethereumAddress,
        ethereum_signature: ethereumSignature,
      },
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (error) {
    throw new JsonRpcError(RpcErrorCode.INTERNAL_ERROR, `Failed to create counterfactual address: ${error}`);
  }

  const user = await authManager.forceUserRefresh();
  if (!user?.zkEvm) {
    throw new JsonRpcError(RpcErrorCode.INTERNAL_ERROR, 'Failed to refresh user details');
  }

  return user as UserZkEvm;
}
