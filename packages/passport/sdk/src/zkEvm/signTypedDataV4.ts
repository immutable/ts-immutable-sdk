import {
  ExternalProvider,
  JsonRpcProvider,
  Web3Provider,
} from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { getSignedTypedData } from './walletHelpers';
import { TypedDataPayload } from './types';
import { JsonRpcError, RpcErrorCode } from './JsonRpcError';
import { RelayerClient } from './relayerClient';
import { UserZkEvm } from '../types';

export type SignTypedDataV4Params = {
  magicProvider: ExternalProvider;
  jsonRpcProvider: JsonRpcProvider;
  relayerClient: RelayerClient;
  user: UserZkEvm;
  method: string;
  params: Array<any>;
};

export const signTypedDataV4 = async ({
  params,
  method,
  magicProvider,
  jsonRpcProvider,
  relayerClient,
}: SignTypedDataV4Params): Promise<string> => {
  const fromAddress: string = params[0];
  const typedDataString: string = params[1];

  if (!fromAddress || !typedDataString) {
    throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, `${method} requires an address and a typed data JSON`);
  }

  let typedData: TypedDataPayload;
  try {
    typedData = JSON.parse(typedDataString);
  } catch (ex) {
    throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, `Failed to parse typed data JSON: ${ex}`);
  }

  const { chainId } = await jsonRpcProvider.ready;
  if (typedData.domain?.chainId && typedData.domain.chainId !== chainId) {
    throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, `Invalid chainId, expected ${chainId}`);
  }

  // ID-959: Submit raw typedData payload to Guardian for evaluation

  const relayerSignature = await relayerClient.imSignTypedData(fromAddress, typedData);
  const magicWeb3Provider = new Web3Provider(magicProvider);
  const signer = magicWeb3Provider.getSigner();

  return getSignedTypedData(typedData, relayerSignature, BigNumber.from(chainId), fromAddress, signer);
};
