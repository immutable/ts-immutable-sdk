export { PassportError } from './errors/passportError';
export { Passport } from './Passport';
export {
  ProviderEvent,
} from './zkEvm/types';
export type {
  RequestArguments,
  JsonRpcRequestPayload,
  JsonRpcResponsePayload,
  JsonRpcRequestCallback,
  Provider, AccountsChangedEvent,
  TypedDataPayload,
} from './zkEvm/types';
export {
  JsonRpcError,
  ProviderErrorCode,
  RpcErrorCode,
} from './zkEvm/JsonRpcError';
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
  User,
  UserImx,
  UserZkEvm,
  UserArbOne,
} from './types';
export {
  MarketingConsentStatus,
  PassportEvents,
  RollupType,
  EvmChain,
  isUserImx,
  isUserZkEvm,
  isUserArbOne,
} from './types';
