import { Flow } from '@imtbl/metrics';
import {
  Auth, TypedEventEmitter, type AuthEventMap,
} from '@imtbl/auth';
import { BigNumberish } from 'ethers';
import { JsonRpcError } from './zkEvm/JsonRpcError';

// Re-export auth types for convenience
export type {
  User, UserProfile, UserImx, UserZkEvm, DirectLoginMethod, AuthEventMap,
} from '@imtbl/auth';
export { isUserImx, isUserZkEvm } from '@imtbl/auth';
export type { RollupType } from '@imtbl/auth';
export { AuthEvents } from '@imtbl/auth';

// Wallet-specific event (in addition to AuthEvents)
export enum WalletEvents {
  ACCOUNTS_REQUESTED = 'accountsRequested',
}

export type AccountsRequestedEvent = {
  sessionActivityApiUrl: string;
  sendTransaction: (params: Array<any>, flow: Flow) => Promise<string>;
  walletAddress: string;
  passportClient: string;
  flow?: Flow;
};

// PassportEventMap combines auth events and wallet-specific events
export interface PassportEventMap extends AuthEventMap {
  [WalletEvents.ACCOUNTS_REQUESTED]: [AccountsRequestedEvent];
}

// Re-export zkEVM Provider type for public API
export type { Provider } from './zkEvm/types';

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

// Re-export EIP-6963 types from zkEvm for public API
export type {
  EIP6963ProviderDetail,
  EIP6963ProviderInfo,
  EIP6963AnnounceProviderEvent,
} from './zkEvm/types';

/**
 * Configuration for a single blockchain network
 */
export interface ChainConfig {
  /** Chain ID (e.g., 13371 for mainnet, 13473 for testnet) */
  chainId: number;

  /** RPC URL for the chain */
  rpcUrl: string;

  /** Relayer URL for transaction submission */
  relayerUrl: string;

  /** API URL for Passport APIs (guardian, user registration) */
  apiUrl: string;

  /** Chain name (e.g., 'Immutable zkEVM') */
  name: string;

  /** Passport domain (optional, defaults based on apiUrl) */
  passportDomain?: string;

  /**
   * Magic publishable API key (optional, for dev/custom environments)
   * If not provided, will use default based on chainId
   */
  magicPublishableApiKey?: string;

  /**
   * Magic provider ID (optional, for dev/custom environments)
   * If not provided, will use default based on chainId
   */
  magicProviderId?: string;

  /**
   * Magic TEE base path (optional, for dev/custom environments)
   * Defaults to 'https://tee.express.magiclabs.com'
   */
  magicTeeBasePath?: string;
}

/**
 * Popup overlay options for wallet UI
 */
export interface PopupOverlayOptions {
  /** Disable the generic popup overlay */
  disableGenericPopupOverlay?: boolean;

  /** Disable the blocked popup overlay */
  disableBlockedPopupOverlay?: boolean;
}

/**
 * Options for connecting a wallet via connectWallet()
 * High-level configuration that gets transformed into internal WalletConfiguration
 */
export interface ConnectWalletOptions {
  /** Auth instance */
  auth: Auth;

  /**
   * Chain configurations (supports multi-chain)
   * Defaults to [IMMUTABLE_ZKEVM_TESTNET_CHAIN, IMMUTABLE_ZKEVM_MAINNET_CHAIN] if not provided
   */
  chains?: ChainConfig[];

  /**
   * Initial chain ID (defaults to first chain in chains array)
   * Use IMMUTABLE_ZKEVM_MAINNET_CHAIN_ID or IMMUTABLE_ZKEVM_TESTNET_CHAIN_ID
   */
  initialChainId?: number;

  /** Optional popup overlay options */
  popupOverlayOptions?: PopupOverlayOptions;

  /** Announce provider via EIP-6963 (default: true) */
  announceProvider?: boolean;

  /** Enable cross-SDK bridge mode (default: false) */
  crossSdkBridgeEnabled?: boolean;

  /** Optional referrer URL to be sent with JSON-RPC requests */
  jsonRpcReferrer?: string;

  /** If true, forces SCW deployment before allowing message signature */
  forceScwDeployBeforeMessageSignature?: boolean;

  /**
   * @internal - Only used by Passport for internal event communication
   */
  passportEventEmitter?: TypedEventEmitter<PassportEventMap>;
}
