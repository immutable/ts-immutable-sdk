import { Flow } from '@imtbl/metrics';
import AuthManager from '../../authManager';
import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { getEip155ChainId } from '../walletHelpers';
import { JsonRpcError, RpcErrorCode } from '../../zkEvm/JsonRpcError';
import SequenceSigner from '../sequenceSigner';
import { Provider } from 'ox';

export type RegisterUserInput = {
  authManager: AuthManager;
  multiRollupApiClients: MultiRollupApiClients;
  accessToken: string;
  rpcProvider: Provider.Provider;
  ethSigner: SequenceSigner;
  flow: Flow;
};

const MESSAGE_TO_SIGN = 'Only sign this message from Immutable Passport';

export async function registerUser({
  authManager,
  multiRollupApiClients,
  accessToken,
  rpcProvider,
  ethSigner,
  flow,
}: RegisterUserInput): Promise<string> {
  const getAddressPromise = ethSigner.getAddress();
  getAddressPromise.then(() => flow.addEvent('endGetAddress'));

  const signMessagePromise = ethSigner.signMessage(MESSAGE_TO_SIGN).then((signature) => {
    const sig = signature.startsWith('0x') ? signature.slice(2) : signature;
    const r = sig.substring(0, 64);
    const s = sig.substring(64, 128);
    const v = sig.substring(128, 130);
    
    const vNum = parseInt(v, 16);
    const recoveryParam = vNum >= 27 ? vNum - 27 : vNum;
    const vHex = recoveryParam.toString(16).padStart(2, '0');
    
    return `0x${r}${s}${vHex}`;
  });
  signMessagePromise.then(() => flow.addEvent('endSignRaw'));

  const detectNetworkPromise = rpcProvider.request({ method: 'eth_chainId' });
  detectNetworkPromise.then(() => flow.addEvent('endDetectNetwork'));

  const listChainsPromise = multiRollupApiClients.chainsApi.listChains();
  listChainsPromise.then(() => flow.addEvent('endListChains'));

  const [ethereumAddress, ethereumSignature, chainId, chainListResponse] = await Promise.all([
    getAddressPromise,
    signMessagePromise,
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
      chainName: chainName,
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
    flow.addEvent('errorRegisteringUser');
    throw error;
  }
}
