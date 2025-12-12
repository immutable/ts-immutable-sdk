import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { Flow } from '@imtbl/metrics';
import type { PublicClient } from 'viem';
import { getEip155ChainId } from '../walletHelpers';
import { Auth } from '@imtbl/auth';
import { JsonRpcError, RpcErrorCode } from '../JsonRpcError';
import { signRaw } from '../../utils/crypto';
import type { WalletSigner } from '../../types';

export type RegisterZkEvmUserInput = {
  auth: Auth;
  ethSigner: WalletSigner,
  multiRollupApiClients: MultiRollupApiClients,
  accessToken: string;
  rpcProvider: PublicClient;
  flow: Flow;
};

const MESSAGE_TO_SIGN = 'Only sign this message from Immutable Passport';

export async function registerZkEvmUser({
  auth,
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

  const detectNetworkPromise = rpcProvider.getChainId();
  detectNetworkPromise.then(() => flow.addEvent('endDetectNetwork'));

  const listChainsPromise = multiRollupApiClients.chainsApi.listChains();
  listChainsPromise.then(() => flow.addEvent('endListChains'));

  const [ethereumAddress, ethereumSignature, chainId, chainListResponse] = await Promise.all([
    getAddressPromise,
    signRawPromise,
    detectNetworkPromise,
    listChainsPromise,
  ]);

  const eipChainId = getEip155ChainId(Number(chainId));
  const chainName = chainListResponse.data?.result?.find((chain) => chain.id === eipChainId)?.name;
  if (!chainName) {
    throw new JsonRpcError(
      RpcErrorCode.INTERNAL_ERROR,
      `Chain name does not exist on for chain id ${chainId}`,
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

    auth.forceUserRefreshInBackground();

    return registrationResponse.data.counterfactual_address;
  } catch (error) {
    throw new JsonRpcError(RpcErrorCode.INTERNAL_ERROR, `Failed to create counterfactual address: ${error}`);
  }
}
