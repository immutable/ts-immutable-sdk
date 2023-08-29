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
import GuardianClient from '../guardian/guardian';

export type SignTypedDataV4Params = {
  magicProvider: ExternalProvider;
  jsonRpcProvider: JsonRpcProvider;
  guardianClient: GuardianClient;
  relayerClient: RelayerClient;
  user: UserZkEvm;
  params: Array<any>;
};

export const signTypedDataV4 = async ({
  params,
  magicProvider,
  jsonRpcProvider,
  relayerClient,
}: SignTypedDataV4Params): Promise<string> => {
  const fromAddress: string = params[0];
  const typedData: TypedDataPayload = params[1];

  if (!fromAddress || !typedData) {
    throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, 'eth_signTypedData requires an address and a typed data object');
  }

  // ID-959: Submit raw typedData payload to Guardian for evaluation

  const relayerSignature = await relayerClient.imSignTypedData(fromAddress, typedData);

  const { chainId } = await jsonRpcProvider.ready;
  const chainIdBigNumber = BigNumber.from(chainId);
  const magicWeb3Provider = new Web3Provider(magicProvider);
  const signer = magicWeb3Provider.getSigner();

  return getSignedTypedData(typedData, relayerSignature, chainIdBigNumber, fromAddress, signer);
};
