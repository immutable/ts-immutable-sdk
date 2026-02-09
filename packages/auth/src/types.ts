/**
 * Direct login method identifier
 * Known providers: 'google', 'apple', 'facebook'
 * Additional providers may be supported server-side
 */
export type DirectLoginMethod = string;

export type UserProfile = {
  email?: string;
  nickname?: string;
  sub: string;
  username?: string;
};

export enum RollupType {
  ZKEVM = 'zkEvm',
}

export type User = {
  idToken?: string;
  accessToken: string;
  refreshToken?: string;
  profile: UserProfile;
  expired?: boolean;
  [RollupType.ZKEVM]?: {
    ethAddress: string;
    userAdminAddress: string;
  };
};

export type PassportMetadata = {
  zkevm_eth_address?: string;
  zkevm_user_admin_address?: string;
};

export interface OidcConfiguration {
  clientId: string;
  logoutRedirectUri?: string;
  logoutMode?: 'redirect' | 'silent';
  redirectUri: string;
  popupRedirectUri?: string;
  scope?: string;
  audience?: string;
}

export interface PopupOverlayOptions {
  disableGenericPopupOverlay?: boolean;
  disableBlockedPopupOverlay?: boolean;
  disableHeadlessLoginPromptOverlay?: boolean;
}

export interface AuthModuleConfiguration extends OidcConfiguration {
  /**
   * Authentication domain (e.g., 'https://auth.immutable.com')
   */
  authenticationDomain?: string;

  /**
   * Passport domain for confirmation screens (e.g., 'https://passport.immutable.com')
   */
  passportDomain?: string;

  /**
   * This flag indicates that Auth is being used in a cross-sdk bridge scenario
   * and not directly on the web.
   */
  crossSdkBridgeEnabled?: boolean;

  /**
   * Options for customizing popup overlays
   */
  popupOverlayOptions?: PopupOverlayOptions;
}

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type UserZkEvm = WithRequired<User, RollupType.ZKEVM>;

export const isUserZkEvm = (user: User): user is UserZkEvm => !!user[RollupType.ZKEVM];

export type DeviceTokenResponse = {
  access_token: string;
  refresh_token?: string;
  id_token: string;
  token_type: string;
  expires_in: number;
};

export type TokenPayload = {
  exp?: number;
};

export type IdTokenPayload = {
  passport?: PassportMetadata;
  username?: string;
  email: string;
  nickname: string;
  aud: string;
  sub: string;
  exp: number;
  iss: string;
  iat: number;
};

export type PKCEData = {
  state: string;
  verifier: string;
};

export enum MarketingConsentStatus {
  OptedIn = 'opted_in',
  Unsubscribed = 'unsubscribed',
  Subscribed = 'subscribed',
}

export type DirectLoginOptions = {
  marketingConsentStatus: MarketingConsentStatus;
} & (
  | { directLoginMethod: 'email'; email: string }
  | { directLoginMethod: Exclude<DirectLoginMethod, 'email'>; email?: never }
);

/**
 * Extended login options with caching and silent login support
 */
export type LoginOptions = {
  /** If true, attempts to use cached session without user interaction */
  useCachedSession?: boolean;
  /** If true, attempts silent authentication (force token refresh) */
  useSilentLogin?: boolean;
  /** If true, uses redirect flow instead of popup flow */
  useRedirectFlow?: boolean;
  /** Direct login options (social provider, email, etc.) */
  directLoginOptions?: DirectLoginOptions;
};

/**
 * Authentication events emitted by the Auth class
 */
export enum AuthEvents {
  LOGGED_OUT = 'loggedOut',
  LOGGED_IN = 'loggedIn',
  /**
   * Emitted when tokens are refreshed via signinSilent().
   * This is critical for refresh token rotation - when client-side refresh happens,
   * the new tokens must be synced to server-side session to prevent race conditions.
   */
  TOKEN_REFRESHED = 'tokenRefreshed',
  /**
   * Emitted when the user is removed from local storage due to a permanent auth error.
   * Only emitted for errors where the refresh token is truly invalid:
   * - invalid_grant: refresh token expired, revoked, or already used
   * - login_required: user must re-authenticate
   * - consent_required / interaction_required: user must interact with auth server
   *
   * NOT emitted for transient errors (network, timeout, server errors) - user stays logged in.
   * Consumers should sync this state by clearing their session (e.g., NextAuth signOut).
   */
  USER_REMOVED = 'userRemoved',
}

/**
 * Error reason for USER_REMOVED event.
 * Note: Network/timeout errors do NOT emit USER_REMOVED (user stays logged in),
 * so 'network_error' is not a valid reason.
 */
export type UserRemovedReason =
  // OAuth permanent errors (invalid_grant, login_required, etc.)
  | 'refresh_token_invalid'
  // Unknown non-OAuth errors
  | 'refresh_failed'
  // Fallback for truly unknown error types
  | 'unknown';

/**
 * Event map for typed event emitter
 */
export interface AuthEventMap extends Record<string, any> {
  [AuthEvents.LOGGED_OUT]: [];
  [AuthEvents.LOGGED_IN]: [User];
  [AuthEvents.TOKEN_REFRESHED]: [User];
  [AuthEvents.USER_REMOVED]: [{ reason: UserRemovedReason; error?: string }];
}
