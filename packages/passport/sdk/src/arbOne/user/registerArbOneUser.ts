import { JsonRpcProvider, Signer } from 'ethers';
import { Flow } from '@imtbl/metrics';
import AuthManager from '../../authManager';
import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { signRaw } from '@imtbl/toolkit';
import { getEip155ChainId } from '../walletHelpers';
import { JsonRpcError, RpcErrorCode } from '../JsonRpcError';

export type RegisterArbOneUserInput = {
  authManager: AuthManager;
  multiRollupApiClients: MultiRollupApiClients;
  accessToken: string;
  rpcProvider: JsonRpcProvider;
  ethSigner: Signer;
  flow: Flow;
};

const MESSAGE_TO_SIGN = 'Only sign this message from Immutable Passport';

export async function registerArbOneUser({
  authManager,
  multiRollupApiClients,
  accessToken,
  rpcProvider,
  ethSigner,
  flow,
}: RegisterArbOneUserInput): Promise<string> {
  const getAddressPromise = ethSigner.getAddress();
  getAddressPromise.then(() => flow.addEvent('endGetAddress'));

  const signRawPromise = signRaw(MESSAGE_TO_SIGN, ethSigner);
  signRawPromise.then(() => flow.addEvent('endSignRaw'));

  const detectNetworkPromise = rpcProvider.getNetwork();
  detectNetworkPromise.then(() => flow.addEvent('endDetectNetwork'));

  const listChainsPromise = multiRollupApiClients.chainsApi.listChains();
  listChainsPromise.then(() => flow.addEvent('endListChains'));

  const [ethereumAddress, ethereumSignature, network, chainListResponse] = await Promise.all([
    getAddressPromise,
    signRawPromise,
    detectNetworkPromise,
    listChainsPromise,
  ]);

  // const eipChainId = getEip155ChainId(Number(network.chainId));
  // const chainName = chainListResponse.data?.result?.find((chain) => chain.id === eipChainId)?.name;
  // if (!chainName) {
  //   throw new JsonRpcError(
  //     RpcErrorCode.INTERNAL_ERROR,
  //     `Chain name does not exist on for chain id ${network.chainId}`,
  //   );
  // }

  try {
    const registrationResponse = await multiRollupApiClients.passportApi.createCounterfactualAddressV2({
      chainName: 'arbitrum-sepolia', //chainName,
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
    flow.addEvent('errorRegisteringArbOneUser');
    throw error;
  }
}

