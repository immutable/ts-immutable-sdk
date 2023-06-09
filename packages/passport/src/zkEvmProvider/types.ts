import { BigNumberish, BytesLike } from 'ethers';

export interface RelayerTransaction {
  status: 'PENDING' | 'SUBMITTED' | 'CONFIRMED' | 'ERROR';
  chainId: string;
  relayerId: string;
  hash: string;
}

export interface FeeOption {
  tokenPrice: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenAddress: string;
  recipient: string;
}

export interface Transaction {
  to: string
  value?: BigNumberish
  data?: BytesLike
  nonce?: BigNumberish
  gasLimit?: BigNumberish
  delegateCall?: boolean
  revertOnError?: boolean
}

export interface TransactionNormalised {
  delegateCall: boolean
  revertOnError: boolean
  gasLimit: BigNumberish
  target: string
  value: BigNumberish
  data: BytesLike
}

export enum RpcErrorCode {
  RPC_SERVER_ERROR = -32000,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
  UNAUTHORISED = -32604,
  PARSE_ERROR = -32700,
}

export interface JsonRpcError {
  message: string;
  code: RpcErrorCode;
  data?: any;
}

export interface RequestArguments<TParams = any> {
  method: string;
  params?: TParams;
}

export type JsonRpcRequestPayload = RequestArguments & {
  jsonrpc: string;
  id: string | number | null;
};

export interface JsonRpcRequestCallback {
  (err: JsonRpcError | null, result?: JsonRpcResponsePayload | null): void;
}
export interface JsonRpcResponsePayload<ResultType = any> {
  jsonrpc: string;
  id: string | number | null;
  result?: ResultType | null;
  error?: JsonRpcError | null;
}
