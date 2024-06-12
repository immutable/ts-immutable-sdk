import { Signer } from '@ethersproject/abstract-signer';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { JsonRpcError, RpcErrorCode } from './JsonRpcError';
import { hexToString } from '../utils/string';
import GuardianClient from '../guardian';
import { RelayerClient } from './relayerClient';
import { packSignatures, signERC191Message } from './walletHelpers';

interface PersonalSignParams {
  ethSigner: Signer;
  rpcProvider: StaticJsonRpcProvider;
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
  const fromAddress: string = params[0];
  const message: string = params[1];

  if (!fromAddress || !message) {
    throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, 'personal_sign requires an address and a message');
  }

  if (fromAddress.toLowerCase() !== zkEvmAddress.toLowerCase()) {
    throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, 'personal_sign requires the signer to be the from address');
  }

  // Convert message into a string if it's a hex
  const payload = hexToString(message);
  const { chainId } = await rpcProvider.detectNetwork();
  const chainIdBigNumber = BigNumber.from(chainId);

  // Sign the message with the EOA without blocking
  const eoaSignaturePromise = signERC191Message(chainIdBigNumber, payload, ethSigner, fromAddress);

  await guardianClient.evaluateERC191Message({ chainID: chainId, payload });

  const [eoaSignature, relayerSignature] = await Promise.all([
    eoaSignaturePromise,
    relayerClient.imSign(fromAddress, payload),
  ]);
  const eoaAddress = await ethSigner.getAddress();

  return packSignatures(eoaSignature, eoaAddress, relayerSignature);
};
