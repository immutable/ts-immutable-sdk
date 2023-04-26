import { ModuleConfiguration } from '@imtbl/config';
import { StarkExOverrides } from '@imtbl/starkex';

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
  etherKey?: string;
};

export type PassportMetadata = {
  ether_key: string;
  stark_key: string;
  user_admin_key: string;
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
  imxApiBasePath: string;
  starkExOverrides?: StarkExOverrides;
}

export interface PassportModuleConfiguration
  extends ModuleConfiguration<PassportOverrides>,
    OidcConfiguration {}

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type UserWithEtherKey = WithRequired<User, 'etherKey'>;
