import { Flow } from '@imtbl/metrics';
import { JsonRpcProvider } from 'ethers';
import { JsonRpcError, RpcErrorCode } from './JsonRpcError';
import { hexToString } from '../utils/string';
import GuardianClient from '../guardian';
import { RelayerClient } from './relayerClient';
import { packSignatures, signERC191Message } from './walletHelpers';
import MagicTeeAdapter from '../magic/magicTeeAdapter';
import { ZkEvmAddresses } from '../types';

interface PersonalSignParams {
  magicTeeAdapter: MagicTeeAdapter;
  rpcProvider: JsonRpcProvider;
  params: any[];
  zkEvmAddresses: ZkEvmAddresses;
  guardianClient: GuardianClient;
  relayerClient: RelayerClient;
  flow: Flow;
}

export const personalSign = async ({
  params,
  magicTeeAdapter,
  zkEvmAddresses,
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

  if (fromAddress.toLowerCase() !== zkEvmAddresses.ethAddress.toLowerCase()) {
    throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, 'personal_sign requires the signer to be the from address');
  }

  // Convert message into a string if it's a hex
  const payload = hexToString(message);
  const { chainId } = await rpcProvider.getNetwork();
  flow.addEvent('endDetectNetwork');
  const chainIdBigNumber = BigInt(chainId);

  // Parallelize the evaluation and signing of the message
  const evaluateMessage = async () => {
    await guardianClient.evaluateERC191Message({ chainID: chainId, payload });
    flow.addEvent('endEvaluateERC191Message');
  };

  const generateEoaSignature = async () => {
    const eoaSignature = await signERC191Message(chainIdBigNumber, payload, magicTeeAdapter, fromAddress);
    flow.addEvent('endEOASignature');
    return eoaSignature;
  };

  const [, eoaSignature] = await Promise.all([
    evaluateMessage(),
    generateEoaSignature(),
  ]);

  const relayerSignature = await relayerClient.imSign(fromAddress, payload);
    flow.addEvent('endRelayerSign');

  return packSignatures(eoaSignature, zkEvmAddresses.userAdminAddress, relayerSignature);
};
