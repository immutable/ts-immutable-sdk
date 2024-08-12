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
  UserProfile,
  PassportOverrides,
  PassportModuleConfiguration,
  DeviceConnectResponse,
  DeviceTokenResponse,
} from './types';

export {
  ReactProvider,
  useAccessToken,
  useIdToken,
  useLinkedAddresses,
  usePassport,
  useUserInfo,
  useAccounts,
  usePassportProvider,
  useProfile,
} from './react/PassportContext';
