import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { signRaw } from '@imtbl/toolkit';
import { Flow } from '@imtbl/metrics';
import { getEip155ChainId } from '../walletHelpers';
import AuthManager from '../../authManager';
import { JsonRpcError, RpcErrorCode } from '../JsonRpcError';
import { Signer } from 'ethers';
import { JsonRpcProvider } from 'ethers';

export type RegisterZkEvmUserInput = {
  authManager: AuthManager;
  ethSigner: Signer,
  multiRollupApiClients: MultiRollupApiClients,
  accessToken: string;
  rpcProvider: JsonRpcProvider;
  flow: Flow;
};

const MESSAGE_TO_SIGN = 'Only sign this message from Immutable Passport';

export async function registerZkEvmUser({
  authManager,
  ethSigner,
  multiRollupApiClients,
  accessToken,
  rpcProvider,
  flow,
}: RegisterZkEvmUserInput): Promise<string> {
  // Parallelize the operations that can happen concurrently
  const getAddressPromise = ethSigner.getAddress();
  getAddressPromise.then(() => flow.addEvent('endGetAddress'));

  const signRawPromise = signRaw(MESSAGE_TO_SIGN, ethSigner);
  signRawPromise.then(() => flow.addEvent('endSignRaw'));

  const detectNetworkPromise = rpcProvider._detectNetwork();
  detectNetworkPromise.then(() => flow.addEvent('endDetectNetwork'));

  const listChainsPromise = multiRollupApiClients.chainsApi.listChains();
  listChainsPromise.then(() => flow.addEvent('endListChains'));

  const [ethereumAddress, ethereumSignature, network, chainListResponse] = await Promise.all([
    getAddressPromise,
    signRawPromise,
    detectNetworkPromise,
    listChainsPromise,
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
    flow.addEvent('endCreateCounterfactualAddress');

    authManager.forceUserRefreshInBackground();

    return registrationResponse.data.counterfactual_address;
  } catch (error) {
    throw new JsonRpcError(RpcErrorCode.INTERNAL_ERROR, `Failed to create counterfactual address: ${error}`);
  }
}
