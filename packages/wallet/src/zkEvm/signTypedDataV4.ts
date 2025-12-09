import { Flow } from '@imtbl/metrics';
import { PublicClient } from 'viem';
import GuardianClient from '../guardian';
import { signAndPackTypedData, Signer } from './walletHelpers';
import { TypedDataPayload } from './types';
import { JsonRpcError, RpcErrorCode } from './JsonRpcError';
import { RelayerClient } from './relayerClient';

export type SignTypedDataV4Params = {
  ethSigner: Signer;
  rpcProvider: PublicClient;
  relayerClient: RelayerClient;
  method: string;
  params: Array<any>;
  guardianClient: GuardianClient;
  flow: Flow;
};

const REQUIRED_TYPED_DATA_PROPERTIES = ['types', 'domain', 'primaryType', 'message'];
const isValidTypedDataPayload = (typedData: object): typedData is TypedDataPayload => (
  REQUIRED_TYPED_DATA_PROPERTIES.every((key) => key in typedData)
);

const transformTypedData = (typedData: string | object, chainId: bigint): TypedDataPayload => {
  let transformedTypedData: object | TypedDataPayload;

  if (typeof typedData === 'string') {
    try {
      transformedTypedData = JSON.parse(typedData);
    } catch (err: any) {
      throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, `Failed to parse typed data JSON: ${err}`);
    }
  } else if (typeof typedData === 'object') {
    transformedTypedData = typedData;
  } else {
    throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, `Invalid typed data argument: ${typedData}`);
  }

  if (!isValidTypedDataPayload(transformedTypedData)) {
    throw new JsonRpcError(
      RpcErrorCode.INVALID_PARAMS,
      // eslint-disable-next-line max-len
      `Invalid typed data argument. The following properties are required: ${REQUIRED_TYPED_DATA_PROPERTIES.join(', ')}`,
    );
  }

  const providedChainId = transformedTypedData.domain?.chainId;

  if (providedChainId) {
    // domain.chainId (if defined) can be a number, string, or hex value, but the relayer & guardian only accept a number.
    if (typeof providedChainId === 'string') {
      if (providedChainId.startsWith('0x')) {
        transformedTypedData.domain.chainId = parseInt(providedChainId, 16).toString();
      } else {
        transformedTypedData.domain.chainId = parseInt(providedChainId, 10).toString();
      }
    }

    if (BigInt(transformedTypedData.domain.chainId ?? 0) !== chainId) {
      throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, `Invalid chainId, expected ${chainId}`);
    }
  }

  return transformedTypedData;
};

export const signTypedDataV4 = async ({
  params,
  method,
  ethSigner,
  rpcProvider,
  relayerClient,
  guardianClient,
  flow,
}: SignTypedDataV4Params): Promise<string> => {
  const fromAddress: string = params[0];
  const typedDataParam: string | object = params[1];

  if (!fromAddress || !typedDataParam) {
    throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, `${method} requires an address and a typed data JSON`);
  }

  const chainId = await rpcProvider.getChainId();
  const chainIdBigInt = BigInt(chainId);
  const typedData = transformTypedData(typedDataParam, chainIdBigInt);
  flow.addEvent('endDetectNetwork');

  await guardianClient.evaluateEIP712Message({ chainID: String(chainId), payload: typedData });
  flow.addEvent('endValidateMessage');

  const relayerSignature = await relayerClient.imSignTypedData(fromAddress, typedData);
  flow.addEvent('endRelayerSignTypedData');

  const signature = await signAndPackTypedData(
    typedData,
    relayerSignature,
    chainIdBigInt,
    fromAddress,
    ethSigner,
  );
  flow.addEvent('getSignedTypedData');

  return signature;
};
