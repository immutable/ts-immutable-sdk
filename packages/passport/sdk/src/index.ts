export { PassportError } from './errors/passportError';
export { Passport } from './Passport';

// Re-export wallet types for backward compatibility
export {
  ProviderEvent,
  JsonRpcError,
  ProviderErrorCode,
  RpcErrorCode,
} from '@imtbl/wallet';
export type {
  RequestArguments,
  Provider,
  AccountsChangedEvent,
  TypedDataPayload,
  EIP6963ProviderInfo,
  EIP6963ProviderDetail,
} from '@imtbl/wallet';

// Re-export auth types
export type {
  User,
} from '@imtbl/auth';

// Export passport-specific types
export type {
  LinkWalletParams,
  LinkedWallet,
  ConnectEvmArguments,
  LoginArguments,
  UserProfile,
  PassportOverrides,
  PassportModuleConfiguration,
  DeviceTokenResponse,
  DirectLoginOptions,
  DirectLoginMethod,
  ZkEvmProvider,
} from './types';
export {
  MarketingConsentStatus,
  EvmChain,
} from './types';
