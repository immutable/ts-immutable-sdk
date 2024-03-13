import { BaseProvider } from '@ethersproject/providers';
import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { signRaw } from '@imtbl/toolkit';
import { getEip155ChainId } from 'zkEvm/walletHelpers';
import { Signer } from '@ethersproject/abstract-signer';
import AuthManager from '../../authManager';
import { JsonRpcError, RpcErrorCode } from '../JsonRpcError';

export type RegisterZkEvmUserInput = {
  authManager: AuthManager;
  ethSigner: Signer,
  multiRollupApiClients: MultiRollupApiClients,
  accessToken: string;
  rpcProvider: BaseProvider;
};

const MESSAGE_TO_SIGN = 'Only sign this message from Immutable Passport';

export async function registerZkEvmUser({
  authManager,
  ethSigner,
  multiRollupApiClients,
  accessToken,
  rpcProvider,
}: RegisterZkEvmUserInput): Promise<string> {
  const [ethereumAddress, ethereumSignature, network, chainListResponse] = await Promise.all([
    ethSigner.getAddress(),
    signRaw(MESSAGE_TO_SIGN, ethSigner),
    rpcProvider.ready,
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
    const registrationResponse = await multiRollupApiClients.passportApi.createCounterfactualAddressV2({
      chainName,
      createCounterfactualAddressRequest: {
        ethereum_address: ethereumAddress,
        ethereum_signature: ethereumSignature,
      },
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    authManager.forceUserRefreshInBackground();

    return registrationResponse.data.counterfactual_address;
  } catch (error) {
    throw new JsonRpcError(RpcErrorCode.INTERNAL_ERROR, `Failed to create counterfactual address: ${error}`);
  }
}
