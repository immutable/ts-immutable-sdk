import { Environment, ModuleConfiguration } from '@imtbl/config';
import { EthSigner, IMXClient, StarkSigner } from '@imtbl/x-client';
import { ImxApiClients } from '@imtbl/generated-clients';
import { Flow } from '@imtbl/metrics';

export enum PassportEvents {
  LOGGED_OUT = 'loggedOut',
  LOGGED_IN = 'loggedIn',
  ACCOUNTS_REQUESTED = 'accountsRequested',
}

export type AccountsRequestedEvent = {
  environment: Environment;
  sendTransaction: (params: Array<any>, flow: Flow) => Promise<string>;
  walletAddress: string;
  passportClient: string;
  flow?: Flow;
};

export interface PassportEventMap extends Record<string, any> {
  [PassportEvents.LOGGED_OUT]: [];
  [PassportEvents.LOGGED_IN]: [User];
  [PassportEvents.ACCOUNTS_REQUESTED]: [AccountsRequestedEvent];
}

export type UserProfile = {
  email?: string;
  nickname?: string;
  sub: string;
};

export type User = {
  idToken?: string;
  accessToken: string;
  refreshToken?: string;
  profile: UserProfile;
  expired?: boolean;
  imx?: {
    ethAddress: string;
    starkAddress: string;
    userAdminAddress: string;
  };
  zkEvm?: {
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
  scope?: string;
  audience?: string;
}

export interface PassportOverrides {
  authenticationDomain: string;
  magicPublishableApiKey: string;
  magicProviderId: string;
  passportDomain: string;
  imxPublicApiDomain: string;
  immutableXClient: IMXClient;
  zkEvmRpcUrl: string;
  relayerUrl: string;
  indexerMrBasePath: string;
  orderBookMrBasePath: string;
  passportMrBasePath: string;
  imxApiClients?: ImxApiClients; // needs to be optional because ImxApiClients is not exposed publicly
}

export interface PopupOverlayOptions {
  disableGenericPopupOverlay?: boolean;
  disableBlockedPopupOverlay?: boolean;
}

export interface PassportModuleConfiguration
  extends ModuleConfiguration<PassportOverrides>,
  OidcConfiguration {
  /**
   * This flag indicates that Passport is being used in a cross-sdk bridge scenario
   * and not directly on the web.
   */
  crossSdkBridgeEnabled?: boolean;
  /**
   * Options for disabling the Passport popup overlays.
   */
  popupOverlayOptions?: PopupOverlayOptions;
}

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type UserImx = WithRequired<User, 'imx'>;
export type UserZkEvm = WithRequired<User, 'zkEvm'>;

export const isUserZkEvm = (user: User): user is UserZkEvm => !!user.zkEvm;
export const isUserImx = (user: User): user is UserImx => !!user.imx;

// Device code auth

export type DeviceConnectResponse = {
  code: string;
  deviceCode: string;
  url: string;
  interval: number;
};

export type DeviceCodeResponse = {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
  verification_uri_complete: string;
};

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

export type DeviceErrorResponse = {
  error: string;
  error_description: string;
};

export type PKCEData = {
  state: string;
  verifier: string;
};

export type IMXSigners = {
  starkSigner: StarkSigner;
  ethSigner: EthSigner;
};

export type LinkWalletV2Response = {
  address: string;
  type: string;
  created_at: string;
  updated_at: string;
  name?: string;
  clientName: string;
};
