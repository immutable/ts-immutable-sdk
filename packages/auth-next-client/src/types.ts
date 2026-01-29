import type { DefaultSession } from 'next-auth';

// Re-export types from auth-next-server for convenience
export type {
  ImmutableAuthConfig,
  ImmutableTokenData,
  ZkEvmUser,
  ImmutableUser,
} from '@imtbl/auth-next-server';

/**
 * zkEVM wallet information
 */
export interface ZkEvmInfo {
  ethAddress: `0x${string}`;
  userAdminAddress: `0x${string}`;
}

/**
 * Auth.js v5 module augmentation to add Immutable-specific fields
 */
declare module 'next-auth' {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  interface Session extends DefaultSession {
    user: {
      sub: string;
      email?: string;
      nickname?: string;
    } & DefaultSession['user'];
    accessToken: string;
    refreshToken?: string;
    idToken?: string;
    accessTokenExpires: number;
    zkEvm?: ZkEvmInfo;
    error?: string;
  }

  interface User {
    id: string;
    sub: string;
    email?: string | null;
    nickname?: string;
    accessToken: string;
    refreshToken?: string;
    idToken?: string;
    accessTokenExpires: number;
    zkEvm?: ZkEvmInfo;
  }
}

/**
 * User profile from Immutable (local definition for client)
 */
export interface ImmutableUserClient {
  sub: string;
  email?: string;
  nickname?: string;
}

/**
 * Token data passed from client to Auth.js credentials provider
 */
export interface ImmutableTokenDataClient {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  accessTokenExpires: number;
  profile: {
    sub: string;
    email?: string;
    nickname?: string;
  };
  zkEvm?: ZkEvmInfo;
}
