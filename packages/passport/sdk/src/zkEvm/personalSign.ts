import { Signer } from '@ethersproject/abstract-signer';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { JsonRpcError, RpcErrorCode } from './JsonRpcError';
import { hexToString } from '../utils/string';

interface PersonalSignParams {
  ethSigner: Signer;
  rpcProvider: StaticJsonRpcProvider;
  params: any[];
  zkEvmAddress: string;
}

export const personalSign = async ({
  params,
  ethSigner,
  zkEvmAddress,
}: PersonalSignParams): Promise<string> => {
  const fromAddress: string = params[0];
  const message: string = params[1];

  if (!fromAddress || !message) {
    throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, 'personal_sign requires an address and a message');
  }

  if (fromAddress.toLowerCase() !== zkEvmAddress.toLowerCase()) {
    throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, 'personal_sign requires the signer to be the from address');
  }

  const payload = hexToString(message);
  const signature = await ethSigner.signMessage(payload);

  return signature;
};
