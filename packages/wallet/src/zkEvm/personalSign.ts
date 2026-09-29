import type { PublicClient } from 'viem';
import { JsonRpcError, RpcErrorCode } from './JsonRpcError';
import { hexToString } from '../utils/string';
import GuardianClient from '../guardian';
import { RelayerClient } from './relayerClient';
import { packSignatures, signERC191Message } from './walletHelpers';
import type { WalletSigner } from '../types';

interface PersonalSignParams {
  ethSigner: WalletSigner;
  rpcProvider: PublicClient;
  params: any[];
  zkEvmAddress: string;
  guardianClient: GuardianClient;
  relayerClient: RelayerClient;
}

export const personalSign = async ({
  params,
  ethSigner,
  zkEvmAddress,
  rpcProvider,
  guardianClient,
  relayerClient,
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
  const chainId = await rpcProvider.getChainId();
  const chainIdBigNumber = BigInt(chainId);

  // Sign the message with the EOA without blocking
  const eoaSignaturePromise = signERC191Message(chainIdBigNumber, payload, ethSigner, fromAddress);

  await guardianClient.evaluateERC191Message({ chainID: chainIdBigNumber, payload });

  const [eoaSignature, relayerSignature] = await Promise.all([
    eoaSignaturePromise,
    relayerClient.imSign(fromAddress, payload),
  ]);

  const eoaAddress = await ethSigner.getAddress();

  return packSignatures(eoaSignature, eoaAddress, relayerSignature);
};
