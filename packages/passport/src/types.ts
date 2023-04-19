import { ModuleConfiguration } from '@imtbl/config';

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
}

export interface PassportModuleConfiguration
  extends ModuleConfiguration,
    OidcConfiguration {
  overrides?: PassportOverrides;
}

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type UserWithEtherKey = WithRequired<User, 'etherKey'>;
