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
  etherKey?: string;
  starkKey?: string;
  userAdminKey?: string;
  expired?: boolean;
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

export type UserWithEtherKey = WithRequired<User, 'etherKey'>;
