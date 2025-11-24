import { Environment, ModuleConfiguration } from '@imtbl/config';
import { Flow } from '@imtbl/metrics';
import { User } from '@imtbl/auth';

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

export type RequestArguments = {
  readonly method: string;
  readonly params?: any[];
};

export type JsonRpcRequestPayload = {
  id: number;
  jsonrpc: '2.0';
  method: string;
  params: any[];
};

export type JsonRpcResponsePayload = {
  id: number;
  jsonrpc: '2.0';
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
};

export type JsonRpcRequestCallback = (error: Error | null, result?: JsonRpcResponsePayload) => void;

export type TypedDataPayload = {
  types: Record<string, Array<{ name: string; type: string }>>;
  primaryType: string;
  domain: {
    name?: string;
    version?: string;
    chainId?: number;
    verifyingContract?: string;
  };
  message: Record<string, any>;
};

export type MetaTransaction = {
  to: string;
  data: string;
  value?: string;
};

export type MetaTransactionNormalised = {
  to: string;
  data: string;
  value: string;
};

export enum ProviderEvent {
  AccountsChanged = 'accountsChanged',
}

export type AccountsChangedEvent = {
  accounts: string[];
};

export type FeeOption = {
  tokenPrice: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenAddress: string;
  recipientAddress: string;
};

export type RelayerTransaction = {
  id: string;
  chainId: number;
  walletAddress: string;
  status: RelayerTransactionStatus;
  sponsoredTransactionHash?: string;
  nonce?: number;
  submittedAt?: Date;
};

export enum RelayerTransactionStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}

export interface EIP6963ProviderInfo {
  icon: string;
  name: string;
  rdns: string;
  uuid: string;
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: Provider;
}

export type EIP6963AnnounceProviderEvent = CustomEvent<EIP6963ProviderDetail>;

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
