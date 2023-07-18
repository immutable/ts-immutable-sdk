import { ModuleConfiguration } from '@imtbl/config';
import { ImmutableXClient } from '@imtbl/immutablex-client';

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

export enum Networks {
  PRODUCTION = 'mainnet',
  SANDBOX = 'goerli',
}

export interface OidcConfiguration {
  clientId: string;
  logoutRedirectUri: string;
  redirectUri: string;
  scope?: string;
  audience?: string;
}

export interface PassportOverrides {
  network: Networks;
  authenticationDomain: string;
  magicPublishableApiKey: string;
  magicProviderId: string;
  passportDomain: string;
  imxPublicApiDomain: string;
  immutableXClient: ImmutableXClient;
  zkEvmRpcUrl: string;
  zkEvmChainId: string;
  relayerUrl: string;
  indexerMrBasePath: string;
  orderBookMrBasePath: string;
  passportMrBasePath: string;
}

export interface PassportModuleConfiguration
  extends ModuleConfiguration<PassportOverrides>,
  OidcConfiguration {}

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type UserImx = WithRequired<User, 'imx'>;
export type UserZkEvm = WithRequired<User, 'zkEvm'>;

// Device code auth

export type DeviceConnectResponse = {
  code: string;
  deviceCode: string;
  url: string;
  interval: number;
};

export type DeviceCodeReponse = {
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
  passport: PassportMetadata;
  email: string;
  nickname: string;
  aud: string;
  sub: string;
};

export type DeviceErrorResponse = {
  error: string;
  error_description: string;
};
