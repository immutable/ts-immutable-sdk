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
};

export enum RollupType {
  IMX = 'imx',
  ZKEVM = 'zkEvm',
}

export type User = {
  idToken?: string;
  accessToken: string;
  refreshToken?: string;
  profile: UserProfile;
  expired?: boolean;
  [RollupType.IMX]?: {
    ethAddress: string;
    starkAddress: string;
    userAdminAddress: string;
  };
  [RollupType.ZKEVM]?: {
    ethAddress: string;
    userAdminAddress: string;
  };
};

export type PassportMetadata = {
  imx_eth_address: string;
  imx_stark_address: string;
  imx_user_admin_address: string;
  zkevm_eth_address: string;
  zkevm_user_admin_address: string;
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

export type UserImx = WithRequired<User, RollupType.IMX>;
export type UserZkEvm = WithRequired<User, RollupType.ZKEVM>;

export const isUserZkEvm = (user: User): user is UserZkEvm => !!user[RollupType.ZKEVM];
export const isUserImx = (user: User): user is UserImx => !!user[RollupType.IMX];

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
}

export type DirectLoginOptions = {
  directLoginMethod: DirectLoginMethod;
  marketingConsentStatus?: MarketingConsentStatus;
  email?: string;
};

