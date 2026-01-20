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

/**
 * Supported EVM chains for user registration
 * Matches EvmChain from @imtbl/wallet but defined here to avoid circular dependency
 */
export enum EvmChain {
  ZKEVM = 'zkevm',
  ARBITRUM_ONE = 'arbitrum_one',
}

export type ChainAddress = {
  ethAddress: string;
  userAdminAddress: string;
};

export type User = {
  idToken?: string;
  accessToken: string;
  refreshToken?: string;
  profile: UserProfile;
  expired?: boolean;
  [RollupType.ZKEVM]?: ChainAddress;
} & {
  [K in Exclude<EvmChain, EvmChain.ZKEVM>]?: ChainAddress;
};

export type PassportChainMetadata = {
  eth_address: string;
  user_admin_address: string;
};

/**
 * Passport metadata
 * - zkEVM: flat fields (zkevm_eth_address, zkevm_user_admin_address)
 * - Other chains: nested objects (arbitrum_one: { eth_address, user_admin_address })
 */
export type PassportMetadata = {
  zkevm_eth_address?: string;
  zkevm_user_admin_address?: string;
} & Partial<Record<Exclude<EvmChain, EvmChain.ZKEVM>, PassportChainMetadata>>;

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
}

/**
 * Event map for typed event emitter
 */
export interface AuthEventMap extends Record<string, any> {
  [AuthEvents.LOGGED_OUT]: [];
  [AuthEvents.LOGGED_IN]: [User];
}
