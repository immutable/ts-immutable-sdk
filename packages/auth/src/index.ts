// Export Auth class (public API)
export { Auth } from './Auth';

// Export AuthManager for use by other packages
export { default as AuthManager } from './authManager';

// Export configuration
export { AuthConfiguration, type IAuthConfiguration } from './config';

// Export types
export type {
  User,
  UserProfile,
  UserImx,
  UserZkEvm,
  DirectLoginMethod,
  DirectLoginOptions,
  LoginOptions,
  DeviceTokenResponse,
  OidcConfiguration,
  AuthModuleConfiguration,
  PopupOverlayOptions,
  PassportMetadata,
  IdTokenPayload,
  PKCEData,
  AuthEventMap,
} from './types';
export {
  isUserZkEvm, isUserImx, RollupType, MarketingConsentStatus, AuthEvents,
} from './types';

// Export TypedEventEmitter
export { default as TypedEventEmitter } from './utils/typedEventEmitter';

// Export errors
export { PassportError, PassportErrorType, withPassportError } from './errors';
