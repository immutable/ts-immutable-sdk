import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { Flow } from '@imtbl/metrics';
import type { PublicClient } from 'viem';
import { getEip155ChainId } from '../../zkEvm/walletHelpers';
import { JsonRpcError, RpcErrorCode } from '../../zkEvm/JsonRpcError';
import { SequenceSigner } from '../signer';
import { GetUserFunction } from '../../types';

export type RegisterUserInput = {
  getUser: GetUserFunction;
  ethSigner: SequenceSigner;
  multiRollupApiClients: MultiRollupApiClients;
  accessToken: string;
  rpcProvider: PublicClient;
  flow: Flow;
};

const MESSAGE_TO_SIGN = 'Only sign this message from Immutable Passport';

/**
 * Format the signature for the registration API.
 * Converts v value from 27/28 format to 0/1 recovery param format.
 */
function formatSignature(signature: string): string {
  const sig = signature.startsWith('0x') ? signature.slice(2) : signature;
  const r = sig.substring(0, 64);
  const s = sig.substring(64, 128);
  const v = sig.substring(128, 130);

  const vNum = parseInt(v, 16);
  const recoveryParam = vNum >= 27 ? vNum - 27 : vNum;
  const vHex = recoveryParam.toString(16).padStart(2, '0');

  return `0x${r}${s}${vHex}`;
}

/**
 * Register a user for a non-zkEVM chain (e.g., Arbitrum).
 * Creates a counterfactual address for the user on the specified chain.
 */
export async function registerUser({
  getUser,
  ethSigner,
  multiRollupApiClients,
  accessToken,
  rpcProvider,
  flow,
}: RegisterUserInput): Promise<string> {
  // Parallelize the operations that can happen concurrently
  const getAddressPromise = ethSigner.getAddress();
  getAddressPromise.then(() => flow.addEvent('endGetAddress'));

  const signMessagePromise = ethSigner.signMessage(MESSAGE_TO_SIGN).then(formatSignature);
  signMessagePromise.then(() => flow.addEvent('endSignRaw'));

  const detectNetworkPromise = rpcProvider.getChainId();
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
      `Chain name does not exist for chain id ${chainId}`,
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

    // Trigger background refresh to get updated user data with the new chain registration
    getUser(true).catch(() => {});

    return registrationResponse.data.counterfactual_address;
  } catch (error) {
    flow.addEvent('errorRegisteringUser');
    throw new JsonRpcError(
      RpcErrorCode.INTERNAL_ERROR,
      `Failed to create counterfactual address: ${error}`,
    );
  }
}
