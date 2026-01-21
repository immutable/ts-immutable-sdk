import { Flow } from '@imtbl/metrics';
import { Provider } from 'ox';
import { hashMessage, keccak256, getBytes } from 'ethers';
import { JsonRpcError, RpcErrorCode } from '../zkEvm/JsonRpcError';
import { hexToString } from '../utils/string';
import GuardianClient from '../guardian';
import SequenceSigner from './sequenceSigner';
import { encodeMessageSubDigest } from './walletHelpers';

interface PersonalSignParams {
  sequenceSigner: SequenceSigner;
  oxRpcProvider: Provider.Provider;
  params: any[];
  walletAddress: string;
  guardianClient: GuardianClient;
  flow: Flow;
}

export const personalSign = async ({
  params,
  sequenceSigner,
  walletAddress,
  oxRpcProvider,
  guardianClient,
  flow,
}: PersonalSignParams): Promise<string> => {
  const message: string = params[0];
  const fromAddress: string = params[1];

  if (!fromAddress || !message) {
    throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, 'personal_sign requires an address and a message');
  }

  if (fromAddress.toLowerCase() !== walletAddress.toLowerCase()) {
    throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, 'personal_sign requires the signer to be the from address');
  }

  // Convert message into a string if it's a hex
  const payload = hexToString(message);
  const chainId = await oxRpcProvider.request({ method: 'eth_chainId' });
  const chainIdBigInt = BigInt(chainId);
  flow.addEvent('endDetectNetwork');

  // Sign the message with sequence signer without blocking
  const signaturePromise = signERC191Message(chainIdBigInt, payload, sequenceSigner, walletAddress);
  signaturePromise.then(() => flow.addEvent('endSignature'));

  await guardianClient.evaluateERC191Message({ chainID: chainIdBigInt, payload });
  flow.addEvent('endEvaluateERC191Message');

  const signature = await signaturePromise;

  return signature;
};

const signERC191Message = async (
  chainId: bigint,
  payload: string,
  signer: SequenceSigner,
  walletAddress: string,
): Promise<string> => {
  // Generate digest
  const digest = hashMessage(payload);

  // Generate subDigest
  const subDigest = encodeMessageSubDigest(chainId, walletAddress, digest);
  const subDigestHash = keccak256(subDigest);
  const subDigestHashArray = getBytes(subDigestHash);

  return signer.signMessage(subDigestHashArray);
};
