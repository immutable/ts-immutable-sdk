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

const transformTypedData = (typedData: string | object, chainId: number): TypedDataPayload => {
  let transformedTypedData: TypedDataPayload;

  if (typeof typedData === 'string') {
    try {
      transformedTypedData = JSON.parse(typedData);
    } catch (err: any) {
      throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, `Failed to parse typed data JSON: ${err}`);
    }
  } else if (typeof typedData === 'object') {
    transformedTypedData = typedData as TypedDataPayload;
  } else {
    throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, `Invalid typed data argument: ${typedData}`);
  }

  if (transformedTypedData.domain?.chainId) {
    // domain.chainId (if defined) can be a number, string, or hex value, but the relayer only accepts a number.
    if (typeof transformedTypedData.domain.chainId === 'string') {
      if (transformedTypedData.domain.chainId.startsWith('0x')) {
        transformedTypedData.domain.chainId = parseInt(transformedTypedData.domain.chainId, 16);
      } else {
        transformedTypedData.domain.chainId = parseInt(transformedTypedData.domain.chainId, 10);
      }
    }

    if (transformedTypedData.domain.chainId !== chainId) {
      throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, `Invalid chainId, expected ${chainId}`);
    }
  }

  return transformedTypedData;
};

export const signTypedDataV4 = async ({
  params,
  method,
  magicProvider,
  jsonRpcProvider,
  relayerClient,
}: SignTypedDataV4Params): Promise<string> => {
  const fromAddress: string = params[0];
  const typedDataParam: string | object = params[1];

  if (!fromAddress || !typedDataParam) {
    throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, `${method} requires an address and a typed data JSON`);
  }

  const { chainId } = await jsonRpcProvider.ready;
  const typedData = transformTypedData(typedDataParam, chainId);

  // ID-959: Submit raw typedData payload to Guardian for evaluation

  const relayerSignature = await relayerClient.imSignTypedData(fromAddress, typedData);
  const magicWeb3Provider = new Web3Provider(magicProvider);
  const signer = magicWeb3Provider.getSigner();

  return getSignedTypedData(typedData, relayerSignature, BigNumber.from(chainId), fromAddress, signer);
};
