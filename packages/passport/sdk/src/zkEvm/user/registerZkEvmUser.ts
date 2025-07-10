import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { deserializeSignature, serializeEthSignature } from '@imtbl/toolkit';
import { Flow } from '@imtbl/metrics';
import { JsonRpcProvider } from 'ethers';
import { getEip155ChainId } from '../walletHelpers';
import AuthManager from '../../authManager';
import { JsonRpcError, RpcErrorCode } from '../JsonRpcError';
import MagicTeeAdapter from '../../magic/magicTeeAdapter';

export type RegisterZkEvmUserInput = {
  authManager: AuthManager;
  magicTeeAdapter: MagicTeeAdapter;
  multiRollupApiClients: MultiRollupApiClients,
  accessToken: string;
  rpcProvider: JsonRpcProvider;
  flow: Flow;
};

const MESSAGE_TO_SIGN = 'Only sign this message from Immutable Passport';

export async function registerZkEvmUser({
  authManager,
  magicTeeAdapter,
  multiRollupApiClients,
  accessToken,
  rpcProvider,
  flow,
}: RegisterZkEvmUserInput): Promise<string> {
  // Parallelize the operations that can happen concurrently
  const ethereumAddress = await magicTeeAdapter.createWallet();
  flow.addEvent('endGetAddress');

  const signaturePromise = magicTeeAdapter.personalSign(MESSAGE_TO_SIGN)
    .then(deserializeSignature)
    .then(serializeEthSignature);
  signaturePromise.then(() => flow.addEvent('endSignature'));

  const detectNetworkPromise = rpcProvider.getNetwork();
  detectNetworkPromise.then(() => flow.addEvent('endDetectNetwork'));

  const listChainsPromise = multiRollupApiClients.chainsApi.listChains();
  listChainsPromise.then(() => flow.addEvent('endListChains'));

  const [ethereumSignature, network, chainListResponse] = await Promise.all([
    signaturePromise,
    detectNetworkPromise,
    listChainsPromise,
  ]);

  const eipChainId = getEip155ChainId(Number(network.chainId));
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
