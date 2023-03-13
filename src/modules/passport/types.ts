
export interface PassportConfigurationArguments {
  clientId: string;
  redirectUri: string;
  logoutRedirectUri: string;
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
  etherKey?: string;
};

export type PassportMetadata = {
  ether_key: string;
  stark_key: string;
  user_admin_key: string;
}

export enum Networks {
  PRODUCTION = 'mainnet',
  SANDBOX = 'goerli',
}

export interface EnvironmentConfiguration {
  network: Networks;
  authenticationDomain: string;
  magicPublishableApiKey: string;
  magicProviderId: string;
}

export interface OidcConfiguration {
  clientId: string;
  logoutRedirectUri: string;
  redirectUri: string;
}
