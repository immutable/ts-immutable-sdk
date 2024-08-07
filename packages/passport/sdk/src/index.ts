export { PassportError } from './errors/passportError';
export { Passport } from './Passport';
export {
  RequestArguments,
  JsonRpcRequestPayload,
  JsonRpcResponsePayload,
  JsonRpcRequestCallback,
  Provider,
  ProviderEvent,
  AccountsChangedEvent,
  TypedDataPayload,
} from './zkEvm/types';
export {
  JsonRpcError,
  ProviderErrorCode,
  RpcErrorCode,
} from './zkEvm/JsonRpcError';
export {
  LinkWalletParams,
  LinkedWallet,
  UserProfile,
  PassportOverrides,
  PassportModuleConfiguration,
  DeviceConnectResponse,
  DeviceTokenResponse,
} from './types';

export {
  PassportProvider,
  useAccessToken,
  useIdToken,
  useLinkedAddresses,
  usePassport,
  useUserInfo,
} from './react/PassportContext';
