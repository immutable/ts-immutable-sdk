import { JsonRpcError } from './JsonRpcError';
import type { Provider as ProviderType } from '../types';

export enum RelayerTransactionStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  SUCCESSFUL = 'SUCCESSFUL',
  REVERTED = 'REVERTED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface RelayerTransaction {
  status: RelayerTransactionStatus;
  chainId: string;
  relayerId: string;
  hash: string;
  statusMessage?: string;
}

export interface FeeOption {
  tokenPrice: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenAddress: string;
  recipientAddress: string;
}

export interface MetaTransaction {
  to: string;
  value?: bigint | null;
  data?: string | null;
  nonce?: bigint;
  gasLimit?: bigint;
  delegateCall?: boolean;
  revertOnError?: boolean;
}

export interface MetaTransactionNormalised {
  delegateCall: boolean;
  revertOnError: boolean;
  gasLimit: bigint;
  target: string;
  value: bigint;
  data: string;
}

// https://eips.ethereum.org/EIPS/eip-712
export interface TypedDataPayload {
  types: {
    EIP712Domain: Array<{ name: string; type: string }>;
    [key: string]: Array<{ name: string; type: string }>;
  };
  domain: {
    name?: string;
    version?: string;
    chainId?: number | string;
    verifyingContract?: string;
    salt?: string;
  } | {
    name?: string;
    version?: string;
    chainId?: number;
    verifyingContract?: string;
    salt?: string;
  };
  primaryType: string;
  message: Record<string, any>;
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
  (
    err: JsonRpcError | null,
    result?: JsonRpcResponsePayload | (JsonRpcResponsePayload | null)[] | null
  ): void;
}

export interface JsonRpcResponsePayload {
  result?: Array<any> | null;
  error?: JsonRpcError | null;
  jsonrpc?: string;
  id?: string | number;
}

export type { Provider } from '../types';

type Provider = ProviderType;

export enum ProviderEvent {
  ACCOUNTS_CHANGED = 'accountsChanged',
}

export type AccountsChangedEvent = Array<string>;

export interface ProviderEventMap extends Record<string, any> {
  [ProviderEvent.ACCOUNTS_CHANGED]: [AccountsChangedEvent];
}

/**
 * Event detail from the `eip6963:announceProvider` event.
 */
export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: Provider;
}

/**
 * Metadata of the EIP-1193 Provider.
 */
export interface EIP6963ProviderInfo {
  icon: `data:image/${string}`; // RFC-2397
  name: string;
  rdns: string;
  uuid: string;
}

/**
 * Event type to announce an EIP-1193 Provider.
 */
export interface EIP6963AnnounceProviderEvent
  extends CustomEvent<EIP6963ProviderDetail> {
  type: 'eip6963:announceProvider';
}
