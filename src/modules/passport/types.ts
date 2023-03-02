
export type Networks = 'mainnet' | 'goerli';

export type UserProfile = {
  email?: string;
  nickname?: string;
  sub: string;
};

export type User = {
  idToken?: string;
  accessToken?: string;
  refreshToken?: string;
  profile?: UserProfile,
};