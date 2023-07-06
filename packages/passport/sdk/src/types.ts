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
}

export interface PassportModuleConfiguration
  extends ModuleConfiguration<PassportOverrides>,
  OidcConfiguration {}

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type UserImx = WithRequired<User, 'imx'>;
export type UserZkEvm = WithRequired<User, 'zkEvm'>;
