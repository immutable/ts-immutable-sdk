// Export Auth class (public API)
export { Auth } from './Auth';

// Export configuration
export { AuthConfiguration, type IAuthConfiguration } from './config';

// Export types
export type {
  User,
  UserProfile,
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
  UserRemovedReason,
} from './types';
export {
  isUserZkEvm, RollupType, MarketingConsentStatus, AuthEvents,
} from './types';

// Export TypedEventEmitter
export { default as TypedEventEmitter } from './utils/typedEventEmitter';

// Export errors
export {
  PassportError, PassportErrorType, withPassportError, isAPIError,
} from './errors';

export { decodeJwtPayload } from './utils/jwt';

// ============================================================================
// Standalone Login Functions (stateless, for use with NextAuth or similar)
// ============================================================================

export {
  loginWithPopup,
  loginWithEmbedded,
  loginWithRedirect,
  handleLoginCallback,
  type LoginConfig,
  type TokenResponse,
  type StandaloneLoginOptions,
} from './login/standalone';
