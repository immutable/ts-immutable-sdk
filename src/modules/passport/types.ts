
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
};
