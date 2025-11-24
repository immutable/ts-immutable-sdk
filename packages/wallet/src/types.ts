import { Environment, ModuleConfiguration } from '@imtbl/config';
import { Flow } from '@imtbl/metrics';
import { User } from '@imtbl/auth';
import { BigNumberish } from 'ethers';
import { JsonRpcError } from './zkEvm/JsonRpcError';

// Re-export auth types for convenience
export type {
  User, UserProfile, UserImx, UserZkEvm, DirectLoginMethod,
} from '@imtbl/auth';
export { isUserImx, isUserZkEvm } from '@imtbl/auth';
export type { RollupType } from '@imtbl/auth';

export enum PassportEvents {
  LOGGED_OUT = 'loggedOut',
  LOGGED_IN = 'loggedIn',
  ACCOUNTS_REQUESTED = 'accountsRequested',
}

export type AccountsRequestedEvent = {
  environment: Environment;
  sendTransaction: (params: Array<any>, flow: Flow) => Promise<string>;
  walletAddress: string;
  passportClient: string;
  flow?: Flow;
};

export interface PassportEventMap extends Record<string, any> {
  [PassportEvents.LOGGED_OUT]: [];
  [PassportEvents.LOGGED_IN]: [User];
  [PassportEvents.ACCOUNTS_REQUESTED]: [AccountsRequestedEvent];
}

// zkEVM/Wallet specific types
export type Provider = {
  request: (request: RequestArguments) => Promise<any>;
  on: (event: string, listener: (...args: any[]) => void) => void;
  removeListener: (event: string, listener: (...args: any[]) => void) => void;
  isPassport: boolean;
};

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

export interface MetaTransaction {
  to: string;
  value?: BigNumberish | null;
  data?: string | null;
  nonce?: BigNumberish;
  gasLimit?: BigNumberish;
  delegateCall?: boolean;
  revertOnError?: boolean;
}

export interface MetaTransactionNormalised {
  delegateCall: boolean;
  revertOnError: boolean;
  gasLimit: BigNumberish;
  target: string;
  value: BigNumberish;
  data: string;
}

export enum ProviderEvent {
  ACCOUNTS_CHANGED = 'accountsChanged',
}

export type AccountsChangedEvent = Array<string>;

export interface ProviderEventMap extends Record<string, any> {
  [ProviderEvent.ACCOUNTS_CHANGED]: [AccountsChangedEvent];
}

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

// Wallet configuration types
export interface WalletOverrides {
  passportDomain: string;
  zkEvmRpcUrl: string;
  relayerUrl: string;
  indexerMrBasePath: string;
}

export interface WalletModuleConfiguration extends ModuleConfiguration<WalletOverrides> {
  /**
   * Optional referrer URL to be sent with JSON-RPC requests.
   */
  jsonRpcReferrer?: string;

  /**
   * If true, forces SCW deployment before allowing message signature.
   */
  forceScwDeployBeforeMessageSignature?: boolean;

  /**
   * This flag indicates that Wallet is being used in a cross-sdk bridge scenario.
   */
  crossSdkBridgeEnabled?: boolean;
}
