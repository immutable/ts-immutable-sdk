import { Flow } from '@imtbl/metrics';
import { Signer, JsonRpcProvider } from 'ethers';
import { JsonRpcError, RpcErrorCode } from './JsonRpcError';
import { hexToString } from '../utils/string';
import GuardianClient from '../guardian';
import { RelayerClient } from './relayerClient';
import { packSignatures, signERC191Message } from './walletHelpers';

interface PersonalSignParams {
  ethSigner: Signer;
  rpcProvider: JsonRpcProvider;
  params: any[];
  zkEvmAddress: string;
  guardianClient: GuardianClient;
  relayerClient: RelayerClient;
  flow: Flow;
}

export const personalSign = async ({
  params,
  ethSigner,
  zkEvmAddress,
  rpcProvider,
  guardianClient,
  relayerClient,
  flow,
}: PersonalSignParams): Promise<string> => {
  const message: string = params[0];
  const fromAddress: string = params[1];

  if (!fromAddress || !message) {
    throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, 'personal_sign requires an address and a message');
  }

  if (fromAddress.toLowerCase() !== zkEvmAddress.toLowerCase()) {
    throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, 'personal_sign requires the signer to be the from address');
  }

  // Convert message into a string if it's a hex
  const payload = hexToString(message);
  const { chainId } = await rpcProvider._detectNetwork();
  flow.addEvent('endDetectNetwork');
  const chainIdBigNumber = BigInt(chainId);

  // Sign the message with the EOA without blocking
  const eoaSignaturePromise = signERC191Message(chainIdBigNumber, payload, ethSigner, fromAddress);
  eoaSignaturePromise.then(() => flow.addEvent('endEOASignature'));

  await guardianClient.evaluateERC191Message({ chainID: chainId, payload });
  flow.addEvent('endEvaluateERC191Message');

  const [eoaSignature, relayerSignature] = await Promise.all([
    eoaSignaturePromise,
    relayerClient.imSign(fromAddress, payload),
  ]);
  flow.addEvent('endRelayerSign');

  const eoaAddress = await ethSigner.getAddress();
  flow.addEvent('endGetEOAAddress');

  return packSignatures(eoaSignature, eoaAddress, relayerSignature);
};
