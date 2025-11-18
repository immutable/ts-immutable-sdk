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
  DeviceTokenResponse,
  OidcConfiguration,
  AuthModuleConfiguration,
  PopupOverlayOptions,
  PassportMetadata,
  IdTokenPayload,
  PKCEData,
} from './types';
export { isUserZkEvm, isUserImx, RollupType, MarketingConsentStatus } from './types';

// Export errors
export { AuthError, AuthErrorType } from './errors';

// Export confirmation and overlay classes
export { default as ConfirmationScreen } from './confirmation/confirmation';
export { default as EmbeddedLoginPrompt } from './confirmation/embeddedLoginPrompt';
export { default as ConfirmationOverlay } from './overlay/confirmationOverlay';

