import { BigNumberish, BytesLike } from 'ethers';
import { JsonRpcError } from './JsonRpcError';

export interface RelayerTransaction {
  status: 'PENDING' | 'SUBMITTED' | 'SUCCESSFUL' | 'ERROR';
  chainId: string;
  relayerId: string;
  hash: string;
}

export interface FeeOption {
  tokenPrice: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenAddress: string;
  recipientAddress: string;
}

export interface MetaTransaction {
  to: string
  value?: BigNumberish
  data?: BytesLike
  nonce?: BigNumberish
  gasLimit?: BigNumberish
  delegateCall?: boolean
  revertOnError?: boolean
}

export interface MetaTransactionNormalised {
  delegateCall: boolean
  revertOnError: boolean
  gasLimit: BigNumberish
  target: string
  value: BigNumberish
  data: BytesLike
}

export interface RequestArguments {
  method: string;
  params?: Array<any>;
}

export type JsonRpcRequestPayload = RequestArguments & {
  jsonrpc?: string;
  id?: string | number;
};

export interface JsonRpcRequestCallback {
  (err: JsonRpcError | null, result?: JsonRpcResponsePayload | (JsonRpcResponsePayload | null)[] | null): void;
}

export interface JsonRpcResponsePayload {
  result?: Array<any> | null;
  error?: JsonRpcError | null;
  jsonrpc?: string;
  id?: string | number;
}

export type Provider = {
  request: (request: RequestArguments) => Promise<any>
  sendAsync: (
    request: JsonRpcRequestPayload | JsonRpcRequestPayload[],
    callback: JsonRpcRequestCallback,
  ) => void
  send: (
    request: string | JsonRpcRequestPayload | JsonRpcRequestPayload[],
    callbackOrParams?: JsonRpcRequestCallback | Array<any>,
    callback?: JsonRpcRequestCallback,
  ) => void
};
